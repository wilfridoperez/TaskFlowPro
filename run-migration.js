#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('Starting Prisma migration...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

try {
    // Run the migration
    const output = execSync('npx prisma migrate deploy --skip-generate', {
        cwd: process.cwd(),
        stdio: 'inherit',
        timeout: 30000, // 30 second timeout
        env: process.env
    });

    console.log('Migration completed successfully');
    process.exit(0);
} catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
}
