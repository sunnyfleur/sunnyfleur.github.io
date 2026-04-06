const assert = require('node:assert/strict');
const { resolveMediaSource } = require('../js/media-source.js');

assert.equal(
  resolveMediaSource('https://www.youtube.com/watch?v=OjqH6ry5Txc').kind,
  'youtube'
);

assert.equal(
  resolveMediaSource('https://www.youtube.com/embed/PD-p8LtxGlE').embedSrc,
  'https://www.youtube.com/embed/PD-p8LtxGlE'
);

assert.equal(
  resolveMediaSource('https://youtu.be/OjqH6ry5Txc').id,
  'OjqH6ry5Txc'
);

assert.equal(
  resolveMediaSource('https://drive.google.com/file/d/FILE123/view?usp=sharing').embedSrc,
  'https://drive.google.com/file/d/FILE123/preview'
);

assert.equal(
  resolveMediaSource('https://drive.google.com/open?id=FILE456').embedSrc,
  'https://drive.google.com/file/d/FILE456/preview'
);

assert.equal(
  resolveMediaSource('https://drive.google.com/uc?id=FILE789').embedSrc,
  'https://drive.google.com/file/d/FILE789/preview'
);

assert.equal(
  resolveMediaSource('img/previews/demo.mp4').kind,
  'file'
);

assert.equal(
  resolveMediaSource('img/previews/demo.webm').kind,
  'file'
);

assert.equal(
  resolveMediaSource('').kind,
  'unknown'
);

console.log('media-source resolver tests passed');