import clsx from 'clsx';
import { useState, useEffect } from 'react';
import type { Point } from '../types/point';
import buttonStyles from '../styles/shared/buttons.module.css';
import formStyles from '../styles/shared/forms.module.css';
import modalStyles from '../styles/shared/modal.module.css';
import styles from './PointEditModal.module.css';

interface PointEditModalProps {
	point: Point | null;
	onClose: () => void;
	onSave: (pointId: string, type: Point['type'], comment: string) => void;
	onDelete: (pointId: string) => void;
}

const PointEditModal = ({ point, onClose, onSave, onDelete }: PointEditModalProps) => {
	const [type, setType] = useState<Point['type']>('waypoint');
	const [comment, setComment] = useState('');

	useEffect(() => {
		if (point) {
			setType(point.type);
			setComment(point.comment);
		}
	}, [point]);

	if (!point) {
		return null;
	}

	const handleSave = () => {
		onSave(point.id, type, comment);
		onClose();
	};

	const handleDelete = () => {
		if (window.confirm('このポイントを削除しますか？')) {
			onDelete(point.id);
			onClose();
		}
	};

	return (
		<div className={modalStyles.overlay} onClick={onClose}>
			<div className={modalStyles.content} onClick={(e) => e.stopPropagation()}>
				<h2 className={styles.title}>ポイント編集</h2>

				{/* 種別選択 */}
				<div className={styles.section}>
					<label className={formStyles.label}>種別:</label>
					<div className={formStyles.radioGroup}>
						<label className={formStyles.radioLabel}>
							<input
								type="radio"
								name="type"
								value="start"
								checked={type === 'start'}
								onChange={(e) => setType(e.target.value as Point['type'])}
							/>
							スタート
						</label>
						<label className={formStyles.radioLabel}>
							<input
								type="radio"
								name="type"
								value="waypoint"
								checked={type === 'waypoint'}
								onChange={(e) => setType(e.target.value as Point['type'])}
							/>
							中継地点
						</label>
						<label className={formStyles.radioLabel}>
							<input
								type="radio"
								name="type"
								value="goal"
								checked={type === 'goal'}
								onChange={(e) => setType(e.target.value as Point['type'])}
							/>
							ゴール
						</label>
					</div>
				</div>

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
						aria-label="ポイントを保存"
						className={clsx(buttonStyles.button, buttonStyles.lg, buttonStyles.success, buttonStyles.flex)}
					>
						保存
					</button>
					<button
						type="button"
						onClick={handleDelete}
						aria-label="ポイントを削除"
						className={clsx(buttonStyles.button, buttonStyles.lg, buttonStyles.danger, buttonStyles.flex)}
					>
						削除
					</button>
					<button
						type="button"
						onClick={onClose}
						aria-label="編集をキャンセル"
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
