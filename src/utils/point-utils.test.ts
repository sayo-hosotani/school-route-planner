import { createTestPoint } from '../test/helpers';
import {
	getDisplayTitle,
	getMarkerDisplayTitle,
	getPointTypeIcon,
	getPointTypeLabel,
	getPointTypeLabelSimple,
} from './point-utils';

describe('getPointTypeLabel', () => {
	it('スタートの場合、絵文字付きラベルを返す', () => {
		expect(getPointTypeLabel('start')).toBe('🟢 スタート');
	});

	it('ゴールの場合、絵文字付きラベルを返す', () => {
		expect(getPointTypeLabel('goal')).toBe('🔵 ゴール');
	});

	it('中継地点の場合、番号なしラベルを返す', () => {
		expect(getPointTypeLabel('waypoint')).toBe('🔴 中継地点');
	});

	it('中継地点の場合、番号付きラベルを返す', () => {
		expect(getPointTypeLabel('waypoint', 3)).toBe('🔴 中継地点3');
	});
});

describe('getPointTypeLabelSimple', () => {
	it('スタートの場合、絵文字なしラベルを返す', () => {
		expect(getPointTypeLabelSimple('start')).toBe('スタート');
	});

	it('ゴールの場合、絵文字なしラベルを返す', () => {
		expect(getPointTypeLabelSimple('goal')).toBe('ゴール');
	});

	it('中継地点の場合、絵文字なしラベルを返す', () => {
		expect(getPointTypeLabelSimple('waypoint')).toBe('中継地点');
	});
});

describe('getPointTypeIcon', () => {
	it('スタートの場合、緑の丸アイコンを返す', () => {
		expect(getPointTypeIcon('start')).toBe('🟢');
	});

	it('ゴールの場合、青の丸アイコンを返す', () => {
		expect(getPointTypeIcon('goal')).toBe('🔵');
	});

	it('中継地点の場合、赤の丸アイコンを返す', () => {
		expect(getPointTypeIcon('waypoint')).toBe('🔴');
	});
});

describe('getDisplayTitle', () => {
	it('ポイントがnullの場合、種別ラベルを返す', () => {
		expect(getDisplayTitle(null, 'start')).toBe('🟢 スタート');
	});

	it('コメントが空の場合、種別ラベルを返す', () => {
		const point = createTestPoint({ type: 'start', comment: '' });
		expect(getDisplayTitle(point, 'start')).toBe('🟢 スタート');
	});

	it('コメントが16文字以内の場合、アイコン+コメント全体を返す', () => {
		const point = createTestPoint({ type: 'waypoint', comment: '交差点を右折' });
		expect(getDisplayTitle(point, 'waypoint')).toBe('🔴 交差点を右折');
	});

	it('コメントが16文字を超える場合、アイコン+先頭16文字を返す', () => {
		const longComment = 'あいうえおかきくけこさしすせそたち';
		expect(longComment.length).toBeGreaterThan(16);
		const point = createTestPoint({ type: 'waypoint', comment: longComment });
		const result = getDisplayTitle(point, 'waypoint');
		expect(result).toBe('🔴 あいうえおかきくけこさしすせそた');
	});

	it('複数行コメントの場合、1行目のみ使用する', () => {
		const point = createTestPoint({
			type: 'goal',
			comment: '1行目\n2行目\n3行目',
		});
		expect(getDisplayTitle(point, 'goal')).toBe('🔵 1行目');
	});

	it('中継地点の場合、waypointNumberが種別ラベルに反映される', () => {
		const point = createTestPoint({ type: 'waypoint', comment: '' });
		expect(getDisplayTitle(point, 'waypoint', 2)).toBe('🔴 中継地点2');
	});
});

describe('getMarkerDisplayTitle', () => {
	it('コメントが空の場合、絵文字なし種別ラベルを返す', () => {
		const point = createTestPoint({ type: 'start', comment: '' });
		expect(getMarkerDisplayTitle(point)).toBe('スタート');
	});

	it('コメントが16文字以内の場合、コメント全体を返す', () => {
		const point = createTestPoint({ comment: '交差点を右折' });
		expect(getMarkerDisplayTitle(point)).toBe('交差点を右折');
	});

	it('コメントが16文字を超える場合、先頭16文字を返す', () => {
		const longComment = 'あいうえおかきくけこさしすせそたち';
		const point = createTestPoint({ comment: longComment });
		expect(getMarkerDisplayTitle(point)).toBe('あいうえおかきくけこさしすせそた');
	});

	it('複数行コメントの場合、1行目のみ使用する', () => {
		const point = createTestPoint({ comment: '1行目\n2行目' });
		expect(getMarkerDisplayTitle(point)).toBe('1行目');
	});
});
