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

## フロントエンド構成

### 主なコンポーネント

| コンポーネント | 責務 |
|--------------|------|
| `App.tsx` | メインアプリケーション（各種カスタムフック統合） |
| `HamburgerMenu.tsx` | ハンバーガーメニュー（新規作成、保存、一覧、エクスポート/インポート） |
| `RouteListModal.tsx` | 通学路一覧モーダル（表示/編集/削除） |
| `PointListPanel.tsx` | ポイント一覧パネル（順序入れ替え、コメント編集、削除） |
| `PointItem.tsx` | ポイント項目のレンダリング |
| `PointEditModal.tsx` | ポイント編集モーダル（種別・コメント編集） |
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
