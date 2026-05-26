import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  process.env.PW_CORE || "playwright-core"
);

const SRC = process.argv[2];
const OUT = process.argv[3];
const md = readFileSync(SRC, "utf8");

const esc = (s) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// Inline: **bold**, `code`
function inline(s) {
  let t = esc(s);
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  return t;
}

const lines = md.split("\n");
const html = [];
let i = 0;

function flushParagraph(buf) {
  if (buf.length) {
    html.push(`<p>${inline(buf.join(" ").trim())}</p>`);
    buf.length = 0;
  }
}

const para = [];
while (i < lines.length) {
  const line = lines[i];

  // Horizontal rule
  if (/^---+\s*$/.test(line)) {
    flushParagraph(para);
    html.push("<hr/>");
    i++;
    continue;
  }
  // Headings
  const h = line.match(/^(#{1,4})\s+(.*)$/);
  if (h) {
    flushParagraph(para);
    const level = h[1].length;
    html.push(`<h${level}>${inline(h[2])}</h${level}>`);
    i++;
    continue;
  }
  // Table block
  if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
    flushParagraph(para);
    const header = line.split("|").slice(1, -1).map((c) => c.trim());
    i += 2;
    const rows = [];
    while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
      rows.push(lines[i].split("|").slice(1, -1).map((c) => c.trim()));
      i++;
    }
    let t = "<table><thead><tr>";
    for (const c of header) t += `<th>${inline(c)}</th>`;
    t += "</tr></thead><tbody>";
    for (const r of rows) {
      t += "<tr>";
      for (const c of r) t += `<td>${inline(c)}</td>`;
      t += "</tr>";
    }
    t += "</tbody></table>";
    html.push(t);
    continue;
  }
  // Unordered list
  if (/^\s*-\s+/.test(line)) {
    flushParagraph(para);
    let t = "<ul>";
    while (i < lines.length && /^\s*-\s+/.test(lines[i])) {
      t += `<li>${inline(lines[i].replace(/^\s*-\s+/, ""))}</li>`;
      i++;
    }
    t += "</ul>";
    html.push(t);
    continue;
  }
  // Ordered list
  if (/^\s*\d+\.\s+/.test(line)) {
    flushParagraph(para);
    let t = "<ol>";
    while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
      t += `<li>${inline(lines[i].replace(/^\s*\d+\.\s+/, ""))}</li>`;
      i++;
    }
    t += "</ol>";
    html.push(t);
    continue;
  }
  // Blank line
  if (/^\s*$/.test(line)) {
    flushParagraph(para);
    i++;
    continue;
  }
  // Paragraph text
  para.push(line);
  i++;
}
flushParagraph(para);

const body = html.join("\n");

const doc = `<!doctype html><html><head><meta charset="utf-8"/>
<style>
  @page { margin: 56px 64px; }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Helvetica, Arial, sans-serif;
    color: #1A1024; line-height: 1.55; font-size: 11.5px; margin: 0;
  }
  h1 { font-size: 27px; line-height: 1.15; margin: 0 0 6px; color: #2A0E5A; letter-spacing: -0.01em; }
  h2 { font-size: 17px; margin: 26px 0 8px; padding-bottom: 5px; border-bottom: 2px solid #FF1F8F22; color: #B8228F; }
  h3 { font-size: 13px; margin: 16px 0 5px; color: #2A0E5A; }
  h4 { font-size: 11.5px; margin: 12px 0 4px; color: #6B3FA0; text-transform: uppercase; letter-spacing: 0.04em; }
  p { margin: 7px 0; }
  ul, ol { margin: 7px 0 7px 18px; padding: 0; }
  li { margin: 3px 0; }
  strong { color: #2A0E5A; }
  code { font-family: "SFMono-Regular", Menlo, Consolas, monospace; background: #F3EDFB; color: #8A1E6B; padding: 1px 5px; border-radius: 4px; font-size: 10px; }
  hr { border: none; border-top: 1px solid #E7DCF5; margin: 22px 0; }
  table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 10.5px; }
  th, td { border: 1px solid #E7DCF5; padding: 6px 9px; text-align: left; vertical-align: top; }
  th { background: #2A0E5A; color: #fff; font-weight: 600; }
  tr:nth-child(even) td { background: #FAF7FE; }
  .cover { padding: 6px 0 2px; }
  .cover .badge { display:inline-block; background:linear-gradient(135deg,#FF1F8F,#B847FF); color:#fff; font-size:10px; font-weight:700; letter-spacing:0.06em; padding:4px 10px; border-radius:999px; text-transform:uppercase; }
</style></head>
<body><div class="cover"></div>${body}</body></html>`;

const browser = await chromium.launch({
  executablePath: process.env.PW_CHROME,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setContent(doc, { waitUntil: "networkidle" });
await page.pdf({
  path: OUT,
  format: "A4",
  printBackground: true,
  margin: { top: "56px", bottom: "56px", left: "64px", right: "64px" },
});
await browser.close();
console.log("PDF written:", OUT);
