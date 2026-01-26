# 機能仕様

通学路マップの詳細な機能仕様です。

## 機能一覧

| 機能 | 説明 |
|------|------|
| 地図閲覧 | 移動・ズーム |
| ポイント表示 | コメントを吹き出し（Tooltip）で常時表示 |
| ポイント追加 | 地図クリックまたは住所検索で追加 |
| ポイント移動 | ドラッグで移動 |
| ポイント編集 | クリックでモーダル（コメント編集・順序入れ替え・削除） |
| 順序変更 | ポイント一覧パネルまたは編集モーダルで↑↓ボタン |
| 自動経路生成 | ポイント追加・移動時にValhalla API呼び出し |
| 経路保存 | ローカルストレージに保存 |
| エクスポート/インポート | JSONファイルで経路データをやり取り |

## ポイント種別の自動判定

ポイントは追加順に基づいて種別が自動判定される：

| 順番 | 種別 |
|------|------|
| 1番目 | スタート |
| 2番目 | ゴール |
| 3番目以降 | 中継地点（ゴールの直前に挿入） |

**追加の流れ:**
```
1. スタート追加 → [スタート]
2. ゴール追加   → [スタート, ゴール]
3. 中継地点追加 → [スタート, 中継地点1, ゴール]
4. さらに追加   → [スタート, 中継地点1, 中継地点2, ゴール]
```

このルールにより「スタートとゴールを最初に決めて、その後に経由地を追加する」という自然な操作が可能。

**手動変更**: ポイントをクリック→モーダルで種別変更可能。

## コメント機能

### 表示箇所
- ポイント一覧パネル
- 地図上の吹き出し（常時表示）

## UI配置

### ハンバーガーメニュー（左上）

画面左上のハンバーガーアイコンをクリックでメニュー表示。

| メニュー項目 | 説明 |
|-------------|------|
| 通学路の新規作成 | 編集中ポイントをすべてクリア |
| 通学路の保存 | 現在の経路をローカルストレージに保存 |
| 通学路の一覧 | 保存済み経路一覧をモーダル表示 |
| 住所からポイントを追加 | 住所検索モーダルを表示 |
| エクスポート | 保存済み経路をJSONでダウンロード |
| インポート | JSONファイルから経路をインポート |

### ポイント一覧パネル（左下）

画面左下に常時表示。ポイントの一覧と操作が可能。

```
┌─────────────────────────────────────┐
│ [住所検索入力欄]                    │
├─────────────────────────────────────┤
│ 1. 🟢 スタート           [✏️][🗑️]  │
│ 2. 🔴 中継地点1 [↑][↓]  [✏️][🗑️]  │
│ 3. 🔵 ゴール             [✏️][🗑️]  │
└─────────────────────────────────────┘
```

### 通学路一覧モーダル

保存済み経路を一覧表示。行クリックで経路を地図に表示。

- ✏️ボタン: 経路を編集用に読み込み
- 🗑️ボタン: 経路を削除

### ウェルカム画面

初回起動時（保存済み経路がない場合）に表示。
- アプリの説明
- 住所検索入力欄
- インポートボタン

### 地図コントロール

| 位置 | コントロール |
|------|-------------|
| 左下 | Attribution（出典表示） |
| 右上 | ZoomControl |
| 右下 | CoordinateDisplay + ScaleControl |

## 操作フロー

### 経路作成

1. 地図クリックまたは住所検索でポイント追加
   - 1番目→スタート、2番目→ゴール、3番目以降→中継地点
   - 追加時に自動で経路生成
2. ポイントクリックでモーダル編集（コメント編集・順序入れ替え・削除）
3. ドラッグで位置調整（終了時に経路再生成）
4. ハンバーガーメニュー→「通学路の保存」で保存

### 経路閲覧・管理

1. ハンバーガーメニュー→「通学路の一覧」で保存済み経路を表示
2. 行クリックで経路を地図に表示
3. ✏️ボタンで編集用に読み込み

## 経路生成の条件

- 最低2ポイント必要（スタート + ゴール）
- スタートとゴールが1つずつ存在
- 中継地点は0個以上
- Valhalla APIエラー時は直線接続にフォールバック

## 地図表示

| 項目 | 値 |
|------|-----|
| 地図ライブラリ | React Leaflet |
| タイルプロバイダー | 国土地理院 地理院タイル（標準地図） |
| タイルURL | `https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png` |
| 初期位置 | 東京（35.6812, 139.7671）、ズーム13 |

## 基本方針

