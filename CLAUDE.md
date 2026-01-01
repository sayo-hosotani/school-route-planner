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
- データベース: PostgreSQL
- 地図ライブラリ: Leaflet, React Leaflet
- 地図タイル: 国土地理院 地理院タイル（標準地図）
- 経路計算: Valhalla (Dockerでローカル構築)
- その他の重要なツール: Vite, Vitest, Biome, Docker

## 地図表示について

- **地図ライブラリ**: React Leafletを使用してOpenStreetMapベースの地図を表示
- **地図タイルプロバイダー**: 国土地理院 地理院タイル（標準地図）
  - タイルURL: `https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png`
  - 出典表示: `<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>`
  - 利用規約: 国土地理院の利用規約に準拠
- **初期表示位置**: 東京（緯度: 35.6812, 経度: 139.7671）、ズームレベル: 13

## UI/UX設計

### 画面モード

アプリケーションは2つのモードを持つ:

#### 1. 通常モード（View Mode）
- **目的**: 経路の閲覧と保存済みデータの管理
- **機能**:
  - 地図の閲覧・移動・ズーム
  - 既存のポイント・経路・コメントの表示
  - ポイントをクリックしてコメントを表示（読み取り専用ポップアップ）
  - **サイドバーでのポイント操作**（実装済み）:
    - ポイントタイトルをクリック → 地図の中心に移動してハイライト表示（3秒間）
    - ▼ボタンでコメント全文を表示（読み取り専用）
  - 現在表示中の経路をDBに保存
  - 保存済み経路の一覧から選択して読み込み

#### 2. 編集モード（Edit Mode）
- **目的**: ポイントと経路の編集
- **機能**:
  - 地図クリックでポイント追加
  - ポイントをドラッグして移動
  - ポイントをクリックして編集（種別変更・コメント追加・削除）
  - **サイドバーでのポイント操作**（実装済み）:
    - ポイントタイトルをクリック → 地図の中心に移動してハイライト表示（3秒間）
    - ▼ボタンでコメント全文を表示・編集
    - インラインでのコメント編集（保存・キャンセルボタン）
    - 中継地点の並び替え（↑↓ボタン）
  - **自動経路生成**: ポイント追加時・移動終了時に自動でValhalla APIを呼び出し
  - 全ポイントをクリア

### ポイント種別の管理

#### 自動判定ルール（実装済み）
ポイントは追加順に基づいて種別が自動判定される:
- **1番目のポイント**: スタート
- **2番目のポイント**: ゴール
- **3番目以降のポイント**: 中継地点（ゴールの直前に挿入）

**ポイント追加の流れ:**
1. スタート地点を追加 → `[スタート]`
2. ゴール地点を追加 → `[スタート, ゴール]`
3. 中継地点を追加 → `[スタート, 中継地点1, ゴール]`
4. さらに中継地点を追加 → `[スタート, 中継地点1, 中継地点2, ゴール]`

このルールにより、ユーザーは「スタートとゴールを最初に決めて、その後に経由地を追加する」という自然な操作が可能。

#### 手動変更（実装済み）
編集モードでポイントをクリックすると、ポイント編集モーダルが開き、種別を手動で変更可能。

#### 経路生成の条件
- 最低2ポイント必要（スタート + ゴール）
- スタートとゴールが1つずつ存在する
- 中継地点は0個以上

#### 経路の接続（実装済み）
- ポイントが2つ以上追加されると、自動的に直線で接続される
- 将来的にはValhalla APIを使用して道路に沿った経路に変更予定

### ポイント情報の表示（実装済み）

#### コメントベースのタイトル表示
ポイントには`comment`フィールドのみがあり、タイトルは自動生成される:
- **表示ルール**: コメントの1行目または最初の16文字がタイトルとして表示される
  - コメントに改行が含まれる場合: 1行目をタイトルとして使用
  - 改行がない場合: 最初の16文字をタイトルとして使用
  - コメントが空の場合: デフォルトのラベル（「スタート」「中継地点n」「ゴール」）を表示
- **適用箇所**:
  - サイドバーのポイント一覧
  - 地図上のポップアップ（通常モード）

**コメント入力の推奨形式:**
```
タイトル部分（16文字以内）
詳細な説明や補足情報
```

例:
```
自宅
スタート地点です
```

