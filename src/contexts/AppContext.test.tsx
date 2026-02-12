import { renderHook, act } from '@testing-library/react';
import { AppProvider, useAppContext } from './AppContext';
import { HIGHLIGHT_TIMEOUT_MS } from '../constants/map-config';

describe('AppProvider', () => {
	const wrapper = ({ children }: { children: React.ReactNode }) => (
		<AppProvider>{children}</AppProvider>
	);

	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('子コンポーネントにコンテキスト値を提供する', () => {
		const { result } = renderHook(() => useAppContext(), { wrapper });
		expect(result.current.message).toBe('');
		expect(result.current.messageType).toBe('success');
		expect(result.current.isLoading).toBe(false);
		expect(result.current.highlightedPointId).toBeNull();
		expect(result.current.mapCenter).toBeNull();
	});

	it('showMessageでメッセージを表示する', () => {
		const { result } = renderHook(() => useAppContext(), { wrapper });

		act(() => {
			result.current.showMessage('テストメッセージ');
		});

		expect(result.current.message).toBe('テストメッセージ');
		expect(result.current.messageType).toBe('success');
	});

	it('showMessageでerrorタイプを指定できる', () => {
		const { result } = renderHook(() => useAppContext(), { wrapper });

		act(() => {
			result.current.showMessage('エラー', 'error');
		});

		expect(result.current.messageType).toBe('error');
	});

	it('setLoadingでローディング状態を切り替える', () => {
		const { result } = renderHook(() => useAppContext(), { wrapper });

		act(() => {
			result.current.setLoading(true, '読み込み中...');
		});

		expect(result.current.isLoading).toBe(true);
		expect(result.current.loadingMessage).toBe('読み込み中...');

		act(() => {
			result.current.setLoading(false);
		});

		expect(result.current.isLoading).toBe(false);
		expect(result.current.loadingMessage).toBe('');
	});

	it('highlightPointでポイントIDを設定する', () => {
		const { result } = renderHook(() => useAppContext(), { wrapper });

		act(() => {
			result.current.highlightPoint('point-1');
		});

		expect(result.current.highlightedPointId).toBe('point-1');
	});

	it('HIGHLIGHT_TIMEOUT_MS後にハイライトが解除される', () => {
		const { result } = renderHook(() => useAppContext(), { wrapper });

		act(() => {
			result.current.highlightPoint('point-1');
		});

		expect(result.current.highlightedPointId).toBe('point-1');

		act(() => {
			vi.advanceTimersByTime(HIGHLIGHT_TIMEOUT_MS);
		});

		expect(result.current.highlightedPointId).toBeNull();
	});

	it('ハイライト解除時にmapCenterもnullになる', () => {
		const { result } = renderHook(() => useAppContext(), { wrapper });

		act(() => {
			result.current.setMapCenter([35.6762, 139.6503]);
			result.current.highlightPoint('point-1');
		});

		act(() => {
			vi.advanceTimersByTime(HIGHLIGHT_TIMEOUT_MS);
		});

		expect(result.current.mapCenter).toBeNull();
	});

	it('setMapCenterで地図中央を設定する', () => {
		const { result } = renderHook(() => useAppContext(), { wrapper });

		act(() => {
			result.current.setMapCenter([35.6762, 139.6503]);
		});

		expect(result.current.mapCenter).toEqual([35.6762, 139.6503]);
	});
});

describe('useAppContext', () => {
	it('Provider外で使用するとエラーをスローする', () => {
		expect(() => {
			renderHook(() => useAppContext());
		}).toThrow('useAppContext must be used within an AppProvider');
	});
});
