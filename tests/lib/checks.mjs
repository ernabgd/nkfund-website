// Content and schema checks shared by the CI tests (tests/*.test.mjs) and the Pages CMS round-trip test.
//
// Every check takes `dirs` = { root, code }:
//   root  where content/, data/ and .pages.yml are read (the repository, or a temporary copy)
//   code  where src/ (templates, uploaded files) and scripts/ are read (always the repository)
//
// These checks must keep passing after ANY edit an editor can make in Pages CMS: they test the code and the schema,
// never the current wording, order or values of the content (those snapshots live in tests/migration/). In particular
// a missing key counts as empty, because Pages CMS deletes empty values ("", null, [], {}) when it saves a file.
import fs from "node:fs";
import path from "node:path";
import { loadItems, loadPages, loadFacebookPosts } from "../../scripts/lib/content.mjs";
import { loadYaml, parseFrontMatter } from "../../scripts/lib/frontmatter.mjs";

const read = (file) => fs.readFileSync(file, "utf8");
const yamlAt = (file) => loadYaml(read(file)) ?? {};

export function fail(msg) {
  throw new Error(msg);
}
function ok(cond, msg) {
  if (!cond) fail(msg);
}

/** Keys kept in the files on purpose but not edited in the CMS (settings.content.merge keeps them). */
export const NOT_EDITABLE = new Set(["legacy", "order"]);

export function cmsConfig(dirs) {
  return yamlAt(path.join(dirs.root, ".pages.yml"));
}

/** Flatten CMS fields to dotted paths ("quote.text_ka"). Lists of objects use "gallery[].alt_ka". */
export function cmsPaths(config, fields, prefix = "") {
  const out = new Set();
  for (const f of fields || []) {
    const name = prefix + f.name;
    out.add(name);
    if (f.type === "object" && f.fields) {
      for (const p of cmsPaths(config, f.fields, f.list ? `${name}[].` : `${name}.`)) out.add(p);
    } else if (f.component && config.components?.[f.component]) {
      for (const p of cmsPaths(config, config.components[f.component].fields, `${name}.`)) out.add(p);
    }
  }
  return out;
}

/** Flatten data to dotted paths in the same notation. */
export function dataPaths(obj, prefix = "") {
  const out = new Set();
  for (const [k, v] of Object.entries(obj || {})) {
    if (NOT_EDITABLE.has(k) && !prefix) continue;
    const name = prefix + k;
    out.add(name);
    if (Array.isArray(v) && v.length && v.every((x) => x && typeof x === "object" && !Array.isArray(x))) {
      for (const item of v) for (const p of dataPaths(item, `${name}[].`)) out.add(p);
    } else if (v && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)) {
      for (const p of dataPaths(v, `${name}.`)) out.add(p);
    }
  }
  return out;
}

export function allEntries(items) {
  return items.flatMap((e) => (e.type === "group" ? allEntries(e.items) : [e]));
}

/* ---------- content ---------- */

/** Projects and news load; required fields are filled; every image exists; slugs are unique (loadItems throws). */
export function checkItems(dirs) {
  for (const [dir, type] of [["content/projects", "project"], ["content/news", "news"]]) {
    const items = loadItems(path.join(dirs.root, dir), type);
    for (const item of items) {
      for (const field of ["title_ka", "summary_ka"]) ok(String(item[field] ?? "").trim(), `${item.slug}: ${field} is empty`);
      for (const img of [item.cover, ...item.gallery.map((g) => g.image)].filter(Boolean)) {
        ok(String(img).startsWith("/assets/"), `${item.slug}: image path must start with /assets/: ${img}`);
        ok(fs.existsSync(path.join(dirs.code, `src${img}`)), `${item.slug}: missing file src${img}`);
      }
    }
  }
  loadFacebookPosts(path.join(dirs.root, "content/facebook"));
}

/** All page files exist and load. */
export function checkPages(dirs) {
  const pages = loadPages(path.join(dirs.root, "content/pages"));
  for (const name of ["home", "about", "projects", "news", "donate", "join", "contact", "privacy"]) ok(pages[name], `content/pages/${name}.yml missing`);
  return pages;
}

