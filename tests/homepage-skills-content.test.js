const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const homepage = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

function countMatches(pattern) {
  return (homepage.match(pattern) || []).length;
}

test('homepage skills section separates core skill cards from supporting badges', () => {
  assert.equal(
    countMatches(/class="skills-card(?:\s+is-active)?"/g),
    4,
    'Core Skills should show four large interactive cards.'
  );

  assert.equal(
    countMatches(/class="skills-supporting__badge"/g),
    4,
    'Supporting skills should render as four compact badges.'
  );

  for (const skill of ['Unity', 'Unreal', 'Artistic Vision', 'AI-assisted Workflow']) {
    assert.match(homepage, new RegExp(`<span class="skills-supporting__label">${skill}</span>`));
  }
});

test('homepage skills proof detail and resume markup stay structurally clean', () => {
  assert.match(homepage, /class="skills-detail__proof"/);
  assert.match(homepage, /data-skill-detail-proof/);
  assert.match(homepage, /data-skill-proof=/);

  const educationBlockMatch = homepage.match(/<!-- Education Lines Start -->([\s\S]*?)<!-- Education Lines End -->/);
  assert.ok(educationBlockMatch, 'Expected one education lines block.');
  assert.match(
    educationBlockMatch[1],
    /Digital Painting 2D Game/,
    'The Digital Painting education item should live inside the education timeline container.'
  );

  const afterEducation = homepage.slice(homepage.indexOf('<!-- Education Lines End -->'));
  assert.doesNotMatch(
    afterEducation,
    /Digital Painting 2D Game/,
    'No education item should sit outside the education timeline container.'
  );
});

test('homepage avoids repeated micro-labels inside already titled sections', () => {
  assert.doesNotMatch(homepage, /portfolio-carousel__eyebrow/);
  assert.doesNotMatch(homepage, /skills-supporting__eyebrow/);
});
