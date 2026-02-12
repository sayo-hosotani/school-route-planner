import type { SavedRoute } from '../api/route-api';
import type { Point } from '../types/point';

export const createTestPoint = (overrides: Partial<Point> = {}): Point => ({
	id: `point-${Math.random().toString(36).slice(2, 9)}`,
	lat: 35.6762,
	lng: 139.6503,
	type: 'waypoint',
	order: 0,
	comment: '',
	created_at: '2024-01-01T00:00:00.000Z',
	updated_at: '2024-01-01T00:00:00.000Z',
	...overrides,
});

export const createTestSavedRoute = (overrides: Partial<SavedRoute> = {}): SavedRoute => ({
	id: 'test-route-1',
	name: 'テスト経路',
	routeLine: [[35.6762, 139.6503], [35.6800, 139.6550]],
	points: [
		createTestPoint({ id: 'p1', type: 'start', order: 0 }),
		createTestPoint({ id: 'p2', type: 'goal', order: 1 }),
	],
	created_at: '2024-01-01T00:00:00.000Z',
	updated_at: '2024-01-01T00:00:00.000Z',
	...overrides,
});
