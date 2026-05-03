# Portfolio Content Workflow

## Source Of Truth

- Edit `projects.json` to add, remove, or update project cards and case-study content.
- The homepage explorer in `index.html` and the shared detail page in `project.html` both read from the same file.
- Prefer this workflow over creating or maintaining another standalone `product_*.html` page.

## Add A Project

1. Add a new object to the `projects` array in `projects.json`.
2. Give it a unique `slug`. The shared page URL becomes `project.html?slug=<slug>`.
3. If the project replaces an older portfolio name, add `legacySlugs` so old URLs can still resolve to the new canonical slug.
4. Add thumbnail and hero assets under `img/`.
5. Fill the core fields first: `title`, `tagline`, `summary`, `type`, `status`, `year`, `platform`, `role`, `teamSize`, `tools`, `thumbnail`, `heroImage`.
6. Add the reading-flow sections: `problem`, `contributions`, `systems`, `results`, `gallery` or `galleryGroups`, and `links`.
7. If the case study is not ready, use an honest archive entry instead of filler copy.

## Edit An Existing Project

- Update `summary` when the homepage card and spotlight need tighter copy.
- Update `filters` to control which filter pills expose the project in the homepage explorer.
- Update `gallery` when you add or replace screenshots, or switch to `galleryGroups` when a project has multiple clear workstreams.
- If a project has a matching folder under `img/ExampleImages/<ProjectName>/`, keep the detail `gallery` or grouped `galleryGroups[*].items` synced to the real folder contents instead of curating only one or two images.
- Update `links` for playable builds, docs, CV downloads, or external videos.

## Homepage Explorer And Spotlight

- Set `featured: true` only if you want to preserve featured metadata for future spotlight or curation needs.
- Add `cardSummary` for the shorter homepage card description.
- Add `homepageMeta.duration` for the short info pill text shown on the homepage card.
- Add `homepageMeta.linkLabel` for the second homepage meta label.
- Use `video` when the homepage spotlight and shared detail page should offer inline preview playback.
- Keep `cardSummary` short enough to stay readable in 2 to 4 lines on desktop.

## Video Sources

The `video` field accepts:
- YouTube watch URLs, for example `https://www.youtube.com/watch?v=OjqH6ry5Txc`
- YouTube embed URLs, for example `https://www.youtube.com/embed/PD-p8LtxGlE`
- Google Drive share URLs, for example `https://drive.google.com/file/d/FILE123/view?usp=sharing`
- Google Drive open or direct links, for example `https://drive.google.com/open?id=FILE123` or `https://drive.google.com/uc?id=FILE123`
- Local `.mp4`, `.webm`, or `.mov` paths, for example `img/previews/demo.mp4`

If `video` is empty or unsupported, the homepage card will stay on its poster image instead of trying to render a broken player.

## Field Notes

- `slug`: URL-safe identifier, for example `space-conqueror`
- `legacySlugs`: optional array of older slugs that should redirect into the canonical `slug`
- `type`: short label shown in pills, for example `Personal Project` or `Archive`
- `status`: short production or documentation state
- `featured`: optional metadata for featured curation or future homepage variants
- `cardSummary`: shorter copy used by the homepage featured carousel card
- `homepageMeta`: homepage-only meta block with `duration` and `linkLabel`
- `filters`: array of short tags used by the homepage filter buttons
- `role`: array of roles joined into a quick summary
- `tools`: array of tools shown in quick facts
- `systems`: array of cards with `title` and `items`
- `gallery`: flat array of images with `image`, `fullImage`, `title`, `description`, and optional `size` or `layout`; use `image` for the grid thumbnail and `fullImage` for the lightbox source when the original asset is heavy
- `galleryGroups`: optional array of grouped gallery blocks with `title`, `intro`, and `items` using the same image shape as `gallery`
- `links`: array of CTA objects with `label`, `url`, and `kind`

## Asset Guidance

- Keep thumbnail and hero images in the same visual family so the explorer feels consistent.
- Prefer landscape images for `thumbnail` and `heroImage`.
- Use `img/og-image.png` only as a temporary fallback.
- If a project has a dedicated image folder, keep `thumbnail` as a lightweight optimized asset under `img/ExampleImages/Thumbs/` and keep `heroImage` pointed at the fuller presentation image.
- For screenshot-heavy project galleries, keep optimized gallery thumbnails in a local `Thumbs/` folder and keep `fullImage` pointed at the original screenshot.
- If a project has no polished gallery yet, keep one placeholder image and write that status clearly in `description`.

## Legacy Pages

- `product_*.html` and `FantasyTactics.html` are legacy entry points.
- If you need to preserve an old URL, redirect it into `project.html?slug=<slug>` instead of rebuilding the old page.
