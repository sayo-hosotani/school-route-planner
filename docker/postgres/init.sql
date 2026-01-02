-- PostgreSQL初期化スクリプト
-- このスクリプトはPostgreSQLコンテナ起動時に自動実行される

-- UUID拡張機能を有効化（UUIDをデフォルト値として使用するため）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- タイムゾーンをJSTに設定
SET timezone = 'Asia/Tokyo';

-- データベースが存在することを確認
SELECT 'Database initialized successfully' AS status;
