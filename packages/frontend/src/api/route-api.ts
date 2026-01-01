import type { RouteData } from '../types/route';

const API_BASE_URL = 'http://localhost:3000';

export interface ApiResponse<T> {
	success: boolean;
	message?: string;
	data?: T;
}

export interface Point {
	lat: number;
	lng: number;
	order: number;
}

export interface RouteResult {
	coordinates: Array<[number, number]>; // [lng, lat] の配列（GeoJSON形式）
	distance: number; // キロメートル
	duration: number; // 秒
	summary: {
		has_toll: boolean;
		has_highway: boolean;
		has_ferry: boolean;
	};
}

/**
 * ポイントから経路を生成する（Valhalla API経由）
 */
export async function generateRoute(points: Point[]): Promise<ApiResponse<RouteResult>> {
	try {
		const response = await fetch(`${API_BASE_URL}/routes/generate`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ points }),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Failed to generate route:', error);
		throw error;
	}
}

/**
 * 経路データを保存する
 */
export async function saveRoute(routeData: RouteData): Promise<ApiResponse<RouteData>> {
	try {
		const response = await fetch(`${API_BASE_URL}/routes`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(routeData),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Failed to save route:', error);
		throw error;
	}
}

/**
 * 保存済み経路データを読み込む
 */
export async function loadRoute(): Promise<ApiResponse<RouteData>> {
	try {
		const response = await fetch(`${API_BASE_URL}/routes`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			if (response.status === 404) {
				return {
					success: false,
					message: 'No saved route found',
				};
			}
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Failed to load route:', error);
		throw error;
	}
}
