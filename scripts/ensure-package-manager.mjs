#!/usr/bin/env node

const userAgent = process.env.npm_config_user_agent;

if (userAgent && !userAgent.startsWith('npm/')) {
  console.error('This repository uses npm only. Run npm install and commit only package-lock.json.');
  process.exitCode = 1;
}
