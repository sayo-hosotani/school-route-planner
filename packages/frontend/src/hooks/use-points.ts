import { useState, useCallback } from 'react';
import type { Point } from '../types/point';

interface UsePointsReturn {
	points: Point[];
	setPoints: React.Dispatch<React.SetStateAction<Point[]>>;
	addPoint: (lat: number, lng: number) => Point[];
	updatePoint: (pointId: string, updates: Partial<Point>) => Point[];
	deletePoint: (pointId: string) => Point[];
	movePoint: (pointId: string, direction: 'up' | 'down') => Point[] | null;
	clearPoints: () => void;
	findPoint: (pointId: string) => Point | undefined;
	hasStartAndGoal: () => boolean;
	loadPoints: (newPoints: Point[]) => void;
}

// ポイント種別の自動判定
const determinePointType = (index: number, totalPoints: number): Point['type'] => {
	if (index === 0) return 'start';
	if (index === totalPoints - 1) return 'goal';
	return 'waypoint';
};

export const usePoints = (): UsePointsReturn => {
	const [points, setPoints] = useState<Point[]>([]);

	// ポイントを追加
	const addPoint = useCallback((lat: number, lng: number): Point[] => {
		// 現在のpointsを使って新しい配列を計算
		const prevPoints = points;
		const newPoint: Point = {
			id: `point-${Date.now()}`,
			lat,
			lng,
			type: 'waypoint',
			order: prevPoints.length,
			comment: '',
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		let newPoints: Point[];

		if (prevPoints.length === 0) {
			// 1番目: スタート
			newPoints = [{ ...newPoint, type: 'start', order: 0 }];
		} else if (prevPoints.length === 1) {
			// 2番目: ゴール
			newPoints = [...prevPoints, { ...newPoint, type: 'goal', order: 1 }];
		} else {
			// 3番目以降: 中継地点（ゴールの直前に挿入）
			const goalIndex = prevPoints.findIndex((p) => p.type === 'goal');
			if (goalIndex !== -1) {
				const updatedPoints = [...prevPoints];
				updatedPoints.splice(goalIndex, 0, { ...newPoint, type: 'waypoint', order: goalIndex });
				newPoints = updatedPoints.map((p, index) => ({ ...p, order: index }));
			} else {
				newPoints = [...prevPoints, { ...newPoint, type: 'waypoint', order: prevPoints.length }];
			}
		}

		setPoints(newPoints);
		return newPoints;
	}, [points]);

	// ポイントを更新
	const updatePoint = useCallback((pointId: string, updates: Partial<Point>): Point[] => {
		const updatedPoints = points.map((p) =>
			p.id === pointId ? { ...p, ...updates, updated_at: new Date().toISOString() } : p,
		);
		setPoints(updatedPoints);
		return updatedPoints;
	}, [points]);

	// ポイントを削除
	const deletePoint = useCallback((pointId: string): Point[] => {
		const filtered = points.filter((p) => p.id !== pointId);
		// ポイント削除後、種別を再計算
		const updatedPoints = filtered.map((p, index) => ({
			...p,
			type: determinePointType(index, filtered.length),
			order: index,
		}));
		setPoints(updatedPoints);
		return updatedPoints;
	}, [points]);

	// ポイントの順序を入れ替え
	const movePoint = useCallback((pointId: string, direction: 'up' | 'down'): Point[] | null => {
		const currentIndex = points.findIndex((p) => p.id === pointId);
		if (currentIndex === -1) return null;

		const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

		// 範囲外チェック
		if (newIndex < 0 || newIndex >= points.length) return null;

		// スタートとゴールは移動できない
		const currentPoint = points[currentIndex];
		const targetPoint = points[newIndex];
		if (currentPoint.type !== 'waypoint' || targetPoint.type !== 'waypoint') return null;

		// 入れ替え
		const newPoints = [...points];
		[newPoints[currentIndex], newPoints[newIndex]] = [newPoints[newIndex], newPoints[currentIndex]];

		// orderを再計算
		const result = newPoints.map((p, index) => ({ ...p, order: index }));
		setPoints(result);
		return result;
	}, [points]);

	// 全ポイントをクリア
	const clearPoints = useCallback(() => {
		setPoints([]);
	}, []);

	// ポイントを検索
	const findPoint = useCallback((pointId: string): Point | undefined => {
		return points.find((p) => p.id === pointId);
	}, [points]);

	// スタートとゴールの両方が存在するか
	const hasStartAndGoal = useCallback((): boolean => {
		const hasStart = points.some((p) => p.type === 'start');
		const hasGoal = points.some((p) => p.type === 'goal');
		return hasStart && hasGoal;
	}, [points]);

	// ポイントを読み込み
	const loadPoints = useCallback((newPoints: Point[]) => {
		setPoints(newPoints);
	}, []);

	return {
		points,
		setPoints,
		addPoint,
		updatePoint,
		deletePoint,
		movePoint,
		clearPoints,
		findPoint,
		hasStartAndGoal,
		loadPoints,
	};
};
