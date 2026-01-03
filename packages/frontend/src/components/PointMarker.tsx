import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { Point } from '../types/point';

interface PointMarkerProps {
	point: Point;
	editMode: boolean;
	onDragEnd?: (pointId: string, lat: number, lng: number) => void;
	onClick?: (pointId: string) => void;
}

const getMarkerIcon = (type: Point['type']) => {
	const color = type === 'start' ? 'green' : type === 'goal' ? 'blue' : 'red';
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

const getDisplayTitle = (point: Point): string => {
	if (!point.comment) {
		if (point.type === 'start') return 'スタート';
		if (point.type === 'waypoint') return '中継地点';
		if (point.type === 'goal') return 'ゴール';
		return '';
	}
	const firstLine = point.comment.split('\n')[0];
	return firstLine.length <= 16 ? firstLine : firstLine.substring(0, 16);
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
							{getDisplayTitle(point)}
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
