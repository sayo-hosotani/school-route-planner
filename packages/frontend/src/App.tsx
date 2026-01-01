import { useState } from 'react';
import { MapContainer, TileLayer, ScaleControl, AttributionControl, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import CoordinateDisplay from './components/CoordinateDisplay';
import RouteLine from './components/RouteLine';
import PointMarker from './components/PointMarker';
import FitBounds from './components/FitBounds';
import Sidebar from './components/Sidebar';
import PointEditModal from './components/PointEditModal';
import MapClickHandler from './components/MapClickHandler';
import MessageDisplay from './components/MessageDisplay';
import MapCenter from './components/MapCenter';
import { samplePoints, sampleRouteLine } from './data/sample-route';
import { saveRoute, loadRoute, generateRoute } from './api/route-api';
import type { Point } from './types/point';

const App = () => {
	const [mode, setMode] = useState<'view' | 'edit'>('view');
	const [points, setPoints] = useState<Point[]>(samplePoints);
	const [routeLine, setRouteLine] = useState<[number, number][]>(sampleRouteLine);
	const [message, setMessage] = useState<string>('');
	const [editingPoint, setEditingPoint] = useState<Point | null>(null);
	const [highlightedPointId, setHighlightedPointId] = useState<string | null>(null);
	const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

	// ポイント種別の自動判定
	const determinePointType = (index: number, totalPoints: number): Point['type'] => {
		if (index === 0) return 'start';
		if (index === totalPoints - 1) return 'goal';
		return 'waypoint';
	};

	// ポイントを直線で接続して経路ラインを更新（フォールバック用）
	const updateRouteLineStraight = (pointsList: Point[]) => {
		if (pointsList.length < 2) {
			// ポイントが2つ未満の場合は経路を描画しない
			setRouteLine([]);
			return;
		}

		// ポイントをorder順にソートして座標を抽出
		const sortedPoints = [...pointsList].sort((a, b) => a.order - b.order);
		const newRouteLine: [number, number][] = sortedPoints.map((p) => [p.lat, p.lng]);
		setRouteLine(newRouteLine);
	};

	// Valhalla APIで経路を生成
	const updateRouteLine = async (pointsList: Point[]) => {
		if (pointsList.length < 2) {
			// ポイントが2つ未満の場合は経路を描画しない
			setRouteLine([]);
			return;
		}

		// スタートとゴールが存在するかチェック
		const hasStart = pointsList.some((p) => p.type === 'start');
		const hasGoal = pointsList.some((p) => p.type === 'goal');

		if (!hasStart || !hasGoal) {
			// スタートまたはゴールがない場合は直線接続
			updateRouteLineStraight(pointsList);
			return;
		}

		try {
			// Valhalla APIで経路を生成
			const apiPoints = pointsList.map((p) => ({
				lat: p.lat,
				lng: p.lng,
				order: p.order,
			}));

			console.log('Generating route with points:', apiPoints);
			const response = await generateRoute(apiPoints);
			console.log('Route API response:', response);

			if (response.success && response.data) {
				console.log('Coordinates count:', response.data.coordinates.length);
				console.log('First 3 coordinates:', response.data.coordinates.slice(0, 3));

				// GeoJSON形式の座標を[lat, lng]形式に変換
				const coordinates: [number, number][] = response.data.coordinates.map(
					([lng, lat]) => [lat, lng],
				);
				console.log('Converted coordinates (first 3):', coordinates.slice(0, 3));
				setRouteLine(coordinates);
			} else {
				console.warn('Route generation failed, using straight line');
				// エラー時は直線接続
				updateRouteLineStraight(pointsList);
			}
		} catch (error) {
			console.error('Failed to generate route:', error);
			// エラー時は直線接続
			updateRouteLineStraight(pointsList);
		}
	};

	// 地図クリックでポイント追加
	const handleMapClick = (lat: number, lng: number) => {
		const newPoint: Point = {
			id: `point-${Date.now()}`,
			lat,
			lng,
			type: 'waypoint', // 仮の種別、後で再計算
			order: points.length,
			comment: '',
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		let newPoints: Point[];

		if (points.length === 0) {
			// 1番目: スタート
			newPoints = [{ ...newPoint, type: 'start', order: 0 }];
		} else if (points.length === 1) {
			// 2番目: ゴール（最後に追加）
			newPoints = [...points, { ...newPoint, type: 'goal', order: 1 }];
		} else {
			// 3番目以降: 中継地点（ゴールの直前に挿入）
			// 既存のゴールを探す
			const goalIndex = points.findIndex((p) => p.type === 'goal');
			if (goalIndex !== -1) {
				// ゴールの直前に挿入
				const updatedPoints = [...points];
				updatedPoints.splice(goalIndex, 0, { ...newPoint, type: 'waypoint', order: goalIndex });
				// order を再計算
				newPoints = updatedPoints.map((p, index) => ({ ...p, order: index }));
			} else {
				// ゴールが見つからない場合（通常はあり得ないが、念のため最後に追加）
				newPoints = [...points, { ...newPoint, type: 'waypoint', order: points.length }];
			}
		}

		setPoints(newPoints);

		// Valhalla APIで経路を生成
		updateRouteLine(newPoints);

		setMessage('ポイントを追加しました');
		setTimeout(() => setMessage(''), 3000);
	};

	// ポイントのドラッグ移動
	const handlePointDragEnd = (pointId: string, lat: number, lng: number) => {
		const updatedPoints = points.map((p) =>
			p.id === pointId ? { ...p, lat, lng, updated_at: new Date().toISOString() } : p,
		);
		setPoints(updatedPoints);

		// Valhalla APIで経路を生成
		updateRouteLine(updatedPoints);

		setMessage('ポイントを移動しました');
		setTimeout(() => setMessage(''), 3000);
	};

	// ポイント編集モーダルを開く
	const handleEditPoint = (pointId: string) => {
		const point = points.find((p) => p.id === pointId);
		if (point) {
			setEditingPoint(point);
		}
	};

	// ポイント編集を保存
	const handleSavePoint = (pointId: string, type: Point['type'], comment: string) => {
		setPoints((prevPoints) =>
			prevPoints.map((p) =>
				p.id === pointId ? { ...p, type, comment, updated_at: new Date().toISOString() } : p,
			),
		);
		setMessage('ポイントを更新しました');
		setTimeout(() => setMessage(''), 3000);
	};

	// サイドバーからのコメント更新
	const handleUpdateComment = (pointId: string, comment: string) => {
		setPoints((prevPoints) =>
			prevPoints.map((p) => (p.id === pointId ? { ...p, comment, updated_at: new Date().toISOString() } : p)),
		);
		setMessage('コメントを更新しました');
		setTimeout(() => setMessage(''), 3000);
	};

	// ポイントクリック時の処理（地図中央に移動＋ハイライト）
	const handlePointClick = (pointId: string) => {
		const point = points.find((p) => p.id === pointId);
		if (point) {
			setMapCenter([point.lat, point.lng]);
			setHighlightedPointId(pointId);
			// 3秒後にハイライト解除
			setTimeout(() => {
				setHighlightedPointId(null);
				setMapCenter(null);
			}, 3000);
		}
	};

	// ポイント削除
	const handleDeletePoint = (pointId: string) => {
		const newPoints = points.filter((p) => p.id !== pointId);
		// ポイント削除後、種別を再計算
		const updatedPoints = newPoints.map((p, index) => ({
			...p,
			type: determinePointType(index, newPoints.length),
			order: index,
		}));
		setPoints(updatedPoints);

		// Valhalla APIで経路を生成
		updateRouteLine(updatedPoints);

		setMessage('ポイントを削除しました');
		setTimeout(() => setMessage(''), 3000);
	};

	// 全ポイントをクリア
	const handleClearPoints = () => {
		if (window.confirm('すべてのポイントを削除しますか？')) {
			setPoints([]);
			setRouteLine([]);
			setMessage('すべてのポイントをクリアしました');
			setTimeout(() => setMessage(''), 3000);
		}
	};

	// ポイントの順序を入れ替え
	const handleMovePoint = (pointId: string, direction: 'up' | 'down') => {
		const currentIndex = points.findIndex((p) => p.id === pointId);
		if (currentIndex === -1) return;

		const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

		// 範囲外チェック
		if (newIndex < 0 || newIndex >= points.length) return;

		// スタートとゴールは移動できない
		const currentPoint = points[currentIndex];
		const targetPoint = points[newIndex];
		if (currentPoint.type !== 'waypoint' || targetPoint.type !== 'waypoint') return;

		// 入れ替え
		const newPoints = [...points];
		[newPoints[currentIndex], newPoints[newIndex]] = [newPoints[newIndex], newPoints[currentIndex]];

		// orderを再計算
		const updatedPoints = newPoints.map((p, index) => ({ ...p, order: index }));
		setPoints(updatedPoints);

		// 経路ラインを更新
		updateRouteLine(updatedPoints);

		setMessage('順序を入れ替えました');
		setTimeout(() => setMessage(''), 3000);
	};

	// 経路保存
	const handleSave = async () => {
		try {
			const result = await saveRoute({
				points,
				routeLine,
			});
			if (result.success) {
				setMessage('経路を保存しました');
				setTimeout(() => setMessage(''), 3000);
			}
		} catch (error) {
			setMessage('保存に失敗しました');
			setTimeout(() => setMessage(''), 3000);
		}
	};

	// 経路読み込み
	const handleLoad = async () => {
		try {
			const result = await loadRoute();
			if (result.success && result.data) {
				setPoints(result.data.points);
				setRouteLine(result.data.routeLine);
				setMessage('経路を読み込みました');
				setTimeout(() => setMessage(''), 3000);
			} else {
				setMessage('保存された経路が見つかりません');
				setTimeout(() => setMessage(''), 3000);
			}
		} catch (error) {
			setMessage('読み込みに失敗しました');
			setTimeout(() => setMessage(''), 3000);
		}
	};

	return (
		<div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
			{/* メッセージ表示 */}
			<MessageDisplay message={message} />

			{/* サイドバー */}
			<Sidebar
				mode={mode}
				onModeChange={setMode}
				points={points}
				onSave={handleSave}
				onLoad={handleLoad}
				onClearPoints={handleClearPoints}
				onEditPoint={handleEditPoint}
				onDeletePoint={handleDeletePoint}
				onMovePoint={handleMovePoint}
				onPointClick={handlePointClick}
				onUpdateComment={handleUpdateComment}
				highlightedPointId={highlightedPointId}
			/>

			{/* ポイント編集モーダル */}
			<PointEditModal
				point={editingPoint}
				onClose={() => setEditingPoint(null)}
				onSave={handleSavePoint}
				onDelete={handleDeletePoint}
			/>

			{/* 地図 */}
			<MapContainer
				center={[35.628, 139.596]}
				zoom={14}
				style={{ height: '100%', width: '100%' }}
				attributionControl={false}
				zoomControl={false}
			>
				<TileLayer
					attribution='<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>'
					url="https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png"
				/>
				<AttributionControl position="bottomleft" />
				<ZoomControl position="topright" />
				<CoordinateDisplay position="bottomright" />
				<ScaleControl position="bottomright" imperial={false} />

				{/* 地図クリックハンドラー（編集モード時のみ有効） */}
				<MapClickHandler enabled={mode === 'edit'} onMapClick={handleMapClick} />

				{/* 地図の中心を変更 */}
				<MapCenter center={mapCenter} />

				{/* 経路全体を画面に収める */}
				<FitBounds positions={routeLine} />

				{/* 経路とポイントを表示 */}
				<RouteLine positions={routeLine} />
				{points.map((point) => (
					<PointMarker
						key={point.id}
						point={point}
						editMode={mode === 'edit'}
						onDragEnd={handlePointDragEnd}
						onClick={handleEditPoint}
					/>
				))}
			</MapContainer>
		</div>
	);
};

export default App;
