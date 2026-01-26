# TODO リスト

## 作業方針
- **タスクは1つずつ進める**: 完了するごとにユーザーが確認してコミットするため、複数タスクを一気に進めない

## ~~1. メニューの改善~~ (完了)
- [x] ハンバーガーメニューの実装
  - 現在のサイドバーを廃止
  - 画面左上にハンバーガーアイコンを配置
  - クリックでメニューを表示/非表示
- [x] メニュー項目の実装
  - 「通学路の新規作成」: 編集中ポイントをすべてクリア
  - 「通学路の保存」: 現在の経路をローカルストレージに保存
  - 「通学路の一覧」: 画面中央にモーダル表示（表示/編集/削除可能）
  - 「ポイントの一覧」: 画面左下にミニ画面（入れ替え・コメント編集・削除を統合）
  - 「エクスポート」: 保存済み経路をJSONでダウンロード
  - 「インポート」: JSONファイルから経路をインポート
- [x] 通学路一覧モーダルの実装
  - 保存済み経路を一覧表示
  - 「表示」ボタン: 経路を地図に表示
  - 「編集」ボタン: 経路を地図に読み込み編集可能に
  - 「削除」ボタン: 経路を削除
- [x] ポイント一覧ミニ画面の実装
  - 画面左下に表示
  - ポイントの順序入れ替え（矢印ボタン）
  - コメントの編集
  - ポイントの削除
- [x] 画面モードの廃止
  - 通常モード/編集モードの切り替えを削除
  - メニューは常に全項目表示
- [x] 既存サイドバーの削除
  - Sidebar.tsx関連ファイルを削除
  - ViewModeSection.tsx, EditModeSection.tsxを削除

## ~~2. 通学路一覧のUI改善~~ (完了)
- [x] 経路の行クリックで経路を表示する
  - 行全体をクリック可能なボタンに変更
  - クリックで `onViewRoute` を呼び出し
- [x] 表示ボタンを削除する
  - 行クリックで表示するため不要
- [x] 編集・削除ボタンをアイコンに変更する
  - ハンバーガーメニューと統一して絵文字を使用
  - 編集: ✏️、削除: 🗑️
- [x] 編集・削除ボタンを経路名と同じ行に右寄せで配置する
  - レイアウトを変更：経路名・アイコンを1行目、メタ情報を2行目に

## ~~3. ポイント一覧のUI改善~~ (完了)
- [x] 編集・削除ボタンをアイコンに変更する
  - 通学路一覧と統一して絵文字を使用
  - 編集: ✏️、削除: 🗑️
  - 移動ボタン（↑↓）は現状のまま
- [x] 編集・削除ボタンをポイント名と同じ行に右寄せで配置する
  - レイアウト変更：ポイント名・アイコンを1行に横並び

## ~~4. 編集モード/閲覧モードの統合~~ (完了)
- [x] コメント吹き出しを常に表示
  - PointMarker.tsx: `!editMode`条件を削除
- [x] ポイント一覧パネルを常に表示
  - PointListPanel.tsx: `isOpen`/`onClose`プロパティを削除
  - 閉じるボタンを削除
- [x] メニューから「ポイントの一覧」項目を削除
  - 常に表示されるため不要
- [x] ポイント追加は既に常時有効（変更不要）

## ~~5. ポイント編集画面に削除ボタンを追加~~ (完了)
- [x] PointEditModal.tsx に `onDelete` prop を追加
- [x] 削除ボタンのUIを追加（🗑️アイコン、キャンセルボタンの右側に配置）
- [x] App.tsx で `handleDeletePoint` を PointEditModal に渡す
- [x] 削除後はモーダルを閉じる

## ~~6. ポイント編集画面のレイアウト変更~~ (完了)
- [x] 画面右上に「×（閉じる）」ボタンを表示
  - 閉じるボタンを右上に固定配置
  - キャンセルボタンは削除（×ボタンに統合）
- [x] 画面上半分に「ポイントの削除」ボタンを移動
  - 削除ボタンを目立つ位置に配置
  - 赤色のdangerスタイルを維持
- [x] 下半分に「コメント編集」欄と「コメントの保存」ボタンを表示
  - コメント入力欄を下部に移動
  - 保存ボタンをコメント欄の下に配置

## ~~7. ポイント編集画面に入れ替えボタンを追加~~ (完了)
- [x] PointEditModal.tsx に入れ替えハンドラを追加
  - `onSwapPrevious` と `onSwapNext` の props を追加
  - 「▲前と入れ替える」「▼後ろと入れ替える」ボタンを追加
  - スタート/ゴールの場合はボタンを非表示（waypointのみ入れ替え可能）
- [x] PointEditModal.module.css にボタンのスタイルを追加
  - 入れ替えボタン用のセクションスタイル
- [x] App.tsx で入れ替えハンドラを PointEditModal に渡す
  - handleMovePoint を利用して onSwapPrevious/onSwapNext を実装

## ~~8. 住所からポイントを追加する機能~~ (完了)

### 概要
住所を入力して国土地理院APIでジオコーディングし、その座標でポイントを追加する。
コメントには入力された住所を設定する。

### 使用API
- **国土地理院ジオコーディングAPI**
- エンドポイント: `https://msearch.gsi.go.jp/address-search/AddressSearch`
- パラメータ: `q=住所文字列`
- レスポンス: `[{geometry: {coordinates: [経度, 緯度]}, properties: {title: "住所"}}]`

