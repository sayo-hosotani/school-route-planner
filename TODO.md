# TODO リスト

## 作業方針
- **タスクは1つずつ進める**: 完了するごとにユーザーが確認してコミットするため、複数タスクを一気に進めない

## 1. nginxの開発時検証
- [x] 開発時もnginx経由でAPIにアクセスできるようにする
  - `docker/gateway/dev.conf` 作成（Docker内部でvalhalla:8002へプロキシ）
  - `docker-compose.yml` に `gateway` サービス追加（nginx:alpine、ポート8080）
  - valhallaのhostポート公開を削除（gatewayのみ公開）
  - `vite.config.ts` のプロキシターゲットを `http://localhost:${GATEWAY_PORT}` に変更
  - `docker-compose up` 後 `npm run dev` で nginx gateway 経由でAPIにアクセス可能

## 2. Valhalla APIサーバーのリクエスト元制限
- [x] Valhalla APIへのリクエスト元を本アプリケーションに限定する
  - `docker/valhalla/fly.toml` の `http_service` を削除（外部HTTPS公開を廃止）
  - `docker/gateway/default.conf` の `proxy_pass` を Fly.io 内部DNS（`*.internal:8002`）経由に変更
  - `resolver fdaa::3` を追加（Fly.io プライベートネットワークの内部DNSリゾルバ）
  - Valhalla は nginx gateway からの内部通信のみ受け付ける構成

## 3. コードレビュー指摘（セキュリティ / ロジック / 可読性）
- [x] [高][ロジック] ポイントID生成を `Date.now()` から `crypto.randomUUID()` へ置換 (`src/hooks/use-points.ts`)
- [x] [高][ロジック] `addPoint` の戻り値を `{ points, addedPoint }` に変更し、IDを確実に返す。`MapClickHandler.tsx` に20px近傍チェックを追加 (`src/hooks/use-points.ts`, `src/contexts/PointContext.tsx`, `src/components/map/MapClickHandler.tsx`)
- [x] [中][ロジック] `order` バリデーションを整数・非負・一意・連番まで強化 (`src/utils/validate-import.ts`)
- [x] [中][ロジック] `created_at`/`updated_at` のISO日時妥当性検証を追加（ルートとポイント両方）(`src/utils/validate-import.ts`)
- [x] [中][セキュリティ/可用性] `importRoutesFromJson` の JSON.parse を try-catch でラップし、エラー種別ごとに日本語メッセージを throw (`src/api/route-api.ts`)
- [x] [低][可読性] `decodePolyline` 内で `[lat, lng]` への変換を完結させ、`use-route-generation.ts` の変換コードを削除 (`src/api/valhalla-client.ts`, `src/hooks/use-route-generation.ts`)
- [x] [低][可読性/保守性] `PointPositionUpdate`・`PointMetaUpdate` 型を定義し `updatePoint` の入力型を絞る (`src/types/point.ts`, `src/hooks/use-points.ts`, `src/contexts/PointContext.tsx`)

## 4. コードレビュー指摘（テスト網羅性 / 適切さ）
- [x] [高][網羅性] UUID形式・一意性確認テストを追加 (`src/hooks/use-points.test.ts`)
- [x] [高][適切さ] 同座標ポイントでも正確な新規IDを返す回帰テストを追加 (`src/contexts/PointContext.test.tsx`)
- [x] [中][網羅性] `order` 異常値テスト（NaN/Infinity/小数/重複/非連番）・ポイントの日時妥当性テストを追加 (`src/utils/validate-import.test.ts`)
- [x] [中][適切さ] `importRoutesFromJson` のエラーメッセージ品質テスト（SyntaxError→日本語、配列以外→日本語）を追加 (`src/api/route-api.test.ts`)
- [x] [中][網羅性] `getAllRoutes`/`deleteRoute` 失敗時のメッセージ表示・isLoading遷移テストを追加 (`src/hooks/use-saved-routes.test.ts`)
- [x] [低][網羅性] `HamburgerMenu`/`WelcomeScreen` のJSONインポート導線テスト（1MB超・FileReader.onerror・例外時）を追加
- [x] [低][適切さ] `order` 未ソート配列でも `generateRoute` に order 情報が保持されて渡されることを検証 (`src/hooks/use-route-generation.test.ts`)

## メモ
- CLAUDE.mdに設計が詳しく記載されている
- フロントエンド: http://localhost:5173
- Valhalla API: http://localhost:8002
- 開発時の起動: `npm run dev`
