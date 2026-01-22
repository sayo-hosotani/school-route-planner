import { memo, useCallback, useRef } from 'react';
import clsx from 'clsx';
import type { RouteHandlers } from '../types/handlers';
import { exportRoutesToJson, importRoutesFromJson } from '../api/route-api';
import SavedRouteList from './SavedRouteList';
import buttonStyles from '../styles/shared/buttons.module.css';
import styles from './Sidebar.module.css';

interface ViewModeSectionProps {
	routeHandlers: RouteHandlers;
	onMessage: (message: string, type?: 'success' | 'error') => void;
	routeListRefreshTrigger?: number;
	onRefreshRouteList: () => void;
}

const ViewModeSection = memo(({
	routeHandlers,
	onMessage,
	routeListRefreshTrigger,
	onRefreshRouteList,
}: ViewModeSectionProps) => {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleExport = useCallback(() => {
		try {
			const json = exportRoutesToJson();
			const blob = new Blob([json], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `routes-${new Date().toISOString().slice(0, 10)}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			onMessage('経路をエクスポートしました');
		} catch {
			onMessage('エクスポートに失敗しました', 'error');
		}
	}, [onMessage]);

	const handleImportClick = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const content = event.target?.result as string;
				const count = importRoutesFromJson(content, 'after');
				onMessage(`${count}件の経路をインポートしました`);
				onRefreshRouteList();
			} catch {
				onMessage('インポートに失敗しました。JSONファイルの形式を確認してください', 'error');
			}
		};
		reader.onerror = () => {
			onMessage('ファイルの読み込みに失敗しました', 'error');
		};
		reader.readAsText(file);

		// ファイル選択をリセット（同じファイルを再選択可能にする）
		e.target.value = '';
	}, [onMessage, onRefreshRouteList]);

	return (
		<div className={styles.section}>
			<h3 className={styles.sectionTitle}>通常モード</h3>
			<div className={styles.buttonGroup}>
				<button
					type="button"
					onClick={routeHandlers.onSave}
					aria-label="現在の経路を保存"
					className={clsx(buttonStyles.button, buttonStyles.md, buttonStyles.success)}
				>
					現在の経路を保存
				</button>
			</div>

			<SavedRouteList
				onLoadRoute={routeHandlers.onLoadRoute}
				onMessage={onMessage}
				refreshTrigger={routeListRefreshTrigger}
			/>

			<div className={styles.buttonGroup} style={{ marginTop: 'var(--spacing-md)' }}>
				<button
					type="button"
					onClick={handleExport}
					aria-label="経路一覧をJSONファイルとしてエクスポート"
					className={clsx(buttonStyles.button, buttonStyles.md, buttonStyles.secondary)}
				>
					エクスポート
				</button>
				<button
					type="button"
					onClick={handleImportClick}
					aria-label="JSONファイルから経路をインポート"
					className={clsx(buttonStyles.button, buttonStyles.md, buttonStyles.secondary)}
				>
					インポート
				</button>
				<input
					ref={fileInputRef}
					type="file"
					accept=".json"
					onChange={handleFileChange}
					style={{ display: 'none' }}
					aria-hidden="true"
				/>
			</div>
		</div>
	);
});

ViewModeSection.displayName = 'ViewModeSection';

export default ViewModeSection;
