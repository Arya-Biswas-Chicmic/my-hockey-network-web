#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const findings = [];
const allowedWebPrimitiveFiles = new Set([
  'apps/web/src/components/common/Button.tsx',
  'apps/web/src/components/common/FormControls.tsx',
  'apps/web/src/components/ui/button.tsx',
  'apps/web/src/components/ui/file-picker-button.tsx',
  'apps/web/src/components/ui/date-picker-button.tsx',
  'apps/web/src/components/ui/form.tsx',
  'apps/web/src/components/ui/slider.tsx',
]);
const allowedCustomSvgFiles = new Set([
  'apps/web/src/components/icons/BrandIcons.tsx',
  'apps/web/src/components/icons/HockeyAnalyticsVisuals.tsx',
  'apps/web/src/components/features/auth/guardian/GuardianBackgroundShapes.tsx',
  'apps/web/src/components/features/auth/guardian/GuardianIcons.tsx',
  'apps/web/src/components/features/auth/request-sent/RequestSentIcons.tsx',
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
  const text = fs.readFileSync(file, 'utf8');
  if (!allowedWebPrimitiveFiles.has(relativePath)) {
    const matches = text.match(/<(?:button|input|select|textarea)\b/g);
    if (matches) findings.push(`${relativePath}: ${matches.length} raw web control(s)`);
  }
  if (/\bstyle\s*=\s*\{\{/.test(text)) {
    findings.push(`${relativePath}: replace inline style objects with Tailwind or an existing class`);
  }
  if (/<form\b/.test(text) && !/from\s+['"]react-hook-form['"]/.test(text)) {
    findings.push(`${relativePath}: semantic web forms must use React Hook Form and Zod validation`);
  }
  if (/<svg\b/.test(text) && !allowedCustomSvgFiles.has(relativePath)) {
    findings.push(`${relativePath}: use Lucide or an approved reusable custom icon component instead of inline SVG`);
  }
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
    findings.push(`${relativePath}: web must use Next.js App Router, not React Navigation`);
  }
  if (/(?:from\s+|import\s*\(?\s*)['"]\.\.?\//.test(text)) {
    findings.push(`${relativePath}: use the @/ source alias instead of a relative import`);
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
  if (/(?:from\s+|import\s*\(?\s*)['"]\.\.?\//.test(text)) {
    findings.push(`${relativePath}: use the @/ source alias instead of a relative import`);
  }
}

for (const file of sourceFiles(path.join(root, 'packages'), /\.(tsx|jsx)$/)) {
  findings.push(`${path.relative(root, file)}: shared packages must not contain platform UI`);
}

for (const sourceRoot of ['apps/web/src', 'apps/mobile/src', 'packages']) {
  for (const file of sourceFiles(path.join(root, sourceRoot), /\.(ts|tsx)$/)) {
    const relativePath = path.relative(root, file);
    const text = fs.readFileSync(file, 'utf8');
    if (/:\s*any\b|\bas\s+any\b|<any(?:,|>)/.test(text)) {
      findings.push(`${relativePath}: explicit any is forbidden; model the contract or use unknown with narrowing`);
    }
  }
}

if (findings.length > 0) {
  console.error('Component reuse check failed:\n' + findings.map((finding) => `- ${finding}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log('Component reuse check passed.');
}
