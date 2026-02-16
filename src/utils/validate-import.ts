const MAX_ROUTES = 100;
const MAX_NAME_LENGTH = 100;
const MAX_COMMENT_LENGTH = 500;
const VALID_POINT_TYPES = ['start', 'waypoint', 'goal'] as const;

// 日本の座標範囲（国土地理院: https://www.gsi.go.jp/KOKUJYOHO/center.htm）
const JAPAN_LAT_MIN = 20.4253; // 北緯20°25′31″
const JAPAN_LAT_MAX = 45.5572; // 北緯45°33′26″
const JAPAN_LNG_MIN = 122.9325; // 東経122°55′57″
const JAPAN_LNG_MAX = 153.9867; // 東経153°59′12″

function isValidLatitude(lat: number): boolean {
	return lat >= JAPAN_LAT_MIN && lat <= JAPAN_LAT_MAX;
}

function isValidLongitude(lng: number): boolean {
	return lng >= JAPAN_LNG_MIN && lng <= JAPAN_LNG_MAX;
}

function validatePoint(point: unknown, routeIndex: number, pointIndex: number): string[] {
	const errors: string[] = [];
	const prefix = `ルート${routeIndex + 1}のポイント${pointIndex + 1}`;

	if (typeof point !== 'object' || point === null) {
		errors.push(`${prefix}: オブジェクトではありません`);
		return errors;
	}

	const p = point as Record<string, unknown>;

	if (typeof p.id !== 'string') {
		errors.push(`${prefix}: idが文字列ではありません`);
	}

	if (typeof p.lat !== 'number' || !isValidLatitude(p.lat)) {
		errors.push(`${prefix}: 緯度が無効です（${JAPAN_LAT_MIN}〜${JAPAN_LAT_MAX}の範囲で指定してください）`);
	}

	if (typeof p.lng !== 'number' || !isValidLongitude(p.lng)) {
		errors.push(`${prefix}: 経度が無効です（${JAPAN_LNG_MIN}〜${JAPAN_LNG_MAX}の範囲で指定してください）`);
	}

	if (typeof p.type !== 'string' || !(VALID_POINT_TYPES as readonly string[]).includes(p.type)) {
		errors.push(`${prefix}: typeが無効です（start, waypoint, goalのいずれかを指定してください）`);
	}

	if (typeof p.order !== 'number') {
		errors.push(`${prefix}: orderが数値ではありません`);
	}

	if (typeof p.comment !== 'string') {
		errors.push(`${prefix}: commentが文字列ではありません`);
	} else if (p.comment.length > MAX_COMMENT_LENGTH) {
		errors.push(`${prefix}: commentが${MAX_COMMENT_LENGTH}文字を超えています`);
	}

	return errors;
}

function validateRoute(route: unknown, index: number): string[] {
	const errors: string[] = [];
	const prefix = `ルート${index + 1}`;

	if (typeof route !== 'object' || route === null) {
		errors.push(`${prefix}: オブジェクトではありません`);
		return errors;
	}

	const r = route as Record<string, unknown>;

	if (typeof r.id !== 'string') {
		errors.push(`${prefix}: idが文字列ではありません`);
	}

	if (typeof r.name !== 'string') {
		errors.push(`${prefix}: nameが文字列ではありません`);
	} else if (r.name.length > MAX_NAME_LENGTH) {
		errors.push(`${prefix}: nameが${MAX_NAME_LENGTH}文字を超えています`);
	}

	if (typeof r.created_at !== 'string') {
		errors.push(`${prefix}: created_atが文字列ではありません`);
	}

	if (typeof r.updated_at !== 'string') {
		errors.push(`${prefix}: updated_atが文字列ではありません`);
	}

	// routeLine検証
	if (!Array.isArray(r.routeLine)) {
		errors.push(`${prefix}: routeLineが配列ではありません`);
	} else {
		for (let i = 0; i < r.routeLine.length; i++) {
			const coord = r.routeLine[i];
			if (
				!Array.isArray(coord) ||
				coord.length !== 2 ||
				typeof coord[0] !== 'number' ||
				typeof coord[1] !== 'number'
			) {
				errors.push(`${prefix}: routeLine[${i}]が[緯度, 経度]の形式ではありません`);
			} else {
				if (!isValidLatitude(coord[0])) {
					errors.push(`${prefix}: routeLine[${i}]の緯度が無効です（${JAPAN_LAT_MIN}〜${JAPAN_LAT_MAX}の範囲で指定してください）`);
				}
				if (!isValidLongitude(coord[1])) {
					errors.push(`${prefix}: routeLine[${i}]の経度が無効です（${JAPAN_LNG_MIN}〜${JAPAN_LNG_MAX}の範囲で指定してください）`);
				}
			}
		}
	}

	// points検証
	if (!Array.isArray(r.points)) {
		errors.push(`${prefix}: pointsが配列ではありません`);
	} else {
		for (let i = 0; i < r.points.length; i++) {
			errors.push(...validatePoint(r.points[i], index, i));
		}
	}

	return errors;
}

export interface ValidationResult {
	valid: boolean;
	errors: string[];
}

export function validateImportData(data: unknown): ValidationResult {
	const errors: string[] = [];

	if (!Array.isArray(data)) {
		return { valid: false, errors: ['データが配列ではありません'] };
	}

	if (data.length > MAX_ROUTES) {
		errors.push(`ルート数が上限の${MAX_ROUTES}件を超えています（${data.length}件）`);
	}

	for (let i = 0; i < data.length; i++) {
		errors.push(...validateRoute(data[i], i));
	}

	return { valid: errors.length === 0, errors };
}
