/**
 * Valhalla API Service
 * Valhalla経路計算APIとの連携を担当するサービス
 */

interface ValhallaLocation {
	lat: number;
	lon: number;
}

interface ValhallaRouteRequest {
	locations: ValhallaLocation[];
	costing: 'auto' | 'bicycle' | 'pedestrian' | 'motorcycle';
	directions_options?: {
		language?: string;
		units?: 'kilometers' | 'miles';
	};
}

interface ValhallaRouteResponse {
	trip: {
		locations: Array<{
			type: string;
			lat: number;
			lon: number;
			side_of_street: string;
			original_index: number;
		}>;
		legs: Array<{
			maneuvers: unknown[];
			summary: {
				has_time_restrictions: boolean;
				has_toll: boolean;
				has_highway: boolean;
				has_ferry: boolean;
				min_lat: number;
				min_lon: number;
				max_lat: number;
				max_lon: number;
				time: number;
				length: number;
				cost: number;
			};
			shape: string; // Encoded polyline
		}>;
		summary: {
			has_time_restrictions: boolean;
			has_toll: boolean;
			has_highway: boolean;
			has_ferry: boolean;
			min_lat: number;
			min_lon: number;
			max_lat: number;
			max_lon: number;
			time: number; // 秒
			length: number; // キロメートル
			cost: number;
		};
		status_message: string;
		status: number;
		units: string;
		language: string;
	};
}

interface Point {
	lat: number;
	lng: number;
	order: number;
}

interface RouteResult {
	coordinates: Array<[number, number]>; // [lng, lat] の配列（GeoJSON形式）
	distance: number; // キロメートル
	duration: number; // 秒
	summary: {
		has_toll: boolean;
		has_highway: boolean;
		has_ferry: boolean;
	};
}

export class ValhallaService {
	private readonly baseUrl: string;
	private readonly timeout: number;

	constructor(baseUrl = 'http://localhost:8002', timeout = 30000) {
		this.baseUrl = baseUrl;
		this.timeout = timeout;
	}

	/**
	 * ポイント配列から経路を生成
	 */
	async generateRoute(points: Point[]): Promise<RouteResult> {
		if (points.length < 2) {
			throw new Error('最低2つのポイントが必要です');
		}

		// orderでソート
		const sortedPoints = [...points].sort((a, b) => a.order - b.order);

		// Valhalla APIリクエスト形式に変換
		const locations: ValhallaLocation[] = sortedPoints.map((point) => ({
			lat: point.lat,
			lon: point.lng,
		}));

		const requestBody: ValhallaRouteRequest = {
			locations,
			costing: 'pedestrian', // 徒歩
			directions_options: {
				language: 'ja-JP', // 日本語
				units: 'kilometers',
			},
		};

		try {
			const response = await this.fetchWithTimeout(
				`${this.baseUrl}/route`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(requestBody),
				},
				this.timeout,
			);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(
					`Valhalla APIエラー: ${response.status} ${errorText}`,
				);
			}

			const data = (await response.json()) as ValhallaRouteResponse;

			// レスポンスをアプリケーション形式に変換
			return this.convertToRouteResult(data);
		} catch (error) {
			if (error instanceof Error) {
				if (error.name === 'AbortError') {
					throw new Error('Valhalla APIタイムアウト');
				}
				throw new Error(`経路生成エラー: ${error.message}`);
			}
			throw new Error('経路生成中に不明なエラーが発生しました');
		}
	}

	/**
	 * Valhalla APIレスポンスをアプリケーション形式に変換
	 */
	private convertToRouteResult(
		response: ValhallaRouteResponse,
	): RouteResult {
		const { trip } = response;
		const { summary, legs } = trip;

		// エンコードされたpolylineをデコード
		const coordinates: Array<[number, number]> = [];
		for (const leg of legs) {
			const decoded = this.decodePolyline(leg.shape);
			coordinates.push(...decoded);
		}

		return {
			coordinates,
			distance: summary.length, // キロメートル
			duration: summary.time, // 秒
			summary: {
				has_toll: summary.has_toll,
				has_highway: summary.has_highway,
				has_ferry: summary.has_ferry,
			},
		};
	}

	/**
	 * Valhallaのエンコードされたpolylineをデコード
	 * Valhallaは精度6のpolylineエンコーディングを使用
	 */
	private decodePolyline(encoded: string): Array<[number, number]> {
		const coordinates: Array<[number, number]> = [];
		let index = 0;
		let lat = 0;
		let lng = 0;

		while (index < encoded.length) {
			let b: number;
			let shift = 0;
			let result = 0;

			// latitudeをデコード
			do {
				b = encoded.charCodeAt(index++) - 63;
				result |= (b & 0x1f) << shift;
				shift += 5;
			} while (b >= 0x20);
			const dlat = result & 1 ? ~(result >> 1) : result >> 1;
			lat += dlat;

			shift = 0;
			result = 0;

			// longitudeをデコード
			do {
				b = encoded.charCodeAt(index++) - 63;
				result |= (b & 0x1f) << shift;
				shift += 5;
			} while (b >= 0x20);
			const dlng = result & 1 ? ~(result >> 1) : result >> 1;
			lng += dlng;

			// Valhallaは精度6（1e6）を使用
			coordinates.push([lng / 1e6, lat / 1e6]);
		}

		return coordinates;
	}

	/**
	 * タイムアウト付きfetch
	 */
	private async fetchWithTimeout(
		url: string,
		options: RequestInit,
		timeout: number,
	): Promise<Response> {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		try {
			const response = await fetch(url, {
				...options,
				signal: controller.signal,
			});
			return response;
		} finally {
			clearTimeout(timeoutId);
		}
	}

	/**
	 * Valhallaサーバーのステータス確認
	 */
	async checkStatus(): Promise<boolean> {
		try {
			const response = await this.fetchWithTimeout(
				`${this.baseUrl}/status`,
				{},
				5000,
			);
			return response.ok;
		} catch {
			return false;
		}
	}
}

// シングルトンインスタンス
export const valhallaService = new ValhallaService(
	process.env.VALHALLA_URL || 'http://localhost:8002',
);
