// Simple Express wrapper to handle startup reliably
const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
let nextStarted = false;
let nextProcess = null;

// Health endpoint - responds immediately
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    app: 'running',
    next_started: nextStarted
  });
});

// Proxy all other requests to Next.js
app.all('*', (req, res) => {
  if (nextStarted) {
    // Forward to Next.js
    const proxyReq = require('http').request(
      {
        hostname: 'localhost',
        port: 3000,
        path: req.originalUrl,
        method: req.method,
        headers: req.headers
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      }
    );
    proxyReq.on('error', () => {
      res.status(503).json({ error: 'Next.js service unavailable' });
    });
    req.pipe(proxyReq);
  } else {
    res.status(503).json({ error: 'App starting...' });
  }
});

// Start the wrapper server
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Express Wrapper] Listening on port ${PORT}`);
  
  // Start Next.js in background
  console.log('[Wrapper] Starting Next.js...');
  nextProcess = spawn('node', [
    path.join(__dirname, 'node_modules/.bin/next'),
    'start',
    '--port', '3000'
  ], {
    stdio: ['ignore', 'inherit', 'inherit'],
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  });

  setTimeout(() => {
    nextStarted = true;
    console.log('[Wrapper] Next.js marked as started');
  }, 5000);

  nextProcess.on('error', (err) => {
    console.error('[Wrapper] Next.js error:', err);
  });

  nextProcess.on('exit', (code) => {
    console.error(`[Wrapper] Next.js exited with code ${code}`);
    process.exit(code || 1);
  });
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Wrapper] SIGTERM received');
  if (nextProcess) nextProcess.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[Wrapper] SIGINT received');
  if (nextProcess) nextProcess.kill();
    process.exit(0);
});
