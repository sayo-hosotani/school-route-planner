import type { RouteData } from '../types/route';
import { validateImportData } from '../utils/validate-import';
import {
	generateRoute as valhallaGenerateRoute,
	type Point,
	type RouteResult,
} from './valhalla-client';

export type { Point, RouteResult };

export interface SavedRoute {
	id: string;
	name: string;
	routeLine: [number, number][]; // [lat, lng] 形式で保存
	points: RouteData['points'];
	created_at: string;
	updated_at: string;
}

// メモリ上で経路データを管理（ブラウザリロードでクリアされる）
let storedRoutes: SavedRoute[] = [];

/**
 * メモリ上の経路データをリセットする（テスト用）
 */
export function resetRoutes(): void {
	storedRoutes = [];
}

/**
 * ポイントから経路を生成する（Valhalla APIを直接呼び出し）
 */
export async function generateRoute(points: Point[]): Promise<RouteResult> {
	return valhallaGenerateRoute(points);
}

/**
 * 経路データを保存する
 */
export async function saveRoute(routeData: RouteData, routeName: string): Promise<void> {
	const now = new Date().toISOString();

	const newRoute: SavedRoute = {
		id: crypto.randomUUID(),
		name: routeName,
		routeLine: routeData.routeLine,
		points: routeData.points,
		created_at: now,
		updated_at: now,
	};

	storedRoutes = [...storedRoutes, newRoute];
}

/**
 * すべての保存済み経路を取得
 */
export async function getAllRoutes(): Promise<SavedRoute[]> {
	return [...storedRoutes];
}

/**
 * 特定の経路を削除
 */
export async function deleteRoute(routeId: string): Promise<void> {
	storedRoutes = storedRoutes.filter((r) => r.id !== routeId);
}

/**
 * 特定の経路を読み込む
 */
export async function loadRouteById(routeId: string): Promise<RouteData> {
	const route = storedRoutes.find((r) => r.id === routeId);

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
	if (storedRoutes.length === 0) {
		return null;
	}

	const latestRoute = storedRoutes[storedRoutes.length - 1];

	return loadRouteById(latestRoute.id);
}

/**
 * 経路をJSONファイルとしてエクスポート
 */
export function exportRoutesToJson(): string {
	return JSON.stringify(storedRoutes, null, 2);
}

/**
 * JSONファイルから経路をインポート（既存経路の後ろに追加）
 */
export function importRoutesFromJson(jsonString: string, position: 'before' | 'after' = 'after'): number {
	const importedRoutes = JSON.parse(jsonString);

	const validation = validateImportData(importedRoutes);
	if (!validation.valid) {
		throw new Error(validation.errors.join('\n'));
	}

	// IDを再生成して重複を防ぐ
	const now = new Date().toISOString();
	const routesWithNewIds = importedRoutes.map((route) => ({
		...route,
		id: crypto.randomUUID(),
		updated_at: now,
	}));

	storedRoutes = position === 'before'
		? [...routesWithNewIds, ...storedRoutes]
		: [...storedRoutes, ...routesWithNewIds];

	return routesWithNewIds.length;
}
