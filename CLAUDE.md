# プロジェクト概要

OpenStreetMapにスタートとゴールのポイントを置き、経路生成ボタンを押すと、自動で経路をハイライトしてくれるWebアプリケーション。
必要に応じて、中継地点のポイントも置くことができる。
各ポイントには、吹き出しでコメントを入力/表示が可能。
各ポイント、コメント、生成した経路の情報は、ユーザーごとにDB保存しておき、再表示することができる。

## プロジェクト名

- プロジェクト名: `route-planner`
- モノレポ構成のため、各パッケージは以下の命名規則に従う:
  - ルート: `route-planner` (private)
  - バックエンド: `@route-planner/backend`
  - フロントエンド: `@route-planner/frontend`

## 主な技術スタック

- 言語: TypeScript
- フレームワーク: Fastify, React, Kysely
- データベース: Postgresql
- その他の重要なツール: Vite, Vitest, Biome, Docker, Valhalla(経路計算API)

## プロジェクト構成

このプロジェクトはモノレポ構成で、バックエンド（Fastify）とフロントエンド（React）を含みます。

```
/
├── packages/
│   ├── backend/              # Fastifyバックエンドアプリケーション
│   │   ├── src/
│   │   │   ├── routes/       # APIルート定義
│   │   │   ├── plugins/      # Fastifyプラグイン
│   │   │   ├── services/     # ビジネスロジック
│   │   │   ├── repositories/ # データアクセス層（Kysely使用）
│   │   │   ├── models/       # TypeScript型定義
│   │   │   ├── schemas/      # バリデーションスキーマ
│   │   │   ├── utils/        # ユーティリティ関数
│   │   │   └── server.ts     # サーバーエントリーポイント
│   │   ├── tests/            # バックエンドテスト（Vitest）
│   │   ├── migrations/       # データベースマイグレーション
│   │   └── package.json
│   │
│   └── frontend/             # Reactフロントエンドアプリケーション
│       ├── src/
│       │   ├── components/   # Reactコンポーネント
│       │   ├── pages/        # ページコンポーネント
│       │   ├── hooks/        # カスタムReactフック
│       │   ├── api/          # APIクライアント
│       │   ├── types/        # TypeScript型定義
│       │   ├── utils/        # ユーティリティ関数
│       │   └── main.tsx      # エントリーポイント
│       ├── tests/            # フロントエンドテスト（Vitest）
│       ├── public/           # 静的ファイル
│       └── package.json
│
├── docker/                   # Docker関連ファイル
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── postgres/             # PostgreSQL初期化スクリプト
│
├── docker-compose.yml        # Docker Compose設定
├── package.json              # ルートpackage.json（ワークスペース管理）
├── biome.json                # Biome設定（リンター・フォーマッター）
└── CLAUDE.md                 # このファイル
```

### 各ディレクトリの役割

**Backend（packages/backend/src/）**
- `routes/`: Fastifyのルート定義。APIエンドポイントを定義
- `plugins/`: 認証、CORS、ロギングなどのFastifyプラグイン
- `services/`: ビジネスロジックを含むサービス層
- `repositories/`: Kyselyを使ったデータベースアクセス層
- `models/`: データベーステーブルとAPIレスポンスの型定義
- `schemas/`: リクエスト/レスポンスのバリデーションスキーマ

**Frontend（packages/frontend/src/）**
- `components/`: 再利用可能なReactコンポーネント
- `pages/`: ルーティングに対応するページコンポーネント
- `hooks/`: カスタムReactフック
- `api/`: バックエンドAPIとの通信処理

## 重要な設計パターンとルール

### コーディング規約

**ファイル命名規則**
- TypeScriptファイル: `kebab-case.ts` (例: `user-service.ts`, `auth-plugin.ts`)
- Reactコンポーネント: `PascalCase.tsx` (例: `UserProfile.tsx`, `LoginForm.tsx`)
- テストファイル: `*.test.ts` または `*.test.tsx` (例: `user-service.test.ts`)
- 型定義ファイル: `*.types.ts` (例: `user.types.ts`)

