import { memo, useCallback, useEffect } from 'react';
import clsx from 'clsx';
import type { GeocodingResult } from '../../api/geocoding-client';
import AddressSearchInput from './AddressSearchInput';
import modalStyles from '../../styles/shared/modal.module.css';
import styles from './AddressSearchModal.module.css';

interface AddressSearchModalProps {
	isOpen: boolean;
	onClose: () => void;
	onAddPoint: (lat: number, lng: number, comment: string) => void;
	onError?: (message: string) => void;
}

const AddressSearchModal = memo(({
	isOpen,
	onClose,
	onAddPoint,
	onError,
}: AddressSearchModalProps) => {
	const handleSelect = useCallback((result: GeocodingResult) => {
		onAddPoint(result.lat, result.lng, result.address);
		onClose();
	}, [onAddPoint, onClose]);

	// キーボードイベント: Escapeで閉じる
	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				onClose();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [isOpen, onClose]);

	if (!isOpen) {
		return null;
	}

	return (
		<div className={modalStyles.overlay} role="presentation">
			<div className={clsx(modalStyles.content, styles.container)}>
				{/* 閉じるボタン */}
				<button
					type="button"
					onClick={onClose}
					aria-label="閉じる（Escapeでも操作可）"
					title="閉じる（Escape）"
					className={styles.closeButton}
				>
					×
				</button>

				<h2 className={modalStyles.title}>住所からポイントを追加</h2>

				<p className={styles.description}>
					住所を入力して検索すると、その地点をポイントとして追加します。
				</p>

				<AddressSearchInput
					onSelect={handleSelect}
					onError={onError}
					placeholder="住所を入力（例：東京都千代田区）"
				/>
			</div>
		</div>
	);
});

AddressSearchModal.displayName = 'AddressSearchModal';

export default AddressSearchModal;
