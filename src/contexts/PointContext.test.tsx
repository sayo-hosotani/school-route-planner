import { renderHook, act } from '@testing-library/react';
import { createTestPoint } from '../test/helpers';
import { AppProvider } from './AppContext';
import { PointProvider, usePointContext } from './PointContext';

vi.mock('../api/route-api', () => ({
	generateRoute: vi.fn(),
}));

import { generateRoute } from '../api/route-api';

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<AppProvider>
		<PointProvider>{children}</PointProvider>
	</AppProvider>
);

describe('PointProvider', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(generateRoute).mockResolvedValue({
			coordinates: [[139.6503, 35.6762], [139.655, 35.68]],
			distance: 0.5,
			duration: 300,
			summary: { has_toll: false, has_highway: false, has_ferry: false },
		});
	});

	it('子コンポーネントにポイントとルートラインを提供する', () => {
		const { result } = renderHook(() => usePointContext(), { wrapper });

		expect(result.current.points).toEqual([]);
		expect(result.current.routeLine).toEqual([]);
	});

	it('addPointでポイント追加後に経路を生成する', async () => {
		const { result } = renderHook(() => usePointContext(), { wrapper });

		await act(async () => {
			await result.current.addPoint(35.6762, 139.6503);
		});

		expect(result.current.points).toHaveLength(1);
		expect(result.current.points[0].type).toBe('start');
	});

	it('addPointで追加されたポイントのIDを返す', async () => {
		const { result } = renderHook(() => usePointContext(), { wrapper });

		let pointId: string;
		await act(async () => {
			pointId = await result.current.addPoint(35.6762, 139.6503);
		});

		expect(pointId!).toBeTruthy();
		expect(result.current.points[0].id).toBe(pointId!);
	});

	it('clearPointsでポイントとルートラインをクリアする', async () => {
		const { result } = renderHook(() => usePointContext(), { wrapper });

		await act(async () => {
			await result.current.addPoint(35.6762, 139.6503);
		});

		act(() => {
			result.current.clearPoints();
		});

		expect(result.current.points).toEqual([]);
		expect(result.current.routeLine).toEqual([]);
	});

	it('loadRouteでポイントとルートラインを一括設定する', () => {
		const { result } = renderHook(() => usePointContext(), { wrapper });

		const points = [
			createTestPoint({ id: 'p1', type: 'start', order: 0 }),
			createTestPoint({ id: 'p2', type: 'goal', order: 1 }),
		];
		const routeLine: [number, number][] = [[35.6762, 139.6503], [35.68, 139.655]];

		act(() => {
			result.current.loadRoute(points, routeLine);
		});

		expect(result.current.points).toHaveLength(2);
		expect(result.current.routeLine).toEqual(routeLine);
	});

	it('findPointで指定IDのポイントを返す', async () => {
		const { result } = renderHook(() => usePointContext(), { wrapper });

		await act(async () => {
			await result.current.addPoint(35.6762, 139.6503);
		});

		const pointId = result.current.points[0].id;
		const found = result.current.findPoint(pointId);
		expect(found).toBeDefined();
		expect(found?.lat).toBe(35.6762);
	});

	it('hasStartAndGoalがスタートとゴールの存在を確認する', async () => {
		const { result } = renderHook(() => usePointContext(), { wrapper });

		expect(result.current.hasStartAndGoal()).toBe(false);

		await act(async () => {
			await result.current.addPoint(35.6762, 139.6503);
		});

		expect(result.current.hasStartAndGoal()).toBe(false);

		await act(async () => {
			await result.current.addPoint(35.68, 139.655);
		});

		expect(result.current.hasStartAndGoal()).toBe(true);
	});

	it('deletePointでポイント削除後に経路を再生成する', async () => {
		const { result } = renderHook(() => usePointContext(), { wrapper });

		const points = [
			createTestPoint({ id: 'p1', type: 'start', order: 0 }),
			createTestPoint({ id: 'p2', type: 'waypoint', order: 1 }),
			createTestPoint({ id: 'p3', type: 'goal', order: 2 }),
		];
		const routeLine: [number, number][] = [[35.67, 139.65], [35.68, 139.66]];

		act(() => {
			result.current.loadRoute(points, routeLine);
		});

		await act(async () => {
			await result.current.deletePoint('p2');
		});

		expect(result.current.points).toHaveLength(2);
	});

	it('movePointで移動成功時にtrueを返す', async () => {
		const { result } = renderHook(() => usePointContext(), { wrapper });

		const points = [
			createTestPoint({ id: 's1', type: 'start', order: 0 }),
			createTestPoint({ id: 'w1', type: 'waypoint', order: 1, lat: 35.677 }),
			createTestPoint({ id: 'w2', type: 'waypoint', order: 2, lat: 35.678 }),
			createTestPoint({ id: 'g1', type: 'goal', order: 3 }),
		];

		act(() => {
			result.current.loadRoute(points, []);
		});

		let success: boolean;
		await act(async () => {
			success = await result.current.movePoint('w2', 'up');
		});

		expect(success!).toBe(true);
	});

	it('movePointで移動失敗時にfalseを返す', async () => {
		const { result } = renderHook(() => usePointContext(), { wrapper });

		const points = [
			createTestPoint({ id: 's1', type: 'start', order: 0 }),
			createTestPoint({ id: 'g1', type: 'goal', order: 1 }),
		];

		act(() => {
			result.current.loadRoute(points, []);
		});

		let success: boolean;
		await act(async () => {
			success = await result.current.movePoint('s1', 'down');
		});

		expect(success!).toBe(false);
	});
});

describe('usePointContext', () => {
	it('Provider外で使用するとエラーをスローする', () => {
		expect(() => {
			renderHook(() => usePointContext());
		}).toThrow('usePointContext must be used within a PointProvider');
	});
});
