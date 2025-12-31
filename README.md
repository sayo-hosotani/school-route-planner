# Route Planner

OpenStreetMapを使った経路プランニングアプリケーション。

## 特徴

- スタート・ゴール・中継地点を地図上に配置
- Valhalla APIによる道路沿い経路の自動生成
- ポイントごとのコメント追加機能
- 経路の保存・読み込み機能

## 技術スタック

- **フロントエンド**: React + TypeScript + Vite + React Leaflet
- **バックエンド**: Fastify + TypeScript
- **データベース**: PostgreSQL
- **経路計算**: Valhalla (Docker)
- **地図タイル**: 国土地理院 地理院タイル

## セットアップ

### 1. 環境変数の設定

`.env.example`をコピーして`.env`を作成:

```bash
cp .env.example .env
```

必要に応じて`.env`の値を編集してください。

### 2. Docker環境の起動

PostgreSQLとValhallaをDockerで起動:

```bash
docker-compose up -d
```

**初回起動時の注意:**
- Valhallaは初回起動時に地図データのダウンロードとタイル生成を行います
- 関東地方のデータで約10-20分かかります（データサイズ: 約500MB-1GB）
- `docker-compose logs -f valhalla`でログを確認できます
- タイル生成が完了すると`Service started successfully`と表示されます

### 3. 依存パッケージのインストール

```bash
npm install
```

### 4. アプリケーションの起動

開発モードで起動:

```bash
npm run dev:all
```

- **フロントエンド**: http://localhost:5173
- **バックエンド**: http://localhost:3000
- **Valhalla API**: http://localhost:8002

## 開発コマンド

```bash
# フロントエンドとバックエンドを同時起動
npm run dev:all

# フロントエンドのみ起動
npm run dev:frontend

# バックエンドのみ起動
npm run dev:backend

# テスト実行
npm run test

# リンター実行
npm run lint

# フォーマッター実行
npm run format
```

## Docker コマンド

```bash
# サービス起動
docker-compose up -d

# サービス停止
docker-compose down

# ログ確認
docker-compose logs -f valhalla
docker-compose logs -f postgres

# Valhallaのステータス確認
curl http://localhost:8002/status

# Valhalla経路生成テスト（東京駅→新宿駅の例）
curl http://localhost:8002/route \
  -H "Content-Type: application/json" \
  -d '{
    "locations": [
      {"lat": 35.681236, "lon": 139.767125},
      {"lat": 35.689729, "lon": 139.700294}
    ],
    "costing": "auto"
  }'
```

## Valhallaの地図データについて

現在の設定では関東地方のデータを使用しています。範囲を変更する場合は`docker-compose.yml`の`tile_urls`を編集:

```yaml
# 日本全国（約2-3GB、処理に30-60分）
tile_urls: https://download.geofabrik.de/asia/japan-latest.osm.pbf

# 関東地方のみ（約500MB-1GB、処理に10-20分）- デフォルト
tile_urls: https://download.geofabrik.de/asia/japan/kanto-latest.osm.pbf

# 東京都のみ（約100-200MB、処理に5分程度）
tile_urls: https://download.geofabrik.de/asia/japan/kanto/tokyo-latest.osm.pbf
```

変更後、ボリュームを削除して再起動:

```bash
docker-compose down -v
docker-compose up -d
```

## プロジェクト構造

詳細は[CLAUDE.md](./CLAUDE.md)を参照してください。

## トラブルシューティング

### Valhallaが起動しない

1. ログを確認: `docker-compose logs -f valhalla`
2. ディスク容量を確認（最低5GB以上の空き容量が必要）
3. ボリュームを削除して再起動: `docker-compose down -v && docker-compose up -d`

### 経路生成がエラーになる

1. Valhallaのステータス確認: `curl http://localhost:8002/status`
2. タイル生成が完了しているか確認
3. 指定した座標が地図データの範囲内か確認（関東地方外の場合はエラー）


