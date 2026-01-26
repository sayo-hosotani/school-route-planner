import { memo } from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { Point } from '../../types/point';
import styles from './PointMarker.module.css';

interface PointMarkerProps {
	point: Point;
	editMode: boolean;
	onDragEnd?: (pointId: string, lat: number, lng: number) => void;
	onClick?: (pointId: string) => void;
}

const getMarkerClassName = (type: Point['type']) => {
	switch (type) {
		case 'start':
			return 'custom-marker-start';
		case 'goal':
			return 'custom-marker-goal';
		default:
			return 'custom-marker-waypoint';
	}
};

const getMarkerIcon = (type: Point['type']) => {
	const className = getMarkerClassName(type);
	return L.divIcon({
		className: 'custom-marker',
		html: `<div class="${className}"></div>`,
		iconSize: [24, 24],
		iconAnchor: [12, 12],
	});
};

const PointMarker = memo(({ point, editMode, onDragEnd, onClick }: PointMarkerProps) => {
	const handleDragEnd = (e: L.DragEndEvent) => {
		const marker = e.target;
		const position = marker.getLatLng();
		if (onDragEnd) {
			onDragEnd(point.id, position.lat, position.lng);
		}
	};

	const handleClick = () => {
		if (editMode && onClick) {
			onClick(point.id);
		}
	};

	return (
		<Marker
			position={[point.lat, point.lng]}
			icon={getMarkerIcon(point.type)}
			draggable={editMode}
			eventHandlers={{
				dragend: handleDragEnd,
				click: handleClick,
			}}
		>
			{point.comment && (
				<Tooltip
					permanent
					direction="top"
					offset={[0, -12]}
					className="point-tooltip"
				>
					<div className={styles.tooltipContent}>
						<div className={styles.tooltipComment}>{point.comment}</div>
					</div>
				</Tooltip>
			)}
		</Marker>
	);
});

PointMarker.displayName = 'PointMarker';

export default PointMarker;
