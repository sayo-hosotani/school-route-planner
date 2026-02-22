# TODO リスト

## 作業方針
- **タスクは1つずつ進める**: 完了するごとにユーザーが確認してコミットするため、複数タスクを一気に進めない

## 1. nginxの開発時検証（要検討）
- [ ] 開発時もnginx経由でAPIにアクセスできるようにする

## 2. Valhalla APIサーバーのリクエスト元制限
- [ ] Valhalla APIへのリクエスト元を本アプリケーションに限定する

## 3. コードレビュー指摘（セキュリティ / ロジック / 可読性）
- [ ] [高][ロジック] ポイントID生成が `Date.now()` 依存のため、同ミリ秒の連続追加でID重複する可能性がある。`crypto.randomUUID()` へ置換する (`src/hooks/use-points.ts:30`)
  - 話し合い結果: `crypto.randomUUID()` に置換する（現代ブラウザで広くサポート済み）。
- [ ] [高][ロジック] 追加ポイントIDの返却が `lat/lng` 一致検索のため、同座標ポイントが既にあると誤ったIDを返しうる。`addPointBase` が新規IDを直接返す形に変更する (`src/contexts/PointContext.tsx:69`, `src/contexts/PointContext.tsx:71`)
  - 話し合い結果: 2段階で対応する。①UX改善：`MapClickHandler.tsx` に20px近傍チェックを追加し、近くに既存ポイントがあれば新規追加せず編集モーダルを開く。②技術修正：`use-points.ts:addPoint` の戻り値を `{ points: Point[], addedPoint: Point }` に変更してIDを確実に返す。
- [ ] [中][ロジック] インポート検証で `order` が「数値かどうか」のみ判定され、`NaN` / `Infinity` / 小数 / 重複が通る。並び順破綻を防ぐために整数・一意・連番の検証を追加する (`src/utils/validate-import.ts:47`)
  - 話し合い結果: 厳格モード（整数・非負・一意・連番まで検証）を採用する。
- [ ] [中][ロジック] インポート検証で `created_at` / `updated_at` のISO日時妥当性を確認しておらず、一覧ソート時に `Invalid Date` が混入し順序が不定になる。日時フォーマット検証を追加する (`src/utils/validate-import.ts:81`, `src/hooks/use-saved-routes.ts:32`)
  - 話し合い結果: `!isNaN(new Date(str).getTime())` で妥当性を確認する。
- [ ] [中][セキュリティ/可用性] `importRoutesFromJson` は `JSON.parse` を直接実行しており、UI外から巨大/異常JSONを渡された場合の防御が薄い。サイズ上限・エラー型統一（ユーザー向け文言）・入力スキーマの明示を追加する (`src/api/route-api.ts:110`, `src/api/route-api.ts:111`)
  - 話し合い結果: `try-catch` でパースエラーを捕捉し、エラー種別ごとに具体的な日本語メッセージを throw する（SyntaxError → 「JSONの形式が正しくありません」、配列でない → 「データが配列形式ではありません」等）。サイズチェックはUI側で実施済みのため関数内では追加しない。
- [ ] [低][可読性] 座標系が `[lat, lng]` と `[lng, lat]` の2系統で混在し、変換責務が複数箇所に散在している。型エイリアス（例: `LatLng`, `LngLat`）と変換ヘルパーを導入して意図を明確化する (`src/api/valhalla-client.ts:76`, `src/hooks/use-route-generation.ts:69`, `src/api/route-api.ts:14`)
  - 話し合い結果: `valhalla-client.ts:decodePolyline` 内で `[lat, lng]` への変換を完結させ、`use-route-generation.ts:69-71` の変換コードを削除する。TypeScriptの構造的型付けでは `LatLng`/`LngLat` を型レベルで区別できないため型エイリアスは導入せず、コメントを整備する。
