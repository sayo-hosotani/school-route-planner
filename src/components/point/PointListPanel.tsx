import { memo, useCallback } from 'react';
import type { Point } from '../../types/point';
import type { PointHandlers } from '../../types/handlers';
import type { GeocodingResult } from '../../api/geocoding-client';
import PointItem from './PointItem';
import AddressSearchInput from '../address/AddressSearchInput';
import styles from './PointListPanel.module.css';

interface PointListPanelProps {
	points: Point[];
	highlightedPointId: string | null;
	pointHandlers: PointHandlers;
	onAddPointFromAddress: (lat: number, lng: number, comment: string) => void;
	onMessage: (message: string, type?: 'success' | 'error') => void;
}

const PointListPanel = memo(({
	points,
	highlightedPointId,
	pointHandlers,
	onAddPointFromAddress,
	onMessage,
}: PointListPanelProps) => {
	const startPoint = points.find((p) => p.type === 'start') || null;
	const goalPoint = points.find((p) => p.type === 'goal') || null;
	const waypoints = points.filter((p) => p.type === 'waypoint');

	const handleAddressSelect = useCallback((result: GeocodingResult) => {
		onAddPointFromAddress(result.lat, result.lng, result.address);
	}, [onAddPointFromAddress]);

	const handleAddressError = useCallback((message: string) => {
		onMessage(message, 'error');
	}, [onMessage]);

	return (
		<div className={styles.panel}>
			<div className={styles.header}>
				<h3 className={styles.title}>ポイントの一覧</h3>
			</div>

			{/* 住所検索入力欄 */}
			<div className={styles.addressSearch}>
				<AddressSearchInput
					onSelect={handleAddressSelect}
					onError={handleAddressError}
					placeholder="住所から追加"
					compact
				/>
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
