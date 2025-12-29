import { Polyline } from 'react-leaflet';

interface RouteLineProps {
	positions: [number, number][];
}

const RouteLine = ({ positions }: RouteLineProps) => {
	return <Polyline positions={positions} color="red" weight={5} opacity={0.7} />;
};

export default RouteLine;
