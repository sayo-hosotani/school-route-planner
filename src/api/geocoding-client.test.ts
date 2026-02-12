import { searchAddress } from './geocoding-client';

describe('searchAddress', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('空文字の場合、空配列を返す', async () => {
		const result = await searchAddress('');
		expect(result).toEqual([]);
		expect(fetch).not.toHaveBeenCalled();
	});

	it('空白のみの場合、空配列を返す', async () => {
		const result = await searchAddress('   ');
		expect(result).toEqual([]);
		expect(fetch).not.toHaveBeenCalled();
	});

	it('正しいURLでGSI APIを呼び出す', async () => {
		vi.mocked(fetch).mockResolvedValue({
			ok: true,
			json: () => Promise.resolve([]),
		} as Response);

		await searchAddress('東京都');

		expect(fetch).toHaveBeenCalledTimes(1);
		const callArgs = vi.mocked(fetch).mock.calls[0];
		const url = callArgs[0] as string;
		expect(url).toContain('msearch.gsi.go.jp/address-search/AddressSearch');
	});

	it('クエリをencodeURIComponentでエンコードする', async () => {
		vi.mocked(fetch).mockResolvedValue({
			ok: true,
			json: () => Promise.resolve([]),
		} as Response);

		await searchAddress('東京都 渋谷区');

		const url = vi.mocked(fetch).mock.calls[0][0] as string;
		expect(url).toContain(encodeURIComponent('東京都 渋谷区'));
	});

	it('レスポンスを[lat,lng]形式に変換する', async () => {
		const gsiResponse = [
			{
				geometry: {
					coordinates: [139.6917, 35.6895], // [経度, 緯度]
					type: 'Point' as const,
				},
				type: 'Feature' as const,
				properties: {
					addressCode: '13113',
					title: '東京都渋谷区',
				},
			},
		];

		vi.mocked(fetch).mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(gsiResponse),
		} as Response);

		const result = await searchAddress('渋谷区');

		expect(result).toHaveLength(1);
		expect(result[0].lat).toBe(35.6895);
		expect(result[0].lng).toBe(139.6917);
		expect(result[0].address).toBe('東京都渋谷区');
	});

	it('結果が空の場合、空配列を返す', async () => {
		vi.mocked(fetch).mockResolvedValue({
			ok: true,
			json: () => Promise.resolve([]),
		} as Response);

		const result = await searchAddress('存在しない住所xyz');
		expect(result).toEqual([]);
	});

	it('APIエラー時にエラーをスローする', async () => {
		vi.mocked(fetch).mockResolvedValue({
			ok: false,
			status: 500,
		} as Response);

		await expect(searchAddress('東京都')).rejects.toThrow('住所検索エラー');
	});

	it('タイムアウト時にタイムアウトエラーをスローする', async () => {
		const abortError = new Error('The operation was aborted.');
		abortError.name = 'AbortError';
		vi.mocked(fetch).mockRejectedValue(abortError);

		await expect(searchAddress('東京都')).rejects.toThrow('住所検索がタイムアウトしました');
	});

	it('不明なエラー時に汎用エラーメッセージをスローする', async () => {
		vi.mocked(fetch).mockRejectedValue('unknown');

		await expect(searchAddress('東京都')).rejects.toThrow('住所検索中に不明なエラーが発生しました');
	});

	it('クエリの前後の空白をトリムする', async () => {
		vi.mocked(fetch).mockResolvedValue({
			ok: true,
			json: () => Promise.resolve([]),
		} as Response);

		await searchAddress('  東京都  ');

		const url = vi.mocked(fetch).mock.calls[0][0] as string;
		expect(url).toContain(`q=${encodeURIComponent('東京都')}`);
	});
});
