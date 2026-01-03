import { useState } from 'react';
import type { Point } from '../types/point';

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

const getPointTypeLabel = (type: Point['type'], waypointNumber?: number) => {
	switch (type) {
		case 'start':
			return '🟢 スタート';
		case 'waypoint':
			return waypointNumber !== undefined ? `🔴 中継地点${waypointNumber}` : '🔴 中継地点';
		case 'goal':
			return '🔵 ゴール';
	}
};

const getDisplayTitle = (
	point: Point | null,
	type: Point['type'],
	waypointNumber?: number,
) => {
	if (!point || !point.comment) {
		return getPointTypeLabel(type, waypointNumber);
	}
	const firstLine = point.comment.split('\n')[0];
	if (firstLine.length <= 16) {
		return firstLine;
	}
	return firstLine.substring(0, 16);
};

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
		? '#fff3cd'
		: isHighlighted
			? '#e3f2fd'
			: hasPoint
				? '#f8f9fa'
				: '#e9ecef';
	const borderColor = isNextToAdd ? '#ffc107' : isHighlighted ? '#2196f3' : 'transparent';

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
									style={{
										flex: 1,
										padding: '4px 8px',
										fontSize: '12px',
										cursor: 'pointer',
										backgroundColor: '#28a745',
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
									style={{
										flex: 1,
										padding: '4px 8px',
										fontSize: '12px',
										cursor: 'pointer',
										backgroundColor: '#6c757d',
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
									style={{
										padding: '4px 8px',
										fontSize: '12px',
										cursor: 'pointer',
										backgroundColor: '#007bff',
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
								style={{
									padding: '4px 8px',
									fontSize: '12px',
									cursor: canMoveUp ? 'pointer' : 'not-allowed',
									backgroundColor: canMoveUp ? '#6c757d' : '#e9ecef',
									color: canMoveUp ? 'white' : '#adb5bd',
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
								style={{
									padding: '4px 8px',
									fontSize: '12px',
									cursor: canMoveDown ? 'pointer' : 'not-allowed',
									backgroundColor: canMoveDown ? '#6c757d' : '#e9ecef',
									color: canMoveDown ? 'white' : '#adb5bd',
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
						style={{
							flex: 1,
							padding: '4px 8px',
							fontSize: '12px',
							cursor: 'pointer',
							backgroundColor: '#007bff',
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
						style={{
							flex: 1,
							padding: '4px 8px',
							fontSize: '12px',
							cursor: 'pointer',
							backgroundColor: '#dc3545',
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