/** Every interface string is a { ka, en } pair with Georgian text (a missing key counts as ""). */
export function checkUiStrings(dirs) {
  const ui = yamlAt(path.join(dirs.root, "data/ui.yml"));
  for (const [group, entries] of Object.entries(ui)) {
    for (const [key, v] of Object.entries(entries || {})) {
      ok(v && typeof v === "object", `ui.${group}.${key} must be a { ka, en } pair`);
      for (const l of ["ka", "en"]) ok(typeof (v[l] ?? "") === "string", `ui.${group}.${key}.${l} must be text`);
      if (!(group === "labels" && key === "in_georgian")) ok(String(v.ka ?? "").trim(), `ui.${group}.${key}.ka is empty`);
    }
  }
}

/** A valid IBAN (format + ISO 7064 mod-97), known currency codes, the PDF exists. Values themselves may change. */
export function checkBank(dirs) {
  const bank = yamlAt(path.join(dirs.root, "data/bank.yml"));
  const iban = String(bank.iban ?? "");
  ok(/^GE\d{2}[A-Z]{2}\d{16}$/.test(iban), `data/bank.yml: "${iban}" is not a Georgian IBAN (GE + 2 digits + 2 letters + 16 digits, no spaces)`);
  const n = (iban.slice(4) + iban.slice(0, 4)).replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  ok(BigInt(n) % 97n === 1n, `data/bank.yml: IBAN ${iban} fails the mod-97 check (typo?)`);
  const codes = (bank.currencies || []).map((c) => c && c.code);
  ok(codes.length > 0 && codes.every((c) => ["GEL", "USD", "EUR"].includes(c)), `data/bank.yml: currencies must be GEL, USD and/or EUR (got ${codes.join(", ")})`);
  ok(!bank.pdf || fs.existsSync(path.join(dirs.code, `src${bank.pdf}`)), `data/bank.yml: missing PDF src${bank.pdf}`);
}

/* ---------- Pages CMS schema ---------- */

/** Every key in a file has a CMS field (editors can see and change it). Missing keys are fine (= empty). */
export function checkFileForms(dirs) {
  const config = cmsConfig(dirs);
  for (const entry of allEntries(config.content).filter((e) => e.type === "file")) {
    const file = path.join(dirs.root, entry.path);
    ok(fs.existsSync(file), `${entry.path} (a Pages CMS file) is missing`);
    const cms = cmsPaths(config, entry.fields);
    const extra = [...dataPaths(yamlAt(file))].filter((p) => !cms.has(p));
    ok(extra.length === 0, `${entry.path}: keys without a CMS field: ${extra.join(", ")}`);
  }
}

/** Collections: no key without a CMS field; every field the CMS marks required is filled in. */
export function checkCollections(dirs) {
  const config = cmsConfig(dirs);
  for (const entry of allEntries(config.content).filter((e) => e.type === "collection")) {
    const dir = path.join(dirs.root, entry.path);
    const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".md")) : [];
    const cms = cmsPaths(config, entry.fields);
    for (const f of files) {
      const { data, body } = parseFrontMatter(read(path.join(dir, f)));
      const extra = [...dataPaths(body.trim() ? { ...data, body } : data)].filter((p) => !cms.has(p));
      ok(extra.length === 0, `${entry.path}/${f}: keys without a CMS field: ${extra.join(", ")}`);
      for (const field of entry.fields.filter((x) => x.required && !x.list)) {
        const v = data[field.name];
        ok(v !== undefined && v !== null && String(v).trim() !== "", `${entry.path}/${f}: required field "${field.name}" is empty`);
      }
    }
  }
}

function walk(d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
}

