import { beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadMapAsImage } from './map-download';

vi.mock('html2canvas', () => ({
	default: vi.fn(),
}));

import html2canvas from 'html2canvas';

describe('downloadMapAsImage', () => {
	let mapElement: HTMLElement;
	let mockCanvas: HTMLCanvasElement;
	let mockAnchor: HTMLAnchorElement;

	beforeEach(() => {
		vi.clearAllMocks();

		// 地図要素のセットアップ
		mapElement = document.createElement('div');
		mapElement.className = 'leaflet-container';

		// コントロールコンテナのセットアップ
		const controlContainer = document.createElement('div');
		controlContainer.className = 'leaflet-control-container';

		const scaleControl = document.createElement('div');
		scaleControl.className = 'leaflet-control leaflet-control-scale';

		const zoomControl = document.createElement('div');
		zoomControl.className = 'leaflet-control leaflet-control-zoom';

		controlContainer.appendChild(scaleControl);
		controlContainer.appendChild(zoomControl);
		mapElement.appendChild(controlContainer);
		document.body.appendChild(mapElement);

		// キャンバスのモック
		mockCanvas = document.createElement('canvas');
		mockCanvas.toDataURL = vi.fn(() => 'data:image/png;base64,mock');
		vi.mocked(html2canvas).mockResolvedValue(mockCanvas);

		// アンカー要素のモック
		mockAnchor = document.createElement('a');
		mockAnchor.click = vi.fn();
		vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
			if (tag === 'a') return mockAnchor;
			return document.createElement(tag);
		});
	});

	afterEach(() => {
		document.body.removeChild(mapElement);
		vi.restoreAllMocks();
	});

	it('html2canvasを呼び出してPNG画像をダウンロードする', async () => {
		await downloadMapAsImage(mapElement);

		expect(html2canvas).toHaveBeenCalledWith(mapElement, { useCORS: true, logging: false });
		expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
		expect(mockAnchor.href).toBe('data:image/png;base64,mock');
		expect(mockAnchor.download).toMatch(/^school-route-\d{4}-\d{2}-\d{2}\.png$/);
		expect(mockAnchor.click).toHaveBeenCalled();
	});

	it('スケールコントロール以外のコントロールをキャプチャ前に非表示にする', async () => {
		const zoomControl = mapElement.querySelector<HTMLElement>('.leaflet-control-zoom');
		expect(zoomControl).not.toBeNull();

		let visibilityDuringCapture = '';
		vi.mocked(html2canvas).mockImplementation(async () => {
			visibilityDuringCapture = zoomControl!.style.visibility;
			return mockCanvas;
		});

		await downloadMapAsImage(mapElement);

		expect(visibilityDuringCapture).toBe('hidden');
	});

	it('キャプチャ後にコントロールの表示を元に戻す', async () => {
		const zoomControl = mapElement.querySelector<HTMLElement>('.leaflet-control-zoom');
		expect(zoomControl).not.toBeNull();

		await downloadMapAsImage(mapElement);

		expect(zoomControl!.style.visibility).toBe('');
	});

	it('スケールコントロールは非表示にしない', async () => {
		const scaleControl = mapElement.querySelector<HTMLElement>('.leaflet-control-scale');
		expect(scaleControl).not.toBeNull();

		let scaleVisibilityDuringCapture = '';
		vi.mocked(html2canvas).mockImplementation(async () => {
			scaleVisibilityDuringCapture = scaleControl!.style.visibility;
			return mockCanvas;
		});

		await downloadMapAsImage(mapElement);

		expect(scaleVisibilityDuringCapture).toBe('');
	});

	it('html2canvasが失敗した場合でもコントロールの表示を元に戻す', async () => {
		const zoomControl = mapElement.querySelector<HTMLElement>('.leaflet-control-zoom');
		vi.mocked(html2canvas).mockRejectedValue(new Error('CORS error'));

		await expect(downloadMapAsImage(mapElement)).rejects.toThrow('CORS error');

		expect(zoomControl!.style.visibility).toBe('');
	});
});
