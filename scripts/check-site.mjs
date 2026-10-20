#!/usr/bin/env node
// Post-build checks on _site (run in CI after `npm run build`): no dependencies, fails with exit code 1.
//
//   node scripts/check-site.mjs [_site]
//
// The build writes _site/.build.json ({ pathPrefix, siteUrl, preview }); the checks use those settings, so
// `npm run build:preview && npm run check` works. Without that file, PATH_PREFIX / PREVIEW / SITE_URL are read
// from the environment, like the build.
//
// - every root-relative URL in href/src/srcset/poster/content points to a file in the build
// - every page: <html lang>, one <h1>, a <title>, every <img> has an alt attribute, no duplicate ids
// - preview builds carry noindex everywhere (redirect stubs included) and robots.txt disallows everything; production
//   builds don't (except the 404 page, which is never indexed) and use an https:// SITE_URL
// - redirect stubs point to pages that exist
// - nothing is loaded from third parties: no external <script>, stylesheet, font, <img>, <video>, <source>,
//   <track>, srcset, poster, data-* asset or CSS url()
// - no prototype/sample markers (invented Facebook posts are never published)
// - no output path segment longer than 255 bytes (the Linux/macOS file-name limit); a warning above 240 bytes
//   (the longest Georgian redirect slug today is 250 bytes: its URL must stay exact, so it cannot be shortened)
// HTML validity and accessible markup are checked separately by html-validate (npm run check).
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] || "_site");
const build = (() => {
  try { return JSON.parse(fs.readFileSync(path.join(root, ".build.json"), "utf8")); } catch { return null; }
})();
const prefix = (() => {
  let p = String(build?.pathPrefix ?? process.env.PATH_PREFIX ?? "/").trim();
  if (!p.startsWith("/")) p = `/${p}`;
  if (!p.endsWith("/")) p += "/";
  return p;
})();
const preview = build ? build.preview === true : /^(1|true|yes|on)$/i.test(String(process.env.PREVIEW || ""));
const siteUrl = String(build?.siteUrl ?? process.env.SITE_URL ?? "https://nkfund.world");
const errors = [];
const warnings = [];
const err = (file, msg) => errors.push(`${path.relative(root, file) || file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${path.relative(root, file) || file}: ${msg}`);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    const bytes = Buffer.byteLength(e.name);
    if (bytes > 255) err(p, `path segment of ${bytes} bytes (Linux and macOS allow 255)`);
    else if (bytes > 240) warn(p, `path segment of ${bytes} bytes (close to the 255-byte limit)`);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function resolves(url) {
  let u = url.split("#")[0].split("?")[0];
  if (!u.startsWith(prefix)) return false;
  u = u.slice(prefix.length);
  try { u = decodeURIComponent(u); } catch { return false; }
  const target = path.join(root, u);
  if (!target.startsWith(root)) return false;
  if (fs.existsSync(target) && fs.statSync(target).isFile()) return true;
  return fs.existsSync(path.join(target, "index.html"));
}

const files = walk(root);
const html = files.filter((f) => f.endsWith(".html"));
let checkedUrls = 0;

