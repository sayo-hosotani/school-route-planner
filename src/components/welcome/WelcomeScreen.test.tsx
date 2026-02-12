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
		const { container } = render(
			<WelcomeScreen {...defaultProps} isOpen={false} />,
		);
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
});
