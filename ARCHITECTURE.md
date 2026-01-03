# アーキテクチャ詳細

## レイヤードアーキテクチャ（3層構造）

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

### 各層の責務

#### Routes（プレゼンテーション層）
- HTTPリクエストの受け取りとバリデーション
- レスポンスの整形と返却
- 認証・認可のチェック
- **禁止**: ビジネスロジックやDB直接アクセス

#### Services（ビジネスロジック層）
- ビジネスルールの実装
- トランザクション管理
- 複数Repositoryの組み合わせ
- 外部API連携（Valhalla等）
- **禁止**: HTTP依存のコード

#### Repositories（データアクセス層）
- Kyselyを使ったDBクエリ
- CRUD操作
- **禁止**: ビジネスロジック

### 依存関係ルール
- Routes → Services → Repositories の一方向のみ
- 下位層が上位層に依存してはいけない
- 同じ層同士の依存は最小限に

### データフロー例

```typescript
// 1. Route: リクエストを受け取る
app.post('/users', async (request, reply) => {
  const userData = request.body;
  const user = await userService.createUser(userData);
  return reply.status(201).send(user);
});

// 2. Service: ビジネスロジックを実行
async function createUser(userData: CreateUserDto) {
  const hashedPassword = await hash(userData.password);
  return await userRepository.insert({ ...userData, password: hashedPassword });
}

// 3. Repository: データベースアクセス
async function insert(user: User) {
  return await db.insertInto('users').values(user).returningAll().executeTakeFirst();
}
```

## データベース設計

### テーブル構成

```
users
├── id (UUID, PK)
├── email
├── password_hash
├── created_at
└── updated_at

routes
├── id (UUID, PK)
├── user_id (FK → users)
├── name
├── route_data (JSONB)
├── created_at
└── updated_at

points
├── id (UUID, PK)
├── route_id (FK → routes)
├── lat
├── lng
├── type ('start' | 'waypoint' | 'goal')
├── order
├── comment
├── created_at
└── updated_at
```

### 型定義

```typescript
interface Point {
  id: string;
  lat: number;
  lng: number;
  type: 'start' | 'waypoint' | 'goal';
  order: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

interface Route {
  id: string;
  user_id: string;
  name: string;
  route_data: object;
  created_at: string;
  updated_at: string;
}
```

## フロントエンド設計

### 画面モード

| モード | 目的 | 主な機能 |
|--------|------|---------|
| 通常モード | 経路閲覧 | 地図閲覧、ポイント表示、経路読み込み・保存 |
| 編集モード | 経路編集 | ポイント追加・移動・削除、自動経路生成 |

### ポイント種別の自動判定

1. 1番目のポイント → スタート
2. 2番目のポイント → ゴール
3. 3番目以降 → 中継地点（ゴールの直前に挿入）

### コンポーネント構成

```
App.tsx
├── Sidebar.tsx
│   ├── PointItem.tsx
│   └── SavedRouteList.tsx
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

## セキュリティ設計

### 認証（未実装）
- 将来: JWT認証を実装予定
- 現状: 仮ユーザーID（`TEMPORARY_USER_ID`）を使用

### 認可
- Repository層で必ず`user_id`でフィルタリング
- ユーザーは自分のデータのみアクセス可能

### バリデーション
- Fastifyスキーマバリデーション使用
- 座標: 緯度 -90〜90、経度 -180〜180
- SQLインジェクション対策: Kyselyパラメータバインディング
- XSS対策: Reactの自動エスケープ

## エラーハンドリング

### レスポンス形式

```typescript
{
  error: {
    message: "ユーザーフレンドリーなメッセージ",
    code: "ERROR_CODE",
    statusCode: 400
  }
}
```

### ルール
- 400系: クライアントエラー（詳細を返す）
- 500系: サーバーエラー（詳細は隠す）
- 全async処理でtry-catch必須
