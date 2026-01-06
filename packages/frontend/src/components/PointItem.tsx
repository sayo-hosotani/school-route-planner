import clsx from 'clsx';
import { useCallback } from 'react';
import type { Point } from '../types/point';
import { getDisplayTitle } from '../utils/point-utils';
import { useCommentEditor } from '../hooks/use-comment-editor';
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
	mode: 'view' | 'edit';
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
	mode,
	isHighlighted,
	onPointClick,
	onEditPoint,
	onDeletePoint,
	onMovePoint,
	onUpdateComment,
}: PointItemProps) => {
	const handleSaveComment = useCallback(
		(comment: string) => {
			if (point) {
				onUpdateComment(point.id, comment);
			}
		},
		[point, onUpdateComment],
	);

	const {
		isExpanded,
		isEditing: isEditingComment,
		editingText: editingCommentText,
		toggleExpanded,
		startEditing,
		cancelEditing: handleCancelEditComment,
		saveComment: handleSaveCommentAndClose,
		setEditingText: setEditingCommentText,
	} = useCommentEditor({ onSave: handleSaveComment });

	const hasPoint = !!point;
	const isWaypoint = type === 'waypoint';

	const handleStartEditComment = () => {
		if (point) {
			startEditing(point.comment);
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
				{hasPoint && (
					<button
						type="button"
						onClick={toggleExpanded}
						className={styles.expandButton}
						title={isExpanded ? 'コメントを閉じる' : 'コメントを表示'}
					>
						{isExpanded ? '▲' : '▼'}
					</button>
				)}
			</div>

			{/* コメント表示・編集エリア */}
			{hasPoint && isExpanded && (
				<div className={styles.commentArea}>
					{mode === 'edit' && isEditingComment ? (
						<>
							<textarea
								value={editingCommentText}
								onChange={(e) => setEditingCommentText(e.target.value)}
								placeholder="コメントを入力してください（任意）&#13;&#10;1行目または最初の16文字が地図上のタイトルになります"
								className={styles.commentTextarea}
							/>
							<div className={styles.actions}>
								<button
									type="button"
									onClick={handleSaveCommentAndClose}
									aria-label="コメントを保存"
									className={clsx(buttonStyles.button, buttonStyles.sm, buttonStyles.success, buttonStyles.flex)}
								>
									保存
								</button>
								<button
									type="button"
									onClick={handleCancelEditComment}
									aria-label="コメント編集をキャンセル"
									className={clsx(buttonStyles.button, buttonStyles.sm, buttonStyles.secondary, buttonStyles.flex)}
								>
									キャンセル
								</button>
							</div>
						</>
					) : (
						<>
							<div className={styles.commentText}>
								{point.comment || 'コメントなし'}
							</div>
							{mode === 'edit' && (
								<button
									type="button"
									onClick={handleStartEditComment}
									aria-label="コメントを編集"
									className={clsx(buttonStyles.button, buttonStyles.sm, buttonStyles.primary)}
									style={{ marginTop: '4px' }}
								>
									編集
								</button>
							)}
						</>
					)}
				</div>
			)}

			{/* 操作ボタン（編集モード時のみ） */}
			{mode === 'edit' && hasPoint && (
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
