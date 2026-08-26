#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const candidateFiles = ['apps/web/.env.local', 'apps/web/.env', 'apps/mobile/.env'];

function readVariable(file, name) {
  if (!fs.existsSync(file)) return undefined;
  const line = fs
    .readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .find((entry) => entry.trim().startsWith(`${name}=`));
  if (!line) return undefined;
  return line.slice(line.indexOf('=') + 1).trim().replace(/^(['"])(.*)\1$/, '$2');
}

const configuredUrl =
  process.env.API_BASE_URL ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  candidateFiles
    .map((file) => path.join(root, file))
    .map((file) => readVariable(file, 'API_BASE_URL') || readVariable(file, 'EXPO_PUBLIC_API_BASE_URL'))
    .find(Boolean);

if (!configuredUrl) {
  throw new Error(
    'Missing API base URL. Set API_BASE_URL or configure apps/web/.env.local or apps/mobile/.env.',
  );
}

export const API_BASE_URL = configuredUrl.replace(/\/+$/, '');