- ユーザー登録・ログインは行わない
- サーバーに個人データを保存しない
- 機能は「通学路地図作成と提出」に必要な最小限に絞る

# アーキテクチャ詳細

## システム構成

フロントエンドのみの構成。経路計算はValhalla APIに直接リクエスト。

```
┌─────────────────────────────────────┐
│  React App (Frontend)               │
│  - 地図表示・操作                    │
│  - ポイント管理                      │
│  - 経路表示                          │
│  - ホスティング: GitHub Pages        │
└─────────────────────────────────────┘
           ↓ HTTP
┌─────────────────────────────────────┐
│  Valhalla API                       │
│  - 経路計算                          │
│  - ホスティング: Fly.io             │
│  - 開発時: Docker (localhost:8002)  │
└─────────────────────────────────────┘
```

### 特徴
- バックエンドサーバーなし
- データベースなし
- ユーザー認証なし
- 経路データはブラウザのローカルストレージで管理
- JSONファイルによる経路のエクスポート/インポート機能

## フロントエンド設計

### ポイント種別の自動判定

1. 1番目のポイント → スタート
2. 2番目のポイント → ゴール
3. 3番目以降 → 中継地点（ゴールの直前に挿入）

### コンポーネント構成

```
App.tsx
├── LoadingOverlay.tsx
├── WelcomeScreen.tsx          # ウェルカム画面（初回起動時）
├── HamburgerMenu.tsx          # ハンバーガーメニュー
├── RouteListModal.tsx         # 通学路一覧モーダル
├── AddressSearchModal.tsx     # 住所検索モーダル
├── PointListPanel.tsx         # ポイント一覧パネル（画面左下）
│   ├── PointItem.tsx
│   └── AddressSearchInput.tsx # 住所検索入力
├── PointEditModal.tsx
├── RouteNameModal.tsx
├── MessageDisplay.tsx
└── MapContainer
    ├── MapClickHandler.tsx
    ├── MapCenter.tsx
    ├── FitBounds.tsx
    ├── RouteLine.tsx
    ├── PointMarker.tsx
    └── CoordinateDisplay.tsx
```

### カスタムフック

| フック | 責務 |
|--------|------|
| `usePoints` | ポイント状態管理（追加・更新・削除・移動・検索） |
| `useRouteGeneration` | Valhalla経路生成、エラー時は直線接続にフォールバック |
| `useMessage` | メッセージ表示・自動消去（3秒後） |
| `useModal` | モーダル開閉状態管理（ジェネリック対応） |

### 定数ファイル

`constants/map-config.ts`:
- `DEFAULT_MAP_CENTER`: 初期表示座標（東京・大田区付近）
- `DEFAULT_ZOOM_LEVEL`: 初期ズームレベル（14）
- `MESSAGE_TIMEOUT_MS`: メッセージ自動消去時間（3000ms）
- `HIGHLIGHT_TIMEOUT_MS`: ハイライト表示時間（3000ms）

### Context API

| Context | 責務 |
|---------|------|
| `PointContext` | ポイント・経路の状態と操作関数（追加・更新・削除・移動） |
| `AppContext` | アプリ全体の状態（メッセージ・ハイライト・地図中心・ローディング） |

```
App (AppProvider)
 └── PointProvider
      └── AppContent
           ├── HamburgerMenu
           ├── RouteListModal
           ├── PointListPanel
           └── MapContainer (usePointContext)
```

### ユーティリティ

| ファイル | 責務 |
|----------|------|
| `utils/error-handler.ts` | 共通エラーハンドリング（handleAsyncOperation, handleApiResult） |
| `utils/point-utils.ts` | ポイント関連ヘルパー（getPointTypeLabel, getDisplayTitle） |
| `api/valhalla-client.ts` | Valhalla API呼び出し |
| `api/route-api.ts` | 経路データ管理（ローカルストレージ、エクスポート/インポート） |
| `api/geocoding-client.ts` | 国土地理院ジオコーディングAPI呼び出し |

### 定数

| ファイル | 内容 |
|----------|------|
| `constants/map-config.ts` | 地図設定（DEFAULT_MAP_CENTER, DEFAULT_ZOOM_LEVEL, MESSAGE_TIMEOUT_MS, HIGHLIGHT_TIMEOUT_MS） |
| `constants/colors.ts` | カラーコード定数 |

### スタイリング

CSS Modulesを採用。設計トークンはCSS変数で管理。

