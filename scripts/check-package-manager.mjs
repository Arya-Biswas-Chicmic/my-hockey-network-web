#!/usr/bin/env node
import fs from 'node:fs';

const findings = [];
const manifest = JSON.parse(fs.readFileSync('package.json', 'utf8'));

if (!manifest.packageManager?.startsWith('npm@')) findings.push('packageManager must pin npm');
if (!fs.existsSync('package-lock.json')) findings.push('package-lock.json is missing');
for (const lockfile of ['yarn.lock', 'pnpm-lock.yaml', 'bun.lock', 'bun.lockb']) {
  if (fs.existsSync(lockfile)) findings.push(`${lockfile} is not allowed; this is an npm-only repository`);
}

if (findings.length) {
  console.error('Package manager check failed:\n' + findings.map((finding) => `- ${finding}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log('Package manager check passed (npm only).');
}
