import { useState, useEffect, useCallback } from 'react';
import { getAllRoutes, deleteRoute, type SavedRoute } from '../api/route-api';
import { handleAsyncOperation } from '../utils/error-handler';

interface UseSavedRoutesOptions {
	onMessage: (message: string, type?: 'success' | 'error') => void;
	refreshTrigger?: number;
}

interface UseSavedRoutesReturn {
	savedRoutes: SavedRoute[];
	isLoading: boolean;
	handleDeleteRoute: (routeId: string, routeName: string) => Promise<void>;
}

export const useSavedRoutes = ({
	onMessage,
	refreshTrigger,
}: UseSavedRoutesOptions): UseSavedRoutesReturn => {
	const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchRoutes = async () => {
			setIsLoading(true);
			await handleAsyncOperation({
				operation: getAllRoutes,
				errorMessage: '経路一覧の取得に失敗しました',
				showMessage: onMessage,
				onSuccess: (routes) => {
					const sortedRoutes = [...routes].sort(
						(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
					);
					setSavedRoutes(sortedRoutes);
				},
			});
			setIsLoading(false);
		};

		fetchRoutes();
	}, [refreshTrigger, onMessage]);

	const handleDeleteRoute = useCallback(
		async (routeId: string, routeName: string) => {
			if (!window.confirm(`「${routeName}」を削除しますか？`)) {
				return;
			}

			await handleAsyncOperation({
				operation: () => deleteRoute(routeId),
				successMessage: '経路を削除しました',
				errorMessage: '削除に失敗しました',
				showMessage: onMessage,
				onSuccess: () => {
					setSavedRoutes((prev) => prev.filter((r) => r.id !== routeId));
				},
			});
		},
		[onMessage],
	);

	return {
		savedRoutes,
		isLoading,
		handleDeleteRoute,
	};
};
