-- QUANTIX CORE AI - DATABASE SCHEMA RECOVERY
-- Target: Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Bảng lưu trữ tín hiệu vàng từ Quantix Core
CREATE TABLE IF NOT EXISTS ai_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    symbol TEXT,                 -- Cặp tiền (Vàng/Forex)
    signal_type TEXT,            -- 'LONG' or 'SHORT'
    predicted_close NUMERIC,
    entry_price NUMERIC,
    tp1_price NUMERIC,
    tp2_price NUMERIC,
    sl_price NUMERIC,
    current_price NUMERIC,
    confidence_score NUMERIC,    -- Chỉ số tin cậy 85%+
    signal_status TEXT,          -- 'WAITING', 'ENTRY_HIT', 'TP1_HIT', 'TP2_HIT', 'SL_HIT'
    is_published BOOLEAN DEFAULT TRUE,
    last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bảng lưu dữ liệu giá thô (Market Data)
CREATE TABLE IF NOT EXISTS market_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol TEXT,
    timestamp_utc TIMESTAMP WITH TIME ZONE,
    open NUMERIC,
    high NUMERIC,
    low NUMERIC,
    close NUMERIC,
    volume NUMERIC,
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Bảng Cache để tối ưu chi phí (Semantic Caching)
CREATE TABLE IF NOT EXISTS pattern_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vector_hash TEXT UNIQUE,
    results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Bảng Quản lý Hội viên (Dành cho Stripe)
CREATE TABLE IF NOT EXISTS members (
    user_id UUID PRIMARY KEY, -- Thường liên kết với auth.users(id)
    stripe_customer_id TEXT,
    subscription_status TEXT,   -- 'active', 'canceled'
    plan_tier TEXT              -- 'standard', 'premium', 'enterprise'
);

-- Bật tính năng tìm kiếm Vector cho Micro-Backtest v1.9
CREATE EXTENSION IF NOT EXISTS vector;
