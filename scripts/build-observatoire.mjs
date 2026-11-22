// Rebuilds the generated parts of the Observatory, in French and in English:
// - the three data tables of the map (/observatoire/ and /en/observatory/), from
//   content/observatoire/usage-ia.json;
// - the trend plot and the table of model capabilities (/observatoire/capacites-modeles/ and
//   /en/observatory/model-capabilities/), from content/observatoire/capacites-modeles.json.
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
const CAPABILITY_PAGES = [
  { file: "observatoire/capacites-modeles/index.html", locale: "fr-FR", index: 0 },
  { file: "en/observatory/model-capabilities/index.html", locale: "en-GB", index: 1 }
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

// ---------------------------------------------------------------------------------------------
// Model capabilities (METR 50% time horizons, in minutes of expert human time).
// The plot is plain HTML placed in percentages of its box, so its text keeps its size at every
// width; assets/js/observatoire.js only adds the tooltip. Time runs left to right, the vertical
// scale is logarithmic and ends at the longest task of the suite.
const capabilities = JSON.parse(await readFile(path.join(root, "content/observatoire/capacites-modeles.json"), "utf8"));
const CAPABILITY_TEXT = [
  { to: " à ", interval80: "Intervalle à 80 % : ", longest: "plus longue tâche testée", unmeasured: "Non mesuré",
    doubling: months => `×2 tous les ${months} mois`,
    summary: (first, top, count) => `Graphique : durée des tâches réussies une fois sur deux par ${count} modèles, de ${first.value} pour ${first.name} (${first.date}) à ${top.value} pour ${top.name} (${top.date}), en échelle logarithmique. Les valeurs figurent dans le tableau replié sous le graphique.` },
  { to: " to ", interval80: "80% interval: ", longest: "longest task tested", unmeasured: "Not measured",
    doubling: months => `×2 every ${months} months`,
    summary: (first, top, count) => `Chart: length of the tasks completed half the time by ${count} models, from ${first.value} for ${first.name} (${first.date}) to ${top.value} for ${top.name} (${top.date}), on a logarithmic scale. The values are in the folded table under the chart.` }
];
const DAY = 86400000;
const utc = iso => Date.parse(`${iso}T00:00:00Z`);
const monthStart = (time, shift) => { const d = new Date(time); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + shift, 1); };

