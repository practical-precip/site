import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { topics, columns, products } from "../app/data.ts";
const root = fileURLToPath(new URL("../docs/", import.meta.url));
const prefix = "/pcef_workshop_site_mockup";
const published = "https://practical-precip.github.io" + prefix;
let links = 0;
function inspectHtml(file) {
  const html = readFileSync(file, "utf8");
  for (const [, url] of html.matchAll(
    /<(?:a|link|script|img)\b[^>]*\b(?:href|src)="([^"]+)"/g,
  )) {
    if (!url.startsWith("/")) continue;
    assert.ok(
      url === prefix || url.startsWith(prefix + "/"),
      `Missing repository prefix in ${file}: ${url}`,
    );
    const path = decodeURIComponent(url.split(/[?#]/)[0].slice(prefix.length));
    let target = resolve(root, "." + (path || "/"));
    assert.ok(
      target.startsWith(root.replace(/\/$/, "") + "/") ||
        target === root.replace(/\/$/, ""),
      "Path escaped export",
    );
    if (existsSync(target) && statSync(target).isDirectory())
      target = resolve(target, "index.html");
    assert.ok(existsSync(target), `Broken local URL in ${file}: ${url}`);
    links++;
  }
  return html;
}
assert.ok(existsSync(resolve(root, ".nojekyll")));
const home = inspectHtml(resolve(root, "index.html"));
assert.equal(
  (home.match(/class="matrix-cell /g) || []).length,
  topics.length * columns.length,
);
assert.ok(home.includes(published + "/og.png"), "Wrong social image origin");
for (const t of topics) {
  const html = inspectHtml(resolve(root, "guidance", t.id, "index.html"));
  for (const c of columns)
    assert.ok(html.includes(`id="${c.id}"`), `${t.id}: missing ${c.id}`);
  assert.ok(html.includes(`<title>${t.title} | Precip</title>`));
  if (t.figure) assert.ok(html.includes(`src="${prefix}${t.figure.image}"`));
  assert.ok(
    !html.includes('property="og:image"'),
    "Unrelated social image inherited",
  );
  if (t.figure?.pdf)
    assert.ok(existsSync(resolve(root, t.figure.pdf.slice(1))));
}
for (const p of products)
  inspectHtml(resolve(root, "products", p.id, "index.html"));
for (const page of [
  "products/index.html",
  "about/index.html",
  "reading-room/index.html",
  "404.html",
])
  inspectHtml(resolve(root, page));
function scan(dir) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const path = resolve(dir, f.name);
    if (f.isDirectory()) scan(path);
    else if (
      [".html", ".js", ".json", ".txt", ".css"].includes(extname(path))
    ) {
      assert.ok(
        !/chatgpt\.site|appgprj_|appgver_|appgdep_/.test(
          readFileSync(path, "utf8"),
        ),
        `Private hosting reference in ${path}`,
      );
    }
  }
}
scan(root);
console.log(
  `PASS: ${topics.length * columns.length} cells, all application anchors, ${links} local links/assets, metadata, 404, and no private hosting references in export.`,
);
