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
