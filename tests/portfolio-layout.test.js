const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'portfolio-ux.css'), 'utf8');
const spotlightBlockMatch = css.match(/\.portfolio-spotlight\s*\{([^}]*)\}/);
const spotlightBodyBlockMatch = css.match(/\.portfolio-spotlight__body\s*\{([^}]*)\}/);
const spotlightLedeBlockMatch = css.match(/\.portfolio-spotlight__lede\s*\{([^}]*)\}/);
const spotlightSummaryBlockMatch = css.match(/\.portfolio-spotlight__summary\s*\{([^}]*)\}/);
const cardLinkBlockMatch = css.match(/\.portfolio-card__link,\s*\.project-related-card__link\s*\{([^}]*)\}/);
const cardBodyBlockMatch = css.match(/\.portfolio-card__body,\s*\.project-related-card__body\s*\{([^}]*)\}/);
const cardTaglineBlockMatch = css.match(/\.portfolio-card__tagline\s*\{([^}]*)\}/);
const cardCtaBlockMatch = css.match(/\.portfolio-card__cta,\s*\.project-related-card__cta\s*\{([^}]*)\}/);

assert.ok(spotlightBlockMatch, 'Expected .portfolio-spotlight rule to exist.');
assert.match(
  spotlightBlockMatch[1],
  /top:\s*11\.5rem;/,
  'Expected .portfolio-spotlight to reserve 11.5rem from the top on desktop.'
);
assert.match(
  spotlightBlockMatch[1],
  /max-height:\s*calc\(100vh - 13rem\);/,
  'Expected sticky spotlight to stay within the viewport so its CTA remains reachable.'
);

assert.ok(spotlightBodyBlockMatch, 'Expected spotlight body layout rule to exist.');
assert.match(
  spotlightBodyBlockMatch[1],
  /grid-template-rows:\s*auto\s+minmax\(0,\s*1fr\)\s+auto\s+auto;/,
  'Expected spotlight body to reserve a dedicated final row for the CTA.'
);
assert.match(
  spotlightBodyBlockMatch[1],
  /min-height:\s*0;/,
  'Expected spotlight body to be allowed to shrink inside the sticky card.'
);

assert.ok(spotlightLedeBlockMatch, 'Expected spotlight lede rule to exist.');
assert.match(
  spotlightLedeBlockMatch[1],
  /-webkit-line-clamp:\s*2;/,
  'Expected long spotlight ledes to clamp before pushing the CTA out of view.'
);

assert.ok(spotlightSummaryBlockMatch, 'Expected spotlight summary rule to exist.');
assert.match(
  spotlightSummaryBlockMatch[1],
  /-webkit-line-clamp:\s*3;/,
  'Expected long spotlight summaries to clamp before pushing the CTA out of view.'
);

assert.ok(cardLinkBlockMatch, 'Expected portfolio card link layout rule to exist.');
assert.match(
  cardLinkBlockMatch[1],
  /grid-template-rows:\s*auto\s+1fr;/,
  'Expected card link to reserve a stable media row and flexible body row.'
);

assert.ok(cardBodyBlockMatch, 'Expected portfolio card body layout rule to exist.');
assert.doesNotMatch(
  cardBodyBlockMatch[1],
  /min-height:\s*100%;/,
  'Card body must not use min-height: 100% because media + body can overflow and clip the CTA.'
);
assert.match(
  cardBodyBlockMatch[1],
  /grid-template-rows:\s*auto\s+minmax\(0,\s*1fr\)\s+auto;/,
  'Expected card body to keep the CTA in a dedicated final row.'
);

assert.ok(cardTaglineBlockMatch, 'Expected portfolio card tagline rule to exist.');
assert.match(
  cardTaglineBlockMatch[1],
  /-webkit-line-clamp:\s*3;/,
  'Expected long card taglines to clamp before pushing the CTA out of view.'
);

assert.ok(cardCtaBlockMatch, 'Expected portfolio card CTA rule to exist.');
assert.match(
  cardCtaBlockMatch[1],
  /min-height:\s*3\.6rem;/,
  'Expected card CTA to reserve enough vertical space to avoid clipped text.'
);

console.log('portfolio layout tests passed');
