import { useState, useRef, useCallback, useEffect } from 'react';
import type { MessageType } from '../components/MessageDisplay';
import { MESSAGE_TIMEOUT_MS } from '../constants/map-config';

interface UseMessageReturn {
	message: string;
	messageType: MessageType;
	showMessage: (msg: string, type?: MessageType) => void;
	clearMessage: () => void;
}

export const useMessage = (): UseMessageReturn => {
	const [message, setMessage] = useState<string>('');
	const [messageType, setMessageType] = useState<MessageType>('success');
	const timeoutRef = useRef<number | null>(null);

	// クリーンアップ
	useEffect(() => {
		return () => {
			if (timeoutRef.current !== null) {
				window.clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	const clearMessage = useCallback(() => {
		setMessage('');
	}, []);

	const showMessage = useCallback((msg: string, type: MessageType = 'success') => {
		// 既存のタイマーをクリア
		if (timeoutRef.current !== null) {
			window.clearTimeout(timeoutRef.current);
		}

		setMessage(msg);
		setMessageType(type);

		// 自動消去タイマーを設定
		timeoutRef.current = window.setTimeout(() => {
			setMessage('');
			timeoutRef.current = null;
		}, MESSAGE_TIMEOUT_MS);
	}, []);

	return {
		message,
		messageType,
		showMessage,
		clearMessage,
	};
};
