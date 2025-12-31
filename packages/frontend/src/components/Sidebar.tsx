import { useState } from 'react';
import type { Point } from '../types/point';

interface SidebarProps {
	mode: 'view' | 'edit';
	onModeChange: (mode: 'view' | 'edit') => void;
	points: Point[];
	onSave: () => void;
	onLoad: () => void;
	onClearPoints: () => void;
	onEditPoint: (pointId: string) => void;
	onDeletePoint: (pointId: string) => void;
	onMovePoint: (pointId: string, direction: 'up' | 'down') => void;
	onPointClick: (pointId: string) => void;
	onUpdateComment: (pointId: string, comment: string) => void;
	highlightedPointId: string | null;
}

const Sidebar = ({
	mode,
	onModeChange,
	points,
	onSave,
	onLoad,
	onClearPoints,
	onEditPoint,
	onDeletePoint,
	onMovePoint,
	onPointClick,
	onUpdateComment,
	highlightedPointId,
}: SidebarProps) => {
	const [expandedPointId, setExpandedPointId] = useState<string | null>(null);
	const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
	const [editingCommentText, setEditingCommentText] = useState('');
	const getPointTypeLabel = (type: Point['type'], waypointNumber?: number) => {
		switch (type) {
			case 'start':
				return '🟢 スタート';
			case 'waypoint':
				return waypointNumber !== undefined ? `🔵 中継地点${waypointNumber}` : '🔵 中継地点';
			case 'goal':
				return '🔴 ゴール';
		}
	};

	const getDisplayTitle = (point: Point | undefined | null, type: Point['type'], waypointNumber?: number) => {
		if (!point || !point.comment) {
			return getPointTypeLabel(type, waypointNumber);
		}
		// コメントの1行目または最初の16文字を取得
		const firstLine = point.comment.split('\n')[0];
		if (firstLine.length <= 16) {
			return firstLine;
		}
		return firstLine.substring(0, 16);
	};

	// コメント編集の開始
	const handleStartEditComment = (point: Point) => {
		setEditingCommentId(point.id);
		setEditingCommentText(point.comment);
	};

	// コメント編集の保存
	const handleSaveComment = (pointId: string) => {
		onUpdateComment(pointId, editingCommentText);
		setEditingCommentId(null);
		setEditingCommentText('');
	};

	// コメント編集のキャンセル
	const handleCancelEditComment = () => {
		setEditingCommentId(null);
		setEditingCommentText('');
	};

	// ポイント項目をレンダリングする関数
	const renderPointItem = (
		point: Point | undefined | null,
		type: Point['type'],
		displayIndex: number,
		isHighlighted: boolean,
		waypointNumber?: number,
		canMoveUp?: boolean,
		canMoveDown?: boolean,
	) => {
		const hasPoint = !!point;
		const isPointHighlighted = hasPoint && point.id === highlightedPointId;
		const backgroundColor = isHighlighted
			? '#fff3cd'
			: isPointHighlighted
				? '#e3f2fd'
				: hasPoint
					? '#f8f9fa'
					: '#e9ecef';
		const borderColor = isHighlighted ? '#ffc107' : isPointHighlighted ? '#2196f3' : 'transparent';
		const isWaypoint = type === 'waypoint';
		const isExpanded = hasPoint && expandedPointId === point.id;
		const isEditingComment = hasPoint && editingCommentId === point.id;

		return (
			<div
				key={point?.id || `empty-${type}-${displayIndex}`}
				style={{
					padding: '8px',
					backgroundColor,
					border: `2px solid ${borderColor}`,
					borderRadius: '4px',
					fontSize: '14px',
					opacity: hasPoint ? 1 : 0.6,
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						marginBottom: '4px',
						fontWeight: isHighlighted || isPointHighlighted ? 'bold' : 'normal',
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
						{isHighlighted && ' ← 地図をクリックして追加'}
					</button>
					{hasPoint && (
						<button
							type="button"
							onClick={() => setExpandedPointId(isExpanded ? null : point.id)}
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

				{/* 展開時のコメント表示・編集エリア */}
				{hasPoint && isExpanded && (
					<div style={{ marginBottom: '4px', padding: '8px', backgroundColor: '#fff', borderRadius: '4px' }}>
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
										onClick={() => handleSaveComment(point.id)}
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
										onClick={() => handleStartEditComment(point)}
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

	return (
		<div
			style={{
				position: 'absolute',
				top: '10px',
				left: '10px',
				zIndex: 1000,
				background: 'white',
				padding: '16px',
				borderRadius: '8px',
				boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
				width: '300px',
				maxHeight: 'calc(100vh - 20px)',
				overflowY: 'auto',
			}}
		>
			{/* モード切り替えボタン */}
			<div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
				<button
					type="button"
					onClick={() => onModeChange('view')}
					style={{
						flex: 1,
						padding: '8px 16px',
						cursor: 'pointer',
						backgroundColor: mode === 'view' ? '#007bff' : '#f0f0f0',
						color: mode === 'view' ? 'white' : 'black',
						border: 'none',
						borderRadius: '4px',
						fontWeight: mode === 'view' ? 'bold' : 'normal',
					}}
				>
					通常モード
				</button>
				<button
					type="button"
					onClick={() => onModeChange('edit')}
					style={{
						flex: 1,
						padding: '8px 16px',
						cursor: 'pointer',
						backgroundColor: mode === 'edit' ? '#007bff' : '#f0f0f0',
						color: mode === 'edit' ? 'white' : 'black',
						border: 'none',
						borderRadius: '4px',
						fontWeight: mode === 'edit' ? 'bold' : 'normal',
					}}
				>
					編集モード
				</button>
			</div>

			{/* 通常モードの機能 */}
			{mode === 'view' && (
				<div style={{ marginBottom: '16px' }}>
					<h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>通常モード</h3>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
						<button
							type="button"
							onClick={onSave}
							style={{
								padding: '8px 16px',
								cursor: 'pointer',
								backgroundColor: '#28a745',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
							}}
						>
							現在の経路を保存
						</button>
						<button
							type="button"
							onClick={onLoad}
							style={{
								padding: '8px 16px',
								cursor: 'pointer',
								backgroundColor: '#17a2b8',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
							}}
						>
							保存済み経路を読み込む
						</button>
					</div>
				</div>
			)}

			{/* 編集モードの機能 */}
			{mode === 'edit' && (
				<div style={{ marginBottom: '16px' }}>
					<h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>編集モード</h3>
					<button
						type="button"
						onClick={onClearPoints}
						style={{
							width: '100%',
							padding: '8px 16px',
							cursor: 'pointer',
							backgroundColor: '#dc3545',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
						}}
					>
						全ポイントをクリア
					</button>
				</div>
			)}

			{/* ポイント一覧 */}
			<div>
				<h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
					現在のポイント一覧 ({points.length})
				</h3>
				<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
					{/* スタート地点（固定表示） */}
					{renderPointItem(
						points.find((p) => p.type === 'start'),
						'start',
						1,
						points.length === 0,
					)}

					{/* 中継地点 */}
					{points
						.filter((p) => p.type === 'waypoint')
						.map((point, waypointIndex, waypointArray) => {
							const overallIndex = 2 + waypointIndex;
							const waypointNumber = waypointIndex + 1;
							const canMoveUp = waypointIndex > 0;
							const canMoveDown = waypointIndex < waypointArray.length - 1;
							return renderPointItem(
								point,
								'waypoint',
								overallIndex,
								false,
								waypointNumber,
								canMoveUp,
								canMoveDown,
							);
						})}

					{/* 次の中継地点入力欄（編集モード かつ スタートとゴールが存在する場合のみ） */}
					{mode === 'edit' &&
						points.length >= 2 &&
						renderPointItem(
							null,
							'waypoint',
							points.length,
							true,
							points.filter((p) => p.type === 'waypoint').length + 1,
						)}

					{/* ゴール地点（固定表示） */}
					{renderPointItem(
						points.find((p) => p.type === 'goal'),
						'goal',
						points.length >= 2 ? points.length + 1 : 2,
						points.length === 1,
					)}
				</div>
			</div>
		</div>
	);
};

export default Sidebar;
