/**
 * データベースマイグレーション実行スクリプト
 * Usage: npx tsx src/database/migrate.ts
 */

import { promises as fs } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pool = new Pool({
	connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/route_planner',
});

async function runMigration() {
	try {
		console.log('🚀 Starting database migration...');

		// マイグレーションファイルのパス
		const migrationPath = join(__dirname, 'migrations', '001_initial_schema.sql');

		// SQLファイルを読み込む
		const sql = await fs.readFile(migrationPath, 'utf-8');

		// マイグレーションを実行
		await pool.query(sql);

		console.log('✅ Migration completed successfully');
	} catch (error) {
		console.error('❌ Migration failed:', error);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

runMigration();
