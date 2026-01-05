import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useMessage } from '../hooks/use-message';
import { HIGHLIGHT_TIMEOUT_MS } from '../constants/map-config';
import type { AppMode, MessageType } from '../types/common';

interface AppContextValue {
	// モード
	mode: AppMode;
	setMode: (mode: AppMode) => void;
	// メッセージ
	message: string;
	messageType: MessageType;
	showMessage: (msg: string, type?: MessageType) => void;
	// ハイライト
	highlightedPointId: string | null;
	highlightPoint: (pointId: string) => void;
	// 地図中央
	mapCenter: [number, number] | null;
	setMapCenter: (center: [number, number] | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const useAppContext = (): AppContextValue => {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error('useAppContext must be used within an AppProvider');
	}
	return context;
};

interface AppProviderProps {
	children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
	const [mode, setMode] = useState<AppMode>('view');
	const [highlightedPointId, setHighlightedPointId] = useState<string | null>(null);
	const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
	const { message, messageType, showMessage } = useMessage();

	// ポイントをハイライト（一定時間後に解除）
	const highlightPoint = useCallback((pointId: string) => {
		setHighlightedPointId(pointId);
		setTimeout(() => {
			setHighlightedPointId(null);
			setMapCenter(null);
		}, HIGHLIGHT_TIMEOUT_MS);
	}, []);

	const value: AppContextValue = {
		mode,
		setMode,
		message,
		messageType,
		showMessage,
		highlightedPointId,
		highlightPoint,
		mapCenter,
		setMapCenter,
	};

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
