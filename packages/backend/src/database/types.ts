/**
 * データベーステーブルの型定義
 * Kyselyの型推論で使用される
 */

import type { ColumnType } from 'kysely';

/**
 * 自動生成カラム型のヘルパー
 * SELECT時: T, INSERT時: T | undefined, UPDATE時: T
 */
export type Generated<T> = ColumnType<T, T | undefined, T>;

/**
 * タイムスタンプ型
 * - SELECT時: string（ISO 8601形式）
 * - INSERT時: never（DBのDEFAULT値を使用、プログラムから指定しない）
 * - UPDATE時: never（DBのトリガーで自動更新、プログラムから指定しない）
 */
export type Timestamp = ColumnType<string, never, never>;

/**
 * usersテーブル
 */
export interface UsersTable {
	id: Generated<string>;
	email: string;
	password_hash: string;
	name: string;
	created_at: Timestamp;
	updated_at: Timestamp;
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
	created_at: Timestamp;
	updated_at: Timestamp;
}

/**
 * routesテーブル
 */
export interface RoutesTable {
	id: Generated<string>;
	user_id: string;
	name: string;
	route_data: unknown; // JSONBカラム（Valhalla APIからの経路情報）
	created_at: Timestamp;
	updated_at: Timestamp;
}

/**
 * データベーススキーマ全体の型定義
 */
export interface Database {
	users: UsersTable;
	points: PointsTable;
	routes: RoutesTable;
}
