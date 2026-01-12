// Quick check script to verify deployment
import https from 'https';

const url = 'https://9dpi.github.io/ai-forecast-demo/?t=' + Date.now();

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('🔍 Checking Deployment Status...\n');

        // Check for V1.9.0
        if (data.includes('V1.9')) {
            console.log('✅ V1.9.0 DETECTED - Latest version deployed!');
        } else {
            console.log('❌ V1.9.0 NOT FOUND - Old version still active');
        }

        // Check for large font metrics
        if (data.includes('2.5rem')) {
            console.log('✅ MASSIVE font size (2.5rem) detected');
        } else {
            console.log('⚠️  Large font metrics not found');
        }

        // Check for fallback mechanism
        if (data.includes('fallback') || data.includes('Yahoo')) {
            console.log('✅ Fallback mechanism code detected');
        }

        console.log('\n📊 Deployment Status: ' + (data.includes('V1.9') ? 'SUCCESS ✅' : 'PENDING ⏳'));
    });
}).on('error', (err) => {
    console.error('❌ Error checking deployment:', err.message);
});
