-- =====================================================
-- QUANTIX AI - REAL DATA VERIFICATION
-- Purpose: Verify that system is using 100% real data
-- Created: 2026-01-13T12:27:00+07:00
-- =====================================================

-- CHECK 1: Verify market_snapshot has real data
SELECT 
    symbol,
    price,
    ai_status,
    confidence_score,
    data_quality,
    last_updated,
    EXTRACT(EPOCH FROM (NOW() - last_updated)) as age_seconds,
    CASE 
        WHEN EXTRACT(EPOCH FROM (NOW() - last_updated)) < 120 THEN '🟢 FRESH'
        WHEN EXTRACT(EPOCH FROM (NOW() - last_updated)) < 300 THEN '🟡 RECENT'
        ELSE '🔴 STALE'
    END as freshness_status
FROM public.market_snapshot
ORDER BY last_updated DESC;

-- CHECK 2: Verify no placeholder prices
SELECT 
    symbol,
    price,
    'WARNING: Possible mock data' as alert
FROM public.market_snapshot
WHERE 
    price IN (1.08450, 45250.00, 185.50, 1250.00) -- Our mock prices
    OR price = 0
    OR price IS NULL;

-- CHECK 3: Verify data quality
SELECT 
    data_quality,
    COUNT(*) as count,
    ROUND(AVG(confidence_score), 2) as avg_confidence
FROM public.market_snapshot
GROUP BY data_quality;

-- CHECK 4: Check for recent updates (should be within last 2 minutes)
SELECT 
    COUNT(*) as total_assets,
    COUNT(*) FILTER (WHERE EXTRACT(EPOCH FROM (NOW() - last_updated)) < 120) as fresh_count,
    COUNT(*) FILTER (WHERE EXTRACT(EPOCH FROM (NOW() - last_updated)) >= 120) as stale_count
FROM public.market_snapshot;

-- CHECK 5: Verify last_candle_data is populated
SELECT 
    symbol,
    jsonb_array_length(last_candle_data) as candle_count,
    last_candle_data->-1->>'c' as latest_close_price
FROM public.market_snapshot
WHERE last_candle_data IS NOT NULL;

-- =====================================================
-- EXPECTED RESULTS FOR 100% REAL DATA:
-- =====================================================
-- CHECK 1: All timestamps should be < 120 seconds old
-- CHECK 2: Should return 0 rows (no mock prices)
-- CHECK 3: data_quality should be 'GOOD'
-- CHECK 4: fresh_count should equal total_assets
-- CHECK 5: All symbols should have 4 candles
-- =====================================================
