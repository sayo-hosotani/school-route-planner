import { memo, useCallback } from 'react';
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
	onRefreshRouteList: () => void;
}

const Sidebar = memo(({
	mode,
	onModeChange,
	points,
	highlightedPointId,
	pointHandlers,
	routeHandlers,
	onMessage,
	routeListRefreshTrigger,
	onRefreshRouteList,
}: SidebarProps) => {
	const handleModeKeyDown = useCallback((e: React.KeyboardEvent) => {
		if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
			e.preventDefault();
			const newMode = e.key === 'ArrowLeft' ? 'view' : 'edit';
			onModeChange(newMode);
		}
	}, [onModeChange]);

	return (
		<div className={styles.container}>
			{/* モード切り替えボタン */}
			<div className={styles.modeButtons} role="tablist" aria-label="モード切り替え">
				<button
					type="button"
					role="tab"
					aria-selected={mode === 'view'}
					aria-controls="mode-content"
					onClick={() => onModeChange('view')}
					onKeyDown={handleModeKeyDown}
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
					role="tab"
					aria-selected={mode === 'edit'}
					aria-controls="mode-content"
					onClick={() => onModeChange('edit')}
					onKeyDown={handleModeKeyDown}
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

			<div id="mode-content" role="tabpanel">
				{mode === 'view' ? (
					<ViewModeSection
						routeHandlers={routeHandlers}
						onMessage={onMessage}
						routeListRefreshTrigger={routeListRefreshTrigger}
						onRefreshRouteList={onRefreshRouteList}
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
		</div>
	);
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
