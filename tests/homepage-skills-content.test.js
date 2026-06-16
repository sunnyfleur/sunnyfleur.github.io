const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const homepage = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const mainCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'main.css'), 'utf8');

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
  assert.match(homepage, /move features from design intent through prototype, specs, playtests, implementation coordination, and production tuning/);
  assert.match(homepage, /KPI dashboards and playtest notes help validate tuning decisions/);
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

test('education section prioritizes gameplay design credentials for hiring reviewers', () => {
  const educationBlockMatch = homepage.match(/<!-- Content Block - Education Start -->([\s\S]*?)<!-- Content Block - Education End -->/);
  assert.ok(educationBlockMatch, 'Expected the education content block to exist.');
  const educationBlock = educationBlockMatch[1];

  assert.match(educationBlock, /Education &amp; design training/);
  assert.match(educationBlock, /class="resume-priority-summary animate-in-up"/);
  assert.match(educationBlock, /Gameplay design training/);
  assert.match(educationBlock, /Unity implementation literacy/);
  assert.match(educationBlock, /Software engineering foundation/);
  assert.match(educationBlock, /class="container-fluid p-0 resume-lines resume-lines--education"/);

  assert.equal(
    (educationBlock.match(/resume-lines__item--primary/g) || []).length,
    2,
    'Game Design and Unity training should be the two primary credentials.'
  );
  assert.equal(
    (educationBlock.match(/resume-lines__item--foundation/g) || []).length,
    1,
    'Software Engineering should read as the technical foundation.'
  );
  assert.equal(
    (educationBlock.match(/resume-lines__item--supporting/g) || []).length,
    2,
    'IELTS and Digital Painting should be supporting credentials.'
  );

  for (const category of ['Core Gameplay', 'Engine Practice', 'Technical Foundation', 'Communication', 'Visual Support']) {
    assert.match(educationBlock, new RegExp(`<span class="resume-lines__category animate-in-up">${category}</span>`));
  }

  const gameDesignIndex = educationBlock.indexOf('Game Design');
  const unityIndex = educationBlock.indexOf('Game Development with Unity Engine');
  const softwareIndex = educationBlock.indexOf('Software Engineering');
  assert.ok(gameDesignIndex > -1 && unityIndex > -1 && softwareIndex > -1, 'Expected core education items.');
  assert.ok(
    gameDesignIndex < unityIndex && unityIndex < softwareIndex,
    'Gameplay-focused credentials should appear before the broader software foundation.'
  );

  for (const copy of [
    'Practice turning game ideas into mechanics, player goals, and playable design briefs.',
    'Engine-focused training for prototyping gameplay logic and understanding implementation constraints.',
    'Systems thinking, technical documentation, and implementation literacy for feature ownership.',
    'English communication support for design documentation and cross-functional collaboration.',
    'Visual taste support for UI readability, composition, and game-art communication.'
  ]) {
    assert.match(educationBlock, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('education hierarchy has scoped CSS hooks for visual priority and responsive layout', () => {
  for (const selector of [
    '.resume-priority-summary',
    '.resume-priority-summary__item',
    '.resume-lines--education',
    '.resume-lines__category',
    '.resume-lines__item--primary',
    '.resume-lines__item--foundation',
    '.resume-lines__item--supporting'
  ]) {
    assert.match(mainCss, new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(mainCss, /resume-priority-summary[\s\S]*?grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(mainCss, /resume-lines__item--primary::before[\s\S]*?linear-gradient/);
  assert.match(mainCss, /resume-lines__item--supporting[\s\S]*?opacity:/);
  assert.match(mainCss, /@media only screen and \(max-width: 767px\)[\s\S]*?resume-priority-summary/);
});

test('work experience reads as production evidence instead of another education list', () => {
  const experienceBlockMatch = homepage.match(/<!-- Content Block - Experience Start -->([\s\S]*?)<!-- Content Block - Experience End -->/);
  assert.ok(experienceBlockMatch, 'Expected the work experience content block to exist.');
  const experienceBlock = experienceBlockMatch[1];

  assert.match(experienceBlock, /class="container-fluid p-0 resume-lines resume-lines--experience"/);
  assert.doesNotMatch(experienceBlock, /resume-priority-summary/, 'Work experience should use a different pattern from Education.');
  assert.match(experienceBlock, /resume-lines__item--featured/);
  assert.match(experienceBlock, /class="experience-proof animate-in-up"/);
  assert.match(experienceBlock, /class="experience-tags animate-in-up"/);

  const gameplayIndex = experienceBlock.indexOf('Gameplay Designer');
  const gameDesignerIndex = experienceBlock.indexOf('Game Designer');
  const unityIndex = experienceBlock.indexOf('Unity Developer Intern');
  assert.ok(gameplayIndex > -1 && gameDesignerIndex > -1 && unityIndex > -1, 'Expected all experience roles.');
  assert.ok(
    gameplayIndex < gameDesignerIndex && gameDesignerIndex < unityIndex,
    'Current production role should lead the experience timeline.'
  );

  for (const proof of [
    'Own combat, content, and camera gameplay features.',
    'Write specs and coordinate implementation with developers.',
    'Run playtest passes and KPI-informed tuning.',
    'Tune features toward production use.'
  ]) {
    assert.match(experienceBlock, new RegExp(`<li class="experience-proof__item">${proof.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</li>`));
  }

  for (const tag of [
    'Feature ownership',
    'Production support',
    'Combat systems',
    'KPI-informed tuning',
    'Unity implementation'
  ]) {
    assert.match(experienceBlock, new RegExp(`<span class="experience-tag">${tag}</span>`));
  }
});

test('work experience has scoped CSS for featured role, proof bullets, and mobile stacking', () => {
  for (const selector of [
    '.resume-lines--experience',
    '.experience-item',
    '.resume-lines__item--featured',
    '.experience-proof',
    '.experience-proof__item',
    '.experience-tags',
    '.experience-tag'
  ]) {
    assert.match(mainCss, new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(mainCss, /resume-lines--experience[\s\S]*?border-top:/);
  assert.match(mainCss, /resume-lines__item--featured[\s\S]*?background:/);
  assert.match(mainCss, /experience-proof__item::before[\s\S]*?background:/);
  assert.match(mainCss, /@media only screen and \(max-width: 767px\)[\s\S]*?experience-tags/);
});

test('work experience uses compact evidence rows instead of an oversized featured card', () => {
  const itemBlock = mainCss.match(/\.resume-lines--experience \.experience-item \{([\s\S]*?)\n\}/);
  assert.ok(itemBlock, 'Expected a scoped work experience item CSS block.');
  assert.match(
    itemBlock[1],
    /display: grid/,
    'Experience rows should own their column rhythm instead of relying on wide Bootstrap columns.'
  );
  assert.match(
    itemBlock[1],
    /grid-template-columns: minmax\(9\.2rem, 0\.75fr\) minmax\(18rem, 1\.05fr\) minmax\(26rem, 1\.55fr\)/,
    'Experience rows should keep dates, role context, and proof bullets visually closer together.'
  );
  assert.match(
    mainCss,
    /resume-lines--experience \.experience-item > \[class\*="col-"\][\s\S]*?max-width: none/,
    'Experience row children should opt out of Bootstrap column widths.'
  );

  const featuredBlock = mainCss.match(/\.resume-lines--experience \.resume-lines__item--featured \{([\s\S]*?)\n\}/);
  assert.ok(featuredBlock, 'Expected a featured work experience CSS block.');
  assert.doesNotMatch(featuredBlock[1], /box-shadow/, 'The current role should be highlighted by hierarchy, not a heavy card shadow.');
  assert.doesNotMatch(featuredBlock[1], /border-radius: var\(--_radius-m\)/, 'The current role should not use the large card radius.');
  assert.match(featuredBlock[1], /background:/, 'The current role still needs a subtle state background.');
});

test('contact section presents a gameplay design pitch beside a clear form panel', () => {
  const contactBlockMatch = homepage.match(/<!-- Contact Section Start -->([\s\S]*?)<!-- Contact Section End -->/);
  assert.ok(contactBlockMatch, 'Expected the contact section to exist.');
  const contactBlock = contactBlockMatch[1];

  assert.match(contactBlock, /Let's talk gameplay design/);
  assert.match(contactBlock, /Open to gameplay design roles where I can own features, write specs, iterate prototypes, and tune production gameplay\./);
  assert.match(contactBlock, /class="contact-layout"/);
  assert.match(contactBlock, /class="contact-pitch animate-in-up"/);
  assert.match(contactBlock, /class="contact-form-panel animate-in-up"/);
  assert.match(contactBlock, /class="contact-scope-list"/);

  for (const scope of [
    'Gameplay systems',
    'Feature ownership',
    'Unity implementation literacy',
    'KPI-informed tuning'
  ]) {
    assert.match(contactBlock, new RegExp(`<span(?: [^>]*)?>${scope}</span>`));
  }

  assert.match(contactBlock, /<span class="contact-field__optional"(?: [^>]*)?>Optional<\/span>/);
  assert.match(contactBlock, /<label for="contact-company"(?: [^>]*)?>Company<\/label>/);
  assert.match(contactBlock, /<label for="contact-phone"(?: [^>]*)?>Phone<\/label>/);
  assert.match(contactBlock, /<input type="text" id="contact-name" name="Name" autocomplete="name" required>/);
  assert.match(contactBlock, /<input type="email" id="contact-email" name="E-mail" autocomplete="email" required>/);
  assert.match(contactBlock, /<input type="tel" id="contact-phone" name="Phone" autocomplete="tel">/);
  assert.match(contactBlock, /<textarea id="contact-message" name="Message" required><\/textarea>/);
  assert.doesNotMatch(contactBlock, /placeholder=/, 'Contact form should use real labels instead of placeholder labels.');
});

test('contact section CSS supports panel hierarchy, form contrast, focus states, and mobile stacking', () => {
  for (const selector of [
    '.contact-layout',
    '.contact-pitch',
    '.contact-pitch__lead',
    '.contact-scope-list',
    '.contact-form-panel',
    '.contact-field',
    '.contact-field__label',
    '.contact-field__optional',
    '.contact-routes'
  ]) {
    assert.match(mainCss, new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  const layoutBlock = mainCss.match(/\.contact-layout \{([\s\S]*?)\n\}/);
  assert.ok(layoutBlock, 'Expected a contact layout CSS block.');
  assert.match(layoutBlock[1], /display: grid/);
  assert.match(layoutBlock[1], /grid-template-columns: minmax\(0, 0\.82fr\) minmax\(32rem, 1\.18fr\)/);

  const formPanelBlock = mainCss.match(/\.contact-form-panel \{([\s\S]*?)\n\}/);
  assert.ok(formPanelBlock, 'Expected a contact form panel CSS block.');
  assert.match(formPanelBlock[1], /background:/);
  assert.match(formPanelBlock[1], /border:/);

  assert.match(mainCss, /contact-field input,\s*\n\.contact-field textarea[\s\S]*?background:/);
  assert.match(mainCss, /contact-field input:focus,\s*\n\.contact-field textarea:focus[\s\S]*?border-color: var\(--accent\)/);
  assert.match(mainCss, /contact-form-panel \.btn:active[\s\S]*?transform:/);
  assert.match(mainCss, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?contact-form-panel \.btn/);
  assert.match(mainCss, /@media only screen and \(max-width: 767px\)[\s\S]*?contact-layout/);
});
