-- Create telegram_broadcasts table for VIP signal tracking
-- Ensures only 1 signal per day with >95% confidence

CREATE TABLE IF NOT EXISTS public.telegram_broadcasts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    broadcast_date DATE NOT NULL,
    signal_pair VARCHAR(20) NOT NULL,
    signal_action VARCHAR(10) NOT NULL,
    confidence INTEGER NOT NULL CHECK (confidence > 95),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure only 1 broadcast per day
    UNIQUE(broadcast_date)
);

-- Create index for fast date lookups
CREATE INDEX IF NOT EXISTS idx_telegram_broadcasts_date 
ON public.telegram_broadcasts(broadcast_date DESC);

-- Add comment
COMMENT ON TABLE public.telegram_broadcasts IS 'VIP Telegram signal broadcast history - Max 1 signal/day with >95% confidence';

-- Grant access
GRANT SELECT, INSERT ON public.telegram_broadcasts TO anon, authenticated;
