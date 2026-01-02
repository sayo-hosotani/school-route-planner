/**
 * データベーステーブルの型定義
 * Kyselyの型推論で使用される
 */

import type { ColumnType } from 'kysely';

/**
 * Timestamp型のヘルパー
 * 作成時はundefined、取得時はDate、更新時はDate
 */
export type Generated<T> = ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

/**
 * usersテーブル
 */
export interface UsersTable {
	id: Generated<string>;
	email: string;
	password_hash: string;
	name: string;
	created_at: Generated<Timestamp>;
	updated_at: Generated<Timestamp>;
}

/**
 * pointsテーブル
 */
export interface PointsTable {
	id: Generated<string>;
	user_id: string;
	route_id: string | null;
	lat: number;
	lng: number;
	type: 'start' | 'waypoint' | 'goal';
	order: number;
	comment: string;
	created_at: Generated<Timestamp>;
	updated_at: Generated<Timestamp>;
}

/**
 * routesテーブル
 */
export interface RoutesTable {
	id: Generated<string>;
	user_id: string;
	name: string;
	route_data: unknown; // JSONBカラム（Valhalla APIからの経路情報）
	created_at: Generated<Timestamp>;
	updated_at: Generated<Timestamp>;
}

/**
 * データベーススキーマ全体の型定義
 */
export interface Database {
	users: UsersTable;
	points: PointsTable;
	routes: RoutesTable;
}
