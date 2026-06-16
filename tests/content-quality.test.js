const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.join(__dirname, '..');

function readText(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

const publicCopyFiles = [
  'index.html',
  'project.html',
  'gamepage.html',
  'game.html',
  'projects.json',
  'gaming-journey.json',
  'js/project-page.js',
  'i18n/site.en.json',
  'i18n/site.vi.json',
  'i18n/projects.vi.json',
  'i18n/gaming-journey.vi.json',
];

test('public bilingual copy does not expose internal placeholder states', () => {
  const forbidden = [
    /\bTBD\b/i,
    /placeholder/i,
    /draft pending/i,
    /archive refresh pending/i,
    /case study draft pending/i,
    /documentation pass pending/i,
    /archive setup pending/i,
    /currently lives as/i,
    /currently represented/i,
    /being rebuilt/i,
    /being reorganized/i,
    /can stay visible/i,
    /can remain discoverable/i,
  ];

  for (const file of publicCopyFiles) {
    const text = readText(file);
    for (const pattern of forbidden) {
      assert.doesNotMatch(text, pattern, `${file} exposes internal copy matching ${pattern}`);
    }
  }
});

test('Vietnamese portfolio copy uses natural professional phrasing', () => {
  const siteVi = readJson('i18n/site.vi.json');
  const viCopy = [
    readText('i18n/site.vi.json'),
    readText('i18n/projects.vi.json'),
    readText('i18n/gaming-journey.vi.json'),
  ].join('\n');

  for (const awkward of [
    /own gameplay feature/i,
    /implementation support/i,
    /production readiness/i,
    /gameplay problem/i,
    /prototype-to-production/i,
    /archive entry/i,
    /full case study/i,
    /case study draft/i,
    /archive refresh/i,
    /mốc tham chiếu/i,
  ]) {
    assert.doesNotMatch(viCopy, awkward, `Vietnamese copy still contains ${awkward}`);
  }

  assert.equal(siteVi.home.subtitle, 'Thiết kế gameplay và phụ trách feature');
  assert.equal(siteVi.resume.skillsTitle, 'Kỹ năng chính');
  assert.equal(siteVi.skills.advanced, 'Mạnh');
});

test('Vietnamese gaming journey reflections are specific, not generated templates', () => {
  const overlay = readJson('i18n/gaming-journey.vi.json');
  const reflections = Object.entries(overlay.games).map(([title, game]) => ({
    title,
    reflection: game.reflection,
  }));

  assert.ok(reflections.length >= 45, 'Expected localized reflections for the full journey.');

  const templated = reflections.filter(({ reflection }) => (
    /^Góc nhìn thiết kế về .+: đây là một mốc tham chiếu/i.test(reflection)
  ));
  assert.deepEqual(
    templated.map(({ title }) => title),
    [],
    'Vietnamese journey reflections should not use the old generated template.'
  );

  const counts = new Map();
  for (const { reflection } of reflections) {
    counts.set(reflection, (counts.get(reflection) || 0) + 1);
  }
  const duplicates = [...counts.entries()].filter(([, count]) => count > 1).map(([reflection]) => reflection);
  assert.deepEqual(duplicates, [], 'Vietnamese journey reflections should not repeat exact sentences.');
});

test('project archive metadata uses public-safe labels in both languages', () => {
  const base = readJson('projects.json');
  const vi = readJson('i18n/projects.vi.json');

  for (const project of base.projects) {
    assert.notEqual(project.teamSize, 'TBD', `${project.slug} should not expose TBD team size.`);
    assert.doesNotMatch(String(project.status || ''), /pending/i, `${project.slug} should not expose pending status.`);
    assert.ok(vi.projects[project.slug], `${project.slug} should have a Vietnamese overlay.`);
    if (project.teamSize === 'Not public') {
      assert.equal(vi.projects[project.slug].teamSize, 'Không công khai', `${project.slug} should localize non-public team size.`);
    }
  }
});

test('portfolio section copy is concise and naturally localized', () => {
  const siteEn = readJson('i18n/site.en.json');
  const siteVi = readJson('i18n/site.vi.json');

  assert.equal(siteEn.portfolio.title, 'Selected gameplay work');
  assert.equal(
    siteEn.portfolio.text,
    'A focused set of shipped work, prototypes, and evidence archives showing gameplay design, feature ownership, and iteration.'
  );
  assert.equal(siteEn.portfolio.explorerTitle, 'Project explorer');

  assert.equal(siteVi.portfolio.title, 'Các dự án gameplay tiêu biểu');
  assert.equal(
    siteVi.portfolio.text,
    'Tập hợp dự án đã tham gia, prototype và archive tư liệu thể hiện gameplay design, phụ trách feature và quá trình iteration.'
  );
  assert.equal(siteVi.portfolio.explorerTitle, 'Project explorer');
  assert.equal(
    siteVi.portfolio.explorerText,
    'Lọc theo loại dự án hoặc focus area, rồi mở case study hoặc archive có bằng chứng rõ nhất.'
  );

  for (const awkward of [
    /reviewer thật sự đọc/i,
    /Featured work/i,
    /next click is always obvious/i,
    /case-study flow stays consistent/i,
    /Project explorer đầy đủ/i,
  ]) {
    assert.doesNotMatch(siteVi.portfolio.title, awkward);
    assert.doesNotMatch(siteVi.portfolio.text, awkward);
    assert.doesNotMatch(siteVi.portfolio.explorerTitle, awkward);
    assert.doesNotMatch(siteVi.portfolio.explorerText, awkward);
  }
});
