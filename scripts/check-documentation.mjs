#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredDocuments = [
  'docs/FRONTEND_ARCHITECTURE.md',
  'docs/PROJECT_CONTEXT.md',
  'docs/codebase_architecture_guide.md',
  'docs/IMPLEMENTATION_STATUS.md',
  'docs/SECURITY_REGISTER.md',
  'docs/TESTING_STRATEGY.md',
  'docs/DOCUMENTATION_POLICY.md',
  'docs/ENVIRONMENT_CONFIGURATION.md',
  'docs/COMPONENT_CATALOG.md',
  'docs/NAVIGATION.md',
  'docs/FRONTEND_DEVELOPMENT_GUIDELINES.md',
  'docs/NEXTJS_MIGRATION_PLAN.md',
  'docs/WEB_SEO_AND_RENDERING_STRATEGY.md',
  'docs/THIRD_PARTY_AND_DEPENDENCY_POLICY.md',
  'docs/ADMIN_PANEL_ALIGNMENT.md',
  'docs/MOBILE_SETUP.md',
];
const maintainedDocuments = new Set(requiredDocuments);
const implementationPrefixes = ['apps/', 'packages/', 'scripts/'];
const rootImplementationFiles = new Set([
  'package.json',
  'package-lock.json',
  'vitest.config.mts',
  'tsconfig.json',
  '.gitignore',
]);

const failures = [];
for (const relativePath of requiredDocuments) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`Missing required document: ${relativePath}`);
    continue;
  }
  const documentText = fs.readFileSync(absolutePath, 'utf8');
  if (!/Last reviewed:\s*\d{4}-\d{2}-\d{2}/.test(documentText) && relativePath !== 'docs/codebase_architecture_guide.md') {
    failures.push(`Missing Last reviewed date: ${relativePath}`);
  }
}

try {
  const status = execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
  const changed = status
    .split('\n')
    .filter(Boolean)
    .map((line) => line.slice(3).split(' -> ').at(-1));
  const hasImplementationChange = changed.some(
    (file) =>
      file &&
      (implementationPrefixes.some((prefix) => file.startsWith(prefix)) || rootImplementationFiles.has(file)),
  );
  const hasDocumentationChange = changed.some((file) => file && maintainedDocuments.has(file));
  if (hasImplementationChange && !hasDocumentationChange) {
    failures.push('Implementation changed without updating a maintained context document.');
  }
} catch {
  // Source archives may not include Git metadata; required-file validation still applies.
}

if (failures.length > 0) {
  console.error('Documentation check failed:\n' + failures.map((failure) => `- ${failure}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Documentation check passed (${requiredDocuments.length} required files).`);
}
