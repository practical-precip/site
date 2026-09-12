const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import { fileURLToPath } from "node:url";
import { readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import assert from "node:assert/strict";
import {load, dump} from "nestedtext";
const root = fileURLToPath(new URL("../", import.meta.url)).replace(/\/$/, "");
const base = root + "/metadata/datasets-and-guidance/datasets/loca2.nt";
const variant = root + "/metadata/datasets-and-guidance/datasets/regional/loca2.northwest-test.nt";
if (existsSync(variant))
  throw new Error(
    "Temporary test variant already exists; preserve it and choose another path.",
  );
const original = readFileSync(base, "utf8");
const indexFile = root + "/metadata/datasets-and-guidance/INDEX.md";
const originalIndex = readFileSync(indexFile, "utf8");
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_EXECUTABLE,
});
try {
  const page = await browser.newPage();
  await page.goto(
    (process.env.PRECIP_SITE_URL || "http://127.0.0.1:3011") +
      "/products/loca2/?region=northwest",
  );
  await page
    .getByRole("heading", { name: "LOCA2 North America", exact: true })
    .waitFor();
  await page.waitForFunction(() => document.querySelector("#climate-region")?.value === "northwest");
  const regional = load(readFileSync(root + "/metadata/datasets-and-guidance/templates/regional-dataset.nt", "utf8"));
  regional.review.contributors = ["Preview test"];
  regional.text = "## Regional reload verification\n\n" + regional.text;
  writeFileSync(variant, dump(regional, {indent: "  "}));
  const value = load(original);
  value["expert guidance"].regions = {northwest: "datasets/regional/loca2.northwest-test.nt"};
  writeFileSync(base, dump(value, {indent: "  "}));
  await page
    .getByRole("heading", { name: "Regional reload verification", exact: true })
    .waitFor({ timeout: 20000 });
  assert.match(
    await page.locator(".regional-scope").innerText(),
    /Northwest guidance/,
  );
  assert.match(
    await page.locator(".contribution-note a").first().getAttribute("href"),
    /loca2.northwest-test.nt/,
  );
  writeFileSync(indexFile, originalIndex.replace("[LOCA2 North America](datasets/loca2.nt)", "[LOCA2 preview name](datasets/loca2.nt)"));
  await page.getByRole("heading", {name: "LOCA2 preview name", exact: true}).waitFor({timeout: 20000});
  writeFileSync(indexFile, originalIndex);
  await page.getByRole("heading", {name: "LOCA2 North America", exact: true}).waitFor({timeout: 20000});
  writeFileSync(base, original);
  unlinkSync(variant);
  await page
    .getByRole("heading", { name: "Application guidance", exact: true })
    .waitFor({ timeout: 20000 });
  assert.match(
    await page.locator(".regional-scope").innerText(),
    /General product guidance/,
  );
  console.log(
    "PASS: live NestedText guidance and INDEX.md name edits, regional source links, and restoration.",
  );
} finally {
  writeFileSync(indexFile, originalIndex);
  writeFileSync(base, original);
  if (existsSync(variant)) unlinkSync(variant);
  await browser.close();
}
