interface MessageDisplayProps {
	message: string;
}

const MessageDisplay = ({ message }: MessageDisplayProps) => {
	if (!message) return null;

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
				backgroundColor: message.includes('失敗') ? '#ffebee' : '#e8f5e9',
				color: message.includes('失敗') ? '#c62828' : '#2e7d32',
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
