# Practical Precip website

The [site](https://practical-precip.github.io/pcef_workshop_site_mockup/) presents
precipitation evaluation guidance and a searchable dataset catalog.

Content lives in two independent repositories:

- [guidance](https://github.com/practical-precip/guidance): table definitions,
  regions, Markdown guidance, citations and figures.
- [datasets](https://github.com/practical-precip/datasets): dataset facts,
  familiar names, source crosswalks and Markdown recommendations.

To contribute content, use the guides in those repositories. GitHub's web editor
is enough. This repository controls the site's presentation and publishing.

The metadata repositories are private for invited contributors. The website and
its selected content are public. The site stores a generated publication snapshot
so public builds do not need credentials for private repositories.

## Run the site with metadata access

Use Node.js 22.13 or newer:

```sh
git clone --recurse-submodules https://github.com/practical-precip/pcef_workshop_site_mockup.git
cd pcef_workshop_site_mockup
npm ci
npm run dev
```

For an existing checkout, run `git submodule update --init --recursive` first.
`npm run dev` assembles the selected metadata and watches edits in both content
repositories. Do not edit `content/`, `app/generated/`, or `public/content-assets/`:
they are ignored, generated copies.

```sh
npm run content:check
npm run test:content
npm run build:pages
npm run check:export
npm run lint
```

## Update the content used by the site

A submodule is a pointer to an exact commit in another repository. It preserves
which content was used for a site build without coupling content to React.
Merging a metadata PR does not automatically publish it. On a site branch,
fetch and select the reviewed commits, then stage their pointers:

```sh
git submodule update --init --recursive
git -C metadata/guidance fetch origin
git -C metadata/guidance checkout COMMIT_SHA
git -C metadata/datasets fetch origin
git -C metadata/datasets checkout COMMIT_SHA
git add metadata/guidance metadata/datasets
npm run snapshot:update
npm run build:pages
npm run check:export
npm run test:content
npm run lint
git add published-content.json docs
```

Only update the repository that changed. Review the diff and submit a site PR.
`snapshot:update` requires clean, committed metadata and matching staged pointers.
The snapshot records the two source commits and a checksum. Do not edit it by hand.

## Work on the public site without metadata access

Clone without `--recurse-submodules`, then use the published snapshot:

```sh
npm ci
SITE_CONTENT_MODE=snapshot npm run dev
# Or build the Pages export:
SITE_CONTENT_MODE=snapshot npm run build:pages
SITE_CONTENT_MODE=snapshot npm run check:export
```

Public CI validates the snapshot's checksum and source pointers, builds the site,
and checks the exported pages. It does not fetch private sources. The standalone
metadata checks run in the private repositories. Maintainers run the full source
and integration tests before updating the publication snapshot.

GitHub Actions builds the public snapshot on `main` and deploys the validated
artifact to Pages. Committed `docs/` remains the reviewable export and asset source.
The snapshot and published
assets in `docs/content-assets/` reproduce the selected content without exposing
private notes or contributor discussions. GitHub refused deploy keys for these
repositories, so this workflow needs no private-repository credential in the
public site's Actions jobs.

See [CONTRIBUTING.md](CONTRIBUTING.md), [validation history](VALIDATION.md), and
[session transcript](notes/2026-09-11-session-transcript.md).
