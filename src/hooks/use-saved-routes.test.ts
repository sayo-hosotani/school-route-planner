import { renderHook, act, waitFor } from '@testing-library/react';
import { createTestSavedRoute } from '../test/helpers';
import { useSavedRoutes } from './use-saved-routes';

vi.mock('../api/route-api', () => ({
	getAllRoutes: vi.fn(),
	deleteRoute: vi.fn(),
}));

import { getAllRoutes, deleteRoute } from '../api/route-api';

describe('useSavedRoutes', () => {
	const mockOnMessage = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getAllRoutes).mockResolvedValue([]);
		vi.mocked(deleteRoute).mockResolvedValue(undefined);
	});

	it('マウント時に全経路を取得する', async () => {
		const routes = [createTestSavedRoute({ id: 'r1' })];
		vi.mocked(getAllRoutes).mockResolvedValue(routes);

		const { result } = renderHook(() =>
			useSavedRoutes({ onMessage: mockOnMessage }),
		);

		await waitFor(() => {
			expect(result.current.savedRoutes).toHaveLength(1);
		});
	});

	it('経路を作成日時の降順でソートする', async () => {
		const routes = [
			createTestSavedRoute({ id: 'r1', created_at: '2024-01-01T00:00:00.000Z' }),
			createTestSavedRoute({ id: 'r2', created_at: '2024-06-01T00:00:00.000Z' }),
		];
		vi.mocked(getAllRoutes).mockResolvedValue(routes);

		const { result } = renderHook(() =>
			useSavedRoutes({ onMessage: mockOnMessage }),
		);

		await waitFor(() => {
			expect(result.current.savedRoutes[0].id).toBe('r2');
			expect(result.current.savedRoutes[1].id).toBe('r1');
		});
	});

	it('取得完了後にisLoadingがfalseになる', async () => {
		vi.mocked(getAllRoutes).mockResolvedValue([]);

		const { result } = renderHook(() =>
			useSavedRoutes({ onMessage: mockOnMessage }),
		);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});
	});

	it('handleDeleteRouteで確認ダイアログを表示する', async () => {
		vi.stubGlobal('confirm', vi.fn(() => true));
		vi.mocked(getAllRoutes).mockResolvedValue([
			createTestSavedRoute({ id: 'r1', name: 'テスト経路' }),
		]);

		const { result } = renderHook(() =>
			useSavedRoutes({ onMessage: mockOnMessage }),
		);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		await act(async () => {
			await result.current.handleDeleteRoute('r1', 'テスト経路');
		});

		expect(window.confirm).toHaveBeenCalledWith('「テスト経路」を削除しますか？');
		vi.unstubAllGlobals();
	});

	it('確認後に経路を削除しメッセージを表示する', async () => {
		vi.stubGlobal('confirm', vi.fn(() => true));
		vi.mocked(getAllRoutes).mockResolvedValue([
			createTestSavedRoute({ id: 'r1', name: 'テスト経路' }),
		]);

		const { result } = renderHook(() =>
			useSavedRoutes({ onMessage: mockOnMessage }),
		);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		await act(async () => {
			await result.current.handleDeleteRoute('r1', 'テスト経路');
		});

		expect(deleteRoute).toHaveBeenCalledWith('r1');
		expect(mockOnMessage).toHaveBeenCalledWith('経路を削除しました');
		vi.unstubAllGlobals();
	});

	it('キャンセル時は削除しない', async () => {
		vi.stubGlobal('confirm', vi.fn(() => false));
		vi.mocked(getAllRoutes).mockResolvedValue([]);

		const { result } = renderHook(() =>
			useSavedRoutes({ onMessage: mockOnMessage }),
		);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		await act(async () => {
			await result.current.handleDeleteRoute('r1', 'テスト経路');
		});

		expect(deleteRoute).not.toHaveBeenCalled();
		vi.unstubAllGlobals();
	});

	it('refreshTriggerが変更されると再取得する', async () => {
		vi.mocked(getAllRoutes).mockResolvedValue([]);

		const { result, rerender } = renderHook(
			({ trigger }) => useSavedRoutes({ onMessage: mockOnMessage, refreshTrigger: trigger }),
			{ initialProps: { trigger: 0 } },
		);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		vi.mocked(getAllRoutes).mockResolvedValue([createTestSavedRoute()]);

		rerender({ trigger: 1 });

		await waitFor(() => {
			expect(result.current.savedRoutes).toHaveLength(1);
		});
	});
});
