import html2canvas from 'html2canvas';

// Leaflet の SVG レンダラーが描画する経路は .leaflet-overlay-pane の SVG 要素に入っている。
// html2canvas は親要素の CSS transform を SVG に正しく継承しないためそのまま撮ると位置がずれる。
// 対策:
//   1. 元の overlay-pane を非表示にする
//   2. SVG を cloneNode して transform を除去し、div ラッパーに入れる
//   3. div の left/top に getBoundingClientRect の視覚座標を直接セットする
//      （getBCR はすべての transform を反映した値を返すため位置が正確に合う）
//   4. その div を tile-pane と marker-pane の間に挿入する
//      → html2canvas が正しい z-order で描画する（タイル → 経路 → ポイント/コメント）
//   5. html2canvas 実行後にクリーンアップ

export async function downloadMapAsImage(mapElement: HTMLElement): Promise<void> {
	const controls = mapElement.querySelectorAll<HTMLElement>(
		'.leaflet-control-container .leaflet-control:not(.leaflet-control-scale)',
	);
	controls.forEach((c) => {
		c.style.visibility = 'hidden';
	});

	const overlayPane = mapElement.querySelector<HTMLElement>('.leaflet-overlay-pane');
	const overlaySvg = overlayPane?.querySelector<SVGElement>('svg') ?? null;
	const mapPane = mapElement.querySelector<HTMLElement>('.leaflet-map-pane');
	const markerPane = mapElement.querySelector<HTMLElement>('.leaflet-marker-pane');
	let svgWrapper: HTMLDivElement | null = null;

	if (overlaySvg && overlayPane && mapPane && markerPane) {
		const containerRect = mapElement.getBoundingClientRect();
		const svgRect = overlaySvg.getBoundingClientRect();

		const svgClone = overlaySvg.cloneNode(true) as SVGElement;
		svgClone.style.transform = 'none';

		svgWrapper = document.createElement('div');
		svgWrapper.style.position = 'absolute';
		svgWrapper.style.left = `${svgRect.left - containerRect.left}px`;
		svgWrapper.style.top = `${svgRect.top - containerRect.top}px`;
		svgWrapper.style.overflow = 'visible';
		svgWrapper.style.pointerEvents = 'none';
		svgWrapper.style.zIndex = '300';
		svgWrapper.appendChild(svgClone);

		mapPane.insertBefore(svgWrapper, markerPane);
		overlayPane.style.visibility = 'hidden';
	}

	try {
		const canvas = await html2canvas(mapElement, { useCORS: true, logging: false });
		const url = canvas.toDataURL('image/png');
		const a = document.createElement('a');
		a.href = url;
		a.download = `school-route-${new Date().toISOString().slice(0, 10)}.png`;
		a.click();
	} finally {
		controls.forEach((c) => {
			c.style.visibility = '';
		});
		svgWrapper?.remove();
		if (overlayPane) {
			overlayPane.style.visibility = '';
		}
	}
}
