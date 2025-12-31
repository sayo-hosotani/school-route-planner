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
}: SidebarProps) => {
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
		const backgroundColor = isHighlighted ? '#fff3cd' : hasPoint ? '#f8f9fa' : '#e9ecef';
		const borderColor = isHighlighted ? '#ffc107' : 'transparent';
		const isWaypoint = type === 'waypoint';

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
				<div style={{ marginBottom: '4px', fontWeight: isHighlighted ? 'bold' : 'normal' }}>
					{displayIndex}. {getPointTypeLabel(type, waypointNumber)}
					{isHighlighted && ' ← 地図をクリックして追加'}
					{!hasPoint && ' (未設定)'}
				</div>
				{hasPoint && point.comment && (
					<div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
						{point.comment}
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
