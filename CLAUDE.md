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
