import { readdirSync, statSync } from "node:fs";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { prepareContent } from "./prepare-content.mjs";
import { buildContent, projectRoot } from "./content.mjs";
// Polling also works on mounted workspaces that do not deliver native file events.
export function contentSignature(root = projectRoot) {
  const entries = [];
  function scan(path) {
    for (const file of readdirSync(path, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      const full = resolve(path, file.name);
      if (file.name.startsWith(".")) continue;
      if (file.isDirectory()) scan(full);
      else {
        const stat = statSync(full);
        entries.push(`${full}:${stat.size}:${stat.mtimeMs}`);
      }
    }
  }
  scan(resolve(root, "metadata/datasets-and-guidance"));
  return entries.join("\n");
}
export function watchContent(root, onChange, interval = 500) {
  let previous = contentSignature(root);
  const timer = setInterval(() => {
    try {
      const current = contentSignature(root);
      if (current === previous) return;
      previous = current;
      onChange();
    } catch (error) {
      console.error(`Content was not updated: ${error.message}`);
    }
  }, interval);
  return () => clearInterval(timer);
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  buildContent();
  console.log("Content compiled. Watching NestedText, Markdown, and assets.");
  const close = process.env.SITE_CONTENT_MODE === "snapshot" ? () => {} : watchContent(projectRoot, () => {
    prepareContent(projectRoot);
    buildContent(projectRoot);
    console.log("Content updated.");
  });
  const server = spawn(
    process.execPath,
    [
      resolve(projectRoot, "node_modules/next/dist/bin/next"),
      "dev",
      "--webpack",
      ...process.argv.slice(2),
    ],
    {
      cwd: projectRoot,
      stdio: "inherit",
      env: {
        ...process.env,
        WATCHPACK_POLLING: process.env.WATCHPACK_POLLING ?? "true",
      },
    },
  );
  for (const signal of ["SIGINT", "SIGTERM"])
    process.on(signal, () => {
      close();
      server.kill(signal);
    });
  server.on("error", (error) => {
    console.error(error.message);
    close();
    process.exitCode = 1;
  });
  server.on("exit", (code) => {
    close();
    process.exitCode = code ?? 0;
  });
}
