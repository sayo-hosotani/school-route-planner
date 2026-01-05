import clsx from 'clsx';
import type { MessageType } from '../types/common';
import styles from './MessageDisplay.module.css';

interface MessageDisplayProps {
	message: string;
	type?: MessageType;
}

const MessageDisplay = ({ message, type = 'success' }: MessageDisplayProps) => {
	if (!message) return null;

	return (
		<div
			className={clsx(
				styles.container,
				type === 'error' ? styles.error : styles.success
			)}
		>
			{message}
		</div>
	);
};

export default MessageDisplay;
