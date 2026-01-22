import styles from './LoadingOverlay.module.css';

interface LoadingOverlayProps {
	isLoading: boolean;
	message?: string;
}

const LoadingOverlay = ({ isLoading, message }: LoadingOverlayProps) => {
	if (!isLoading) return null;

	return (
		<div className={styles.overlay}>
			<div className={styles.spinner} />
			{message && <div className={styles.message}>{message}</div>}
		</div>
	);
};

export default LoadingOverlay;
