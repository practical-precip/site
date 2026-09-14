# Practical Precip site

The [public website](https://practical-precip.github.io/site/) starts with links to general information, the [guidance matrix](https://practical-precip.github.io/site/matrix/), and the dataset catalog. The editable source lives in the public [datasets-and-guidance repository](https://github.com/practical-precip/datasets-and-guidance).

Contributors edit NestedText datasets and definitions, Markdown guidance, and a shared BibTeX bibliography there. This repository owns the interface, content conversion, schemas, validation, and publication. Each dataset .nt file combines metadata and Markdown prose in a standard multiline string. INDEX.md alone defines dataset names, IDs, aliases, and order. Guidance boxes remain separate Markdown pages.

## Work on the interface

Anyone can build the published website from its public snapshot:

```sh
git clone https://github.com/practical-precip/site.git
cd site
npm ci
SITE_CONTENT_MODE=snapshot npm run dev
```

Use Node.js 22.13 or later. For a static export, run `SITE_CONTENT_MODE=snapshot npm run build:pages` and `npm run check:export`.

## Work with editable content

Contributors can initialize the content submodule to work with editable sources:

```sh
gh auth setup-git
git submodule update --init --recursive
npm ci
npm run dev
```

The development server watches `metadata/datasets-and-guidance/`. Changes to NestedText, Markdown, BibTeX, or assets refresh the preview. Conversion errors identify the source file. See [CONTRIBUTING.md](CONTRIBUTING.md) for validation and publishing.

The site currently pins an older content revision. Its converter still expects `guidance/applications/` and `guidance/cells/`; update the converter before advancing the submodule to the new `guidance/important-for-user/` layout.

## How content reaches the site

The submodule records one exact content commit. A maintainer selects a reviewed revision, runs conversion and validation, and generates a public snapshot. GitHub Actions builds and deploys that snapshot. The website does not fetch repository files at runtime.

The snapshot and rendered assets are public. A content merge does not publish automatically.

`scripts/dataset-content.mjs` reads standard NestedText using the published `nestedtext` parser, then converts field types with the site schema. It reads dataset identities and order from ordinary links in `INDEX.md`. Dataset names and IDs are not repeated in `.nt` files. `Regions.nt` and `guidance/Table.nt` use the same NestedText parser and schema conversion. `scripts/markdown-content.mjs` reads guidance boxes and application pages. `scripts/prepare-content.mjs` assembles disposable YAML into ignored `content/`, and `scripts/content.mjs` validates and compiles it. References come from `references.bib`. All conversion code stays in this repository.

The original personal-account mockup remains at [its original address](https://cameronbracken.github.io/pcef_workshop_site_mockup/) with a banner linking here.

The [session transcript](notes/2026-09-11-session-transcript.md) records how the site and content workflow developed. [VALIDATION.md](VALIDATION.md) records checks and their limits.
