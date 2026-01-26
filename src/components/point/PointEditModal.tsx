import clsx from 'clsx';
import { useState, useEffect, useCallback } from 'react';
import type { Point } from '../../types/point';
import type { PointClickHandler, PointMoveHandler } from '../../types/handlers';
import buttonStyles from '../../styles/shared/buttons.module.css';
import formStyles from '../../styles/shared/forms.module.css';
import modalStyles from '../../styles/shared/modal.module.css';
import styles from './PointEditModal.module.css';

interface PointEditModalProps {
	point: Point | null;
	onClose: () => void;
	onSave: (pointId: string, type: Point['type'], comment: string) => void;
	onDeletePoint: PointClickHandler;
	onMovePoint?: PointMoveHandler;
}

const PointEditModal = ({ point, onClose, onSave, onDeletePoint, onMovePoint }: PointEditModalProps) => {
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

	const handleDelete = useCallback(() => {
		if (!point) return;
		onDeletePoint(point.id);
		onClose();
	}, [point, onDeletePoint, onClose]);

	const handleMove = useCallback((direction: 'up' | 'down') => {
		if (!point || !onMovePoint) return;
		onMovePoint(point.id, direction);
	}, [point, onMovePoint]);

	// 入れ替えボタンの表示条件（onMovePointがある場合は常に表示）
	const showSwapButtons = !!onMovePoint;
	// waypointのみ入れ替え可能
	const canSwap = point?.type === 'waypoint';

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

				<div className={clsx(styles.body, showSwapButtons && styles.bodyWithSwap)}>
					{/* ラベル行 */}
					<span className={clsx(formStyles.label, styles.pointLabel)}>ポイント:</span>
					<label htmlFor="comment" className={clsx(formStyles.label, styles.commentLabel)}>
						コメント:
					</label>

					{/* 入れ替えボタン（常に表示、waypointのみ有効） */}
					{showSwapButtons && (
						<>
							<button
								type="button"
								onClick={() => handleMove('up')}
								disabled={!canSwap}
								aria-label="前へ"
								className={clsx(buttonStyles.button, buttonStyles.md, buttonStyles.secondary, styles.moveUpButton)}
							>
								▲前へ
							</button>
							<button
								type="button"
								onClick={() => handleMove('down')}
								disabled={!canSwap}
								aria-label="後へ"
								className={clsx(buttonStyles.button, buttonStyles.md, buttonStyles.secondary, styles.moveDownButton)}
							>
								▼後へ
							</button>
						</>
					)}

					{/* テキストエリア */}
					<textarea
						id="comment"
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						placeholder="コメントを入力してください（任意）&#13;&#10;1行目または最初の16文字が地図上のタイトルになります"
						className={clsx(formStyles.textarea, styles.commentTextarea)}
					/>

					{/* 下部ボタン */}
					<button
						type="button"
						onClick={handleDelete}
						aria-label="ポイントを削除"
						title="削除"
						className={clsx(buttonStyles.button, buttonStyles.md, buttonStyles.danger, styles.deleteButton)}
					>
						削除
					</button>
					<button
						type="button"
						onClick={handleSave}
						aria-label="コメントを保存（Ctrl+Sでも操作可）"
						title="保存（Ctrl+S）"
						className={clsx(buttonStyles.button, buttonStyles.md, buttonStyles.success, styles.saveButton)}
					>
						保存
					</button>
				</div>
			</div>
		</div>
	);
};

export default PointEditModal;
