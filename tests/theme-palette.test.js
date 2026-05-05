const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'main.css'), 'utf8');

function rootValue(name) {
  const match = css.match(new RegExp(`${name}:\\s*([^;]+);`));
  return match ? match[1].trim().toLowerCase() : '';
}

const expectedPalette = {
  '--accent--light': '#f47b45',
  '--secondary--light': '#2fb39b',
  '--secondary-rgba--light': 'rgba(47,179,155,0.3)',
  '--t-accent--light': '#d96534',
  '--t-secondary--light': '#2fb39b',
  '--text-gradient-mid--light': '#f6b55f',
  '--gradient-one--light': '#2fb39b',
  '--gradient-two--light': '#f1f48b',
  '--gradient-three--light': '#f47b45',
  '--background-blob-opacity--light': '0.5',
  '--accent--dark': '#ff9468',
  '--secondary--dark': '#69d9c6',
  '--secondary-rgba--dark': 'rgba(105,217,198,0.24)',
  '--t-accent--dark': '#ffc19f',
  '--t-secondary--dark': '#b8f3e6',
  '--text-gradient-mid--dark': '#f1f48b',
  '--gradient-one--dark': '#165d55',
  '--gradient-two--dark': '#8c8f3a',
  '--gradient-three--dark': '#7a341f',
  '--background-blob-opacity--dark': '0.72',
};

Object.entries(expectedPalette).forEach(([name, value]) => {
  assert.equal(rootValue(name), value, `${name} should use the approved teal-mint-yellow-coral palette.`);
});

assert.doesNotMatch(
  css,
  /-webkit-linear-gradient\(15deg,\s*var\(--t-accent\)\s+0%,\s*var\(--t-secondary\)\s+80%\)/,
  'Text gradients should not blend coral directly into teal because that creates muddy dark midtones.'
);

assert.match(
  css,
  /-webkit-linear-gradient\(15deg,\s*var\(--t-accent\)\s+0%,\s*var\(--text-gradient-mid\)\s+48%,\s*var\(--t-secondary\)\s+92%\)/,
  'Text gradients should use a warm midpoint before transitioning into teal.'
);

assert.match(
  css,
  /\.blur\s*\{[^}]*opacity:\s*var\(--background-blob-opacity\);/s,
  'Background color blobs should use an opacity token so the global palette does not overpower readable content.'
);

console.log('theme palette tests passed');
