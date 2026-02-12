import { ApiError } from '../api/errors';
import { handleAsyncOperation } from './error-handler';

describe('handleAsyncOperation', () => {
	const mockShowMessage = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('成功時', () => {
		it('operationの結果を返す', async () => {
			const result = await handleAsyncOperation({
				operation: () => Promise.resolve('結果'),
				errorMessage: 'エラー',
				showMessage: mockShowMessage,
			});
			expect(result).toBe('結果');
		});

		it('successMessageが指定された場合、showMessageを呼ぶ', async () => {
			await handleAsyncOperation({
				operation: () => Promise.resolve('結果'),
				successMessage: '成功しました',
				errorMessage: 'エラー',
				showMessage: mockShowMessage,
			});
			expect(mockShowMessage).toHaveBeenCalledWith('成功しました');
		});

		it('successMessageが未指定の場合、showMessageを呼ばない', async () => {
			await handleAsyncOperation({
				operation: () => Promise.resolve('結果'),
				errorMessage: 'エラー',
				showMessage: mockShowMessage,
			});
			expect(mockShowMessage).not.toHaveBeenCalled();
		});

		it('onSuccessコールバックにresultを渡す', async () => {
			const onSuccess = vi.fn();
			await handleAsyncOperation({
				operation: () => Promise.resolve('結果'),
				errorMessage: 'エラー',
				showMessage: mockShowMessage,
				onSuccess,
			});
			expect(onSuccess).toHaveBeenCalledWith('結果');
		});
	});

	describe('エラー時', () => {
		it('nullを返す', async () => {
			const result = await handleAsyncOperation({
				operation: () => Promise.reject(new Error('失敗')),
				errorMessage: 'デフォルトエラー',
				showMessage: mockShowMessage,
			});
			expect(result).toBeNull();
		});

		it('ApiErrorの場合、そのメッセージをshowMessageに渡す', async () => {
			const apiError = new ApiError('BAD_REQUEST', 'APIエラーメッセージ');
			await handleAsyncOperation({
				operation: () => Promise.reject(apiError),
				errorMessage: 'デフォルトエラー',
				showMessage: mockShowMessage,
			});
			expect(mockShowMessage).toHaveBeenCalledWith('APIエラーメッセージ', 'error');
		});

		it('一般的なErrorの場合、errorMessageをshowMessageに渡す', async () => {
			await handleAsyncOperation({
				operation: () => Promise.reject(new Error('一般エラー')),
				errorMessage: 'デフォルトエラー',
				showMessage: mockShowMessage,
			});
			expect(mockShowMessage).toHaveBeenCalledWith('デフォルトエラー', 'error');
		});

		it('showMessageをerrorタイプで呼ぶ', async () => {
			await handleAsyncOperation({
				operation: () => Promise.reject(new Error('失敗')),
				errorMessage: 'エラー発生',
				showMessage: mockShowMessage,
			});
			expect(mockShowMessage).toHaveBeenCalledWith('エラー発生', 'error');
		});

		it('onErrorコールバックにerrorを渡す', async () => {
			const onError = vi.fn();
			const error = new Error('失敗');
			await handleAsyncOperation({
				operation: () => Promise.reject(error),
				errorMessage: 'エラー',
				showMessage: mockShowMessage,
				onError,
			});
			expect(onError).toHaveBeenCalledWith(error);
		});

		it('onErrorが未指定の場合もエラーにならない', async () => {
			const result = await handleAsyncOperation({
				operation: () => Promise.reject(new Error('失敗')),
				errorMessage: 'エラー',
				showMessage: mockShowMessage,
			});
			expect(result).toBeNull();
		});
	});
});
