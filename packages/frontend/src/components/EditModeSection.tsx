import { memo } from 'react';
import clsx from 'clsx';
import type { Point } from '../types/point';
import type { PointHandlers, RouteHandlers } from '../types/handlers';
import PointItem from './PointItem';
import buttonStyles from '../styles/shared/buttons.module.css';
import styles from './Sidebar.module.css';

interface EditModeSectionProps {
	points: Point[];
	highlightedPointId: string | null;
	pointHandlers: PointHandlers;
	routeHandlers: RouteHandlers;
}

const EditModeSection = memo(({
	points,
	highlightedPointId,
	pointHandlers,
	routeHandlers,
}: EditModeSectionProps) => {
	const startPoint = points.find((p) => p.type === 'start') || null;
	const goalPoint = points.find((p) => p.type === 'goal') || null;
	const waypoints = points.filter((p) => p.type === 'waypoint');

	return (
		<>
			<div className={styles.section}>
				<h3 className={styles.sectionTitle}>編集モード</h3>
				<button
					type="button"
					onClick={routeHandlers.onClearPoints}
					aria-label="全ポイントをクリア"
					className={clsx(buttonStyles.button, buttonStyles.md, buttonStyles.danger, buttonStyles.full)}
				>
					全ポイントをクリア
				</button>
			</div>

			{/* ポイント一覧 */}
			<div>
				<h3 className={styles.sectionTitle}>
					現在のポイント一覧 ({points.length})
				</h3>
				<ul className={styles.pointList} aria-label="ポイント一覧">
					{/* スタート地点 */}
					<PointItem
						point={startPoint}
						type="start"
						displayIndex={1}
						isNextToAdd={points.length === 0}
						isHighlighted={startPoint?.id === highlightedPointId}
						{...pointHandlers}
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
							isHighlighted={point.id === highlightedPointId}
							{...pointHandlers}
						/>
					))}

					{/* 次の中継地点入力欄（スタートとゴールが存在する場合のみ） */}
					{points.length >= 2 && (
						<PointItem
							point={null}
							type="waypoint"
							displayIndex={points.length}
							isNextToAdd={true}
							waypointNumber={waypoints.length + 1}
							isHighlighted={false}
							{...pointHandlers}
						/>
					)}

					{/* ゴール地点 */}
					<PointItem
						point={goalPoint}
						type="goal"
						displayIndex={points.length >= 2 ? points.length + 1 : 2}
						isNextToAdd={points.length === 1}
						isHighlighted={goalPoint?.id === highlightedPointId}
						{...pointHandlers}
					/>
				</ul>
			</div>
		</>
	);
});

EditModeSection.displayName = 'EditModeSection';

export default EditModeSection;
