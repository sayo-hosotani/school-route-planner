import { MapContainer, TileLayer, ScaleControl, AttributionControl, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import CoordinateDisplay from './components/CoordinateDisplay';

const App = () => {
	return (
		<MapContainer
			center={[35.6812, 139.7671]}
			zoom={13}
			style={{ height: '100vh', width: '100vw' }}
			attributionControl={false}
			zoomControl={false}
		>
			<TileLayer
				attribution='<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>'
				url="https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png"
			/>
			<AttributionControl position="bottomleft" />
			<ZoomControl position="topright" />
			<CoordinateDisplay position="bottomright" />
			<ScaleControl position="bottomright" imperial={false} />
		</MapContainer>
	);
};

export default App;
