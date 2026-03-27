# AGENTS.md

## Project Overview

This repository is a static portfolio site for SunnyFleur / Hoang Kiet built on top of a customized Braxton HTML theme. There is no application framework or build step in the repo root: the HTML, CSS, JS, images, and PDFs committed here are the deployable site.

## Source of Truth

Edit the live site files directly unless the task explicitly says otherwise.

Primary edit targets:
- `index.html` for the main landing page and one-page portfolio sections
- Root standalone pages such as `product_*.html`, `game.html`, `gamepage.html`, `game-embed.html`, `FantasyTactics.html`, and `d.html`
- `project-template.html` when creating a new project detail page
- `css/*.css` for shared styling
- `js/*.js` for shared or page-specific behavior
- `img/`, `fonts/`, and `CV/` for static assets
- `content_*.json` only when a task explicitly involves the related structured content

Treat `source-files/` as vendor/reference material, upstream theme assets, or library source. Do not edit `source-files/` unless the task specifically requires updating a bundled dependency or syncing from an upstream source.

## Working Conventions

- Preserve the current static-site structure. These pages are standalone HTML documents, not reusable components.
- Keep edits targeted. Avoid sweeping theme rewrites unless the task clearly asks for one.
- Preserve existing class names, IDs, and data attributes that power styling or behavior, especially animation and layout hooks such as `animate-in-up`, `animate-card-*`, `data-speed`, `loader`, `header`, and `menu`.
- Before renaming or removing selectors, search for references in both `css/` and `js/`.
- Keep asset paths relative so the site remains portable on static hosting such as GitHub Pages.
- Prefer editing non-minified project files when available. Do not modify bundled vendor assets casually.
- Assume the git worktree may be dirty. Never revert unrelated user changes.

## File Map

- `index.html`: homepage, about, resume, contact, and featured portfolio sections
- `js/app.js`: shared site interactions, scroll behavior, animations, and theme controls
- `js/game.js`: game-related page behavior
- `js/gallery-init.js`: gallery initialization logic
- `css/main.css`: primary shared site styling
- `css/cursor.css`, `css/carousel.css`, `css/loaders/loader.css`: specialized styling layers
- `mail.php`: contact form backend endpoint for PHP-capable hosting

## Page Editing Guidance

- When changing shared navigation, headers, metadata, or footer patterns, check the other root HTML pages for consistency.
- When creating a new project page, start from `project-template.html` instead of copying an arbitrary existing page.
- Keep theme-specific markup intact unless you are deliberately updating the related CSS/JS at the same time.
- If you change the schema or field names in any `content_*.json`, update every consumer in the corresponding HTML or JS in the same task.

## Verification

After making changes, perform lightweight static verification:

- Confirm referenced files, anchors, and relative links still exist
- Confirm modified class or ID names still match CSS and JS selectors
- Confirm any edited standalone page still includes the CSS and JS files it relies on
- If you do not run browser verification, say so explicitly in the handoff
