import { beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadMapAsImage } from './map-download';

vi.mock('html2canvas', () => ({
	default: vi.fn(),
}));

import html2canvas from 'html2canvas';

describe('downloadMapAsImage', () => {
	let mapElement: HTMLElement;
	let mapPane: HTMLElement;
	let overlayPane: HTMLElement;
	let overlaySvg: SVGElement;
	let markerPane: HTMLElement;
	let mockCanvas: HTMLCanvasElement;
	let mockAnchor: HTMLAnchorElement;

	beforeEach(() => {
		vi.clearAllMocks();

		// Leaflet の DOM 構造を再現
		mapElement = document.createElement('div');
		mapElement.className = 'leaflet-container';

		mapPane = document.createElement('div');
		mapPane.className = 'leaflet-map-pane';

		const tilePane = document.createElement('div');
		tilePane.className = 'leaflet-tile-pane';

		overlayPane = document.createElement('div');
		overlayPane.className = 'leaflet-overlay-pane';

		overlaySvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		overlaySvg.style.transform = 'translate3d(-200px, -150px, 0px)';
		overlayPane.appendChild(overlaySvg);

		markerPane = document.createElement('div');
		markerPane.className = 'leaflet-marker-pane';

		mapPane.appendChild(tilePane);
		mapPane.appendChild(overlayPane);
		mapPane.appendChild(markerPane);
		mapElement.appendChild(mapPane);

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

		mockCanvas = document.createElement('canvas');
		mockCanvas.toDataURL = vi.fn(() => 'data:image/png;base64,mock');
		vi.mocked(html2canvas).mockResolvedValue(mockCanvas);

		mockAnchor = document.createElement('a');
		mockAnchor.click = vi.fn();
		const originalCreateElement = document.createElement.bind(document);
		vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
			if (tag === 'a') return mockAnchor;
			return originalCreateElement(tag);
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
		await downloadMapAsImage(mapElement);
		expect(zoomControl!.style.visibility).toBe('');
	});

	it('スケールコントロールは非表示にしない', async () => {
		const scaleControl = mapElement.querySelector<HTMLElement>('.leaflet-control-scale');
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

	describe('SVGクローンによる経路の合成', () => {
		it('キャプチャ前にoverlay-paneを非表示にする', async () => {
			let overlayVisibilityDuringCapture = '';
			vi.mocked(html2canvas).mockImplementation(async () => {
				overlayVisibilityDuringCapture = overlayPane.style.visibility;
				return mockCanvas;
			});

			await downloadMapAsImage(mapElement);

			expect(overlayVisibilityDuringCapture).toBe('hidden');
		});

		it('SVGクローンをmarker-paneの前に挿入する', async () => {
			let svgCountDuringCapture = 0;
			let cloneIsBeforeMarker = false;
			vi.mocked(html2canvas).mockImplementation(async () => {
				svgCountDuringCapture = mapPane.querySelectorAll('svg').length;
				const children = Array.from(mapPane.children);
				const wrapperIndex = children.findIndex((c) => c.contains(overlaySvg) === false && c.querySelector('svg'));
				const markerIndex = children.indexOf(markerPane);
				cloneIsBeforeMarker = wrapperIndex !== -1 && wrapperIndex < markerIndex;
				return mockCanvas;
			});

			await downloadMapAsImage(mapElement);

			expect(svgCountDuringCapture).toBe(2); // 元の SVG + クローン
			expect(cloneIsBeforeMarker).toBe(true);
		});

		it('SVGクローンのtransformをnoneに設定する', async () => {
			let cloneTransform = '';
			vi.mocked(html2canvas).mockImplementation(async () => {
				// mapPane 内の overlay-pane 以外の SVG がクローン
				const cloneSvg = Array.from(mapPane.querySelectorAll('svg')).find(
					(s) => !overlayPane.contains(s),
				);
				cloneTransform = cloneSvg?.style.transform ?? '';
				return mockCanvas;
			});

			await downloadMapAsImage(mapElement);

			expect(cloneTransform).toBe('none');
		});

		it('キャプチャ後にSVGラッパーを削除する', async () => {
			await downloadMapAsImage(mapElement);

			// クリーンアップ後はクローンが消え、SVG は元の overlay-pane 内の 1 つだけ
			expect(mapPane.querySelectorAll('svg').length).toBe(1);
			expect(overlayPane.contains(mapPane.querySelector('svg'))).toBe(true);
		});

		it('キャプチャ後にoverlay-paneの表示を元に戻す', async () => {
			await downloadMapAsImage(mapElement);
			expect(overlayPane.style.visibility).toBe('');
		});

		it('html2canvasが失敗した場合でもSVGラッパーを削除する', async () => {
			vi.mocked(html2canvas).mockRejectedValue(new Error('CORS error'));

			await expect(downloadMapAsImage(mapElement)).rejects.toThrow('CORS error');

			expect(mapPane.querySelectorAll('svg').length).toBe(1);
		});

		it('html2canvasが失敗した場合でもoverlay-paneの表示を元に戻す', async () => {
			vi.mocked(html2canvas).mockRejectedValue(new Error('CORS error'));

			await expect(downloadMapAsImage(mapElement)).rejects.toThrow('CORS error');

			expect(overlayPane.style.visibility).toBe('');
		});

		it('SVGラッパーのpositionがabsoluteに設定されている', async () => {
			let wrapperPosition = '';
			vi.mocked(html2canvas).mockImplementation(async () => {
				wrapperPosition = (markerPane.previousElementSibling as HTMLElement)?.style.position ?? '';
				return mockCanvas;
			});

			await downloadMapAsImage(mapElement);

			expect(wrapperPosition).toBe('absolute');
		});

		it('SVGラッパーのzIndexが300に設定されている', async () => {
			let wrapperZIndex = '';
			vi.mocked(html2canvas).mockImplementation(async () => {
				wrapperZIndex = (markerPane.previousElementSibling as HTMLElement)?.style.zIndex ?? '';
				return mockCanvas;
			});

			await downloadMapAsImage(mapElement);

			expect(wrapperZIndex).toBe('300');
		});

		it('SVGラッパーのoverflowがvisibleに設定されている', async () => {
			let wrapperOverflow = '';
			vi.mocked(html2canvas).mockImplementation(async () => {
				wrapperOverflow = (markerPane.previousElementSibling as HTMLElement)?.style.overflow ?? '';
				return mockCanvas;
			});

			await downloadMapAsImage(mapElement);

			expect(wrapperOverflow).toBe('visible');
		});

		it('SVGラッパーのpointerEventsがnoneに設定されている', async () => {
			let wrapperPointerEvents = '';
			vi.mocked(html2canvas).mockImplementation(async () => {
				wrapperPointerEvents =
					(markerPane.previousElementSibling as HTMLElement)?.style.pointerEvents ?? '';
				return mockCanvas;
			});

			await downloadMapAsImage(mapElement);

			expect(wrapperPointerEvents).toBe('none');
		});

		it('SVGラッパーの位置をgetBoundingClientRectの差分で設定する', async () => {
			vi.spyOn(mapElement, 'getBoundingClientRect').mockReturnValue({
				left: 100,
				top: 50,
				right: 900,
				bottom: 650,
				width: 800,
				height: 600,
				x: 100,
				y: 50,
				toJSON: () => {},
			} as DOMRect);
			vi.spyOn(overlaySvg, 'getBoundingClientRect').mockReturnValue({
				left: 80,
				top: 30,
				right: 880,
				bottom: 630,
				width: 800,
				height: 600,
				x: 80,
				y: 30,
				toJSON: () => {},
			} as DOMRect);

			let wrapperLeft = '';
			let wrapperTop = '';
			vi.mocked(html2canvas).mockImplementation(async () => {
				const wrapper = markerPane.previousElementSibling as HTMLElement;
				wrapperLeft = wrapper?.style.left ?? '';
				wrapperTop = wrapper?.style.top ?? '';
				return mockCanvas;
			});

			await downloadMapAsImage(mapElement);

			// svgRect.left(80) - containerRect.left(100) = -20
			// svgRect.top(30) - containerRect.top(50) = -20
			expect(wrapperLeft).toBe('-20px');
			expect(wrapperTop).toBe('-20px');
		});
	});

	describe('overlay-pane にSVGがない場合', () => {
		beforeEach(() => {
			overlayPane.removeChild(overlaySvg);
		});

		it('正常にキャプチャを実行する', async () => {
			await downloadMapAsImage(mapElement);

			expect(html2canvas).toHaveBeenCalled();
			expect(mockAnchor.click).toHaveBeenCalled();
		});

		it('overlay-pane の visibility を変更しない', async () => {
			let overlayVisibilityDuringCapture = 'unchanged';
			vi.mocked(html2canvas).mockImplementation(async () => {
				overlayVisibilityDuringCapture = overlayPane.style.visibility;
				return mockCanvas;
			});

			await downloadMapAsImage(mapElement);

			expect(overlayVisibilityDuringCapture).toBe('');
			expect(overlayPane.style.visibility).toBe('');
		});
	});
});
