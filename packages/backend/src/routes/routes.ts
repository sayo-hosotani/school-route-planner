import type { FastifyInstance } from 'fastify';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import type { RouteData } from '../models/route';
import { valhallaService } from '../services/valhalla-service';

const ROUTE_FILE_PATH = join(process.cwd(), 'route.txt');

interface Point {
	lat: number;
	lng: number;
	order: number;
}

interface GenerateRouteRequest {
	points: Point[];
}

export default async function routesRoutes(fastify: FastifyInstance) {
	// 経路を生成（Valhalla API）
	fastify.post<{ Body: GenerateRouteRequest }>(
		'/routes/generate',
		async (request, reply) => {
			try {
				const { points } = request.body;

				// バリデーション
				if (!points || !Array.isArray(points) || points.length < 2) {
					return reply.status(400).send({
						success: false,
						message: '最低2つのポイントが必要です',
					});
				}

				// 座標のバリデーション
				for (const point of points) {
					if (
						typeof point.lat !== 'number' ||
						typeof point.lng !== 'number' ||
						point.lat < -90 ||
						point.lat > 90 ||
						point.lng < -180 ||
						point.lng > 180
					) {
						return reply.status(400).send({
							success: false,
							message: '無効な座標データです',
						});
					}
				}

				// Valhalla APIで経路を生成
				const routeResult = await valhallaService.generateRoute(points);

				fastify.log.info(
					`Route generated: ${routeResult.distance}km, ${routeResult.duration}s`,
				);

				return reply.status(200).send({
					success: true,
					data: routeResult,
				});
			} catch (error) {
				fastify.log.error(error);
				const errorMessage =
					error instanceof Error ? error.message : 'Unknown error';
				return reply.status(500).send({
					success: false,
					message: `経路生成に失敗しました: ${errorMessage}`,
				});
			}
		},
	);

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
