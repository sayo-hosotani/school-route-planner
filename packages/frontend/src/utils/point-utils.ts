import type { Point } from '../types/point';

/**
 * ポイント種別のラベルを取得（絵文字付き）
 */
export const getPointTypeLabel = (type: Point['type'], waypointNumber?: number): string => {
	switch (type) {
		case 'start':
			return '🟢 スタート';
		case 'waypoint':
			return waypointNumber !== undefined ? `🔴 中継地点${waypointNumber}` : '🔴 中継地点';
		case 'goal':
			return '🔵 ゴール';
	}
};

/**
 * ポイント種別のラベルを取得（絵文字なし）
 */
export const getPointTypeLabelSimple = (type: Point['type']): string => {
	switch (type) {
		case 'start':
			return 'スタート';
		case 'waypoint':
			return '中継地点';
		case 'goal':
			return 'ゴール';
	}
};

/**
 * サイドバー用の表示タイトルを取得
 * コメントがある場合は最初の16文字、なければ種別ラベル
 */
export const getDisplayTitle = (
	point: Point | null,
	type: Point['type'],
	waypointNumber?: number,
): string => {
	if (!point || !point.comment) {
		return getPointTypeLabel(type, waypointNumber);
	}
	const firstLine = point.comment.split('\n')[0];
	if (firstLine.length <= 16) {
		return firstLine;
	}
	return firstLine.substring(0, 16);
};

/**
 * マーカー用の表示タイトルを取得
 * コメントがある場合は最初の16文字、なければ種別ラベル（絵文字なし）
 */
export const getMarkerDisplayTitle = (point: Point): string => {
	if (!point.comment) {
		return getPointTypeLabelSimple(point.type);
	}
	const firstLine = point.comment.split('\n')[0];
	return firstLine.length <= 16 ? firstLine : firstLine.substring(0, 16);
};
