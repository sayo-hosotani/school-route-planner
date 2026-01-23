# アーキテクチャ詳細

## システム構成

フロントエンドのみの構成。経路計算はValhalla APIに直接リクエスト。

```
┌─────────────────────────────────────┐
│  React App (Frontend)               │
│  - 地図表示・操作                    │
│  - ポイント管理                      │
│  - 経路表示                          │
└─────────────────────────────────────┘
           ↓ HTTP
┌─────────────────────────────────────┐
│  Valhalla API (Docker)              │
│  - 経路計算                          │
└─────────────────────────────────────┘
```

### 特徴
- バックエンドサーバーなし
- データベースなし
- ユーザー認証なし
- 経路データはブラウザのローカルストレージで管理
- JSONファイルによる経路のエクスポート/インポート機能

## フロントエンド設計

### 画面モード

| モード | 目的 | 主な機能 |
|--------|------|---------|
| 通常モード | 経路閲覧 | 地図閲覧、ポイント表示 |
| 編集モード | 経路編集 | ポイント追加・移動・削除、自動経路生成 |

### ポイント種別の自動判定

1. 1番目のポイント → スタート
2. 2番目のポイント → ゴール
3. 3番目以降 → 中継地点（ゴールの直前に挿入）

### コンポーネント構成

```
App.tsx
├── LoadingOverlay.tsx
├── Sidebar.tsx
│   ├── ViewModeSection.tsx
│   ├── EditModeSection.tsx
│   │   └── PointItem.tsx
├── PointEditModal.tsx
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
| `AppContext` | アプリ全体の状態（モード・メッセージ・ハイライト・地図中心・ローディング） |

```
App (AppProvider)
 └── PointProvider
      └── AppContent
           ├── Sidebar (useAppContext, propsで操作関数を受け取る)
           └── MapContainer (usePointContext)
```

### ユーティリティ

| ファイル | 責務 |
|----------|------|
| `utils/error-handler.ts` | 共通エラーハンドリング（handleAsyncOperation, handleApiResult） |
| `utils/point-utils.ts` | ポイント関連ヘルパー（getPointTypeLabel, getDisplayTitle） |
| `api/valhalla-client.ts` | Valhalla API呼び出し |
| `api/route-api.ts` | 経路データ管理（ローカルストレージ、エクスポート/インポート） |

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
