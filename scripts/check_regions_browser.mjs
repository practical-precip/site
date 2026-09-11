import assert from "node:assert/strict";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const origin =
  process.env.PRECIP_SITE_URL ||
  "http://localhost:3005/pcwf_workshop_site_mockup";
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
  assert.equal(await page.locator(".matrix-cell").count(), 6);
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
    path: "/tmp/pcef-regions-desktop.png",
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
    path: "/tmp/pcef-regions-mobile.png",
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: map/dropdown sync, keyboard selection, popup and detail guidance, reload, regional links, combined filters, reset, invalid region, mobile layout, and no browser errors.",
  );
} finally {
  await browser.close();
}
