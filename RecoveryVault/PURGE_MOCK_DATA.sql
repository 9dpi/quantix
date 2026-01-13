-- =====================================================
-- QUANTIX AI - DATA PURGE & CLEANSE
-- Purpose: Remove all mock/test data and prepare for real data
-- Created: 2026-01-13T12:27:00+07:00
-- =====================================================

-- STEP 1: Clear all mock data from market_snapshot
TRUNCATE TABLE public.market_snapshot;

-- STEP 2: (Optional) Remove old test signals
-- Uncomment if you want to clean old test signals
-- DELETE FROM public.ai_signals WHERE created_at < NOW() - INTERVAL '1 day';

-- STEP 3: Add data quality constraints
ALTER TABLE public.market_snapshot 
ALTER COLUMN data_quality SET DEFAULT 'GOOD';

-- Add constraint: price must be positive
ALTER TABLE public.market_snapshot 
ADD CONSTRAINT check_positive_price CHECK (price > 0);

-- Add constraint: confidence_score must be valid
ALTER TABLE public.market_snapshot 
ADD CONSTRAINT check_valid_confidence CHECK (confidence_score >= 0 AND confidence_score <= 100);

-- STEP 4: Create function to detect stale data
CREATE OR REPLACE FUNCTION is_data_stale(last_update TIMESTAMP WITH TIME ZONE)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXTRACT(EPOCH FROM (NOW() - last_update)) > 300; -- 5 minutes
END;
$$ LANGUAGE plpgsql;

-- STEP 5: Verify table is clean
SELECT 
    COUNT(*) as row_count,
    'Table should be empty (0 rows)' as status
FROM public.market_snapshot;

-- =====================================================
-- POST-PURGE VERIFICATION
-- =====================================================
-- After running this script:
-- 1. Table should be empty
-- 2. Constraints are in place
-- 3. Scanner will populate with REAL data on next cycle
-- 
-- Expected result: 0 rows
-- Next step: Restart Scanner service on Railway
-- =====================================================
