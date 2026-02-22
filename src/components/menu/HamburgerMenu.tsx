import { memo, useState, useCallback, useRef } from 'react';
import clsx from 'clsx';
import { exportRoutesToJson, importRoutesFromJson } from '../../api/route-api';
import styles from './HamburgerMenu.module.css';

interface HamburgerMenuProps {
	onNewRoute: () => void;
	onSaveRoute: () => void;
	onOpenRouteList: () => void;
	onOpenAddressSearch: () => void;
	onMessage: (message: string, type?: 'success' | 'error') => void;
	onRefreshRouteList: () => void;
	onDownloadMap: () => Promise<void>;
	hasPoints: boolean;
}

const HamburgerMenu = memo(({
	onNewRoute,
	onSaveRoute,
	onOpenRouteList,
	onOpenAddressSearch,
	onMessage,
	onRefreshRouteList,
	onDownloadMap,
	hasPoints,
}: HamburgerMenuProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const toggleMenu = useCallback(() => {
		setIsOpen((prev) => !prev);
	}, []);

	const closeMenu = useCallback(() => {
		setIsOpen(false);
	}, []);

	const handleMenuItemClick = useCallback((action: () => void) => {
		action();
		closeMenu();
	}, [closeMenu]);

	// 通学路の新規作成
	const handleNewRoute = useCallback(() => {
		handleMenuItemClick(onNewRoute);
	}, [handleMenuItemClick, onNewRoute]);

	// 通学路の保存
	const handleSaveRoute = useCallback(() => {
		handleMenuItemClick(onSaveRoute);
	}, [handleMenuItemClick, onSaveRoute]);

	// 通学路の一覧
	const handleOpenRouteList = useCallback(() => {
		handleMenuItemClick(onOpenRouteList);
	}, [handleMenuItemClick, onOpenRouteList]);

	// 住所からポイントを追加
	const handleOpenAddressSearch = useCallback(() => {
		handleMenuItemClick(onOpenAddressSearch);
	}, [handleMenuItemClick, onOpenAddressSearch]);

	// エクスポート
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
		closeMenu();
	}, [onMessage, closeMenu]);

	// 地図ダウンロード
	const handleDownloadMap = useCallback(() => {
		onDownloadMap();
		closeMenu();
	}, [onDownloadMap, closeMenu]);

	// インポート
	const handleImportClick = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 1024 * 1024) {
			onMessage('ファイルサイズが1MBを超えています', 'error');
			e.target.value = '';
			closeMenu();
			return;
		}

		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const content = event.target?.result as string;
				const count = importRoutesFromJson(content, 'after');
				onMessage(`${count}件の経路をインポートしました`);
				onRefreshRouteList();
				onOpenRouteList();
			} catch (err) {
				const message = err instanceof Error ? err.message : 'JSONファイルの形式を確認してください';
				onMessage(`インポートに失敗しました: ${message}`, 'error');
			}
		};
		reader.onerror = () => {
			onMessage('ファイルの読み込みに失敗しました', 'error');
		};
		reader.readAsText(file);
		e.target.value = '';
		closeMenu();
	}, [onMessage, onRefreshRouteList, onOpenRouteList, closeMenu]);

	return (
		<>
			{/* ハンバーガーボタン */}
			<button
				type="button"
				className={clsx(styles.hamburgerButton, isOpen && styles.open)}
				onClick={toggleMenu}
				aria-label={isOpen ? 'メニューを閉じる' : 'メニューを開く'}
				aria-expanded={isOpen}
			>
				<span className={styles.hamburgerLine} />
				<span className={styles.hamburgerLine} />
				<span className={styles.hamburgerLine} />
			</button>

			{/* メニューパネル */}
			{isOpen && (
				<>
					<div
						className={styles.overlay}
						onClick={closeMenu}
						aria-hidden="true"
					/>
					<nav className={styles.menuPanel} role="menu">
						<button
							type="button"
							className={styles.menuItem}
							onClick={handleNewRoute}
							role="menuitem"
						>
							<span className={styles.menuIcon}>+</span>
							通学路の新規作成
						</button>

						<button
							type="button"
							className={styles.menuItem}
							onClick={handleSaveRoute}
							role="menuitem"
							disabled={!hasPoints}
						>
							<span className={styles.menuIcon}>💾</span>
							通学路の保存
						</button>

						<button
							type="button"
							className={styles.menuItem}
							onClick={handleOpenRouteList}
							role="menuitem"
						>
							<span className={styles.menuIcon}>📋</span>
							通学路の一覧
						</button>

						<div className={styles.separator} />

						<button
							type="button"
							className={styles.menuItem}
							onClick={handleOpenAddressSearch}
							role="menuitem"
						>
							<span className={styles.menuIcon}>📍</span>
							住所からポイントを追加
						</button>

						<div className={styles.separator} />

						<button
							type="button"
							className={styles.menuItem}
							onClick={handleExport}
							role="menuitem"
						>
							<span className={styles.menuIcon}>📤</span>
							エクスポート
						</button>

						<button
							type="button"
							className={styles.menuItem}
							onClick={handleImportClick}
							role="menuitem"
						>
							<span className={styles.menuIcon}>📥</span>
							インポート
						</button>

						<button
							type="button"
							className={styles.menuItem}
							onClick={handleDownloadMap}
							role="menuitem"
						>
							<span className={styles.menuIcon}>🖼️</span>
							地図をダウンロード
						</button>

						<input
							ref={fileInputRef}
							type="file"
							accept=".json"
							onChange={handleFileChange}
							className={styles.hiddenInput}
							aria-hidden="true"
						/>
					</nav>
				</>
			)}
		</>
	);
});

HamburgerMenu.displayName = 'HamburgerMenu';

export default HamburgerMenu;
