const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '..');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function fileSize(relativePath) {
  return fs.statSync(path.join(repoRoot, relativePath)).size;
}

test('homepage portrait image stays within the first-load budget', () => {
  assert.ok(
    fileSize('img/avatars/avatar.jpg') < 250 * 1024,
    'img/avatars/avatar.jpg must stay under 250 KB'
  );
});

test('about banner image stays within the deferred-image budget', () => {
  assert.ok(
    fileSize('img/about-me-banner.jpg') < 500 * 1024,
    'img/about-me-banner.jpg must stay under 500 KB'
  );
});

test('homepage loader no longer waits for every body image', () => {
  const appScript = readProjectFile('js/app.js');

  assert.doesNotMatch(appScript, /const\s+content\s*=\s*document\.querySelector\(['"]body['"]\)/);
  assert.doesNotMatch(appScript, /imagesLoaded\(\s*content\s*\)/);
});

test('about banner is lazy loaded on the homepage', () => {
  const homepage = readProjectFile('index.html');
  const aboutImageMatch = homepage.match(/<img[^>]+src="img\/about-me-banner\.jpg"[^>]*>/);

  assert.ok(aboutImageMatch, 'homepage must include the about banner image');
  assert.match(aboutImageMatch[0], /\sloading="lazy"/);
  assert.match(aboutImageMatch[0], /\sdecoding="async"/);
  assert.match(aboutImageMatch[0], /\sfetchpriority="low"/);
});

test('ambient blur animation respects reduced motion on homepage and project page', () => {
  const homepage = readProjectFile('index.html');
  const projectPage = readProjectFile('project.html');

  for (const [label, html] of [['homepage', homepage], ['project page', projectPage]]) {
    assert.match(
      html,
      /prefers-reduced-motion:\s*reduce/,
      `${label} ambient blur script should query reduced motion.`
    );
    assert.match(
      html,
      /prefersReducedMotion\(\)/,
      `${label} ambient blur script should use the reduced-motion helper before looping.`
    );
    assert.match(
      html,
      /gsap\.killTweensOf\(blurs\)/,
      `${label} ambient blur script should stop looped tweens for reduced motion.`
    );
  }
});