### 実装タスク

#### 8-1. APIクライアントの作成
- [x] `src/api/geocoding-client.ts` を作成
  - 住所から座標を取得する関数 `searchAddress(query: string)`
  - レスポンス型定義 `GeocodingResult`
  - エラーハンドリング（見つからない場合、ネットワークエラー等）

#### 8-2. 共通の住所検索コンポーネントの作成
- [x] `src/components/address/AddressSearchInput.tsx` を作成
  - 住所入力フィールド
  - 検索ボタン
  - 候補リスト表示（複数結果がある場合）
  - 選択時にコールバックで座標と住所を返す
- [x] `src/components/address/AddressSearchInput.module.css` を作成

#### 8-3. ポイント一覧上部への住所入力欄の追加
- [x] `PointListPanel.tsx` を修正
  - AddressSearchInput を上部に配置
  - 選択時に addPoint を呼び出し、コメントに住所を設定

#### 8-4. メニュー項目「住所からポイントを追加」の追加
- [x] `src/components/address/AddressSearchModal.tsx` を作成
  - 画面中央のミニ画面（モーダル）
  - AddressSearchInput を含む
  - 選択時にポイント追加してモーダルを閉じる
- [x] `src/components/address/AddressSearchModal.module.css` を作成
- [x] `HamburgerMenu.tsx` を修正
  - 「住所からポイントを追加」メニュー項目を追加
  - クリック時に AddressSearchModal を表示するコールバックを呼び出す

#### 8-5. App.tsx への統合
- [x] AddressSearchModal の状態管理を追加
- [x] HamburgerMenu に新しいプロパティを追加

### 新規作成ファイル
```
src/
├── api/
│   └── geocoding-client.ts
└── components/
    └── address/
        ├── AddressSearchInput.tsx
        ├── AddressSearchInput.module.css
        ├── AddressSearchModal.tsx
        └── AddressSearchModal.module.css
```

### 修正するファイル
- `src/components/point/PointListPanel.tsx`
- `src/components/menu/HamburgerMenu.tsx`
- `src/App.tsx`
- `src/hooks/use-points.ts` (addPointにコメント引数を追加)
- `src/contexts/PointContext.tsx` (addPointにコメント引数を追加)

---

## ~~9. ウェルカム画面の実装~~ (完了)

### 概要
ローカルストレージに保存済み経路がない場合に表示する、専用のウェルカム画面を実装する。

### 画面仕様

#### 表示条件
- ページ初回表示時にローカルストレージをチェック
- 保存済み経路が0件の場合のみ表示

#### UI仕様
- 画面中央にカード形式で表示
- 背景に地図が見える状態でオーバーレイ表示

#### 表示内容
1. **タイトル**: 「通学路マップ」
2. **説明文**: 「地図上にスタート、ゴール、中継地点を指定してください。経路を自動生成して表示します。」
3. **住所入力欄**: 既存の`AddressSearchInput`コンポーネントを埋め込み
4. **インポートボタン**: JSONファイルからの経路インポート機能

#### 動作仕様
- ウェルカム画面外（地図部分）をクリックすると閉じる
- 住所からポイント追加後は自動で閉じる
- インポート完了後は自動で閉じる（経路一覧を表示）

### 実装タスク

#### 9-1. WelcomeScreen コンポーネント作成
- [x] `src/components/welcome/WelcomeScreen.tsx` を新規作成
- [x] `src/components/welcome/WelcomeScreen.module.css` を新規作成
- [x] 既存の`AddressSearchInput`を再利用
- [x] インポート機能は`HamburgerMenu`のロジックを参考に実装

#### 9-2. App.tsx の修正
- [x] ウェルカム画面の表示状態管理を追加
- [x] 保存済み経路チェック時にウェルカム画面の表示を制御
- [x] WelcomeScreenコンポーネントを追加

### 新規作成ファイル
```
src/components/welcome/
├── WelcomeScreen.tsx       # メインコンポーネント
└── WelcomeScreen.module.css # スタイル
```

### 技術的注意点
- 既存の`AddressSearchInput`コンポーネントを再利用する
- インポート処理は`HamburgerMenu`の実装を参考にする
- 共通のモーダルスタイル（`modal.module.css`）を活用する

---

## 10. その他の新機能（未着手）
- [ ] 地図画像ダウンロード機能
  - 表示中の経路をPNG画像としてダウンロード
  - Scale以外のコントロール（Zoom、Coordinate、Attribution等）を非表示にして画像化
  - leaflet-imageやhtml2canvasなどのライブラリを検討
- [ ] 経路上にポイントをフィットさせるボタンの追加

## 11. テスト（優先度: 低）
- [ ] フロントエンドのテスト
  - コンポーネントのテスト
  - Valhalla API連携のテスト

## 12. 本番環境準備（優先度: 低）
- [ ] 本番ビルドスクリプト作成
- [ ] 静的ファイル配信設定（GitHub Pages、Vercel等）
- [ ] 環境変数管理（Valhalla APIのURL等）

## メモ
- CLAUDE.mdに設計が詳しく記載されている
- フロントエンド: http://localhost:5173
- Valhalla API: http://localhost:8002
- 開発時の起動: `npm run dev
