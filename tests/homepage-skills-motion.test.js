const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('homepage skills detail updates use GSAP timeline motion with reduced-motion fallback', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'homepage-skills.js'), 'utf8');

  assert.match(source, /function prefersReducedMotion\(\)/);
  assert.match(source, /function hasMotionSupport\(\)/);
  assert.match(source, /function renderDetail\(card, options = \{\}\)/);
  assert.match(source, /gsap\.timeline/);
  assert.match(source, /autoAlpha:\s*0/);
  assert.match(source, /autoAlpha:\s*1/);
  assert.match(source, /scale:\s*0\.985/);
  assert.match(source, /detail\.classList\.add\("is-motion-settling"\)/);
});

test('homepage skills active-card updates skip duplicate selections and keep aria pressed', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'homepage-skills.js'), 'utf8');

  assert.match(source, /let activeCard = null;/);
  assert.match(source, /if \(card === activeCard\) \{/);
  assert.match(source, /item\.setAttribute\("aria-pressed", isActive \? "true" : "false"\)/);
});

test('homepage skills styles live in the dedicated stylesheet only', () => {
  const portfolioCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'portfolio-ux.css'), 'utf8');
  const skillsCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'homepage-skills.css'), 'utf8');

  assert.doesNotMatch(portfolioCss, /\.skills-section\s*\{/);
  assert.match(skillsCss, /\.skills-section\s*\{/);
  assert.match(skillsCss, /\.skills-detail__proof\s*\{/);
});
