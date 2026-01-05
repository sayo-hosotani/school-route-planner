import { ApiError } from './errors';

const API_BASE_URL = 'http://localhost:3000';

/**
 * HTTPメソッド
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * APIリクエストオプション
 */
interface RequestOptions<T = unknown> {
	method?: HttpMethod;
	body?: T;
	headers?: Record<string, string>;
}

/**
 * サーバーからのレスポンス形式
 */
interface ServerResponse<T> {
	success: boolean;
	message?: string;
	data?: T;
}

/**
 * レスポンスからエラーメッセージを抽出
 */
async function extractErrorMessage(response: Response): Promise<string | undefined> {
	try {
		const json = await response.json();
		return json.message || json.error;
	} catch {
		return undefined;
	}
}

/**
 * 共通のAPIクライアント関数
 *
 * @param endpoint - APIエンドポイント（例: '/routes'）
 * @param options - リクエストオプション
 * @returns サーバーレスポンスのdata部分
 * @throws {ApiError} API呼び出しエラー
 */
export async function apiClient<TResponse, TRequest = unknown>(
	endpoint: string,
	options: RequestOptions<TRequest> = {},
): Promise<TResponse> {
	const { method = 'GET', body, headers = {} } = options;

	const url = `${API_BASE_URL}${endpoint}`;

	const requestInit: RequestInit = {
		method,
		headers: {
			'Content-Type': 'application/json',
			...headers,
		},
	};

	if (body !== undefined) {
		requestInit.body = JSON.stringify(body);
	}

	let response: Response;

	try {
		response = await fetch(url, requestInit);
	} catch (error) {
		console.error(`Network error on ${method} ${endpoint}:`, error);
		throw ApiError.fromNetworkError(error);
	}

	if (!response.ok) {
		const errorMessage = await extractErrorMessage(response);
		console.error(`API error on ${method} ${endpoint}: ${response.status}`, errorMessage);
		throw ApiError.fromResponse(response, errorMessage);
	}

	// DELETEなどでレスポンスボディがない場合
	const contentType = response.headers.get('content-type');
	if (!contentType || !contentType.includes('application/json')) {
		return undefined as TResponse;
	}

	const json: ServerResponse<TResponse> = await response.json();
	return json.data as TResponse;
}

/**
 * GETリクエスト
 */
export function get<TResponse>(endpoint: string): Promise<TResponse> {
	return apiClient<TResponse>(endpoint, { method: 'GET' });
}

/**
 * POSTリクエスト
 */
export function post<TResponse, TRequest = unknown>(
	endpoint: string,
	body: TRequest,
): Promise<TResponse> {
	return apiClient<TResponse, TRequest>(endpoint, { method: 'POST', body });
}

/**
 * DELETEリクエスト
 */
export function del<TResponse = void>(endpoint: string): Promise<TResponse> {
	return apiClient<TResponse>(endpoint, { method: 'DELETE' });
}

export { API_BASE_URL };
