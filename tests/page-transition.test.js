const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('project page transition script is loaded on homepage and project pages', () => {
  const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const projectHtml = fs.readFileSync(path.join(__dirname, '..', 'project.html'), 'utf8');

  assert.match(indexHtml, /<script src="js\/page-transition\.js"><\/script>/);
  assert.match(projectHtml, /<script src="js\/page-transition\.js"><\/script>/);
});

test('project page transition script animates project links with reduced-motion fallback', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'page-transition.js'), 'utf8');

  assert.match(source, /function prefersReducedMotion\(\)/);
  assert.match(source, /function isProjectLink\(link\)/);
  assert.match(source, /function createTransitionOverlay/);
  assert.match(source, /function runProjectExitTransition/);
  assert.match(source, /function runProjectEntryTransition/);
  assert.match(source, /closest\("\[data-portfolio-project\]"\)/);
  assert.match(source, /page-transition-card__badge/);
  assert.match(source, /transition\.badge/);
  assert.match(source, /portfolio\.projectTransition/);
  assert.match(source, /sessionStorage\.setItem/);
  assert.match(source, /location\.href = destination\.href/);
  assert.match(source, /gsap\.timeline/);
  assert.match(source, /autoAlpha/);
  assert.match(source, /scale/);
});

test('project page dispatches a render event for the transition entry animation', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'project-page.js'), 'utf8');

  assert.match(source, /portfolio:project-rendered/);
  assert.match(source, /new CustomEvent/);
});

test('portfolio UX stylesheet defines project transition overlay styles', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'portfolio-ux.css'), 'utf8');

  assert.match(css, /\.page-transition-overlay/);
  assert.match(css, /\.page-transition-card/);
  assert.match(css, /\.page-transition-card__image/);
  assert.match(css, /\.page-transition-card__badge/);
  assert.match(css, /\.page-transition-card__label/);
  assert.match(css, /page-transition-active/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});
