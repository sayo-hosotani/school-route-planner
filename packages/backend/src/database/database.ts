/**
 * データベース接続設定
 * Kyselyインスタンスを作成・エクスポート
 */

import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import type { Database } from './types';

/**
 * PostgreSQL接続プール
 */
const pool = new Pool({
	connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/route_planner',
	max: 10, // 最大接続数
	idleTimeoutMillis: 30000, // アイドルタイムアウト
	connectionTimeoutMillis: 2000, // 接続タイムアウト
});

/**
 * Kyselyデータベースインスタンス
 * アプリケーション全体で共有されるシングルトン
 */
export const db = new Kysely<Database>({
	dialect: new PostgresDialect({
		pool,
	}),
	log(event) {
		// クエリログ（開発環境のみ）
		if (process.env.NODE_ENV !== 'production' && event.level === 'query') {
			console.log(`[DB Query] ${event.query.sql}`);
			console.log(`[DB Params] ${JSON.stringify(event.query.parameters)}`);
		}
	},
});

/**
 * データベース接続をテスト
 */
export async function testConnection(): Promise<boolean> {
	try {
		await db.selectFrom('pg_catalog.pg_tables').select('tablename').limit(1).execute();
		console.log('✅ Database connection successful');
		return true;
	} catch (error) {
		console.error('❌ Database connection failed:', error);
		return false;
	}
}

/**
 * データベース接続をクローズ
 */
export async function closeConnection(): Promise<void> {
	await db.destroy();
	console.log('Database connection closed');
}
