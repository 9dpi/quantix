/**
 * ⏰ AUTOMATED SCHEDULER - GOLD RUSH PHASE 2
 * Purpose: Tự động chạy Gold data ingestion vào 16:00 và Full 10-year vào 20:00
 * 
 * Usage: 
 * - Windows: Task Scheduler
 * - Linux/Mac: cron job
 * - Or run manually: node scripts/scheduler.js
 */

import { spawn } from 'child_process';

const TASKS = [
    {
        name: 'Gold Rush - 3 Years',
        time: '16:00',
        command: 'npm',
        args: ['run', 'data:ingest:bulk', '--', '--years=3', '--assets=XAUUSD'],
        description: 'Nạp 3 năm dữ liệu Gold (XAU/USD)'
    },
    {
        name: 'Full 10-Year Ingestion',
        time: '20:00',
        command: 'npm',
        args: ['run', 'data:ingest:bulk', '--', '--years=10', '--assets=EURUSD,XAUUSD,GBPUSD'],
        description: 'Nạp 10 năm dữ liệu cho 3 cặp tiền'
    },
    {
        name: 'Market Pulse Broadcast (Morning)',
        time: '08:00',
        command: 'node',
        args: ['scripts/broadcast_market_pulse.js'],
        description: 'Gửi nhận định thị trường sáng'
    },
    {
        name: 'Market Pulse Broadcast (Noon)',
        time: '12:00',
        command: 'node',
        args: ['scripts/broadcast_market_pulse.js'],
        description: 'Gửi nhận định thị trường trưa'
    },
    {
        name: 'Market Pulse Broadcast (Afternoon)',
        time: '16:30', // Sau Gold Rush 30p
        command: 'node',
        args: ['scripts/broadcast_market_pulse.js'],
        description: 'Gửi nhận định thị trường chiều'
    },
    {
        name: 'Daily Trading Summary',
        time: '23:55',
        command: 'node',
        args: ['scripts/daily_summary.js'],
        description: 'Báo cáo tổng kết cuối ngày'
    }
];

function getCurrentTime() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function runTask(task) {
    console.log(`\n🚀 Executing: ${task.name}`);
    console.log(`   Description: ${task.description}`);
    console.log(`   Command: ${task.command} ${task.args.join(' ')}\n`);

    const process = spawn(task.command, task.args, {
        stdio: 'inherit',
        shell: true
    });

    process.on('close', (code) => {
        if (code === 0) {
            console.log(`\n✅ ${task.name} completed successfully!`);
        } else {
            console.error(`\n❌ ${task.name} failed with code ${code}`);
        }
    });
}

function checkSchedule() {
    const currentTime = getCurrentTime();

    TASKS.forEach(task => {
        if (currentTime === task.time) {
            runTask(task);
        }
    });
}

// Main loop - check every minute
console.log('⏰ Scheduler started. Monitoring tasks...\n');
TASKS.forEach(task => {
    console.log(`📅 ${task.name} scheduled at ${task.time}`);
});
console.log('\n⏳ Waiting for scheduled time...\n');

// Check immediately on start
checkSchedule();

// Then check every minute
setInterval(checkSchedule, 60000);
