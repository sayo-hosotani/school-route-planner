import type { Point } from '../types/point';
import PointItem from './PointItem';
import SavedRouteList from './SavedRouteList';

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
