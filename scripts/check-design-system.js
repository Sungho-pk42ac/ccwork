#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
if (!filePath) {
  process.exit(0);
}

const ext = path.extname(filePath);
const uiExtensions = ['.tsx', '.jsx', '.css', '.ts'];
if (!uiExtensions.includes(ext)) {
  process.exit(0);
}

let content;
try {
  content = fs.readFileSync(filePath, 'utf-8');
} catch {
  process.exit(0);
}

const lines = content.split('\n');
const violations = [];

// 디자인 시스템에 정의된 허용 색상값
const allowedHexColors = new Set([
  '#f8f9fa', '#f1f4f6', '#eaeff1', '#e2e9ec', '#dbe4e7', '#ffffff',
  '#0053dc', '#3e76fe',
  '#2b3437', '#586064', '#faf8ff',
  '#abb3b7', '#000000',
]);

// 디자인 시스템 spacing 허용값 (rem)
const allowedSpacingRem = new Set([
  '0.35rem', '0.7rem', '1.05rem', '1.4rem', '1.75rem',
  '2.1rem', '2.8rem', '3.5rem',
]);

// 1. hard-coded 색상값 검사
const hexPattern = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
const rgbPattern = /rgb\([^)]+\)/g;
const hslPattern = /hsl\([^)]+\)/g;

lines.forEach((line, i) => {
  const lineNum = i + 1;

  // CSS 변수 정의 라인은 건너뜀 (--color-xxx: ...)
  if (line.includes('--color-') || line.includes('--font-')) return;
  // 주석 라인 건너뜀
  const trimmed = line.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

  // hex 색상 검사
  let match;
  while ((match = hexPattern.exec(line)) !== null) {
    const hex = match[0].toLowerCase();
    const normalized = hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex;
    if (!allowedHexColors.has(normalized)) {
      violations.push(`L${lineNum}: hard-coded 색상 ${match[0]} → color-tokens.md의 CSS 변수를 사용하세요`);
    }
  }

  // rgb() 검사
  while ((match = rgbPattern.exec(line)) !== null) {
    violations.push(`L${lineNum}: hard-coded 색상 ${match[0]} → color-tokens.md의 CSS 변수를 사용하세요`);
  }

  // hsl() 검사 (CSS 변수 정의가 아닌 경우)
  while ((match = hslPattern.exec(line)) !== null) {
    if (!line.includes('--color-')) {
      violations.push(`L${lineNum}: hard-coded 색상 ${match[0]} → color-tokens.md의 CSS 변수를 사용하세요`);
    }
  }
});

// 2. 임의 spacing 검사 (Tailwind arbitrary values)
const arbitrarySpacingPattern = /(?:gap|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|space-x|space-y)-\[([^\]]+)\]/g;

lines.forEach((line, i) => {
  const lineNum = i + 1;
  const trimmed = line.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

  let match;
  while ((match = arbitrarySpacingPattern.exec(line)) !== null) {
    const value = match[1];
    // CSS 변수 참조는 허용
    if (value.startsWith('var(')) continue;
    // rem 값인 경우 허용 목록과 대조
    if (value.endsWith('rem') && allowedSpacingRem.has(value)) continue;
    // 그 외는 경고
    violations.push(`L${lineNum}: 임의 spacing 값 ${match[0]} → spacing-tokens.md의 스케일을 사용하세요 (0.35rem 배수)`);
  }
});

if (violations.length > 0) {
  process.stderr.write(`\n[Design System] ${path.basename(filePath)} 위반 사항:\n`);
  violations.forEach((v) => process.stderr.write(`  ⚠ ${v}\n`));
  process.stderr.write(`  → docs/design-system/skills/design-system/references/ 참조\n\n`);
}

process.exit(0);
