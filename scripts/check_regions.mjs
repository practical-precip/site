import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { topics, resolveCell, hasRegionalGuidance } from "../app/data.ts";
import { regions, validRegion } from "../app/regions.ts";
const states = JSON.parse(
  readFileSync(new URL("../app/us-states.json", import.meta.url)),
);
const ids = regions.map((r) => r.id);
assert.equal(new Set(ids).size, ids.length);
const memberships = regions.flatMap((r) => [...r.states]);
assert.equal(memberships.length, 51);
assert.equal(
  new Set(memberships).size,
  51,
  "Every state and DC belongs to one region",
);
for (const id of memberships)
  assert.ok(states[id]?.path, `Missing geometry: ${id}`);
for (const topic of topics)
  for (const cell of topic.cells) {
    for (const id of Object.keys(cell.regions ?? {}))
      assert.ok(ids.includes(id));
    assert.deepEqual(resolveCell(cell, "all"), cell);
    for (const region of regions) {
      const resolved = resolveCell(cell, region.id);
      for (const key of ["priority", "title", "summary", "check"])
        assert.ok(resolved[key]);
    }
  }
const base = {
  priority: "lower",
  title: "General",
  summary: "Summary",
  check: "Check",
};
const regional = {
  ...base,
  regions: { northwest: { title: "Regional", priority: "essential" } },
};
assert.equal(resolveCell(regional, "northwest").title, "Regional");
assert.equal(resolveCell(regional, "northwest").check, base.check);
assert.equal(resolveCell(regional, "northwest").priority, "essential");
assert.equal(resolveCell(regional, "southeast").title, base.title);
assert.equal(resolveCell(regional, "all").title, base.title);
assert.equal(hasRegionalGuidance(regional, "northwest"), true);
assert.equal(hasRegionalGuidance(regional, "southeast"), false);
assert.equal(
  hasRegionalGuidance({ ...base, regions: { northwest: {} } }, "northwest"),
  false,
);
assert.equal(
  resolveCell(
    { ...base, regions: { northwest: { title: undefined } } },
    "northwest",
  ).title,
  "General",
);
assert.equal(base.title, "General");
assert.equal(validRegion("unknown"), "all");
assert.equal(validRegion(null), "all");
assert.equal(validRegion("northwest"), "northwest");
console.log(
  "PASS: region membership, optional field overrides, general fallback, priorities, and invalid region IDs.",
);
