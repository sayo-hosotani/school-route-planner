/**
 * Point Repository
 * pointsテーブルへのデータアクセス層
 */

import { db } from '../database/index.js';

export interface CreatePointInput {
	user_id: string;
	route_id?: string | null;
	lat: number;
	lng: number;
	type: 'start' | 'waypoint' | 'goal';
	order: number;
	comment?: string;
}

export interface UpdatePointInput {
	lat?: number;
	lng?: number;
	type?: 'start' | 'waypoint' | 'goal';
	order?: number;
	comment?: string;
	route_id?: string | null;
}

export interface Point {
	id: string;
	user_id: string;
	route_id: string | null;
	lat: number;
	lng: number;
	type: 'start' | 'waypoint' | 'goal';
	order: number;
	comment: string;
	created_at: string;
	updated_at: string;
}

export class PointRepository {
	/**
	 * ポイントを作成
	 */
	async create(input: CreatePointInput): Promise<Point> {
		const result = await db
			.insertInto('points')
			.values({
				...input,
				comment: input.comment || '',
			})
			.returningAll()
			.executeTakeFirstOrThrow();

		return result as Point;
	}

	/**
	 * 複数のポイントを一括作成
	 */
	async createMany(inputs: CreatePointInput[]): Promise<Point[]> {
		if (inputs.length === 0) {
			return [];
		}

		const results = await db
			.insertInto('points')
			.values(
				inputs.map((input) => ({
					...input,
					comment: input.comment || '',
				})),
			)
			.returningAll()
			.execute();

		return results as Point[];
	}

	/**
	 * IDでポイントを取得
	 */
	async findById(id: string, userId: string): Promise<Point | null> {
		const result = await db
			.selectFrom('points')
			.selectAll()
			.where('id', '=', id)
			.where('user_id', '=', userId) // ユーザーIDでフィルタ（認可）
			.executeTakeFirst();

		return (result as Point) || null;
	}

	/**
	 * 経路IDでポイント一覧を取得
	 */
	async findByRouteId(routeId: string, userId: string): Promise<Point[]> {
		const results = await db
			.selectFrom('points')
			.selectAll()
			.where('route_id', '=', routeId)
			.where('user_id', '=', userId) // ユーザーIDでフィルタ（認可）
			.orderBy('order', 'asc')
			.execute();

		return results as Point[];
	}

	/**
	 * ユーザーIDでポイント一覧を取得
	 */
	async findByUserId(userId: string, limit = 1000): Promise<Point[]> {
		const results = await db
			.selectFrom('points')
			.selectAll()
			.where('user_id', '=', userId)
			.orderBy('created_at', 'desc')
			.limit(limit)
			.execute();

		return results as Point[];
	}

	/**
	 * ポイントを更新
	 */
	async update(
		id: string,
		userId: string,
		input: UpdatePointInput,
	): Promise<Point | null> {
		const result = await db
			.updateTable('points')
			.set(input)
			.where('id', '=', id)
			.where('user_id', '=', userId) // ユーザーIDでフィルタ（認可）
			.returningAll()
			.executeTakeFirst();

		return (result as Point) || null;
	}

	/**
	 * ポイントを削除
	 */
	async delete(id: string, userId: string): Promise<boolean> {
		const result = await db
			.deleteFrom('points')
			.where('id', '=', id)
			.where('user_id', '=', userId) // ユーザーIDでフィルタ（認可）
			.executeTakeFirst();

		return result.numDeletedRows > 0n;
	}

	/**
	 * 経路に紐づく全ポイントを削除
	 */
	async deleteByRouteId(routeId: string, userId: string): Promise<number> {
		const result = await db
			.deleteFrom('points')
			.where('route_id', '=', routeId)
			.where('user_id', '=', userId) // ユーザーIDでフィルタ（認可）
			.executeTakeFirst();

		return Number(result.numDeletedRows);
	}

	/**
	 * ユーザーの全ポイントを削除
	 */
	async deleteByUserId(userId: string): Promise<number> {
		const result = await db
			.deleteFrom('points')
			.where('user_id', '=', userId)
			.executeTakeFirst();

		return Number(result.numDeletedRows);
	}
}

// シングルトンインスタンス
export const pointRepository = new PointRepository();
