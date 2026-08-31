#!/usr/bin/env node

if (process.env.VERCEL === '1' || process.env.CI === 'true' || process.env.CI) {
  process.exit(0);
}

const userAgent = process.env.npm_config_user_agent;

if (userAgent && !userAgent.startsWith('pnpm/')) {
  console.error('This repository uses pnpm only. Run pnpm install and commit only pnpm-lock.yaml.');
  process.exitCode = 1;
}

