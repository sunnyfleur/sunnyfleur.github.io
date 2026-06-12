const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'main.css'), 'utf8');

function rootValue(name) {
  const match = css.match(new RegExp(`${name}:\\s*([^;]+);`));
  return match ? match[1].trim().toLowerCase() : '';
}

function hexToRgb(value) {
  const match = value.match(/^#([0-9a-f]{6})$/i);
  assert.ok(match, `${value} should be a six-digit hex color.`);
  const hex = match[1];
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
  ];
}

function relativeLuminance(value) {
  return hexToRgb(value)
    .map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4;
    })
    .reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrastRatio(foreground, background) {
  const light = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const dark = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (light + 0.05) / (dark + 0.05);
}

const expectedPalette = {
  '--accent--light': '#7c3aed',
  '--secondary--light': '#a21caf',
  '--secondary-rgba--light': 'rgba(162,28,175,0.22)',
  '--accent-contrast--light': '#f8f2ff',
  '--t-accent--light': '#7c3aed',
  '--t-secondary--light': '#a21caf',
  '--text-gradient-mid--light': '#55d6ff',
  '--gradient-one--light': '#7c3aed',
  '--gradient-two--light': '#55d6ff',
  '--gradient-three--light': '#a21caf',
  '--background-blob-opacity--light': '0.34',
  '--base--dark': '#10111c',
  '--base-tint--dark': '#19182a',
  '--base-shade--dark': '#090a12',
  '--accent--dark': '#7c3aed',
  '--secondary--dark': '#a21caf',
  '--secondary-rgba--dark': 'rgba(162,28,175,0.2)',
  '--accent-contrast--dark': '#f8f2ff',
  '--stroke-controls--dark': '#3f3659',
  '--stroke-elements--dark': '#29243c',
  '--t-accent--dark': '#bda7ff',
  '--t-secondary--dark': '#f0abfc',
  '--t-opp-bright--dark': '#2b1744',
  '--text-gradient-mid--dark': '#7ddcff',
  '--gradient-one--dark': '#4c1d95',
  '--gradient-two--dark': '#155d75',
  '--gradient-three--dark': '#831843',
  '--background-blob-opacity--dark': '0.46',
};

Object.entries(expectedPalette).forEach(([name, value]) => {
  assert.equal(rootValue(name), value, `${name} should use the approved deep violet and berry palette.`);
});

[
  ['--accent-contrast--light', '--accent--light'],
  ['--accent-contrast--light', '--secondary--light'],
  ['--accent-contrast--dark', '--accent--dark'],
  ['--accent-contrast--dark', '--secondary--dark'],
  ['--t-opp-bright--light', '--base-opp--light'],
  ['--t-opp-bright--dark', '--base-opp--dark'],
].forEach(([textToken, backgroundToken]) => {
  assert.ok(
    contrastRatio(rootValue(textToken), rootValue(backgroundToken)) >= 4.5,
    `${textToken} should have WCAG AA contrast on ${backgroundToken}.`
  );
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

['homepage-skills.css', 'portfolio-ux.css'].forEach((fileName) => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'css', fileName), 'utf8');
  assert.doesNotMatch(
    source,
    /color-mix\(in srgb,\s*var\(--(?:accent|secondary)\)\s+\d+%,\s*white\s+\d+%\)/,
    `${fileName} should not lighten accent icon backgrounds with white because accent foregrounds are now light.`
  );
});

['main.css', 'homepage-skills.css', 'portfolio-ux.css'].forEach((fileName) => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'css', fileName), 'utf8');
  const accentColorUsages = source.match(/color:\s*var\(--accent-contrast\)/g) || [];

  assert.ok(
    accentColorUsages.length > 0,
    `${fileName} should use --accent-contrast for foregrounds on accent gradients.`
  );
});

console.log('theme palette tests passed');
