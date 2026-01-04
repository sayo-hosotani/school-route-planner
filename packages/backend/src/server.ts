import Fastify from 'fastify';
import cors from '@fastify/cors';
import routesRoutes from './routes/routes';

const fastify = Fastify({
	logger: true,
});

// CORS設定（フロントエンドからのアクセスを許可）
fastify.register(cors, {
	origin: 'http://localhost:5173', // Viteのデフォルトポート
});

// ルート登録
fastify.register(routesRoutes);

const start = async () => {
	try {
		await fastify.listen({ port: 3000, host: '0.0.0.0' });
		fastify.log.info('Server is running on http://localhost:3000');
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
