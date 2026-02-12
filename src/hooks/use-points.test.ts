import { renderHook, act } from '@testing-library/react';
import { usePoints } from './use-points';

describe('usePoints', () => {
	describe('addPoint', () => {
		it('1つ目のポイントはstartタイプになる', () => {
			const { result } = renderHook(() => usePoints());
			act(() => {
				result.current.addPoint(35.6762, 139.6503);
			});
			expect(result.current.points).toHaveLength(1);
			expect(result.current.points[0].type).toBe('start');
		});

		it('2つ目のポイントはgoalタイプになる', () => {
			const { result } = renderHook(() => usePoints());
			act(() => {
				result.current.addPoint(35.6762, 139.6503);
			});
			act(() => {
				result.current.addPoint(35.68, 139.655);
			});
			expect(result.current.points).toHaveLength(2);
			expect(result.current.points[1].type).toBe('goal');
		});

		it('3つ目以降はゴールの前にwaypointとして挿入される', () => {
			const { result } = renderHook(() => usePoints());
			act(() => {
				result.current.addPoint(35.6762, 139.6503);
			});
			act(() => {
				result.current.addPoint(35.68, 139.655);
			});
			act(() => {
				result.current.addPoint(35.677, 139.652);
			});

			expect(result.current.points).toHaveLength(3);
			expect(result.current.points[0].type).toBe('start');
			expect(result.current.points[1].type).toBe('waypoint');
			expect(result.current.points[2].type).toBe('goal');
		});

		it('orderが0から連番で設定される', () => {
			const { result } = renderHook(() => usePoints());
			act(() => {
				result.current.addPoint(35.6762, 139.6503);
			});
			act(() => {
				result.current.addPoint(35.68, 139.655);
			});
			act(() => {
				result.current.addPoint(35.677, 139.652);
			});

			expect(result.current.points[0].order).toBe(0);
			expect(result.current.points[1].order).toBe(1);
			expect(result.current.points[2].order).toBe(2);
		});

		it('追加されたポイントの配列を返す', () => {
			const { result } = renderHook(() => usePoints());
			let returned: ReturnType<typeof result.current.addPoint>;
			act(() => {
				returned = result.current.addPoint(35.6762, 139.6503);
			});
			expect(returned!).toHaveLength(1);
			expect(returned![0].lat).toBe(35.6762);
		});

		it('デフォルトでコメントが空文字になる', () => {
			const { result } = renderHook(() => usePoints());
			act(() => {
				result.current.addPoint(35.6762, 139.6503);
			});
			expect(result.current.points[0].comment).toBe('');
		});

		it('コメントを指定できる', () => {
			const { result } = renderHook(() => usePoints());
			act(() => {
				result.current.addPoint(35.6762, 139.6503, '自宅前');
			});
			expect(result.current.points[0].comment).toBe('自宅前');
		});
	});

	describe('updatePoint', () => {
		it('指定IDのポイントを更新する', () => {
			const { result } = renderHook(() => usePoints());
			act(() => {
				result.current.addPoint(35.6762, 139.6503);
			});
			const pointId = result.current.points[0].id;

			act(() => {
				result.current.updatePoint(pointId, { comment: '更新済み' });
			});
			expect(result.current.points[0].comment).toBe('更新済み');
		});

		it('updated_atが設定される', () => {
			const { result } = renderHook(() => usePoints());
			act(() => {
				result.current.loadPoints([
					{ id: 'p1', lat: 35.6762, lng: 139.6503, type: 'start', order: 0, comment: '', created_at: '2020-01-01T00:00:00.000Z', updated_at: '2020-01-01T00:00:00.000Z' },
				]);
			});

			act(() => {
				result.current.updatePoint('p1', { comment: '更新' });
			});
			expect(result.current.points[0].updated_at).not.toBe('2020-01-01T00:00:00.000Z');
		});

		it('存在しないIDの場合、変更なしの配列を返す', () => {
			const { result } = renderHook(() => usePoints());
			act(() => {
				result.current.addPoint(35.6762, 139.6503);
			});

			let returned: ReturnType<typeof result.current.updatePoint>;
			act(() => {
				returned = result.current.updatePoint('nonexistent', { comment: '更新' });
			});
			expect(returned!).toHaveLength(1);
			expect(returned![0].comment).toBe('');
		});
	});

	describe('deletePoint', () => {
		const loadTwoPoints = (result: { current: ReturnType<typeof usePoints> }) => {
			act(() => {
				result.current.loadPoints([
					{ id: 'p1', lat: 35.6762, lng: 139.6503, type: 'start', order: 0, comment: '', created_at: '', updated_at: '' },
					{ id: 'p2', lat: 35.68, lng: 139.655, type: 'goal', order: 1, comment: '', created_at: '', updated_at: '' },
				]);
			});
		};

		const loadThreePoints = (result: { current: ReturnType<typeof usePoints> }) => {
			act(() => {
				result.current.loadPoints([
					{ id: 'p1', lat: 35.6762, lng: 139.6503, type: 'start', order: 0, comment: '', created_at: '', updated_at: '' },
					{ id: 'p2', lat: 35.677, lng: 139.652, type: 'waypoint', order: 1, comment: '', created_at: '', updated_at: '' },
					{ id: 'p3', lat: 35.68, lng: 139.655, type: 'goal', order: 2, comment: '', created_at: '', updated_at: '' },
				]);
			});
		};

		it('指定IDのポイントを削除する', () => {
			const { result } = renderHook(() => usePoints());
			loadTwoPoints(result);

			act(() => {
				result.current.deletePoint('p1');
			});
			expect(result.current.points).toHaveLength(1);
		});

		it('削除後にポイント種別が再計算される', () => {
			const { result } = renderHook(() => usePoints());
			loadThreePoints(result);

			act(() => {
				result.current.deletePoint('p2');
			});

			expect(result.current.points).toHaveLength(2);
			expect(result.current.points[0].type).toBe('start');
			expect(result.current.points[1].type).toBe('goal');
		});

		it('削除後にorderが再計算される', () => {
			const { result } = renderHook(() => usePoints());
			loadThreePoints(result);

			act(() => {
				result.current.deletePoint('p1');
			});

			expect(result.current.points[0].order).toBe(0);
			expect(result.current.points[1].order).toBe(1);
		});

		it('スタートを削除すると最初のポイントがスタートになる', () => {
			const { result } = renderHook(() => usePoints());
			loadThreePoints(result);

			act(() => {
				result.current.deletePoint('p1');
			});

			expect(result.current.points[0].type).toBe('start');
		});

		it('ゴールを削除すると最後のポイントがゴールになる', () => {
			const { result } = renderHook(() => usePoints());
			loadThreePoints(result);

			act(() => {
				result.current.deletePoint('p3');
			});

			expect(result.current.points[result.current.points.length - 1].type).toBe('goal');
		});
	});

	describe('movePoint', () => {
		const fourPoints = [
			{ id: 's1', lat: 35.6762, lng: 139.6503, type: 'start' as const, order: 0, comment: '', created_at: '', updated_at: '' },
			{ id: 'w1', lat: 35.677, lng: 139.652, type: 'waypoint' as const, order: 1, comment: '', created_at: '', updated_at: '' },
			{ id: 'w2', lat: 35.678, lng: 139.653, type: 'waypoint' as const, order: 2, comment: '', created_at: '', updated_at: '' },
			{ id: 'g1', lat: 35.68, lng: 139.655, type: 'goal' as const, order: 3, comment: '', created_at: '', updated_at: '' },
		];

		const setupFourPoints = () => {
			const { result } = renderHook(() => usePoints());
			act(() => {
				result.current.loadPoints(fourPoints);
			});
			return result;
		};

		it('中継地点を上に移動できる', () => {
			const result = setupFourPoints();

			let moved: ReturnType<typeof result.current.movePoint>;
			act(() => {
				moved = result.current.movePoint('w2', 'up');
			});

			expect(moved).not.toBeNull();
			expect(result.current.points[1].id).toBe('w2');
			expect(result.current.points[2].id).toBe('w1');
		});

		it('中継地点を下に移動できる', () => {
			const result = setupFourPoints();

			let moved: ReturnType<typeof result.current.movePoint>;
			act(() => {
				moved = result.current.movePoint('w1', 'down');
			});

			expect(moved).not.toBeNull();
			expect(result.current.points[1].id).toBe('w2');
			expect(result.current.points[2].id).toBe('w1');
		});

		it('スタートは移動できずnullを返す', () => {
			const result = setupFourPoints();

			let moved: ReturnType<typeof result.current.movePoint>;
			act(() => {
				moved = result.current.movePoint('s1', 'down');
			});

			expect(moved).toBeNull();
		});

		it('ゴールは移動できずnullを返す', () => {
			const result = setupFourPoints();

			let moved: ReturnType<typeof result.current.movePoint>;
			act(() => {
				moved = result.current.movePoint('g1', 'up');
			});

			expect(moved).toBeNull();
		});

		it('移動後にorderが再計算される', () => {
			const result = setupFourPoints();

			act(() => {
				result.current.movePoint('w2', 'up');
			});

			for (let i = 0; i < result.current.points.length; i++) {
				expect(result.current.points[i].order).toBe(i);
			}
		});

		it('存在しないIDの場合、nullを返す', () => {
			const result = setupFourPoints();

			let moved: ReturnType<typeof result.current.movePoint>;
			act(() => {
				moved = result.current.movePoint('nonexistent', 'up');
			});

			expect(moved).toBeNull();
		});
	});

	describe('clearPoints', () => {
		it('全ポイントをクリアする', () => {
			const { result } = renderHook(() => usePoints());
			act(() => {
				result.current.addPoint(35.6762, 139.6503);
			});
			act(() => {
				result.current.addPoint(35.68, 139.655);
			});

			act(() => {
				result.current.clearPoints();
			});
			expect(result.current.points).toHaveLength(0);
		});
	});

	describe('findPoint', () => {
		it('指定IDのポイントを返す', () => {
			const { result } = renderHook(() => usePoints());
			act(() => {
				result.current.addPoint(35.6762, 139.6503);
			});
			const pointId = result.current.points[0].id;

			expect(result.current.findPoint(pointId)).toBeDefined();
			expect(result.current.findPoint(pointId)?.lat).toBe(35.6762);
		});

		it('存在しないIDの場合、undefinedを返す', () => {
			const { result } = renderHook(() => usePoints());
			expect(result.current.findPoint('nonexistent')).toBeUndefined();
		});
	});

	describe('hasStartAndGoal', () => {
		it('スタートとゴールの両方がある場合、trueを返す', () => {
			const { result } = renderHook(() => usePoints());
			act(() => {
				result.current.addPoint(35.6762, 139.6503);
			});
			act(() => {
				result.current.addPoint(35.68, 139.655);
			});

			expect(result.current.hasStartAndGoal()).toBe(true);
		});

		it('スタートのみの場合、falseを返す', () => {
			const { result } = renderHook(() => usePoints());
			act(() => {
				result.current.addPoint(35.6762, 139.6503);
			});

			expect(result.current.hasStartAndGoal()).toBe(false);
		});

		it('ポイントがない場合、falseを返す', () => {
			const { result } = renderHook(() => usePoints());
			expect(result.current.hasStartAndGoal()).toBe(false);
		});
	});

	describe('loadPoints', () => {
		it('ポイントを一括読み込みする', () => {
			const { result } = renderHook(() => usePoints());
			const points = [
				{ id: 'p1', lat: 35.6762, lng: 139.6503, type: 'start' as const, order: 0, comment: '', created_at: '', updated_at: '' },
				{ id: 'p2', lat: 35.68, lng: 139.655, type: 'goal' as const, order: 1, comment: '', created_at: '', updated_at: '' },
			];

			act(() => {
				result.current.loadPoints(points);
			});

			expect(result.current.points).toHaveLength(2);
			expect(result.current.points[0].id).toBe('p1');
		});
	});
});
