const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import { fileURLToPath } from "node:url";
import { readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import assert from "node:assert/strict";
const root = fileURLToPath(new URL("../", import.meta.url)).replace(/\/$/, "");
const base = root + "/content/product-guidance/loca2.md";
const variant = root + "/content/product-guidance/loca2.northwest-test.md";
if (existsSync(variant))
  throw new Error(
    "Temporary test variant already exists; preserve it and choose another path.",
  );
const original = readFileSync(base, "utf8");
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_EXECUTABLE,
});
try {
  const page = await browser.newPage();
  await page.goto(
    (process.env.PRECIP_SITE_URL || "http://127.0.0.1:3011") +
      "/products/loca2/",
  );
  await page
    .getByRole("heading", { name: "LOCA2 North America", exact: true })
    .waitFor();
  writeFileSync(
    variant,
    original.replace(
      "## Application guidance",
      "## Regional reload verification",
    ),
  );
  writeFileSync(
    base,
    original.replace(
      "---\n",
      "---\nregions:\n  northwest: product-guidance/loca2.northwest-test.md\n",
    ),
  );
  await page.locator("#climate-region").selectOption("northwest");
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
    "PASS: live Markdown/YAML reload, product regional document and source link, and restoration to general guidance.",
  );
} finally {
  writeFileSync(base, original);
  if (existsSync(variant)) unlinkSync(variant);
  await browser.close();
}
