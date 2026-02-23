import { useMapEvents } from 'react-leaflet';
import type { Point } from '../../types/point';

const NEARBY_PIXEL_THRESHOLD = 20;

interface MapClickHandlerProps {
	enabled: boolean;
	points: Point[];
	onMapClick: (lat: number, lng: number) => void;
	onNearbyPointClick: (pointId: string) => void;
}

const MapClickHandler = ({
	enabled,
	points,
	onMapClick,
	onNearbyPointClick,
}: MapClickHandlerProps) => {
	const map = useMapEvents({
		click: (e) => {
			if (!enabled) return;

			// クリック位置のピクセル座標
			const clickPx = map.latLngToLayerPoint(e.latlng);

			// 既存ポイントの中で閾値以内に近いものを探す
			const nearby = points.find((p) => {
				const pointPx = map.latLngToLayerPoint([p.lat, p.lng]);
				const dx = clickPx.x - pointPx.x;
				const dy = clickPx.y - pointPx.y;
				return Math.sqrt(dx * dx + dy * dy) <= NEARBY_PIXEL_THRESHOLD;
			});

			if (nearby) {
				// 近傍に既存ポイントがあれば編集モーダルを開く
				onNearbyPointClick(nearby.id);
			} else {
				onMapClick(e.latlng.lat, e.latlng.lng);
			}
		},
	});

	return null;
};

export default MapClickHandler;
