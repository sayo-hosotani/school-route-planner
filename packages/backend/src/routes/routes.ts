import type { FastifyInstance } from 'fastify';
import { valhallaService } from '../services/valhalla-service.js';
import { routeService } from '../services/route-service.js';
import { pointService } from '../services/point-service.js';

// TODO: 認証機能実装後に削除。現在は仮のユーザーIDを使用
// 注: database/seed.tsで作成した固定UUIDと一致させる必要がある
const TEMPORARY_USER_ID = '00000000-0000-0000-0000-000000000001';

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

	// 経路を保存（ポイントも含めて保存）
	fastify.post<{
		Body: {
			name: string;
			points: Array<{
				lat: number;
				lng: number;
				type: 'start' | 'waypoint' | 'goal';
				order: number;
				comment?: string;
			}>;
		};
	}>('/routes', async (request, reply) => {
		try {
			const { name, points } = request.body;

			// バリデーション
			if (!name || typeof name !== 'string') {
				return reply.status(400).send({
					success: false,
					message: '経路名が必要です',
				});
			}

			if (!points || !Array.isArray(points) || points.length < 2) {
				return reply.status(400).send({
					success: false,
					message: '最低2つのポイントが必要です',
				});
			}

			// 経路とポイントを一括作成
			const result = await routeService.createRouteWithPoints({
				user_id: TEMPORARY_USER_ID,
				name,
				points,
			});

			fastify.log.info(`Route saved successfully: ${result.route.id}`);

			return reply.status(201).send({
				success: true,
				message: 'Route saved successfully',
				data: result,
			});
		} catch (error) {
			fastify.log.error(error);
			const errorMessage =
				error instanceof Error ? error.message : 'Unknown error';
			return reply.status(500).send({
				success: false,
				message: `経路の保存に失敗しました: ${errorMessage}`,
			});
		}
	});

	// 経路一覧を取得
	fastify.get('/routes', async (request, reply) => {
		try {
			const routes = await routeService.getUserRoutes(TEMPORARY_USER_ID);

			fastify.log.info(`Loaded ${routes.length} routes`);

			return reply.status(200).send({
				success: true,
				data: routes,
			});
		} catch (error) {
			fastify.log.error(error);
			const errorMessage =
				error instanceof Error ? error.message : 'Unknown error';
			return reply.status(500).send({
				success: false,
				message: `経路の読み込みに失敗しました: ${errorMessage}`,
			});
		}
	});

	// 特定の経路を取得（ポイント込み）
	fastify.get<{ Params: { id: string } }>(
		'/routes/:id',
		async (request, reply) => {
			try {
				const { id } = request.params;

				const result = await routeService.getRouteWithPoints(
					id,
					TEMPORARY_USER_ID,
				);

				if (!result) {
					return reply.status(404).send({
						success: false,
						message: 'Route not found',
					});
				}

				fastify.log.info(`Route loaded: ${id}`);

				return reply.status(200).send({
					success: true,
					data: result,
				});
			} catch (error) {
				fastify.log.error(error);
				const errorMessage =
					error instanceof Error ? error.message : 'Unknown error';
				return reply.status(500).send({
					success: false,
					message: `経路の読み込みに失敗しました: ${errorMessage}`,
				});
			}
		},
	);

	// 経路を削除
	fastify.delete<{ Params: { id: string } }>(
		'/routes/:id',
		async (request, reply) => {
			try {
				const { id } = request.params;

				const deleted = await routeService.deleteRoute(id, TEMPORARY_USER_ID);

				if (!deleted) {
					return reply.status(404).send({
						success: false,
						message: 'Route not found',
					});
				}

				fastify.log.info(`Route deleted: ${id}`);

				return reply.status(200).send({
					success: true,
					message: 'Route deleted successfully',
				});
			} catch (error) {
				fastify.log.error(error);
				const errorMessage =
					error instanceof Error ? error.message : 'Unknown error';
				return reply.status(500).send({
					success: false,
					message: `経路の削除に失敗しました: ${errorMessage}`,
				});
			}
		},
	);
}
