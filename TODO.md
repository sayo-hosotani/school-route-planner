# TODO リスト

## 作業方針
- **タスクは1つずつ進める**: 完了するごとにユーザーが確認してコミットするため、複数タスクを一気に進めない

## 1. その他の新機能（未着手）
- [ ] 地図画像ダウンロード機能
  - 表示中の経路をPNG画像としてダウンロード
  - Scale以外のコントロール（Zoom、Coordinate、Attribution等）を非表示にして画像化
  - leaflet-imageやhtml2canvasなどのライブラリを検討

## 2. テスト（優先度: 低）
- [ ] フロントエンドのテスト
  - コンポーネントのテスト
  - Valhalla API連携のテスト
  - ジオコーディングAPI連携のテスト

## 3. nginxの開発時検証（要検討）
- [ ] 開発時もnginx経由でAPIにアクセスできるようにする

## 4. Valhalla APIサーバーのリクエスト元制限
- [ ] Valhalla APIへのリクエスト元を本アプリケーションに限定する

## メモ
- CLAUDE.mdに設計が詳しく記載されている
- フロントエンド: http://localhost:5173
- Valhalla API: http://localhost:8002
- 開発時の起動: `npm run dev`
