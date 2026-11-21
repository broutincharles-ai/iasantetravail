// Rebuilds the three data tables of /observatoire/ from content/observatoire/usage-ia.json.
//
//   node scripts/build-observatoire.mjs
//
// The page script (assets/js/observatoire.js) reads these tables to draw the map, the ranking
// and the comparison, so the tables are the only place where the figures live in the page.
// After an update of the data: run this script, change the dates in the page (byline, sources,
// JSON-LD) and `lastmod` in scripts/indexing-scope.mjs, then follow the README checks.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataFile = path.join(root, "content/observatoire/usage-ia.json");
const pageFile = path.join(root, "observatoire/index.html");

const data = JSON.parse(await readFile(dataFile, "utf8"));
const escapeHtml = value => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const french = (value, digits) => value.toLocaleString("fr-FR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
const cell = (value, digits) => (value == null ? "<td>—</td>" : `<td>${french(value, digits)}</td>`);
const nameOf = iso => {
  if (!data.names[iso]) throw new Error(`content/observatoire/usage-ia.json: no French name for ${iso}`);
  return data.names[iso];
};

// Highest first; equal values share a rank.
function ranked(entries) {
  const rows = entries.sort((a, b) => b.value - a.value || nameOf(a.iso).localeCompare(nameOf(b.iso), "fr"));
  rows.forEach((row, index) => { row.rank = index && rows[index - 1].value === row.value ? rows[index - 1].rank : index + 1; });
  return rows;
}

// Usage estimates: economies whose whole series equals another's are pooled regional figures in the source.
const pooledSize = {};
{
  const groups = {};
  for (const [iso, series] of Object.entries(data.adults.values)) (groups[series.join("/")] ||= []).push(iso);
  for (const group of Object.values(groups)) if (group.length > 1) for (const iso of group) pooledSize[iso] = group.length;
}

const employees = data.employees, workers = data.workers, adults = data.adults;
const last = series => series[series.length - 1];

const tables = {
  employees: {
    rows: ranked(Object.entries(employees.values).map(([iso, value]) => ({ iso, value }))).map(row => {
      const fromChart = employees.fromChart.includes(row.iso);
      return `<tr data-iso="${row.iso}" data-v="${row.value}"${fromChart ? ' data-flag="chart"' : ""}><td>${row.rank}</td><th scope="row">${escapeHtml(nameOf(row.iso))}</th><td>${french(row.value, 0)}${fromChart ? "*" : ""}</td></tr>`;
    }),
    total: `<tr data-v="${employees.total.value}"><td></td><th scope="row">${escapeHtml(employees.total.label)}</th>${cell(employees.total.value, 0)}</tr>`
  },
  workers: {
    rows: ranked(Object.entries(workers.values).map(([iso, [employed, everyone]]) => ({ iso, value: employed, everyone }))).map(row =>
      `<tr data-iso="${row.iso}" data-v="${row.value}"><td>${row.rank}</td><th scope="row">${escapeHtml(nameOf(row.iso))}</th>${cell(row.value, 1)}${cell(row.everyone, 1)}</tr>`),
    total: `<tr data-v="${workers.total.value[0]}"><td></td><th scope="row">${escapeHtml(workers.total.label)}</th>${cell(workers.total.value[0], 1)}${cell(workers.total.value[1], 1)}</tr>`
  },
  adults: {
    rows: ranked(Object.entries(adults.values).map(([iso, series]) => ({ iso, value: last(series), early: series[0] }))).map(row => {
      const pooled = pooledSize[row.iso];
      return `<tr data-iso="${row.iso}" data-v="${row.value}" data-early="${row.early}"${pooled ? ` data-pooled="${pooled}"` : ""}><td>${row.rank}</td><th scope="row">${escapeHtml(nameOf(row.iso))}</th><td>${french(row.value, 1)}${pooled ? "†" : ""}</td>${cell(row.early, 1)}</tr>`;
    }),
    total: `<tr data-v="${last(adults.total.value)}"><td></td><th scope="row">${escapeHtml(adults.total.label)}</th>${cell(last(adults.total.value), 1)}${cell(adults.total.value[0], 1)}</tr>`
  }
};

let html = await readFile(pageFile, "utf8");
for (const [key, table] of Object.entries(tables)) {
  const block = new RegExp(`(<!-- obs:${key}:start -->)[\\s\\S]*?(<!-- obs:${key}:end -->)`);
  if (!block.test(html)) throw new Error(`observatoire/index.html: markers for the “${key}” table are missing`);
  const body = `<tbody>\n        ${table.rows.join("\n        ")}\n        </tbody>\n        <tfoot>${table.total}</tfoot>`;
  html = html.replace(block, (match, start, end) => `${start}\n        ${body}\n        ${end}`);
}
await writeFile(pageFile, html, "utf8");
console.log(`Observatoire: ${tables.employees.rows.length} + ${tables.workers.rows.length} + ${tables.adults.rows.length} rows written (${Object.keys(pooledSize).length} pooled estimates flagged).`);
