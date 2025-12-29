import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Point } from '../types/point';

interface PointMarkerProps {
	point: Point;
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

const PointMarker = ({ point }: PointMarkerProps) => {
	return (
		<Marker position={[point.lat, point.lng]} icon={getMarkerIcon(point.type)}>
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
		</Marker>
	);
};

export default PointMarker;
