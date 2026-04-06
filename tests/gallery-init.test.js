const test = require('node:test');
const assert = require('node:assert/strict');
const { parsePhotoSwipeSize, resolvePhotoSwipeSize, getGalleryFigureIndex } = require('../js/gallery-init.js');

test('parsePhotoSwipeSize accepts valid dimensions only', () => {
  assert.deepEqual(parsePhotoSwipeSize('251x478'), { w: 251, h: 478 });
  assert.deepEqual(parsePhotoSwipeSize(' 1920x1080 '), { w: 1920, h: 1080 });
  assert.equal(parsePhotoSwipeSize('bad-size'), null);
  assert.equal(parsePhotoSwipeSize('0x1080'), null);
});

test('resolvePhotoSwipeSize prefers loaded thumbnail natural size over fallback data-size', () => {
  const img = {
    naturalWidth: 251,
    naturalHeight: 478,
  };

  const link = {
    getAttribute(name) {
      return name === 'data-size' ? '1400x1000' : null;
    },
    querySelector(selector) {
      return selector === 'img' ? img : null;
    },
  };

  assert.deepEqual(resolvePhotoSwipeSize(link), { w: 251, h: 478 });
});

test('resolvePhotoSwipeSize falls back to parsed data-size when thumbnail size is unavailable', () => {
  const link = {
    getAttribute(name) {
      return name === 'data-size' ? '1600x900' : null;
    },
    querySelector() {
      return { naturalWidth: 0, naturalHeight: 0 };
    },
  };

  assert.deepEqual(resolvePhotoSwipeSize(link), { w: 1600, h: 900 });
});

test('getGalleryFigureIndex scopes slide indexes to the current gallery container only', () => {
  const figureA1 = { nodeType: 1 };
  const figureA2 = { nodeType: 1 };
  const textNode = { nodeType: 3 };
  const groupA = { childNodes: [figureA1, textNode, figureA2] };
  figureA1.parentNode = groupA;
  figureA2.parentNode = groupA;

  const figureB1 = { nodeType: 1 };
  const figureB2 = { nodeType: 1 };
  const groupB = { childNodes: [figureB1, figureB2] };
  figureB1.parentNode = groupB;
  figureB2.parentNode = groupB;

  assert.equal(getGalleryFigureIndex(figureA2), 1);
  assert.equal(getGalleryFigureIndex(figureB1), 0);
  assert.equal(getGalleryFigureIndex({ nodeType: 1, parentNode: { childNodes: [] } }), -1);
});

