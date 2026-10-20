#!/usr/bin/env node
// Imports the foundation's Facebook Page posts into content/facebook/*.md (one file per post).
//
//   FB_PAGE_ID=… FB_PAGE_TOKEN=… node scripts/facebook-sync.mjs [--initial] [--since=YYYY-MM-DD] [--dry-run]
//
//   (no flag)       posts since the last successful check minus 3 days (first run: last 30 days)
//   --since=DATE    posts published on or after DATE
//   --initial       the Page's newest posts, up to INITIAL_POSTS (24 = what the News page can show)
//
// Each new post becomes content/facebook/<yyyy-mm-dd>-<post id>.md:
//   ---
//   id: "<page id>_<post id>"
//   date: "2026-10-01T09:30:00.000Z"
//   link: https://www.facebook.com/…
//   show: true            ← editors untick this in Pages CMS to hide the post on the website
//   title: first line of the message, or "ფოტო / Photo · <date>" (for the CMS list only)
//   images: [/assets/facebook/<file>.jpg]   ← the first image only (the site shows one image per post)
//   ---
//   <message>
//
// Images are DOWNLOADED into src/assets/facebook/ because Facebook CDN URLs expire. Only the first image of a post is
// kept, scaled down to at most 1600 px (sharp, already installed for the image pipeline), so the repository —
// which keeps every committed file forever — grows by about 200–400 KB per post.
// Existing files are never rewritten, so an editor's "show: false" is never overwritten.
// data/facebook-sync.json records { lastChecked, lastOk, lastNewPost } after a successful run, and
// { failingSince, lastError } while the API fails (other keys there are preserved). scripts/ci/facebook-health.mjs
// reads it: when the import has failed for 7 days (e.g. an expired Page token) the workflow reports an error.
// Any API or network error is reported as a warning and the process exits 0: a Facebook outage
// or an expired token must never break the website build.
//
// Optional env: FB_APP_SECRET (adds appsecret_proof), FB_GRAPH_VERSION (default below).
// Needs only Node >= 24, js-yaml and sharp (both already dependencies of the site).
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseFrontMatter, stringifyFrontMatter } from "./lib/frontmatter.mjs";

// Graph API v26.0 was released on 2026-07-29 and is the current version (checked 2026-10-20:
// https://developers.facebook.com/docs/graph-api/changelog/versions). Versions are supported for
// at least two years; bump this when Meta announces the deprecation date for v26.0.
export const GRAPH_VERSION = "v26.0";
export const FIELDS = "id,message,created_time,permalink_url,full_picture,attachments{media,subattachments,type,url}";

const PAGE_LIMIT = 50;
const MAX_PAGES = { initial: 200, default: 10 };
const MAX_IMAGES_PER_POST = 1; // the website shows images[0] only; raise to 2–3 if a carousel is ever added
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_IMAGE_PX = 1600;
const INITIAL_POSTS = 24;
const OVERLAP_DAYS = 3;
const FIRST_RUN_DAYS = 30;
const TZ = "Asia/Tbilisi";

