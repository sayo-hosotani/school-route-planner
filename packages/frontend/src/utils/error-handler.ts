/**
 * 共通エラーハンドリングユーティリティ
 */

type MessageFn = (message: string, type?: 'success' | 'error') => void;

interface AsyncOperationOptions<T> {
	/** 実行する非同期処理 */
	operation: () => Promise<T>;
	/** 成功時のメッセージ */
	successMessage?: string;
	/** エラー時のメッセージ */
	errorMessage: string;
	/** メッセージ表示関数 */
	showMessage: MessageFn;
	/** 成功時のコールバック */
	onSuccess?: (result: T) => void;
	/** エラー時のコールバック */
	onError?: (error: unknown) => void;
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
		showMessage(errorMessage, 'error');
		onError?.(error);
		return null;
	}
}

interface ApiResultOptions<T> {
	/** API呼び出し結果 */
	result: { success: boolean; data?: T };
	/** 成功時のメッセージ */
	successMessage: string;
	/** データがない場合のエラーメッセージ */
	notFoundMessage: string;
	/** メッセージ表示関数 */
	showMessage: MessageFn;
	/** 成功時のコールバック */
	onSuccess: (data: T) => void;
}

/**
 * API結果を処理し、成功/失敗に応じたメッセージを表示する
 */
export function handleApiResult<T>({
	result,
	successMessage,
	notFoundMessage,
	showMessage,
	onSuccess,
}: ApiResultOptions<T>): boolean {
	if (result.success && result.data) {
		onSuccess(result.data);
		showMessage(successMessage);
		return true;
	}
	showMessage(notFoundMessage, 'error');
	return false;
}
