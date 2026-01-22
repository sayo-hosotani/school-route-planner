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

# Docker起動（PostgreSQL + Valhalla）
docker-compose up -d

# DBマイグレーション
npm run migrate --workspace=@route-planner/backend

# シードデータ作成
npm run seed --workspace=@route-planner/backend

# 開発サーバー起動
npm run dev:all
```

### 開発用URL
- フロントエンド: http://localhost:5173
- バックエンドAPI: http://localhost:3000
- Valhalla API: http://localhost:8002

## コマンド一覧

### 開発

```bash
npm run dev:all                                    # 全体起動
npm run dev --workspace=@route-planner/frontend    # フロントエンドのみ
npm run dev --workspace=@route-planner/backend     # バックエンドのみ
```

### データベース

```bash
npm run migrate --workspace=@route-planner/backend  # マイグレーション実行
npm run seed --workspace=@route-planner/backend     # シードデータ作成
npm run db:test --workspace=@route-planner/backend  # DB接続テスト
```

### Docker

```bash
docker-compose up -d           # 全サービス起動
docker-compose up -d postgres  # PostgreSQLのみ
docker-compose up -d valhalla  # Valhallaのみ
docker-compose down            # 停止
docker-compose build valhalla  # Valhallaリビルド（初回10-20分）
```

### テスト・リント

```bash
npm run test                   # テスト実行
npm run lint                   # Biomeリント
npm run format                 # Biomeフォーマット
```

## よくあるタスク

### 新しいAPIエンドポイントの追加

1. `schemas/` にバリデーションスキーマを作成
2. `models/` に型を定義
3. `repositories/` にデータアクセス層を実装
4. `services/` にビジネスロジックを実装
5. `controllers/` にハンドラーロジックを実装
6. `routes/` にエンドポイント登録を追加
7. `tests/` にテストを作成

### データベースマイグレーション

1. `database/migrations/` にSQLファイル作成（例: `002_add_column.sql`）
2. `database/types.ts` の型を更新
3. `npm run migrate --workspace=@route-planner/backend`
4. 確認: `docker exec -it route-planner-postgres psql -U postgres -d route_planner -c "\dt"`

## Valhalla API連携

### 基本情報
- エンドポイント: `http://localhost:8002`
- データ: 関東地方のOSMデータ

### リクエスト例

```json
POST http://localhost:8002/route
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

## フロントエンド構成

### 主なコンポーネント

| コンポーネント | 責務 |
|--------------|------|
| `App.tsx` | メインアプリケーション（モード管理、各種カスタムフック統合） |
| `Sidebar.tsx` | モード切り替えと機能ボタン |
| `ViewModeSection.tsx` | 通常モード用セクション（保存ボタン + 保存済み経路一覧） |
| `EditModeSection.tsx` | 編集モード用セクション（クリアボタン + ポイント一覧） |
| `PointItem.tsx` | ポイント項目のレンダリング |
| `SavedRouteList.tsx` | 保存済み経路一覧 |
| `PointEditModal.tsx` | ポイント編集モーダル（種別・コメント編集） |
| `RouteNameModal.tsx` | 経路名入力モーダル |
| `LoadingOverlay.tsx` | ローディングインジケーター |
| `MessageDisplay.tsx` | 画面中央上部のメッセージ表示 |
| `MapClickHandler.tsx` | 地図クリックイベント処理（編集モード時のみ） |
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
| `useSavedRoutes` | 保存済み経路のフェッチ・削除ロジック |

### Context

| Context | 責務 |
|---------|------|
| `PointContext` | ポイント・経路の状態と操作関数 |
| `AppContext` | アプリ全体の状態（モード・メッセージ・ハイライト・地図中心・ローディング） |

### ユーティリティ・定数

| ファイル | 内容 |
|----------|------|
| `utils/error-handler.ts` | 共通エラーハンドリング関数 |
| `utils/point-utils.ts` | ポイント関連ヘルパー関数 |
| `api/errors.ts` | カスタムApiErrorクラス |
| `api/client.ts` | 共通fetchラッパー |
| `constants/map-config.ts` | 地図設定定数 |
| `constants/colors.ts` | カラーコード定数 |
| `types/handlers.ts` | ハンドラ関数の型定義 |
| `types/common.ts` | 共通型（AppMode, MessageType） |

## コーディング規約詳細

### ファイル命名

| 種類 | 規則 | 例 |
|------|------|-----|
| TypeScript | kebab-case | `user-service.ts` |
| React | PascalCase | `UserProfile.tsx` |
| テスト | *.test.ts(x) | `user-service.test.ts` |
| 型定義 | *.types.ts | `user.types.ts` |

### Import順序

```typescript
// 1. Node.js組み込み
import { readFile } from 'node:fs/promises';
// 2. 外部ライブラリ
import Fastify from 'fastify';
// 3. 内部モジュール（絶対パス）
import { db } from '@/database';
// 4. 相対パス
import { userService } from './user-service';
// 5. 型
import type { User } from './types';
```

### TypeScriptルール
- `any`禁止 → `unknown`を使用
- Optional Chaining活用: `user?.profile?.name`
- Nullish Coalescing活用: `value ?? defaultValue`

## コードレビューチェックリスト

### セキュリティ
- [ ] 認証チェック実装済み
- [ ] user_idでフィルタリング
- [ ] 入力バリデーション実装

### アーキテクチャ
- [ ] レイヤー分離を遵守
- [ ] 依存関係が一方向

### データベース
- [ ] Kyselyパラメータバインディング使用
- [ ] 必要カラムのみSELECT
- [ ] N+1問題なし

### エラーハンドリング
- [ ] 全async処理でtry-catch
- [ ] エラーレスポンス形式統一
