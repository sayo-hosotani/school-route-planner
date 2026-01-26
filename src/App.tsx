import { useState, useCallback, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, ScaleControl, AttributionControl, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import CoordinateDisplay from './components/map/CoordinateDisplay';
import RouteLine from './components/map/RouteLine';
import PointMarker from './components/map/PointMarker';
import FitBounds from './components/map/FitBounds';
import MapClickHandler from './components/map/MapClickHandler';
import MapCenter from './components/map/MapCenter';
import PointEditModal from './components/point/PointEditModal';
import PointListPanel from './components/point/PointListPanel';
import RouteNameModal from './components/route/RouteNameModal';
import RouteListModal from './components/route/RouteListModal';
import HamburgerMenu from './components/menu/HamburgerMenu';
import AddressSearchModal from './components/address/AddressSearchModal';
import WelcomeScreen from './components/welcome/WelcomeScreen';
import MessageDisplay from './components/ui/MessageDisplay';
import LoadingOverlay from './components/ui/LoadingOverlay';
import { saveRoute, loadRouteById, getAllRoutes } from './api/route-api';
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

	// モーダル・パネル
	const routeNameModal = useModal();
	const pointEditModal = useModal<Point>();
	const [isRouteListOpen, setIsRouteListOpen] = useState(false);
	const [isAddressSearchOpen, setIsAddressSearchOpen] = useState(false);
	const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);

	// 経路一覧の更新トリガー
	const [routeListRefreshTrigger, setRouteListRefreshTrigger] = useState(0);

	// ページ表示時に保存済み経路があれば一覧を表示、なければウェルカム画面を表示
	useEffect(() => {
		const checkSavedRoutes = async () => {
			try {
				const routes = await getAllRoutes();
				if (routes.length > 0) {
					setIsRouteListOpen(true);
				} else {
					setIsWelcomeOpen(true);
				}
			} catch {
				// エラー時はウェルカム画面を表示
				setIsWelcomeOpen(true);
			}
		};
		checkSavedRoutes();
	}, []);

	// 経路一覧を更新
	const handleRefreshRouteList = useCallback(() => {
		setRouteListRefreshTrigger((prev) => prev + 1);
	}, []);

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

	// 通学路の新規作成
	const handleNewRoute = useCallback(() => {
		if (points.length === 0 || window.confirm('現在のポイントをすべてクリアして新規作成しますか？')) {
			clearPoints();
			showMessage('新規作成しました');
		}
	}, [points.length, clearPoints, showMessage]);

	// 通学路一覧を開く
	const handleOpenRouteList = useCallback(() => {
		setIsRouteListOpen(true);
	}, []);

	// 住所検索モーダルを開く
	const handleOpenAddressSearch = useCallback(() => {
		setIsAddressSearchOpen(true);
	}, []);

	// 住所からポイントを追加
	const handleAddPointFromAddress = useCallback(async (lat: number, lng: number, comment: string) => {
		const pointId = await addPoint(lat, lng, comment);
		// 追加されたポイントにフォーカス
		setMapCenter([lat, lng]);
		if (pointId) {
			highlightPoint(pointId);
		}
		showMessage(`ポイントを追加しました: ${comment}`);
	}, [addPoint, setMapCenter, highlightPoint, showMessage]);

	// ウェルカム画面からのインポート成功時
	const handleWelcomeImportSuccess = useCallback((count: number) => {
		showMessage(`${count}件の経路をインポートしました`);
		handleRefreshRouteList();
		setIsRouteListOpen(true);
	}, [showMessage, handleRefreshRouteList]);

	return (
		<div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
			{/* メッセージ表示 */}
			<MessageDisplay message={message} type={messageType} />

			{/* ローディングオーバーレイ */}
			<LoadingOverlay isLoading={isLoading} message={loadingMessage} />

			{/* ハンバーガーメニュー */}
			<HamburgerMenu
				onNewRoute={handleNewRoute}
				onSaveRoute={handleSave}
				onOpenRouteList={handleOpenRouteList}
				onOpenAddressSearch={handleOpenAddressSearch}
				onMessage={showMessage}
				onRefreshRouteList={handleRefreshRouteList}
				hasPoints={points.length > 0}
			/>

			{/* 通学路一覧モーダル */}
			<RouteListModal
				isOpen={isRouteListOpen}
				onClose={() => setIsRouteListOpen(false)}
				onViewRoute={handleLoadRoute}
				onEditRoute={handleLoadRoute}
				onMessage={showMessage}
				refreshTrigger={routeListRefreshTrigger}
			/>

			{/* ポイント一覧パネル */}
			<PointListPanel
				points={points}
				highlightedPointId={highlightedPointId}
				pointHandlers={pointHandlers}
				onAddPointFromAddress={handleAddPointFromAddress}
				onMessage={showMessage}
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
				onDeletePoint={pointHandlers.onDeletePoint}
				onMovePoint={pointHandlers.onMovePoint}
			/>

			{/* 住所検索モーダル */}
			<AddressSearchModal
				isOpen={isAddressSearchOpen}
				onClose={() => setIsAddressSearchOpen(false)}
				onAddPoint={handleAddPointFromAddress}
				onError={(msg) => showMessage(msg, 'error')}
			/>

			{/* ウェルカム画面 */}
			<WelcomeScreen
				isOpen={isWelcomeOpen}
				onClose={() => setIsWelcomeOpen(false)}
				onAddPoint={handleAddPointFromAddress}
				onImportSuccess={handleWelcomeImportSuccess}
				onError={(msg) => showMessage(msg, 'error')}
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

				{/* 地図クリックハンドラー（常に有効） */}
				<MapClickHandler enabled={true} onMapClick={handleMapClick} />

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
						editMode={true}
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
