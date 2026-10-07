// Fills the "Dernières lectures / Latest reading" block of both homepages from the reading collections.
// Run after publishing a reading:  node scripts/build-home-latest.mjs
import { readFile, writeFile } from "node:fs/promises";

const SETS = [
  { home: "index.html", collection: "lecture/index.html", prefix: "/lecture/", locale: "fr-FR", count: 3 },
  { home: "en/index.html", collection: "en/reading/index.html", prefix: "/en/reading/", locale: "en-GB", count: 3 }
];

const decode = value => value
  .replace(/<[^>]+>/g, "")
  .replace(/&nbsp;|&#160;/g, " ")
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'")
  .replace(/\s+/g, " ")
  .trim();
const escapeHtml = value => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

for (const { home, collection, prefix, locale, count } of SETS) {
  const source = await readFile(collection, "utf8");
  const entries = [...source.matchAll(/<article\b[^>]*data-date="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)].map(([, date, body]) => ({
    date,
    // The collection's first reading is laid out as a lead (lead-kind, lead-summary), the others as entries.
    kind: decode(body.match(/<p class="(?:entry|lead)-kind">([\s\S]*?)<\/p>/)?.[1] || ""),
    title: decode(body.match(/<h3>([\s\S]*?)<\/h3>/)?.[1] || ""),
    summary: decode(body.match(/<div class="entry-summary"><p>([\s\S]*?)<\/p>/)?.[1] || body.match(/<p class="lead-summary">([\s\S]*?)<\/p>/)?.[1] || ""),
    href: [...body.matchAll(/href="([^"]+)"/g)].map(match => match[1]).find(href => href.startsWith(prefix)) || ""
  }));
  const selected = entries
    .filter(entry => entry.href && entry.title)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, count);
  if (selected.length < count) throw new Error(`${collection}: only ${selected.length} readings available for the homepage`);
  const unsummarised = selected.find(entry => !entry.summary);
  if (unsummarised) throw new Error(`${collection}: no summary found for ${unsummarised.href}`);

  const formatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const items = selected.map(entry => `
          <li class="home-latest-item">
            <p class="home-latest-date"><time datetime="${entry.date}">${formatter.format(new Date(`${entry.date}T00:00:00Z`))}</time></p>
            <h3><a href="${entry.href}">${escapeHtml(entry.title)}</a></h3>
            <p>${escapeHtml(entry.summary)}</p>
          </li>`).join("");

  const page = await readFile(home, "utf8");
  const block = /(<!-- latest-readings:start -->)[\s\S]*?(<!-- latest-readings:end -->)/;
  if (!block.test(page)) throw new Error(`${home}: latest-readings markers missing`);
  // A function, so that "$" in a title or summary is inserted as is.
  await writeFile(home, page.replace(block, (match, start, end) => `${start}${items}\n          ${end}`));
  console.log(`${home}: ${selected.map(entry => entry.href).join(", ")}`);
}
