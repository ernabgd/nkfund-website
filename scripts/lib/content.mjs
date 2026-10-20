// Loads the editable content (content/**) into plain objects for the Eleventy templates.
// Content files are data, not Eleventy templates: one file holds both languages
// (title_ka/title_en, summary_ka/summary_en, body_ka/body_en …) so Pages CMS can show
// them on one screen. Pages are generated per language by src/pages/*.njk.
import fs from "node:fs";
import path from "node:path";
import { parseFrontMatter, loadYaml } from "./frontmatter.mjs";

export const LANGS = ["ka", "en"];
export const DEFAULT_LANG = "ka";

/** Date-only values ("2022-12-18" or YAML dates) become UTC midnight; anything else is parsed as-is. */
export function toDate(value) {
  if (value === undefined || value === null || value === "") return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(`${s}T00:00:00Z`);
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "2022-09" / "2022-09-15" / Date → normalised string; returns "" when empty/invalid. */
export function normaliseEventDate(value) {
  if (value === undefined || value === null || value === "") return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const s = String(value).trim();
  return /^\d{4}(-\d{2}(-\d{2})?)?$/.test(s) ? s : "";
}

function readDir(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(ext) && !f.startsWith("_") && !f.startsWith("."))
    .sort()
    .map((f) => path.join(dir, f));
}

function slugFromFile(file) {
  return path.basename(file).replace(/\.[^.]+$/, "");
}

/**
 * Projects and news: content/<type>/<slug>.md
 * Returns items sorted newest first, without drafts.
 */
export function loadItems(dir, type) {
  const items = readDir(dir, ".md").map((file) => {
    const { data, body } = parseFrontMatter(fs.readFileSync(file, "utf8"));
    const slug = String(data.slug || slugFromFile(file)).trim();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new Error(`${file}: slug "${slug}" must be lowercase latin letters, digits and hyphens`);
    }
    const date = toDate(data.date);
    if (!date) throw new Error(`${file}: missing or invalid "date"`);
    // body_ka may also live below the front matter (the Markdown body), e.g. for hand-written files.
    const bodyKa = data.body_ka ?? (body.trim() ? body : "");
    return {
      ...data,
      type,
      slug,
      date,
      updated: toDate(data.updated),
      event_date: normaliseEventDate(data.event_date),
      body_ka: bodyKa || "",
      gallery: Array.isArray(data.gallery) ? data.gallery.filter((g) => g && (g.image || typeof g === "string")).map((g) => (typeof g === "string" ? { image: g } : g)) : [],
      draft: data.draft === true,
      inputPath: file,
    };
  });

  const seen = new Set();
  for (const item of items) {
    if (seen.has(item.slug)) throw new Error(`Duplicate ${type} slug "${item.slug}"`);
    seen.add(item.slug);
  }

  return items
    .filter((item) => !item.draft)
    .sort((a, b) => sortTime(b) - sortTime(a) || b.date - a.date || (Number(b.order) || 0) - (Number(a.order) || 0) || a.slug.localeCompare(b.slug));
}

/**
 * The date an item is listed by — the same date its card shows: the event date when known (a partial date
 * counts from its first day: "2022-09" = 1 September 2022), otherwise the publication date. Newest first.
 */
export function sortTime(item) {
  const ev = normaliseEventDate(item?.event_date);
  if (ev) {
    const [y, m = "01", d = "01"] = ev.split("-");
    return Date.UTC(Number(y), Number(m) - 1, Number(d));
  }
  return item?.date instanceof Date ? item.date.getTime() : (toDate(item?.date)?.getTime() ?? 0);
}

/** Facebook posts imported by scripts/facebook-sync.mjs: content/facebook/<yyyy-mm-dd>-<id>.md */
export function loadFacebookPosts(dir) {
  return readDir(dir, ".md")
    .map((file) => {
      const { data, body } = parseFrontMatter(fs.readFileSync(file, "utf8"));
      const message = String(data.body ?? body ?? "").trim();
      return {
        id: String(data.id ?? slugFromFile(file)),
        date: toDate(data.date),
        link: data.link || "",
        show: data.show !== false,
        images: (Array.isArray(data.images) ? data.images : []).filter(Boolean),
        // Optional image description written by an editor in Pages CMS (Facebook gives none).
        image_alt_ka: data.image_alt_ka || "",
        image_alt_en: data.image_alt_en || "",
        message,
        inputPath: file,
      };
    })
    .filter((p) => p.date)
    .sort((a, b) => b.date - a.date);
}

/** Visible posts only: ticked "show" and with something to show. */
export function visibleFacebookPosts(posts) {
  return posts.filter((p) => p.show && (p.message || p.images.length) && /^https:\/\//.test(p.link));
}

/** content/pages/*.yml → { home: {...}, about: {...}, … } */
export function loadPages(dir) {
  const pages = {};
  for (const file of readDir(dir, ".yml")) {
    pages[slugFromFile(file)] = loadYaml(fs.readFileSync(file, "utf8")) ?? {};
  }
  return pages;
}

/** Minimal RFC 4180 CSV parser (quoted fields, "" escapes, CRLF). Returns an array of objects keyed by the header row. */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const s = String(text).replace(/^﻿/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"' && s[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((v) => v !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); if (row.some((v) => v !== "")) rows.push(row); }
  const [header, ...body] = rows;
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? "").trim()])));
}

/**
 * Old Wix URLs → static redirect stubs. GitHub Pages has no server-side redirects, so every
 * old path gets an index.html with meta refresh + canonical + JS location.replace.
 * Percent-encoded and raw Georgian rows collapse to one real UTF-8 directory.
 * Paths that GitHub Pages already resolves (old "/about" → new "/about/") are skipped.
 */
export function buildRedirects(rows, existingPaths = new Set()) {
  const stubs = new Map();
  const files = [];
  for (const row of rows) {
    if (String(row.status) !== "301") continue;
    let from;
    try { from = decodeURIComponent(row.old_path); } catch { from = row.old_path; }
    from = from.replace(/\/+$/, "");
    const to = row.new_path;
    if (!from || !from.startsWith("/") || !to.startsWith("/")) continue;
    if (`${from}/` === to || existingPaths.has(`${from}/`)) continue; // same page; GitHub Pages adds the slash itself
    if (/\.pdf$/i.test(from)) { files.push({ from, to }); continue; } // served as a real file copy
    if (!stubs.has(from)) stubs.set(from, { from, to, note: row.note || "" });
  }
  return { stubs: [...stubs.values()].sort((a, b) => a.from.localeCompare(b.from)), files };
}
