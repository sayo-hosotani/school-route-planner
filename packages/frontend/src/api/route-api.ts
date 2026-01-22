import type { RouteData } from '../types/route';
import { del, get, post } from './client';
import {
	generateRoute as valhallaGenerateRoute,
	type Point,
	type RouteResult,
} from './valhalla-client';

export type { Point, RouteResult };

export interface SavedRoute {
	id: string;
	user_id: string;
	name: string;
	route_data: RouteResult;
	created_at: string;
	updated_at: string;
}

interface SaveRouteRequest {
	name: string;
	points: Array<{
		lat: number;
		lng: number;
		type: string;
		order: number;
		comment: string;
	}>;
}

interface RouteDetailResponse {
	route: SavedRoute;
	points: RouteData['points'];
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
	const requestBody: SaveRouteRequest = {
		name: routeName,
		points: routeData.points.map((p) => ({
			lat: p.lat,
			lng: p.lng,
			type: p.type,
			order: p.order,
			comment: p.comment || '',
		})),
	};

	await post<unknown, SaveRouteRequest>('/routes', requestBody);
}

/**
 * すべての保存済み経路を取得
 */
export async function getAllRoutes(): Promise<SavedRoute[]> {
	const data = await get<SavedRoute[]>('/routes');
	return data || [];
}

/**
 * 特定の経路を削除
 */
export async function deleteRoute(routeId: string): Promise<void> {
	await del(`/routes/${routeId}`);
}

/**
 * 特定の経路を読み込む
 */
export async function loadRouteById(routeId: string): Promise<RouteData> {
	const result = await get<RouteDetailResponse>(`/routes/${routeId}`);

	return {
		points: result.points || [],
		routeLine: result.route.route_data.coordinates.map(([lng, lat]: [number, number]) => [
			lat,
			lng,
		]),
		created_at: result.route.created_at,
		updated_at: result.route.updated_at,
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

	// 特定の経路のポイントを取得
	return loadRouteById(latestRoute.id);
}
