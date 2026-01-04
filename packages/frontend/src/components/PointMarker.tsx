import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { Point } from '../types/point';
import { getMarkerDisplayTitle } from '../utils/point-utils';
import { MARKER_COLORS } from '../constants/colors';

interface PointMarkerProps {
	point: Point;
	editMode: boolean;
	onDragEnd?: (pointId: string, lat: number, lng: number) => void;
	onClick?: (pointId: string) => void;
}

const getMarkerIcon = (type: Point['type']) => {
	const color = type === 'start' ? MARKER_COLORS.START : type === 'goal' ? MARKER_COLORS.GOAL : MARKER_COLORS.WAYPOINT;
	return L.divIcon({
		className: 'custom-marker',
		html: `<div style="
			background-color: ${color};
			width: 24px;
			height: 24px;
			border-radius: 50%;
			border: 2px solid white;
			box-shadow: 0 2px 5px rgba(0,0,0,0.3);
		"></div>`,
		iconSize: [24, 24],
		iconAnchor: [12, 12],
	});
};

const PointMarker = ({ point, editMode, onDragEnd, onClick }: PointMarkerProps) => {
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
			{!editMode && (
				<Tooltip
					permanent
					direction="top"
					offset={[0, -12]}
					className="point-tooltip"
				>
					<div style={{
						padding: '4px 8px',
						maxWidth: '200px',
					}}>
						<strong style={{ display: 'block', marginBottom: point.comment ? '4px' : '0' }}>
							{getMarkerDisplayTitle(point)}
						</strong>
						{point.comment && (
							<div style={{
								fontSize: '12px',
								color: '#666',
								whiteSpace: 'pre-wrap',
								wordBreak: 'break-word',
							}}>
								{point.comment}
							</div>
						)}
					</div>
				</Tooltip>
			)}
		</Marker>
	);
};

export default PointMarker;
