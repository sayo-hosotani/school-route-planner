# Route Planner

OpenStreetMap上で経路を作成できるWebアプリケーション（フロントエンドのみ）。

> 詳細: [ARCHITECTURE.md](./ARCHITECTURE.md) | [DEVELOPMENT.md](./DEVELOPMENT.md)

## 技術スタック

- **言語**: TypeScript
- **フロントエンド**: React, Vite, React Leaflet
- **経路計算**: Valhalla (Docker) - フロントエンドから直接呼び出し
- **ツール**: Biome, Vitest

## プロジェクト構成

```
src/
├── components/    # Reactコンポーネント
├── contexts/      # Context API
├── hooks/         # カスタムフック
├── api/           # APIクライアント（Valhalla）
├── utils/         # ユーティリティ関数
├── constants/     # 定数
├── types/         # 型定義
└── styles/        # 共通スタイル（CSS Modules）
```

## アーキテクチャ

フロントエンドのみの構成。経路計算はValhallaに直接リクエスト。

```
React App → Valhalla API (Docker)
```

**特徴**:
- バックエンドなし
- データベースなし（経路はローカルストレージで管理、JSONでエクスポート/インポート可能）
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

- **認証**: 実装しない（ローカル利用前提）
- **禁止**: dangerouslySetInnerHTML

## よく使うコマンド

```bash
# 開発
npm run dev    # 開発サーバー起動

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

## 開発時の注意

1. **座標バリデーション**: 緯度 -90〜90、経度 -180〜180
2. **エラーハンドリング**: 全async処理でtry-catch
3. **Valhalla API**: 開発時はViteプロキシ経由（`/api/valhalla` → `localhost:8002`）

## 参考リンク

- [React Leaflet](https://react-leaflet.js.org/)
- [Valhalla API](https://valhalla.github.io/valhalla/api/)
