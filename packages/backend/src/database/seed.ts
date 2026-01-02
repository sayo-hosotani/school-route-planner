/**
 * データベースシードスクリプト
 * テスト用の初期データを挿入
 * Usage: npm run seed --workspace=@route-planner/backend
 */

import { db } from './database.js';

// 固定のUUID（仮ユーザー用）
const TEMPORARY_USER_ID = '00000000-0000-0000-0000-000000000001';

async function seed() {
	try {
		console.log('🌱 Starting database seeding...');

		// 仮ユーザーが既に存在するかチェック（emailで検索）
		const existingUser = await db
			.selectFrom('users')
			.selectAll()
			.where('email', '=', 'temporary@example.com')
			.executeTakeFirst();

		if (existingUser) {
			console.log('✅ Temporary user already exists, skipping...');
			console.log(`   User ID: ${existingUser.id}`);
		} else {
			// 仮ユーザーを作成
			const newUser = await db
				.insertInto('users')
				.values({
					id: TEMPORARY_USER_ID,
					email: 'temporary@example.com',
					password_hash: 'not-used', // 認証未実装のため仮の値
					name: 'Temporary User',
				})
				.returningAll()
				.executeTakeFirstOrThrow();

			console.log('✅ Temporary user created');
			console.log(`   User ID: ${newUser.id}`);
		}

		console.log('🎉 Database seeding completed successfully');
	} catch (error) {
		console.error('❌ Seeding failed:', error);
		process.exit(1);
	} finally {
		await db.destroy();
	}
}

seed();