```
styles/
├── variables.css          # 設計トークン（色、スペーシング等）
└── shared/
    ├── buttons.module.css # ボタン共通スタイル
    ├── modal.module.css   # モーダル共通スタイル
    ├── forms.module.css   # フォーム共通スタイル
    └── cards.module.css   # カード共通スタイル
```

- 条件付きクラス結合: `clsx`ライブラリを使用

## Valhalla API連携

### 基本情報
- Valhallaエンドポイント: `http://localhost:8002`
- 開発時: Viteプロキシ経由（`/api/valhalla` → `localhost:8002`）でCORS回避
- データ: 関東地方のOSMデータ

### リクエスト例

```typescript
// フロントエンドからの呼び出し（プロキシ経由）
const response = await fetch('/api/valhalla/route', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    locations: [
      { lat: 35.681236, lon: 139.767125 },
      { lat: 35.689729, lon: 139.700294 }
    ],
    costing: 'auto'
  })
});
```

### エラー時のフォールバック
- Valhalla APIが利用できない場合、ポイント間を直線で接続

## データ型定義

```typescript
interface Point {
  id: string;
  lat: number;
  lng: number;
  type: 'start' | 'waypoint' | 'goal';
  order: number;
  comment: string;
}

interface SavedRoute {
  id: string;
  name: string;
  routeLine: [number, number][]; // [lat, lng] 形式
  points: Point[];
  created_at: string;
  updated_at: string;
}
```

## 経路データ管理

### ローカルストレージ
- キー: `school-route-planner-saved-routes`
- 形式: `SavedRoute[]` のJSON文字列

### エクスポート/インポート
- **エクスポート**: 保存済み経路一覧をJSONファイルとしてダウンロード
- **インポート**: JSONファイルを読み込み、既存経路の後ろに追加
  - インポート時はIDが再生成されるため、同じファイルを複数回インポート可能

## エラーハンドリング

### ルール
- 全async処理でtry-catch必須
- Valhalla APIエラー時は直線接続にフォールバック
- ユーザーにはメッセージ表示で通知

# 開発ガイド

## 環境構築

### 前提条件
- Node.js 18+
- Docker & Docker Compose
- npm

### 初期セットアップ

```bash
# 依存関係インストール
npm install

# Docker起動（Valhalla）
docker-compose up -d valhalla

# 開発サーバー起動
npm run dev
```

### 開発用URL
- フロントエンド: http://localhost:5173
- Valhalla API: http://localhost:8002

### 本番環境
- フロントエンド: GitHub Pages
- Valhalla API: Fly.io

## コマンド一覧

### 開発

```bash
npm run dev    # 開発サーバー起動
```

### Docker

```bash
docker-compose up -d valhalla  # Valhalla起動
docker-compose down            # 停止
docker-compose build valhalla  # Valhallaリビルド（初回10-20分）
```

### テスト・リント

```bash
npm run test                   # テスト実行
npm run lint                   # Biomeリント
npm run format                 # Biomeフォーマット
```

## Valhalla API連携

### 基本情報
- Valhallaエンドポイント: `http://localhost:8002`
- 開発時: Viteプロキシ経由（`/api/valhalla` → `localhost:8002`）
- データ: 関東地方のOSMデータ

### プロキシ設定
`vite.config.ts`でCORS回避用のプロキシを設定済み:
```typescript
proxy: {
  '/api/valhalla': {
    target: 'http://localhost:8002',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/valhalla/, ''),
  },
}
```

### リクエスト例

```json
POST /api/valhalla/route
{
  "locations": [
    {"lat": 35.681236, "lon": 139.767125},
    {"lat": 35.689729, "lon": 139.700294}
  ],
  "costing": "auto"
}
```

### ステータス確認

```bash
curl http://localhost:8002/status
```

### トラブルシューティング

| 問題 | 解決策 |
|------|--------|
| 経路生成されない | `docker-compose up -d valhalla` で起動確認 |
| 座標範囲外エラー | 関東地方の座標か確認 |
| タイムアウト | Valhallaコンテナのリソース確認 |
| CORSエラー | Viteプロキシ設定を確認（`/api/valhalla`経由か） |

#### Valhallaが起動しない場合

1. ログを確認: `docker-compose logs -f valhalla`
2. ディスク容量を確認（最低5GB以上の空き容量が必要）
3. ボリュームを削除して再起動: `docker-compose down -v && docker-compose up -d valhalla`

#### 経路生成がエラーになる場合

1. Valhallaのステータス確認: `curl http://localhost:8002/status`
2. タイル生成が完了しているか確認
3. 指定した座標が地図データの範囲内か確認（関東地方外の場合はエラー）

