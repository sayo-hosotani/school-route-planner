# TODO リスト

## 作業方針
- **タスクは1つずつ進める**: 完了するごとにユーザーが確認してコミットするため、複数タスクを一気に進めない

## 1. アーキテクチャ変更（優先度: 高）

### 1.1. Valhalla API連携をフロントエンドに移行
- [ ] フロントエンドにValhalla APIクライアント作成
  - `api/valhalla-client.ts` を作成
  - Valhalla APIへの直接リクエスト
  - Encoded polylineのデコード処理
  - エラーハンドリング
- [ ] バックエンドのValhalla関連コードを削除
  - `services/valhalla-service.ts` 削除
  - `/routes/generate` エンドポイント削除

### 1.2. バックエンド・DB関連コードの削除
- [ ] バックエンドパッケージの削除
  - `packages/backend/` ディレクトリ削除
  - `package.json` のworkspace設定更新
- [ ] Docker Compose からPostgreSQL削除
  - `docker-compose.yml` 更新（Valhallaのみ残す）

### 1.3. フロントエンドの経路保存機能変更
- [ ] DB保存機能を削除
  - `api/route-api.ts` のDB関連API呼び出し削除
  - `SavedRouteList.tsx` 削除または改修
  - `useSavedRoutes` フック削除
- [ ] 代替案の検討（必要に応じて）
  - ローカルストレージへの保存
  - JSONファイルとしてエクスポート/インポート

## 2. UI/UX改善（優先度: 低）

### 2.1. 新機能
- [ ] 地図画像ダウンロード機能
  - 表示中の経路をPNG画像としてダウンロード
  - Scale以外のコントロール（Zoom、Coordinate、Attribution等）を非表示にして画像化
  - leaflet-imageやhtml2canvasなどのライブラリを検討
- [ ] 経路上にポイントをフィットさせるボタンの追加

## 3. テスト（優先度: 低）
- [ ] フロントエンドのテスト
  - コンポーネントのテスト
  - Valhalla API連携のテスト

## 4. 本番環境準備（優先度: 低）
- [ ] 本番ビルドスクリプト作成
- [ ] 静的ファイル配信設定（GitHub Pages、Vercel等）
- [ ] 環境変数管理（Valhalla APIのURL等）

## メモ
- CLAUDE.mdに設計が詳しく記載されている
- フロントエンド: http://localhost:5173
- Valhalla API: http://localhost:8002
- 開発時の起動: `npm run dev --workspace=@route-planner/frontend`
