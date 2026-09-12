import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  existsSync,
  realpathSync,
} from "node:fs";
import { resolve, dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import katex from "katex";
import { readSnapshot } from "./published-content.mjs";
export const projectRoot = fileURLToPath(new URL("../", import.meta.url));
function validator(root) {
const schema = JSON.parse(readFileSync(resolve(root, "content/schema.json")));
const ajv = new Ajv({ allErrors: true, jsonPointers: true, schemaId: "auto", format: "full" });
ajv.addSchema(schema, "guidance");
return function validate(kind, value, file) {
  const check = ajv.getSchema(`guidance#/definitions/${kind}`);
  if (!check(value))
    throw new Error(
      `${file}: ${ajv.errorsText(check.errors, { separator: "\n" })}`,
    );
}
}
function unique(values, label) {
  if (new Set(values).size !== values.length)
    throw new Error(`${label}: duplicate IDs or values`);
}
function inside(base, file) {
  const path = resolve(base, file);
  if (!path.startsWith(resolve(base) + sep))
    throw new Error(`Path outside content directory: ${file}`);
  if (
    existsSync(path) &&
    !realpathSync(path).startsWith(realpathSync(base) + sep)
  )
    throw new Error(`Symlink outside content directory: ${file}`);
  return path;
}
export function loadContent(root = projectRoot) {
  if (process.env.SITE_CONTENT_MODE === "snapshot") return readSnapshot(root);
  const validate = validator(root);
  const dir = resolve(root, "content");
  const seenFiles = new Set();
  const read = (file) => {
    seenFiles.add(file);
    return readFileSync(inside(dir, file), "utf8");
  };
  const readYaml = (file, kind) => {
    const data = yaml.load(read(file), {
      schema: yaml.JSON_SCHEMA,
      filename: file,
    });
    validate(kind, data, file);
    return data;
  };
  const table = readYaml("table.yaml", "table");
  const regions = readYaml("regions.yaml", "regions");
  const papers = readYaml("papers.yaml", "papers");
  const catalog = readYaml("catalog.yaml", "catalog");
  unique(table.rows, "table.rows");
  unique(
    table.columns.map((c) => c.id),
    "table.columns",
  );
  unique(
    regions.map((r) => r.id),
    "regions",
  );
  unique(catalog.products, "catalog.products");
  const reserved = new Set([
    "overview",
    "figure",
    "literature",
    "main",
    "all",
    "constructor",
    "prototype",
    "__proto__",
  ]);
  for (const id of [
    ...table.rows,
    ...table.columns.map((c) => c.id),
    ...regions.map((r) => r.id),
    ...catalog.products,
  ])
    if (reserved.has(id)) throw new Error(`Reserved ID: ${id}`);
  const states = JSON.parse(readFileSync(resolve(root, "app/us-states.json")));
  const memberships = regions.flatMap((r) => r.states);
  unique(memberships, "region state memberships");
  const expected = Object.keys(states);
  if (
    expected.length !== memberships.length ||
    expected.some((s) => !memberships.includes(s))
  )
    throw new Error("Regions must cover each state and DC exactly once");
  const cite = (id, file) => {
    if (!Object.hasOwn(papers, id))
      throw new Error(`${file}: unknown paper ${id}`);
    return papers[id];
  };
  const parser = unified().use(remarkParse).use(remarkGfm).use(remarkMath);
  function markdown(body, file) {
    const paperIds = [];
    const text = body.replace(/\[@([a-z][a-z0-9-]*)\]/g, (_, id) => {
      const p = cite(id, file);
      paperIds.push(id);
      return `[${p.authors} (${p.year})](${p.url})`;
    });
    const tree = parser.parse(text);
    visit(tree, (node) => {
      if (node.type === "html")
        throw new Error(`${file}: raw HTML is not supported; use Markdown`);
      if (node.type === "math" || node.type === "inlineMath") {
        try {
          katex.renderToString(node.value, {
            throwOnError: true,
            strict: "error",
            trust: false,
            displayMode: node.type === "math",
          });
        } catch (error) {
          throw new Error(`${file}: invalid equation: ${error.message}`);
        }
      }
      if (["link", "image", "definition"].includes(node.type)) {
        const url = node.url;
        if (!/^(https:\/\/|\/(?!\/)|#)/.test(url))
          throw new Error(
            `${file}: use an HTTPS URL, /site/path, or #anchor: ${url}`,
          );
        if (node.type === "image" && !node.alt?.trim())
          throw new Error(`${file}: images require alt text`);
        if (
          url.startsWith("/") &&
          (node.type === "image" || /\.[a-z0-9]+(?:#.*)?$/i.test(url))
        ) {
          const asset = inside(
            resolve(root, "public"),
            decodeURIComponent(url.split(/[?#]/)[0].slice(1)),
          );
          if (!existsSync(asset))
            throw new Error(`${file}: missing public asset ${url}`);
        }
      }
    });
    return { body: text, paperIds };
  }
  function document(file, cell = false, regional = false) {
    if (!file.endsWith(".md"))
      throw new Error(`${file}: expected a Markdown file`);
    const raw = read(file).replace(/\r\n/g, "\n");
    const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match)
      throw new Error(`${file}: expected YAML front matter between --- lines`);
    const meta = yaml.load(match[1], {
      schema: yaml.JSON_SCHEMA,
      filename: file,
    });
    validate("document", meta, file);
    if (cell && !meta.priority)
      throw new Error(`${file}: cell priority is required`);
    if (regional && meta.regions)
      throw new Error(`${file}: nested regional overrides are not supported`);
    if (!match[2].trim()) throw new Error(`${file}: Markdown body is empty`);
    const compiled = markdown(match[2].trim(), file);
    for (const e of meta.evidence) cite(e.paper, file);
    const out = {
      ...meta,
      body: compiled.body,
      contentFile: existsSync(resolve(root, "content/source-map.json")) ? JSON.parse(readFileSync(resolve(root, "content/source-map.json")))[file] ?? file : file,
      paperIds: [
        ...new Set([
          ...compiled.paperIds,
          ...meta.evidence.map((e) => e.paper),
        ]),
      ],
    };
    delete out.regions;
    if (meta.regions) {
      out.regions = {};
      for (const [id, path] of Object.entries(meta.regions)) {
        if (!regions.some((r) => r.id === id))
          throw new Error(`${file}: unknown region ${id}`);
        out.regions[id] = document(path, cell, true);
      }
    }
    return out;
  }
  const placeholder = () => ({
    title: "Guidance not yet supplied",
    priority: "context",
    summary: "This intersection is awaiting a contribution.",
    body: "No guidance has been contributed for this intersection yet.",
    evidence: [],
    review: {
      status: "draft",
      contributors: ["Unassigned"],
      updated: "2026-09-11",
    },
    paperIds: [],
  });
  const rows = table.rows.map((id) => {
    const file = `rows/${id}.yaml`;
    const row = readYaml(file, "row");
    if (row.id !== id) throw new Error(`${file}: ID must match filename`);
    const cols = table.columns.map((c) => c.id);
    for (const k of Object.keys(row.cells))
      if (!cols.includes(k)) throw new Error(`${file}: unknown column ${k}`);
    for (const k of cols)
      if (!Object.hasOwn(row.cells, k))
        throw new Error(
          `${file}: missing column ${k}; use null for an empty cell`,
        );
    row.references.forEach((ref) => cite(ref, file));
    const cells = cols.map((col) =>
      row.cells[col] === null ? placeholder() : document(row.cells[col], true),
    );
    if (row.figure)
      for (const key of ["image", "pdf", "data", "code"])
        if (row.figure[key]) {
          const p = row.figure[key];
          if (
            !p.startsWith("/") ||
            !existsSync(inside(resolve(root, "public"), p.slice(1)))
          )
            throw new Error(`${file}: missing figure ${key} ${p}`);
        }
    return {
      ...row,
      cells,
      sourceIds: [
        ...new Set([
          ...row.references,
          ...cells.flatMap((c) => [
            ...c.paperIds,
            ...Object.values(c.regions ?? {}).flatMap((v) => v.paperIds),
          ]),
        ]),
      ],
    };
  });
  const products = catalog.products.map((id) => {
    const file = `products/${id}.yaml`;
    const p = readYaml(file, "product");
    if (p.id !== id) throw new Error(`${file}: ID must match filename`);
    p.references.forEach((ref) => cite(ref, file));
    for (const row of p.relevant_rows)
      if (!table.rows.includes(row))
        throw new Error(`${file}: unknown application ${row}`);
    return { ...p, guidance: document(p.guidance) };
  });
  function walk(folder) {
    for (const f of readdirSync(inside(dir, folder), { withFileTypes: true })) {
      const path = `${folder}/${f.name}`;
      if (f.isDirectory()) walk(path);
      else if (/\.(md|yaml)$/.test(f.name) && !seenFiles.has(path))
        throw new Error(
          `${path}: unreferenced content file (add it to configuration or remove it)`,
        );
    }
  }
  for (const folder of ["rows", "cells", "products", "product-guidance"])
    walk(folder);
  return {
    version: table.version,
    columns: table.columns,
    topics: rows,
    regions,
    papers,
    products,
  };
}
export function buildContent(root = projectRoot) {
  const content = loadContent(root);
  const target = resolve(root, "app/generated/content.json");
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, JSON.stringify(content, null, 2) + "\n");
  return content;
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const content = process.argv.includes("--check")
      ? loadContent()
      : buildContent();
    console.log(
      `Validated ${content.topics.length} rows, ${content.columns.length} columns, ${content.topics.length * content.columns.length} cells, ${content.products.length} products, and ${Object.keys(content.papers).length} papers.`,
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