/** pages.<file>.<field> and p.<field> in the templates are CMS fields of that page file (so editors can fill them). */
export function checkTemplatesReadCmsFields(dirs) {
  const config = cmsConfig(dirs);
  const byFile = {};
  for (const e of allEntries(config.content).filter((x) => x.type === "file" && /^content\/pages\//.test(x.path))) {
    byFile[path.basename(e.path, ".yml")] = cmsPaths(config, e.fields);
  }
  const has = (paths, dotted) => paths && (paths.has(dotted) || paths.has(`${dotted}_ka`));
  for (const file of walk(path.join(dirs.code, "src")).filter((f) => f.endsWith(".njk"))) {
    const src = read(file);
    const rel = path.relative(dirs.code, file);
    for (const m of src.matchAll(/pages\.(\w+)\.(\w+)/g)) {
      ok(byFile[m[1]], `${rel}: pages.${m[1]} is not a Pages CMS page file`);
      ok(has(byFile[m[1]], m[2]), `${rel}: pages.${m[1]}.${m[2]} is not a CMS field`);
    }
    const alias = src.match(/set p = pages\.(\w+)/);
    if (alias) {
      for (const m of src.matchAll(/\bp\.(\w+)(?:\.(\w+))?/g)) {
        ok(has(byFile[alias[1]], m[1]), `${rel}: p.${m[1]} is not a CMS field of content/pages/${alias[1]}.yml`);
        if (m[2] && byFile[alias[1]].has(m[1]) && [...byFile[alias[1]]].some((x) => x.startsWith(`${m[1]}.`))) {
          ok(has(byFile[alias[1]], `${m[1]}.${m[2]}`), `${rel}: p.${m[1]}.${m[2]} is not a CMS field of content/pages/${alias[1]}.yml`);
        }
      }
    }
  }
}

/** Every interface string and every page/settings field is read somewhere (editors would change text that never appears). */
export function checkEverythingIsUsed(dirs) {
  const code = [...walk(path.join(dirs.code, "src")).filter((f) => /\.(njk|js)$/.test(f)), path.join(dirs.code, "scripts/lib/filters.mjs"), path.join(dirs.code, "eleventy.config.js")]
    .map(read)
    .join("\n");
  const ui = yamlAt(path.join(dirs.root, "data/ui.yml"));
  // Keys reached through computed names: ui.nav[key], ui.donate[key] (bankRow), ui.categories[…],
  // ui.donate["currency_"/"tab_" ~ code], ui.item["previous_"/"next_"/"first_"/"latest_" ~ kind].
  const bankRowKeys = new Set([...code.matchAll(/bankRow\(([^\n]*?)\)\s*\}\}/g)].flatMap((m) => [...m[1].matchAll(/"(\w+)"/g)].map((x) => x[1])));
  const navKeys = new Set([...code.matchAll(/for key in \[([^\]]+)\]/g)].flatMap((m) => [...m[1].matchAll(/"(\w+)"/g)].map((x) => x[1])));
  const dynamic = (g, k) =>
    (g === "nav" && navKeys.has(k)) ||
    (g === "donate" && (bankRowKeys.has(k) || /^(currency|tab)_(GEL|USD|EUR)$/.test(k))) ||
    g === "categories" ||
    (g === "item" && /^(previous|next|first|latest)_(project|news)$/.test(k));
  const unused = [];
  for (const [g, entries] of Object.entries(ui)) {
    for (const k of Object.keys(entries || {})) if (!new RegExp(`ui\\.${g}\\.${k}\\b`).test(code) && !dynamic(g, k)) unused.push(`${g}.${k}`);
  }
  ok(unused.length === 0, `interface strings no template uses: ${unused.join(", ")}`);

  const files = ["content/pages", "data"].flatMap((d) => fs.readdirSync(path.join(dirs.root, d)).filter((f) => f.endsWith(".yml") && f !== "ui.yml").map((f) => `${d}/${f}`));
  const missing = [];
  const visit = (obj, file) => {
    for (const [k, v] of Object.entries(obj || {})) {
      if (NOT_EDITABLE.has(k)) continue;
      const base = k.replace(/_(ka|en)$/, "");
      if (!new RegExp(`[."']${base}(?:_ka|_en)?\\b`).test(code)) missing.push(`${file}: ${k}`);
      if (v && typeof v === "object" && !Array.isArray(v)) visit(v, file);
      if (Array.isArray(v)) v.filter((x) => x && typeof x === "object").forEach((x) => visit(x, file));
    }
  };
  for (const f of files) visit(yamlAt(path.join(dirs.root, f)), f);
  ok(missing.length === 0, `fields no template reads: ${missing.join(", ")}`);
}

/** Everything above, in order. */
export const ALL_CHECKS = {
  checkItems,
  checkPages,
  checkUiStrings,
  checkBank,
  checkFileForms,
  checkCollections,
  checkTemplatesReadCmsFields,
  checkEverythingIsUsed,
};

/* ---------- Pages CMS save simulation ---------- */

const isEmpty = (v) => v === "" || v === null || v === undefined || (Array.isArray(v) && v.length === 0) || (v && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date) && Object.keys(v).length === 0);

/**
 * What Pages CMS 2.x does to a document when it saves it (sanitizeObject() in its files API route): every empty
 * value — "", null, [] and {} — is deleted, recursively (also inside list items).
 */
export function stripEmpty(value) {
  if (Array.isArray(value)) return value.map(stripEmpty).filter((v) => !isEmpty(v));
  if (value && typeof value === "object" && !(value instanceof Date)) {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const s = stripEmpty(v);
      if (!isEmpty(s)) out[k] = s;
    }
    return out;
  }
  return value;
}
