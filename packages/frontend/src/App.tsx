import { useState } from 'react';
import { MapContainer, TileLayer, ScaleControl, AttributionControl, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import CoordinateDisplay from './components/CoordinateDisplay';
import RouteLine from './components/RouteLine';
import PointMarker from './components/PointMarker';
import FitBounds from './components/FitBounds';
import { samplePoints, sampleRouteLine } from './data/sample-route';
import { saveRoute, loadRoute } from './api/route-api';
import type { Point } from './types/point';

const App = () => {
	const [points, setPoints] = useState<Point[]>(samplePoints);
	const [routeLine, setRouteLine] = useState<[number, number][]>(sampleRouteLine);
	const [message, setMessage] = useState<string>('');

	const handleSave = async () => {
		try {
			const result = await saveRoute({
				points,
				routeLine,
			});
			if (result.success) {
				setMessage('経路を保存しました');
				setTimeout(() => setMessage(''), 3000);
			}
		} catch (error) {
			setMessage('保存に失敗しました');
			setTimeout(() => setMessage(''), 3000);
		}
	};

	const handleLoad = async () => {
		try {
			const result = await loadRoute();
			if (result.success && result.data) {
				setPoints(result.data.points);
				setRouteLine(result.data.routeLine);
				setMessage('経路を読み込みました');
				setTimeout(() => setMessage(''), 3000);
			} else {
				setMessage('保存された経路が見つかりません');
				setTimeout(() => setMessage(''), 3000);
			}
		} catch (error) {
			setMessage('読み込みに失敗しました');
			setTimeout(() => setMessage(''), 3000);
		}
	};

	return (
		<div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
			{/* コントロールパネル */}
			<div
				style={{
					position: 'absolute',
					top: '10px',
					left: '10px',
					zIndex: 1000,
					background: 'white',
					padding: '10px',
					borderRadius: '4px',
					boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
				}}
			>
				<div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
					<button type="button" onClick={handleSave} style={{ padding: '8px 16px', cursor: 'pointer' }}>
						保存
					</button>
					<button type="button" onClick={handleLoad} style={{ padding: '8px 16px', cursor: 'pointer' }}>
						読み込み
					</button>
				</div>
				{message && (
					<div style={{ fontSize: '14px', color: message.includes('失敗') ? 'red' : 'green' }}>
						{message}
					</div>
				)}
			</div>

			{/* 地図 */}
			<MapContainer
				center={[35.628, 139.596]}
				zoom={14}
				style={{ height: '100%', width: '100%' }}
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
				<FitBounds positions={routeLine} />

				{/* 経路とポイントを表示 */}
				<RouteLine positions={routeLine} />
				{points.map((point) => (
					<PointMarker key={point.id} point={point} />
				))}
			</MapContainer>
		</div>
	);
};

export default App;
