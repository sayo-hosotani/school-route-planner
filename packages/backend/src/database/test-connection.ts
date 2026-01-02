/**
 * データベース接続テストスクリプト
 * Usage: npm run db:test --workspace=@route-planner/backend
 */

import { testConnection, closeConnection } from './database.js';

async function main() {
	const isConnected = await testConnection();
	await closeConnection();
	process.exit(isConnected ? 0 : 1);
}

main();