function capabilitiesFor({ locale, index }) {
  const text = CAPABILITY_TEXT[index];
  const { models, trend, longestTaskMinutes } = capabilities;
  const number = (value, digits) => value.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const hours = minutes => { const h = minutes / 60; return h < 9.95 ? h.toLocaleString(locale, { maximumFractionDigits: 1 }) : number(Math.round(h), 0); };
  // Whole minutes under an hour, whole hours above: the intervals are too wide for more.
  const duration = minutes => (minutes < 59.5 ? `${Math.round(minutes)} min` : `${number(Math.round(minutes / 60), 0)} h`);
  const interval = ([low, high]) => (high < 120 ? `${Math.round(low)}${text.to}${Math.round(high)} min` : `${hours(low)}${text.to}${hours(high)} h`);
  const dateOf = iso => new Date(utc(iso)).toLocaleDateString(locale, { month: "long", year: "numeric", timeZone: "UTC" });

  const released = models.map(model => utc(model.released));
  const start = monthStart(Math.min(...released), -1);
  const end = monthStart(Math.max(...released), 6);
  const bottom = 0.85 * Math.min(...models.map(model => model.ci80[0]));
  const top = longestTaskMinutes;
  const pct = value => `${Math.round(value * 100) / 100}%`;
  const xOf = time => ((time - start) / (end - start)) * 100;
  const yOf = minutes => ((Math.log(top) - Math.log(Math.min(top, Math.max(bottom, minutes)))) / (Math.log(top) - Math.log(bottom))) * 100;

  const best = models.reduce((a, b) => (b.p50 > a.p50 ? b : a));
  const describe = model => ({ name: model.name, date: dateOf(model.released), value: duration(model.p50) });
  const parts = [];
  for (const [minutes, label] of [[10, "10 min"], [60, "1 h"], [600, "10 h"], [6000, "100 h"]]) {
    if (minutes > bottom && minutes < top) parts.push(`<span class="obs-cap-y" style="top:${pct(yOf(minutes))}"><b>${label}</b></span>`);
  }
  parts.push(`<span class="obs-cap-top"><b>${duration(top)}</b><em>${escapeHtml(text.longest)}</em></span>`);
  parts.push(`<span class="obs-cap-zone" style="left:${pct(xOf(Math.max(...released) + 9 * DAY))}"><b>${escapeHtml(text.unmeasured)}</b></span>`);
  for (let year = new Date(start).getUTCFullYear() + 1; Date.UTC(year, 0, 1) < end; year += 1) {
    parts.push(`<span class="obs-cap-x" style="left:${pct(xOf(Date.UTC(year, 0, 1)))}"><b>${year}</b></span>`);
  }
  const [from, to] = [trend.from, trend.to].map(([iso, minutes]) => ({ x: xOf(utc(iso)), y: yOf(minutes) }));
  parts.push(`<svg class="obs-cap-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><line x1="${from.x.toFixed(2)}" y1="${from.y.toFixed(2)}" x2="${to.x.toFixed(2)}" y2="${to.y.toFixed(2)}"/></svg>`);
  // The doubling time sits above the line, where no model was released for several months.
  const gaps = released.slice(1).map((time, i) => ({ from: released[i], to: time })).sort((a, b) => (b.to - b.from) - (a.to - a.from));
  const middle = xOf((gaps[0].from + gaps[0].to) / 2);
  const onLine = from.y + ((middle - from.x) / (to.x - from.x)) * (to.y - from.y);
  parts.push(`<span class="obs-cap-rate" style="left:${pct(middle)};top:${pct(onLine)}">${escapeHtml(text.doubling(number(trend.doublingMonths, 1)))}</span>`);
  for (const model of models) {
    const [high, low] = [yOf(model.ci80[1]), yOf(model.ci80[0])];
    parts.push(`<i class="obs-cap-ci" style="left:${pct(xOf(utc(model.released)))};top:${pct(high)};height:${pct(low - high)}"></i>`);
  }
  for (const model of models) {
    parts.push(`<span class="obs-cap-pt" style="left:${pct(xOf(utc(model.released)))};top:${pct(yOf(model.p50))}" data-n="${escapeHtml(model.name)}" data-d="${escapeHtml(dateOf(model.released))}" data-v="${escapeHtml(duration(model.p50))}" data-i="${escapeHtml(text.interval80 + interval(model.ci80))}"></span>`);
  }
  // Names written on the plot: the first model, the one after the longest pause, and the highest.
  const labelled = [models[0], models[released.indexOf(gaps[0].to)], best].filter((model, i, list) => list.indexOf(model) === i);
  for (const model of labelled) {
    const x = xOf(utc(model.released));
    parts.push(`<span class="obs-cap-lab${x > 60 ? " is-left" : ""}" style="left:${pct(x)};top:${pct(yOf(model.p50))}">${escapeHtml(model.name)} · ${duration(model.p50)}</span>`);
  }
  parts.push('<span class="obs-cap-tip" hidden></span>');
  const summary = text.summary(describe(models[0]), describe(best), models.length);
  return {
    plot: `<div class="obs-cap-plot" id="obs-cap-plot" role="img" aria-label="${escapeHtml(summary)}">\n            ${parts.join("\n            ")}\n          </div>`,
    rows: models.map(model => `<tr><th scope="row">${escapeHtml(model.name)}<small>${escapeHtml(dateOf(model.released))}</small></th><td>${duration(model.p50)}</td><td>${interval(model.ci95)}</td></tr>`)
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
for (const page of CAPABILITY_PAGES) {
  const pageFile = path.join(root, page.file);
  let html = await readFile(pageFile, "utf8");
  const capability = capabilitiesFor(page);
  for (const [key, content] of [["capacites-plot", `          ${capability.plot}`], ["capacites-rows", `        <tbody>\n        ${capability.rows.join("\n        ")}\n        </tbody>`]]) {
    const block = new RegExp(`([ ]*<!-- obs:${key}:start -->)[\\s\\S]*?\\n([ ]*<!-- obs:${key}:end -->)`);
    if (!block.test(html)) throw new Error(`${page.file}: markers “${key}” are missing`);
    html = html.replace(block, (match, begin, finish) => `${begin}\n${content}\n${finish}`);
  }
  await writeFile(pageFile, html, "utf8");
  console.log(`${page.file}: ${capability.rows.length} models plotted.`);
}
console.log(`${Object.keys(pooledSize).length} pooled estimates flagged.`);
