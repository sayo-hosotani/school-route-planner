import { Marker, Popup } from 'react-leaflet';
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
				<Popup>
					<div>
						<strong>
							{point.type === 'start' && 'スタート'}
							{point.type === 'waypoint' && '中継地点'}
							{point.type === 'goal' && 'ゴール'}
						</strong>
						<br />
						{point.comment && <p>{point.comment}</p>}
					</div>
				</Popup>
			)}
		</Marker>
	);
};

export default PointMarker;
