import { createTestPoint, createTestSavedRoute } from '../test/helpers';
import type { RouteData } from '../types/route';
import {
	saveRoute,
	getAllRoutes,
	deleteRoute,
	loadRouteById,
	loadRoute,
	exportRoutesToJson,
	importRoutesFromJson,
	resetRoutes,
} from './route-api';

describe('route-api', () => {
	beforeEach(() => {
		resetRoutes();
		vi.spyOn(crypto, 'randomUUID').mockReturnValue('mock-uuid-001' as ReturnType<typeof crypto.randomUUID>);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('saveRoute', () => {
		it('新しい経路をメモリに保存する', async () => {
			const routeData: RouteData = {
				points: [
					createTestPoint({ type: 'start', order: 0 }),
					createTestPoint({ type: 'goal', order: 1 }),
				],
				routeLine: [[35.6762, 139.6503], [35.68, 139.655]],
			};

			await saveRoute(routeData, 'テスト経路');

			const routes = await getAllRoutes();
			expect(routes).toHaveLength(1);
			expect(routes[0].name).toBe('テスト経路');
		});

		it('crypto.randomUUID()でIDを生成する', async () => {
			const routeData: RouteData = {
				points: [],
				routeLine: [],
			};

			await saveRoute(routeData, 'テスト');

			const routes = await getAllRoutes();
			expect(routes[0].id).toBe('mock-uuid-001');
		});

		it('created_atとupdated_atに現在日時を設定する', async () => {
			const before = new Date().toISOString();

			const routeData: RouteData = {
				points: [],
				routeLine: [],
			};
			await saveRoute(routeData, 'テスト');

			const after = new Date().toISOString();
			const routes = await getAllRoutes();
			expect(routes[0].created_at >= before).toBe(true);
			expect(routes[0].updated_at <= after).toBe(true);
		});

		it('既存の経路の後ろに追加する', async () => {
			const existingRoute = createTestSavedRoute({ id: 'existing-1', name: '既存経路' });
			importRoutesFromJson(JSON.stringify([existingRoute]));

			vi.spyOn(crypto, 'randomUUID').mockReturnValue('new-uuid' as ReturnType<typeof crypto.randomUUID>);

			const routeData: RouteData = {
				points: [],
				routeLine: [],
			};
			await saveRoute(routeData, '新規経路');

			const routes = await getAllRoutes();
			expect(routes).toHaveLength(2);
			expect(routes[0].name).toBe('既存経路');
			expect(routes[1].name).toBe('新規経路');
		});
	});

	describe('getAllRoutes', () => {
		it('保存済みの全経路を返す', async () => {
			const routes = [
				createTestSavedRoute({ id: 'r1', name: '経路1' }),
				createTestSavedRoute({ id: 'r2', name: '経路2' }),
			];
			importRoutesFromJson(JSON.stringify(routes));

			const result = await getAllRoutes();
			expect(result).toHaveLength(2);
			expect(result[0].name).toBe('経路1');
		});

		it('保存済み経路がない場合、空配列を返す', async () => {
			const result = await getAllRoutes();
			expect(result).toEqual([]);
		});
	});

	describe('deleteRoute', () => {
		it('指定IDの経路を削除する', async () => {
			let callCount = 0;
			vi.spyOn(crypto, 'randomUUID').mockImplementation(() => {
				callCount++;
				return `mock-uuid-${callCount}` as ReturnType<typeof crypto.randomUUID>;
			});

			const routes = [
				createTestSavedRoute({ id: 'r1' }),
				createTestSavedRoute({ id: 'r2' }),
			];
			importRoutesFromJson(JSON.stringify(routes));

			const allRoutes = await getAllRoutes();
			expect(allRoutes).toHaveLength(2);
			await deleteRoute(allRoutes[0].id);

			const remaining = await getAllRoutes();
			expect(remaining).toHaveLength(1);
			expect(remaining[0].id).toBe(allRoutes[1].id);
		});

		it('存在しないIDの場合、他の経路に影響しない', async () => {
			const routes = [createTestSavedRoute({ id: 'r1' })];
			importRoutesFromJson(JSON.stringify(routes));

			await deleteRoute('nonexistent');

			const remaining = await getAllRoutes();
			expect(remaining).toHaveLength(1);
		});
	});

	describe('loadRouteById', () => {
		it('指定IDの経路データを返す', async () => {
			const routes = [
				createTestSavedRoute({ id: 'r1', name: '経路1' }),
				createTestSavedRoute({ id: 'r2', name: '経路2' }),
			];
			importRoutesFromJson(JSON.stringify(routes));

			const allRoutes = await getAllRoutes();
			const result = await loadRouteById(allRoutes[1].id);
			expect(result.points).toEqual(allRoutes[1].points);
			expect(result.routeLine).toEqual(allRoutes[1].routeLine);
		});

		it('存在しないIDの場合、エラーをスローする', async () => {
			await expect(loadRouteById('nonexistent')).rejects.toThrow('経路が見つかりません');
		});
	});

	describe('loadRoute', () => {
		it('最新の経路を返す', async () => {
			const routes = [
				createTestSavedRoute({ id: 'r1', name: '経路1' }),
				createTestSavedRoute({ id: 'r2', name: '最新経路' }),
			];
			importRoutesFromJson(JSON.stringify(routes));

			const result = await loadRoute();
			expect(result).not.toBeNull();

			const allRoutes = await getAllRoutes();
			expect(result!.points).toEqual(allRoutes[1].points);
		});

		it('経路がない場合、nullを返す', async () => {
			const result = await loadRoute();
			expect(result).toBeNull();
		});
	});

	describe('exportRoutesToJson', () => {
		it('全経路をJSON文字列で返す', () => {
			const routes = [createTestSavedRoute({ id: 'r1' })];
			importRoutesFromJson(JSON.stringify(routes));

			const json = exportRoutesToJson();
			const parsed = JSON.parse(json);
			expect(parsed).toHaveLength(1);
		});

		it('整形されたJSON（インデント2）を返す', () => {
			const routes = [createTestSavedRoute({ id: 'r1' })];
			importRoutesFromJson(JSON.stringify(routes));

			const json = exportRoutesToJson();
			expect(json).toContain('\n');
			expect(json).toContain('  ');
		});

		it('経路がない場合、空配列のJSONを返す', () => {
			const json = exportRoutesToJson();
			expect(JSON.parse(json)).toEqual([]);
		});
	});

	describe('importRoutesFromJson', () => {
		it('JSON文字列から経路をインポートする', async () => {
			const routes = [createTestSavedRoute({ id: 'original-id', name: 'インポート経路' })];
			const json = JSON.stringify(routes);

			importRoutesFromJson(json);

			const allRoutes = await getAllRoutes();
			expect(allRoutes).toHaveLength(1);
			expect(allRoutes[0].name).toBe('インポート経路');
		});

		it('インポート件数を返す', () => {
			const routes = [
				createTestSavedRoute({ id: 'r1' }),
				createTestSavedRoute({ id: 'r2' }),
			];
			const count = importRoutesFromJson(JSON.stringify(routes));
			expect(count).toBe(2);
		});

		it('IDを再生成して重複を防ぐ', async () => {
			const routes = [createTestSavedRoute({ id: 'original-id' })];
			importRoutesFromJson(JSON.stringify(routes));

			const allRoutes = await getAllRoutes();
			expect(allRoutes[0].id).toBe('mock-uuid-001');
			expect(allRoutes[0].id).not.toBe('original-id');
		});

		it('updated_atを現在日時に更新する', async () => {
			const before = new Date().toISOString();
			const routes = [createTestSavedRoute({ updated_at: '2020-01-01T00:00:00.000Z' })];
			importRoutesFromJson(JSON.stringify(routes));

			const allRoutes = await getAllRoutes();
			expect(allRoutes[0].updated_at >= before).toBe(true);
		});

		it('position=afterの場合、既存経路の後ろに追加する', async () => {
			importRoutesFromJson(
				JSON.stringify([createTestSavedRoute({ id: 'existing', name: '既存' })]),
			);

			vi.spyOn(crypto, 'randomUUID').mockReturnValue('new-uuid' as ReturnType<typeof crypto.randomUUID>);

			const routes = [createTestSavedRoute({ name: 'インポート' })];
			importRoutesFromJson(JSON.stringify(routes), 'after');

			const allRoutes = await getAllRoutes();
			expect(allRoutes[0].name).toBe('既存');
			expect(allRoutes[1].name).toBe('インポート');
		});

		it('position=beforeの場合、既存経路の前に追加する', async () => {
			importRoutesFromJson(
				JSON.stringify([createTestSavedRoute({ id: 'existing', name: '既存' })]),
			);

			vi.spyOn(crypto, 'randomUUID').mockReturnValue('new-uuid' as ReturnType<typeof crypto.randomUUID>);

			const routes = [createTestSavedRoute({ name: 'インポート' })];
			importRoutesFromJson(JSON.stringify(routes), 'before');

			const allRoutes = await getAllRoutes();
			expect(allRoutes[0].name).toBe('インポート');
			expect(allRoutes[1].name).toBe('既存');
		});

		it('無効なJSONの場合、エラーをスローする', () => {
			expect(() => importRoutesFromJson('invalid json')).toThrow();
		});

		it('配列以外のJSONの場合、エラーをスローする', () => {
			expect(() => importRoutesFromJson('{"key": "value"}')).toThrow('データが配列ではありません');
		});
	});
});
