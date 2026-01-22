import { memo } from 'react';
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

const PointItem = memo(({
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

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!hasPoint) return;

		// Enter: ポイントをクリック（地図上でハイライト）
		if (e.key === 'Enter') {
			e.preventDefault();
			onPointClick(point.id);
		}

		// e: 編集
		if (e.key === 'e' && !e.ctrlKey && !e.metaKey) {
			e.preventDefault();
			onEditPoint(point.id);
		}

		// Delete: 削除
		if (e.key === 'Delete') {
			e.preventDefault();
			onDeletePoint(point.id);
		}

		// 中継地点の移動
		if (isWaypoint) {
			if (e.key === 'ArrowUp' && canMoveUp) {
				e.preventDefault();
				onMovePoint(point.id, 'up');
			}
			if (e.key === 'ArrowDown' && canMoveDown) {
				e.preventDefault();
				onMovePoint(point.id, 'down');
			}
		}
	};

	const containerClassName = clsx(
		styles.container,
		!hasPoint && styles.containerEmpty,
		hasPoint && !isNextToAdd && !isHighlighted && styles.containerDefault,
		isHighlighted && styles.containerHighlighted,
		isNextToAdd && styles.containerNextToAdd
	);

	return (
		<li
			className={containerClassName}
			tabIndex={hasPoint ? 0 : -1}
			onKeyDown={handleKeyDown}
			aria-label={hasPoint ? `${displayIndex}. ${getDisplayTitle(point, type, waypointNumber)}` : undefined}
		>
			{/* ヘッダー行 */}
			<div className={clsx(styles.header, (isNextToAdd || isHighlighted) && styles.headerBold)}>
				<button
					type="button"
					onClick={() => hasPoint && onPointClick(point.id)}
					disabled={!hasPoint}
					tabIndex={-1}
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
								tabIndex={-1}
								aria-label="上に移動（矢印キー↑でも操作可）"
								className={clsx(buttonStyles.button, buttonStyles.sm, buttonStyles.secondary)}
								title="上に移動（矢印キー↑）"
							>
								↑
							</button>
							<button
								type="button"
								onClick={() => onMovePoint(point.id, 'down')}
								disabled={!canMoveDown}
								tabIndex={-1}
								aria-label="下に移動（矢印キー↓でも操作可）"
								className={clsx(buttonStyles.button, buttonStyles.sm, buttonStyles.secondary)}
								title="下に移動（矢印キー↓）"
							>
								↓
							</button>
						</>
					)}
					<button
						type="button"
						onClick={() => onEditPoint(point.id)}
						tabIndex={-1}
						aria-label="ポイントを編集（Eキーでも操作可）"
						className={clsx(buttonStyles.button, buttonStyles.sm, buttonStyles.primary, buttonStyles.flex)}
						title="編集（Eキー）"
					>
						編集
					</button>
					<button
						type="button"
						onClick={() => onDeletePoint(point.id)}
						tabIndex={-1}
						aria-label="ポイントを削除（Deleteキーでも操作可）"
						className={clsx(buttonStyles.button, buttonStyles.sm, buttonStyles.danger, buttonStyles.flex)}
						title="削除（Deleteキー）"
					>
						削除
					</button>
				</div>
			)}
		</li>
	);
});

PointItem.displayName = 'PointItem';

export default PointItem;
