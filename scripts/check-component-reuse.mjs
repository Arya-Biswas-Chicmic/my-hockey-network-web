#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const findings = [];
const allowedWebPrimitiveFiles = new Set([
  'apps/web/src/components/common/Button.tsx',
  'apps/web/src/components/common/FormControls.tsx',
]);

function sourceFiles(directory, extensions = /\.(tsx|jsx)$/) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(absolutePath, extensions);
    return extensions.test(entry.name) ? [absolutePath] : [];
  });
}

for (const file of sourceFiles(path.join(root, 'apps/web/src'))) {
  const relativePath = path.relative(root, file);
  if (allowedWebPrimitiveFiles.has(relativePath)) continue;
  const text = fs.readFileSync(file, 'utf8');
  const matches = text.match(/<(?:button|input|select|textarea)\b/g);
  if (matches) findings.push(`${relativePath}: ${matches.length} raw web control(s)`);
}

for (const file of sourceFiles(path.join(root, 'apps/mobile/src/screens'))) {
  const relativePath = path.relative(root, file);
  const text = fs.readFileSync(file, 'utf8');
  if (/<TextInput\b/.test(text)) {
    findings.push(`${relativePath}: use the shared native Input component`);
  }
  if (/<ActivityIndicator\b/.test(text)) {
    findings.push(`${relativePath}: use shared loading/button components`);
  }
}

for (const file of sourceFiles(path.join(root, 'apps/web/src'), /\.(ts|tsx|js|jsx)$/)) {
  const relativePath = path.relative(root, file);
  const text = fs.readFileSync(file, 'utf8');
  if (/from\s+['"]react-native(?:\/|['"])/.test(text) || /apps\/mobile/.test(text)) {
    findings.push(`${relativePath}: web must not import mobile/native presentation`);
  }
  if (/from\s+['"]@react-navigation(?:\/|['"])/.test(text)) {
    findings.push(`${relativePath}: web must use React Router, not React Navigation`);
  }
}

for (const file of sourceFiles(path.join(root, 'apps/mobile/src'), /\.(ts|tsx|js|jsx)$/)) {
  const relativePath = path.relative(root, file);
  const text = fs.readFileSync(file, 'utf8');
  if (/from\s+['"]react-dom(?:\/|['"])/.test(text) || /apps\/web/.test(text)) {
    findings.push(`${relativePath}: mobile must not import web/DOM presentation`);
  }
  if (/from\s+['"]react-router(?:-dom)?(?:\/|['"])/.test(text) || /\bwindow\.location\b/.test(text)) {
    findings.push(`${relativePath}: mobile must use React Navigation, not browser URL routing`);
  }
}

for (const file of sourceFiles(path.join(root, 'packages'), /\.(tsx|jsx)$/)) {
  findings.push(`${path.relative(root, file)}: shared packages must not contain platform UI`);
}

if (findings.length > 0) {
  console.error('Component reuse check failed:\n' + findings.map((finding) => `- ${finding}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log('Component reuse check passed.');
}
