-- =====================================================
-- QUANTIX AI - SSOT IMPLEMENTATION STEP 1
-- CREATE market_snapshot TABLE
-- Created: 2026-01-13T12:06:00+07:00
-- Purpose: Single Source of Truth for all market data
-- =====================================================

-- Drop existing table if you need to recreate (CAREFUL!)
-- DROP TABLE IF EXISTS public.market_snapshot CASCADE;

-- Create the SSOT table
CREATE TABLE IF NOT EXISTS public.market_snapshot (
    symbol TEXT PRIMARY KEY,
    price DECIMAL(12, 5) NOT NULL,
    change_24h DECIMAL(8, 4),
    high_24h DECIMAL(12, 5),
    low_24h DECIMAL(12, 5),
    volume BIGINT,
    last_candle_data JSONB,  -- Store last 4 hourly candles: [{o, h, l, c, v}, ...]
    ai_status TEXT CHECK (ai_status IN ('BULLISH', 'BEARISH', 'NEUTRAL', 'ANALYZING')),
    confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
    rsi_14 DECIMAL(5, 2),
    ma_20 DECIMAL(12, 5),
    ma_50 DECIMAL(12, 5),
    data_quality TEXT DEFAULT 'GOOD' CHECK (data_quality IN ('GOOD', 'STALE', 'DEGRADED')),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for lightning-fast queries (<5ms)
CREATE INDEX IF NOT EXISTS idx_market_snapshot_symbol ON public.market_snapshot(symbol);
CREATE INDEX IF NOT EXISTS idx_market_snapshot_updated ON public.market_snapshot(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_market_snapshot_ai_status ON public.market_snapshot(ai_status);

-- Enable Row Level Security (RLS) for production safety
ALTER TABLE public.market_snapshot ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" 
ON public.market_snapshot 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Create policy to allow read access for anon users (for public API)
CREATE POLICY "Allow read access for anon users" 
ON public.market_snapshot 
FOR SELECT 
TO anon 
USING (true);

-- Enable Realtime (OPTIONAL - for instant updates to Bot)
-- Uncomment the line below if you want real-time subscriptions
-- ALTER PUBLICATION supabase_realtime ADD TABLE market_snapshot;

-- Add helpful comments for documentation
COMMENT ON TABLE public.market_snapshot IS 'SSOT: Single Source of Truth for all market data. Updated by Scanner every 60s.';
COMMENT ON COLUMN public.market_snapshot.symbol IS 'Asset symbol (e.g., EURUSD=X, BTC-USD, AAPL)';
COMMENT ON COLUMN public.market_snapshot.last_candle_data IS 'Last 4 hourly candles in JSONB format: [{o, h, l, c, v}, ...]';
COMMENT ON COLUMN public.market_snapshot.ai_status IS 'AI analysis result: BULLISH, BEARISH, NEUTRAL, or ANALYZING';
COMMENT ON COLUMN public.market_snapshot.confidence_score IS 'AI confidence score (0-100)';
COMMENT ON COLUMN public.market_snapshot.data_quality IS 'Data freshness: GOOD (<2min), STALE (2-5min), DEGRADED (>5min)';

-- Insert initial placeholder data for the 4 monitored assets
INSERT INTO public.market_snapshot (symbol, price, ai_status, confidence_score, data_quality)
VALUES 
    ('EURUSD=X', 1.08450, 'ANALYZING', 0, 'STALE'),
    ('BTC-USD', 45000.00, 'ANALYZING', 0, 'STALE'),
    ('AAPL', 185.50, 'ANALYZING', 0, 'STALE'),
    ('VN30F1M', 1250.00, 'ANALYZING', 0, 'STALE')
ON CONFLICT (symbol) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'market_snapshot' 
ORDER BY ordinal_position;

-- Check initial data
SELECT 
    symbol, 
    price, 
    ai_status, 
    confidence_score,
    data_quality,
    last_updated
FROM public.market_snapshot
ORDER BY symbol;

-- Check indexes
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'market_snapshot';

-- =====================================================
-- ROLLBACK SCRIPT (if needed)
-- =====================================================
-- WARNING: This will delete all data in market_snapshot!
-- 
-- DROP TABLE IF EXISTS public.market_snapshot CASCADE;
-- 
-- Then restore from backup:
-- git checkout v1.9.3-pre-ssot
-- git push origin main --force

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- If you see 4 rows in the verification query above,
-- the table is ready for SSOT implementation!
-- 
-- Next step: Update Scanner to write to this table
-- =====================================================