if (!preview && !/^https:\/\//.test(siteUrl)) errors.push(`production build with SITE_URL "${siteUrl}" (must start with https://)`);

const EXTERNAL = /^(?:https?:)?\/\//i;

for (const file of html) {
  const src = fs.readFileSync(file, "utf8");
  const isStub = /http-equiv="refresh"/.test(src);
  const is404 = path.relative(root, file) === "404.html";

  // URLs
  const urls = [];
  for (const m of src.matchAll(/\s(?:href|src|poster|action)="([^"]+)"/g)) urls.push(m[1]);
  for (const m of src.matchAll(/\ssrcset="([^"]+)"/g)) m[1].split(",").forEach((c) => urls.push(c.trim().split(/\s+/)[0]));
  for (const raw of urls) {
    const u = raw.replace(/&amp;/g, "&");
    if (/^(https?:|mailto:|tel:|data:|#|javascript:)/i.test(u)) continue;
    if (!u.startsWith("/")) { err(file, `relative URL "${u}" (use root-relative URLs)`); continue; }
    checkedUrls++;
    if (!resolves(u)) err(file, `broken link ${u}`);
  }

  // Third-party assets: anything the browser would fetch by itself (links to other sites are fine)
  for (const m of src.matchAll(/<(script|link|img|video|audio|source|track|iframe|embed|object|image|use)\b[^>]*>/gi)) {
    const tag = m[0];
    const name = m[1].toLowerCase();
    for (const a of tag.matchAll(/\s(src|href|srcset|poster|data|data-[\w-]+|xlink:href)="([^"]+)"/gi)) {
      const attr = a[1].toLowerCase();
      if (name === "link" && attr === "href" && !/rel="[^"]*\b(stylesheet|preload|modulepreload|icon|apple-touch-icon|manifest|prefetch)\b/i.test(tag)) continue;
      const values = attr === "srcset" ? a[2].split(",").map((c) => c.trim().split(/\s+/)[0]) : [a[2]];
      for (const v of values) if (EXTERNAL.test(v)) err(file, `external asset <${name} ${attr}="${v}">`);
    }
  }
  for (const m of src.matchAll(/url\(\s*['"]?((?:https?:)?\/\/[^'")\s]+)/gi)) err(file, `external asset url(${m[1]}) in inline style`);

  // Robots
  const noindex = /<meta name="robots" content="noindex/.test(src);
  if (preview && !noindex) err(file, isStub ? "preview redirect stub without noindex" : "preview build without noindex");
  if (!isStub && !preview && noindex && !is404) err(file, "production build with noindex");
  if (is404 && !noindex) err(file, "the 404 page must carry noindex");

  if (isStub) {
    const target = src.match(/http-equiv="refresh" content="0; url=([^"]+)"/)?.[1];
    if (!target) err(file, "redirect stub without target");
    continue;
  }

  // Production never shows prototype or sample material (invented Facebook posts, "sample" badges, demo data)
  for (const marker of ["ნიმუში", "პროტოტიპ", "DEMO —", "data-demo", "fb__sample"]) {
    if (src.includes(marker)) err(file, `prototype/sample marker "${marker}" in the page`);
  }

  // Basic document checks
  if (!/<html lang="(ka|en)"/.test(src)) err(file, "missing <html lang>");
  if (!/<title>[^<]+<\/title>/.test(src)) err(file, "missing <title>");
  const h1 = (src.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) err(file, `${h1} <h1> elements (expected 1)`);
  for (const m of src.matchAll(/<img\b[^>]*>/g)) if (!/\salt="/.test(m[0])) err(file, `<img> without alt: ${m[0].slice(0, 80)}`);
  const ids = [...src.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) err(file, `duplicate id(s): ${[...new Set(dup)].join(", ")}`);
}

// Stylesheets and scripts: no external url() / @import / fetch targets
for (const file of files.filter((f) => /\.(css|js|webmanifest)$/.test(f))) {
  const src = fs.readFileSync(file, "utf8");
  for (const m of src.matchAll(/(?:url\(\s*['"]?|@import\s+['"])((?:https?:)?\/\/[^'")\s]+)/gi)) err(file, `external asset ${m[1]}`);
}

// robots.txt
const robots = fs.readFileSync(path.join(root, "robots.txt"), "utf8");
if (preview && !/Disallow: \/\s*$/m.test(robots)) errors.push("robots.txt: preview build must disallow everything");
if (!preview && /Disallow: \/\s*$/m.test(robots)) errors.push("robots.txt: production build disallows everything");

// Redirect stub targets (absolute URLs → strip origin)
for (const file of html) {
  const src = fs.readFileSync(file, "utf8");
  const target = src.match(/http-equiv="refresh" content="0; url=([^"]+)"/)?.[1];
  if (!target) continue;
  const p = new URL(target).pathname;
  if (!resolves(p)) err(file, `redirect target missing: ${target}`);
}

const bytes = files.reduce((n, f) => n + fs.statSync(f).size, 0);
const big = files.filter((f) => fs.statSync(f).size > 25 * 1024 * 1024);
for (const f of big) err(f, `file larger than 25 MB (${(fs.statSync(f).size / 1048576).toFixed(1)} MB)`);

if (warnings.length) console.warn(warnings.map((w) => `  ! ${w}`).join("\n"));
console.log(`check-site: ${html.length} HTML files, ${checkedUrls} internal URLs, ${(bytes / 1048576).toFixed(1)} MB total, prefix "${prefix}", preview=${preview}, site ${siteUrl}${build ? "" : " (from the environment: no .build.json)"}`);
if (errors.length) {
  console.error(errors.map((e) => `  ✗ ${e}`).join("\n"));
  console.error(`check-site: ${errors.length} problem(s)`);
  process.exit(1);
}
console.log("check-site: OK");
