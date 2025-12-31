import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapCenterProps {
	center: [number, number] | null;
	zoom?: number;
}

const MapCenter = ({ center, zoom = 16 }: MapCenterProps) => {
	const map = useMap();

	useEffect(() => {
		if (center) {
			map.setView(center, zoom, { animate: true });
		}
	}, [center, zoom, map]);

	return null;
};

export default MapCenter;
