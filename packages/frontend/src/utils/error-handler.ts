/**
 * 共通エラーハンドリングユーティリティ
 */

import { ApiError } from '../api/errors';

type MessageFn = (message: string, type?: 'success' | 'error') => void;

interface AsyncOperationOptions<T> {
	/** 実行する非同期処理 */
	operation: () => Promise<T>;
	/** 成功時のメッセージ */
	successMessage?: string;
	/** エラー時のデフォルトメッセージ */
	errorMessage: string;
	/** メッセージ表示関数 */
	showMessage: MessageFn;
	/** 成功時のコールバック */
	onSuccess?: (result: T) => void;
	/** エラー時のコールバック */
	onError?: (error: unknown) => void;
}

/**
 * ApiErrorからユーザー向けメッセージを生成
 */
function getErrorMessage(error: unknown, defaultMessage: string): string {
	if (error instanceof ApiError) {
		return error.message;
	}
	return defaultMessage;
}

/**
 * 非同期操作を実行し、成功/失敗時のメッセージ表示を統一的に行う
 */
export async function handleAsyncOperation<T>({
	operation,
	successMessage,
	errorMessage,
	showMessage,
	onSuccess,
	onError,
}: AsyncOperationOptions<T>): Promise<T | null> {
	try {
		const result = await operation();
		if (successMessage) {
			showMessage(successMessage);
		}
		onSuccess?.(result);
		return result;
	} catch (error) {
		const message = getErrorMessage(error, errorMessage);
		showMessage(message, 'error');
		onError?.(error);
		return null;
	}
}
