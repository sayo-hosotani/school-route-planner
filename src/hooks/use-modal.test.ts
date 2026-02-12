import { renderHook, act } from '@testing-library/react';
import { useModal } from './use-modal';

describe('useModal', () => {
	it('初期状態ではisOpenがfalseである', () => {
		const { result } = renderHook(() => useModal());
		expect(result.current.isOpen).toBe(false);
	});

	it('初期状態ではdataがnullである', () => {
		const { result } = renderHook(() => useModal());
		expect(result.current.data).toBeNull();
	});

	it('initialDataを指定できる', () => {
		const { result } = renderHook(() => useModal<string>('初期値'));
		expect(result.current.data).toBe('初期値');
	});

	it('openでisOpenをtrueにする', () => {
		const { result } = renderHook(() => useModal());

		act(() => {
			result.current.open();
		});
		expect(result.current.isOpen).toBe(true);
	});

	it('openでdataを設定できる', () => {
		const { result } = renderHook(() => useModal<string>());

		act(() => {
			result.current.open('テストデータ');
		});
		expect(result.current.data).toBe('テストデータ');
	});

	it('closeでisOpenをfalseにしdataをnullにする', () => {
		const { result } = renderHook(() => useModal<string>());

		act(() => {
			result.current.open('データ');
		});
		act(() => {
			result.current.close();
		});

		expect(result.current.isOpen).toBe(false);
		expect(result.current.data).toBeNull();
	});

	it('openでdata未指定の場合、既存dataを保持する', () => {
		const { result } = renderHook(() => useModal<string>('初期値'));

		act(() => {
			result.current.open();
		});
		expect(result.current.data).toBe('初期値');
	});
});
