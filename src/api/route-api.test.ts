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
} from './route-api';

const STORAGE_KEY = 'school-route-planner-saved-routes';

describe('route-api', () => {
	beforeEach(() => {
		localStorage.clear();
		vi.spyOn(crypto, 'randomUUID').mockReturnValue('mock-uuid-001' as ReturnType<typeof crypto.randomUUID>);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('saveRoute', () => {
		it('新しい経路をlocalStorageに保存する', async () => {
			const routeData: RouteData = {
				points: [
					createTestPoint({ type: 'start', order: 0 }),
					createTestPoint({ type: 'goal', order: 1 }),
				],
				routeLine: [[35.6762, 139.6503], [35.68, 139.655]],
			};

			await saveRoute(routeData, 'テスト経路');

			const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
			expect(stored).toHaveLength(1);
			expect(stored[0].name).toBe('テスト経路');
		});

		it('crypto.randomUUID()でIDを生成する', async () => {
			const routeData: RouteData = {
				points: [],
				routeLine: [],
			};

			await saveRoute(routeData, 'テスト');

			const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
			expect(stored[0].id).toBe('mock-uuid-001');
		});

		it('created_atとupdated_atに現在日時を設定する', async () => {
			const before = new Date().toISOString();

			const routeData: RouteData = {
				points: [],
				routeLine: [],
			};
			await saveRoute(routeData, 'テスト');

			const after = new Date().toISOString();
			const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
			expect(stored[0].created_at >= before).toBe(true);
			expect(stored[0].updated_at <= after).toBe(true);
		});

		it('既存の経路の後ろに追加する', async () => {
			const existingRoute = createTestSavedRoute({ id: 'existing-1', name: '既存経路' });
			localStorage.setItem(STORAGE_KEY, JSON.stringify([existingRoute]));

			const routeData: RouteData = {
				points: [],
				routeLine: [],
			};
			await saveRoute(routeData, '新規経路');

			const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
			expect(stored).toHaveLength(2);
			expect(stored[0].name).toBe('既存経路');
			expect(stored[1].name).toBe('新規経路');
		});
	});

	describe('getAllRoutes', () => {
		it('保存済みの全経路を返す', async () => {
			const routes = [
				createTestSavedRoute({ id: 'r1', name: '経路1' }),
				createTestSavedRoute({ id: 'r2', name: '経路2' }),
			];
			localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));

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
			const routes = [
				createTestSavedRoute({ id: 'r1' }),
				createTestSavedRoute({ id: 'r2' }),
			];
			localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));

			await deleteRoute('r1');

			const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
			expect(stored).toHaveLength(1);
			expect(stored[0].id).toBe('r2');
		});

		it('存在しないIDの場合、他の経路に影響しない', async () => {
			const routes = [createTestSavedRoute({ id: 'r1' })];
			localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));

			await deleteRoute('nonexistent');

			const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
			expect(stored).toHaveLength(1);
		});
	});

	describe('loadRouteById', () => {
		it('指定IDの経路データを返す', async () => {
			const routes = [
				createTestSavedRoute({ id: 'r1', name: '経路1' }),
				createTestSavedRoute({ id: 'r2', name: '経路2' }),
			];
			localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));

			const result = await loadRouteById('r2');
			expect(result.points).toEqual(routes[1].points);
			expect(result.routeLine).toEqual(routes[1].routeLine);
		});

		it('存在しないIDの場合、エラーをスローする', async () => {
			localStorage.setItem(STORAGE_KEY, JSON.stringify([]));

			await expect(loadRouteById('nonexistent')).rejects.toThrow('経路が見つかりません');
		});
	});

	describe('loadRoute', () => {
		it('最新の経路を返す', async () => {
			const routes = [
				createTestSavedRoute({ id: 'r1', name: '経路1' }),
				createTestSavedRoute({ id: 'r2', name: '最新経路' }),
			];
			localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));

			const result = await loadRoute();
			expect(result).not.toBeNull();
			expect(result!.points).toEqual(routes[1].points);
		});

		it('経路がない場合、nullを返す', async () => {
			const result = await loadRoute();
			expect(result).toBeNull();
		});
	});

	describe('exportRoutesToJson', () => {
		it('全経路をJSON文字列で返す', () => {
			const routes = [createTestSavedRoute({ id: 'r1' })];
			localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));

			const json = exportRoutesToJson();
			const parsed = JSON.parse(json);
			expect(parsed).toHaveLength(1);
			expect(parsed[0].id).toBe('r1');
		});

		it('整形されたJSON（インデント2）を返す', () => {
			const routes = [createTestSavedRoute({ id: 'r1' })];
			localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));

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
		it('JSON文字列から経路をインポートする', () => {
			const routes = [createTestSavedRoute({ id: 'original-id', name: 'インポート経路' })];
			const json = JSON.stringify(routes);

			importRoutesFromJson(json);

			const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
			expect(stored).toHaveLength(1);
			expect(stored[0].name).toBe('インポート経路');
		});

		it('インポート件数を返す', () => {
			const routes = [
				createTestSavedRoute({ id: 'r1' }),
				createTestSavedRoute({ id: 'r2' }),
			];
			const count = importRoutesFromJson(JSON.stringify(routes));
			expect(count).toBe(2);
		});

		it('IDを再生成して重複を防ぐ', () => {
			const routes = [createTestSavedRoute({ id: 'original-id' })];
			importRoutesFromJson(JSON.stringify(routes));

			const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
			expect(stored[0].id).toBe('mock-uuid-001');
			expect(stored[0].id).not.toBe('original-id');
		});

		it('updated_atを現在日時に更新する', () => {
			const before = new Date().toISOString();
			const routes = [createTestSavedRoute({ updated_at: '2020-01-01T00:00:00.000Z' })];
			importRoutesFromJson(JSON.stringify(routes));

			const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
			expect(stored[0].updated_at >= before).toBe(true);
		});

		it('position=afterの場合、既存経路の後ろに追加する', () => {
			localStorage.setItem(
				STORAGE_KEY,
				JSON.stringify([createTestSavedRoute({ id: 'existing', name: '既存' })]),
			);

			const routes = [createTestSavedRoute({ name: 'インポート' })];
			importRoutesFromJson(JSON.stringify(routes), 'after');

			const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
			expect(stored[0].name).toBe('既存');
			expect(stored[1].name).toBe('インポート');
		});

		it('position=beforeの場合、既存経路の前に追加する', () => {
			localStorage.setItem(
				STORAGE_KEY,
				JSON.stringify([createTestSavedRoute({ id: 'existing', name: '既存' })]),
			);

			const routes = [createTestSavedRoute({ name: 'インポート' })];
			importRoutesFromJson(JSON.stringify(routes), 'before');

			const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
			expect(stored[0].name).toBe('インポート');
			expect(stored[1].name).toBe('既存');
		});

		it('無効なJSONの場合、エラーをスローする', () => {
			expect(() => importRoutesFromJson('invalid json')).toThrow();
		});

		it('配列以外のJSONの場合、エラーをスローする', () => {
			expect(() => importRoutesFromJson('{"key": "value"}')).toThrow('無効なJSONフォーマットです');
		});
	});
});
