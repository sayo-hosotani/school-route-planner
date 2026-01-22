/**
 * APIエラーの種類
 */
export type ApiErrorType =
	| 'NETWORK_ERROR'
	| 'NOT_FOUND'
	| 'BAD_REQUEST'
	| 'UNAUTHORIZED'
	| 'FORBIDDEN'
	| 'SERVER_ERROR'
	| 'UNKNOWN';

/**
 * HTTPステータスコードからエラータイプを判定
 */
function getErrorTypeFromStatus(status: number): ApiErrorType {
	if (status === 400) return 'BAD_REQUEST';
	if (status === 401) return 'UNAUTHORIZED';
	if (status === 403) return 'FORBIDDEN';
	if (status === 404) return 'NOT_FOUND';
	if (status >= 500) return 'SERVER_ERROR';
	return 'UNKNOWN';
}

/**
 * エラータイプに応じたデフォルトメッセージ
 */
function getDefaultMessage(type: ApiErrorType): string {
	switch (type) {
		case 'NETWORK_ERROR':
			return 'ネットワークエラーが発生しました。接続を確認してください。';
		case 'NOT_FOUND':
			return '要求されたリソースが見つかりません。';
		case 'BAD_REQUEST':
			return 'リクエストが不正です。';
		case 'UNAUTHORIZED':
			return '認証が必要です。';
		case 'FORBIDDEN':
			return 'アクセスが拒否されました。';
		case 'SERVER_ERROR':
			return 'サーバーエラーが発生しました。しばらく待ってから再試行してください。';
		default:
			return '予期しないエラーが発生しました。';
	}
}

/**
 * APIエラークラス
 */
export class ApiError extends Error {
	readonly type: ApiErrorType;
	readonly status?: number;
	readonly originalError?: unknown;

	constructor(
		type: ApiErrorType,
		message?: string,
		options?: { status?: number; originalError?: unknown },
	) {
		super(message || getDefaultMessage(type));
		this.name = 'ApiError';
		this.type = type;
		this.status = options?.status;
		this.originalError = options?.originalError;
	}

	/**
	 * HTTPレスポンスからApiErrorを生成
	 */
	static fromResponse(response: Response, serverMessage?: string): ApiError {
		const type = getErrorTypeFromStatus(response.status);
		const message = serverMessage || getDefaultMessage(type);
		return new ApiError(type, message, { status: response.status });
	}

	/**
	 * ネットワークエラーからApiErrorを生成
	 */
	static fromNetworkError(error: unknown): ApiError {
		return new ApiError('NETWORK_ERROR', undefined, { originalError: error });
	}

	/**
	 * 不明なエラーからApiErrorを生成
	 */
	static fromUnknown(error: unknown): ApiError {
		if (error instanceof ApiError) {
			return error;
		}
		return new ApiError('UNKNOWN', undefined, { originalError: error });
	}
}
