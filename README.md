# Practical Precip site

The [public website](https://practical-precip.github.io/site/) provides general information, a
guidance matrix, and a precipitation dataset catalog. Editable scientific content lives in the
public [datasets-and-guidance repository](https://github.com/practical-precip/datasets-and-guidance).

Contributors edit YAML dataset metadata, Markdown guidance, and a shared BibTeX bibliography there.
This repository owns the interface, website configuration, content assembly, schemas, validation,
and publication. [INDEX.md](https://github.com/practical-precip/datasets-and-guidance/blob/main/INDEX.md)
defines dataset names, IDs, aliases, order, and links to each metadata and guidance file.

## Work on the interface

Anyone can build the published website from its public snapshot:

```sh
git clone https://github.com/practical-precip/site.git
cd site
npm ci
SITE_CONTENT_MODE=snapshot npm run dev
```

Use Node.js 22.13 or later. For a static export, run
`SITE_CONTENT_MODE=snapshot npm run build:pages` followed by `npm run check:export`.

## Work with editable content

Initialize the content submodule to preview editable sources:

```sh
gh auth setup-git
git submodule update --init --recursive
npm ci
npm run dev
```

The development server watches `metadata/datasets-and-guidance/`. Changes to YAML, Markdown,
BibTeX, or assets refresh the preview. Assembly and validation errors identify the source file. See
[CONTRIBUTING.md](CONTRIBUTING.md) for validation and publishing steps.

## Website configuration

- `config/regions.yaml` defines region IDs, display names, state membership, and map label positions.
- `config/guidance-table.yaml` defines guidance columns and application order.

These files are build configuration, not public assets. Two digit state FIPS codes are quoted so
YAML preserves leading zeros.

## How content reaches the site

The submodule records one exact content commit. A maintainer selects a reviewed revision, assembles
and validates it, then generates a public snapshot. GitHub Actions builds and deploys the snapshot.
The website does not fetch repository files at runtime.

`scripts/dataset-content.mjs` reads paired YAML metadata and Markdown guidance using the links in
`INDEX.md`. `scripts/markdown-content.mjs` reads application and matrix guidance.
`scripts/prepare-content.mjs` assembles disposable content in `content/`, and
`scripts/content.mjs` validates and compiles it. References come from `references.bib`.

The original personal account mockup remains at
[its original address](https://cameronbracken.github.io/pcef_workshop_site_mockup/) with a banner
linking here. [VALIDATION.md](VALIDATION.md) records checks and their limits.
