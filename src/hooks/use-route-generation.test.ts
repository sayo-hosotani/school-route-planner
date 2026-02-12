import { renderHook, act } from '@testing-library/react';
import { createTestPoint } from '../test/helpers';
import { useRouteGeneration } from './use-route-generation';

vi.mock('../api/route-api', () => ({
	generateRoute: vi.fn(),
}));

import { generateRoute } from '../api/route-api';

describe('useRouteGeneration', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('初期状態ではrouteLineが空配列である', () => {
		const { result } = renderHook(() => useRouteGeneration());
		expect(result.current.routeLine).toEqual([]);
	});

	it('2ポイント未満の場合、routeLineをクリアする', async () => {
		const { result } = renderHook(() => useRouteGeneration());

		await act(async () => {
			await result.current.generateRouteFromPoints([
				createTestPoint({ type: 'start', order: 0 }),
			]);
		});

		expect(result.current.routeLine).toEqual([]);
		expect(generateRoute).not.toHaveBeenCalled();
	});

	it('スタートまたはゴールがない場合、直線接続する', async () => {
		const { result } = renderHook(() => useRouteGeneration());

		const points = [
			createTestPoint({ type: 'start', order: 0, lat: 35.6762, lng: 139.6503 }),
			createTestPoint({ type: 'waypoint', order: 1, lat: 35.68, lng: 139.655 }),
		];

		await act(async () => {
			await result.current.generateRouteFromPoints(points);
		});

		expect(generateRoute).not.toHaveBeenCalled();
		expect(result.current.routeLine).toEqual([
			[35.6762, 139.6503],
			[35.68, 139.655],
		]);
	});

	it('Valhalla APIで経路を生成し座標を[lat,lng]に変換する', async () => {
		vi.mocked(generateRoute).mockResolvedValue({
			coordinates: [[139.6503, 35.6762], [139.655, 35.68]], // [lng, lat] GeoJSON形式
			distance: 0.5,
			duration: 300,
			summary: { has_toll: false, has_highway: false, has_ferry: false },
		});

		const { result } = renderHook(() => useRouteGeneration());

		const points = [
			createTestPoint({ type: 'start', order: 0 }),
			createTestPoint({ type: 'goal', order: 1 }),
		];

		await act(async () => {
			await result.current.generateRouteFromPoints(points);
		});

		expect(result.current.routeLine).toEqual([
			[35.6762, 139.6503],
			[35.68, 139.655],
		]);
	});

	it('API失敗時に直線接続にフォールバックする', async () => {
		vi.mocked(generateRoute).mockRejectedValue(new Error('API Error'));

		const { result } = renderHook(() => useRouteGeneration());

		const points = [
			createTestPoint({ type: 'start', order: 0, lat: 35.6762, lng: 139.6503 }),
			createTestPoint({ type: 'goal', order: 1, lat: 35.68, lng: 139.655 }),
		];

		await act(async () => {
			await result.current.generateRouteFromPoints(points);
		});

		expect(result.current.routeLine).toEqual([
			[35.6762, 139.6503],
			[35.68, 139.655],
		]);
	});

	it('API失敗時にonErrorコールバックを呼ぶ', async () => {
		vi.mocked(generateRoute).mockRejectedValue(new Error('API Error'));
		const onError = vi.fn();

		const { result } = renderHook(() => useRouteGeneration({ onError }));

		const points = [
			createTestPoint({ type: 'start', order: 0 }),
			createTestPoint({ type: 'goal', order: 1 }),
		];

		await act(async () => {
			await result.current.generateRouteFromPoints(points);
		});

		expect(onError).toHaveBeenCalledWith('経路の生成に失敗しました。直線で接続します。');
	});

	it('clearRouteでrouteLineをクリアする', async () => {
		vi.mocked(generateRoute).mockResolvedValue({
			coordinates: [[139.6503, 35.6762]],
			distance: 0.5,
			duration: 300,
			summary: { has_toll: false, has_highway: false, has_ferry: false },
		});

		const { result } = renderHook(() => useRouteGeneration());

		const points = [
			createTestPoint({ type: 'start', order: 0 }),
			createTestPoint({ type: 'goal', order: 1 }),
		];

		await act(async () => {
			await result.current.generateRouteFromPoints(points);
		});

		act(() => {
			result.current.clearRoute();
		});

		expect(result.current.routeLine).toEqual([]);
	});

	it('直線接続時にポイントをorder順にソートする', async () => {
		const { result } = renderHook(() => useRouteGeneration());

		const points = [
			createTestPoint({ type: 'waypoint', order: 1, lat: 35.68, lng: 139.655 }),
			createTestPoint({ type: 'start', order: 0, lat: 35.6762, lng: 139.6503 }),
		];

		await act(async () => {
			await result.current.generateRouteFromPoints(points);
		});

		expect(result.current.routeLine[0]).toEqual([35.6762, 139.6503]);
		expect(result.current.routeLine[1]).toEqual([35.68, 139.655]);
	});

	it('setRouteLineで直接routeLineを設定できる', () => {
		const { result } = renderHook(() => useRouteGeneration());

		act(() => {
			result.current.setRouteLine([[35.6762, 139.6503]]);
		});

		expect(result.current.routeLine).toEqual([[35.6762, 139.6503]]);
	});
});
