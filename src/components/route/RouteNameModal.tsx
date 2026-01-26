import clsx from 'clsx';
import { useState, useEffect } from 'react';
import buttonStyles from '../../styles/shared/buttons.module.css';
import formStyles from '../../styles/shared/forms.module.css';
import modalStyles from '../../styles/shared/modal.module.css';
import styles from './RouteNameModal.module.css';

interface RouteNameModalProps {
	isOpen: boolean;
	onSave: (routeName: string) => void;
	onClose: () => void;
}

const RouteNameModal = ({ isOpen, onSave, onClose }: RouteNameModalProps) => {
	const [routeName, setRouteName] = useState('');

	// モーダルが開かれたときにデフォルト値を設定
	useEffect(() => {
		if (isOpen) {
			const defaultName = `経路 ${new Date().toLocaleString('ja-JP')}`;
			setRouteName(defaultName);
		}
	}, [isOpen]);

	if (!isOpen) return null;

	const handleSave = () => {
		const finalName = routeName.trim() || `経路 ${new Date().toLocaleString('ja-JP')}`;
		onSave(finalName);
		onClose();
	};

	return (
		<div className={modalStyles.overlay}>
			<div className={modalStyles.content}>
				<h2 className={styles.title}>経路を保存</h2>

				<div className={formStyles.group}>
					<label htmlFor="routeName" className={formStyles.label}>
						経路名:
					</label>
					<input
						id="routeName"
						type="text"
						value={routeName}
						onChange={(e) => setRouteName(e.target.value)}
						className={formStyles.input}
						placeholder="経路 YYYY/MM/DD HH:mm:ss"
						autoFocus
					/>
				</div>

				<div className={styles.actions}>
					<button
						type="button"
						onClick={handleSave}
						className={clsx(buttonStyles.button, buttonStyles.md, buttonStyles.success)}
					>
						保存
					</button>
					<button
						type="button"
						onClick={onClose}
						className={clsx(buttonStyles.button, buttonStyles.md, buttonStyles.outline)}
					>
						キャンセル
					</button>
				</div>
			</div>
		</div>
	);
};

export default RouteNameModal;
