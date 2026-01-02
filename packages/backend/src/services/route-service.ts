/**
 * Route Service
 * 経路に関するビジネスロジック層
 */

import { routeRepository, type CreateRouteInput, type Route } from '../repositories/route-repository.js';
import { pointRepository, type CreatePointInput, type Point } from '../repositories/point-repository.js';
import { valhallaService } from './valhalla-service.js';

export interface CreateRouteWithPointsInput {
	user_id: string;
	name: string;
	points: Array<{
		lat: number;
		lng: number;
		type: 'start' | 'waypoint' | 'goal';
		order: number;
		comment?: string;
	}>;
}

export interface RouteWithPoints {
	route: Route;
	points: Point[];
}

export class RouteService {
	/**
	 * 経路とポイントを一括作成
	 * トランザクション内で経路とポイントを作成する
	 */
	async createRouteWithPoints(
		input: CreateRouteWithPointsInput,
	): Promise<RouteWithPoints> {
		// Valhalla APIで経路データを生成
		const routeData = await valhallaService.generateRoute(
			input.points.map((p) => ({
				lat: p.lat,
				lng: p.lng,
				order: p.order,
			})),
		);

		// 経路を作成
		const route = await routeRepository.create({
			user_id: input.user_id,
			name: input.name,
			route_data: routeData,
		});

		// ポイントを一括作成
		const pointInputs: CreatePointInput[] = input.points.map((p) => ({
			user_id: input.user_id,
			route_id: route.id,
			lat: p.lat,
			lng: p.lng,
			type: p.type,
			order: p.order,
			comment: p.comment || '',
		}));

		const points = await pointRepository.createMany(pointInputs);

		return {
			route,
			points,
		};
	}

	/**
	 * 経路IDで経路とポイントを取得
	 */
	async getRouteWithPoints(
		routeId: string,
		userId: string,
	): Promise<RouteWithPoints | null> {
		const route = await routeRepository.findById(routeId, userId);
		if (!route) {
			return null;
		}

		const points = await pointRepository.findByRouteId(routeId, userId);

		return {
			route,
			points,
		};
	}

	/**
	 * ユーザーの経路一覧を取得
	 */
	async getUserRoutes(userId: string, limit = 100): Promise<Route[]> {
		return await routeRepository.findByUserId(userId, limit);
	}

	/**
	 * 経路を更新
	 */
	async updateRoute(
		routeId: string,
		userId: string,
		name: string,
	): Promise<Route | null> {
		return await routeRepository.update(routeId, userId, { name });
	}

	/**
	 * 経路を削除（関連するポイントも削除される）
	 */
	async deleteRoute(routeId: string, userId: string): Promise<boolean> {
		// PostgreSQLのON DELETE CASCADEにより、関連するポイントも自動削除される
		return await routeRepository.delete(routeId, userId);
	}

	/**
	 * 経路の再生成（既存のポイントから新しい経路データを生成）
	 */
	async regenerateRoute(
		routeId: string,
		userId: string,
	): Promise<Route | null> {
		// 既存のポイントを取得
		const points = await pointRepository.findByRouteId(routeId, userId);

		if (points.length < 2) {
			throw new Error('経路の再生成には最低2つのポイントが必要です');
		}

		// Valhalla APIで経路データを生成
		const routeData = await valhallaService.generateRoute(
			points.map((p) => ({
				lat: p.lat,
				lng: p.lng,
				order: p.order,
			})),
		);

		// 経路データを更新
		return await routeRepository.update(routeId, userId, { route_data: routeData });
	}
}

// シングルトンインスタンス
export const routeService = new RouteService();
