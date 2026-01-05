-- 初期データベーススキーマ
-- 作成日: 2026-01-02
-- 更新日: 2026-01-04 (created_atトリガー追加)

--------------------------------------------------------------------------------
-- 1. 拡張機能
--------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------------------------------------
-- 2. トリガー関数
--------------------------------------------------------------------------------

-- created_at自動設定用（INSERT時）
CREATE OR REPLACE FUNCTION set_created_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- updated_at自動更新用（UPDATE時）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

--------------------------------------------------------------------------------
-- 3. テーブル作成
--------------------------------------------------------------------------------

-- usersテーブル
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- routesテーブル
CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    route_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- pointsテーブル
CREATE TABLE IF NOT EXISTS points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
    lat DOUBLE PRECISION NOT NULL CHECK (lat >= -90 AND lat <= 90),
    lng DOUBLE PRECISION NOT NULL CHECK (lng >= -180 AND lng <= 180),
    type VARCHAR(20) NOT NULL CHECK (type IN ('start', 'waypoint', 'goal')),
    "order" INTEGER NOT NULL CHECK ("order" >= 0),
    comment TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

--------------------------------------------------------------------------------
-- 4. インデックス
--------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_routes_user_id ON routes(user_id);
CREATE INDEX IF NOT EXISTS idx_points_user_id ON points(user_id);
CREATE INDEX IF NOT EXISTS idx_points_route_id ON points(route_id);

--------------------------------------------------------------------------------
-- 5. トリガー設定
--------------------------------------------------------------------------------

-- users
CREATE TRIGGER set_users_created_at BEFORE INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION set_created_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- routes
CREATE TRIGGER set_routes_created_at BEFORE INSERT ON routes
    FOR EACH ROW EXECUTE FUNCTION set_created_at_column();
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- points
CREATE TRIGGER set_points_created_at BEFORE INSERT ON points
    FOR EACH ROW EXECUTE FUNCTION set_created_at_column();
CREATE TRIGGER update_points_updated_at BEFORE UPDATE ON points
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

--------------------------------------------------------------------------------
-- 完了
--------------------------------------------------------------------------------
SELECT 'Initial schema created successfully' AS status;
