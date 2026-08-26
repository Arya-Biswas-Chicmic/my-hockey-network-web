#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const workspaceRoot = process.cwd();
const sourceRoots = [
  path.join(workspaceRoot, 'apps/web/src'),
  path.join(workspaceRoot, 'apps/mobile/src'),
];

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(absolutePath);
    return /\.(ts|tsx)$/.test(entry.name) ? [absolutePath] : [];
  });
}

for (const sourceRoot of sourceRoots) {
  for (const file of sourceFiles(sourceRoot)) {
    const original = fs.readFileSync(file, 'utf8');
    const migrated = original.replace(
      /(\b(?:from|import)\s*\(?\s*)(['"])(\.\.?\/[^'"]+)\2/g,
      (match, prefix, quote, specifier) => {
        const target = path.resolve(path.dirname(file), specifier);
        const relativeTarget = path.relative(sourceRoot, target);
        if (relativeTarget.startsWith('..') || path.isAbsolute(relativeTarget)) return match;
        return `${prefix}${quote}@/${relativeTarget.split(path.sep).join('/')}${quote}`;
      },
    );
    if (migrated !== original) fs.writeFileSync(file, migrated);
  }
}

console.log('Application-relative imports migrated to the @/ source alias.');
