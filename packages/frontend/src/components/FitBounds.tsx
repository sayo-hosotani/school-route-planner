import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface FitBoundsProps {
	positions: [number, number][];
}

const FitBounds = ({ positions }: FitBoundsProps) => {
	const map = useMap();

	useEffect(() => {
		if (positions.length === 0) return;

		const bounds = L.latLngBounds(positions);
		map.fitBounds(bounds, {
			padding: [50, 50], // 周囲に50pxの余白を追加
		});
	}, [map, positions]);

	return null;
};

export default FitBounds;
