-- =====================================================
-- QUANTIX AI v1.9.3 → SSOT MIGRATION SCHEMA
-- Created: 2026-01-13T12:02:00+07:00
-- Purpose: Create market_snapshot table for centralized data
-- =====================================================

-- Create market_snapshot table (SSOT for real-time market data)
CREATE TABLE IF NOT EXISTS market_snapshot (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL UNIQUE,
    current_price DECIMAL(12, 5) NOT NULL,
    open_price DECIMAL(12, 5),
    high_price DECIMAL(12, 5),
    low_price DECIMAL(12, 5),
    volume BIGINT,
    last_4_candles JSONB,  -- Store last 4 hourly candles for pattern matching
    rsi_14 DECIMAL(5, 2),
    ma_20 DECIMAL(12, 5),
    ma_50 DECIMAL(12, 5),
    data_quality VARCHAR(20) DEFAULT 'GOOD',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast symbol lookup
CREATE INDEX IF NOT EXISTS idx_market_snapshot_symbol ON market_snapshot(symbol);
CREATE INDEX IF NOT EXISTS idx_market_snapshot_updated ON market_snapshot(last_updated DESC);

-- Add comment for documentation
COMMENT ON TABLE market_snapshot IS 'Single Source of Truth for real-time market data - Updated by Scanner every 60s';
COMMENT ON COLUMN market_snapshot.last_4_candles IS 'Array of last 4 hourly candles in format [{o, h, l, c, v}, ...]';
COMMENT ON COLUMN market_snapshot.data_quality IS 'Data quality indicator: GOOD, STALE, or DEGRADED';

-- =====================================================
-- ROLLBACK SCRIPT (if needed)
-- =====================================================
-- DROP TABLE IF EXISTS market_snapshot CASCADE;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- SELECT * FROM market_snapshot ORDER BY last_updated DESC;
