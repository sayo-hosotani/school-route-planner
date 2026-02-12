import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createTestPoint } from '../../test/helpers';
import PointItem from './PointItem';

describe('PointItem', () => {
	const defaultHandlers = {
		onPointClick: vi.fn(),
		onEditPoint: vi.fn(),
		onDeletePoint: vi.fn(),
		onMovePoint: vi.fn(),
		onUpdateComment: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('表示', () => {
		it('ポイント情報を表示する', () => {
			const point = createTestPoint({ type: 'start', comment: '' });
			render(
				<PointItem
					point={point}
					type="start"
					displayIndex={1}
					isNextToAdd={false}
					isHighlighted={false}
					{...defaultHandlers}
				/>,
			);
			expect(screen.getByText(/スタート/)).toBeInTheDocument();
		});

		it('ポイントがnullの場合、空の状態を表示する', () => {
			render(
				<PointItem
					point={null}
					type="goal"
					displayIndex={2}
					isNextToAdd={false}
					isHighlighted={false}
					{...defaultHandlers}
				/>,
			);
			expect(screen.getByText(/ゴール/)).toBeInTheDocument();
		});

		it('isNextToAddの場合、追加案内メッセージを表示する', () => {
			render(
				<PointItem
					point={null}
					type="goal"
					displayIndex={2}
					isNextToAdd={true}
					isHighlighted={false}
					{...defaultHandlers}
				/>,
			);
			expect(screen.getByText(/地図をクリックして追加/)).toBeInTheDocument();
		});

		it('中継地点の場合、移動ボタンを表示する', () => {
			const point = createTestPoint({ type: 'waypoint' });
			render(
				<PointItem
					point={point}
					type="waypoint"
					displayIndex={2}
					isNextToAdd={false}
					waypointNumber={1}
					canMoveUp={true}
					canMoveDown={true}
					isHighlighted={false}
					{...defaultHandlers}
				/>,
			);
			expect(screen.getByText('▲')).toBeInTheDocument();
			expect(screen.getByText('▼')).toBeInTheDocument();
		});

		it('スタートの場合、移動ボタンを非表示にする', () => {
			const point = createTestPoint({ type: 'start' });
			render(
				<PointItem
					point={point}
					type="start"
					displayIndex={1}
					isNextToAdd={false}
					isHighlighted={false}
					{...defaultHandlers}
				/>,
			);
			expect(screen.queryByText('▲')).toBeNull();
			expect(screen.queryByText('▼')).toBeNull();
		});
	});

	describe('クリック操作', () => {
		it('タイトルクリックでonPointClickを呼ぶ', async () => {
			const user = userEvent.setup();
			const point = createTestPoint({ id: 'p1', type: 'start' });
			render(
				<PointItem
					point={point}
					type="start"
					displayIndex={1}
					isNextToAdd={false}
					isHighlighted={false}
					{...defaultHandlers}
				/>,
			);

			const titleButton = screen.getByRole('button', { name: /スタート/ });
			await user.click(titleButton);
			expect(defaultHandlers.onPointClick).toHaveBeenCalledWith('p1');
		});

		it('編集ボタンクリックでonEditPointを呼ぶ', async () => {
			const user = userEvent.setup();
			const point = createTestPoint({ id: 'p1', type: 'start' });
			render(
				<PointItem
					point={point}
					type="start"
					displayIndex={1}
					isNextToAdd={false}
					isHighlighted={false}
					{...defaultHandlers}
				/>,
			);

			const editButton = screen.getByRole('button', { name: /編集/ });
			await user.click(editButton);
			expect(defaultHandlers.onEditPoint).toHaveBeenCalledWith('p1');
		});

		it('削除ボタンクリックでonDeletePointを呼ぶ', async () => {
			const user = userEvent.setup();
			const point = createTestPoint({ id: 'p1', type: 'start' });
			render(
				<PointItem
					point={point}
					type="start"
					displayIndex={1}
					isNextToAdd={false}
					isHighlighted={false}
					{...defaultHandlers}
				/>,
			);

			const deleteButton = screen.getByRole('button', { name: /削除/ });
			await user.click(deleteButton);
			expect(defaultHandlers.onDeletePoint).toHaveBeenCalledWith('p1');
		});

		it('上移動ボタンクリックでonMovePointをupで呼ぶ', async () => {
			const user = userEvent.setup();
			const point = createTestPoint({ id: 'p1', type: 'waypoint' });
			render(
				<PointItem
					point={point}
					type="waypoint"
					displayIndex={2}
					isNextToAdd={false}
					waypointNumber={1}
					canMoveUp={true}
					canMoveDown={true}
					isHighlighted={false}
					{...defaultHandlers}
				/>,
			);

			const upButton = screen.getByRole('button', { name: /上に移動/ });
			await user.click(upButton);
			expect(defaultHandlers.onMovePoint).toHaveBeenCalledWith('p1', 'up');
		});

		it('下移動ボタンクリックでonMovePointをdownで呼ぶ', async () => {
			const user = userEvent.setup();
			const point = createTestPoint({ id: 'p1', type: 'waypoint' });
			render(
				<PointItem
					point={point}
					type="waypoint"
					displayIndex={2}
					isNextToAdd={false}
					waypointNumber={1}
					canMoveUp={true}
					canMoveDown={true}
					isHighlighted={false}
					{...defaultHandlers}
				/>,
			);

			const downButton = screen.getByRole('button', { name: /下に移動/ });
			await user.click(downButton);
			expect(defaultHandlers.onMovePoint).toHaveBeenCalledWith('p1', 'down');
		});
	});

	describe('キーボード操作', () => {
		it('Enterキーでポイントをクリックする', async () => {
			const user = userEvent.setup();
			const point = createTestPoint({ id: 'p1', type: 'start' });
			render(
				<PointItem
					point={point}
					type="start"
					displayIndex={1}
					isNextToAdd={false}
					isHighlighted={false}
					{...defaultHandlers}
				/>,
			);

			const li = screen.getByRole('listitem');
			li.focus();
			await user.keyboard('{Enter}');
			expect(defaultHandlers.onPointClick).toHaveBeenCalledWith('p1');
		});

		it('Eキーでポイントを編集する', async () => {
			const user = userEvent.setup();
			const point = createTestPoint({ id: 'p1', type: 'start' });
			render(
				<PointItem
					point={point}
					type="start"
					displayIndex={1}
					isNextToAdd={false}
					isHighlighted={false}
					{...defaultHandlers}
				/>,
			);

			const li = screen.getByRole('listitem');
			li.focus();
			await user.keyboard('e');
			expect(defaultHandlers.onEditPoint).toHaveBeenCalledWith('p1');
		});

		it('Deleteキーでポイントを削除する', async () => {
			const user = userEvent.setup();
			const point = createTestPoint({ id: 'p1', type: 'start' });
			render(
				<PointItem
					point={point}
					type="start"
					displayIndex={1}
					isNextToAdd={false}
					isHighlighted={false}
					{...defaultHandlers}
				/>,
			);

			const li = screen.getByRole('listitem');
			li.focus();
			await user.keyboard('{Delete}');
			expect(defaultHandlers.onDeletePoint).toHaveBeenCalledWith('p1');
		});
	});
});
