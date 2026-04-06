const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'portfolio-ux.css'), 'utf8');
const spotlightBlockMatch = css.match(/\.portfolio-spotlight\s*\{([^}]*)\}/);

assert.ok(spotlightBlockMatch, 'Expected .portfolio-spotlight rule to exist.');
assert.match(
  spotlightBlockMatch[1],
  /top:\s*11\.5rem;/,
  'Expected .portfolio-spotlight to reserve 11.5rem from the top on desktop.'
);

console.log('portfolio layout tests passed');
