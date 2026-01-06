import clsx from 'clsx';
import type { RouteHandlers } from '../types/handlers';
import SavedRouteList from './SavedRouteList';
import buttonStyles from '../styles/shared/buttons.module.css';
import styles from './Sidebar.module.css';

interface ViewModeSectionProps {
	routeHandlers: RouteHandlers;
	onMessage: (message: string, type?: 'success' | 'error') => void;
	routeListRefreshTrigger?: number;
}

const ViewModeSection = ({
	routeHandlers,
	onMessage,
	routeListRefreshTrigger,
}: ViewModeSectionProps) => {
	return (
		<div className={styles.section}>
			<h3 className={styles.sectionTitle}>通常モード</h3>
			<div className={styles.buttonGroup}>
				<button
					type="button"
					onClick={routeHandlers.onSave}
					aria-label="現在の経路を保存"
					className={clsx(buttonStyles.button, buttonStyles.md, buttonStyles.success)}
				>
					現在の経路を保存
				</button>
			</div>

			<SavedRouteList
				onLoadRoute={routeHandlers.onLoadRoute}
				onMessage={onMessage}
				refreshTrigger={routeListRefreshTrigger}
			/>
		</div>
	);
};

export default ViewModeSection;
