// Builds the contents block of the long guides (Comprendre / Understand) from their own chapters:
// number and title from each chapter's kicker ("05 / Capacités et limites"), reading time from its text.
// Run after adding, renaming or rewriting a chapter:  node scripts/build-chapter-toc.mjs
import { readFile, writeFile } from "node:fs/promises";

const WORDS_PER_MINUTE = 250; // consistent with the reading time given in the page introduction
const STYLESHEET = '<link rel="stylesheet" href="/assets/css/chapter-toc.css?v=1.0">';

const PAGES = [
  {
    file: "comprendre/index.html",
    id: "sommaire",
    heading: "Sommaire",
    separator: "&nbsp;: ",
    intro: count => `${count} chapitres, à lire dans l’ordre ou séparément.`,
    minutes: n => `${n} min`,
    parts: [
      { title: "Comment fonctionnent les modèles", ids: ["systemes", "llm", "entrainement", "systeme"] },
      { title: "Ce qu’ils savent faire", ids: ["capacites", "benchmarks", "trajectoire"] },
      { title: "Risques et usage au travail", ids: ["risques-systemes", "agi", "travail", "questions"] }
    ],
    more: { id: "ressources", text: "des ressources choisies selon la question que vous vous posez." }
  },
  {
    file: "en/understand/index.html",
    id: "contents",
    heading: "Contents",
    separator: ": ",
    intro: count => `${count} chapters, to read in order or on their own.`,
    minutes: n => `${n} min`,
    parts: [
      { title: "How the models work", ids: ["systemes", "llm", "entrainement", "systeme"] },
      { title: "What they can do", ids: ["capacites", "benchmarks", "trajectoire"] },
      { title: "Risks and use at work", ids: ["risques-systemes", "agi", "travail", "questions"] }
    ],
    more: { id: "ressources", text: "resources chosen according to the question you are asking." }
  }
];

const decode = value => value
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;|&#160;/g, " ")
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'")
  .replace(/\s+/g, " ")
  .trim();
const escapeHtml = value => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Each top-level chapter runs from its <section id="…"> to the next one.
function chapters(html) {
  const main = html.slice(html.indexOf("<main"), html.indexOf("</main>"));
  const starts = [...main.matchAll(/<section\b[^>]*\bid="([^"]+)"[^>]*>/g)].map(match => ({ id: match[1], index: match.index }));
  return new Map(starts.map((start, position) => {
    const body = main.slice(start.index, starts[position + 1]?.index ?? main.length);
    const kicker = decode(body.match(/<p class="kicker">([\s\S]*?)<\/p>/)?.[1] || "");
    const [, number = "", title = kicker] = kicker.match(/^(\d+)\s*\/\s*(.+)$/) || [];
    const words = decode(body.replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/g, " ")).split(" ").filter(Boolean).length;
    return [start.id, { number, title, words }];
  }));
}

for (const page of PAGES) {
  let html = await readFile(page.file, "utf8");
  const found = chapters(html);
  const minutes = id => Math.max(1, Math.round(found.get(id).words / WORDS_PER_MINUTE));
  const missing = [...page.parts.flatMap(part => part.ids), page.more.id].filter(id => !found.has(id));
  if (missing.length) throw new Error(`${page.file}: chapters not found: ${missing.join(", ")}`);
  const count = page.parts.reduce((total, part) => total + part.ids.length, 0);

  const parts = page.parts.map((part, index) => `
        <section class="chapter-toc-part" aria-labelledby="${page.id}-${index + 1}">
          <h3 id="${page.id}-${index + 1}">${escapeHtml(part.title)}</h3>
          <ol>${part.ids.map(id => {
            const { number, title } = found.get(id);
            return `
            <li><a class="chapter-toc-link" href="#${id}"><span class="chapter-toc-num">${escapeHtml(number)}</span><span class="chapter-toc-title">${escapeHtml(title)}</span><span class="chapter-toc-time">${page.minutes(minutes(id))}</span></a></li>`;
          }).join("")}
          </ol>
        </section>`).join("");
  const more = found.get(page.more.id);
  const block = `<!-- chapter-toc:start -->
    <nav class="chapter-toc" id="${page.id}" aria-labelledby="${page.id}-title">
      <div class="chapter-toc-head">
        <h2 id="${page.id}-title">${escapeHtml(page.heading)}</h2>
        <p>${escapeHtml(page.intro(count))}</p>
      </div>
      <div class="chapter-toc-parts">${parts}
      </div>
      <p class="chapter-toc-more"><a href="#${page.more.id}">${escapeHtml(more.title)}</a>${page.separator}${escapeHtml(page.more.text)}</p>
    </nav>
    <!-- chapter-toc:end -->`;

  const markers = /<!-- chapter-toc:start -->[\s\S]*?<!-- chapter-toc:end -->/;
  if (markers.test(html)) html = html.replace(markers, block);
  else {
    // First run: after the key points, before the first chapter.
    const quickReadEnd = html.search(/<section class="quick-read"[\s\S]*?<\/section>/);
    if (quickReadEnd === -1) throw new Error(`${page.file}: no quick-read section to place the contents after`);
    const end = html.indexOf("</section>", quickReadEnd) + "</section>".length;
    html = `${html.slice(0, end)}\n\n    ${block}${html.slice(end)}`;
  }
  if (!html.includes("/assets/css/chapter-toc.css")) html = html.replace(/(\s*<link rel="stylesheet" href="\/assets\/css\/ux-improvements\.css)/, `\n  ${STYLESHEET}$1`);
  await writeFile(page.file, html);
  console.log(`${page.file}: ${count} chapters, ${page.parts.flatMap(part => part.ids).map(id => `${found.get(id).number} ${minutes(id)} min`).join(", ")}`);
}
