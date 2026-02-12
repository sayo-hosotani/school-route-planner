import { generateRoute, checkValhallaStatus } from './valhalla-client';

// Valhalla APIレスポンスのモック
function createMockValhallaResponse(shapes: string[] = ['encodedShape']) {
	return {
		trip: {
			locations: [],
			legs: shapes.map((shape) => ({
				maneuvers: [],
				summary: {
					has_time_restrictions: false,
					has_toll: false,
					has_highway: false,
					has_ferry: false,
					min_lat: 35.67,
					min_lon: 139.65,
					max_lat: 35.68,
					max_lon: 139.66,
					time: 600,
					length: 0.8,
					cost: 600,
				},
				shape,
			})),
			summary: {
				has_time_restrictions: false,
				has_toll: false,
				has_highway: false,
				has_ferry: false,
				min_lat: 35.67,
				min_lon: 139.65,
				max_lat: 35.68,
				max_lon: 139.66,
				time: 600,
				length: 0.8,
				cost: 600,
			},
			status_message: 'Found route between points',
			status: 0,
			units: 'kilometers',
			language: 'ja-JP',
		},
	};
}

// precision 6のpolylineエンコード（テスト用）
// 座標 (35.676200, 139.650300) をprecision 6でエンコード
function encodePolyline6(coords: Array<[number, number]>): string {
	let encoded = '';
	let prevLat = 0;
	let prevLng = 0;

	for (const [lat, lng] of coords) {
		const latVal = Math.round(lat * 1e6);
		const lngVal = Math.round(lng * 1e6);
		const dLat = latVal - prevLat;
		const dLng = lngVal - prevLng;
		prevLat = latVal;
		prevLng = lngVal;

		encoded += encodeValue(dLat) + encodeValue(dLng);
	}

	return encoded;
}

function encodeValue(value: number): string {
	let v = value < 0 ? ~(value << 1) : value << 1;
	let encoded = '';
	while (v >= 0x20) {
		encoded += String.fromCharCode((0x20 | (v & 0x1f)) + 63);
		v >>= 5;
	}
	encoded += String.fromCharCode(v + 63);
	return encoded;
}

