import { memo } from 'react';
import type { Point } from '../../types/point';
import type { PointHandlers } from '../../types/handlers';
import PointItem from './PointItem';
import styles from './PointListPanel.module.css';

interface PointListPanelProps {
	isOpen: boolean;
	onClose: () => void;
	points: Point[];
	highlightedPointId: string | null;
	pointHandlers: PointHandlers;
}

const PointListPanel = memo(({
	isOpen,
	onClose,
	points,
	highlightedPointId,
	pointHandlers,
}: PointListPanelProps) => {
	if (!isOpen) return null;

	const startPoint = points.find((p) => p.type === 'start') || null;
	const goalPoint = points.find((p) => p.type === 'goal') || null;
	const waypoints = points.filter((p) => p.type === 'waypoint');

	return (
		<div className={styles.panel}>
			<div className={styles.header}>
				<h3 className={styles.title}>ポイントの一覧 ({points.length})</h3>
				<button
					type="button"
					className={styles.closeButton}
					onClick={onClose}
					aria-label="閉じる"
				>
					×
				</button>
			</div>

			<div className={styles.content}>
				{points.length === 0 ? (
					<div className={styles.emptyState}>
						ポイントがありません。<br />
						地図をクリックしてポイントを追加してください。
					</div>
				) : (
					<ul className={styles.list} aria-label="ポイント一覧">
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

						{/* ゴール地点 */}
						<PointItem
							point={goalPoint}
							type="goal"
							displayIndex={points.length >= 2 ? points.length : 2}
							isNextToAdd={points.length === 1}
							isHighlighted={goalPoint?.id === highlightedPointId}
							{...pointHandlers}
						/>
					</ul>
				)}
			</div>
		</div>
	);
});

PointListPanel.displayName = 'PointListPanel';

export default PointListPanel;