**変数・関数の命名規則**
- 変数/関数: `camelCase` (例: `getUserById`, `isAuthenticated`)
- 定数: `UPPER_SNAKE_CASE` (例: `MAX_RETRY_COUNT`, `API_BASE_URL`)
- クラス/型/インターフェース: `PascalCase` (例: `User`, `AuthConfig`)
- プライベートメンバー: `_camelCase` または `#camelCase` (例: `_privateMethod`)
- 真偽値: `is`, `has`, `should`で始める (例: `isValid`, `hasPermission`)

**コードフォーマット（Biome管理）**
- インデント: タブ（Biomeのデフォルト）
- セミコロン: 必須
- クォート: シングルクォート `'` を優先
- 行の最大長: 100文字を目安
- trailing comma: 複数行の場合は必須

**TypeScript固有のルール**
- `any`型の使用を避ける（どうしても必要な場合は`unknown`を検討）
- nullable型は明示的に定義 (例: `string | null`)
- Optional Chainingを活用 (例: `user?.profile?.name`)
- Nullish Coalescing演算子を活用 (例: `value ?? defaultValue`)
- 型推論を活用（冗長な型注釈は避ける）

**Import順序**
1. Node.js組み込みモジュール
2. 外部ライブラリ
3. 内部モジュール（絶対パス）
4. 相対パス
5. 型インポート（`import type`）

```typescript
// 例
import { readFile } from 'node:fs/promises'
import Fastify from 'fastify'
import { db } from '@/database'
import { userService } from './user-service'
import type { User } from './types'
```

### アーキテクチャパターン

このプロジェクトは**レイヤードアーキテクチャ（3層構造）**を採用しています。

```
┌─────────────────────────────────────┐
│  Presentation Layer (Routes)        │  ← HTTPリクエスト/レスポンス処理
├─────────────────────────────────────┤
│  Business Logic Layer (Services)    │  ← ビジネスロジック
├─────────────────────────────────────┤
│  Data Access Layer (Repositories)   │  ← データベースアクセス
└─────────────────────────────────────┘
           ↓
      PostgreSQL
```

**各層の責務**

1. **Routes（プレゼンテーション層）**
   - HTTPリクエストの受け取りとバリデーション
   - レスポンスの整形と返却
   - 認証・認可のチェック
   - エラーハンドリング
   - **禁止事項**: ビジネスロジックやデータベースアクセスを直接書かない

2. **Services（ビジネスロジック層）**
   - ビジネスルールの実装
   - トランザクション管理
   - 複数のRepositoryを組み合わせた処理
   - 外部APIとの連携
   - **禁止事項**: HTTPリクエスト/レスポンスに依存しない（テスタビリティのため）

3. **Repositories（データアクセス層）**
   - Kyselyを使ったデータベースクエリ
   - CRUDオペレーション
   - データの永続化
   - **禁止事項**: ビジネスロジックを含めない

**依存関係のルール**
- Routes → Services → Repositories の一方向のみ
- 下位層が上位層に依存してはいけない（例: RepositoriesがServicesを呼ぶのはNG）
- 同じ層同士での依存は最小限に

**データフロー例**

```typescript
// 1. Route: リクエストを受け取る
app.post('/users', async (request, reply) => {
  const userData = request.body
  const user = await userService.createUser(userData)
  return reply.status(201).send(user)
})

// 2. Service: ビジネスロジックを実行
async function createUser(userData: CreateUserDto) {
  // バリデーション、パスワードハッシュ化など
  const hashedPassword = await hash(userData.password)
  return await userRepository.insert({ ...userData, password: hashedPassword })
}

// 3. Repository: データベースアクセス
async function insert(user: User) {
  return await db.insertInto('users').values(user).returningAll().executeTakeFirst()
}
```

**型の共有**
- `models/`に定義した型をすべての層で共有
- データベーススキーマから型を自動生成（Kyselyの型推論を活用）
- リクエスト/レスポンスの型は`schemas/`で定義

## 開発時の注意事項

### セキュリティ

- **認証・認可の仕組み**:
  - JWT（JSON Web Token）を使用した認証を実装
  - ログイン時にトークンを発行し、クライアント側で保存（localStorage or httpOnly cookie）
  - すべての保護されたAPIエンドポイントでトークン検証を必須とする
  - ユーザーは自分が作成した経路・ポイント・コメントのみアクセス可能（認可）
  - Fastifyの認証プラグイン（@fastify/jwt等）を使用

