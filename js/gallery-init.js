// ------------------------------------------------
// Author: dimsemenov
// Author URI: https://github.com/dimsemenov
// File name: gallery-init.js
// https://codepen.io/dimsemenov/pen/ZYbPJM
// ------------------------------------------------

(function (global) {
    var FALLBACK_PHOTOSWIPE_SIZE = { w: 1400, h: 1000 };
    var nextGalleryUID = 1;

    var parsePhotoSwipeSize = function(value) {
        var match = /^(\d+)\s*x\s*(\d+)$/i.exec(String(value || '').trim());

        if(!match) {
            return null;
        }

        var width = parseInt(match[1], 10);
        var height = parseInt(match[2], 10);

        if(!width || !height || width < 1 || height < 1) {
            return null;
        }

        return { w: width, h: height };
    };

    var getThumbnailImage = function(linkEl) {
        if(!linkEl) {
            return null;
        }

        if(typeof linkEl.querySelector === 'function') {
            return linkEl.querySelector('img');
        }

        if(linkEl.children && linkEl.children.length > 0) {
            return linkEl.children[0];
        }

        return null;
    };

    var getNaturalThumbnailSize = function(linkEl) {
        var thumbnail = getThumbnailImage(linkEl);

        if(!thumbnail) {
            return null;
        }

        var width = parseInt(thumbnail.naturalWidth, 10);
        var height = parseInt(thumbnail.naturalHeight, 10);

        if(!width || !height || width < 1 || height < 1) {
            return null;
        }

        return { w: width, h: height };
    };

    var resolvePhotoSwipeSize = function(linkEl) {
        return getNaturalThumbnailSize(linkEl)
            || parsePhotoSwipeSize(linkEl && linkEl.getAttribute && linkEl.getAttribute('data-size'))
            || FALLBACK_PHOTOSWIPE_SIZE;
    };

    var getGalleryFigureIndex = function(figureEl) {
        var childNodes = figureEl && figureEl.parentNode && figureEl.parentNode.childNodes;
        var nodeIndex = 0;

        if(!childNodes) {
            return -1;
        }

        for(var i = 0; i < childNodes.length; i++) {
            if(childNodes[i].nodeType !== 1) {
                continue;
            }

            if(childNodes[i] === figureEl) {
                return nodeIndex;
            }

            nodeIndex++;
        }

        return -1;
    };

    var galleryInitApi = {
        parsePhotoSwipeSize: parsePhotoSwipeSize,
        resolvePhotoSwipeSize: resolvePhotoSwipeSize,
        getGalleryFigureIndex: getGalleryFigureIndex,
    };

    if(typeof module !== 'undefined' && module.exports) {
        module.exports = galleryInitApi;
    }

    global.GalleryInitUtils = galleryInitApi;

    if(typeof document === 'undefined') {
        return;
    }

    var matchesSelector = function(el, selector) {
        if(!el || !selector) {
            return false;
        }

        if(typeof el.matches === 'function') {
            return el.matches(selector);
        }

        if(selector.charAt(0) === '.' && el.classList) {
            return el.classList.contains(selector.slice(1));
        }

        return false;
    };

    var initPhotoSwipeFromDOM = function(gallerySelector, options) {
        options = options || {};

        var parseThumbnailElements = function(el) {
            var thumbElements = el && el.childNodes ? el.childNodes : [];
            var items = [];
            var figureEl;
            var linkEl;
            var size;
            var item;

            for(var i = 0; i < thumbElements.length; i++) {
                figureEl = thumbElements[i];

                if(figureEl.nodeType !== 1) {
                    continue;
                }

                linkEl = figureEl.children && figureEl.children[0];
                if(!linkEl) {
                    continue;
                }

                size = resolvePhotoSwipeSize(linkEl);

                if(linkEl.setAttribute) {
                    linkEl.setAttribute('data-size', size.w + 'x' + size.h);
                }

                item = {
                    src: linkEl.getAttribute('href'),
                    w: size.w,
                    h: size.h
                };

                if(figureEl.children.length > 1) {
                    item.title = figureEl.children[1].innerHTML;
                }

                if(linkEl.children.length > 0) {
                    item.msrc = linkEl.children[0].getAttribute('src');
                }

                item.el = figureEl;
                items.push(item);
            }

            return items;
        };

        var closest = function closest(el, fn) {
            return el && (fn(el) ? el : closest(el.parentNode, fn));
        };

        var onThumbnailsClick = function(e) {
            e = e || window.event;
            e.preventDefault ? e.preventDefault() : e.returnValue = false;

            var eTarget = e.target || e.srcElement;
            var clickedListItem = closest(eTarget, function(el) {
                return el.tagName && el.tagName.toUpperCase() === 'FIGURE';
            });

            if(!clickedListItem) {
                return;
            }

            var clickedGallery = closest(clickedListItem.parentNode, function(el) {
                return matchesSelector(el, gallerySelector);
            }) || clickedListItem.parentNode;
            var index = getGalleryFigureIndex(clickedListItem);

            if(index >= 0) {
                openPhotoSwipe(index, clickedGallery);
            }

            return false;
        };

        var photoswipeParseHash = function() {
            var hash = window.location.hash.substring(1);
            var params = {};

            if(hash.length < 5) {
                return params;
            }

            var vars = hash.split('&');
            for (var i = 0; i < vars.length; i++) {
                if(!vars[i]) {
                    continue;
                }
                var pair = vars[i].split('=');
                if(pair.length < 2) {
                    continue;
                }
                params[pair[0]] = pair[1];
            }

            if(params.gid) {
                params.gid = parseInt(params.gid, 10);
            }

            return params;
        };

        var openPhotoSwipe = function(index, galleryElement, disableAnimation, fromURL) {
            var pswpElement = document.querySelectorAll('.pswp')[0];
            var gallery;
            var options;
            var items = parseThumbnailElements(galleryElement);

            options = {
                showHideOpacity: true,
                galleryUID: galleryElement.getAttribute('data-pswp-uid'),
                getThumbBoundsFn: function(index) {
                    var thumbnail = items[index].el.getElementsByTagName('img')[0];
                    var pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
                    var rect = thumbnail.getBoundingClientRect();

                    return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};
                }
            };

            if(fromURL) {
                if(options.galleryPIDs) {
                    for(var j = 0; j < items.length; j++) {
                        if(items[j].pid == index) {
                            options.index = j;
                            break;
                        }
                    }
                } else {
                    options.index = parseInt(index, 10) - 1;
                }
            } else {
                options.index = parseInt(index, 10);
            }

            if(isNaN(options.index)) {
                return;
            }

            if(disableAnimation) {
                options.showAnimationDuration = 0;
            }

            gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
            gallery.init();
        };

        var galleryElements = document.querySelectorAll(gallerySelector);

        for(var i = 0; i < galleryElements.length; i++) {
            var existingUID = parseInt(galleryElements[i].getAttribute('data-pswp-uid'), 10);
            if(existingUID && existingUID >= nextGalleryUID) {
                nextGalleryUID = existingUID + 1;
            }

            if(!galleryElements[i].getAttribute('data-pswp-uid')) {
                galleryElements[i].setAttribute('data-pswp-uid', nextGalleryUID++);
            }

            if(galleryElements[i].getAttribute('data-pswp-bound') === 'true') {
                continue;
            }

            galleryElements[i].onclick = onThumbnailsClick;
            galleryElements[i].setAttribute('data-pswp-bound', 'true');
        }

        if(options.refreshOnly) {
            return;
        }

        var hashData = photoswipeParseHash();
        if(hashData.pid && hashData.gid && galleryElements[hashData.gid - 1]) {
            openPhotoSwipe(hashData.pid, galleryElements[hashData.gid - 1], true, true);
        }
    };

    global.initPhotoSwipeFromDOM = initPhotoSwipeFromDOM;

    initPhotoSwipeFromDOM('.my-gallery');
})(typeof window !== 'undefined' ? window : globalThis);
