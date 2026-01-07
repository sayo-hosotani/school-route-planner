import clsx from 'clsx';
import type { Point } from '../types/point';
import { getDisplayTitle } from '../utils/point-utils';
import buttonStyles from '../styles/shared/buttons.module.css';
import styles from './PointItem.module.css';

interface PointItemProps {
	point: Point | null;
	type: Point['type'];
	displayIndex: number;
	isNextToAdd: boolean;
	waypointNumber?: number;
	canMoveUp?: boolean;
	canMoveDown?: boolean;
	isHighlighted: boolean;
	onPointClick: (pointId: string) => void;
	onEditPoint: (pointId: string) => void;
	onDeletePoint: (pointId: string) => void;
	onMovePoint: (pointId: string, direction: 'up' | 'down') => void;
	onUpdateComment: (pointId: string, comment: string) => void;
}

const PointItem = ({
	point,
	type,
	displayIndex,
	isNextToAdd,
	waypointNumber,
	canMoveUp,
	canMoveDown,
	isHighlighted,
	onPointClick,
	onEditPoint,
	onDeletePoint,
	onMovePoint,
}: PointItemProps) => {

	const hasPoint = !!point;
	const isWaypoint = type === 'waypoint';

	const containerClassName = clsx(
		styles.container,
		!hasPoint && styles.containerEmpty,
		hasPoint && !isNextToAdd && !isHighlighted && styles.containerDefault,
		isHighlighted && styles.containerHighlighted,
		isNextToAdd && styles.containerNextToAdd
	);

	return (
		<div className={containerClassName}>
			{/* ヘッダー行 */}
			<div className={clsx(styles.header, (isNextToAdd || isHighlighted) && styles.headerBold)}>
				<button
					type="button"
					onClick={() => hasPoint && onPointClick(point.id)}
					disabled={!hasPoint}
					className={clsx(
						styles.titleButton,
						hasPoint ? styles.titleButtonClickable : styles.titleButtonDisabled
					)}
				>
					{displayIndex}. {getDisplayTitle(point, type, waypointNumber)}
					{isNextToAdd && ' ← 地図をクリックして追加'}
				</button>
			</div>

			{/* 操作ボタン（編集モード時のみ） */}
			{hasPoint && (
				<div className={styles.actions}>
					{isWaypoint && (
						<>
							<button
								type="button"
								onClick={() => onMovePoint(point.id, 'up')}
								disabled={!canMoveUp}
								aria-label="上に移動"
								className={clsx(buttonStyles.button, buttonStyles.sm, buttonStyles.secondary)}
								title="上に移動"
							>
								↑
							</button>
							<button
								type="button"
								onClick={() => onMovePoint(point.id, 'down')}
								disabled={!canMoveDown}
								aria-label="下に移動"
								className={clsx(buttonStyles.button, buttonStyles.sm, buttonStyles.secondary)}
								title="下に移動"
							>
								↓
							</button>
						</>
					)}
					<button
						type="button"
						onClick={() => onEditPoint(point.id)}
						aria-label="ポイントを編集"
						className={clsx(buttonStyles.button, buttonStyles.sm, buttonStyles.primary, buttonStyles.flex)}
					>
						編集
					</button>
					<button
						type="button"
						onClick={() => onDeletePoint(point.id)}
						aria-label="ポイントを削除"
						className={clsx(buttonStyles.button, buttonStyles.sm, buttonStyles.danger, buttonStyles.flex)}
					>
						削除
					</button>
				</div>
			)}
		</div>
	);
};

export default PointItem;