- **機密情報の取り扱い**:
  - ユーザーが保存したポイント、経路、コメントは機密情報として扱う
  - 他のユーザーからはアクセス不可（完全にプライベート）
  - パスワードは必ずハッシュ化して保存（bcryptやargon2を使用）
  - 環境変数（.env）でJWT秘密鍵やDB接続情報を管理
  - .envファイルは.gitignoreに追加し、Gitにコミットしない

- **バリデーションのルール**:
  - すべてのAPIエンドポイントで入力バリデーションを必須とする
  - Fastifyのスキーマバリデーション機能を使用
  - バリデーションスキーマは`schemas/`ディレクトリに集約
  - JSON Schemaまたは型安全なバリデーションライブラリ（Zod、Typebox等）を使用
  - バリデーションエラーは適切なHTTPステータス（400 Bad Request）で返す
  - SQLインジェクション対策: Kyselyのパラメータバインディングを使用（生SQLは避ける）
  - XSS対策: フロントエンドでReactの自動エスケープを活用、dangerouslySetInnerHTMLは使用禁止

### パフォーマンス

- **キャッシング戦略**:
  - 現時点ではキャッシングは実装しない
  - 必要に応じてRedisやインメモリキャッシュを検討

- **データベースクエリの最適化**:
  - N+1問題を避ける（適切にJOINを使用）
  - 必要なカラムのみをSELECT（`SELECT *`は避ける）
  - インデックスが必要なカラムには適切にインデックスを設定
  - ページネーションには`LIMIT`と`OFFSET`を使用
  - Kyselyの型安全なクエリビルダーを活用

- **その他のパフォーマンス考慮事項**:
  - Fastifyの高速な性能を活かす（同期処理を避け、非同期処理を基本とする）
  - フロントエンド: React.memoやuseMemoを必要な箇所で使用（過度な最適化は避ける）
  - フロントエンド: 画像の遅延読み込み（lazy loading）を活用
  - Viteのコード分割機能を活用してバンドルサイズを最適化

### エラーハンドリング

- **エラーハンドリングのパターン**:
  - すべての非同期処理でエラーハンドリングを実装
  - Fastifyのエラーハンドラーを使用して一貫したエラーレスポンスを返す
  - カスタムエラークラスを作成して、エラーの種類を明確にする
  - エラーレスポンスの形式:
    ```typescript
    {
      error: {
        message: "ユーザーフレンドリーなエラーメッセージ",
        code: "ERROR_CODE",
        statusCode: 400
      }
    }
    ```
  - クライアント側のエラー（400系）とサーバー側のエラー（500系）を明確に区別
  - 500エラーの場合、詳細な内部エラーは隠し、一般的なメッセージを返す

- **ロギングの方針**:
  - Fastifyの組み込みロガー（Pino）を使用
  - ログレベル: `debug`, `info`, `warn`, `error`を適切に使い分け
  - 本番環境では`info`レベル以上のみ出力
  - エラーログには必ずスタックトレースを含める
  - 個人情報やパスワードなどの機密情報はログに出力しない
  - リクエストID（Fastifyのrequest-id plugin）を使用してリクエストを追跡可能にする

## よくあるタスク

### 新しいAPIエンドポイントの追加

1. **スキーマ定義**: `packages/backend/src/schemas/`にリクエスト/レスポンスのバリデーションスキーマを作成
2. **型定義**: `packages/backend/src/models/`に必要な型を定義
3. **Repository作成**: `packages/backend/src/repositories/`にデータアクセス層を実装
4. **Service作成**: `packages/backend/src/services/`にビジネスロジックを実装
5. **Route作成**: `packages/backend/src/routes/`にエンドポイントを定義
   - 認証が必要な場合は`@fastify/jwt`のpreHandlerを追加
   - スキーマバリデーションを設定
6. **テスト追加**: `packages/backend/tests/`に対応するテストを作成
7. **動作確認**: 開発サーバーで動作確認

### データベースマイグレーション

1. **マイグレーションファイル作成**: `packages/backend/migrations/`に新しいマイグレーションファイルを作成
   - ファイル名: `YYYYMMDDHHMMSS_description.ts` (例: `20250128120000_create_users_table.ts`)
