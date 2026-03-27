# Portfolio Guide Design

## Goal

Create a standalone HTML page for the repo owner to quickly understand how to update portfolio content without reading technical implementation files.

## Audience

- Primary audience: the portfolio owner / maintainer
- Not intended for public site visitors
- Not intended as a technical specification for developers

## Scope

The guide should explain:

- Which file to open for each common content task
- How to add or update a project using `projects.json`
- How the shared `project.html` page relates to project content
- How to update homepage content in `index.html`
- How to replace images, CV files, and external links
- How to run the existing static verification script before publishing
- Common mistakes to avoid

The guide should not focus on:

- Legacy `product_*.html` pages
- Low-level JavaScript or CSS implementation details
- Public navigation integration

## Format

- File name: `portfolio-guide.html`
- Standalone page at repo root
- Written in Vietnamese
- Task-oriented layout with concise steps, quick-reference blocks, and one practical JSON example

## Content Structure

1. Purpose and quick rules
2. File map for common tasks
3. How to edit an existing project
4. How to add a new project
5. How to edit homepage sections
6. How to replace images, CVs, and links
7. Pre-publish checklist
8. Common mistakes and how to avoid them

## Design Notes

- Use a clean standalone layout that still feels visually related to the portfolio
- Prefer readable cards, checklists, and small code samples over long prose
- Keep all styling inside the HTML file to preserve the “one file, open when needed” workflow
