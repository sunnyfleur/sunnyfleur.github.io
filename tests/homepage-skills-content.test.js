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

  for (const skill of ['Unity', 'Unreal', 'KPI Analysis', 'AI-assisted Workflow']) {
    assert.match(homepage, new RegExp(`<span class="skills-supporting__label">${skill}</span>`));
  }
});

test('homepage positions the portfolio around gameplay design ownership', () => {
  assert.match(homepage, /Gameplay Designer Portfolio/);
  assert.match(homepage, /I'm Tran Hoang Kiet<br>Gameplay Designer\./);
  assert.match(homepage, /Specialization:[\s\S]*?Gameplay Designer/);
  assert.match(homepage, /owning gameplay features from concept and prototype to production-ready systems/);
  assert.match(homepage, /KPI dashboards, retention\/churn signals, and playtest observations support my decisions/);
  assert.match(homepage, /data-skill-title="Gameplay Design"/);
  assert.match(homepage, /data-skill-title="Feature Ownership"/);
  assert.doesNotMatch(homepage, /data-skill-title="Game Design"/);
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

test('homepage about copy is structured for quick scanning', () => {
  assert.match(homepage, /class="about-descr__lead/);
  assert.equal(
    countMatches(/class="about-focus__item/g),
    3,
    'About copy should use three compact focus points instead of a long paragraph wall.'
  );
  assert.equal(
    countMatches(/class="about-focus__label/g),
    3,
    'Each About focus point should have a scannable label.'
  );
  assert.equal(
    countMatches(/class="about-focus__text/g),
    3,
    'Each About focus point should include supporting context.'
  );
});

test('homepage keeps the full core skills module in resume only', () => {
  const aboutEnd = homepage.indexOf('<!-- About Section End -->');
  const portfolioStart = homepage.indexOf('<!-- Portfolio Section Start -->');
  const resumeStart = homepage.indexOf('<!-- Resume Section Start -->');
  const resumeEnd = homepage.indexOf('<!-- Resume Section End -->');
  const previewStart = homepage.indexOf('class="skills-teaser');
  const skillsStart = homepage.indexOf('<!-- Content Block - Skills Section Start -->');

  assert.notEqual(aboutEnd, -1, 'Expected an About section end marker.');
  assert.notEqual(portfolioStart, -1, 'Expected a Portfolio section start marker.');
  assert.notEqual(resumeStart, -1, 'Expected a Resume section start marker.');
  assert.notEqual(resumeEnd, -1, 'Expected a Resume section end marker.');
  assert.notEqual(skillsStart, -1, 'Expected the Core Skills block.');

  assert.ok(
    aboutEnd < portfolioStart && portfolioStart < resumeStart,
    'Homepage scan order should move directly from About to Portfolio before Resume.'
  );
  assert.equal(previewStart, -1, 'The early Core Skills teaser should be removed.');
  assert.doesNotMatch(homepage, /id="skills"/, 'No separate early skills section should remain.');

  const resumeBlock = homepage.slice(resumeStart, resumeEnd);
  assert.match(
    resumeBlock,
    /class="skills-section"/,
    'The full interactive Core Skills module should stay inside Resume.'
  );
  assert.ok(
    skillsStart > resumeStart && skillsStart < resumeEnd,
    'The full Core Skills block should be positioned inside Resume.'
  );

  const prePortfolioBlock = homepage.slice(aboutEnd, portfolioStart);
  assert.doesNotMatch(
    prePortfolioBlock,
    /class="skills-section"/,
    'The full interactive skills module should not sit before Portfolio.'
  );
});

test('homepage avoids repeated micro-labels inside already titled sections', () => {
  assert.doesNotMatch(homepage, /portfolio-carousel__eyebrow/);
  assert.doesNotMatch(homepage, /skills-supporting__eyebrow/);
});
