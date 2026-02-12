import { ApiError, type ApiErrorType } from './errors';

describe('ApiError', () => {
	describe('constructor', () => {
		it('指定されたtypeとmessageでエラーを生成する', () => {
			const error = new ApiError('BAD_REQUEST', 'テストエラー');
			expect(error.type).toBe('BAD_REQUEST');
			expect(error.message).toBe('テストエラー');
		});

		it('messageが未指定の場合、デフォルトメッセージを使用する', () => {
			const error = new ApiError('NETWORK_ERROR');
			expect(error.message).toBe('ネットワークエラーが発生しました。接続を確認してください。');
		});

		it('statusとoriginalErrorをoptionsから設定する', () => {
			const originalError = new Error('original');
			const error = new ApiError('SERVER_ERROR', 'テスト', {
				status: 500,
				originalError,
			});
			expect(error.status).toBe(500);
			expect(error.originalError).toBe(originalError);
		});

		it('nameプロパティが"ApiError"である', () => {
			const error = new ApiError('UNKNOWN');
			expect(error.name).toBe('ApiError');
		});

		it('Errorを継承している', () => {
			const error = new ApiError('UNKNOWN');
			expect(error).toBeInstanceOf(Error);
		});

		it.each<[ApiErrorType, string]>([
			['NETWORK_ERROR', 'ネットワークエラーが発生しました。接続を確認してください。'],
			['NOT_FOUND', '要求されたリソースが見つかりません。'],
			['BAD_REQUEST', 'リクエストが不正です。'],
			['UNAUTHORIZED', '認証が必要です。'],
			['FORBIDDEN', 'アクセスが拒否されました。'],
			['SERVER_ERROR', 'サーバーエラーが発生しました。しばらく待ってから再試行してください。'],
			['UNKNOWN', '予期しないエラーが発生しました。'],
		])('タイプ"%s"のデフォルトメッセージが正しい', (type, expectedMessage) => {
			const error = new ApiError(type);
			expect(error.message).toBe(expectedMessage);
		});
	});

	describe('fromResponse', () => {
		it('400ステータスの場合、BAD_REQUESTタイプを返す', () => {
			const error = ApiError.fromResponse({ status: 400 } as Response);
			expect(error.type).toBe('BAD_REQUEST');
			expect(error.status).toBe(400);
		});

		it('401ステータスの場合、UNAUTHORIZEDタイプを返す', () => {
			const error = ApiError.fromResponse({ status: 401 } as Response);
			expect(error.type).toBe('UNAUTHORIZED');
		});

		it('403ステータスの場合、FORBIDDENタイプを返す', () => {
			const error = ApiError.fromResponse({ status: 403 } as Response);
			expect(error.type).toBe('FORBIDDEN');
		});

		it('404ステータスの場合、NOT_FOUNDタイプを返す', () => {
			const error = ApiError.fromResponse({ status: 404 } as Response);
			expect(error.type).toBe('NOT_FOUND');
		});

		it('500ステータスの場合、SERVER_ERRORタイプを返す', () => {
			const error = ApiError.fromResponse({ status: 500 } as Response);
			expect(error.type).toBe('SERVER_ERROR');
		});

		it('502ステータスの場合、SERVER_ERRORタイプを返す', () => {
			const error = ApiError.fromResponse({ status: 502 } as Response);
			expect(error.type).toBe('SERVER_ERROR');
		});

		it('未知のステータスの場合、UNKNOWNタイプを返す', () => {
			const error = ApiError.fromResponse({ status: 418 } as Response);
			expect(error.type).toBe('UNKNOWN');
		});

		it('serverMessageが指定された場合、そのメッセージを使用する', () => {
			const error = ApiError.fromResponse({ status: 400 } as Response, 'カスタムメッセージ');
			expect(error.message).toBe('カスタムメッセージ');
		});

		it('serverMessageが未指定の場合、デフォルトメッセージを使用する', () => {
			const error = ApiError.fromResponse({ status: 404 } as Response);
			expect(error.message).toBe('要求されたリソースが見つかりません。');
		});
	});

	describe('fromNetworkError', () => {
		it('NETWORK_ERRORタイプのApiErrorを返す', () => {
			const error = ApiError.fromNetworkError(new Error('fetch failed'));
			expect(error.type).toBe('NETWORK_ERROR');
		});

		it('originalErrorを保持する', () => {
			const original = new Error('fetch failed');
			const error = ApiError.fromNetworkError(original);
			expect(error.originalError).toBe(original);
		});

		it('デフォルトのネットワークエラーメッセージを使用する', () => {
			const error = ApiError.fromNetworkError(new Error());
			expect(error.message).toBe('ネットワークエラーが発生しました。接続を確認してください。');
		});
	});

	describe('fromUnknown', () => {
		it('ApiErrorが渡された場合、そのまま返す', () => {
			const original = new ApiError('BAD_REQUEST', 'テスト');
			const result = ApiError.fromUnknown(original);
			expect(result).toBe(original);
		});

		it('一般的なErrorの場合、UNKNOWNタイプのApiErrorを返す', () => {
			const original = new Error('一般エラー');
			const result = ApiError.fromUnknown(original);
			expect(result.type).toBe('UNKNOWN');
			expect(result.originalError).toBe(original);
		});

		it('文字列が渡された場合、UNKNOWNタイプのApiErrorを返す', () => {
			const result = ApiError.fromUnknown('文字列エラー');
			expect(result.type).toBe('UNKNOWN');
			expect(result.originalError).toBe('文字列エラー');
		});
	});
});
