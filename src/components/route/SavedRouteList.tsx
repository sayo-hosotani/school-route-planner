import { memo, useCallback } from 'react';
import { useSavedRoutes } from '../../hooks/use-saved-routes';
import { handleAsyncOperation } from '../../utils/error-handler';
import styles from './SavedRouteList.module.css';

interface SavedRouteListProps {
	onLoadRoute: (routeId: string) => Promise<void>;
	onMessage: (message: string, type?: 'success' | 'error') => void;
	refreshTrigger?: number;
}

const SavedRouteList = memo(({ onLoadRoute, onMessage, refreshTrigger }: SavedRouteListProps) => {
	const { savedRoutes, isLoading, handleDeleteRoute } = useSavedRoutes({
		onMessage,
		refreshTrigger,
	});

	const handleLoadRoute = useCallback(async (routeId: string) => {
		await handleAsyncOperation({
			operation: () => onLoadRoute(routeId),
			errorMessage: '読み込みに失敗しました',
			showMessage: onMessage,
		});
	}, [onLoadRoute, onMessage]);

	return (
		<div className={styles.container}>
			<h4 className={styles.title}>保存済み経路 ({savedRoutes.length})</h4>
			{isLoading ? (
				<div className={styles.emptyState}>読み込み中...</div>
			) : savedRoutes.length === 0 ? (
				<div className={styles.emptyState}>保存済みの経路がありません</div>
			) : (
				<ul className={styles.list} aria-label="保存済み経路一覧">
					{savedRoutes.map((route) => (
						<li key={route.id} className={styles.item}>
							<button
								type="button"
								onClick={() => handleLoadRoute(route.id)}
								className={styles.loadButton}
								title="クリックして読み込む"
								aria-label={`${route.name}を読み込む - ${new Date(route.created_at).toLocaleString('ja-JP')}`}
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
						</li>
					))}
				</ul>
			)}
		</div>
	);
});

SavedRouteList.displayName = 'SavedRouteList';

export default SavedRouteList;
