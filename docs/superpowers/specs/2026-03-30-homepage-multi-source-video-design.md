# Homepage Multi-Source Video Support Design

## Overview

Extend the homepage featured project carousel so a project `video` field can support multiple source types without introducing a more complex public schema in `projects.json`.

The existing portfolio currently assumes a YouTube embed URL and renders it directly inside an iframe. That works for some featured projects, but it breaks down when a video cannot be uploaded to YouTube or when YouTube embedding is blocked. The new design keeps the data format simple for content editing while making the renderer smarter.

## Goals

- Keep `projects.json` simple by continuing to use a single `video` field.
- Support three input types:
  - YouTube URLs
  - Google Drive shared URLs
  - direct/local video files such as `.mp4`, `.webm`, and `.mov`
- Preserve the current homepage interaction model:
  - poster first
  - user clicks play
  - preview opens inside the card
- Keep a stable fallback when the source is missing or unsupported.

## Non-Goals

- No full media CMS or large schema redesign.
- No autoplaying all cards at once.
- No attempt to make Google Drive behave like a polished streaming CDN.
- No project-detail-page refactor in this pass, though the detection logic should be reusable later.

## Data Contract

### Keep the Existing Field

The public content schema remains:

```json
{
  "video": "..."
}
```

There is no required `videoType` field for authors to maintain.

### Supported Input Forms

The renderer should infer source type from the `video` value:

- YouTube:
  - `https://www.youtube.com/embed/...`
  - `https://www.youtube.com/watch?v=...`
  - `https://youtu.be/...`
- Google Drive:
  - `https://drive.google.com/file/d/<id>/view?...`
  - `https://drive.google.com/open?id=<id>`
  - `https://drive.google.com/uc?id=<id>`
- File/local video:
  - relative project paths such as `img/previews/huli-preview.mp4`
  - direct URLs ending in `.mp4`, `.webm`, or `.mov`

If the value is absent or cannot be resolved, the card should fall back to its existing image/poster behavior with no playable preview.

## Media Resolution Rules

### YouTube

- Normalize any supported YouTube input into an embeddable YouTube URL.
- Preserve the existing playback flags used by the homepage card preview:
  - autoplay
  - mute
  - controls
  - loop
  - playsinline

### Google Drive

- Extract the Drive file id.
- Convert the public shared URL into a preview/embed-friendly URL.
- Treat Drive as iframe-based media, not as a raw `<video>` source.
- If a Drive URL does not contain a valid file id, the renderer should fail safely back to the poster state.

### Local or Direct Video File

- Render with a native `<video>` element.
- Use muted inline playback suitable for a small preview card.
- Keep controls enabled or minimal depending on the homepage card behavior already established in the UX.

## Rendering Behavior

### Homepage Featured Carousel

The homepage card preview keeps the current behavior:

- image/poster is shown first
- play is explicit
- clicking play swaps the poster area to active media
- stop closes the active media and returns to the poster

The only change is that the active media renderer becomes source-aware:

- YouTube -> iframe
- Google Drive -> iframe
- local/direct video -> native `<video>`

### Fallback

If resolution fails:

- keep the poster visible
- do not render a broken player
- optionally keep or show a simple `Open video` link only if a valid source URL still exists

For the first pass, the minimum requirement is graceful fallback to the poster state.

## UX Constraints

- The play interaction should remain the same visually as the current homepage carousel.
- No hover-only behavior should be introduced.
- Card layout should not shift when the player opens.
- The same source should be stoppable and return cleanly to the poster.
- Google Drive and YouTube embeds should stay contained inside the card without overflowing or breaking rounded corners.

## Authoring Guidance

Content authors should be able to do any of the following in `projects.json`:

- paste a normal YouTube watch URL
- paste a YouTube embed URL
- paste a Google Drive share URL
- point to a local `.mp4` or `.webm` file in the repo

This keeps the content workflow simple and avoids teaching a second schema just for video source types.

## Technical Approach

- Add a small media-source resolver in the homepage carousel script.
- Split the current `buildVideoUrl` logic into:
  - source detection
  - source normalization
  - source-specific player rendering
- Keep the output renderer narrow and explicit so card media remains easy to reason about.

The resolver should return a normalized object shaped conceptually like:

```js
{
  kind: "youtube" | "drive" | "file" | "unknown",
  src: "...",
  embedSrc: "..."
}
```

This structure is internal only and does not change `projects.json`.

## Files in Scope

- `js/portfolio-index.js`
- `projects.json` only where content values need to be corrected for testing
- homepage verification or content guidance files only if they need schema notes updated

Project detail support is intentionally out of scope for this pass, but the resolver should be written in a way that can be reused there later.

## Acceptance Criteria

- Homepage carousel accepts standard YouTube watch links, YouTube embed links, Google Drive share links, and local video file paths in the `video` field.
- Existing poster-first play interaction still works.
- Unsupported or malformed video values do not render broken embeds.
- Google Drive links resolve through the homepage preview path without forcing a schema change.
- The current content-editing workflow remains simple: authors still edit a single `video` field.
