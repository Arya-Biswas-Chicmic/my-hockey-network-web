#!/usr/bin/env node
import fs from 'node:fs';

const findings = [];
const manifest = JSON.parse(fs.readFileSync('package.json', 'utf8'));

if (!manifest.packageManager?.startsWith('pnpm@')) findings.push('packageManager must pin pnpm');
if (!fs.existsSync('pnpm-lock.yaml')) findings.push('pnpm-lock.yaml is missing');
for (const lockfile of ['yarn.lock', 'package-lock.json', 'bun.lock', 'bun.lockb']) {
  if (fs.existsSync(lockfile)) findings.push(`${lockfile} is not allowed; this is a pnpm-only repository`);
}

if (findings.length) {
  console.error('Package manager check failed:\n' + findings.map((finding) => `- ${finding}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log('Package manager check passed (pnpm only).');
}
