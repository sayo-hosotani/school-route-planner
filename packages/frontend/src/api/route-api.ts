import type { RouteData } from '../types/route';

const API_BASE_URL = 'http://localhost:3000';

export interface ApiResponse<T> {
	success: boolean;
	message?: string;
	data?: T;
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