### データ型定義

```typescript
interface Point {
  id: string;
  lat: number;
  lng: number;
  type: 'start' | 'waypoint' | 'goal';
  order: number; // 経路上の順序（0, 1, 2, ...）
  comment: string; // 空文字列も許可。1行目または最初の16文字がタイトルとして表示される
  created_at: string;
  updated_at: string;
}

interface Route {
  id: string;
  user_id: string;
  name: string;
  route_data: object; // Valhalla APIからの経路情報（GeoJSON等）
  created_at: string;
  updated_at: string;
}
```

### UI配置

#### 左側パネル（モード切り替えと機能ボタン）（実装済み）
```
┌─────────────────────────────────────┐
│ [通常モード] [編集モード]           │
│                                     │
│ 【通常モード】                      │
│ ・現在の経路を保存                  │
│ ・保存済み経路を読み込む            │
│                                     │
│ 【編集モード】                      │
│ ・地図をクリックしてポイント追加     │
│ ・ポイントをクリックして編集        │
│ ・ポイントをドラッグして移動        │
│ ・全ポイントをクリア                │
│                                     │
│ 現在のポイント一覧 (3):             │
│ 1. 🟢 スタート [編集] [削除]       │
│ 2. 🔵 中継地点1 [編集] [削除]      │
│ 3. 🔵 中継地点2 (未設定) ← 次ここ  │
│ 4. 🔴 ゴール [編集] [削除]         │
└─────────────────────────────────────┘
```

**実装された機能:**
- モード切り替え（通常モード/編集モード）
- ポイント一覧の固定表示（スタート・中継地点・ゴールを常に表示）
- 次に追加すべきポイントをハイライト表示（黄色背景 + 「← 地図をクリックして追加」、編集モード時のみ）
- 中継地点には連番を表示（中継地点1、中継地点2、...）
- 中継地点の並び替えボタン（↑↓ボタン、編集モード時のみ）
- 編集モード時のみ編集・削除・並び替えボタンを表示
- 通常モードでは実際に存在するポイントのみ表示（空の追加欄は非表示）

#### ポイント編集モーダル（実装済み）
```
┌─────────────────────────────────────┐
│ ポイント編集                        │
│                                     │
│ 種別: ○スタート ○中継地点 ○ゴール  │
│                                     │
│ コメント:                           │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [保存] [削除] [キャンセル]          │
└─────────────────────────────────────┘
```

**実装された機能:**
- 種別の手動変更（ラジオボタンで選択）
- コメントの入力・編集（テキストエリア）
- 保存・削除・キャンセルボタン
- 編集モード時にポイントをクリックで表示
- モーダル外クリックで閉じる

#### メッセージ表示（実装済み）
- **位置**: 画面中央上部（固定表示）
- **内容**: ポイント追加・編集・削除、経路保存・読み込みなどの操作完了メッセージ
- **表示時間**: 3秒後に自動で消える
- **スタイル**: 成功時は緑色、失敗時は赤色の背景で表示
- **特徴**: サイドバーから独立しているため、メッセージ表示時にUIがずれない

#### 地図コントロール配置
- **左下**: Attribution（出典表示）
- **右上**: ZoomControl（ズームボタン）
- **右下**: CoordinateDisplay（経度・緯度・ズーム表示） + ScaleControl（縮尺バー）

### 操作フロー

#### 編集モードでの経路作成（実装済み）
1. 編集モードに切り替え
2. 地図上をクリックしてポイントを追加
   - 1番目: 自動的にスタートとして追加
   - 2番目: 自動的にゴールとして追加
   - 3番目以降: 中継地点としてゴールの直前に挿入
   - ポイント追加時に自動で直線経路を生成
3. ポイントをクリックして編集モーダルを開く
   - コメント入力
   - 種別変更（必要に応じて）
   - 保存または削除
4. ポイントをドラッグして位置調整
   - ドラッグ終了時に自動で経路を更新
5. 中継地点の順序を変更（↑↓ボタンで入れ替え）
   - 順序変更時に自動で経路を更新
6. 通常モードに戻る
7. 「現在の経路を保存」ボタンで保存

