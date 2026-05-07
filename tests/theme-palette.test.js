const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'main.css'), 'utf8');

function rootValue(name) {
  const match = css.match(new RegExp(`${name}:\\s*([^;]+);`));
  return match ? match[1].trim().toLowerCase() : '';
}

const expectedPalette = {
  '--accent--light': '#8b5cf6',
  '--secondary--light': '#ff4fd8',
  '--secondary-rgba--light': 'rgba(255,79,216,0.3)',
  '--t-accent--light': '#8b5cf6',
  '--t-secondary--light': '#ff4fd8',
  '--text-gradient-mid--light': '#55d6ff',
  '--gradient-one--light': '#8b5cf6',
  '--gradient-two--light': '#55d6ff',
  '--gradient-three--light': '#ff4fd8',
  '--background-blob-opacity--light': '0.42',
  '--accent--dark': '#a78bfa',
  '--secondary--dark': '#ff6bde',
  '--secondary-rgba--dark': 'rgba(255,107,222,0.22)',
  '--t-accent--dark': '#c4b5fd',
  '--t-secondary--dark': '#ff8ee5',
  '--text-gradient-mid--dark': '#7ddcff',
  '--gradient-one--dark': '#3b2a6d',
  '--gradient-two--dark': '#155d75',
  '--gradient-three--dark': '#76285f',
  '--background-blob-opacity--dark': '0.62',
};

Object.entries(expectedPalette).forEach(([name, value]) => {
  assert.equal(rootValue(name), value, `${name} should use the approved digital-lavender-magenta palette.`);
});

assert.doesNotMatch(
  css,
  /-webkit-linear-gradient\(15deg,\s*var\(--t-accent\)\s+0%,\s*var\(--t-secondary\)\s+80%\)/,
  'Text gradients should not blend lavender directly into magenta because the cyan midpoint is part of the approved palette.'
);

assert.match(
  css,
  /-webkit-linear-gradient\(15deg,\s*var\(--t-accent\)\s+0%,\s*var\(--text-gradient-mid\)\s+48%,\s*var\(--t-secondary\)\s+92%\)/,
  'Text gradients should use the cyan midpoint before transitioning into magenta.'
);

assert.match(
  css,
  /\.blur\s*\{[^}]*opacity:\s*var\(--background-blob-opacity\);/s,
  'Background color blobs should use an opacity token so the global palette does not overpower readable content.'
);

console.log('theme palette tests passed');
