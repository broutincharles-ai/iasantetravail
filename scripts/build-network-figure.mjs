// Rebuilds the static picture of the “neural network” figure of the long guides (Comprendre / Understand).
// The figure is drawn by the page's own inline script (data-source="/assets/js/understand-network.js").
// This tool runs that same script against a minimal DOM, in each language, and writes what it draws
// inside <svg id="nn-svg">, so the figure stays readable without JavaScript.
// Run after changing that script or its labels:  node scripts/build-network-figure.mjs
import { readFile, writeFile } from "node:fs/promises";

const PAGES = [
  { file: "comprendre/index.html", lang: "fr" },
  { file: "en/understand/index.html", lang: "en" }
];
const SCRIPT = /<script data-source="\/assets\/js\/understand-network\.js">([\s\S]*?)<\/script>/;
const SVG = /(<svg\b[^>]*\bid="nn-svg"[^>]*>)[\s\S]*?(<\/svg>)/;

const escapeText = value => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeAttribute = value => escapeText(value).replace(/"/g, "&quot;");

// Just enough of the DOM for the figure script: elements, attributes, children, text.
class Node {
  constructor(tag) { this.tag = tag; this.attributes = new Map(); this.children = []; this.text = ""; this.hidden = true; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.has(name) ? this.attributes.get(name) : null; }
  appendChild(child) { this.children.push(child); return child; }
  removeChild(child) { const index = this.children.indexOf(child); if (index >= 0) this.children.splice(index, 1); return child; }
  get firstChild() { return this.children[0] || null; }
  set textContent(value) { this.text = String(value); }
  get textContent() { return this.text; }
  addEventListener() {}
  serialize() {
    const attributes = [...this.attributes].map(([name, value]) => ` ${name}="${escapeAttribute(value)}"`).join("");
    if (!this.children.length && !this.text) return `<${this.tag}${attributes}/>`;
    return `<${this.tag}${attributes}>${escapeText(this.text)}${this.children.map(child => child.serialize()).join("")}</${this.tag}>`;
  }
}

// Marks that carry nothing in the still picture: hidden overlays, empty labels.
const isEmpty = node => node.getAttribute("visibility") === "hidden"
  || (node.tag === "text" && !node.text)
  || (node.tag === "polyline" && !node.getAttribute("points"));
function prune(node) {
  node.children = node.children.filter(child => !isEmpty(child));
  node.children.forEach(prune);
}

function draw(source, lang) {
  const svg = new Node("svg");
  const button = new Node("button");
  const document = {
    documentElement: { getAttribute: () => lang },
    getElementById: id => (id === "nn-svg" ? svg : id === "nn-toggle" ? button : null),
    createElementNS: (namespace, tag) => new Node(tag)
  };
  // Reduced motion is the script's own still mode: it draws the trained network and stops.
  const window = { matchMedia: () => ({ matches: true }) };
  const performance = { now: () => 0 };
  new Function("document", "window", "performance", "requestAnimationFrame", "cancelAnimationFrame", source)(document, window, performance, () => 0, () => {});
  prune(svg);
  return svg.children.map(child => child.serialize()).join("");
}

for (const page of PAGES) {
  const html = await readFile(page.file, "utf8");
  const source = html.match(SCRIPT)?.[1];
  if (!source) throw new Error(`${page.file}: figure script not found`);
  if (!SVG.test(html)) throw new Error(`${page.file}: <svg id="nn-svg"> not found`);
  const picture = draw(source, page.lang);
  const updated = html.replace(SVG, (match, open, close) => `${open}${picture}${close}`);
  if (updated !== html) await writeFile(page.file, updated);
  console.log(`${page.file}: network figure ${updated === html ? "already up to date" : "rebuilt"} (${picture.length} characters)`);
}
