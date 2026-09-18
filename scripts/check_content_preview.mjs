const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import { fileURLToPath } from "node:url";
import { readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import assert from "node:assert/strict";
import yaml from "js-yaml";
const root = fileURLToPath(new URL("../", import.meta.url)).replace(/\/$/, "");
const base = root + "/metadata/datasets-and-guidance/guidance/datasets/loca2.md";
const variant = root + "/metadata/datasets-and-guidance/guidance/datasets/regional/loca2.northwest-test.md";
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
  const split = text => text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const template = split(readFileSync(root + "/metadata/datasets-and-guidance/templates/regional-dataset-guidance.md", "utf8"));
  const regional = yaml.load(template[1], {schema: yaml.JSON_SCHEMA});
  regional.review.contributors = ["Preview test"];
  writeFileSync(variant, `---\n${yaml.dump(regional)}---\n\n## Regional reload verification\n\n${template[2].trim()}\n`);
  const source = split(original);
  const value = yaml.load(source[1], {schema: yaml.JSON_SCHEMA});
  value.regions = {northwest: "guidance/datasets/regional/loca2.northwest-test.md"};
  writeFileSync(base, `---\n${yaml.dump(value)}---\n${source[2]}`);
  await page
    .getByRole("heading", { name: "Regional reload verification", exact: true })
    .waitFor({ timeout: 20000 });
  assert.match(
    await page.locator(".regional-scope").innerText(),
    /Northwest guidance/,
  );
  assert.match(
    await page.locator(".contribution-note a").first().getAttribute("href"),
    /loca2.northwest-test.md/,
  );
  writeFileSync(indexFile, originalIndex.replace("__LOCA2 North America__", "__LOCA2 preview name__"));
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
    "PASS: live Markdown guidance and INDEX.md name edits, regional source links, and restoration.",
  );
} finally {
  writeFileSync(indexFile, originalIndex);
  writeFileSync(base, original);
  if (existsSync(variant)) unlinkSync(variant);
  await browser.close();
}
