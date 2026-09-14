import assert from "node:assert/strict";
import { topics, columns, products } from "../app/data.ts";
const origin = process.env.PRECIP_SITE_URL || "http://localhost:3000";
const basePath = new URL(origin).pathname.replace(/\/$/, "");
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
for (const phrase of [
  "Practical Precip (working title)",
  "What are you looking for?",
  "General information",
  "Guidance on using datasets",
  "Detailed information on each dataset",
]) assert.ok(root.includes(phrase), `Landing page missing ${phrase}`);
const matrix = await (await get("/matrix")).text();
assert.equal(
  (matrix.match(/class="matrix-cell /g) || []).length,
  topics.length * columns.length,
  "Expected one button for every configured cell",
);
assert.ok(
  !root.includes('property="og:image"'),
  "Landing page should not inherit the old field-guide image",
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
      html.includes(`src="${basePath}${t.figure.image}"`),
      `${t.id}: missing figure`,
    );
    await get(t.figure.image);
    if (t.figure.pdf) await get(t.figure.pdf);
  }
}
for (const p of products) await get(`/products/${p.id}`);
for (const p of [
  "/general-information",
  "/products",
  "/about",
  "/reading-room",
  "/og.png",
  "/illustrations/examples.json",
  "/illustrations/make_figures.py",
])
  await get(p);
await get("/guidance/not-a-topic", 404);
console.log(
  `PASS: ${checked} HTTP routes/assets; ${topics.length * columns.length} matrix controls and section anchors; all guidance titles/social metadata; unknown topic returns 404.`,
);
