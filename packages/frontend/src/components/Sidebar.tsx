import clsx from 'clsx';
import type { Point } from '../types/point';
import type { PointHandlers, RouteHandlers } from '../types/handlers';
import ViewModeSection from './ViewModeSection';
import EditModeSection from './EditModeSection';
import buttonStyles from '../styles/shared/buttons.module.css';
import styles from './Sidebar.module.css';

interface SidebarProps {
	mode: 'view' | 'edit';
	onModeChange: (mode: 'view' | 'edit') => void;
	points: Point[];
	highlightedPointId: string | null;
	pointHandlers: PointHandlers;
	routeHandlers: RouteHandlers;
	onMessage: (message: string, type?: 'success' | 'error') => void;
	routeListRefreshTrigger?: number;
}

const Sidebar = ({
	mode,
	onModeChange,
	points,
	highlightedPointId,
	pointHandlers,
	routeHandlers,
	onMessage,
	routeListRefreshTrigger,
}: SidebarProps) => {
	return (
		<div className={styles.container}>
			{/* モード切り替えボタン */}
			<div className={styles.modeButtons}>
				<button
					type="button"
					onClick={() => onModeChange('view')}
					aria-label="通常モードに切り替え"
					className={clsx(
						buttonStyles.button,
						buttonStyles.md,
						buttonStyles.flex,
						mode === 'view' ? buttonStyles.primary : buttonStyles.muted,
						mode === 'view' && buttonStyles.active
					)}
				>
					通常モード
				</button>
				<button
					type="button"
					onClick={() => onModeChange('edit')}
					aria-label="編集モードに切り替え"
					className={clsx(
						buttonStyles.button,
						buttonStyles.md,
						buttonStyles.flex,
						mode === 'edit' ? buttonStyles.primary : buttonStyles.muted,
						mode === 'edit' && buttonStyles.active
					)}
				>
					編集モード
				</button>
			</div>

			{mode === 'view' ? (
				<ViewModeSection
					routeHandlers={routeHandlers}
					onMessage={onMessage}
					routeListRefreshTrigger={routeListRefreshTrigger}
				/>
			) : (
				<EditModeSection
					points={points}
					highlightedPointId={highlightedPointId}
					pointHandlers={pointHandlers}
					routeHandlers={routeHandlers}
				/>
			)}
		</div>
	);
};

export default Sidebar;
