/**
 * Route Repository
 * routesテーブルへのデータアクセス層
 */

import { db } from '../database/database.js';
import type { InsertResult } from 'kysely';

export interface CreateRouteInput {
	user_id: string;
	name: string;
	route_data: unknown; // JSONB型
}

export interface UpdateRouteInput {
	name?: string;
	route_data?: unknown;
}

export interface Route {
	id: string;
	user_id: string;
	name: string;
	route_data: unknown;
	created_at: string;
	updated_at: string;
}

export class RouteRepository {
	/**
	 * 経路を作成
	 */
	async create(input: CreateRouteInput): Promise<Route> {
		const result = await db
			.insertInto('routes')
			.values(input)
			.returningAll()
			.executeTakeFirstOrThrow();

		return result as Route;
	}

	/**
	 * IDで経路を取得
	 */
	async findById(id: string, userId: string): Promise<Route | null> {
		const result = await db
			.selectFrom('routes')
			.selectAll()
			.where('id', '=', id)
			.where('user_id', '=', userId) // ユーザーIDでフィルタ（認可）
			.executeTakeFirst();

		return (result as Route) || null;
	}

	/**
	 * ユーザーIDで経路一覧を取得
	 */
	async findByUserId(userId: string, limit = 100): Promise<Route[]> {
		const results = await db
			.selectFrom('routes')
			.selectAll()
			.where('user_id', '=', userId)
			.orderBy('created_at', 'desc')
			.limit(limit)
			.execute();

		return results as Route[];
	}

	/**
	 * 経路を更新
	 */
	async update(
		id: string,
		userId: string,
		input: UpdateRouteInput,
	): Promise<Route | null> {
		const result = await db
			.updateTable('routes')
			.set(input)
			.where('id', '=', id)
			.where('user_id', '=', userId) // ユーザーIDでフィルタ（認可）
			.returningAll()
			.executeTakeFirst();

		return (result as Route) || null;
	}

	/**
	 * 経路を削除
	 */
	async delete(id: string, userId: string): Promise<boolean> {
		const result = await db
			.deleteFrom('routes')
			.where('id', '=', id)
			.where('user_id', '=', userId) // ユーザーIDでフィルタ（認可）
			.executeTakeFirst();

		return result.numDeletedRows > 0n;
	}

	/**
	 * ユーザーの全経路を削除
	 */
	async deleteByUserId(userId: string): Promise<number> {
		const result = await db
			.deleteFrom('routes')
			.where('user_id', '=', userId)
			.executeTakeFirst();

		return Number(result.numDeletedRows);
	}
}

// シングルトンインスタンス
export const routeRepository = new RouteRepository();
