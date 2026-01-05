import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { usePoints } from '../hooks/use-points';
import { useRouteGeneration } from '../hooks/use-route-generation';
import type { Point } from '../types/point';

interface PointContextValue {
	// ポイント状態
	points: Point[];
	// 経路状態
	routeLine: [number, number][];
	// ポイント操作（経路も自動更新）
	addPoint: (lat: number, lng: number) => Promise<void>;
	updatePoint: (pointId: string, updates: Partial<Point>) => Promise<void>;
	deletePoint: (pointId: string) => Promise<void>;
	movePoint: (pointId: string, direction: 'up' | 'down') => Promise<boolean>;
	clearPoints: () => void;
	// ポイント検索
	findPoint: (pointId: string) => Point | undefined;
	hasStartAndGoal: () => boolean;
	// 経路読み込み
	loadRoute: (points: Point[], routeLine: [number, number][]) => void;
}

const PointContext = createContext<PointContextValue | null>(null);

export const usePointContext = (): PointContextValue => {
	const context = useContext(PointContext);
	if (!context) {
		throw new Error('usePointContext must be used within a PointProvider');
	}
	return context;
};

interface PointProviderProps {
	children: ReactNode;
}

export const PointProvider = ({ children }: PointProviderProps) => {
	const {
		points,
		addPoint: addPointBase,
		updatePoint: updatePointBase,
		deletePoint: deletePointBase,
		movePoint: movePointBase,
		clearPoints: clearPointsBase,
		findPoint,
		hasStartAndGoal,
		loadPoints,
	} = usePoints();

	const { routeLine, generateRouteFromPoints, setRouteLine, clearRoute } = useRouteGeneration();

	// ポイント追加（経路も自動更新）
	const addPoint = useCallback(
		async (lat: number, lng: number) => {
			const newPoints = addPointBase(lat, lng);
			await generateRouteFromPoints(newPoints);
		},
		[addPointBase, generateRouteFromPoints],
	);

	// ポイント更新（経路も自動更新）
	const updatePoint = useCallback(
		async (pointId: string, updates: Partial<Point>) => {
			const updatedPoints = updatePointBase(pointId, updates);
			// 座標が変更された場合のみ経路を再生成
			if ('lat' in updates || 'lng' in updates) {
				await generateRouteFromPoints(updatedPoints);
			}
		},
		[updatePointBase, generateRouteFromPoints],
	);

	// ポイント削除（経路も自動更新）
	const deletePoint = useCallback(
		async (pointId: string) => {
			const newPoints = deletePointBase(pointId);
			await generateRouteFromPoints(newPoints);
		},
		[deletePointBase, generateRouteFromPoints],
	);

	// ポイント移動（経路も自動更新）
	const movePoint = useCallback(
		async (pointId: string, direction: 'up' | 'down'): Promise<boolean> => {
			const newPoints = movePointBase(pointId, direction);
			if (newPoints) {
				await generateRouteFromPoints(newPoints);
				return true;
			}
			return false;
		},
		[movePointBase, generateRouteFromPoints],
	);

	// 全ポイントクリア
	const clearPoints = useCallback(() => {
		clearPointsBase();
		clearRoute();
	}, [clearPointsBase, clearRoute]);

	// 経路読み込み
	const loadRoute = useCallback(
		(newPoints: Point[], newRouteLine: [number, number][]) => {
			loadPoints(newPoints);
			setRouteLine(newRouteLine);
		},
		[loadPoints, setRouteLine],
	);

	const value: PointContextValue = {
		points,
		routeLine,
		addPoint,
		updatePoint,
		deletePoint,
		movePoint,
		clearPoints,
		findPoint,
		hasStartAndGoal,
		loadRoute,
	};

	return <PointContext.Provider value={value}>{children}</PointContext.Provider>;
};
