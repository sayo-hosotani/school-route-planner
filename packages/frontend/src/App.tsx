import { MapContainer, TileLayer, ScaleControl, AttributionControl, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import CoordinateDisplay from './components/CoordinateDisplay';
import RouteLine from './components/RouteLine';
import PointMarker from './components/PointMarker';
import FitBounds from './components/FitBounds';
import { samplePoints, sampleRouteLine } from './data/sample-route';

const App = () => {
	return (
		<MapContainer
			center={[35.628, 139.596]}
			zoom={14}
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

			{/* 経路全体を画面に収める */}
			<FitBounds positions={sampleRouteLine} />

			{/* サンプル経路とポイントを表示 */}
			<RouteLine positions={sampleRouteLine} />
			{samplePoints.map((point) => (
				<PointMarker key={point.id} point={point} />
			))}
		</MapContainer>
	);
};

export default App;
