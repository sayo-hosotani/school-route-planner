import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
	base: '/school-route-planner/',
	plugins: [react()],
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					'vendor-react': ['react', 'react-dom'],
					'vendor-leaflet': ['leaflet', 'react-leaflet'],
					'vendor-html2canvas': ['html2canvas'],
				},
			},
		},
	},
	server: {
		port: 5173,
		host: true,
		proxy: {
			'/api/valhalla': {
				// nginx gateway経由（docker-compose up gateway）で本番に近い構成を検証する
				// Viteのプロキシが同オリジンでフォワードするためCORSは発生しない
				target: `http://localhost:${process.env.GATEWAY_PORT ?? '8080'}`,
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api\/valhalla/, ''),
			},
		},
	},
});
