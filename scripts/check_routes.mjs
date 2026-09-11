import assert from "node:assert/strict";
import { topics, columns, products } from "../app/data.ts";
const origin = process.env.PRECIP_SITE_URL || "http://localhost:3000";
const metadataOrigin =
  process.env.PRECIP_METADATA_ORIGIN ||
  "https://practical-precip.github.io/pcef_workshop_site_mockup";
let checked = 0;
async function get(path, status = 200) {
  const response = await fetch(origin + path);
  assert.equal(
    response.status,
    status,
    `${path}: expected ${status}, received ${response.status}`,
  );
  checked++;
  return response;
}
const root = await (await get("/")).text();
assert.equal(
  (root.match(/class="matrix-cell /g) || []).length,
  topics.length * columns.length,
  "Expected one button for every configured cell",
);
assert.ok(
  root.includes(`${metadataOrigin}/og.png`),
  "Root social image should use trusted local origin",
);
for (const t of topics) {
  const html = await (await get(`/guidance/${t.id}`)).text();
  for (const col of columns)
    assert.ok(
      html.includes(`id="${col.id}"`),
      `${t.id} missing ${col.id} deep link`,
    );
  assert.ok(
    html.includes(`<title>${t.title} | Precip</title>`),
    `${t.id}: title mismatch`,
  );
  assert.ok(
    html.includes(`content="${t.title} | Precip"`),
    `${t.id}: social title mismatch`,
  );
  assert.ok(
    !html.includes('property="og:image"'),
    `${t.id}: inherited unrelated social image`,
  );
  if (t.figure) {
    assert.ok(
      html.includes(`src="${t.figure.image}"`),
      `${t.id}: missing figure`,
    );
    await get(t.figure.image);
    if (t.figure.pdf) await get(t.figure.pdf);
  }
}
for (const p of products) await get(`/products/${p.id}`);
for (const p of [
  "/products",
  "/about",
  "/reading-room",
  "/og.png",
  "/content-assets/guidance/figures/examples.json",
  "/content-assets/guidance/figures/make_figures.py",
])
  await get(p);
await get("/guidance/not-a-topic", 404);
console.log(
  `PASS: ${checked} HTTP routes/assets; ${topics.length * columns.length} matrix controls and section anchors; all guidance titles/social metadata; unknown topic returns 404.`,
);
