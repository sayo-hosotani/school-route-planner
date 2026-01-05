/**
 * データベースマイグレーション実行スクリプト
 * Usage: npx tsx scripts/migrate.ts
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

		// マイグレーション管理テーブルを作成
		await pool.query(`
			CREATE TABLE IF NOT EXISTS schema_migrations (
				id SERIAL PRIMARY KEY,
				filename VARCHAR(255) UNIQUE NOT NULL,
				executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
			)
		`);

		// マイグレーションディレクトリ内のSQLファイルを取得（scripts/ の隣の migrations/）
		const migrationsDir = join(__dirname, '..', 'migrations');
		const files = await fs.readdir(migrationsDir);
		const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

		// 実行済みのマイグレーションを取得
		const { rows: executed } = await pool.query('SELECT filename FROM schema_migrations');
		const executedFiles = new Set(executed.map(r => r.filename));

		// 未実行のマイグレーションを順次実行
		for (const file of sqlFiles) {
			if (executedFiles.has(file)) {
				console.log(`⏭️  Skipping ${file} (already executed)`);
				continue;
			}

			console.log(`📄 Running ${file}...`);
			const sql = await fs.readFile(join(migrationsDir, file), 'utf-8');
			await pool.query(sql);
			await pool.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
			console.log(`✅ ${file} completed`);
		}

		console.log('✅ All migrations completed successfully');
	} catch (error) {
		console.error('❌ Migration failed:', error);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

runMigration();
