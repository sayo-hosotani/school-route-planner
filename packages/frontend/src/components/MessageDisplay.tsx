import type { MessageType } from '../types/common';

interface MessageDisplayProps {
	message: string;
	type?: MessageType;
}

const MessageDisplay = ({ message, type = 'success' }: MessageDisplayProps) => {
	if (!message) return null;

	// メッセージタイプに応じた色を設定
	const isError = type === 'error';
	const backgroundColor = isError ? '#ffebee' : '#e8f5e9';
	const textColor = isError ? '#c62828' : '#2e7d32';

	return (
		<div
			style={{
				position: 'fixed',
				top: '20px',
				left: '50%',
				transform: 'translateX(-50%)',
				zIndex: 2000,
				padding: '12px 24px',
				borderRadius: '8px',
				backgroundColor,
				color: textColor,
				fontSize: '14px',
				fontWeight: 'bold',
				boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
				minWidth: '300px',
				textAlign: 'center',
			}}
		>
			{message}
		</div>
	);
};

export default MessageDisplay;
