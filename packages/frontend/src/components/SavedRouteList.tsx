import { useState, useEffect } from 'react';
import { getAllRoutes, deleteRoute, type SavedRoute } from '../api/route-api';
import { handleAsyncOperation } from '../utils/error-handler';
import { COLORS } from '../constants/colors';

interface SavedRouteListProps {
	onLoadRoute: (routeId: string) => Promise<void>;
	onMessage: (message: string, type?: 'success' | 'error') => void;
	refreshTrigger?: number;
}

const SavedRouteList = ({ onLoadRoute, onMessage, refreshTrigger }: SavedRouteListProps) => {
	const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchRoutes = async () => {
			setIsLoading(true);
			await handleAsyncOperation({
				operation: getAllRoutes,
				errorMessage: '経路一覧の取得に失敗しました',
				showMessage: onMessage,
				onSuccess: (routes) => {
					const sortedRoutes = [...routes].sort(
						(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
					);
					setSavedRoutes(sortedRoutes);
				},
			});
			setIsLoading(false);
		};

		fetchRoutes();
	}, [refreshTrigger, onMessage]);

	const handleDeleteRoute = async (routeId: string, routeName: string) => {
		if (!window.confirm(`「${routeName}」を削除しますか？`)) {
			return;
		}

		await handleAsyncOperation({
			operation: () => deleteRoute(routeId),
			successMessage: '経路を削除しました',
			errorMessage: '削除に失敗しました',
			showMessage: onMessage,
			onSuccess: () => {
				setSavedRoutes(savedRoutes.filter((r) => r.id !== routeId));
			},
		});
	};

	const handleLoadRoute = async (routeId: string) => {
		await handleAsyncOperation({
			operation: () => onLoadRoute(routeId),
			errorMessage: '読み込みに失敗しました',
			showMessage: onMessage,
		});
	};

	return (
		<div style={{ marginTop: '16px' }}>
			<h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>
				保存済み経路 ({savedRoutes.length})
			</h4>
			{isLoading ? (
				<div
					style={{
						fontSize: '12px',
						color: '#666',
						padding: '8px',
						backgroundColor: '#f8f9fa',
						borderRadius: '4px',
					}}
				>
					読み込み中...
				</div>
			) : savedRoutes.length === 0 ? (
				<div
					style={{
						fontSize: '12px',
						color: '#666',
						padding: '8px',
						backgroundColor: '#f8f9fa',
						borderRadius: '4px',
					}}
				>
					保存済みの経路がありません
				</div>
			) : (
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '4px',
						maxHeight: '300px',
						overflowY: 'auto',
					}}
				>
					{savedRoutes.map((route) => (
						<div
							key={route.id}
							style={{
								padding: '8px',
								backgroundColor: '#f8f9fa',
								borderRadius: '4px',
								fontSize: '12px',
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								gap: '4px',
							}}
						>
							<button
								type="button"
								onClick={() => handleLoadRoute(route.id)}
								style={{
									flex: 1,
									textAlign: 'left',
									backgroundColor: 'transparent',
									border: 'none',
									cursor: 'pointer',
									padding: '0',
									fontSize: '12px',
								}}
								title="クリックして読み込む"
							>
								<div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{route.name}</div>
								<div style={{ fontSize: '11px', color: '#666' }}>
									{new Date(route.created_at).toLocaleString('ja-JP', {
										year: 'numeric',
										month: '2-digit',
										day: '2-digit',
										hour: '2-digit',
										minute: '2-digit',
									})}
								</div>
							</button>
							<button
								type="button"
								onClick={() => handleDeleteRoute(route.id, route.name)}
								aria-label={`${route.name}を削除`}
								style={{
									padding: '4px 8px',
									fontSize: '16px',
									cursor: 'pointer',
									backgroundColor: 'transparent',
									border: 'none',
									color: COLORS.DANGER,
								}}
								title="削除"
							>
								🗑
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default SavedRouteList;
