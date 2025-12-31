import type { Point } from '../types/point';

export const samplePoints: Point[] = [
	{
		id: '1',
		lat: 35.631405,
		lng: 139.591553,
		type: 'start',
		order: 0,
		comment: '自宅\nスタート地点です',
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
	{
		id: '2',
		lat: 35.62576938,
		lng: 139.59424861,
		type: 'waypoint',
		order: 1,
		comment: 'コンビニ\n中継地点です',
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
	{
		id: '3',
		lat: 35.62597111,
		lng: 139.60131603,
		type: 'goal',
		order: 2,
		comment: '会社\nゴール地点です',
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	},
];

// 直線で結んだ経路データ
export const sampleRouteLine: [number, number][] = [
	[35.631405, 139.591553], // スタート
	[35.62576938, 139.59424861], // 中継地点
	[35.62597111, 139.60131603], // ゴール
];
