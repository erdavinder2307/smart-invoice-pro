/**
 * patch-mui-chip.js
 *
 * Fixes a bug in MUI v7 Chip component where `onClick(event)` is called
 * unconditionally, causing "onClick is not a function" crashes when a Chip
 * without an onClick prop is clicked.
 *
 * The fix changes `onClick(event)` to `onClick?.(event)` (optional chaining).
 *
 * Run automatically via `postinstall` in package.json.
 */

const fs = require('fs');
const path = require('path');

const filesToPatch = [
  'node_modules/@mui/material/esm/Chip/Chip.js',
  'node_modules/@mui/material/Chip/Chip.js',
];

const BUGGY_PATTERN = /^( {8})onClick\(event\);$/m;
const FIXED_REPLACEMENT = '$1onClick?.(event);';

let patchedCount = 0;

for (const relativePath of filesToPatch) {
  const filePath = path.resolve(__dirname, '..', relativePath);

  if (!fs.existsSync(filePath)) {
    console.warn(`[patch-mui-chip] File not found, skipping: ${relativePath}`);
    continue;
  }

  const original = fs.readFileSync(filePath, 'utf8');

  if (!BUGGY_PATTERN.test(original)) {
    // Already patched or different version
    console.log(`[patch-mui-chip] Already patched or different version: ${relativePath}`);
    continue;
  }

  const patched = original.replace(BUGGY_PATTERN, FIXED_REPLACEMENT);
  fs.writeFileSync(filePath, patched, 'utf8');
  console.log(`[patch-mui-chip] Patched: ${relativePath}`);
  patchedCount++;
}

if (patchedCount > 0) {
  console.log(`[patch-mui-chip] Applied ${patchedCount} patch(es) successfully.`);
} else {
  console.log('[patch-mui-chip] No patches needed.');
}
