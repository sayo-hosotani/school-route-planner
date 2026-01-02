import { useState, useEffect } from 'react';

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

	const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	return (
		<div
			onClick={handleBackdropClick}
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: 'rgba(0, 0, 0, 0.5)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				zIndex: 2001,
			}}
		>
			<div
				style={{
					backgroundColor: 'white',
					padding: '24px',
					borderRadius: '8px',
					minWidth: '400px',
					boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
				}}
			>
				<h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
					経路を保存
				</h2>

				<div style={{ marginBottom: '16px' }}>
					<label
						htmlFor="routeName"
						style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}
					>
						経路名:
					</label>
					<input
						id="routeName"
						type="text"
						value={routeName}
						onChange={(e) => setRouteName(e.target.value)}
						style={{
							width: '100%',
							padding: '8px',
							fontSize: '14px',
							border: '1px solid #ccc',
							borderRadius: '4px',
							boxSizing: 'border-box',
						}}
						placeholder="経路 YYYY/MM/DD HH:mm:ss"
						autoFocus
					/>
				</div>

				<div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
					<button
						type="button"
						onClick={onClose}
						style={{
							padding: '8px 16px',
							fontSize: '14px',
							border: '1px solid #ccc',
							borderRadius: '4px',
							backgroundColor: 'white',
							cursor: 'pointer',
						}}
					>
						キャンセル
					</button>
					<button
						type="button"
						onClick={handleSave}
						style={{
							padding: '8px 16px',
							fontSize: '14px',
							border: 'none',
							borderRadius: '4px',
							backgroundColor: '#4CAF50',
							color: 'white',
							cursor: 'pointer',
							fontWeight: 'bold',
						}}
					>
						保存
					</button>
				</div>
			</div>
		</div>
	);
};

export default RouteNameModal;
