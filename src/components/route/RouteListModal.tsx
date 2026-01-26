import { memo, useCallback } from 'react';
import { useSavedRoutes } from '../../hooks/use-saved-routes';
import modalStyles from '../../styles/shared/modal.module.css';
import styles from './RouteListModal.module.css';

interface RouteListModalProps {
	isOpen: boolean;
	onClose: () => void;
	onViewRoute: (routeId: string) => void;
	onEditRoute: (routeId: string) => void;
	onMessage: (message: string, type?: 'success' | 'error') => void;
	refreshTrigger?: number;
}

const RouteListModal = memo(({
	isOpen,
	onClose,
	onViewRoute,
	onEditRoute,
	onMessage,
	refreshTrigger,
}: RouteListModalProps) => {
	const { savedRoutes, isLoading, handleDeleteRoute } = useSavedRoutes({
		onMessage,
		refreshTrigger,
	});

	const handleView = useCallback((routeId: string) => {
		onViewRoute(routeId);
		onClose();
	}, [onViewRoute, onClose]);

	const handleEdit = useCallback((routeId: string) => {
		onEditRoute(routeId);
		onClose();
	}, [onEditRoute, onClose]);

	const handleDelete = useCallback((routeId: string, routeName: string) => {
		handleDeleteRoute(routeId, routeName);
	}, [handleDeleteRoute]);

	if (!isOpen) return null;

	return (
		<div className={modalStyles.overlay}>
			<div className={styles.content}>
				<div className={styles.header}>
					<h2 className={styles.title}>通学路の一覧</h2>
					<button
						type="button"
						className={styles.closeButton}
						onClick={onClose}
						aria-label="閉じる"
					>
						×
					</button>
				</div>

				{isLoading ? (
					<div className={styles.emptyState}>読み込み中...</div>
				) : savedRoutes.length === 0 ? (
					<div className={styles.emptyState}>
						保存済みの通学路がありません
					</div>
				) : (
					<ul className={styles.list} aria-label="通学路一覧">
						{savedRoutes.map((route) => (
							<li key={route.id} className={styles.item}>
								<button
									type="button"
									className={styles.rowButton}
									onClick={() => handleView(route.id)}
									aria-label={`${route.name}を表示`}
								>
									<div className={styles.routeHeader}>
										<span className={styles.routeName}>{route.name}</span>
									</div>
									<div className={styles.routeMeta}>
										作成: {new Date(route.created_at).toLocaleString('ja-JP', {
											year: 'numeric',
											month: '2-digit',
											day: '2-digit',
											hour: '2-digit',
											minute: '2-digit',
										})}
										{route.points && ` / ${route.points.length}ポイント`}
									</div>
								</button>
								<div className={styles.actions}>
									<button
										type="button"
										className={styles.iconButton}
										onClick={() => handleEdit(route.id)}
										aria-label={`${route.name}を編集`}
										title="編集"
									>
										✏️
									</button>
									<button
										type="button"
										className={`${styles.iconButton} ${styles.deleteButton}`}
										onClick={() => handleDelete(route.id, route.name)}
										aria-label={`${route.name}を削除`}
										title="削除"
									>
										🗑️
									</button>
								</div>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
});

RouteListModal.displayName = 'RouteListModal';

export default RouteListModal;
