/**
 * Route Routes
 * 経路APIのエンドポイント登録
 */

import type { FastifyInstance } from 'fastify';
import {
	generateRoute,
	saveRoute,
	getRoutes,
	getRouteById,
	deleteRoute,
} from '../controllers/route-controller.js';

export default async function routeRoutes(fastify: FastifyInstance) {
	// 経路を生成（Valhalla API）
	fastify.post('/routes/generate', generateRoute);

	// 経路を保存（ポイントも含めて保存）
	fastify.post('/routes', saveRoute);

	// 経路一覧を取得
	fastify.get('/routes', getRoutes);

	// 特定の経路を取得（ポイント込み）
	fastify.get('/routes/:id', getRouteById);

	// 経路を削除
	fastify.delete('/routes/:id', deleteRoute);
}
