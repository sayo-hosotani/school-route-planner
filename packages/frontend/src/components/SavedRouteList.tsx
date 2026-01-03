import { useState, useEffect } from 'react';
import { getAllRoutes, deleteRoute, type SavedRoute } from '../api/route-api';

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
			try {
				const result = await getAllRoutes();
				if (result.success && result.data) {
					const sortedRoutes = [...result.data].sort(
						(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
					);
					setSavedRoutes(sortedRoutes);
				}
			} catch (error) {
				console.error('Failed to fetch routes:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchRoutes();
	}, [refreshTrigger]);

	const handleDeleteRoute = async (routeId: string, routeName: string) => {
		if (!window.confirm(`「${routeName}」を削除しますか？`)) {
			return;
		}

		try {
			const result = await deleteRoute(routeId);
			if (result.success) {
				setSavedRoutes(savedRoutes.filter((r) => r.id !== routeId));
				onMessage('経路を削除しました', 'success');
			}
		} catch (error) {
			onMessage('削除に失敗しました', 'error');
		}
	};

	const handleLoadRoute = async (routeId: string) => {
		try {
			await onLoadRoute(routeId);
		} catch (error) {
			onMessage('読み込みに失敗しました', 'error');
		}
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
								style={{
									padding: '4px 8px',
									fontSize: '16px',
									cursor: 'pointer',
									backgroundColor: 'transparent',
									border: 'none',
									color: '#dc3545',
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
