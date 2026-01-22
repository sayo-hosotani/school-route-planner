/**
 * アプリケーション共通のカラー定数
 */

// ボタン・アクセント用カラー
export const COLORS = {
	// プライマリ（青）
	PRIMARY: '#007bff',
	PRIMARY_HOVER: '#0056b3',

	// 成功（緑）
	SUCCESS: '#28a745',
	SUCCESS_HOVER: '#1e7e34',

	// 危険（赤）
	DANGER: '#dc3545',
	DANGER_HOVER: '#c82333',

	// セカンダリ（グレー）
	SECONDARY: '#6c757d',
	SECONDARY_HOVER: '#545b62',

	// 無効状態
	DISABLED_BG: '#e9ecef',
	DISABLED_TEXT: '#adb5bd',

	// 背景色
	BG_LIGHT: '#f8f9fa',
	BG_MUTED: '#e9ecef',
	BG_WHITE: '#ffffff',
	BG_HIGHLIGHT: '#e3f2fd',
	BG_WARNING: '#fff3cd',

	// ボーダー
	BORDER_WARNING: '#ffc107',
	BORDER_HIGHLIGHT: '#2196f3',

	// テキスト
	TEXT_PRIMARY: '#333',
	TEXT_MUTED: '#666',
} as const;

// マーカー用カラー
export const MARKER_COLORS = {
	START: 'green',
	WAYPOINT: 'red',
	GOAL: 'blue',
} as const;
