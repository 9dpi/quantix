import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function checkLatestPriceUpdate() {
    console.log('🔍 Verifying Real-time Price Update (12/01/2026)...\n');

    const { data, error } = await supabase
        .from('ai_signals')
        .select('id, symbol, current_price, last_checked_at, signal_status')
        .limit(1);

    if (error) {
        console.error('❌ Error:', error.message);
        return;
    }

    if (data && data.length > 0) {
        const signal = data[0];
        const lastCheck = new Date(signal.last_checked_at).toLocaleString();

        console.log(`✅ Signal ID: ${signal.id}`);
        console.log(`   Symbol: ${signal.symbol}`);
        console.log(`   🔥 Current Price: ${signal.current_price}`);
        console.log(`   🕒 Last Checked: ${lastCheck}`);
        console.log(`   Status: ${signal.signal_status}`);

        // Verify if update is recent (within last 5 minutes)
        const diff = Date.now() - new Date(signal.last_checked_at).getTime();
        if (diff < 5 * 60 * 1000) {
            console.log('\n✅ SYSTEM IS LIVE: Price updated just now!');
        } else {
            console.log('\n⚠️ WARNING: Price update seems old.');
        }
    } else {
        console.log('❌ No active signals found to check.');
    }
}

checkLatestPriceUpdate();
