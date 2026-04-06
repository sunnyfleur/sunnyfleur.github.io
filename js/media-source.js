(function (globalScope) {
  const YOUTUBE_HOSTS = new Set(['www.youtube.com', 'youtube.com', 'm.youtube.com', 'youtu.be']);
  const DRIVE_HOSTS = new Set(['drive.google.com']);
  const FILE_EXTENSION_PATTERN = /\.(mp4|webm|mov)(?:[?#].*)?$/i;

  function emptyResult(value) {
    return {
      kind: 'unknown',
      src: value,
      embedSrc: '',
      id: ''
    };
  }

  function safeParseUrl(value) {
    try {
      return new URL(value, 'https://portfolio.local');
    } catch (error) {
      return null;
    }
  }

  function normalizeYouTube(value, parsedUrl) {
    if (!parsedUrl || !YOUTUBE_HOSTS.has(parsedUrl.hostname)) {
      return null;
    }

    let id = '';

    if (parsedUrl.hostname === 'youtu.be') {
      id = parsedUrl.pathname.replace(/^\//, '').split('/')[0] || '';
    } else if (parsedUrl.pathname.startsWith('/embed/')) {
      id = parsedUrl.pathname.split('/embed/')[1]?.split('/')[0] || '';
    } else if (parsedUrl.pathname === '/watch') {
      id = parsedUrl.searchParams.get('v') || '';
    } else if (parsedUrl.pathname.startsWith('/shorts/')) {
      id = parsedUrl.pathname.split('/shorts/')[1]?.split('/')[0] || '';
    }

    if (!id) {
      return null;
    }

    return {
      kind: 'youtube',
      src: value,
      embedSrc: 'https://www.youtube.com/embed/' + id,
      id
    };
  }

  function normalizeDrive(value, parsedUrl) {
    if (!parsedUrl || !DRIVE_HOSTS.has(parsedUrl.hostname)) {
      return null;
    }

    let id = '';
    const pathMatch = parsedUrl.pathname.match(/\/file\/d\/([^/]+)/i);

    if (pathMatch) {
      id = pathMatch[1];
    } else if (parsedUrl.pathname === '/open' || parsedUrl.pathname === '/uc') {
      id = parsedUrl.searchParams.get('id') || '';
    }

    if (!id) {
      return null;
    }

    return {
      kind: 'drive',
      src: value,
      embedSrc: 'https://drive.google.com/file/d/' + id + '/preview',
      id
    };
  }

  function normalizeFile(value, parsedUrl) {
    const candidate = parsedUrl ? (parsedUrl.pathname + parsedUrl.search + parsedUrl.hash) : value;

    if (!FILE_EXTENSION_PATTERN.test(candidate) && !FILE_EXTENSION_PATTERN.test(value)) {
      return null;
    }

    return {
      kind: 'file',
      src: value,
      embedSrc: value,
      id: ''
    };
  }

  function resolveMediaSource(input) {
    const value = String(input || '').trim();

    if (!value) {
      return emptyResult('');
    }

    const parsedUrl = safeParseUrl(value);
    const youtubeSource = normalizeYouTube(value, parsedUrl);

    if (youtubeSource) {
      return youtubeSource;
    }

    const driveSource = normalizeDrive(value, parsedUrl);

    if (driveSource) {
      return driveSource;
    }

    const fileSource = normalizeFile(value, parsedUrl);

    if (fileSource) {
      return fileSource;
    }

    return emptyResult(value);
  }

  const api = {
    resolveMediaSource
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  globalScope.PortfolioMediaSource = api;
})(typeof window !== 'undefined' ? window : globalThis);