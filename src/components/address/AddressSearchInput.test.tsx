import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddressSearchInput from './AddressSearchInput';

vi.mock('../../api/geocoding-client', () => ({
	searchAddress: vi.fn(),
}));

import { searchAddress } from '../../api/geocoding-client';

describe('AddressSearchInput', () => {
	const defaultProps = {
		onSelect: vi.fn(),
		onError: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('入力フィールドとボタンを表示する', () => {
		render(<AddressSearchInput {...defaultProps} />);
		expect(screen.getByRole('textbox')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: '検索' })).toBeInTheDocument();
	});

	it('placeholderを表示する', () => {
		render(<AddressSearchInput {...defaultProps} placeholder="テスト住所" />);
		expect(screen.getByPlaceholderText('テスト住所')).toBeInTheDocument();
	});

	it('空欄時に検索ボタンが無効になる', () => {
		render(<AddressSearchInput {...defaultProps} />);
		expect(screen.getByRole('button', { name: '検索' })).toBeDisabled();
	});

	it('入力がある場合、検索ボタンが有効になる', async () => {
		const user = userEvent.setup();
		render(<AddressSearchInput {...defaultProps} />);

		await user.type(screen.getByRole('textbox'), '東京都');
		expect(screen.getByRole('button', { name: '検索' })).not.toBeDisabled();
	});

	it('結果が1件の場合、直接onSelectを呼ぶ', async () => {
		const user = userEvent.setup();
		vi.mocked(searchAddress).mockResolvedValue([
			{ lat: 35.6895, lng: 139.6917, address: '東京都渋谷区' },
		]);

		render(<AddressSearchInput {...defaultProps} />);

		await user.type(screen.getByRole('textbox'), '渋谷区');
		await user.click(screen.getByRole('button', { name: '検索' }));

		await waitFor(() => {
			expect(defaultProps.onSelect).toHaveBeenCalledWith({
				lat: 35.6895,
				lng: 139.6917,
				address: '東京都渋谷区',
			});
		});
	});

	it('結果が複数の場合、候補リストを表示する', async () => {
		const user = userEvent.setup();
		vi.mocked(searchAddress).mockResolvedValue([
			{ lat: 35.6895, lng: 139.6917, address: '東京都渋谷区A' },
			{ lat: 35.6900, lng: 139.6920, address: '東京都渋谷区B' },
		]);

		render(<AddressSearchInput {...defaultProps} />);

		await user.type(screen.getByRole('textbox'), '渋谷区');
		await user.click(screen.getByRole('button', { name: '検索' }));

		await waitFor(() => {
			expect(screen.getByText('東京都渋谷区A')).toBeInTheDocument();
			expect(screen.getByText('東京都渋谷区B')).toBeInTheDocument();
		});
	});

	it('候補クリックでonSelectを呼ぶ', async () => {
		const user = userEvent.setup();
		vi.mocked(searchAddress).mockResolvedValue([
			{ lat: 35.6895, lng: 139.6917, address: '東京都渋谷区A' },
			{ lat: 35.6900, lng: 139.6920, address: '東京都渋谷区B' },
		]);

		render(<AddressSearchInput {...defaultProps} />);

		await user.type(screen.getByRole('textbox'), '渋谷区');
		await user.click(screen.getByRole('button', { name: '検索' }));

		await waitFor(() => {
			expect(screen.getByText('東京都渋谷区A')).toBeInTheDocument();
		});

		await user.click(screen.getByText('東京都渋谷区A'));

		expect(defaultProps.onSelect).toHaveBeenCalledWith({
			lat: 35.6895,
			lng: 139.6917,
			address: '東京都渋谷区A',
		});
	});

	it('結果が0件の場合、onErrorを呼ぶ', async () => {
		const user = userEvent.setup();
		vi.mocked(searchAddress).mockResolvedValue([]);

		render(<AddressSearchInput {...defaultProps} />);

		await user.type(screen.getByRole('textbox'), 'abc');
		await user.click(screen.getByRole('button', { name: '検索' }));

		await waitFor(() => {
			expect(defaultProps.onError).toHaveBeenCalledWith('住所が見つかりませんでした');
		});
	});

	it('Enterキーで検索を実行する', async () => {
		const user = userEvent.setup();
		vi.mocked(searchAddress).mockResolvedValue([]);

		render(<AddressSearchInput {...defaultProps} />);

		const input = screen.getByRole('textbox');
		await user.type(input, '東京都');
		await user.keyboard('{Enter}');

		await waitFor(() => {
			expect(searchAddress).toHaveBeenCalledWith('東京都');
		});
	});
});
