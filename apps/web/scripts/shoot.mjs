import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_CORE);

const base = process.env.BASE || "http://localhost:3100";
const pages = (process.env.PAGES || "/trade,/,/token,/login,/verify,/staking,/docs").split(",");
const W = Number(process.env.W || 390);
const H = Number(process.env.H || 844);

const browser = await chromium.launch({ executablePath: process.env.PW_CHROME, args: ["--no-sandbox"] });
const ctx = await browser.newContext({
  viewport: { width: W, height: H },
  deviceScaleFactor: 2,
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
});
const page = await ctx.newPage();
const overflow = [];
for (const p of pages) {
  const name = p === "/" ? "home" : p.replace(/\//g, "_").replace(/^_/, "");
  try {
    await page.goto(base + p, { waitUntil: "networkidle", timeout: 30000 });
  } catch {
    try { await page.goto(base + p, { waitUntil: "domcontentloaded", timeout: 15000 }); } catch {}
  }
  await page.waitForTimeout(1200);
  const out = `/tmp/shots/${name}.png`;
  await page.screenshot({ path: out, fullPage: true });
  // Detect horizontal overflow
  const o = await page.evaluate((vw) => {
    const docW = document.documentElement.scrollWidth;
    const offenders = [];
    document.querySelectorAll("*").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 && r.width > 8) {
        offenders.push({ tag: el.tagName.toLowerCase(), cls: (el.className || "").toString().slice(0, 60), right: Math.round(r.right) });
      }
    });
    return { docW, vw, top: offenders.slice(0, 8) };
  }, W);
  overflow.push({ p, docW: o.docW, vw: o.vw, overflow: o.docW > o.vw + 1, offenders: o.top });
  console.log(`shot ${p} -> ${out}  docW=${o.docW} vw=${o.vw} ${o.docW > o.vw + 1 ? "OVERFLOW" : "ok"}`);
}
console.log("\n=== OVERFLOW DETAIL ===");
for (const r of overflow) {
  if (r.overflow) {
    console.log(`\n${r.p} (docW ${r.docW} > ${r.vw}):`);
    for (const o of r.offenders) console.log(`  <${o.tag}> right=${o.right} class="${o.cls}"`);
  }
}
await browser.close();
