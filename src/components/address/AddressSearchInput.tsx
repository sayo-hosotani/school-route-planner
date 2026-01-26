import { memo, useState, useCallback } from 'react';
import clsx from 'clsx';
import { searchAddress, type GeocodingResult } from '../../api/geocoding-client';
import buttonStyles from '../../styles/shared/buttons.module.css';
import formStyles from '../../styles/shared/forms.module.css';
import styles from './AddressSearchInput.module.css';

interface AddressSearchInputProps {
	onSelect: (result: GeocodingResult) => void;
	onError?: (message: string) => void;
	placeholder?: string;
	compact?: boolean;
}

const AddressSearchInput = memo(({
	onSelect,
	onError,
	placeholder = '住所を入力（例：東京都千代田区）',
	compact = false,
}: AddressSearchInputProps) => {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<GeocodingResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showResults, setShowResults] = useState(false);

	const handleSearch = useCallback(async () => {
		if (!query.trim()) {
			return;
		}

		setIsLoading(true);
		setResults([]);
		setShowResults(false);

		try {
			const searchResults = await searchAddress(query);

			if (searchResults.length === 0) {
				onError?.('住所が見つかりませんでした');
				return;
			}

			if (searchResults.length === 1) {
				// 結果が1件の場合は直接選択
				onSelect(searchResults[0]);
				setQuery('');
			} else {
				// 複数候補がある場合はリスト表示
				setResults(searchResults);
				setShowResults(true);
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : '住所検索に失敗しました';
			onError?.(message);
		} finally {
			setIsLoading(false);
		}
	}, [query, onSelect, onError]);

	const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleSearch();
		}
	}, [handleSearch]);

	const handleResultSelect = useCallback((result: GeocodingResult) => {
		onSelect(result);
		setQuery('');
		setResults([]);
		setShowResults(false);
	}, [onSelect]);

	const handleClearResults = useCallback(() => {
		setResults([]);
		setShowResults(false);
	}, []);

	return (
		<div className={clsx(styles.container, compact && styles.compact)}>
			<div className={styles.inputRow}>
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					className={clsx(formStyles.input, styles.input)}
					disabled={isLoading}
				/>
				<button
					type="button"
					onClick={handleSearch}
					disabled={isLoading || !query.trim()}
					className={clsx(
						buttonStyles.button,
						compact ? buttonStyles.sm : buttonStyles.md,
						buttonStyles.primary,
						styles.searchButton,
					)}
				>
					{isLoading ? '...' : '検索'}
				</button>
			</div>

			{/* 検索結果リスト */}
			{showResults && results.length > 0 && (
				<div className={styles.resultsList}>
					<div className={styles.resultsHeader}>
						<span className={styles.resultsCount}>{results.length}件の候補</span>
						<button
							type="button"
							onClick={handleClearResults}
							className={styles.closeResultsButton}
							aria-label="候補を閉じる"
						>
							×
						</button>
					</div>
					<ul className={styles.results}>
						{results.map((result, index) => (
							<li key={`${result.lat}-${result.lng}-${index}`}>
								<button
									type="button"
									onClick={() => handleResultSelect(result)}
									className={styles.resultItem}
								>
									<span className={styles.resultAddress}>{result.address}</span>
									<span className={styles.resultCoords}>
										{result.lat.toFixed(6)}, {result.lng.toFixed(6)}
									</span>
								</button>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
});

AddressSearchInput.displayName = 'AddressSearchInput';

export default AddressSearchInput;
