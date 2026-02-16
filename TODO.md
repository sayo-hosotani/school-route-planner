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

## 5. セキュリティ対策（`security.md` に基づく）

### Phase 1: 高優先度

- [x] **localStorage 廃止**（security.md #2）
  - [x] `src/api/route-api.ts`: `getStoredRoutes()` / `setStoredRoutes()` を削除
  - [x] `src/api/route-api.ts`: `saveRoute()` をメモリ上のみに保持するよう変更
  - [x] `src/api/route-api.ts`: `getAllRoutes()` / `loadRoute()` / `loadRouteById()` / `deleteRoute()` をメモリベースに変更
  - [x] `src/api/route-api.ts`: localStorage を参照している箇所をすべて除去（`exportRoutesToJson()` / `importRoutesFromJson()` は維持）
  - [x] `src/App.tsx`: 初回表示で常にウェルカム画面を表示するよう変更（メモリベースのため初期状態は常に空）
  - [x] `src/api/route-api.test.ts`: localStorage モックを除去し、メモリベースのテストに書き換え

- [x] **JSONインポートの厳格バリデーション**（security.md #1）
  - [x] `src/utils/validate-import.ts`（新規作成）
    - ファイルサイズ上限: 1MB
    - 件数上限: 100件
    - 各ルートの必須フィールド検証: `id`, `name`, `routeLine`, `points`, `created_at`, `updated_at`
    - 座標範囲検証: 緯度 20.4253〜45.5572（日本国内）、経度 122.9325〜153.9867（日本国内）
    - `comment` の文字列長上限: 500文字
    - `name` の文字列長上限: 100文字
    - `type` の値検証: `'start' | 'waypoint' | 'goal'`
    - 検証エラー時は具体的な理由を返す
  - [x] `src/api/route-api.ts`: `importRoutesFromJson()` 内でバリデーション関数を呼び出す
  - [x] `src/components/welcome/WelcomeScreen.tsx` / `src/components/menu/HamburgerMenu.tsx`: ファイル選択時にサイズチェック（1MB超はエラー表示）、バリデーションエラーの詳細をユーザーに表示
  - [x] `src/utils/validate-import.test.ts`（新規作成）: 正常系・異常系のバリデーションテスト

### Phase 2: 中優先度

- [ ] **APIゲートウェイのレート制限**（security.md #3）
  - [ ] `docker/gateway/default.conf`: `limit_req_zone` / `limit_conn_zone` を追加（10req/s、burst=20）
  - [ ] `docker/gateway/default.conf`: `client_max_body_size 5M` を明示

- [ ] **Docker build の HTTPS 化**（security.md #4）
  - [ ] `docker/valhalla/Dockerfile`: `wget http://` → `wget https://` に変更
  - [ ] `docker/valhalla/Dockerfile`: md5チェックサムの検証を追加
  - [ ] `docker/valhalla/Dockerfile`: ベースイメージを digest pin で固定

- [ ] **`target="_blank"` に `rel` 属性付与**（security.md #5）
  - [ ] `src/App.tsx`: TileLayer の attribution 内リンクに `rel="noopener noreferrer"` を追加

### Phase 3: 低優先度

- [ ] **`innerHTML` 排除**（security.md #6）
  - [ ] `src/components/map/CoordinateDisplay.tsx`: `container.innerHTML = ...` → `container.textContent = ...` に変更

- [ ] **セキュリティヘッダ整備**（security.md #7）
  - [ ] `docker/gateway/default.conf`: `Content-Security-Policy` ヘッダ追加
  - [ ] `docker/gateway/default.conf`: `X-Content-Type-Options: nosniff` 追加
  - [ ] `docker/gateway/default.conf`: `Referrer-Policy: strict-origin-when-cross-origin` 追加
  - [ ] `docker/gateway/default.conf`: `X-Frame-Options: DENY` 追加
  - [ ] `index.html`: `<meta http-equiv="Content-Security-Policy">` を追加（GitHub Pages 用）

## メモ
- CLAUDE.mdに設計が詳しく記載されている
- フロントエンド: http://localhost:5173
- Valhalla API: http://localhost:8002
- 開発時の起動: `npm run dev`
