import test from "node:test";
import assert from "node:assert/strict";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import yaml from "js-yaml";
import { loadContent, projectRoot } from "./content.mjs";
function fixture(fn) {
  const root = mkdtempSync(join(tmpdir(), "pcef-content-"));
  try {
    cpSync(join(projectRoot, "content"), join(root, "content"), {
      recursive: true,
    });
    mkdirSync(join(root, "app"));
    cpSync(
      join(projectRoot, "app/us-states.json"),
      join(root, "app/us-states.json"),
    );
    cpSync(join(projectRoot, "public"), join(root, "public"), {
      recursive: true,
    });
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
function edit(root, file, fn) {
  const p = join(root, "content", file);
  const x = yaml.load(readFileSync(p, "utf8"), { schema: yaml.JSON_SCHEMA });
  fn(x);
  writeFileSync(p, yaml.dump(x));
}
function replace(root, file, from, to) {
  const p = join(root, "content", file);
  writeFileSync(p, readFileSync(p, "utf8").replace(from, to));
}
test("row and column reordering preserves cell identity", () =>
  fixture((root) => {
    const before = loadContent(root);
    edit(root, "table.yaml", (x) => {
      x.rows.reverse();
      x.columns.reverse();
    });
    const after = loadContent(root);
    assert.equal(after.topics[0].id, before.topics.at(-1).id);
    assert.equal(
      after.topics[0].cells[0].body,
      before.topics.at(-1).cells.at(-1).body,
    );
  }));
test("new application without a figure and new column need no UI edits", () =>
  fixture((root) => {
    edit(root, "table.yaml", (x) => {
      x.rows.push("new-application");
      x.columns.push({
        id: "new-property",
        title: "New property",
        subtitle: "Test",
        definition: "Test definition",
      });
    });
    for (const row of loadContent().topics)
      edit(
        root,
        `rows/${row.id}.yaml`,
        (x) => (x.cells["new-property"] = null),
      );
    const template = yaml.load(
      readFileSync(
        join(root, "content/rows/annual-precipitation.yaml"),
        "utf8",
      ),
    );
    template.id = "new-application";
    delete template.figure;
    template.cells = Object.fromEntries(
      [...loadContent().columns.map((c) => c.id), "new-property"].map((id) => [
        id,
        null,
      ]),
    );
    writeFileSync(
      join(root, "content/rows/new-application.yaml"),
      yaml.dump(template),
    );
    const result = loadContent(root);
    assert.equal(result.topics.length, 6);
    assert.equal(result.topics.at(-1).cells.length, 7);
    assert.equal(result.topics.at(-1).figure, undefined);
  }));
test("unknown citations fail with the Markdown filename", () =>
  fixture((root) => {
    replace(
      root,
      "cells/annual-precipitation/spatial.md",
      "## Basin aggregation",
      "[@missing-paper]\n\n## Basin aggregation",
    );
    assert.throws(
      () => loadContent(root),
      /spatial.md: unknown paper missing-paper/,
    );
  }));
test("bad priority and misspelled metadata are rejected", () =>
  fixture((root) => {
    replace(
      root,
      "cells/annual-precipitation/spatial.md",
      "priority: context",
      "priority: urgent",
    );
    assert.throws(() => loadContent(root), /allowed values/);
  }));
test("unknown column and missing cells fail", () =>
  fixture((root) => {
    edit(root, "rows/annual-precipitation.yaml", (x) => delete x.cells.spatial);
    assert.throws(() => loadContent(root), /missing column spatial/);
  }));
test("unknown regions fail", () =>
  fixture((root) => {
    replace(
      root,
      "cells/annual-precipitation/spatial.md",
      "northwest:",
      "unknown-region:",
    );
    assert.throws(() => loadContent(root), /unknown region/);
  }));
test("expert review requires named reviewers and date", () =>
  fixture((root) => {
    replace(
      root,
      "cells/annual-precipitation/spatial.md",
      "status: draft",
      "status: expert-reviewed",
    );
    assert.throws(() => loadContent(root), /reviewed_by/);
  }));
test("broken images and malformed math fail", () =>
  fixture((root) => {
    replace(
      root,
      "cells/annual-precipitation/spatial.md",
      "/figures/annual-precipitation.png",
      "/figures/missing.png",
    );
    assert.throws(() => loadContent(root), /missing public asset/);
    replace(
      root,
      "cells/annual-precipitation/spatial.md",
      "/figures/missing.png",
      "/figures/annual-precipitation.png",
    );
    replace(
      root,
      "cells/annual-precipitation/spatial.md",
      "\\bar{P}",
      "\\unknownCommand{P}",
    );
    assert.throws(() => loadContent(root), /invalid equation/);
  }));
test("duplicate YAML keys, traversal, raw HTML, and unsafe links fail", () =>
  fixture((root) => {
    const p = join(root, "content/cells/annual-precipitation/spatial.md");
    const initial = readFileSync(p, "utf8");
    writeFileSync(
      p,
      initial.replace(
        "priority: context",
        "priority: context\npriority: essential",
      ),
    );
    assert.throws(() => loadContent(root), /duplicated mapping key/);
    writeFileSync(p, initial + "\n<script>alert(1)</script>");
    assert.throws(() => loadContent(root), /raw HTML/);
    writeFileSync(p, initial + "\n[unsafe](javascript:alert)");
    assert.throws(() => loadContent(root), /HTTPS URL/);
    writeFileSync(p, initial);
    edit(
      root,
      "rows/annual-precipitation.yaml",
      (x) => (x.cells.spatial = "../outside.md"),
    );
    assert.throws(() => loadContent(root), /Path outside/);
  }));
test("product references and application links are validated", () =>
  fixture((root) => {
    edit(root, "products/loca2.yaml", (x) => x.references.push("not-a-paper"));
    assert.throws(() => loadContent(root), /unknown paper/);
  }));
test("regional documents retain independent evidence and review", () => {
  const c = loadContent().topics[0].cells[0];
  assert.notEqual(c.body, c.regions.northwest.body);
  assert.equal(c.regions.northwest.review.status, "draft");
  assert.deepEqual(c.regions.northwest.evidence, []);
});

test("product regional documents load without a table priority", () =>
  fixture((root) => {
    const path = join(root, "content/product-guidance/loca2.md");
    const original = readFileSync(path, "utf8");
    writeFileSync(
      path,
      original.replace(
        "---\n",
        "---\nregions:\n  northwest: product-guidance/loca2.northwest.md\n",
      ),
    );
    writeFileSync(
      join(root, "content/product-guidance/loca2.northwest.md"),
      original.replace("## Application guidance", "## Northwest evaluation"),
    );
    const result = loadContent(root).products.find((p) => p.id === "loca2");
    assert.match(
      result.guidance.regions.northwest.body,
      /Northwest evaluation/,
    );
    assert.equal(result.guidance.regions.northwest.priority, undefined);
  }));

test("product metadata rejects invalid dates, counts, URLs and missing fields", () => {
  for (const mutate of [
    (p) => { p.dates.created = "2026-15-01"; },
    (p) => { p.ensemble.member_counts = [{ model: "test", count: 0, scope: "test", source_url: "https://example.org" }]; },
    (p) => { p.funding = [{ agency: "test", award: null, notes: "test", source_url: "javascript:alert(1)" }]; },
    (p) => { delete p.access.cost; },
  ]) fixture((root) => {
    edit(root, "products/loca2.yaml", mutate);
    assert.throws(() => loadContent(root), /loca2.yaml/);
  });
});
test("unknown creation dates and member counts remain unknown", () => fixture((root) => {
  edit(root, "products/loca2.yaml", (p) => {
    p.dates.created = null;
    p.ensemble.member_counts = [{ model: "test", count: null, scope: "Not established", source_url: "https://example.org" }];
    p.funding = [];
  });
  const p = loadContent(root).products.find((p) => p.id === "loca2");
  assert.equal(p.dates.created, null);
  assert.equal(p.ensemble.member_counts[0].count, null);
  assert.deepEqual(p.funding, []);
}));
test("every NCAR matrix row maps to existing catalog records", () => {
  const coverage = yaml.load(readFileSync(join(projectRoot, "notes/ncar-matrix-coverage.yaml"), "utf8"));
  assert.deepEqual(coverage.rows.map((r) => r.row), Array.from({length:28}, (_, i) => i + 1));
  const ids = new Set(loadContent().products.map((p) => p.id));
  for (const row of coverage.rows) {
    assert.ok(row.products.length > 0);
    for (const id of row.products) assert.ok(ids.has(id), `Missing catalog product ${id}`);
  }
  assert.equal(new Set(coverage.rows.flatMap((r) => r.products)).size, 31);
});
