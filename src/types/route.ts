import type { Point } from './point';

export interface RouteData {
	points: Point[];
	routeLine: [number, number][];
	created_at?: string;
	updated_at?: string;
}
