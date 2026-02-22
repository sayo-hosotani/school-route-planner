# TODO リスト

## 作業方針
- **タスクは1つずつ進める**: 完了するごとにユーザーが確認してコミットするため、複数タスクを一気に進めない

## 1. nginxの開発時検証（要検討）
- [ ] 開発時もnginx経由でAPIにアクセスできるようにする

## 2. Valhalla APIサーバーのリクエスト元制限
- [ ] Valhalla APIへのリクエスト元を本アプリケーションに限定する

## メモ
- CLAUDE.mdに設計が詳しく記載されている
- フロントエンド: http://localhost:5173
- Valhalla API: http://localhost:8002
- 開発時の起動: `npm run dev`
