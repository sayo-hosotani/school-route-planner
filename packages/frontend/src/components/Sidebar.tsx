import clsx from 'clsx';
import type { Point } from '../types/point';
import PointItem from './PointItem';
import SavedRouteList from './SavedRouteList';
import buttonStyles from '../styles/shared/buttons.module.css';
import styles from './Sidebar.module.css';

interface SidebarProps {
	mode: 'view' | 'edit';
	onModeChange: (mode: 'view' | 'edit') => void;
	points: Point[];
	onSave: () => void;
	onClearPoints: () => void;
	onEditPoint: (pointId: string) => void;
	onDeletePoint: (pointId: string) => void;
	onMovePoint: (pointId: string, direction: 'up' | 'down') => void;
	onPointClick: (pointId: string) => void;
	onUpdateComment: (pointId: string, comment: string) => void;
	highlightedPointId: string | null;
	onLoadRoute: (routeId: string) => Promise<void>;
	onMessage: (message: string, type?: 'success' | 'error') => void;
	routeListRefreshTrigger?: number;
}

const Sidebar = ({
	mode,
	onModeChange,
	points,
	onSave,
	onClearPoints,
	onEditPoint,
	onDeletePoint,
	onMovePoint,
	onPointClick,
	onUpdateComment,
	highlightedPointId,
	onLoadRoute,
	onMessage,
	routeListRefreshTrigger,
}: SidebarProps) => {
	const startPoint = points.find((p) => p.type === 'start') || null;
	const goalPoint = points.find((p) => p.type === 'goal') || null;
	const waypoints = points.filter((p) => p.type === 'waypoint');

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

			{/* 通常モードの機能 */}
			{mode === 'view' && (
				<div className={styles.section}>
					<h3 className={styles.sectionTitle}>通常モード</h3>
					<div className={styles.buttonGroup}>
						<button
							type="button"
							onClick={onSave}
							aria-label="現在の経路を保存"
							className={clsx(buttonStyles.button, buttonStyles.md, buttonStyles.success)}
						>
							現在の経路を保存
						</button>
					</div>

					<SavedRouteList
						onLoadRoute={onLoadRoute}
						onMessage={onMessage}
						refreshTrigger={routeListRefreshTrigger}
					/>
				</div>
			)}

			{/* 編集モードの機能 */}
			{mode === 'edit' && (
				<div className={styles.section}>
					<h3 className={styles.sectionTitle}>編集モード</h3>
					<button
						type="button"
						onClick={onClearPoints}
						aria-label="全ポイントをクリア"
						className={clsx(buttonStyles.button, buttonStyles.md, buttonStyles.danger, buttonStyles.full)}
					>
						全ポイントをクリア
					</button>
				</div>
			)}

			{/* ポイント一覧 */}
			<div>
				<h3 className={styles.sectionTitle}>
					現在のポイント一覧 ({points.length})
				</h3>
				<div className={styles.pointList}>
					{/* スタート地点 */}
					<PointItem
						point={startPoint}
						type="start"
						displayIndex={1}
						isNextToAdd={points.length === 0}
						mode={mode}
						isHighlighted={startPoint?.id === highlightedPointId}
						onPointClick={onPointClick}
						onEditPoint={onEditPoint}
						onDeletePoint={onDeletePoint}
						onMovePoint={onMovePoint}
						onUpdateComment={onUpdateComment}
					/>

					{/* 中継地点 */}
					{waypoints.map((point, waypointIndex) => (
						<PointItem
							key={point.id}
							point={point}
							type="waypoint"
							displayIndex={2 + waypointIndex}
							isNextToAdd={false}
							waypointNumber={waypointIndex + 1}
							canMoveUp={waypointIndex > 0}
							canMoveDown={waypointIndex < waypoints.length - 1}
							mode={mode}
							isHighlighted={point.id === highlightedPointId}
							onPointClick={onPointClick}
							onEditPoint={onEditPoint}
							onDeletePoint={onDeletePoint}
							onMovePoint={onMovePoint}
							onUpdateComment={onUpdateComment}
						/>
					))}

					{/* 次の中継地点入力欄（編集モード かつ スタートとゴールが存在する場合のみ） */}
					{mode === 'edit' && points.length >= 2 && (
						<PointItem
							point={null}
							type="waypoint"
							displayIndex={points.length}
							isNextToAdd={true}
							waypointNumber={waypoints.length + 1}
							mode={mode}
							isHighlighted={false}
							onPointClick={onPointClick}
							onEditPoint={onEditPoint}
							onDeletePoint={onDeletePoint}
							onMovePoint={onMovePoint}
							onUpdateComment={onUpdateComment}
						/>
					)}

					{/* ゴール地点 */}
					<PointItem
						point={goalPoint}
						type="goal"
						displayIndex={points.length >= 2 ? points.length + 1 : 2}
						isNextToAdd={points.length === 1}
						mode={mode}
						isHighlighted={goalPoint?.id === highlightedPointId}
						onPointClick={onPointClick}
						onEditPoint={onEditPoint}
						onDeletePoint={onDeletePoint}
						onMovePoint={onMovePoint}
						onUpdateComment={onUpdateComment}
					/>
				</div>
			</div>
		</div>
	);
};

export default Sidebar;