- [ ] [低][可読性/保守性] `updatePoint` が `Partial<Point>` を受け取り、`id/order/type` まで更新可能な設計になっている。更新用途ごとに入力型を絞る（例: `PointPositionUpdate`, `PointMetaUpdate`）と不変条件が守りやすい (`src/hooks/use-points.ts:65`, `src/contexts/PointContext.tsx:86`)
  - 話し合い結果: `PointPositionUpdate`（`lat/lng`）・`PointMetaUpdate`（`comment`、`type` は任意）の専用型を定義し `Partial<Point>` から型を絞る。`type` の変更は `PointEditModal` 経由のみ許可される用途を明示する。

## 4. コードレビュー指摘（テスト網羅性 / 適切さ）
- [ ] [高][網羅性] `usePoints.addPoint` のID重複リスク（`Date.now()` 同値）を再現するテストがない。`Date.now` 固定モックで連続追加時のID一意性を検証する (`src/hooks/use-points.ts:30`, `src/hooks/use-points.test.ts:5`)
  - 話し合い結果: `crypto.randomUUID()` 化後のため、`Date.now` 固定モックから UUID 形式・一意性確認テストに変更する。
- [ ] [高][適切さ] `PointContext.addPoint` の返却IDが同座標ポイントで誤るケースの回帰テストがない。既存ポイントと同じ `lat/lng` を追加したときに新規IDを返すことを検証する (`src/contexts/PointContext.tsx:71`, `src/contexts/PointContext.test.tsx:47`)
  - 話し合い結果: `addPointBase` 戻り値変更後に、正確なID返却を検証するテストを追加する。
- [ ] [中][網羅性] インポート検証で `order` の異常値（`NaN`/`Infinity`/小数/重複）と時刻文字列の妥当性を検証するテストが不足している (`src/utils/validate-import.test.ts:211`, `src/utils/validate-import.test.ts:75`)
  - 話し合い結果: `NaN`/`Infinity`/小数/重複/非連番をすべてカバーするテストを追加する。
- [ ] [中][適切さ] `importRoutesFromJson` の異常系テストが `toThrow()` のみで、ユーザーに提示するエラーメッセージ品質を担保できていない。`invalid json` 時のメッセージ仕様を固定するテストを追加する (`src/api/route-api.test.ts:274`)
  - 話し合い結果: エラー種別ごとのメッセージ文言を固定するテストを追加する。
- [ ] [中][網羅性] `useSavedRoutes` の失敗パス（`getAllRoutes` 失敗、`deleteRoute` 失敗）でのメッセージ表示と `isLoading` 遷移を確認するテストがない (`src/hooks/use-saved-routes.ts:20`, `src/hooks/use-saved-routes.test.ts:21`)
  - 話し合い結果: 実施する。`getAllRoutes` 失敗・`deleteRoute` 失敗時のメッセージ表示と `isLoading` 遷移を検証する。
- [ ] [低][網羅性] `HamburgerMenu` / `WelcomeScreen` のJSONインポート導線がほぼ未テスト。`file size > 1MB`、`FileReader.onerror`、`importRoutesFromJson` 例外時の表示メッセージをUIテストでカバーする (`src/components/menu/HamburgerMenu.tsx:98`, `src/components/welcome/WelcomeScreen.tsx:42`, `src/components/menu/HamburgerMenu.test.tsx:91`, `src/components/welcome/WelcomeScreen.test.tsx:13`)
  - 話し合い結果: 実施する。`file size > 1MB`・`FileReader.onerror`・`importRoutesFromJson` 例外時のメッセージ表示テストを追加する。
- [ ] [低][適切さ] `useRouteGeneration` のAPI呼び出し順テストが弱く、Valhalla呼び出し時に `order` 未ソート配列でも正しく並び替えて `generateRoute` へ渡すことを直接検証していない (`src/hooks/use-route-generation.ts:60`, `src/hooks/use-route-generation.test.ts:53`)
  - 話し合い結果: 実施する。`order` 未ソート配列でも正しく並び替えて `generateRoute` へ渡すことを直接検証する。

## メモ
- CLAUDE.mdに設計が詳しく記載されている
- フロントエンド: http://localhost:5173
- Valhalla API: http://localhost:8002
- 開発時の起動: `npm run dev`
