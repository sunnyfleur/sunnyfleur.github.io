# Portfolio Content Workflow

## Source Of Truth

- Edit `projects.json` to add, remove, or update project cards and case-study content.
- The homepage explorer in `index.html` and the shared detail page in `project.html` both read from the same file.
- Prefer this workflow over creating or maintaining another standalone `product_*.html` page.

## Add A Project

1. Add a new object to the `projects` array in `projects.json`.
2. Give it a unique `slug`. The shared page URL becomes `project.html?slug=<slug>`.
3. Add thumbnail and hero assets under `img/`.
4. Fill the core fields first: `title`, `tagline`, `summary`, `type`, `status`, `year`, `platform`, `role`, `teamSize`, `tools`, `thumbnail`, `heroImage`.
5. Add the reading-flow sections: `problem`, `contributions`, `systems`, `results`, `gallery`, `links`.
6. If the case study is not ready, use an honest archive entry instead of filler copy.

## Edit An Existing Project

- Update `summary` when the homepage card and spotlight need tighter copy.
- Update `filters` to control which filter pills expose the project in the homepage explorer.
- Update `gallery` when you add or replace screenshots.
- Update `links` for playable builds, docs, CV downloads, or external videos.

## Field Notes

- `slug`: URL-safe identifier, for example `space-conqueror`
- `type`: short label shown in pills, for example `Personal Project` or `Archive`
- `status`: short production or documentation state
- `featured`: `true` puts the project first in homepage ordering
- `filters`: array of short tags used by the homepage filter buttons
- `role`: array of roles joined into a quick summary
- `tools`: array of tools shown in quick facts
- `systems`: array of cards with `title` and `items`
- `gallery`: array of images with `image`, `fullImage`, `title`, `description`, and optional `size`
- `links`: array of CTA objects with `label`, `url`, and `kind`

## Asset Guidance

- Keep thumbnail and hero images in the same visual family so the explorer feels consistent.
- Prefer landscape images for `thumbnail` and `heroImage`.
- Use `img/og-image.png` only as a temporary fallback.
- If a project has no polished gallery yet, keep one placeholder image and write that status clearly in `description`.

## Legacy Pages

- `product_*.html` and `FantasyTactics.html` are legacy entry points.
- If you need to preserve an old URL, redirect it into `project.html?slug=<slug>` instead of rebuilding the old page.
