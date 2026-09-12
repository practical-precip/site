# Practical Precip site

The [public website](https://practical-precip.github.io/site/) presents precipitation dataset information and application guidance. The editable source lives in the private [datasets-and-guidance repository](https://github.com/practical-precip/datasets-and-guidance).

Contributors edit Markdown there. This repository owns the interface, Markdown conversion, schemas, validation, and publication. Dataset pages combine metadata and prose; guidance boxes remain separate Markdown pages.

## Work on the interface

Anyone can build the published website without access to the private repository:

```sh
git clone https://github.com/practical-precip/site.git
cd site
npm ci
SITE_CONTENT_MODE=snapshot npm run dev
```

Use Node.js 22.13 or later. For a static export, run `SITE_CONTENT_MODE=snapshot npm run build:pages` and `npm run check:export`.

## Work with editable content

Invited contributors with repository access can initialize the single content submodule:

```sh
gh auth setup-git
git submodule update --init --recursive
npm ci
npm run dev
```

The development server watches `metadata/datasets-and-guidance/`. Changes to Markdown or assets refresh the preview. Conversion errors identify the source file. See [CONTRIBUTING.md](CONTRIBUTING.md) for validation and publishing.

## How content reaches the site

The submodule records one exact content commit. A maintainer selects a reviewed revision, runs conversion and validation, and generates a public snapshot. GitHub Actions builds and deploys that snapshot without credentials for the private repository. No browser requests private GitHub files, and no private access token is shipped to visitors.

The snapshot and rendered assets are intentionally public. The content repository's private status restricts access and editing; it does not make published guidance confidential. A content merge does not publish automatically.

`scripts/markdown-content.mjs` reads Markdown tables, lists, and guidance prose. `scripts/markdown-layout.json` describes field types and singleton indexes. Dataset, application, and guidance files are discovered by directory, so adding a page does not require changing code. `scripts/prepare-content.mjs` assembles disposable YAML into ignored `content/`. `scripts/content.mjs` validates it and compiles the site data. References are read from its single `references.bib` file by `scripts/bibliography.mjs`. Citation keys, standard bibliographic fields, and the custom `support` and `scope` fields are validated. No conversion tools live in the human content repository.

The original personal-account mockup remains at [its original address](https://cameronbracken.github.io/pcef_workshop_site_mockup/) with a banner linking here.

The [session transcript](notes/2026-09-11-session-transcript.md) records how the site and content workflow developed. [VALIDATION.md](VALIDATION.md) records checks and their limits.
