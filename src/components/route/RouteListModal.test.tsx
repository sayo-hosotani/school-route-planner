import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createTestSavedRoute } from '../../test/helpers';
import RouteListModal from './RouteListModal';

vi.mock('../../api/route-api', () => ({
	getAllRoutes: vi.fn(),
	deleteRoute: vi.fn(),
}));

import { getAllRoutes, deleteRoute } from '../../api/route-api';

describe('RouteListModal', () => {
	const defaultProps = {
		isOpen: true,
		onClose: vi.fn(),
		onViewRoute: vi.fn(),
		onEditRoute: vi.fn(),
		onMessage: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getAllRoutes).mockResolvedValue([]);
		vi.mocked(deleteRoute).mockResolvedValue(undefined);
	});

	it('isOpenがfalseの場合、何も表示しない', () => {
		const { container } = render(
			<RouteListModal {...defaultProps} isOpen={false} />,
		);
		expect(container.firstChild).toBeNull();
	});

	it('経路がない場合、空のメッセージを表示する', async () => {
		render(<RouteListModal {...defaultProps} />);

		await waitFor(() => {
			expect(screen.getByText('保存済みの通学路がありません')).toBeInTheDocument();
		});
	});

	it('経路一覧を表示する', async () => {
		vi.mocked(getAllRoutes).mockResolvedValue([
			createTestSavedRoute({ id: 'r1', name: '学校への道' }),
		]);

		render(<RouteListModal {...defaultProps} />);

		await waitFor(() => {
			expect(screen.getByText('学校への道')).toBeInTheDocument();
		});
	});

	it('経路クリックでonViewRouteを呼びモーダルを閉じる', async () => {
		const user = userEvent.setup();
		vi.mocked(getAllRoutes).mockResolvedValue([
			createTestSavedRoute({ id: 'r1', name: '学校への道' }),
		]);

		render(<RouteListModal {...defaultProps} />);

		await waitFor(() => {
			expect(screen.getByText('学校への道')).toBeInTheDocument();
		});

		const viewButton = screen.getByRole('button', { name: /学校への道を表示/ });
		await user.click(viewButton);

		expect(defaultProps.onViewRoute).toHaveBeenCalledWith('r1');
		expect(defaultProps.onClose).toHaveBeenCalled();
	});

	it('編集ボタンクリックでonEditRouteを呼ぶ', async () => {
		const user = userEvent.setup();
		vi.mocked(getAllRoutes).mockResolvedValue([
			createTestSavedRoute({ id: 'r1', name: '学校への道' }),
		]);

		render(<RouteListModal {...defaultProps} />);

		await waitFor(() => {
			expect(screen.getByText('学校への道')).toBeInTheDocument();
		});

		const editButton = screen.getByRole('button', { name: /学校への道を編集/ });
		await user.click(editButton);

		expect(defaultProps.onEditRoute).toHaveBeenCalledWith('r1');
	});

	it('削除ボタンクリックで確認後に経路を削除する', async () => {
		const user = userEvent.setup();
		vi.stubGlobal('confirm', vi.fn(() => true));
		vi.mocked(getAllRoutes).mockResolvedValue([
			createTestSavedRoute({ id: 'r1', name: '学校への道' }),
		]);

		render(<RouteListModal {...defaultProps} />);

		await waitFor(() => {
			expect(screen.getByText('学校への道')).toBeInTheDocument();
		});

		const deleteBtn = screen.getByRole('button', { name: /学校への道を削除/ });
		await user.click(deleteBtn);

		expect(window.confirm).toHaveBeenCalled();
		expect(deleteRoute).toHaveBeenCalledWith('r1');
		vi.unstubAllGlobals();
	});

	it('閉じるボタンでonCloseを呼ぶ', async () => {
		const user = userEvent.setup();
		render(<RouteListModal {...defaultProps} />);

		const closeButton = screen.getByRole('button', { name: '閉じる' });
		await user.click(closeButton);

		expect(defaultProps.onClose).toHaveBeenCalled();
	});
});
