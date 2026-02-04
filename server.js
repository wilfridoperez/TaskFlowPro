#!/usr/bin/env node
/**
 * Azure App Service Wrapper
 * Responds immediately to health checks while Next.js initializes
 */
const http = require('http');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 8080;
let appReady = false;

console.log(`[Wrapper] Starting health check server on port ${PORT}`);

// Create health check server that responds immediately
const server = http.createServer((req, res) => {
    console.log(`[Wrapper] ${req.method} ${req.url}`);

    // Health check endpoint responds immediately
    if (req.url === '/api/health' || req.url === '/health') {
        const status = appReady ? 200 : 503;
        const message = appReady
            ? { status: 'healthy', timestamp: new Date().toISOString(), app: 'running' }
            : { status: 'starting', timestamp: new Date().toISOString() };
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(message));
        return;
    }

    // Proxy other requests to Next.js on port 3000 if ready
    if (!appReady) {
        res.writeHead(503, { 'Content-Type': 'application/json', 'Retry-After': '10' });
        res.end(JSON.stringify({ error: 'Application is starting, please retry' }));
        return;
    }

    // Proxy to Next.js
    const proxyReq = http.request({
        hostname: 'localhost',
        port: 3000,
        path: req.url,
        method: req.method,
        headers: req.headers
    }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
        console.error(`[Wrapper] Proxy error: ${err.message}`);
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Service unavailable' }));
    });

    req.pipe(proxyReq);
});

server.listen(PORT, () => {
    console.log(`[Wrapper] Health check server listening on port ${PORT}`);
});

// Start Next.js on port 3000
console.log('[Wrapper] Starting Next.js application...');
const nextProcess = spawn('npx', ['next', 'start', '--port', '3000'], {
    env: { ...process.env, PORT: '3000', NODE_ENV: 'production' },
    stdio: 'inherit'
});

// Mark as ready after 15 seconds (give Next.js time to fully initialize)
setTimeout(() => {
    appReady = true;
    console.log('[Wrapper] Application marked as ready');
}, 15000);

nextProcess.on('error', (err) => {
    console.error(`[Wrapper] Next.js process error: ${err.message}`);
    process.exit(1);
});

nextProcess.on('exit', (code) => {
    console.error(`[Wrapper] Next.js process exited with code ${code}`);
    process.exit(code || 1);
});

// Handle shutdown
process.on('SIGTERM', () => {
    console.log('[Wrapper] SIGTERM received, shutting down gracefully...');
    nextProcess.kill('SIGTERM');
    server.close(() => {
        process.exit(0);
    });
});

