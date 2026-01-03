# 完了済みタスク

## プロジェクト基盤
- ✅ プロジェクト構成（モノレポ）
- ✅ フロントエンド: 地図表示、サンプル経路表示
- ✅ バックエンド: 経路保存・読み込みAPI（route.txt）
- ✅ フロントエンド: API連携、保存・読み込みボタン実装
- ✅ フロントエンド: 編集モード完全実装（モード切り替え、ポイント追加・編集・削除、ドラッグ移動、直線経路接続）

## 1. フロントエンド: API連携 ✅
- [x] APIクライアント作成（`packages/frontend/src/api/route-api.ts`）
  - POST /routes（経路保存）
  - GET /routes（経路読み込み）
- [x] 保存ボタンの実装
  - 現在の経路データをバックエンドに送信
- [x] 読み込みボタンの実装
  - 保存済み経路をバックエンドから取得して表示

## 2. フロントエンド: 編集モード実装 ✅
- [x] モード管理（useState）
  - 通常モード / 編集モード の切り替え
- [x] 左側パネル作成（`Sidebar.tsx`）
  - モード切り替えボタン
  - 保存/読み込みボタン（通常モード）
  - ポイント一覧表示（固定表示、ハイライト、連番付き）
  - 中継地点の並び替えボタン（↑↓ボタン、編集モード時のみ）
  - 通常モードでは空の追加欄を非表示
- [x] 地図クリックでポイント追加（`MapClickHandler.tsx`）
  - 編集モード時のみ有効
  - 新ルール: 1番目=スタート、2番目=ゴール、3番目以降=中継地点（ゴールの直前に挿入）
- [x] ポイント編集モーダル（`PointEditModal.tsx`）
  - コメント入力（複数行対応）
  - 種別変更（スタート、中継地点、ゴール）
  - 削除ボタン
  - 編集モードでポイントをクリックして開く
- [x] ポイントのドラッグ移動（`PointMarker.tsx`更新）
  - react-leafletのMarkerにdraggable属性を追加
  - ドラッグ終了時の処理
- [x] 経路の直線接続（`updateRouteLine`関数）
  - ポイント追加・移動・削除時に自動で経路を直線接続
- [x] メッセージ表示（`MessageDisplay.tsx`）
  - 画面中央上部に固定表示
  - サイドバーから独立してUIのずれを防止

## 2.5. フロントエンド: ポイント情報の拡張 ✅
- [x] コメントベースのタイトル表示機能
  - タイトルフィールドは不要（タイトル+コメントの二重入力は煩雑）
  - コメントの1行目または最初の16文字を自動的にタイトルとして表示
  - サイドバーのポイント一覧に表示
  - 通常モードのポップアップに表示
  - コメントが空の場合はデフォルトラベル（スタート、中継地点n、ゴール）を表示
- [x] コメント機能の改善
  - 複数行対応済み
  - プレースホルダーで使い方をガイド
- [x] サイドバーでのポイント操作機能
  - ポイントタイトルをクリックで地図の中心に移動＋ハイライト表示（3秒間）
  - ▼ボタンでコメント全文の表示・折りたたみ
  - 編集モード: サイドバー内でコメントをインライン編集（保存・キャンセルボタン）
  - 通常モード: コメント全文の読み取り専用表示

## 3. 経路生成機能 ✅
- [x] Valhalla Docker環境のセットアップ
  - Dockerfileを作成（`docker/valhalla/Dockerfile`）
  - docker-compose.ymlを更新（カスタムビルド設定）
  - 関東地方のOSMデータを使用
  - Valhalla APIが正常に動作（curl テスト成功）
- [x] バックエンド: Valhalla APIクライアント実装
  - `packages/backend/src/services/valhalla-service.ts` 作成
  - ポイント配列からValhalla APIリクエスト生成（/route エンドポイント）
  - Encoded polylineのデコード処理
  - レスポンス（GeoJSON）を処理
  - エラーハンドリング実装
- [x] バックエンド: 経路生成エンドポイント追加
  - `POST /routes/generate` エンドポイント作成
  - リクエストバリデーション（緯度・経度・ポイント数）
  - Valhalla Serviceの呼び出し
  - curl テストで正常に経路データを取得
- [x] フロントエンド: 自動経路生成API連携
  - `packages/frontend/src/api/route-api.ts`に`generateRoute()`関数追加
  - `App.tsx`で`updateRouteLine()`を非同期化
  - ポイント追加・移動・削除時に経路生成APIを呼び出し
  - GeoJSON座標を[lat, lng]形式に変換
  - エラー時のフォールバック処理（直線接続）
- [x] デバッグ: 経路表示の問題解決
  - 原因: Valhallaコンテナが起動していなかった
  - 解決: `docker-compose up -d valhalla` で起動
  - 経路生成が正常に動作することを確認

