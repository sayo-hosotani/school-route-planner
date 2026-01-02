/**
 * Point Service
 * ポイントに関するビジネスロジック層
 */

import { pointRepository, type CreatePointInput, type Point } from '../repositories/point-repository.js';

export class PointService {
	/**
	 * ポイントを作成
	 */
	async createPoint(input: CreatePointInput): Promise<Point> {
		// 座標のバリデーション
		this.validateCoordinates(input.lat, input.lng);

		return await pointRepository.create(input);
	}

	/**
	 * 複数のポイントを一括作成
	 */
	async createPoints(inputs: CreatePointInput[]): Promise<Point[]> {
		// 全ての座標をバリデーション
		for (const input of inputs) {
			this.validateCoordinates(input.lat, input.lng);
		}

		return await pointRepository.createMany(inputs);
	}

	/**
	 * ポイントを取得
	 */
	async getPoint(pointId: string, userId: string): Promise<Point | null> {
		return await pointRepository.findById(pointId, userId);
	}

	/**
	 * 経路のポイント一覧を取得
	 */
	async getRoutePoints(routeId: string, userId: string): Promise<Point[]> {
		return await pointRepository.findByRouteId(routeId, userId);
	}

	/**
	 * ユーザーのポイント一覧を取得
	 */
	async getUserPoints(userId: string, limit = 1000): Promise<Point[]> {
		return await pointRepository.findByUserId(userId, limit);
	}

	/**
	 * ポイントを更新
	 */
	async updatePoint(
		pointId: string,
		userId: string,
		updates: {
			lat?: number;
			lng?: number;
			type?: 'start' | 'waypoint' | 'goal';
			order?: number;
			comment?: string;
		},
	): Promise<Point | null> {
		// 座標が更新される場合はバリデーション
		if (updates.lat !== undefined || updates.lng !== undefined) {
			const point = await pointRepository.findById(pointId, userId);
			if (!point) {
				return null;
			}
			const newLat = updates.lat ?? point.lat;
			const newLng = updates.lng ?? point.lng;
			this.validateCoordinates(newLat, newLng);
		}

		return await pointRepository.update(pointId, userId, updates);
	}

	/**
	 * ポイントを削除
	 */
	async deletePoint(pointId: string, userId: string): Promise<boolean> {
		return await pointRepository.delete(pointId, userId);
	}

	/**
	 * 経路のポイントを全削除
	 */
	async deleteRoutePoints(routeId: string, userId: string): Promise<number> {
		return await pointRepository.deleteByRouteId(routeId, userId);
	}

	/**
	 * 座標のバリデーション
	 */
	private validateCoordinates(lat: number, lng: number): void {
		if (lat < -90 || lat > 90) {
			throw new Error(`Invalid latitude: ${lat}. Must be between -90 and 90.`);
		}
		if (lng < -180 || lng > 180) {
			throw new Error(`Invalid longitude: ${lng}. Must be between -180 and 180.`);
		}
	}
}

// シングルトンインスタンス
export const pointService = new PointService();
