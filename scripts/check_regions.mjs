import assert from "node:assert/strict";
import { topics, resolveCell, hasRegionalGuidance } from "../app/data.ts";
import { validRegion } from "../app/regions.ts";
const cell = topics[0].cells[0];
assert.equal(resolveCell(cell, "all"), cell);
assert.equal(resolveCell(cell, "southeast"), cell);
assert.match(
  resolveCell(cell, "northwest").body,
  /coastal, mountain, and inland/,
);
assert.equal(hasRegionalGuidance(cell, "northwest"), true);
assert.equal(hasRegionalGuidance(cell, "southeast"), false);
assert.equal(validRegion("unknown"), "all");
assert.equal(validRegion(null), "all");
console.log(
  "PASS: regional Markdown selection, general fallback, and invalid region handling.",
);
