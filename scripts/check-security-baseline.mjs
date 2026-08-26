#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const findings = [];
const sourceExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.json', '.toml']);
const ignoredDirectories = new Set(['node_modules', 'dist', 'coverage', 'build', '.next', '.git', '__tests__']);
const allowedNativeFetchFiles = new Set([
  'packages/core/src/api/mediaApi.ts', // Required for direct upload to a backend-issued signed storage URL.
  'apps/web/src/app/api/backend/[...path]/route.ts', // Same-origin server BFF; browser features still use the shared client.
  'apps/web/src/infrastructure/server/public-profile.ts', // Server-only, credential-free read for the public (public)/players/[id] page; must not use the cookie-bearing client.
]);
const bannedPatterns = [
  [/logCurlCommand/, 'credential-bearing cURL logger'],
  [/formatCurlCommand/, 'credential-bearing cURL formatter'],
  [/user_auth_token/, 'hard-coded authentication token'],
  [/mhn_access_token/, 'browser-readable access-token persistence'],
  [/mhn_at_(?:local|session)/, 'browser-readable access-token persistence'],
  [/localStorage\.setItem\s*\(\s*['"][^'"]*(?:access|refresh|auth)[^'"]*['"]/, 'browser-readable credential persistence'],
  [/sessionStorage\.setItem\s*\(\s*['"][^'"]*(?:access|refresh|auth)[^'"]*['"]/, 'browser-readable credential persistence'],
  [/localStorage\.clear\s*\(/, 'unscoped browser storage clearing'],
  [/console\.log\s*\(/, 'production debug logging'],
  [/console\.info\s*\(/, 'production debug logging'],
  [/https?:\/\/[^\s'"/]*ngrok[^\s'"]*/i, 'hard-coded temporary API origin'],
];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(absolutePath);
      continue;
    }
    if (!sourceExtensions.has(path.extname(entry.name))) continue;
    const relativePath = path.relative(root, absolutePath);
    const text = fs.readFileSync(absolutePath, 'utf8');
    if (/\bfetch\s*\(/.test(text) && !allowedNativeFetchFiles.has(relativePath)) {
      findings.push(`${relativePath}: native fetch must go through the shared API client`);
    }
    for (const [pattern, label] of bannedPatterns) {
      if (pattern.test(text)) findings.push(`${relativePath}: ${label}`);
    }
  }
}

walk(path.join(root, 'apps'));
walk(path.join(root, 'packages'));

for (const manifestPath of ['package.json', 'apps/web/package.json', 'apps/mobile/package.json']) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, manifestPath), 'utf8'));
  if (manifest.dependencies?.axios || manifest.devDependencies?.axios) {
    findings.push(`${manifestPath}: Axios is not part of the approved HTTP architecture`);
  }
}

const deploymentFiles = [
  'vercel.json',
  'apps/web/vercel.json',
  'apps/web/netlify.toml',
  'apps/web/render.yaml',
  'apps/web/public/_redirects',
  'apps/web/vite.config.ts',
];
for (const relativePath of deploymentFiles) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) continue;
  const text = fs.readFileSync(absolutePath, 'utf8');
  if (/https?:\/\/[^\s'"/]*ngrok[^\s'"]*/i.test(text)) {
    findings.push(`${relativePath}: hard-coded temporary API origin`);
  }
}

for (const packageName of ['core', 'api-client', 'auth', 'domain', 'validation']) {
  const packageRoot = path.join(root, 'packages', packageName, 'src');
  const platformGlobalPattern = /\b(?:window|document|localStorage|sessionStorage)\b|import\.meta|process\.env/;
  const files = [];
  const collect = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) collect(absolutePath);
      else if (sourceExtensions.has(path.extname(entry.name))) files.push(absolutePath);
    }
  };
  collect(packageRoot);
  for (const file of files) {
    if (platformGlobalPattern.test(fs.readFileSync(file, 'utf8'))) {
      findings.push(`${path.relative(root, file)}: platform global in shared code`);
    }
  }
}

const forbiddenDuplicates = [
  'apps/web/src/api/client.ts',
  'apps/web/src/api/authApi.ts',
  'apps/web/src/services/auth-session.ts',
];
for (const relativePath of forbiddenDuplicates) {
  if (fs.existsSync(path.join(root, relativePath))) findings.push(`${relativePath}: retired duplicate restored`);
}

for (const environmentFile of ['apps/web/.env.local', 'apps/mobile/.env']) {
  const absolutePath = path.join(root, environmentFile);
  if (!fs.existsSync(absolutePath)) continue;
  try {
    execFileSync('git', ['check-ignore', '--quiet', environmentFile], { cwd: root });
  } catch {
    findings.push(`${environmentFile}: runtime environment file is not ignored by Git`);
  }
}

if (findings.length > 0) {
  console.error('Security baseline failed:\n' + findings.map((finding) => `- ${finding}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log('Security baseline passed.');
}
