import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { columns, products } from "../app/data.ts";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const origin =
  process.env.PRECIP_SITE_URL ||
  "http://localhost:3005/site";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_EXECUTABLE,
  ...(process.env.PLAYWRIGHT_CHANNEL
    ? { channel: process.env.PLAYWRIGHT_CHANNEL }
    : {}),
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1050 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(origin + "/");
  const dropdown = page.locator("#climate-region");
  console.log("Loaded matrix; checking region selection.");
  await dropdown.selectOption("northwest");
  await page.waitForFunction(
    () =>
      document
        .querySelector('.map-region[aria-label="Northwest"]')
        ?.getAttribute("aria-pressed") === "true",
  );
  assert.match(
    await page.locator(".matrix-cell").first().innerText(),
    /Evaluate terrain and basin totals/,
  );
  await page.locator('.map-region[aria-label="Southwest"] text').click();
  assert.equal(await dropdown.inputValue(), "southwest");
  await page.locator('.map-region[aria-label="Northwest"]').focus();
  await page.keyboard.press("Enter");
  assert.equal(await dropdown.inputValue(), "northwest");
  await page.locator(".matrix-cell").first().click();
  assert.match(
    await page.locator("dialog").innerText(),
    /coastal, mountain, and inland/,
  );
  await page
    .getByRole("link", { name: /Read the guidance & evidence/ })
    .click();
  await page.waitForURL(/annual-precipitation.*region=northwest#spatial/);
  await page.waitForFunction(() =>
    document
      .querySelector("#spatial")
      ?.textContent.includes("coastal, mountain, and inland"),
  );
  assert.equal(await dropdown.inputValue(), "northwest");
  await page.reload();
  await page.waitForFunction(
    () => document.querySelector("#climate-region")?.value === "northwest",
  );
  assert.match(
    await page.locator("#spatial").innerText(),
    /coastal, mountain, and inland/,
  );
  await page
    .getByRole("link", { name: "The matrix", exact: true })
    .first()
    .click();
  await page.waitForURL(/\/?\?region=northwest$/);
  await page
    .getByLabel("Focus on an application")
    .selectOption("annual-maximum");
  assert.equal(await page.locator(".matrix-cell").count(), columns.length);
  assert.match(
    await page.locator(".matrix-cell").first().innerText(),
    /General guidance/,
  );
  await page.getByRole("button", { name: "Reset to all regions" }).click();
  assert.equal(await dropdown.inputValue(), "all");
  assert.ok(!page.url().includes("region="));
  await page.goto(origin + "/?region=invalid");
  assert.equal(await dropdown.inputValue(), "all");
  await page.goto(origin + "/?region=alaska");
  await page.waitForFunction(
    () => document.querySelector("#climate-region")?.value === "alaska",
  );
  await page.screenshot({
    path: join(tmpdir(), "pcef-regions-desktop.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await dropdown.selectOption("hawaii");
  await page.locator('.map-region[aria-label="Hawaii"]').focus();
  await page.keyboard.press(" ");
  assert.equal(await dropdown.inputValue(), "hawaii");
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    true,
    "No page overflow on mobile",
  );
  await page.screenshot({
    path: join(tmpdir(), "pcef-regions-mobile.png"),
    fullPage: true,
  });
  await page.goto(origin + "/");
  await page.locator(".matrix-cell").first().click();
  assert.ok(
    (await page.locator("dialog .katex").count()) > 0,
    "Equation rendered in popup",
  );
  assert.ok(
    (await page.locator("dialog .markdown img").count()) > 0,
    "Markdown image rendered",
  );
  assert.ok(
    await page
      .locator("dialog .markdown img")
      .evaluate((img) => img.complete && img.naturalWidth > 0),
  );
  await page.getByRole("button", { name: "Close guidance" }).click();
  await page.goto(origin + "/guidance/precipitation-phase/");
  assert.match(
    await page.locator("#spatial .published-evidence").innerText(),
    /-0.4 to 2.4/,
  );
  assert.ok((await page.locator("#spatial .published-evidence a").count()) > 0);
  await page.goto(origin + "/products/");
  assert.equal(await page.locator(".product-card").count(), products.length);
  await page.getByRole("searchbox", { name: "Find a dataset" }).fill("UWPD");
  assert.equal(await page.locator(".product-card").count(), 1);
  assert.match(await page.locator(".product-card").innerText(), /UW-Madison/);
  await page.getByRole("searchbox", { name: "Find a dataset" }).fill("");
  await page.getByRole("combobox", { name: "Dataset type" }).selectOption("collection");
  assert.equal(await page.locator(".product-card").count(), products.filter(p=>p.kind === "collection").length);
  await page.getByRole("combobox", { name: "Dataset type" }).selectOption("all");
  await page
    .getByRole("link", { name: "LOCA2 North America", exact: true })
    .click();
  await page.waitForURL(/products\/loca2/);
  assert.match(
    await page.locator(".product-metadata").innerText(),
    /v20240915/,
  );
  assert.match(
    await page.locator(".guidance-document").innerText(),
    /expert review pending/,
  );
  assert.ok(
    (await page.locator('.markdown a[href*="Pierce_et_al"]').count()) > 0,
    "Paper shorthand became a link",
  );
  await page.locator("#climate-region").selectOption("northwest");
  assert.match(
    await page.locator(".regional-scope").innerText(),
    /General product guidance/,
  );
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    true,
  );
  await page.screenshot({
    path: join(tmpdir(), "pcef-product-mobile.png"),
    fullPage: true,
  });
  for (const product of products) {
    await page.goto(`${origin}/products/${product.id}/?region=all`);
    assert.equal(await page.locator("h1").innerText(), product.name);
    assert.ok(
      (await page.locator(".product-metadata").innerText()).includes(product.version),
    );
    const metadata = await page.locator(".product-metadata").innerText();
    assert.ok(metadata.includes(product.source_scope));
    for (const label of ["Creation date", "File format", "Subsetting", "Cost", "License"]) assert.ok(metadata.includes(label));
    for (const id of ["ensemble-members", "existing-uses", "funding", "associated-resources"]) assert.equal(await page.locator(`#${id}`).count(), 1);
    for (const [region, document] of Object.entries(product.guidance.regions ?? {})) {
      await page.locator("#climate-region").selectOption(region);
      await page.waitForFunction(
        (file) => document.querySelector(".contribution-note a")?.href.includes(file),
        document.contentFile,
      );
      assert.ok(
        (await page.locator(".contribution-note a").first().getAttribute("href"))
          .includes(document.contentFile),
      );
    }
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      true,
      `${product.id}: mobile page overflow`,
    );
  }
  console.log(`Checked all ${products.length} product pages and configured regional documents.`);
  assert.deepEqual(errors, []);
  console.log(
    "PASS: map/dropdown sync, keyboard selection, popup and detail guidance, reload, regional links, combined filters, reset, invalid region, mobile layout, Markdown images and equations, paper citations, product catalog and detail pages, and no browser errors.",
  );
} finally {
  await browser.close();
}
