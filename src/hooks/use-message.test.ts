import { renderHook, act } from '@testing-library/react';
import { MESSAGE_TIMEOUT_MS } from '../constants/map-config';
import { useMessage } from './use-message';

describe('useMessage', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('初期状態ではmessageが空文字である', () => {
		const { result } = renderHook(() => useMessage());
		expect(result.current.message).toBe('');
	});

	it('初期状態ではmessageTypeがsuccessである', () => {
		const { result } = renderHook(() => useMessage());
		expect(result.current.messageType).toBe('success');
	});

	it('showMessageでメッセージを設定する', () => {
		const { result } = renderHook(() => useMessage());

		act(() => {
			result.current.showMessage('テストメッセージ');
		});

		expect(result.current.message).toBe('テストメッセージ');
	});

	it('showMessageでtypeを指定できる', () => {
		const { result } = renderHook(() => useMessage());

		act(() => {
			result.current.showMessage('エラー', 'error');
		});

		expect(result.current.messageType).toBe('error');
	});

	it('MESSAGE_TIMEOUT_MS後にメッセージが自動消去される', () => {
		const { result } = renderHook(() => useMessage());

		act(() => {
			result.current.showMessage('テスト');
		});
		expect(result.current.message).toBe('テスト');

		act(() => {
			vi.advanceTimersByTime(MESSAGE_TIMEOUT_MS);
		});
		expect(result.current.message).toBe('');
	});

	it('新しいメッセージ表示時に既存タイマーをクリアする', () => {
		const { result } = renderHook(() => useMessage());

		act(() => {
			result.current.showMessage('最初');
		});

		// タイマー途中で新しいメッセージ
		act(() => {
			vi.advanceTimersByTime(MESSAGE_TIMEOUT_MS - 100);
		});
		act(() => {
			result.current.showMessage('2番目');
		});

		// 最初のタイマー時間経過後も2番目のメッセージは残る
		act(() => {
			vi.advanceTimersByTime(100);
		});
		expect(result.current.message).toBe('2番目');

		// 2番目のタイマーが完了するとメッセージ消去
		act(() => {
			vi.advanceTimersByTime(MESSAGE_TIMEOUT_MS - 100);
		});
		expect(result.current.message).toBe('');
	});

	it('clearMessageでメッセージを即座に消去する', () => {
		const { result } = renderHook(() => useMessage());

		act(() => {
			result.current.showMessage('テスト');
		});

		act(() => {
			result.current.clearMessage();
		});
		expect(result.current.message).toBe('');
	});

	it('アンマウント時にタイマーをクリーンアップする', () => {
		const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
		const { result, unmount } = renderHook(() => useMessage());

		act(() => {
			result.current.showMessage('テスト');
		});

		unmount();

		expect(clearTimeoutSpy).toHaveBeenCalled();
		clearTimeoutSpy.mockRestore();
	});
});
