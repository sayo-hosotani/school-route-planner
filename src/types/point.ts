export interface Point {
	id: string;
	lat: number;
	lng: number;
	type: 'start' | 'waypoint' | 'goal';
	order: number;
	comment: string;
	created_at: string;
	updated_at: string;
}

/** ポイントの座標更新用型（ドラッグ移動など） */
export interface PointPositionUpdate {
	lat: number;
	lng: number;
}

/** ポイントのメタ情報更新用型（コメント・種別変更など） */
export interface PointMetaUpdate {
	comment?: string;
	type?: Point['type'];
}
