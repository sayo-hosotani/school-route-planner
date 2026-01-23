# TODO リスト

## 作業方針
- **タスクは1つずつ進める**: 完了するごとにユーザーが確認してコミットするため、複数タスクを一気に進めない

## 1. UI/UX改善（優先度: 低）

### 1.1. 新機能
- [ ] 地図画像ダウンロード機能
  - 表示中の経路をPNG画像としてダウンロード
  - Scale以外のコントロール（Zoom、Coordinate、Attribution等）を非表示にして画像化
  - leaflet-imageやhtml2canvasなどのライブラリを検討
- [ ] 経路上にポイントをフィットさせるボタンの追加

## 2. テスト（優先度: 低）
- [ ] フロントエンドのテスト
  - コンポーネントのテスト
  - Valhalla API連携のテスト

## 3. 本番環境準備（優先度: 低）
- [ ] 本番ビルドスクリプト作成
- [ ] 静的ファイル配信設定（GitHub Pages、Vercel等）
- [ ] 環境変数管理（Valhalla APIのURL等）

## メモ
- CLAUDE.mdに設計が詳しく記載されている
- フロントエンド: http://localhost:5173
- Valhalla API: http://localhost:8002
- 開発時の起動: `npm run dev
