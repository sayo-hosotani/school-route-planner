import { describe, it, expect } from 'vitest';
import { validateImportData } from './validate-import';
import { createTestSavedRoute, createTestPoint } from '../test/helpers';

describe('validateImportData', () => {
	describe('正常系', () => {
		it('有効なルート配列を受け入れる', () => {
			const data = [createTestSavedRoute()];
			const result = validateImportData(data);
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('空配列を受け入れる', () => {
			const result = validateImportData([]);
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('複数ルートを受け入れる', () => {
			const data = [
				createTestSavedRoute({ id: '1', name: '経路1' }),
				createTestSavedRoute({ id: '2', name: '経路2' }),
			];
			const result = validateImportData(data);
			expect(result.valid).toBe(true);
		});
	});

	describe('トップレベルの検証', () => {
		it('配列でない場合はエラー', () => {
			const result = validateImportData('not an array');
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('データが配列ではありません');
		});

		it('nullの場合はエラー', () => {
			const result = validateImportData(null);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('データが配列ではありません');
		});

		it('件数が100件を超える場合はエラー', () => {
			const data = Array.from({ length: 101 }, (_, i) =>
				createTestSavedRoute({ id: `route-${i}`, name: `経路${i}` }),
			);
			const result = validateImportData(data);
			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('上限の100件を超えています');
		});
	});

	describe('ルートの必須フィールド検証', () => {
		it('idが文字列でない場合はエラー', () => {
			const data = [createTestSavedRoute({ id: 123 as unknown as string })];
			const result = validateImportData(data);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('ルート1: idが文字列ではありません');
		});

		it('nameが文字列でない場合はエラー', () => {
			const data = [createTestSavedRoute({ name: null as unknown as string })];
			const result = validateImportData(data);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('ルート1: nameが文字列ではありません');
		});

		it('nameが100文字を超える場合はエラー', () => {
			const data = [createTestSavedRoute({ name: 'あ'.repeat(101) })];
			const result = validateImportData(data);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('ルート1: nameが100文字を超えています');
		});

		it('created_atが文字列でない場合はエラー', () => {
			const data = [createTestSavedRoute({ created_at: 123 as unknown as string })];
			const result = validateImportData(data);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('ルート1: created_atが文字列ではありません');
		});

		it('updated_atが文字列でない場合はエラー', () => {
			const data = [createTestSavedRoute({ updated_at: undefined as unknown as string })];
			const result = validateImportData(data);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('ルート1: updated_atが文字列ではありません');
		});

		it('ルートがオブジェクトでない場合はエラー', () => {
			const result = validateImportData(['not an object']);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('ルート1: オブジェクトではありません');
		});
	});

	describe('routeLineの検証', () => {
		it('routeLineが配列でない場合はエラー', () => {
			const data = [createTestSavedRoute({ routeLine: 'invalid' as unknown as [number, number][] })];
			const result = validateImportData(data);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('ルート1: routeLineが配列ではありません');
		});

		it('routeLineの座標が不正な形式の場合はエラー', () => {
			const data = [createTestSavedRoute({ routeLine: [[35.0]] as unknown as [number, number][] })];
			const result = validateImportData(data);
			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('routeLine[0]が[緯度, 経度]の形式ではありません');
		});

		it('routeLineの緯度が範囲外の場合はエラー（上限超過）', () => {
			const data = [createTestSavedRoute({ routeLine: [[46, 139]] })];
			const result = validateImportData(data);
			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('routeLine[0]の緯度が無効です');
		});

		it('routeLineの緯度が範囲外の場合はエラー（下限未満）', () => {
			const data = [createTestSavedRoute({ routeLine: [[20, 139]] })];
			const result = validateImportData(data);
			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('routeLine[0]の緯度が無効です');
		});

		it('routeLineの経度が範囲外の場合はエラー（上限超過）', () => {
			const data = [createTestSavedRoute({ routeLine: [[35, 154]] })];
			const result = validateImportData(data);
			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('routeLine[0]の経度が無効です');
		});

		it('routeLineの経度が範囲外の場合はエラー（下限未満）', () => {
			const data = [createTestSavedRoute({ routeLine: [[35, 122]] })];
			const result = validateImportData(data);
			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('routeLine[0]の経度が無効です');
		});
	});

	describe('pointsの検証', () => {
		it('pointsが配列でない場合はエラー', () => {
			const route = { ...createTestSavedRoute(), points: 'invalid' };
			const result = validateImportData([route]);
			expect(result.valid).toBe(false);
			expect(result.errors).toContain('ルート1: pointsが配列ではありません');
		});

		it('ポイントのtypeが不正な場合はエラー', () => {
			const route = createTestSavedRoute({
				points: [createTestPoint({ type: 'invalid' as 'start' })],
			});
			const result = validateImportData([route]);
			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('typeが無効です');
		});

		it('ポイントの緯度が範囲外の場合はエラー（上限超過）', () => {
			const route = createTestSavedRoute({
				points: [createTestPoint({ lat: 46 })],
			});
			const result = validateImportData([route]);
			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('緯度が無効です');
		});

		it('ポイントの緯度が範囲外の場合はエラー（下限未満）', () => {
			const route = createTestSavedRoute({
				points: [createTestPoint({ lat: 20 })],
			});
			const result = validateImportData([route]);
			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('緯度が無効です');
		});

		it('ポイントの経度が範囲外の場合はエラー（上限超過）', () => {
			const route = createTestSavedRoute({
				points: [createTestPoint({ lng: 154 })],
			});
			const result = validateImportData([route]);
			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('経度が無効です');
		});

		it('ポイントの経度が範囲外の場合はエラー（下限未満）', () => {
			const route = createTestSavedRoute({
				points: [createTestPoint({ lng: 122 })],
			});
			const result = validateImportData([route]);
			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('経度が無効です');
		});

		it('commentが500文字を超える場合はエラー', () => {
			const route = createTestSavedRoute({
				points: [createTestPoint({ comment: 'あ'.repeat(501) })],
			});
			const result = validateImportData([route]);
			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('commentが500文字を超えています');
		});

		it('ポイントのidが文字列でない場合はエラー', () => {
			const route = createTestSavedRoute({
				points: [createTestPoint({ id: 123 as unknown as string })],
			});
			const result = validateImportData([route]);
			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('idが文字列ではありません');
		});

		it('ポイントのorderが数値でない場合はエラー', () => {
			const route = createTestSavedRoute({
				points: [createTestPoint({ order: 'abc' as unknown as number })],
			});
			const result = validateImportData([route]);
			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('orderが数値ではありません');
		});

		it('ポイントがオブジェクトでない場合はエラー', () => {
			const route = { ...createTestSavedRoute(), points: ['invalid'] };
			const result = validateImportData([route]);
			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('オブジェクトではありません');
		});
	});

	describe('複数エラーの検出', () => {
		it('複数のエラーを同時に検出する', () => {
			const route = {
				id: 123,
				name: 'あ'.repeat(101),
				routeLine: 'invalid',
				points: 'invalid',
				created_at: null,
				updated_at: null,
			};
			const result = validateImportData([route]);
			expect(result.valid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(1);
		});
	});
});
