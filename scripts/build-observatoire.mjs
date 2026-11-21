// Rebuilds the three data tables of the Observatory, in French (/observatoire/) and in English
// (/en/observatory/), from content/observatoire/usage-ia.json.
//
//   node scripts/build-observatoire.mjs
//
// The page script (assets/js/observatoire.js) reads these tables to draw the map, the ranking
// and the comparison, so the tables are the only place where the figures live in each page.
// After an update of the data: run this script, change the dates in both pages (byline, sources,
// JSON-LD) and `lastmod` in scripts/indexing-scope.mjs, then follow the README checks.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataFile = path.join(root, "content/observatoire/usage-ia.json");
// `index`: position of the language in the [French, English] pairs of the data file.
const PAGES = [
  { file: "observatoire/index.html", locale: "fr-FR", index: 0 },
  { file: "en/observatory/index.html", locale: "en-GB", index: 1 }
];

const data = JSON.parse(await readFile(dataFile, "utf8"));
const escapeHtml = value => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const last = series => series[series.length - 1];

// Usage estimates: economies whose whole series equals another's are pooled regional figures in the source.
const pooledSize = {};
{
  const groups = {};
  for (const [iso, series] of Object.entries(data.adults.values)) (groups[series.join("/")] ||= []).push(iso);
  for (const group of Object.values(groups)) if (group.length > 1) for (const iso of group) pooledSize[iso] = group.length;
}

function tablesFor({ locale, index }) {
  const number = (value, digits) => value.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const cell = (value, digits) => (value == null ? "<td>—</td>" : `<td>${number(value, digits)}</td>`);
  const nameOf = iso => {
    const names = data.names[iso];
    if (!Array.isArray(names) || !names[index]) throw new Error(`content/observatoire/usage-ia.json: no ${locale} name for ${iso}`);
    return names[index];
  };
  // Highest first; equal values share a rank.
  const ranked = entries => {
    const rows = entries.sort((a, b) => b.value - a.value || nameOf(a.iso).localeCompare(nameOf(b.iso), locale));
    rows.forEach((row, position) => { row.rank = position && rows[position - 1].value === row.value ? rows[position - 1].rank : position + 1; });
    return rows;
  };
  const { employees, workers, adults } = data;
  const totalRow = (total, value, cells) => `<tr data-v="${value}"><td></td><th scope="row">${escapeHtml(total.label[index])}</th>${cells}</tr>`;
  return {
    employees: {
      rows: ranked(Object.entries(employees.values).map(([iso, value]) => ({ iso, value }))).map(row => {
        const fromChart = employees.fromChart.includes(row.iso);
        return `<tr data-iso="${row.iso}" data-v="${row.value}"${fromChart ? ' data-flag="chart"' : ""}><td>${row.rank}</td><th scope="row">${escapeHtml(nameOf(row.iso))}</th><td>${number(row.value, 0)}${fromChart ? "*" : ""}</td></tr>`;
      }),
      total: totalRow(employees.total, employees.total.value, cell(employees.total.value, 0))
    },
    workers: {
      rows: ranked(Object.entries(workers.values).map(([iso, [employed, everyone]]) => ({ iso, value: employed, everyone }))).map(row =>
        `<tr data-iso="${row.iso}" data-v="${row.value}"><td>${row.rank}</td><th scope="row">${escapeHtml(nameOf(row.iso))}</th>${cell(row.value, 1)}${cell(row.everyone, 1)}</tr>`),
      total: totalRow(workers.total, workers.total.value[0], cell(workers.total.value[0], 1) + cell(workers.total.value[1], 1))
    },
    adults: {
      rows: ranked(Object.entries(adults.values).map(([iso, series]) => ({ iso, value: last(series), early: series[0] }))).map(row => {
        const pooled = pooledSize[row.iso];
        return `<tr data-iso="${row.iso}" data-v="${row.value}" data-early="${row.early}"${pooled ? ` data-pooled="${pooled}"` : ""}><td>${row.rank}</td><th scope="row">${escapeHtml(nameOf(row.iso))}</th><td>${number(row.value, 1)}${pooled ? "†" : ""}</td>${cell(row.early, 1)}</tr>`;
      }),
      total: totalRow(adults.total, last(adults.total.value), cell(last(adults.total.value), 1) + cell(adults.total.value[0], 1))
    }
  };
}

for (const page of PAGES) {
  const pageFile = path.join(root, page.file);
  const tables = tablesFor(page);
  let html = await readFile(pageFile, "utf8");
  for (const [key, table] of Object.entries(tables)) {
    const block = new RegExp(`(<!-- obs:${key}:start -->)[\\s\\S]*?(<!-- obs:${key}:end -->)`);
    if (!block.test(html)) throw new Error(`${page.file}: markers for the “${key}” table are missing`);
    const body = `<tbody>\n        ${table.rows.join("\n        ")}\n        </tbody>\n        <tfoot>${table.total}</tfoot>`;
    html = html.replace(block, (match, start, end) => `${start}\n        ${body}\n        ${end}`);
  }
  await writeFile(pageFile, html, "utf8");
  console.log(`${page.file}: ${tables.employees.rows.length} + ${tables.workers.rows.length} + ${tables.adults.rows.length} rows written.`);
}
console.log(`${Object.keys(pooledSize).length} pooled estimates flagged.`);
