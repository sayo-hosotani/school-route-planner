import type { Point } from './point';
import type { MessageType } from './common';

// ポイント操作ハンドラ型
export type PointClickHandler = (pointId: string) => void;
export type PointDragEndHandler = (pointId: string, lat: number, lng: number) => void;
export type PointMoveHandler = (pointId: string, direction: 'up' | 'down') => void;
export type CommentUpdateHandler = (pointId: string, comment: string) => void;
export type PointSaveHandler = (pointId: string, type: Point['type'], comment: string) => void;

// 経路操作ハンドラ型
export type RouteLoadHandler = (routeId: string) => Promise<void>;
export type RouteSaveHandler = (routeName: string) => Promise<void>;

// メッセージハンドラ型
export type MessageHandler = (message: string, type: MessageType) => void;

// グループ化されたポイントハンドラ
export interface PointHandlers {
	onEditPoint: PointClickHandler;
	onDeletePoint: PointClickHandler;
	onMovePoint: PointMoveHandler;
	onPointClick: PointClickHandler;
	onUpdateComment: CommentUpdateHandler;
}

// グループ化された経路ハンドラ
export interface RouteHandlers {
	onSave: () => void;
	onClearPoints: () => void;
	onLoadRoute: RouteLoadHandler;
}
