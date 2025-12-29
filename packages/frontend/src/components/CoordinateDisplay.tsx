import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface CoordinateDisplayProps {
	position?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
}

const CoordinateDisplay = ({ position }: CoordinateDisplayProps) => {
	const map = useMap();

	useEffect(() => {
		const CoordinateControl = L.Control.extend({
			onAdd: () => {
				const container = L.DomUtil.create(
					'div',
					'leaflet-bar leaflet-control leaflet-control-custom',
				);

				container.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
				container.style.padding = '4px 8px';
				container.style.fontSize = '12px';
				container.style.fontFamily = 'monospace';

				const updateCoordinates = () => {
					const center = map.getCenter();
					const zoom = map.getZoom();
					container.innerHTML = `x: ${center.lng.toFixed(6)}, y: ${center.lat.toFixed(6)}, z: ${zoom}`;
				};

				updateCoordinates();
				map.on('move', updateCoordinates);
				map.on('zoom', updateCoordinates);

				return container;
			},
		});

		const control = new CoordinateControl({ position });
		control.addTo(map);

		return () => {
			control.remove();
		};
	}, [map, position]);

	return null;
};

export default CoordinateDisplay;
