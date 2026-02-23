import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WelcomeScreen from './WelcomeScreen';

vi.mock('../../api/geocoding-client', () => ({
	searchAddress: vi.fn(),
}));

vi.mock('../../api/route-api', () => ({
	importRoutesFromJson: vi.fn(() => 2),
}));

describe('WelcomeScreen', () => {
	const defaultProps = {
		isOpen: true,
		onClose: vi.fn(),
		onAddPoint: vi.fn(),
		onImportSuccess: vi.fn(),
		onError: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('isOpenがfalseの場合、何も表示しない', () => {
		const { container } = render(<WelcomeScreen {...defaultProps} isOpen={false} />);
		expect(container.firstChild).toBeNull();
	});

	it('タイトル「通学路マップ」を表示する', () => {
		render(<WelcomeScreen {...defaultProps} />);
		expect(screen.getByText('通学路マップ')).toBeInTheDocument();
	});

	it('住所検索入力欄を表示する', () => {
		render(<WelcomeScreen {...defaultProps} />);
		expect(screen.getByPlaceholderText(/住所を入力/)).toBeInTheDocument();
	});

	it('インポートボタンを表示する', () => {
		render(<WelcomeScreen {...defaultProps} />);
		expect(screen.getByText(/JSONファイルをインポート/)).toBeInTheDocument();
	});

	it('オーバーレイクリックでonCloseを呼ぶ', async () => {
		const user = userEvent.setup();
		render(<WelcomeScreen {...defaultProps} />);

		const overlay = screen.getByRole('presentation');
		await user.click(overlay);

		expect(defaultProps.onClose).toHaveBeenCalled();
	});

	it('コンテンツクリックではonCloseを呼ばない', async () => {
		const user = userEvent.setup();
		render(<WelcomeScreen {...defaultProps} />);

		const title = screen.getByText('通学路マップ');
		await user.click(title);

		expect(defaultProps.onClose).not.toHaveBeenCalled();
	});

	describe('JSONインポート導線', () => {
		it('ファイルサイズが1MBを超える場合にonErrorを呼ぶ', async () => {
			const user = userEvent.setup();
			render(<WelcomeScreen {...defaultProps} />);

			const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]')!;
			const largeFile = new File(['x'.repeat(1024 * 1024 + 1)], 'large.json', {
				type: 'application/json',
			});
			await user.upload(fileInput, largeFile);

			expect(defaultProps.onError).toHaveBeenCalledWith('ファイルサイズが1MBを超えています');
		});

		it('FileReader.onerrorが発生した場合にonErrorを呼ぶ', async () => {
			const user = userEvent.setup();
			render(<WelcomeScreen {...defaultProps} />);

			const mockReader = {
				readAsText: vi.fn(function (this: typeof mockReader) {
					this.onerror?.(new ProgressEvent('error') as ProgressEvent<FileReader>);
				}),
				onload: null as ((ev: ProgressEvent<FileReader>) => void) | null,
				onerror: null as ((ev: ProgressEvent<FileReader>) => void) | null,
			};
			vi.spyOn(window, 'FileReader').mockImplementation(() => mockReader as unknown as FileReader);

			const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]')!;
			const file = new File(['{}'], 'test.json', { type: 'application/json' });
			await user.upload(fileInput, file);

			expect(defaultProps.onError).toHaveBeenCalledWith('ファイルの読み込みに失敗しました');
			vi.restoreAllMocks();
		});

		it('importRoutesFromJsonが例外をスローした場合にonErrorを呼ぶ', async () => {
			const { importRoutesFromJson } = await import('../../api/route-api');
			vi.mocked(importRoutesFromJson).mockImplementation(() => {
				throw new Error('JSONの形式が正しくありません');
			});

			const user = userEvent.setup();
			render(<WelcomeScreen {...defaultProps} />);

			const mockReader = {
				readAsText: vi.fn(function (this: typeof mockReader) {
					this.onload?.({ target: { result: 'invalid' } } as unknown as ProgressEvent<FileReader>);
				}),
				onload: null as ((ev: ProgressEvent<FileReader>) => void) | null,
				onerror: null as ((ev: ProgressEvent<FileReader>) => void) | null,
			};
			vi.spyOn(window, 'FileReader').mockImplementation(() => mockReader as unknown as FileReader);

			const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]')!;
			const file = new File(['invalid'], 'test.json', { type: 'application/json' });
			await user.upload(fileInput, file);

			expect(defaultProps.onError).toHaveBeenCalledWith(
				'インポートに失敗しました: JSONの形式が正しくありません',
			);
			vi.restoreAllMocks();
		});
	});
});
