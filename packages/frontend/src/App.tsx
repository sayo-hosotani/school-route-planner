import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const App = () => {
	return (
		<MapContainer
			center={[35.6812, 139.7671]}
			zoom={13}
			style={{ height: '100vh', width: '100vw' }}
		>
			<TileLayer
				attribution='<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>'
				url="https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png"
			/>
		</MapContainer>
	);
};

export default App;