## 4. データベース対応 ✅
- [x] PostgreSQL環境構築
  - Docker Composeでの起動設定（既存）
  - 環境変数設定（.env, .env.example）
- [x] マイグレーション作成
  - usersテーブル
  - pointsテーブル（commentフィールド含む）
  - routesテーブル
  - UUID拡張機能有効化
  - トリガー関数（updated_at自動更新）
  - インデックス作成
  - 外部キー制約（ON DELETE CASCADE）
- [x] Kysely設定
  - データベース接続（`database/database.ts`）
  - 型定義（`database/types.ts`）
  - 接続テストスクリプト（`npm run db:test`）
- [x] Repository層実装
  - route-repository.ts（CRUD操作、認可フィルタ）
  - point-repository.ts（CRUD操作、一括作成、認可フィルタ）
- [x] Service層実装
  - route-service.ts（経路+ポイント一括作成、Valhalla連携）
  - point-service.ts（座標バリデーション）
- [x] ルート更新
  - routes.tsをDB保存に完全移行
  - 仮ユーザーID対応（認証実装まで）
  - 新エンドポイント追加（GET /routes/:id, DELETE /routes/:id）
- [x] シードデータ作成
  - 仮ユーザー作成スクリプト（`npm run seed`）
- [x] 動作確認
  - 経路生成API動作確認
  - 経路保存・読み込み動作確認
  - データベースに正しく保存されることを確認

## 5. 複数経路管理機能 ✅
- [x] フロントエンド: 経路名入力モーダル作成
  - `RouteNameModal.tsx`コンポーネント作成
  - 経路名入力フィールド（デフォルト値: `経路 YYYY/MM/DD HH:mm:ss`）
  - 保存・キャンセルボタン
  - App.tsxに統合
- [x] フロントエンド: 保存済み経路一覧表示
  - `Sidebar.tsx`を更新して経路一覧を表示
  - 経路一覧取得API呼び出し（`GET /routes`）
  - 経路名と作成日時を表示（`YYYY/MM/DD HH:mm`形式）
  - 経路クリックで読み込み機能
  - 削除ボタン（ゴミ箱アイコン、確認ダイアログ付き）
- [x] フロントエンド: APIクライアント更新
  - `route-api.ts`の`saveRoute()`を更新（経路名パラメータ追加）
  - `route-api.ts`に`getAllRoutes()`追加
  - `route-api.ts`に`deleteRoute(routeId)`追加
- [x] フロントエンド: 経路保存フローの変更
  - 保存ボタン押下で経路名入力モーダルを表示
  - モーダルで経路名確定後にAPI呼び出し
  - 保存成功後に経路一覧を再読み込み

## 5.1. コメント表示 ✅
- [x] 通常モードでコメント表示（ポイント上に吹き出しで）の追加
  - 通常モードではTooltipで常時表示
  - 編集モードでは非表示
  - タイトル（コメント1行目/16文字）と全コメントを表示

## UI/UX改善（部分完了）
- [x] サイドバーのコンポーネント分割
  - `PointItem.tsx`: ポイント項目のレンダリング（約270行）
  - `SavedRouteList.tsx`: 保存済み経路一覧（約130行）
  - `Sidebar.tsx`: 約600行 → 約225行に削減
- [x] アプリケーションのアイコンの変更
  - Z字型の経路線（赤）+ スタート（緑）・中継地点（赤）・ゴール（青）のSVGアイコン作成
  - favicon.svgをpublicフォルダに配置、index.htmlにリンク追加

## 実装済みコンポーネント一覧
- `App.tsx`: メインアプリケーション（モード管理、ポイント操作ロジック、並び替え機能、地図移動・ハイライト）
- `Sidebar.tsx`: モード切り替えと機能ボタン、ポイント一覧表示（並び替え、クリックで地図移動、▼ボタンでコメント展開・編集）
- `PointItem.tsx`: ポイント項目のレンダリング
- `SavedRouteList.tsx`: 保存済み経路一覧
- `PointEditModal.tsx`: ポイント編集モーダル（種別・コメント編集）
- `RouteNameModal.tsx`: 経路名入力モーダル
- `MapClickHandler.tsx`: 地図クリックイベント処理（編集モード時のみ有効）
- `PointMarker.tsx`: 地図上のポイントマーカー（ドラッグ・クリック対応）
- `RouteLine.tsx`: 経路ライン表示
- `CoordinateDisplay.tsx`: 座標・ズーム表示
- `FitBounds.tsx`: 経路全体を画面に収める
- `MapCenter.tsx`: 地図の中心を変更（ポイントクリック時の地図移動）
- `MessageDisplay.tsx`: 画面中央上部のメッセージ表示
- `route-api.ts`: 経路保存・読み込みAPI呼び出し
