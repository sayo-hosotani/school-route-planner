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
import RouteNameModal from './components/RouteNameModal';
import { saveRoute, loadRouteById } from './api/route-api';
import { useMessage } from './hooks/use-message';
import { useModal } from './hooks/use-modal';
import { usePoints } from './hooks/use-points';
import { useRouteGeneration } from './hooks/use-route-generation';
import { DEFAULT_MAP_CENTER, DEFAULT_ZOOM_LEVEL, HIGHLIGHT_TIMEOUT_MS } from './constants/map-config';
import type { Point } from './types/point';

const App = () => {
	const [mode, setMode] = useState<'view' | 'edit'>('view');
	const [highlightedPointId, setHighlightedPointId] = useState<string | null>(null);
	const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

	// カスタムフック
	const { message, messageType, showMessage } = useMessage();
	const routeNameModal = useModal();
	const pointEditModal = useModal<Point>();
	const { points, addPoint, updatePoint, deletePoint, movePoint, clearPoints, findPoint, hasStartAndGoal, loadPoints } = usePoints();
	const { routeLine, generateRouteFromPoints, setRouteLine, clearRoute } = useRouteGeneration();

	// 地図クリックでポイント追加
	const handleMapClick = async (lat: number, lng: number) => {
		const newPoints = addPoint(lat, lng);
		await generateRouteFromPoints(newPoints);
		showMessage('ポイントを追加しました');
	};

	// ポイントのドラッグ移動
	const handlePointDragEnd = async (pointId: string, lat: number, lng: number) => {
		const updatedPoints = updatePoint(pointId, { lat, lng });
		await generateRouteFromPoints(updatedPoints);
		showMessage('ポイントを移動しました');
	};

	// ポイント編集モーダルを開く
	const handleEditPoint = (pointId: string) => {
		const point = findPoint(pointId);
		if (point) {
			pointEditModal.open(point);
		}
	};

	// ポイント編集を保存
	const handleSavePoint = (pointId: string, type: Point['type'], comment: string) => {
		updatePoint(pointId, { type, comment });
		showMessage('ポイントを更新しました');
	};

	// サイドバーからのコメント更新
	const handleUpdateComment = (pointId: string, comment: string) => {
		updatePoint(pointId, { comment });
		showMessage('コメントを更新しました');
	};

	// ポイントクリック時の処理（地図中央に移動＋ハイライト）
	const handlePointClick = (pointId: string) => {
		const point = findPoint(pointId);
		if (point) {
			setMapCenter([point.lat, point.lng]);
			setHighlightedPointId(pointId);
			setTimeout(() => {
				setHighlightedPointId(null);
				setMapCenter(null);
			}, HIGHLIGHT_TIMEOUT_MS);
		}
	};

	// ポイント削除
	const handleDeletePoint = async (pointId: string) => {
		const newPoints = deletePoint(pointId);
		await generateRouteFromPoints(newPoints);
		showMessage('ポイントを削除しました');
	};

	// 全ポイントをクリア
	const handleClearPoints = () => {
		if (window.confirm('すべてのポイントを削除しますか？')) {
			clearPoints();
			clearRoute();
			showMessage('すべてのポイントをクリアしました');
		}
	};

	// ポイントの順序を入れ替え
	const handleMovePoint = async (pointId: string, direction: 'up' | 'down') => {
		const newPoints = movePoint(pointId, direction);
		if (newPoints) {
			await generateRouteFromPoints(newPoints);
			showMessage('順序を入れ替えました');
		}
	};

	// 経路保存（モーダル表示）
	const handleSave = () => {
		if (!hasStartAndGoal()) {
			showMessage('経路を保存するには、スタートとゴールの両方が必要です', 'error');
			return;
		}
		routeNameModal.open();
	};

	// 経路名入力後の保存処理
	const handleSaveWithName = async (routeName: string) => {
		try {
			const result = await saveRoute({ points, routeLine }, routeName);
			if (result.success) {
				showMessage('経路を保存しました');
			}
		} catch {
			showMessage('保存に失敗しました', 'error');
		}
	};

	// 特定の経路を読み込む
	const handleLoadRoute = async (routeId: string) => {
		try {
			const result = await loadRouteById(routeId);
			if (result.success && result.data) {
				loadPoints(result.data.points);
				setRouteLine(result.data.routeLine);
				showMessage('経路を読み込みました');
			} else {
				showMessage('経路が見つかりません', 'error');
			}
		} catch {
			showMessage('読み込みに失敗しました', 'error');
		}
	};

	// メッセージ表示（Sidebarから呼び出し用）
	const handleMessage = (msg: string, type: 'success' | 'error') => {
		showMessage(msg, type);
	};

	return (
		<div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
			{/* メッセージ表示 */}
			<MessageDisplay message={message} type={messageType} />

			{/* サイドバー */}
			<Sidebar
				mode={mode}
				onModeChange={setMode}
				points={points}
				onSave={handleSave}
				onClearPoints={handleClearPoints}
				onEditPoint={handleEditPoint}
				onDeletePoint={handleDeletePoint}
				onMovePoint={handleMovePoint}
				onPointClick={handlePointClick}
				onUpdateComment={handleUpdateComment}
				highlightedPointId={highlightedPointId}
				onLoadRoute={handleLoadRoute}
				onMessage={handleMessage}
			/>

			{/* 経路名入力モーダル */}
			<RouteNameModal
				isOpen={routeNameModal.isOpen}
				onSave={handleSaveWithName}
				onClose={routeNameModal.close}
			/>

			{/* ポイント編集モーダル */}
			<PointEditModal
				point={pointEditModal.data}
				onClose={pointEditModal.close}
				onSave={handleSavePoint}
				onDelete={handleDeletePoint}
			/>

			{/* 地図 */}
			<MapContainer
				center={DEFAULT_MAP_CENTER}
				zoom={DEFAULT_ZOOM_LEVEL}
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