2. **UP/DOWNスクリプト記述**: テーブル作成/変更のSQLを記述
3. **マイグレーション実行**: マイグレーションツールを使用して適用
4. **Kysely型生成**: データベーススキーマから型を自動生成
5. **動作確認**: 新しいテーブル/カラムが正しく作成されたか確認

### テストの追加

1. **Repository層のテスト**:
   - データベース操作が正しく動作するかテスト
   - テスト用DBを使用（本番DBは使用しない）
2. **Service層のテスト**:
   - ビジネスロジックが正しく動作するかテスト
   - Repositoryはモック化してテスト
3. **Route層のテスト**:
   - エンドポイントが正しいレスポンスを返すかテスト
   - 認証・認可が正しく機能するかテスト
4. **実行**: `npm run test`でVitestを実行

### Valhalla経路計算APIとの連携

1. **Serviceでの呼び出し**: `packages/backend/src/services/route-service.ts`でValhalla APIを呼び出す
2. **エラーハンドリング**: Valhalla APIのエラーを適切にハンドリング
3. **レスポンスの変換**: Valhalla APIのレスポンスをアプリケーション用の型に変換
4. **経路データの保存**: 生成された経路をデータベースに保存

## AI開発アシスタント向けの特記事項

### このプロジェクトで特に重視している点

1. **レイヤー分離の厳守**
   - Routes → Services → Repositories の依存関係を必ず守る
   - 各層の責務を越えたコードは書かない

2. **認証・認可の徹底**
   - すべての保護されたエンドポイントで認証チェックを実装
   - ユーザーは自分のデータのみアクセス可能にする（repositoryでuser_idでフィルタ）

3. **型安全性**
   - `any`型は使用禁止
   - Kyselyの型推論を最大限活用
   - すべてのAPIエンドポイントでスキーマバリデーションを実装

4. **地理データの扱い**
   - 緯度経度は必ずバリデーション（緯度: -90〜90, 経度: -180〜180）
   - PostGIS拡張を使用する場合は適切な型を使用
   - 座標データは常にWGS84（EPSG:4326）で統一

### 避けるべきパターンやアンチパターン

1. **やってはいけないこと**
   - RouteでデータベースアクセスやKyselyを直接使用する
   - パスワードを平文で保存する
   - 他のユーザーのデータにアクセスできるようなクエリを書く
   - `SELECT *`を使用する（必要なカラムのみ指定）
   - 認証なしで経路・ポイント・コメントのCRUD操作を許可する

2. **よくある間違い**
   - バリデーションスキーマを定義せずにエンドポイントを作成
   - Valhalla APIのエラーをそのままクライアントに返す
   - トランザクション処理が必要な箇所でトランザクションを使わない
   - 環境変数を直接コードに埋め込む

### コードレビューで特にチェックすべき項目

1. **セキュリティ**
   - [ ] 認証が必要なエンドポイントに認証チェックが実装されているか
   - [ ] ユーザーIDでデータをフィルタリングしているか
   - [ ] パスワードがハッシュ化されているか
   - [ ] 入力バリデーションが実装されているか

2. **アーキテクチャ**
   - [ ] レイヤー分離が守られているか
   - [ ] 依存関係が一方向になっているか
   - [ ] 型定義が適切に共有されているか

3. **データベース**
   - [ ] Kyselyのパラメータバインディングを使用しているか
   - [ ] 必要なカラムのみSELECTしているか
   - [ ] N+1問題が発生していないか

4. **エラーハンドリング**
   - [ ] すべての非同期処理でエラーハンドリングが実装されているか
   - [ ] エラーレスポンスが統一されたフォーマットになっているか
   - [ ] 外部API（Valhalla）のエラーを適切に処理しているか

## 参考リソース

- **Fastify**: https://fastify.dev/
- **Kysely**: https://kysely.dev/
- **Valhalla API**: https://valhalla.github.io/valhalla/api/
- **OpenStreetMap**: https://www.openstreetmap.org/
- **React Leaflet**: https://react-leaflet.js.org/ (OpenStreetMap表示用ライブラリ)
- **Vitest**: https://vitest.dev/
- **Biome**: https://biomejs.dev/
