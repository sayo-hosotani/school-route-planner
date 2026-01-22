import { useState, useCallback, useRef, useEffect } from 'react';
import type { Point } from '../types/point';
import { generateRoute } from '../api/route-api';

interface UseRouteGenerationOptions {
	onError?: (message: string) => void;
}

interface UseRouteGenerationReturn {
	routeLine: [number, number][];
	generateRouteFromPoints: (points: Point[]) => Promise<void>;
	setRouteLine: React.Dispatch<React.SetStateAction<[number, number][]>>;
	clearRoute: () => void;
}

export const useRouteGeneration = (
	options: UseRouteGenerationOptions = {},
): UseRouteGenerationReturn => {
	const { onError } = options;
	const [routeLine, setRouteLine] = useState<[number, number][]>([]);

	// onErrorの最新の参照を保持（useCallbackの依存配列から除外するため）
	const onErrorRef = useRef(onError);
	useEffect(() => {
		onErrorRef.current = onError;
	}, [onError]);

	// ポイントを直線で接続して経路ラインを更新（フォールバック用）
	const updateRouteLineStraight = useCallback((pointsList: Point[]) => {
		if (pointsList.length < 2) {
			setRouteLine([]);
			return;
		}

		// ポイントをorder順にソートして座標を抽出
		const sortedPoints = [...pointsList].sort((a, b) => a.order - b.order);
		const newRouteLine: [number, number][] = sortedPoints.map((p) => [p.lat, p.lng]);
		setRouteLine(newRouteLine);
	}, []);

	// Valhalla APIで経路を生成
	const generateRouteFromPoints = useCallback(async (pointsList: Point[]) => {
		if (pointsList.length < 2) {
			setRouteLine([]);
			return;
		}

		// スタートとゴールが存在するかチェック
		const hasStart = pointsList.some((p) => p.type === 'start');
		const hasGoal = pointsList.some((p) => p.type === 'goal');

		if (!hasStart || !hasGoal) {
			// スタートまたはゴールがない場合は直線接続
			updateRouteLineStraight(pointsList);
			return;
		}

		try {
			// Valhalla APIで経路を生成
			const apiPoints = pointsList.map((p) => ({
				lat: p.lat,
				lng: p.lng,
				order: p.order,
			}));

			const result = await generateRoute(apiPoints);

			// GeoJSON形式の座標を[lat, lng]形式に変換
			const coordinates: [number, number][] = result.coordinates.map(
				([lng, lat]: [number, number]) => [lat, lng],
			);
			setRouteLine(coordinates);
		} catch {
			// エラー時は直線接続にフォールバックし、エラーを通知
			onErrorRef.current?.('経路の生成に失敗しました。直線で接続します。');
			updateRouteLineStraight(pointsList);
		}
	}, [updateRouteLineStraight]);

	const clearRoute = useCallback(() => {
		setRouteLine([]);
	}, []);

	return {
		routeLine,
		generateRouteFromPoints,
		setRouteLine,
		clearRoute,
	};
};
