import { useState, useEffect } from 'react';
import type { Point } from '../types/point';
import { COLORS } from '../constants/colors';

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
		<div
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
				zIndex: 2000,
			}}
			onClick={onClose}
		>
			<div
				style={{
					backgroundColor: 'white',
					padding: '24px',
					borderRadius: '8px',
					width: '400px',
					maxWidth: '90%',
					boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<h2 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>ポイント編集</h2>

				{/* 種別選択 */}
				<div style={{ marginBottom: '20px' }}>
					<label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
						種別:
					</label>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
						<label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
							<input
								type="radio"
								name="type"
								value="start"
								checked={type === 'start'}
								onChange={(e) => setType(e.target.value as Point['type'])}
								style={{ marginRight: '8px' }}
							/>
							スタート
						</label>
						<label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
							<input
								type="radio"
								name="type"
								value="waypoint"
								checked={type === 'waypoint'}
								onChange={(e) => setType(e.target.value as Point['type'])}
								style={{ marginRight: '8px' }}
							/>
							中継地点
						</label>
						<label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
							<input
								type="radio"
								name="type"
								value="goal"
								checked={type === 'goal'}
								onChange={(e) => setType(e.target.value as Point['type'])}
								style={{ marginRight: '8px' }}
							/>
							ゴール
						</label>
					</div>
				</div>

				{/* コメント入力 */}
				<div style={{ marginBottom: '20px' }}>
					<label
						htmlFor="comment"
						style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}
					>
						コメント:
					</label>
					<textarea
						id="comment"
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						placeholder="コメントを入力してください（任意）&#13;&#10;1行目または最初の16文字が地図上のタイトルになります"
						style={{
							width: '100%',
							minHeight: '80px',
							padding: '8px',
							fontSize: '14px',
							border: '1px solid #ccc',
							borderRadius: '4px',
							resize: 'vertical',
							boxSizing: 'border-box',
						}}
					/>
				</div>

				{/* ボタン */}
				<div style={{ display: 'flex', gap: '8px' }}>
					<button
						type="button"
						onClick={handleSave}
						aria-label="ポイントを保存"
						style={{
							flex: 1,
							padding: '10px 16px',
							cursor: 'pointer',
							backgroundColor: COLORS.SUCCESS,
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							fontSize: '14px',
							fontWeight: 'bold',
						}}
					>
						保存
					</button>
					<button
						type="button"
						onClick={handleDelete}
						aria-label="ポイントを削除"
						style={{
							flex: 1,
							padding: '10px 16px',
							cursor: 'pointer',
							backgroundColor: COLORS.DANGER,
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							fontSize: '14px',
							fontWeight: 'bold',
						}}
					>
						削除
					</button>
					<button
						type="button"
						onClick={onClose}
						aria-label="編集をキャンセル"
						style={{
							flex: 1,
							padding: '10px 16px',
							cursor: 'pointer',
							backgroundColor: COLORS.SECONDARY,
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							fontSize: '14px',
							fontWeight: 'bold',
						}}
					>
						キャンセル
					</button>
				</div>
			</div>
		</div>
	);
};

export default PointEditModal;
