import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
	base: '/school-route-planner/',
	plugins: [react()],
	server: {
		port: 5173,
		host: true,
		proxy: {
			'/api/valhalla': {
				target: 'http://localhost:8002',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api\/valhalla/, ''),
			},
		},
	},
});
