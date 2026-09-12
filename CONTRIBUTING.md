# Contributing to the site

For scientific content, edit the Markdown pages in [datasets-and-guidance](https://github.com/practical-precip/datasets-and-guidance). Its contribution guide has instructions for editing online. This repository is for the interface and content tooling.

## Validate a content revision

```sh
gh auth setup-git
git submodule update --init --recursive
npm ci
npm run content:check
npm run test:content
npm run dev
```

Edit files inside `metadata/datasets-and-guidance/` to preview proposed content. Submit scientific changes to that repository first. For a content pull request, fetch its branch inside the submodule, check it out, and run the same checks. This keeps software installation out of the contributor workflow.

## Publish reviewed content

After its pull request is merged, select the exact reviewed commit:

```sh
git -C metadata/datasets-and-guidance fetch origin
git -C metadata/datasets-and-guidance checkout REVIEWED_COMMIT_SHA
git add metadata/datasets-and-guidance
npm run content:check
npm run snapshot:update
npm run test:content
npm run snapshot:check
npm run build:pages
npm run check:export
npm run lint
git add published-content.json docs
git commit -S -m "Publish reviewed precipitation content"
git push
```

`test:content` includes snapshot checks. When changing the selected content commit, run `snapshot:update` before the full test suite so the snapshot matches the newly staged pointer. The update command rejects uncommitted source changes or a pointer that differs from the source checkout.

GitHub Actions rebuilds from the checked-in snapshot and deploys Pages to `/site/`. It needs no private-repository credentials. Review the content and generated assets before publishing because both will become public.

## Markdown conversion

The author format uses Field/Value tables for scalar metadata, headings for groups, lists for simple collections, and tables for collections of records. Free prose follows `## Guidance`. The compiler accepts optional regional pages and combines dataset facts and guidance into the established site schema. Types and conversion code belong here, never in the human content repository.

For browser checks, install Playwright in a local environment and provide `PLAYWRIGHT_MODULE` and `PLAYWRIGHT_EXECUTABLE` if it is not in the default module path. Serve the static export and run `scripts/check_regions_browser.mjs` with `PRECIP_SITE_URL` pointing to `/site`. Run `scripts/check_content_preview.mjs` against a development server on `http://localhost:PORT` to test live Markdown edits and restoration.

The shared bibliography is `metadata/datasets-and-guidance/references.bib`. The site uses a BibTeX parser to handle author lists, braces, string macros, and LaTeX accents. Duplicate keys or fields, malformed entries, and missing support/scope annotations fail validation.
