## 名称
- サービス名：通学路マップ
- プロジェクト名：school-route-mapper

## 目的
日本の小学校・中学校で毎年提出が必要な「通学路の地図」を、ユーザー登録なし・簡単操作で作成できるWebサービス。

## 特徴
- スタート・ゴール・中継地点を地図上に配置
- Valhalla APIによる道路沿い経路の自動生成（フロントエンドから直接呼び出し）
- ポイントごとのコメント追加機能
- バックエンド不要のシンプルな構成

## 基本方針
- ユーザー登録・ログインは行わない
- サーバーに個人データを保存しない
- 機能は「通学路地図作成と提出」に必要な最小限に絞る

## 技術スタック

- **言語**: TypeScript
- **フロントエンド**: React, Vite, React Leaflet
- **経路計算**: Valhalla (Docker) - フロントエンドから直接呼び出し
- **ツール**: Biome, Vitest

## プロジェクト構成

```
src/
├── components/    # Reactコンポーネント
│   ├── address/   # 住所検索関連
│   ├── map/       # 地図関連
│   ├── menu/      # メニュー関連
│   ├── point/     # ポイント関連
│   ├── route/     # 経路関連
│   └── welcome/   # ウェルカム画面
├── contexts/      # Context API
├── hooks/         # カスタムフック
├── api/           # APIクライアント（Valhalla、国土地理院ジオコーディング）
├── utils/         # ユーティリティ関数
├── constants/     # 定数
├── types/         # 型定義
└── styles/        # 共通スタイル（CSS Modules）
```

## デプロイ

- **フロントエンド**: GitHub Pages
- **Valhalla API**: Fly.io

## アーキテクチャ

フロントエンドのみの構成。経路計算はValhallaに直接リクエスト。

```
React App (GitHub Pages) → Valhalla API (Fly.io)
```

**特徴**:
- バックエンドなし
- データベースなし（経路はメモリ上で管理、JSONでエクスポート/インポート可能。ブラウザリロードでクリア）
- ユーザー認証なし

## コーディング規約

| 対象 | 規則 | 例 |
|------|------|-----|
| ファイル（TS） | kebab-case | `valhalla-service.ts` |
| ファイル（React） | PascalCase | `UserProfile.tsx` |
| 変数・関数 | camelCase | `generateRoute` |
| 定数 | UPPER_SNAKE_CASE | `VALHALLA_API_URL` |
| 型・クラス | PascalCase | `Point` |

- インデント: タブ、セミコロン: 必須、クォート: シングル
- `any`型禁止

## セキュリティ

- **認証**: 実装しない（個人利用前提）
- **データ保存**: XSSの危険性を鑑みてlocalStorageは使用しない
- **禁止**: dangerouslySetInnerHTML
- **JSONインポート**: バリデーション必須（`src/utils/validate-import.ts`）
  - ファイルサイズ上限: 1MB（UI側でチェック）
  - ルート件数上限: 100件
  - 必須フィールド・型・座標範囲・文字列長を検証

## よく使うコマンド

```bash
# 開発
npm run dev    # 開発サーバー起動

# テスト
npm test              # 全テスト実行（watchモード）
npm test -- --run     # 全テスト実行（単発）
npm test -- --coverage  # カバレッジ付きで実行

# Docker
docker-compose up -d valhalla  # Valhalla起動
```

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

## テスト

### 構成

- **フレームワーク**: Vitest（globals有効、jsdom環境）
- **テストライブラリ**: @testing-library/react, @testing-library/jest-dom, @testing-library/user-event
- **設定ファイル**: `vitest.config.ts`
- **セットアップ**: `src/test/setup.ts`（jest-domマッチャーの読み込み）
- **ヘルパー**: `src/test/helpers.ts`（`createTestPoint`, `createTestSavedRoute`）

### テストファイル配置

各ソースファイルと同じディレクトリに `*.test.ts` / `*.test.tsx` を配置する。

```
src/
├── api/
│   ├── valhalla-client.ts
│   └── valhalla-client.test.ts    # 同階層に配置
├── hooks/
│   ├── use-points.ts
│   └── use-points.test.ts
├── components/
│   └── point/
│       ├── PointItem.tsx
│       └── PointItem.test.tsx
└── test/
    ├── setup.ts                   # セットアップファイル
    └── helpers.ts                 # テストヘルパー
```

### テスト対象レイヤー

| レイヤー | 対象 | テスト手法 |
|---------|------|-----------|
| API | `src/api/` | `fetch`のモック、レスポンス検証 |
| ユーティリティ | `src/utils/` | 純粋関数のユニットテスト |
| フック | `src/hooks/` | `renderHook` + `act` |
| Context | `src/contexts/` | `renderHook` + ラッパー |
| コンポーネント | `src/components/` | `render` + `screen` + `userEvent` |

### モック手法

```typescript
// fetch モック
vi.stubGlobal('fetch', vi.fn());

// モジュールモック
vi.mock('../api/route-api', () => ({
  generateRoute: vi.fn(),
}));

// タイマーモック
vi.useFakeTimers();
vi.advanceTimersByTime(3000);
vi.useRealTimers();
```

### テスト作成時の注意

1. テストヘルパー（`src/test/helpers.ts`）のファクトリー関数を活用する
2. 非同期処理は `act` + `waitFor` で適切にラップする
3. CSS Modulesは `non-scoped` 設定のためクラス名をそのまま検証可能

## 開発時の注意

1. **座標バリデーション**: 緯度 20.4253〜45.5572（日本国内）、経度 122.9325〜153.9867（日本国内）
2. **エラーハンドリング**: 全async処理でtry-catch
3. **Valhalla API**: 開発時はViteプロキシ経由（`/api/valhalla` → `localhost:8002`）

## 参考リンク

- [React Leaflet](https://react-leaflet.js.org/)
- [Valhalla API](https://valhalla.github.io/valhalla/api/)
- [日本の緯度経度](https://www.gsi.go.jp/KOKUJYOHO/center.htm)
