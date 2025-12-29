import Fastify from 'fastify';

const fastify = Fastify({
	logger: true,
});

fastify.get('/hello', async (request, reply) => {
	return { message: 'Hello World' };
});

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
