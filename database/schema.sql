-- 既存のテーブルをクリーンアップ
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS config CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- UUID生成の拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- updated_at列を自動更新するための関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Usersテーブル
CREATE TABLE users (
    id TEXT PRIMARY KEY,                    -- Discord User ID
    pizza_coins INTEGER NOT NULL DEFAULT 0, -- 保有コイン数
    is_disabled BOOLEAN NOT NULL DEFAULT FALSE, -- アカウント無効化フラグ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Users updated_atトリガー
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Transactionsテーブル
CREATE TABLE transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id TEXT NOT NULL REFERENCES users(id),
    receiver_id TEXT NOT NULL REFERENCES users(id),
    amount INTEGER NOT NULL CHECK (amount > 0),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- 取引の整合性チェック
    CONSTRAINT different_users CHECK (sender_id != receiver_id),
    CONSTRAINT valid_amount CHECK (amount > 0)
);

-- トランザクションのインデックス
CREATE INDEX idx_transactions_sender_id ON transactions(sender_id);
CREATE INDEX idx_transactions_receiver_id ON transactions(receiver_id);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp);

-- Configテーブル (シングルトン)
CREATE TABLE config (
    id BOOLEAN PRIMARY KEY DEFAULT TRUE,
    coins_per_message INTEGER NOT NULL DEFAULT 1 CHECK (coins_per_message > 0),
    admin_ids TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- 設定テーブルは1行のみ
    CONSTRAINT singleton_config CHECK (id)
);

-- Config updated_atトリガー
CREATE TRIGGER update_config_updated_at
    BEFORE UPDATE ON config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 初期データの投入
INSERT INTO config (coins_per_message, admin_ids) 
VALUES (1, '{}')
ON CONFLICT (id) DO NOTHING;

-- Row Level Security (RLS)の設定
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

-- ポリシーの設定
-- Users
CREATE POLICY "Allow read access to users for all" ON users
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for service role only" ON users
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Enable update for service role only" ON users
    FOR UPDATE USING (auth.role() = 'service_role');

-- Transactions
CREATE POLICY "Allow read access to transactions for all" ON transactions
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for service role only" ON transactions
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Config
CREATE POLICY "Allow read access to config for all" ON config
    FOR SELECT USING (true);

CREATE POLICY "Enable update for service role only" ON config
    FOR UPDATE USING (auth.role() = 'service_role');

-- 検証用のクエリ
SELECT * FROM config;
SELECT * FROM users;
SELECT * FROM transactions;