const IMAGE_TYPES = { "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };

class GraphError extends Error {}

function redact(text, secrets) {
  let out = String(text);
  for (const s of secrets) if (s && s.length > 4) out = out.split(s).join("***");
  return out.replace(/(access_token|appsecret_proof)=[^&\s"]+/g, "$1=***");
}

/** yyyy-mm-dd of a date in Georgian time (used in file names). */
function localDay(date) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" })
      .formatToParts(date)
      .map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day}`;
}

const safeId = (id) => String(id).replace(/[^A-Za-z0-9_-]/g, "-");

/** First non-empty line, trimmed to ~80 characters (CMS list label only); photo-only posts get a dated label. */
export function titleFrom(message = "", date = null) {
  const line = String(message).split(/\r?\n/).map((l) => l.trim()).find(Boolean) || "";
  if (!line) return date ? `ფოტო / Photo · ${localDay(date)}` : "ფოტო / Photo";
  const chars = [...line];
  return chars.length > 80 ? `${chars.slice(0, 79).join("").trimEnd()}…` : line;
}

/** All image URLs of a post, in order, de-duplicated. */
export function imageUrls(post) {
  const urls = [];
  const add = (u) => { if (u && /^https:\/\//.test(u) && !urls.includes(u)) urls.push(u); };
  for (const att of post.attachments?.data ?? []) {
    const subs = att.subattachments?.data ?? [];
    if (subs.length) subs.forEach((s) => add(s.media?.image?.src));
    else add(att.media?.image?.src);
  }
  if (!urls.length) add(post.full_picture);
  return urls.slice(0, MAX_IMAGES_PER_POST);
}

async function readExistingIds(contentDir) {
  const ids = new Set();
  let files = [];
  try {
    files = (await fs.readdir(contentDir)).filter((f) => f.endsWith(".md"));
  } catch {
    return ids;
  }
  for (const f of files) {
    try {
      const { data } = parseFrontMatter(await fs.readFile(path.join(contentDir, f), "utf8"));
      if (data.id !== undefined && data.id !== null) ids.add(String(data.id));
    } catch {
      // Unreadable front matter: fall back to the id in the file name so the post is not re-imported.
    }
    const m = f.match(/^\d{4}-\d{2}-\d{2}-(.+)\.md$/);
    if (m) ids.add(m[1]);
  }
  return ids;
}

async function readState(stateFile) {
  try {
    return JSON.parse(await fs.readFile(stateFile, "utf8"));
  } catch {
    return {};
  }
}

async function graphGet(url, { fetchImpl, secrets }) {
  let res;
  try {
    // The token travels as the documented access_token query parameter (Graph's paging.next URLs carry it too);
    // it is redacted from every message this script prints.
    res = await fetchImpl(url, { headers: { Accept: "application/json" } });
  } catch (err) {
    throw new GraphError(`network error: ${redact(err.message, secrets)}`);
  }
  let body;
  try {
    body = await res.json();
  } catch {
    throw new GraphError(`HTTP ${res.status}: response was not JSON`);
  }
  if (!res.ok || body?.error) {
    const e = body?.error ?? {};
    throw new GraphError(redact(`HTTP ${res.status}: ${e.type || "Error"} ${e.code ?? ""} ${e.message || ""}`.trim(), secrets));
  }
  return body;
}

async function downloadImage(url, file, fetchImpl) {
  const res = await fetchImpl(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const type = String(res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  const ext = IMAGE_TYPES[type];
  if (!ext) throw new Error(`not an image (${type || "no content-type"})`);
  let buf = Buffer.from(await res.arrayBuffer());
  if (!buf.length) throw new Error("empty file");
  if (buf.length > MAX_IMAGE_BYTES) throw new Error(`too large (${buf.length} bytes)`);
  buf = await shrink(buf, ext);
  const target = `${file}.${ext}`;
  await fs.writeFile(target, buf);
  return target;
}

/** At most MAX_IMAGE_PX on the longer side, re-encoded (JPEG q82 / WebP q80 / PNG). GIFs and any sharp error: unchanged. */
async function shrink(buf, ext) {
  if (ext === "gif") return buf;
  try {
    const { default: sharp } = await import("sharp");
    const img = sharp(buf).rotate().resize({ width: MAX_IMAGE_PX, height: MAX_IMAGE_PX, fit: "inside", withoutEnlargement: true });
    if (ext === "jpg") return await img.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    if (ext === "webp") return await img.webp({ quality: 80 }).toBuffer();
    return await img.png({ compressionLevel: 9 }).toBuffer();
  } catch {
    return buf;
  }
}

/**
 * Run one sync. Never throws for API/network problems: returns { ok: false, warnings }.
 * @param {object} o
 */
export async function syncFacebook(o = {}) {
  const root = o.rootDir ?? process.cwd();
  const contentDir = o.contentDir ?? path.join(root, "content/facebook");
  const assetsDir = o.assetsDir ?? path.join(root, "src/assets/facebook");
  const stateFile = o.stateFile ?? path.join(root, "data/facebook-sync.json");
  const publicPrefix = o.publicPrefix ?? "/assets/facebook/";
  const fetchImpl = o.fetch ?? globalThis.fetch;
  const now = o.now ?? new Date();
  const log = o.log ?? ((msg) => console.log(msg));
  const warn = o.warn ?? ((msg) => console.warn(process.env.GITHUB_ACTIONS ? `::warning title=Facebook sync::${msg}` : `warning: ${msg}`));
  const { pageId, token, appSecret } = o;
  const version = o.graphVersion || GRAPH_VERSION;
  const secrets = [token, appSecret];
  const warnings = [];
  const w = (msg) => { warnings.push(msg); warn(msg); };

  if (!pageId || !token) {
    w("FB_PAGE_ID or FB_PAGE_TOKEN is not set; skipping the Facebook import.");
    return { ok: false, skipped: true, newPosts: [], warnings };
  }
  if (!/^[A-Za-z0-9._-]+$/.test(pageId)) {
    w("FB_PAGE_ID contains unexpected characters; skipping the Facebook import.");
    return { ok: false, skipped: true, newPosts: [], warnings };
  }

  const state = await readState(stateFile);
  let since = null;
  if (o.initial) since = null;
  else if (o.since) {
    since = new Date(`${o.since}T00:00:00Z`);
    if (Number.isNaN(since.getTime())) {
      w(`--since=${o.since} is not a YYYY-MM-DD date; skipping the Facebook import.`);
      return { ok: false, newPosts: [], warnings };
    }
  } else if (state.lastChecked && !Number.isNaN(new Date(state.lastChecked).getTime())) {
    since = new Date(new Date(state.lastChecked).getTime() - OVERLAP_DAYS * 86400e3);
  } else {
    since = new Date(now.getTime() - FIRST_RUN_DAYS * 86400e3);
  }

  const params = new URLSearchParams({ fields: FIELDS, limit: String(PAGE_LIMIT), access_token: token });
  if (since) params.set("since", String(Math.floor(since.getTime() / 1000)));
  if (appSecret) params.set("appsecret_proof", crypto.createHmac("sha256", appSecret).update(token).digest("hex"));
  let url = `https://graph.facebook.com/${version}/${encodeURIComponent(pageId)}/posts?${params}`;

  const posts = [];
  try {
    const maxPages = o.initial ? MAX_PAGES.initial : MAX_PAGES.default;
    for (let page = 0; url && page < maxPages; page++) {
      const body = await graphGet(url, { fetchImpl, secrets });
      const batch = Array.isArray(body.data) ? body.data : [];
      posts.push(...batch);
      const oldest = batch.at(-1)?.created_time ? new Date(batch.at(-1).created_time) : null;
      if (!batch.length || (since && oldest && oldest < since)) break;
      if (o.initial && posts.length >= INITIAL_POSTS) break;
      url = body.paging?.next || null;
    }
  } catch (err) {
    w(`Facebook Graph API request failed (${err.message}). No posts imported; the site is built with the posts already in the repository.`);
    // Remember since when it fails (kept across runs), so a token that stays invalid is noticed (facebook-health.mjs).
    const failed = { ...state, failingSince: state.failingSince || now.toISOString(), lastError: String(err.message).slice(0, 300) };
    if (!o.dryRun) await fs.writeFile(stateFile, `${JSON.stringify(failed, null, 2)}\n`).catch(() => {});
    return { ok: false, newPosts: [], warnings };
  }

  await fs.mkdir(contentDir, { recursive: true });
  await fs.mkdir(assetsDir, { recursive: true });
  const existing = await readExistingIds(contentDir);
  const newPosts = [];

  // Oldest first, so file creation order follows publication order. --initial keeps the newest INITIAL_POSTS.
  let candidates = posts
    .filter((p) => p && p.id && p.created_time)
    .filter((p) => !since || new Date(p.created_time) >= since)
    .sort((a, b) => new Date(a.created_time) - new Date(b.created_time));
  if (o.initial) candidates = candidates.slice(-INITIAL_POSTS);

  for (const post of candidates) {
    const id = String(post.id);
    if (existing.has(id) || existing.has(safeId(id))) continue;
    const created = new Date(post.created_time);
    if (Number.isNaN(created.getTime())) continue;
    const base = `${localDay(created)}-${safeId(id)}`;
    const link = /^https:\/\//.test(post.permalink_url || "") ? post.permalink_url : `https://www.facebook.com/${encodeURIComponent(id)}`;

    const images = [];
    const urls = imageUrls(post);
    for (let i = 0; i < urls.length; i++) {
      const fileBase = path.join(assetsDir, `${base}-${i + 1}`);
      if (o.dryRun) break;
      try {
        const saved = await downloadImage(urls[i], fileBase, fetchImpl);
        images.push(`${publicPrefix}${path.basename(saved)}`);
      } catch (err) {
        w(`post ${id}: image ${i + 1} not downloaded (${redact(err.message, secrets)})`);
      }
    }

    const message = String(post.message ?? "").replace(/\r\n?/g, "\n").trim();
    const data = {
      id,
      date: created.toISOString(),
      link,
      show: true,
      title: titleFrom(message, created),
      images,
    };
    const file = path.join(contentDir, `${base}.md`);
    if (!o.dryRun) await fs.writeFile(file, stringifyFrontMatter(data, message), { flag: "wx" }).catch(async (err) => {
      if (err.code !== "EEXIST") throw err; // a file with this name exists already: keep it untouched
    });
    existing.add(id);
    newPosts.push({ id, file, date: data.date, images });
    log(`imported ${path.basename(file)} (${images.length} image${images.length === 1 ? "" : "s"})`);
  }

  const newest = newPosts.map((p) => p.date).sort().at(-1);
  const { failingSince, lastError, ...rest } = state;
  const nextState = {
    ...rest,
    lastChecked: now.toISOString(),
    lastOk: now.toISOString(),
    lastNewPost: newest && (!state.lastNewPost || newest > state.lastNewPost) ? newest : state.lastNewPost ?? null,
  };
  if (!o.dryRun) await fs.writeFile(stateFile, `${JSON.stringify(nextState, null, 2)}\n`);
  log(`Facebook sync: ${posts.length} post(s) checked, ${newPosts.length} new.`);
  return { ok: true, newPosts, warnings, checked: posts.length };
}

export function parseArgs(argv) {
  const out = { initial: false, since: null, dryRun: false };
  for (const a of argv) {
    if (a === "--initial") out.initial = true;
    else if (a === "--dry-run") out.dryRun = true;
    else if (a.startsWith("--since=")) out.since = a.slice(8).trim() || null;
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  try {
    const result = await syncFacebook({
      ...args,
      pageId: process.env.FB_PAGE_ID?.trim(),
      token: process.env.FB_PAGE_TOKEN?.trim(),
      appSecret: process.env.FB_APP_SECRET?.trim(),
      graphVersion: process.env.FB_GRAPH_VERSION?.trim(),
    });
    if (process.env.GITHUB_OUTPUT) {
      await fs.appendFile(process.env.GITHUB_OUTPUT, `new_posts=${result.newPosts.length}\nok=${result.ok}\n`);
    }
  } catch (err) {
    // Unexpected local error (e.g. disk): still never fail the build.
    console.warn(`warning: Facebook sync failed unexpectedly: ${redact(err.stack || err.message, [process.env.FB_PAGE_TOKEN, process.env.FB_APP_SECRET])}`);
  }
  process.exitCode = 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await main();
}
