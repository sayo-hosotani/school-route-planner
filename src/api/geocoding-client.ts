/**
 * 国土地理院 ジオコーディングAPI クライアント
 * 住所から緯度経度を取得する
 */

const GSI_GEOCODING_URL = 'https://msearch.gsi.go.jp/address-search/AddressSearch';
const GEOCODING_TIMEOUT = 10000;

/**
 * 国土地理院APIのレスポンス形式
 */
interface GsiGeocodingResponse {
	geometry: {
		coordinates: [number, number]; // [経度, 緯度]
		type: 'Point';
	};
	type: 'Feature';
	properties: {
		addressCode: string;
		title: string;
	};
}

/**
 * アプリケーション用のジオコーディング結果
 */
export interface GeocodingResult {
	lat: number;
	lng: number;
	address: string;
}

/**
 * タイムアウト付きfetch
 */
async function fetchWithTimeout(
	url: string,
	timeout: number,
): Promise<Response> {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	try {
		const response = await fetch(url, {
			signal: controller.signal,
		});
		return response;
	} finally {
		clearTimeout(timeoutId);
	}
}

/**
 * 住所から座標を検索
 * @param query 検索する住所文字列
 * @returns 検索結果の配列（複数候補がある場合あり）
 */
export async function searchAddress(query: string): Promise<GeocodingResult[]> {
	if (!query.trim()) {
		return [];
	}

	const url = `${GSI_GEOCODING_URL}?q=${encodeURIComponent(query.trim())}`;

	try {
		const response = await fetchWithTimeout(url, GEOCODING_TIMEOUT);

		if (!response.ok) {
			throw new Error(`住所検索エラー: ${response.status}`);
		}

		const data = (await response.json()) as GsiGeocodingResponse[];

		if (!Array.isArray(data) || data.length === 0) {
			return [];
		}

		// 国土地理院APIのレスポンスをアプリケーション形式に変換
		return data.map((item) => ({
			lat: item.geometry.coordinates[1], // 緯度
			lng: item.geometry.coordinates[0], // 経度
			address: item.properties.title,
		}));
	} catch (error) {
		if (error instanceof Error) {
			if (error.name === 'AbortError') {
				throw new Error('住所検索がタイムアウトしました');
			}
			throw new Error(`住所検索エラー: ${error.message}`);
		}
		throw new Error('住所検索中に不明なエラーが発生しました');
	}
}
