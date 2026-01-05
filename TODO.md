# TODO リスト

> 完了済みタスクは [DONE.md](./DONE.md) を参照

## 作業方針
- **タスクは1つずつ進める**: 完了するごとにユーザーが確認してコミットするため、複数タスクを一気に進めない

## 1. コードリファクタリング（優先度: 中）

### 1.1. App.tsx の改善 ✅
App.tsxを415行→227行に削減済み。Context API導入済み。エラーハンドリング統一済み。

### 1.2. 全体的なコード改善
- [x] 型定義の整理
  - ハンドラ関数の型を`types/handlers.ts`に集約済み
  - 共通型（AppMode, MessageType）を`types/common.ts`に集約済み
- [x] ユーティリティ関数の整理
  - ポイント関連のヘルパー関数を`utils/point-utils.ts`に集約済み
  - 日時フォーマット関数（未着手）
- [x] APIエラーハンドリングの共通化
  - `api/errors.ts`にカスタム`ApiError`クラスを導入
  - `api/client.ts`に共通fetchラッパー関数を作成（get, post, del）
  - `route-api.ts`を共通関数を使うようにリファクタリング
  - `error-handler.ts`で`ApiError`からユーザー向けメッセージを取得するように改善
- [ ] スタイル設定方法の見直し
- [x] created_at/updated_atをトリガーに統一済み（001_initial_schema.sqlに統合）
- [x] databaseフォルダ整理済み（scripts/, migrations/ を src外に分離）
- [x] models/route.tsの構成確認済み（関連する型定義のため現状維持）
- [x] ルーティング登録と処理の分離
  - `routes/routes.ts` → `routes/index.ts`（エントリーポイント登録のみ）
  - `controllers/route-controller.ts`を新規作成（ハンドラーロジック）
- [x] point-service.tsを削除（未使用だったため）

## 2. UI/UX改善（優先度: 低）

### 2.1. スタイリング
- [ ] 左側パネルのデザイン
- [ ] ボタンのスタイル統一
- [ ] レスポンシブ対応

### 2.2. エラーハンドリング・ローディング
- [ ] API呼び出しエラー時の表示
- [ ] バリデーションエラーの表示
- [ ] 経路生成中のインジケーター
- [ ] データ読み込み中のスケルトン表示

### 2.3. 新機能
- [ ] 地図画像ダウンロード機能
  - 表示中の経路をPNG画像としてダウンロード
  - Scale以外のコントロール（Zoom、Coordinate、Attribution等）を非表示にして画像化
  - leaflet-imageやhtml2canvasなどのライブラリを検討
- [ ] 経路上にポイントをフィットさせるボタンの追加

### 2.4. サイドバーの改善（継続）
- [ ] 通常モードと編集モードでコンポーネントを別にすべきか検討
- [ ] コメント表示/編集周りのUIの改善検討
- [ ] スタイルの分離
  - 全コンポーネントでインラインスタイルが多用されている
  - CSS Modulesまたはスタイルファイルに分離
  - 重複するボタンスタイルを共通コンポーネント化
- [ ] propsの整理
  - `SidebarProps`が13個以上のpropsを持ち複雑
  - 関連するpropsをオブジェクトにグループ化（例: pointHandlers, routeHandlers）
- [ ] カスタムフックの抽出
  - `SavedRouteList`: フェッチ・削除ロジックを`useSavedRoutes`フックに
  - `PointItem`: コメント編集ロジックを`useCommentEditor`フックに
- [x] ユーティリティ関数の分離
  - `getPointTypeLabel`、`getDisplayTitle`を`utils/point-utils.ts`に移動済み
- [x] 定数の共通化
  - カラーコード（#007bff, #28a745, #dc3545等）を`constants/colors.ts`に集約済み
- [x] アクセシビリティ改善
  - ボタンにaria-label属性を追加済み
  - キーボードナビゲーション対応（Tab、Enter、Escape）（未着手）
- [ ] パフォーマンス最適化
  - `PointItem`のReact.memo化（現在はあまり有効ではないので実施しない）
  - 不要な再レンダリングの防止（未着手）

## 3. 認証機能（優先度: 低）
- [ ] ユーザー登録・ログイン画面
- [ ] JWT認証実装
  - @fastify/jwtプラグイン導入
  - ログイン/登録エンドポイント
- [ ] フロントエンド: 認証状態管理
  - トークンの保存（localStorage）
  - APIリクエストにトークン付与
- [ ] 認証が必要なエンドポイントに認証チェック追加

## 4. テスト（優先度: 低）
- [ ] バックエンドのテスト
  - ルートのテスト
  - サービス層のテスト
- [ ] フロントエンドのテスト
  - コンポーネントのテスト

## 5. 本番環境準備（優先度: 低）
- [ ] 本番ビルドスクリプト作成
  - フロントエンドビルド → バックエンドpublicにコピー
- [ ] 静的ファイル配信設定
  - @fastify/staticプラグイン導入
  - publicディレクトリの配信設定
- [ ] 環境変数管理
  - .env.example作成
  - 本番用の環境変数設定
- [ ] デプロイ手順書作成

## メモ
- CLAUDE.mdに設計が詳しく記載されている
- バックエンドAPI: http://localhost:3000
- フロントエンド: http://localhost:5173
- 開発時の起動: `npm run dev:all`
