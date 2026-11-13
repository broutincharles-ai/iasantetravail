// Prints the canonical URLs of the sitemap whose page changed between two commits.
// Usage: node scripts/indexnow-changed-urls.mjs <base-sha> [head-sha]
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const site = "https://www.iasantetravail.com";
const [base, head = "HEAD"] = process.argv.slice(2);

if (!base) {
  throw new Error("Pass the commit to compare from, then optionally the commit to compare to.");
}

const sitemap = readFileSync(new URL("../sitemap.xml", import.meta.url), "utf8");
const indexable = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim()));

const changed = execFileSync(
  "git",
  ["-c", "core.quotePath=false", "diff", "--name-only", "--diff-filter=AMR", base, head, "--", "*.html"],
  { encoding: "utf8" }
).split("\n").filter(Boolean);

const urls = new Set();
for (const file of changed) {
  const path = file === "index.html" ? "" : file.replace(/index\.html$/, "");
  const url = `${site}/${path}`;
  if (indexable.has(url)) urls.add(url);
}

process.stdout.write([...urls].sort().join("\n") + (urls.size ? "\n" : ""));
