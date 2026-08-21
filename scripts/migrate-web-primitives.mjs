#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const sourceRoot = path.join(root, 'apps/web/src');
const buttonTarget = path.join(sourceRoot, 'components/common/Button');
const controlsTarget = path.join(sourceRoot, 'components/common/FormControls');
const excluded = new Set([`${buttonTarget}.tsx`, `${controlsTarget}.tsx`]);
const tagNames = new Map([
  ['button', 'Button'],
  ['input', 'Input'],
  ['select', 'Select'],
  ['textarea', 'Textarea'],
]);

function modulePath(fromFile, target) {
  let relative = path.relative(path.dirname(fromFile), target).split(path.sep).join('/');
  if (!relative.startsWith('.')) relative = `./${relative}`;
  return relative;
}

function filesIn(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return filesIn(absolutePath);
    return entry.name.endsWith('.tsx') ? [absolutePath] : [];
  });
}

let changedFiles = 0;
for (const file of filesIn(sourceRoot)) {
  if (excluded.has(file)) continue;
  const source = fs.readFileSync(file, 'utf8');
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const replacements = [];
  const used = new Set();

  function visit(node) {
    if (
      ts.isJsxOpeningElement(node) ||
      ts.isJsxClosingElement(node) ||
      ts.isJsxSelfClosingElement(node)
    ) {
      const original = node.tagName.getText(sourceFile);
      const replacement = tagNames.get(original);
      if (replacement) {
        replacements.push({ start: node.tagName.getStart(sourceFile), end: node.tagName.getEnd(), text: replacement });
        used.add(replacement);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  if (replacements.length === 0) continue;

  let output = source;
  for (const replacement of replacements.sort((left, right) => right.start - left.start)) {
    output = output.slice(0, replacement.start) + replacement.text + output.slice(replacement.end);
  }

  const imports = [];
  if (used.has('Button') && !/import[\s\S]*?\bButton\b[\s\S]*?from\s+['"]/.test(source)) {
    imports.push(`import { Button } from '${modulePath(file, buttonTarget)}';`);
  }
  const controls = ['Input', 'Select', 'Textarea'].filter(
    (name) => used.has(name) && !new RegExp(`import[\\s\\S]*?\\b${name}\\b[\\s\\S]*?from\\s+['\"]`).test(source),
  );
  if (controls.length > 0) {
    imports.push(`import { ${controls.join(', ')} } from '${modulePath(file, controlsTarget)}';`);
  }
  if (imports.length > 0) output = `${imports.join('\n')}\n${output}`;
  fs.writeFileSync(file, output);
  changedFiles += 1;
}

console.log(`Migrated ${changedFiles} web file(s) to reusable primitives.`);
