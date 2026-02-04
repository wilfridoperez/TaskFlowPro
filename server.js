// Minimal server wrapper to ensure startup
const { spawn } = require('child_process');
const path = require('path');

console.log('[Wrapper] Starting Next.js application...');

const child = spawn('node', [
    require.resolve('next/dist/bin/next'),
    'start',
    '--port', process.env.PORT || '8080'
], {
    cwd: __dirname,
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'production'
    }
});

child.on('error', (err) => {
    console.error('[Wrapper] Failed to start Next.js:', err);
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.log('[Wrapper] SIGTERM received, killing child process');
    child.kill();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('[Wrapper] SIGINT received, killing child process');
    child.kill();
    process.exit(0);
});
