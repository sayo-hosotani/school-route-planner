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
5. `routes/` にエンドポイントを定義
6. `tests/` にテストを作成

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
