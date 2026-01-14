import { useState, useCallback, useMemo } from 'react';
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
import LoadingOverlay from './components/LoadingOverlay';
import MapCenter from './components/MapCenter';
import RouteNameModal from './components/RouteNameModal';
import { saveRoute, loadRouteById } from './api/route-api';
import { useModal } from './hooks/use-modal';
import { PointProvider, AppProvider, usePointContext, useAppContext } from './contexts';
import { handleAsyncOperation } from './utils/error-handler';
import { DEFAULT_MAP_CENTER, DEFAULT_ZOOM_LEVEL } from './constants/map-config';
import type { Point } from './types/point';

const AppContent = () => {
	// Context
	const {
		points,
		routeLine,
		addPoint,
		updatePoint,
		deletePoint,
		movePoint,
		clearPoints,
		findPoint,
		hasStartAndGoal,
		loadRoute,
	} = usePointContext();

	const {
		mode,
		setMode,
		message,
		messageType,
		showMessage,
		isLoading,
		loadingMessage,
		highlightedPointId,
		highlightPoint,
		mapCenter,
		setMapCenter,
	} = useAppContext();

	// モーダル
	const routeNameModal = useModal();
	const pointEditModal = useModal<Point>();

	// 経路一覧の更新トリガー
	const [routeListRefreshTrigger, setRouteListRefreshTrigger] = useState(0);

	// 地図クリックでポイント追加
	const handleMapClick = useCallback(async (lat: number, lng: number) => {
		await addPoint(lat, lng);
		showMessage('ポイントを追加しました');
	}, [addPoint, showMessage]);

	// ポイントのドラッグ移動
	const handlePointDragEnd = useCallback(async (pointId: string, lat: number, lng: number) => {
		await updatePoint(pointId, { lat, lng });
		showMessage('ポイントを移動しました');
	}, [updatePoint, showMessage]);

	// ポイント編集モーダルを開く
	const handleEditPoint = useCallback((pointId: string) => {
		const point = findPoint(pointId);
		if (point) {
			pointEditModal.open(point);
		}
	}, [findPoint, pointEditModal]);

	// ポイント編集を保存
	const handleSavePoint = useCallback(async (pointId: string, type: Point['type'], comment: string) => {
		await updatePoint(pointId, { type, comment });
		showMessage('ポイントを更新しました');
	}, [updatePoint, showMessage]);

	// サイドバーからのコメント更新
	const handleUpdateComment = useCallback(async (pointId: string, comment: string) => {
		await updatePoint(pointId, { comment });
		showMessage('コメントを更新しました');
	}, [updatePoint, showMessage]);

	// ポイントクリック時の処理（地図中央に移動＋ハイライト）
	const handlePointClick = useCallback((pointId: string) => {
		const point = findPoint(pointId);
		if (point) {
			setMapCenter([point.lat, point.lng]);
			highlightPoint(pointId);
		}
	}, [findPoint, setMapCenter, highlightPoint]);

	// ポイント削除
	const handleDeletePoint = useCallback(async (pointId: string) => {
		await deletePoint(pointId);
		showMessage('ポイントを削除しました');
	}, [deletePoint, showMessage]);

	// 全ポイントをクリア
	const handleClearPoints = useCallback(() => {
		if (window.confirm('すべてのポイントを削除しますか？')) {
			clearPoints();
			showMessage('すべてのポイントをクリアしました');
		}
	}, [clearPoints, showMessage]);

	// ポイントの順序を入れ替え
	const handleMovePoint = useCallback(async (pointId: string, direction: 'up' | 'down') => {
		const moved = await movePoint(pointId, direction);
		if (moved) {
			showMessage('順序を入れ替えました');
		}
	}, [movePoint, showMessage]);

	// 経路保存（モーダル表示）
	const handleSave = useCallback(() => {
		if (!hasStartAndGoal()) {
			showMessage('経路を保存するには、スタートとゴールの両方が必要です', 'error');
			return;
		}
		routeNameModal.open();
	}, [hasStartAndGoal, showMessage, routeNameModal]);

	// 経路名入力後の保存処理
	const handleSaveWithName = useCallback(async (routeName: string) => {
		await handleAsyncOperation({
			operation: () => saveRoute({ points, routeLine }, routeName),
			successMessage: '経路を保存しました',
			errorMessage: '保存に失敗しました',
			showMessage,
			onSuccess: () => {
				setRouteListRefreshTrigger((prev) => prev + 1);
			},
		});
	}, [points, routeLine, showMessage]);

	// 特定の経路を読み込む
	const handleLoadRoute = useCallback(async (routeId: string) => {
		await handleAsyncOperation({
			operation: () => loadRouteById(routeId),
			successMessage: '経路を読み込みました',
			errorMessage: '読み込みに失敗しました',
			showMessage,
			onSuccess: (data) => {
				loadRoute(data.points, data.routeLine);
			},
		});
	}, [showMessage, loadRoute]);

	// ハンドラーオブジェクトをメモ化
	const pointHandlers = useMemo(() => ({
		onEditPoint: handleEditPoint,
		onDeletePoint: handleDeletePoint,
		onMovePoint: handleMovePoint,
		onPointClick: handlePointClick,
		onUpdateComment: handleUpdateComment,
	}), [handleEditPoint, handleDeletePoint, handleMovePoint, handlePointClick, handleUpdateComment]);

	const routeHandlers = useMemo(() => ({
		onSave: handleSave,
		onClearPoints: handleClearPoints,
		onLoadRoute: handleLoadRoute,
	}), [handleSave, handleClearPoints, handleLoadRoute]);

	return (
		<div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
			{/* メッセージ表示 */}
			<MessageDisplay message={message} type={messageType} />

			{/* ローディングオーバーレイ */}
			<LoadingOverlay isLoading={isLoading} message={loadingMessage} />

			{/* サイドバー */}
			<Sidebar
				mode={mode}
				onModeChange={setMode}
				points={points}
				highlightedPointId={highlightedPointId}
				pointHandlers={pointHandlers}
				routeHandlers={routeHandlers}
				onMessage={showMessage}
				routeListRefreshTrigger={routeListRefreshTrigger}
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

const App = () => {
	return (
		<AppProvider>
			<PointProvider>
				<AppContent />
			</PointProvider>
		</AppProvider>
	);
};

export default App;
