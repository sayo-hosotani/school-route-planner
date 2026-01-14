import clsx from 'clsx';
import { useState, useEffect, useCallback } from 'react';
import type { Point } from '../types/point';
import buttonStyles from '../styles/shared/buttons.module.css';
import formStyles from '../styles/shared/forms.module.css';
import modalStyles from '../styles/shared/modal.module.css';
import styles from './PointEditModal.module.css';

interface PointEditModalProps {
	point: Point | null;
	onClose: () => void;
	onSave: (pointId: string, type: Point['type'], comment: string) => void;
}

const PointEditModal = ({ point, onClose, onSave }: PointEditModalProps) => {
	const [type, setType] = useState<Point['type']>('waypoint');
	const [comment, setComment] = useState('');

	useEffect(() => {
		if (point) {
			setType(point.type);
			setComment(point.comment);
		}
	}, [point]);

	const handleSave = useCallback(() => {
		if (!point) return;
		onSave(point.id, type, comment);
		onClose();
	}, [point, type, comment, onSave, onClose]);

	// キーボードイベント: Escapeで閉じる
	useEffect(() => {
		if (!point) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				onClose();
			}
			// Ctrl+S または Cmd+S で保存
			if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
				e.preventDefault();
				handleSave();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [point, onClose, handleSave]);

	if (!point) {
		return null;
	}

	const handleOverlayKeyDown = (e: React.KeyboardEvent) => {
		// Enterキーでオーバーレイがクリックされないようにする
		if (e.key === 'Enter') {
			e.stopPropagation();
		}
	};

	return (
		<div
			className={modalStyles.overlay}
			onClick={onClose}
			onKeyDown={handleOverlayKeyDown}
			role="presentation"
		>
			<div className={modalStyles.content} onClick={(e) => e.stopPropagation()}>
				{/* コメント入力 */}
				<div className={styles.section}>
					<label htmlFor="comment" className={formStyles.label}>
						コメント:
					</label>
					<textarea
						id="comment"
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						placeholder="コメントを入力してください（任意）&#13;&#10;1行目または最初の16文字が地図上のタイトルになります"
						className={formStyles.textarea}
					/>
				</div>

				{/* ボタン */}
				<div className={styles.actions}>
					<button
						type="button"
						onClick={handleSave}
						aria-label="ポイントを保存（Ctrl+Sでも操作可）"
						title="保存（Ctrl+S）"
						className={clsx(buttonStyles.button, buttonStyles.lg, buttonStyles.success, buttonStyles.flex)}
					>
						保存
					</button>
					<button
						type="button"
						onClick={onClose}
						aria-label="編集をキャンセル（Escapeでも操作可）"
						title="キャンセル（Escape）"
						className={clsx(buttonStyles.button, buttonStyles.lg, buttonStyles.secondary, buttonStyles.flex)}
					>
						キャンセル
					</button>
				</div>
			</div>
		</div>
	);
};

export default PointEditModal;
