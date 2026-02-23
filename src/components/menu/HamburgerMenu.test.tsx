import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HamburgerMenu from './HamburgerMenu';

vi.mock('../../api/route-api', () => ({
	exportRoutesToJson: vi.fn(() => '[]'),
	importRoutesFromJson: vi.fn(() => 0),
}));

describe('HamburgerMenu', () => {
	const defaultProps = {
		onNewRoute: vi.fn(),
		onSaveRoute: vi.fn(),
		onOpenRouteList: vi.fn(),
		onOpenAddressSearch: vi.fn(),
		onMessage: vi.fn(),
		onRefreshRouteList: vi.fn(),
		onDownloadMap: vi.fn(() => Promise.resolve()),
		hasPoints: true,
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('初期状態ではメニューが閉じている', () => {
		render(<HamburgerMenu {...defaultProps} />);
		expect(screen.queryByRole('menu')).toBeNull();
	});

	it('ハンバーガーボタンクリックでメニューを開く', async () => {
		const user = userEvent.setup();
		render(<HamburgerMenu {...defaultProps} />);

		const button = screen.getByRole('button', { name: /メニューを開く/ });
		await user.click(button);

		expect(screen.getByRole('menu')).toBeInTheDocument();
	});

	it('メニュー項目クリック後にメニューが閉じる', async () => {
		const user = userEvent.setup();
		render(<HamburgerMenu {...defaultProps} />);

		const menuButton = screen.getByRole('button', { name: /メニューを開く/ });
		await user.click(menuButton);

		const newRouteButton = screen.getByRole('menuitem', { name: /新規作成/ });
		await user.click(newRouteButton);

		expect(screen.queryByRole('menu')).toBeNull();
	});

	it('通学路の新規作成をクリックするとonNewRouteが呼ばれる', async () => {
		const user = userEvent.setup();
		render(<HamburgerMenu {...defaultProps} />);

		const menuButton = screen.getByRole('button', { name: /メニューを開く/ });
		await user.click(menuButton);

		const newRouteButton = screen.getByRole('menuitem', { name: /新規作成/ });
		await user.click(newRouteButton);

		expect(defaultProps.onNewRoute).toHaveBeenCalled();
	});

	it('保存ボタンはhasPointsがfalseの場合無効になる', async () => {
		const user = userEvent.setup();
		render(<HamburgerMenu {...defaultProps} hasPoints={false} />);

		const menuButton = screen.getByRole('button', { name: /メニューを開く/ });
		await user.click(menuButton);

		const saveButton = screen.getByRole('menuitem', { name: /保存/ });
		expect(saveButton).toBeDisabled();
	});

	it('通学路の一覧をクリックするとonOpenRouteListが呼ばれる', async () => {
		const user = userEvent.setup();
		render(<HamburgerMenu {...defaultProps} />);

		const menuButton = screen.getByRole('button', { name: /メニューを開く/ });
		await user.click(menuButton);

		const routeListButton = screen.getByRole('menuitem', { name: /一覧/ });
		await user.click(routeListButton);

		expect(defaultProps.onOpenRouteList).toHaveBeenCalled();
	});

	it('エクスポートでメッセージを表示する', async () => {
		const user = userEvent.setup();
		// createObjectURL/revokeObjectURL/createElement('a')のモック
		vi.stubGlobal('URL', {
			createObjectURL: vi.fn(() => 'blob:mock'),
			revokeObjectURL: vi.fn(),
		});

		render(<HamburgerMenu {...defaultProps} />);

		const menuButton = screen.getByRole('button', { name: /メニューを開く/ });
		await user.click(menuButton);

		const exportButton = screen.getByRole('menuitem', { name: /エクスポート/ });
		await user.click(exportButton);

		expect(defaultProps.onMessage).toHaveBeenCalledWith('経路をエクスポートしました');
		vi.unstubAllGlobals();
	});

	describe('JSONインポート導線', () => {
		it('ファイルサイズが1MBを超える場合にエラーメッセージを表示する', async () => {
			const user = userEvent.setup();
			render(<HamburgerMenu {...defaultProps} />);

			const menuButton = screen.getByRole('button', { name: /メニューを開く/ });
			await user.click(menuButton);

			const importButton = screen.getByRole('menuitem', { name: /インポート/ });
			const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]')!;

			// 1MB超のファイルをシミュレート
			const largeFile = new File(['x'.repeat(1024 * 1024 + 1)], 'large.json', { type: 'application/json' });
			await user.click(importButton);
			await user.upload(fileInput, largeFile);

			expect(defaultProps.onMessage).toHaveBeenCalledWith(
				'ファイルサイズが1MBを超えています',
				'error',
			);
		});

		it('FileReader.onerrorが発生した場合にエラーメッセージを表示する', async () => {
			const user = userEvent.setup();
			render(<HamburgerMenu {...defaultProps} />);

			const menuButton = screen.getByRole('button', { name: /メニューを開く/ });
			await user.click(menuButton);

			const importButton = screen.getByRole('menuitem', { name: /インポート/ });
			const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]')!;

			// FileReaderのonerrorを発火させるためにモック
			const mockReader = {
				readAsText: vi.fn(function (this: FileReader) {
					this.onerror?.(new ProgressEvent('error') as ProgressEvent<FileReader>);
				}),
				onload: null as ((ev: ProgressEvent<FileReader>) => void) | null,
				onerror: null as ((ev: ProgressEvent<FileReader>) => void) | null,
			};
			vi.spyOn(window, 'FileReader').mockImplementation(() => mockReader as unknown as FileReader);

			const file = new File(['{}'], 'test.json', { type: 'application/json' });
			await user.click(importButton);
			await user.upload(fileInput, file);

			expect(defaultProps.onMessage).toHaveBeenCalledWith(
				'ファイルの読み込みに失敗しました',
				'error',
			);
			vi.restoreAllMocks();
		});

		it('importRoutesFromJsonが例外をスローした場合にエラーメッセージを表示する', async () => {
			const { importRoutesFromJson } = await import('../../api/route-api');
			vi.mocked(importRoutesFromJson).mockImplementation(() => {
				throw new Error('JSONの形式が正しくありません');
			});

			const user = userEvent.setup();
			render(<HamburgerMenu {...defaultProps} />);

			const menuButton = screen.getByRole('button', { name: /メニューを開く/ });
			await user.click(menuButton);

			const importButton = screen.getByRole('menuitem', { name: /インポート/ });
			const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]')!;

			const mockReader = {
				readAsText: vi.fn(function (this: typeof mockReader) {
					this.onload?.({ target: { result: 'invalid' } } as unknown as ProgressEvent<FileReader>);
				}),
				onload: null as ((ev: ProgressEvent<FileReader>) => void) | null,
				onerror: null as ((ev: ProgressEvent<FileReader>) => void) | null,
			};
			vi.spyOn(window, 'FileReader').mockImplementation(() => mockReader as unknown as FileReader);

			const file = new File(['invalid'], 'test.json', { type: 'application/json' });
			await user.click(importButton);
			await user.upload(fileInput, file);

			expect(defaultProps.onMessage).toHaveBeenCalledWith(
				'インポートに失敗しました: JSONの形式が正しくありません',
				'error',
			);
			vi.restoreAllMocks();
		});
	});

	it('aria-expandedがメニューの開閉状態を反映する', async () => {
		const user = userEvent.setup();
		render(<HamburgerMenu {...defaultProps} />);

		const button = screen.getByRole('button', { name: /メニュー/ });
		expect(button).toHaveAttribute('aria-expanded', 'false');

		await user.click(button);
		expect(button).toHaveAttribute('aria-expanded', 'true');
	});

	it('オーバーレイクリックでメニューを閉じる', async () => {
		const user = userEvent.setup();
		render(<HamburgerMenu {...defaultProps} />);

		const button = screen.getByRole('button', { name: /メニューを開く/ });
		await user.click(button);
		expect(screen.getByRole('menu')).toBeInTheDocument();

		const overlay = document.querySelector('[aria-hidden="true"]');
		expect(overlay).not.toBeNull();
		await user.click(overlay!);

		expect(screen.queryByRole('menu')).toBeNull();
	});
});