describe('generateRoute', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('2ポイント未満の場合、エラーをスローする', async () => {
		await expect(generateRoute([{ lat: 35.6, lng: 139.6, order: 0 }])).rejects.toThrow(
			'最低2つのポイントが必要です',
		);
	});

	it('0ポイントの場合、エラーをスローする', async () => {
		await expect(generateRoute([])).rejects.toThrow('最低2つのポイントが必要です');
	});

	it('ポイントをorder順にソートしてAPIに送信する', async () => {
		const shape = encodePolyline6([[35.6762, 139.6503], [35.6800, 139.6550]]);
		const mockResponse = createMockValhallaResponse([shape]);

		vi.mocked(fetch).mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockResponse),
		} as Response);

		const points = [
			{ lat: 35.68, lng: 139.655, order: 1 },
			{ lat: 35.6762, lng: 139.6503, order: 0 },
		];

		await generateRoute(points);

		const callBody = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
		expect(callBody.locations[0].lat).toBe(35.6762);
		expect(callBody.locations[1].lat).toBe(35.68);
	});

	it('costingをpedestrianに設定する', async () => {
		const shape = encodePolyline6([[35.6762, 139.6503], [35.6800, 139.6550]]);
		vi.mocked(fetch).mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(createMockValhallaResponse([shape])),
		} as Response);

		await generateRoute([
			{ lat: 35.6762, lng: 139.6503, order: 0 },
			{ lat: 35.68, lng: 139.655, order: 1 },
		]);

		const callBody = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
		expect(callBody.costing).toBe('pedestrian');
	});

	it('正常なレスポンスからRouteResultに変換する', async () => {
		const coords: Array<[number, number]> = [[35.6762, 139.6503], [35.68, 139.655]];
		const shape = encodePolyline6(coords);
		const mockResponse = createMockValhallaResponse([shape]);

		vi.mocked(fetch).mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockResponse),
		} as Response);

		const result = await generateRoute([
			{ lat: 35.6762, lng: 139.6503, order: 0 },
			{ lat: 35.68, lng: 139.655, order: 1 },
		]);

		expect(result.distance).toBe(0.8);
		expect(result.duration).toBe(600);
		expect(result.summary).toEqual({
			has_toll: false,
			has_highway: false,
			has_ferry: false,
		});
	});

	it('エンコードされたpolylineを正しくデコードし座標を[lng,lat]形式で返す', async () => {
		const coords: Array<[number, number]> = [[35.6762, 139.6503]];
		const shape = encodePolyline6(coords);
		const mockResponse = createMockValhallaResponse([shape]);

		vi.mocked(fetch).mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockResponse),
		} as Response);

		const result = await generateRoute([
			{ lat: 35.6762, lng: 139.6503, order: 0 },
			{ lat: 35.68, lng: 139.655, order: 1 },
		]);

		// Valhallaクライアントは[lng, lat]形式（GeoJSON）で返す
		expect(result.coordinates[0][0]).toBeCloseTo(139.6503, 4);
		expect(result.coordinates[0][1]).toBeCloseTo(35.6762, 4);
	});

	it('複数legのshapeを結合する', async () => {
		const shape1 = encodePolyline6([[35.6762, 139.6503]]);
		const shape2 = encodePolyline6([[35.68, 139.655]]);
		const mockResponse = createMockValhallaResponse([shape1, shape2]);

		vi.mocked(fetch).mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockResponse),
		} as Response);

		const result = await generateRoute([
			{ lat: 35.6762, lng: 139.6503, order: 0 },
			{ lat: 35.68, lng: 139.655, order: 1 },
		]);

		expect(result.coordinates.length).toBe(2);
	});

	it('APIエラー時にエラーメッセージを含むエラーをスローする', async () => {
		vi.mocked(fetch).mockResolvedValue({
			ok: false,
			status: 400,
			text: () => Promise.resolve('Bad Request'),
		} as Response);

		await expect(
			generateRoute([
				{ lat: 35.6762, lng: 139.6503, order: 0 },
				{ lat: 35.68, lng: 139.655, order: 1 },
			]),
		).rejects.toThrow('経路生成エラー');
	});

	it('ネットワークエラー時にエラーメッセージをスローする', async () => {
		vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));

		await expect(
			generateRoute([
				{ lat: 35.6762, lng: 139.6503, order: 0 },
				{ lat: 35.68, lng: 139.655, order: 1 },
			]),
		).rejects.toThrow('経路生成エラー');
	});

	it('タイムアウト時に"Valhalla APIタイムアウト"エラーをスローする', async () => {
		const abortError = new Error('The operation was aborted.');
		abortError.name = 'AbortError';
		vi.mocked(fetch).mockRejectedValue(abortError);

		await expect(
			generateRoute([
				{ lat: 35.6762, lng: 139.6503, order: 0 },
				{ lat: 35.68, lng: 139.655, order: 1 },
			]),
		).rejects.toThrow('Valhalla APIタイムアウト');
	});

	it('不明なエラー時に汎用エラーメッセージをスローする', async () => {
		vi.mocked(fetch).mockRejectedValue('string error');

		await expect(
			generateRoute([
				{ lat: 35.6762, lng: 139.6503, order: 0 },
				{ lat: 35.68, lng: 139.655, order: 1 },
			]),
		).rejects.toThrow('経路生成中に不明なエラーが発生しました');
	});
});

describe('checkValhallaStatus', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('正常レスポンスの場合、trueを返す', async () => {
		vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);
		const result = await checkValhallaStatus();
		expect(result).toBe(true);
	});

	it('エラーレスポンスの場合、falseを返す', async () => {
		vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);
		const result = await checkValhallaStatus();
		expect(result).toBe(false);
	});

	it('ネットワークエラーの場合、falseを返す', async () => {
		vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
		const result = await checkValhallaStatus();
		expect(result).toBe(false);
	});
});
