import type { FastifyInstance } from 'fastify';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import type { RouteData } from '../models/route';

const ROUTE_FILE_PATH = join(process.cwd(), 'route.txt');

export default async function routesRoutes(fastify: FastifyInstance) {
	// 経路を保存
	fastify.post<{ Body: RouteData }>('/routes', async (request, reply) => {
		try {
			const routeData = request.body;

			// タイムスタンプを更新
			const dataToSave = {
				...routeData,
				updated_at: new Date().toISOString(),
			};

			// JSONとしてシリアライズして保存
			await fs.writeFile(ROUTE_FILE_PATH, JSON.stringify(dataToSave, null, 2), 'utf-8');

			fastify.log.info('Route saved successfully');

			return reply.status(201).send({
				success: true,
				message: 'Route saved successfully',
				data: dataToSave,
			});
		} catch (error) {
			fastify.log.error(error);
			return reply.status(500).send({
				success: false,
				message: 'Failed to save route',
			});
		}
	});

	// 経路を読み込み
	fastify.get('/routes', async (request, reply) => {
		try {
			// ファイルが存在するか確認
			try {
				await fs.access(ROUTE_FILE_PATH);
			} catch {
				return reply.status(404).send({
					success: false,
					message: 'No saved route found',
				});
			}

			// ファイルを読み込んでパース
			const fileContent = await fs.readFile(ROUTE_FILE_PATH, 'utf-8');
			const routeData: RouteData = JSON.parse(fileContent);

			fastify.log.info('Route loaded successfully');

			return reply.status(200).send({
				success: true,
				data: routeData,
			});
		} catch (error) {
			fastify.log.error(error);
			return reply.status(500).send({
				success: false,
				message: 'Failed to load route',
			});
		}
	});
}