#### 通常モードでの経路閲覧
1. 通常モードで起動（またはモード切り替え）
2. 「保存済み経路を読み込む」から経路を選択
3. 地図上にポイントと経路が表示される
4. ポイントをクリックするとコメントがポップアップで表示される（読み取り専用）

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
│   ├── valhalla/             # Valhalla経路計算サーバー
│   │   └── Dockerfile        # Valhallaのカスタムビルド設定
│   ├── Dockerfile.backend    # （将来追加予定）
│   ├── Dockerfile.frontend   # （将来追加予定）
│   └── postgres/             # PostgreSQL初期化スクリプト
│
├── docker-compose.yml        # Docker Compose設定（PostgreSQL + Valhalla）
├── package.json              # ルートpackage.json（ワークスペース管理）
├── biome.json                # Biome設定（リンター・フォーマッター）
└── CLAUDE.md                 # このファイル
```

### 各ディレクトリの役割

**Backend（packages/backend/src/）**
- `routes/`: Fastifyのルート定義。APIエンドポイントを定義
  - `routes.ts`: 経路関連のエンドポイント
    - `POST /routes/generate`: Valhalla APIで経路を生成
    - `POST /routes`: 経路データを保存
    - `GET /routes`: 保存済み経路データを読み込み
- `plugins/`: 認証、CORS、ロギングなどのFastifyプラグイン
- `services/`: ビジネスロジックを含むサービス層
  - `valhalla-service.ts`: Valhalla API連携サービス
    - `generateRoute()`: ポイント配列から経路を生成
    - `decodePolyline()`: Valhallaのencoded polylineをデコード
    - `checkStatus()`: Valhallaサーバーのステータス確認
- `repositories/`: Kyselyを使ったデータベースアクセス層
- `models/`: データベーステーブルとAPIレスポンスの型定義
- `schemas/`: リクエスト/レスポンスのバリデーションスキーマ

**Frontend（packages/frontend/src/）**
- `components/`: 再利用可能なReactコンポーネント
  - **実装済みコンポーネント:**
    - `Sidebar.tsx`: モード切り替えと機能ボタン、ポイント一覧表示（並び替えボタン付き）
    - `PointEditModal.tsx`: ポイント編集モーダル（種別・コメント編集）
    - `MapClickHandler.tsx`: 地図クリックイベント処理（編集モード時のみ有効）
    - `PointMarker.tsx`: 地図上のポイントマーカー（ドラッグ・クリック対応）
    - `RouteLine.tsx`: 経路ライン表示
    - `CoordinateDisplay.tsx`: 座標・ズーム表示
    - `FitBounds.tsx`: 経路全体を画面に収める
    - `MessageDisplay.tsx`: 画面中央上部のメッセージ表示
- `pages/`: ルーティングに対応するページコンポーネント
- `hooks/`: カスタムReactフック
- `api/`: バックエンドAPIとの通信処理
  - `route-api.ts`: 経路保存・読み込み・生成API呼び出し
    - `generateRoute()`: Valhalla APIで経路を生成
    - `saveRoute()`: 経路データをファイルに保存
    - `loadRoute()`: 保存済み経路データを読み込み

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

**Valhalla環境について:**
- Dockerでローカル構築（`docker/valhalla/Dockerfile`）
- 関東地方のOSMデータを使用（初回ビルド時にダウンロード）
- APIエンドポイント: `http://localhost:8002`

**連携手順:**
1. **Serviceでの呼び出し**: `packages/backend/src/services/valhalla-service.ts`でValhalla APIを呼び出す
   - エンドポイント: `POST http://localhost:8002/route`
   - リクエスト形式:
     ```json
     {
       "locations": [
         {"lat": 35.681236, "lon": 139.767125},
         {"lat": 35.689729, "lon": 139.700294}
       ],
       "costing": "auto"
     }
     ```
2. **エラーハンドリング**: Valhalla APIのエラーを適切にハンドリング
   - 座標が範囲外の場合のエラー処理
   - タイムアウト処理
3. **レスポンスの変換**: Valhalla APIのレスポンス（GeoJSON）をアプリケーション用の型に変換
4. **経路データの保存**: 生成された経路をデータベースに保存

**Dockerビルド:**
- 初回ビルド: `docker-compose build valhalla`（10-20分程度）
- 起動: `docker-compose up -d`
- ステータス確認: `curl http://localhost:8002/status`

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
