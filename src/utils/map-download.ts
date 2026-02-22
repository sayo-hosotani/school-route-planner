import html2canvas from 'html2canvas';

export async function downloadMapAsImage(mapElement: HTMLElement): Promise<void> {
	const controls = mapElement.querySelectorAll<HTMLElement>(
		'.leaflet-control-container .leaflet-control:not(.leaflet-control-scale)',
	);
	controls.forEach((c) => {
		c.style.visibility = 'hidden';
	});
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
	}
}
