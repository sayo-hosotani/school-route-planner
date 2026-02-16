# セキュリティリスクと対策

対象プロジェクト: `school-route-planner`

## 1. 高: インポートJSONの検証不足
- 該当: `src/api/route-api.ts`, `src/components/welcome/WelcomeScreen.tsx`, `src/components/menu/HamburgerMenu.tsx`
- リスク:
  - 不正な構造・巨大データの取り込みで、アプリ不安定化やブラウザ負荷増大（DoS的影響）
  - 想定外データが保存され、以後の表示/処理が壊れる
- 対策:
  - JSON Schema で厳密バリデーション（必須項目、型、座標範囲（日本国内: 緯度 20.4253〜45.5572、経度 122.9325〜153.9867）、文字列長）
  - ファイルサイズ上限と件数上限（例: 1MB / 500件）
  - 検証失敗時は保存せず、理由をユーザーに表示

## 2. 高: ルート情報を平文で localStorage 保存
- 該当: `src/api/route-api.ts`
- リスク:
  - 共有端末やブラウザ乗っ取り時に保存済み通学路情報が容易に取得される
  - XSS成立時にデータ流出しやすい
- 対策:
  - 機微情報を保存しない運用方針を明示
  - 必要なら Web Crypto による暗号化保存（鍵はユーザー入力）
  - 保存期限（自動削除）や手動一括削除を提供

## 3. 中: APIゲートウェイの濫用対策不足
- 該当: `docker/gateway/default.conf`
- リスク:
  - レート制限なしで大量リクエストを受け、API停止・コスト増につながる
- 対策:
  - `limit_req` / `limit_conn` によるレート制限
  - `client_max_body_size` 制限
  - アクセスログ監視、異常アクセス遮断（WAF相当）

## 4. 中: Docker build時のHTTPダウンロード
- 該当: `docker/valhalla/Dockerfile`
- リスク:
  - 中間者攻撃で改ざんデータを取得する可能性
- 対策:
  - OSMデータ取得URLを HTTPS 化
  - チェックサム検証を追加
  - ベースイメージを digest pin（`@sha256:...`）で固定

## 5. 中: target="_blank" に rel 属性なし
- 該当: `src/App.tsx`
- リスク:
  - 逆タブナビング（`window.opener`）悪用の余地
- 対策:
  - 外部リンクへ `rel="noopener noreferrer"` を付与

## 6. 低: innerHTML の利用
- 該当: `src/components/map/CoordinateDisplay.tsx`
- リスク:
  - 現状は数値表示のみで実害は小さいが、将来変更でXSS起点化しやすい
- 対策:
  - `innerHTML` を `textContent` に置換

## 7. 低: セキュリティヘッダ不足（CSP等）
- 該当: `index.html`, `docker/gateway/default.conf`
- リスク:
  - XSSやMIME混同などの防御層が弱い
- 対策:
  - `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` を設定
  - 配信経路（GitHub Pages/プロキシ）で適用可能な形を選定

## 優先実施順
1. JSONインポートの厳格バリデーション + サイズ/件数制限
2. APIゲートウェイのレート制限
3. localStorageデータ保護方針（最小保存または暗号化）
4. HTTP取得のHTTPS化とチェックサム検証
5. `rel="noopener noreferrer"` 付与
6. `innerHTML` 排除
7. CSP等セキュリティヘッダ整備
