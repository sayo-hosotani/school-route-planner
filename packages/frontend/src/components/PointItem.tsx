import { useState } from 'react';
import type { Point } from '../types/point';
import { getDisplayTitle } from '../utils/point-utils';
import { COLORS } from '../constants/colors';

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
	const [isExpanded, setIsExpanded] = useState(false);
	const [isEditingComment, setIsEditingComment] = useState(false);
	const [editingCommentText, setEditingCommentText] = useState('');

	const hasPoint = !!point;
	const isWaypoint = type === 'waypoint';

	const backgroundColor = isNextToAdd
		? COLORS.BG_WARNING
		: isHighlighted
			? COLORS.BG_HIGHLIGHT
			: hasPoint
				? COLORS.BG_LIGHT
				: COLORS.BG_MUTED;
	const borderColor = isNextToAdd ? COLORS.BORDER_WARNING : isHighlighted ? COLORS.BORDER_HIGHLIGHT : 'transparent';

	const handleStartEditComment = () => {
		if (point) {
			setIsEditingComment(true);
			setEditingCommentText(point.comment);
		}
	};

	const handleSaveComment = () => {
		if (point) {
			onUpdateComment(point.id, editingCommentText);
			setIsEditingComment(false);
			setEditingCommentText('');
		}
	};

	const handleCancelEditComment = () => {
		setIsEditingComment(false);
		setEditingCommentText('');
	};

	return (
		<div
			style={{
				padding: '8px',
				backgroundColor,
				border: `2px solid ${borderColor}`,
				borderRadius: '4px',
				fontSize: '14px',
				opacity: hasPoint ? 1 : 0.6,
			}}
		>
			{/* ヘッダー行 */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					marginBottom: '4px',
					fontWeight: isNextToAdd || isHighlighted ? 'bold' : 'normal',
				}}
			>
				<button
					type="button"
					onClick={() => hasPoint && onPointClick(point.id)}
					disabled={!hasPoint}
					style={{
						flex: 1,
						cursor: hasPoint ? 'pointer' : 'default',
						backgroundColor: 'transparent',
						border: 'none',
						textAlign: 'left',
						padding: 0,
						fontSize: '14px',
						fontWeight: 'inherit',
					}}
				>
					{displayIndex}. {getDisplayTitle(point, type, waypointNumber)}
					{isNextToAdd && ' ← 地図をクリックして追加'}
				</button>
				{hasPoint && (
					<button
						type="button"
						onClick={() => setIsExpanded(!isExpanded)}
						style={{
							padding: '2px 6px',
							fontSize: '12px',
							cursor: 'pointer',
							backgroundColor: 'transparent',
							border: 'none',
							color: '#666',
						}}
						title={isExpanded ? 'コメントを閉じる' : 'コメントを表示'}
					>
						{isExpanded ? '▲' : '▼'}
					</button>
				)}
			</div>

			{/* コメント表示・編集エリア */}
			{hasPoint && isExpanded && (
				<div
					style={{
						marginBottom: '4px',
						padding: '8px',
						backgroundColor: '#fff',
						borderRadius: '4px',
					}}
				>
					{mode === 'edit' && isEditingComment ? (
						<>
							<textarea
								value={editingCommentText}
								onChange={(e) => setEditingCommentText(e.target.value)}
								placeholder="コメントを入力してください（任意）&#13;&#10;1行目または最初の16文字が地図上のタイトルになります"
								style={{
									width: '100%',
									minHeight: '60px',
									padding: '6px',
									fontSize: '12px',
									border: '1px solid #ccc',
									borderRadius: '4px',
									resize: 'vertical',
									boxSizing: 'border-box',
									marginBottom: '4px',
								}}
							/>
							<div style={{ display: 'flex', gap: '4px' }}>
								<button
									type="button"
									onClick={handleSaveComment}
									aria-label="コメントを保存"
									style={{
										flex: 1,
										padding: '4px 8px',
										fontSize: '12px',
										cursor: 'pointer',
										backgroundColor: COLORS.SUCCESS,
										color: 'white',
										border: 'none',
										borderRadius: '4px',
									}}
								>
									保存
								</button>
								<button
									type="button"
									onClick={handleCancelEditComment}
									aria-label="コメント編集をキャンセル"
									style={{
										flex: 1,
										padding: '4px 8px',
										fontSize: '12px',
										cursor: 'pointer',
										backgroundColor: COLORS.SECONDARY,
										color: 'white',
										border: 'none',
										borderRadius: '4px',
									}}
								>
									キャンセル
								</button>
							</div>
						</>
					) : (
						<>
							<div style={{ fontSize: '12px', color: '#333', whiteSpace: 'pre-wrap' }}>
								{point.comment || 'コメントなし'}
							</div>
							{mode === 'edit' && (
								<button
									type="button"
									onClick={handleStartEditComment}
									aria-label="コメントを編集"
									style={{
										padding: '4px 8px',
										fontSize: '12px',
										cursor: 'pointer',
										backgroundColor: COLORS.PRIMARY,
										color: 'white',
										border: 'none',
										borderRadius: '4px',
										marginTop: '4px',
									}}
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
				<div style={{ display: 'flex', gap: '4px' }}>
					{isWaypoint && (
						<>
							<button
								type="button"
								onClick={() => onMovePoint(point.id, 'up')}
								disabled={!canMoveUp}
								aria-label="上に移動"
								style={{
									padding: '4px 8px',
									fontSize: '12px',
									cursor: canMoveUp ? 'pointer' : 'not-allowed',
									backgroundColor: canMoveUp ? COLORS.SECONDARY : COLORS.DISABLED_BG,
									color: canMoveUp ? 'white' : COLORS.DISABLED_TEXT,
									border: 'none',
									borderRadius: '4px',
								}}
								title="上に移動"
							>
								↑
							</button>
							<button
								type="button"
								onClick={() => onMovePoint(point.id, 'down')}
								disabled={!canMoveDown}
								aria-label="下に移動"
								style={{
									padding: '4px 8px',
									fontSize: '12px',
									cursor: canMoveDown ? 'pointer' : 'not-allowed',
									backgroundColor: canMoveDown ? COLORS.SECONDARY : COLORS.DISABLED_BG,
									color: canMoveDown ? 'white' : COLORS.DISABLED_TEXT,
									border: 'none',
									borderRadius: '4px',
								}}
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
						style={{
							flex: 1,
							padding: '4px 8px',
							fontSize: '12px',
							cursor: 'pointer',
							backgroundColor: COLORS.PRIMARY,
							color: 'white',
							border: 'none',
							borderRadius: '4px',
						}}
					>
						編集
					</button>
					<button
						type="button"
						onClick={() => onDeletePoint(point.id)}
						aria-label="ポイントを削除"
						style={{
							flex: 1,
							padding: '4px 8px',
							fontSize: '12px',
							cursor: 'pointer',
							backgroundColor: COLORS.DANGER,
							color: 'white',
							border: 'none',
							borderRadius: '4px',
						}}
					>
						削除
					</button>
				</div>
			)}
		</div>
	);
};

export default PointItem;
