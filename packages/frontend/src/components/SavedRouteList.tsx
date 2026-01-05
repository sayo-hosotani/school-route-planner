import { useState, useEffect } from 'react';
import { getAllRoutes, deleteRoute, type SavedRoute } from '../api/route-api';
import { handleAsyncOperation } from '../utils/error-handler';
import styles from './SavedRouteList.module.css';

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
		<div className={styles.container}>
			<h4 className={styles.title}>保存済み経路 ({savedRoutes.length})</h4>
			{isLoading ? (
				<div className={styles.emptyState}>読み込み中...</div>
			) : savedRoutes.length === 0 ? (
				<div className={styles.emptyState}>保存済みの経路がありません</div>
			) : (
				<div className={styles.list}>
					{savedRoutes.map((route) => (
						<div key={route.id} className={styles.item}>
							<button
								type="button"
								onClick={() => handleLoadRoute(route.id)}
								className={styles.loadButton}
								title="クリックして読み込む"
							>
								<div className={styles.routeName}>{route.name}</div>
								<div className={styles.routeDate}>
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
								className={styles.deleteButton}
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
