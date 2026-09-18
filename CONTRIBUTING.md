# Contributing to the site

For scientific content, edit the YAML metadata or Markdown guidance in
[datasets-and-guidance](https://github.com/practical-precip/datasets-and-guidance). Its contribution
guide covers online editing. This repository owns the interface, website configuration, and content
tooling.

## Validate a content revision

```sh
gh auth setup-git
git submodule update --init --recursive
npm ci
npm run content:check
npm run test:content
npm run dev
```

Edit files inside `metadata/datasets-and-guidance/` to preview proposed content. Submit scientific
changes to that repository first. For a content pull request, fetch its branch inside the submodule,
check it out, and run the same checks.

## Content contract

Each dataset has two files with the same stable filename stem:

- `datasets/<id>.yaml` contains structured facts.
- `guidance/datasets/<id>.md` contains YAML front matter and Markdown prose.

`INDEX.md` links both files and defines the dataset name, aliases, ID, and display order. Adding a
dataset requires those two files and one index entry. The parser rejects missing, unlisted,
duplicated, or mismatched files.

Application pages and matrix cells remain Markdown. The shared bibliography is
`metadata/datasets-and-guidance/references.bib`. Website regions and guidance table layout live in
`config/regions.yaml` and `config/guidance-table.yaml`.

## Publish reviewed content

After the content pull request is merged, select its exact commit:

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

`test:content` includes snapshot checks. When the selected content commit changes, run
`snapshot:update` before the full suite so the snapshot matches the staged submodule pointer. The
update rejects uncommitted source changes or a pointer that differs from the source checkout.

GitHub Actions rebuilds from the checked in snapshot and deploys Pages to `/site/`. Review content
and generated assets before publishing because both become public.