#### 初回起動時の注意

- Valhallaは初回起動時に地図データのダウンロードとタイル生成を行います
- 関東地方のデータで約10-20分かかります
- `docker-compose logs -f valhalla`でログを確認できます

## フロントエンド構成

### 主なコンポーネント

| コンポーネント | 責務 |
|--------------|------|
| `App.tsx` | メインアプリケーション（各種カスタムフック統合） |
| `WelcomeScreen.tsx` | ウェルカム画面（初回起動時に表示） |
| `HamburgerMenu.tsx` | ハンバーガーメニュー（新規作成、保存、一覧、住所検索、エクスポート/インポート） |
| `RouteListModal.tsx` | 通学路一覧モーダル（表示/編集/削除） |
| `AddressSearchModal.tsx` | 住所検索モーダル |
| `AddressSearchInput.tsx` | 住所検索入力コンポーネント（国土地理院API使用） |
| `PointListPanel.tsx` | ポイント一覧パネル（住所検索、順序入れ替え、編集、削除） |
| `PointItem.tsx` | ポイント項目のレンダリング |
| `PointEditModal.tsx` | ポイント編集モーダル（コメント編集・順序入れ替え・削除） |
| `RouteNameModal.tsx` | 経路名入力モーダル |
| `LoadingOverlay.tsx` | ローディングインジケーター |
| `MessageDisplay.tsx` | 画面中央上部のメッセージ表示 |
| `MapClickHandler.tsx` | 地図クリックイベント処理 |
| `PointMarker.tsx` | 地図上のポイントマーカー（ドラッグ・クリック対応） |
| `RouteLine.tsx` | 経路ライン表示 |
| `CoordinateDisplay.tsx` | 座標・ズーム表示 |
| `FitBounds.tsx` | 経路全体を画面に収める |
| `MapCenter.tsx` | 地図の中心を変更 |

### カスタムフック

| フック | 責務 |
|--------|------|
| `usePoints` | ポイント状態管理（追加・更新・削除・移動・検索） |
| `useRouteGeneration` | Valhalla経路生成・フォールバック処理 |
| `useMessage` | メッセージ表示・自動消去 |
| `useModal` | モーダル開閉状態管理（ジェネリック対応） |

### Context

| Context | 責務 |
|---------|------|
| `PointContext` | ポイント・経路の状態と操作関数 |
| `AppContext` | アプリ全体の状態（メッセージ・ハイライト・地図中心・ローディング） |

### ユーティリティ・定数

| ファイル | 内容 |
|----------|------|
| `utils/error-handler.ts` | 共通エラーハンドリング関数 |
| `utils/point-utils.ts` | ポイント関連ヘルパー関数 |
| `api/valhalla-client.ts` | Valhalla API呼び出し |
| `api/geocoding-client.ts` | 国土地理院ジオコーディングAPI呼び出し |
| `api/route-api.ts` | 経路データ管理（ローカルストレージ、エクスポート/インポート） |
| `constants/map-config.ts` | 地図設定定数 |
| `constants/colors.ts` | カラーコード定数 |
| `types/handlers.ts` | ハンドラ関数の型定義 |
| `types/common.ts` | 共通型（MessageType） |

## コーディング規約詳細

### ファイル命名

| 種類 | 規則 | 例 |
|------|------|-----|
| TypeScript | kebab-case | `valhalla-client.ts` |
| React | PascalCase | `UserProfile.tsx` |
| テスト | *.test.ts(x) | `valhalla-client.test.ts` |
| 型定義 | *.types.ts | `point.types.ts` |

### Import順序

```typescript
// 1. 外部ライブラリ
import { useState } from 'react';
// 2. 内部モジュール（絶対パス）
import { useAppContext } from '@/contexts';
// 3. 相対パス
import { generateRoute } from './valhalla-client';
// 4. 型
import type { Point } from './types';
```

### TypeScriptルール
- `any`禁止 → `unknown`を使用
- Optional Chaining活用: `user?.profile?.name`
- Nullish Coalescing活用: `value ?? defaultValue`

## コードレビューチェックリスト

### フロントエンド
- [ ] コンポーネントの責務が明確
- [ ] 不要な再レンダリングがない
- [ ] エラーハンドリング実装

### Valhalla連携
- [ ] エラー時のフォールバック（直線接続）
- [ ] ローディング表示
- [ ] 座標バリデーション

### エラーハンドリング
- [ ] 全async処理でtry-catch
- [ ] ユーザーへのフィードバック

