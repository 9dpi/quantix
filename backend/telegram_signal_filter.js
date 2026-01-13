/**
 * Telegram Signal Filter - VIP Quality Control
 * Ensures only 1 signal per day with >95% confidence
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Track last broadcast date
let lastBroadcastDate = null;

/**
 * Check if we can broadcast a signal today
 * Rules:
 * 1. Only 1 signal per day
 * 2. Confidence must be >95%
 */
export async function canBroadcastSignal(confidence) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Rule 1: Check confidence threshold
    if (confidence <= 95) {
        console.log(`[SIGNAL_FILTER] ❌ Confidence ${confidence}% does not meet VIP threshold (>95%)`);
        return false;
    }

    // Rule 2: Check if already broadcasted today
    if (lastBroadcastDate === today) {
        console.log(`[SIGNAL_FILTER] ❌ Already broadcasted 1 signal today (${today}). Daily limit reached.`);
        return false;
    }

    // Check database for today's broadcasts (backup check)
    try {
        const { data, error } = await supabase
            .from('telegram_broadcasts')
            .select('*')
            .gte('created_at', `${today}T00:00:00Z`)
            .lt('created_at', `${today}T23:59:59Z`);

        if (error) {
            console.error('[SIGNAL_FILTER] Database check failed:', error);
            // Fail-safe: use in-memory check only
        } else if (data && data.length > 0) {
            console.log(`[SIGNAL_FILTER] ❌ Database confirms ${data.length} signal(s) already sent today.`);
            return false;
        }
    } catch (err) {
        console.error('[SIGNAL_FILTER] Error checking broadcast history:', err);
    }

    console.log(`[SIGNAL_FILTER] ✅ VIP Signal approved: ${confidence}% confidence, no broadcasts today.`);
    return true;
}

/**
 * Record that we've broadcasted a signal today
 */
export async function recordBroadcast(signalData) {
    const today = new Date().toISOString().split('T')[0];
    lastBroadcastDate = today;

    // Save to database for persistence
    try {
        const { error } = await supabase
            .from('telegram_broadcasts')
            .insert([{
                broadcast_date: today,
                signal_pair: signalData.pair,
                signal_action: signalData.action,
                confidence: signalData.agentDecision.confidence,
                created_at: new Date().toISOString()
            }]);

        if (error) {
            console.error('[SIGNAL_FILTER] Failed to record broadcast:', error);
        } else {
            console.log(`[SIGNAL_FILTER] 📝 Broadcast recorded for ${today}`);
        }
    } catch (err) {
        console.error('[SIGNAL_FILTER] Error recording broadcast:', err);
    }
}

/**
 * Get today's broadcast status
 */
export async function getTodayStatus() {
    const today = new Date().toISOString().split('T')[0];

    try {
        const { data, error } = await supabase
            .from('telegram_broadcasts')
            .select('*')
            .gte('created_at', `${today}T00:00:00Z`)
            .lt('created_at', `${today}T23:59:59Z`)
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
            return {
                hasBroadcast: true,
                signal: data[0]
            };
        }

        return {
            hasBroadcast: false,
            signal: null
        };
    } catch (err) {
        console.error('[SIGNAL_FILTER] Error getting today status:', err);
        return {
            hasBroadcast: lastBroadcastDate === today,
            signal: null
        };
    }
}

console.log('[SIGNAL_FILTER] VIP Quality Control Module loaded ✅');
console.log('[SIGNAL_FILTER] Rules: 1 signal/day, Confidence >95%');
