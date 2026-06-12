const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('avatar social links render as a compact labeled three-item dock', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'main.css'), 'utf8');
  const socialBlockMatch = html.match(/<div class="avatar__socials">([\s\S]*?)<\/div>/);

  assert.ok(socialBlockMatch, 'Expected avatar socials block to exist.');

  const socialBlock = socialBlockMatch[1];
  const labelCount = (socialBlock.match(/avatar-socials-list__label/g) || []).length;

  assert.match(socialBlock, /avatar-socials-list/);
  assert.doesNotMatch(socialBlock, /justify-content-between/);
  assert.equal(labelCount, 3);
  assert.match(socialBlock, />Facebook</);
  assert.match(socialBlock, />LinkedIn</);
  assert.match(socialBlock, />GitHub</);

  assert.match(css, /\.avatar-socials-list\s*\{/);
  assert.match(css, /grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/);
  assert.match(css, /\.avatar-socials-list__link\s*\{/);
  assert.match(css, /\.avatar-socials-list__label\s*\{/);
});
