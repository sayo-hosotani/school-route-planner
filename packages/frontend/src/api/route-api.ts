import type { RouteData } from '../types/route';
import {
	generateRoute as valhallaGenerateRoute,
	type Point,
	type RouteResult,
} from './valhalla-client';

export type { Point, RouteResult };

// ローカルストレージのキー
const STORAGE_KEY = 'route-planner-saved-routes';

export interface SavedRoute {
	id: string;
	name: string;
	routeLine: [number, number][]; // [lat, lng] 形式で保存
	points: RouteData['points'];
	created_at: string;
	updated_at: string;
}

/**
 * ポイントから経路を生成する（Valhalla APIを直接呼び出し）
 */
export async function generateRoute(points: Point[]): Promise<RouteResult> {
	return valhallaGenerateRoute(points);
}

/**
 * ローカルストレージから全経路を取得
 */
function getStoredRoutes(): SavedRoute[] {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return [];
		return JSON.parse(stored) as SavedRoute[];
	} catch {
		return [];
	}
}

/**
 * ローカルストレージに経路を保存
 */
function setStoredRoutes(routes: SavedRoute[]): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
}

/**
 * 経路データを保存する
 */
export async function saveRoute(routeData: RouteData, routeName: string): Promise<void> {
	const routes = getStoredRoutes();
	const now = new Date().toISOString();

	const newRoute: SavedRoute = {
		id: crypto.randomUUID(),
		name: routeName,
		routeLine: routeData.routeLine,
		points: routeData.points,
		created_at: now,
		updated_at: now,
	};

	routes.push(newRoute);
	setStoredRoutes(routes);
}

/**
 * すべての保存済み経路を取得
 */
export async function getAllRoutes(): Promise<SavedRoute[]> {
	return getStoredRoutes();
}

/**
 * 特定の経路を削除
 */
export async function deleteRoute(routeId: string): Promise<void> {
	const routes = getStoredRoutes();
	const filtered = routes.filter((r) => r.id !== routeId);
	setStoredRoutes(filtered);
}

/**
 * 特定の経路を読み込む
 */
export async function loadRouteById(routeId: string): Promise<RouteData> {
	const routes = getStoredRoutes();
	const route = routes.find((r) => r.id === routeId);

	if (!route) {
		throw new Error('経路が見つかりません');
	}

	return {
		points: route.points,
		routeLine: route.routeLine,
		created_at: route.created_at,
		updated_at: route.updated_at,
	};
}

/**
 * 保存済み経路データを読み込む（最新の1件）
 */
export async function loadRoute(): Promise<RouteData | null> {
	const routes = await getAllRoutes();

	if (!routes || routes.length === 0) {
		return null;
	}

	const latestRoute = routes[routes.length - 1];

	return loadRouteById(latestRoute.id);
}

/**
 * 経路をJSONファイルとしてエクスポート
 */
export function exportRoutesToJson(): string {
	const routes = getStoredRoutes();
	return JSON.stringify(routes, null, 2);
}

/**
 * JSONファイルから経路をインポート（既存経路の後ろに追加）
 */
export function importRoutesFromJson(jsonString: string, position: 'before' | 'after' = 'after'): number {
	const importedRoutes = JSON.parse(jsonString) as SavedRoute[];

	if (!Array.isArray(importedRoutes)) {
		throw new Error('無効なJSONフォーマットです');
	}

	// IDを再生成して重複を防ぐ
	const now = new Date().toISOString();
	const routesWithNewIds = importedRoutes.map((route) => ({
		...route,
		id: crypto.randomUUID(),
		updated_at: now,
	}));

	const existingRoutes = getStoredRoutes();

	const mergedRoutes = position === 'before'
		? [...routesWithNewIds, ...existingRoutes]
		: [...existingRoutes, ...routesWithNewIds];

	setStoredRoutes(mergedRoutes);

	return routesWithNewIds.length;
}
