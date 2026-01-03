# Route Planner

OpenStreetMap上で経路を作成・保存できるWebアプリケーション。

> 詳細: [ARCHITECTURE.md](./ARCHITECTURE.md) | [DEVELOPMENT.md](./DEVELOPMENT.md)

## 技術スタック

- **言語**: TypeScript
- **バックエンド**: Fastify, Kysely, PostgreSQL
- **フロントエンド**: React, Vite, React Leaflet
- **経路計算**: Valhalla (Docker)
- **ツール**: Biome, Vitest

## プロジェクト構成

```
packages/
├── backend/src/
│   ├── routes/        # APIエンドポイント
│   ├── services/      # ビジネスロジック
│   ├── repositories/  # データアクセス層
│   └── database/      # DB設定・マイグレーション
└── frontend/src/
    ├── components/    # Reactコンポーネント
    ├── hooks/         # カスタムフック
    └── api/           # APIクライアント
```

## アーキテクチャ（3層構造）

```
Routes → Services → Repositories → PostgreSQL
```

**ルール**: 依存は一方向のみ。RouteでDB直接アクセス禁止。

## コーディング規約

| 対象 | 規則 | 例 |
|------|------|-----|
| ファイル（TS） | kebab-case | `user-service.ts` |
| ファイル（React） | PascalCase | `UserProfile.tsx` |
| 変数・関数 | camelCase | `getUserById` |
| 定数 | UPPER_SNAKE_CASE | `API_BASE_URL` |
| 型・クラス | PascalCase | `User` |

- インデント: タブ、セミコロン: 必須、クォート: シングル
- `any`型禁止、`SELECT *`禁止

## セキュリティ

- **現状**: 認証未実装。仮ユーザーID使用（`TEMPORARY_USER_ID`）
- **必須**: Repository層で必ず`user_id`フィルタリング
- **禁止**: 生SQL、dangerouslySetInnerHTML、パスワード平文保存

## よく使うコマンド

```bash
# 開発
npm run dev:all              # 全体起動

# バックエンド
npm run migrate --workspace=@route-planner/backend
npm run seed --workspace=@route-planner/backend

# Docker
docker-compose up -d         # PostgreSQL + Valhalla起動
```

## API エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/routes/generate` | Valhalla経路生成 |
| POST | `/routes` | 経路保存 |
| GET | `/routes` | 経路一覧 |
| GET | `/routes/:id` | 経路取得 |
| DELETE | `/routes/:id` | 経路削除 |

## データ型

```typescript
interface Point {
  id: string;
  lat: number;
  lng: number;
  type: 'start' | 'waypoint' | 'goal';
  order: number;
  comment: string;
}
```

## 開発時の注意

1. **レイヤー分離厳守**: Routes→Services→Repositories
2. **型安全**: Kyselyの型推論活用、スキーマバリデーション必須
3. **座標バリデーション**: 緯度 -90〜90、経度 -180〜180
4. **エラーハンドリング**: 全async処理でtry-catch

## 参考リンク

- [Fastify](https://fastify.dev/) | [Kysely](https://kysely.dev/) | [React Leaflet](https://react-leaflet.js.org/)
- [Valhalla API](https://valhalla.github.io/valhalla/api/)
