# Contributing

For guidance, dataset facts, images, equations or expert recommendations, edit
[guidance](https://github.com/practical-precip/guidance) or
[datasets](https://github.com/practical-precip/datasets). Both repositories explain
online editing and technical PR workflows. Their content is independent of the
site implementation.

The content repositories are private. Invited contributors can edit there; the
public site renders only the published content snapshot and copied assets.

For site code, create a branch and follow the setup/check commands in the
[README](README.md). Keep `.gitmodules` and the two submodule commit pointers in
version control. Content, schemas and figures are assembled from those pointers
before a maintainer build. Public CI uses `published-content.json` instead.
Never hand-edit that snapshot, generated `content/`, or `docs/` files.

The assembler rejects conflicting paper definitions or schemas. The site compiler
also checks cross-repository region/application links. When adding a new region
or application, update both metadata pointers together if dataset guidance uses
that new ID.

The development server watches `metadata/guidance` and `metadata/datasets`.
For experimental content changes, create a branch inside the relevant submodule:

```sh
git -C metadata/datasets switch -c my-content-edit
```

Commit and submit those edits to the dataset repository, then select the merged
commit in this site repository. A site commit does not include uncommitted edits
inside a submodule. Check `git submodule status` and `git status` before publishing.

Browser checks use `scripts/check_regions_browser.mjs`. Configure
`PLAYWRIGHT_MODULE`, `PLAYWRIGHT_EXECUTABLE`, and `PRECIP_SITE_URL` for a local
Playwright installation and a served Pages export. The live-edit check
`scripts/check_content_preview.mjs` temporarily changes a dataset Markdown file
and restores it. Use that check only in an isolated checkout.

A site PR should describe the resulting behavior and tests. If metadata pointers
change, link the content commits and explain any cross-repository changes.

After selecting metadata commits, stage their pointers and run
`npm run snapshot:update` before the Pages build. The snapshot records committed
content only. Publish its JSON and rebuilt `docs/` in the same site commit.
Private repository checks validate author edits. Public site checks validate the
published snapshot and rendering without access to the private repositories.
