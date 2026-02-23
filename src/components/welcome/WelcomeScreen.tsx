import clsx from 'clsx';
import { memo, useCallback, useRef } from 'react';
import type { GeocodingResult } from '../../api/geocoding-client';
import { importRoutesFromJson } from '../../api/route-api';
import buttonStyles from '../../styles/shared/buttons.module.css';
import modalStyles from '../../styles/shared/modal.module.css';
import AddressSearchInput from '../address/AddressSearchInput';
import styles from './WelcomeScreen.module.css';

interface WelcomeScreenProps {
	isOpen: boolean;
	onClose: () => void;
	onAddPoint: (lat: number, lng: number, comment: string) => void;
	onImportSuccess: (count: number) => void;
	onError: (message: string) => void;
}

const WelcomeScreen = memo(
	({ isOpen, onClose, onAddPoint, onImportSuccess, onError }: WelcomeScreenProps) => {
		const fileInputRef = useRef<HTMLInputElement>(null);

		// 住所選択時のハンドラ
		const handleAddressSelect = useCallback(
			(result: GeocodingResult) => {
				onAddPoint(result.lat, result.lng, result.address);
				onClose();
			},
			[onAddPoint, onClose],
		);

		// インポートボタンクリック
		const handleImportClick = useCallback(() => {
			fileInputRef.current?.click();
		}, []);

		// ファイル選択時のハンドラ
		const handleFileChange = useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				const file = e.target.files?.[0];
				if (!file) return;

				if (file.size > 1024 * 1024) {
					onError('ファイルサイズが1MBを超えています');
					e.target.value = '';
					return;
				}

				const reader = new FileReader();
				reader.onload = (event) => {
					try {
						const content = event.target?.result as string;
						const count = importRoutesFromJson(content, 'after');
						onImportSuccess(count);
						onClose();
					} catch (err) {
						const message =
							err instanceof Error ? err.message : 'JSONファイルの形式を確認してください';
						onError(`インポートに失敗しました: ${message}`);
					}
				};
				reader.onerror = () => {
					onError('ファイルの読み込みに失敗しました');
				};
				reader.readAsText(file);
				e.target.value = '';
			},
			[onImportSuccess, onClose, onError],
		);

		// オーバーレイクリック時のハンドラ
		const handleOverlayClick = useCallback(
			(e: React.MouseEvent) => {
				if (e.target === e.currentTarget) {
					onClose();
				}
			},
			[onClose],
		);

		if (!isOpen) {
			return null;
		}

		return (
			<div className={modalStyles.overlay} role="presentation" onClick={handleOverlayClick}>
				<div className={clsx(modalStyles.content, styles.container)}>
					<h1 className={styles.title}>通学路マップ</h1>

					<p className={styles.description}>
						地図上にスタート、ゴール、中継地点を指定してください。
						<br />
						経路を自動生成して表示します。
					</p>

					<div className={styles.section}>
						<h2 className={styles.sectionTitle}>住所からポイントを追加</h2>
						<AddressSearchInput
							onSelect={handleAddressSelect}
							onError={onError}
							placeholder="住所を入力（例：東京都千代田区）"
						/>
					</div>

					<div className={styles.divider} />

					<div className={styles.section}>
						<h2 className={styles.sectionTitle}>保存済み経路をインポート</h2>
						<button
							type="button"
							onClick={handleImportClick}
							className={clsx(
								buttonStyles.button,
								buttonStyles.md,
								buttonStyles.secondary,
								styles.importButton,
							)}
						>
							<span className={styles.buttonIcon}>📥</span>
							JSONファイルをインポート
						</button>
						<input
							ref={fileInputRef}
							type="file"
							accept=".json"
							onChange={handleFileChange}
							className={styles.hiddenInput}
							aria-hidden="true"
						/>
					</div>

					<p className={styles.hint}>または、地図をクリックしてポイントを追加できます</p>
				</div>
			</div>
		);
	},
);

WelcomeScreen.displayName = 'WelcomeScreen';

export default WelcomeScreen;
