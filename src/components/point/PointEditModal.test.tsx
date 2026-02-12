import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createTestPoint } from '../../test/helpers';
import PointEditModal from './PointEditModal';

describe('PointEditModal', () => {
	const defaultProps = {
		onClose: vi.fn(),
		onSave: vi.fn(),
		onDeletePoint: vi.fn(),
		onMovePoint: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('ポイントがnullの場合、何も表示しない', () => {
		const { container } = render(
			<PointEditModal point={null} {...defaultProps} />,
		);
		expect(container.firstChild).toBeNull();
	});

	it('ポイント情報をフォームに表示する', () => {
		const point = createTestPoint({ comment: 'テストコメント' });
		render(<PointEditModal point={point} {...defaultProps} />);

		const textarea = screen.getByRole('textbox');
		expect(textarea).toHaveValue('テストコメント');
	});

	it('コメントを編集できる', async () => {
		const user = userEvent.setup();
		const point = createTestPoint({ comment: '' });
		render(<PointEditModal point={point} {...defaultProps} />);

		const textarea = screen.getByRole('textbox');
		await user.type(textarea, '新しいコメント');
		expect(textarea).toHaveValue('新しいコメント');
	});

	it('保存ボタンクリックでonSaveを呼ぶ', async () => {
		const user = userEvent.setup();
		const point = createTestPoint({ id: 'p1', type: 'waypoint', comment: 'テスト' });
		render(<PointEditModal point={point} {...defaultProps} />);

		const saveButton = screen.getByRole('button', { name: /保存/ });
		await user.click(saveButton);

		expect(defaultProps.onSave).toHaveBeenCalledWith('p1', 'waypoint', 'テスト');
		expect(defaultProps.onClose).toHaveBeenCalled();
	});

	it('削除ボタンクリックでonDeletePointを呼ぶ', async () => {
		const user = userEvent.setup();
		const point = createTestPoint({ id: 'p1' });
		render(<PointEditModal point={point} {...defaultProps} />);

		const deleteButton = screen.getByRole('button', { name: /削除/ });
		await user.click(deleteButton);

		expect(defaultProps.onDeletePoint).toHaveBeenCalledWith('p1');
		expect(defaultProps.onClose).toHaveBeenCalled();
	});

	it('閉じるボタンでonCloseを呼ぶ', async () => {
		const user = userEvent.setup();
		const point = createTestPoint();
		render(<PointEditModal point={point} {...defaultProps} />);

		const closeButton = screen.getByRole('button', { name: /閉じる/ });
		await user.click(closeButton);

		expect(defaultProps.onClose).toHaveBeenCalled();
	});

	it('Escapeキーでモーダルを閉じる', async () => {
		const user = userEvent.setup();
		const point = createTestPoint();
		render(<PointEditModal point={point} {...defaultProps} />);

		await user.keyboard('{Escape}');

		expect(defaultProps.onClose).toHaveBeenCalled();
	});

	it('中継地点の場合、移動ボタンが有効になる', () => {
		const point = createTestPoint({ type: 'waypoint' });
		render(<PointEditModal point={point} {...defaultProps} />);

		const moveUpButton = screen.getByRole('button', { name: '前へ' });
		const moveDownButton = screen.getByRole('button', { name: '後へ' });
		expect(moveUpButton).not.toBeDisabled();
		expect(moveDownButton).not.toBeDisabled();
	});

	it('スタートの場合、移動ボタンが無効になる', () => {
		const point = createTestPoint({ type: 'start' });
		render(<PointEditModal point={point} {...defaultProps} />);

		const moveUpButton = screen.getByRole('button', { name: '前へ' });
		const moveDownButton = screen.getByRole('button', { name: '後へ' });
		expect(moveUpButton).toBeDisabled();
		expect(moveDownButton).toBeDisabled();
	});
});
