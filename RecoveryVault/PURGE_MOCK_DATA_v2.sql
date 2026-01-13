-- ============================================
-- QUANTIX DATABASE PURGE SCRIPT v2.0.0
-- PRODUCTION_STRICT MODE: Clean Slate
-- ============================================

-- Step 1: Backup current state (for rollback if needed)
CREATE TABLE IF NOT EXISTS market_snapshot_backup_20260113 AS 
SELECT * FROM public.market_snapshot;

-- Step 2: TRUNCATE market_snapshot (remove all mock data)
TRUNCATE TABLE public.market_snapshot;

-- Step 3: Insert clean seed with DEGRADED status (waiting for real data)
INSERT INTO public.market_snapshot (
    symbol, 
    price, 
    data_quality, 
    ai_status,
    last_updated,
    created_at
)
VALUES 
('EURUSD=X', 0, 'DEGRADED', 'NEUTRAL', NOW(), NOW());

-- Step 4: Verify purge
SELECT 
    symbol,
    price,
    data_quality,
    ai_status,
    last_updated,
    'PURGED - Waiting for real data from Scanner' as status
FROM public.market_snapshot;

-- Step 5: Check ai_signals table for real historical data
SELECT 
    COUNT(*) as total_signals,
    COUNT(CASE WHEN status IN ('TP1_HIT', 'TP2_HIT') THEN 1 END) as wins,
    COUNT(CASE WHEN status = 'SL_HIT' THEN 1 END) as losses,
    ROUND(
        COUNT(CASE WHEN status IN ('TP1_HIT', 'TP2_HIT') THEN 1 END)::numeric / 
        NULLIF(COUNT(CASE WHEN status IN ('TP1_HIT', 'TP2_HIT', 'SL_HIT') THEN 1 END), 0) * 100,
        1
    ) as real_win_rate_percent
FROM public.ai_signals
WHERE symbol = 'EURUSD=X'
AND status IN ('TP1_HIT', 'TP2_HIT', 'SL_HIT');

-- ============================================
-- EXPECTED RESULTS:
-- - market_snapshot: 1 row with price=0, DEGRADED
-- - Scanner will populate with REAL data within 30s
-- - ai_signals: Historical real data preserved
-- ============================================
