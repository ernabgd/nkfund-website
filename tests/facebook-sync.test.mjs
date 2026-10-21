// node --test tests/   — runs scripts/facebook-sync.mjs against a mocked Graph API (no network).
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { syncFacebook, imageUrls, titleFrom, parseArgs, isAutomaticPost, GRAPH_VERSION } from "../scripts/facebook-sync.mjs";
import { parseFrontMatter, stringifyFrontMatter } from "../scripts/lib/frontmatter.mjs";
import { health } from "../scripts/ci/facebook-health.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const fixtures = path.join(here, "fixtures", "graph");
const TOKEN = "EAAB-secret-test-token-123";
const PAGE_ID = "100089583201087";
const NOW = new Date("2026-10-20T05:00:00Z");

const readJson = async (name) => JSON.parse(await fs.readFile(path.join(fixtures, name), "utf8"));

/** Minimal fetch double: Graph pages by URL, images from the fixture JPEG, one expired image. */
async function mockFetch({ graphError = false } = {}) {
  const page1 = await readJson("posts-page1.json");
  const page2 = await readJson("posts-page2.json");
  const err = await readJson("error-expired-token.json");
  const photo = await fs.readFile(path.join(fixtures, "photo.jpg"));
  const calls = [];
  const json = (status, body) => ({ ok: status < 400, status, json: async () => body, headers: new Headers({ "content-type": "application/json" }) });
  const fetch = async (url) => {
    calls.push(String(url));
    const u = new URL(url);
    if (u.hostname === "graph.facebook.com") {
      if (graphError) return json(400, err);
      return u.searchParams.get("page") === "2" ? json(200, page2) : json(200, page1);
    }
    if (u.pathname.endsWith("expired.jpg")) return { ok: false, status: 403, headers: new Headers(), arrayBuffer: async () => new ArrayBuffer(0) };
    return { ok: true, status: 200, headers: new Headers({ "content-type": "image/jpeg" }), arrayBuffer: async () => photo.buffer.slice(photo.byteOffset, photo.byteOffset + photo.length) };
  };
  return { fetch, calls };
}

async function tempRepo() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "nkfund-fb-"));
  await fs.mkdir(path.join(root, "content/facebook"), { recursive: true });
  await fs.mkdir(path.join(root, "src/assets/facebook"), { recursive: true });
  await fs.mkdir(path.join(root, "data"), { recursive: true });
  // A post imported earlier and hidden by an editor: must stay byte-for-byte unchanged.
  const hidden = stringifyFrontMatter(
    { id: `${PAGE_ID}_900000000000002`, date: "2026-09-10T08:00:00.000Z", link: "https://www.facebook.com/x", show: false, title: "edited", images: [] },
    "Already imported and hidden by an editor.",
  );
  await fs.writeFile(path.join(root, "content/facebook/2026-09-10-100089583201087_900000000000002.md"), hidden);
  await fs.writeFile(path.join(root, "data/facebook-sync.json"), JSON.stringify({ lastChecked: null, lastNewPost: null, lastCommitted: "2026-10-01T05:00:00.000Z" }));
  return { root, hidden };
}

const quiet = { log: () => {}, warn: () => {} };

test("imports new posts across pages, downloads images, keeps editor choices", async () => {
  const { root, hidden } = await tempRepo();
  const { fetch, calls } = await mockFetch();
  const result = await syncFacebook({ rootDir: root, pageId: PAGE_ID, token: TOKEN, initial: true, fetch, now: NOW, ...quiet });

  assert.equal(result.ok, true);
  assert.equal(result.newPosts.length, 3, "three new posts (one already existed)");

  // First request: pinned Graph version, requested fields, no `since` for --initial, token as parameter.
  const first = new URL(calls[0]);
  assert.equal(first.pathname, `/${GRAPH_VERSION}/${PAGE_ID}/posts`);
  assert.match(first.searchParams.get("fields"), /attachments\{media,subattachments,type,url\}/);
  assert.equal(first.searchParams.get("since"), null);
  assert.ok(calls.some((c) => c.includes("page=2")), "follows paging.next");

  const files = (await fs.readdir(path.join(root, "content/facebook"))).sort();
  assert.deepEqual(files, [
    "2026-08-20-100089583201087_900000000000000.md",
    "2026-09-02-100089583201087_900000000000001.md", // 20:30 UTC = 00:30 next day in Tbilisi
    "2026-09-10-100089583201087_900000000000002.md",
    "2026-09-15-100089583201087_900000000000003.md",
  ]);

  // The hidden post was not touched.
  const hiddenNow = await fs.readFile(path.join(root, "content/facebook/2026-09-10-100089583201087_900000000000002.md"), "utf8");
  assert.equal(hiddenNow, hidden);

  // Album post: only the first photo is kept (the site shows one), show defaults to true, body = message.
  const album = parseFrontMatter(await fs.readFile(path.join(root, "content/facebook/2026-09-15-100089583201087_900000000000003.md"), "utf8"));
  assert.equal(album.data.id, `${PAGE_ID}_900000000000003`);
  assert.equal(album.data.show, true);
  assert.equal(album.data.date, "2026-09-15T08:00:00.000Z");
  assert.equal(album.data.link, "https://www.facebook.com/100089583201087/posts/900000000000003");
  assert.deepEqual(album.data.images, ["/assets/facebook/2026-09-15-100089583201087_900000000000003-1.jpg"]);
  assert.ok(!(await fs.readdir(path.join(root, "src/assets/facebook"))).some((f) => f.endsWith("-2.jpg")), "second album photo not downloaded");
  assert.equal(album.body.trim(), "ნიკო კვარაცხელიას ფონდი გილოცავთ ახალ სასწავლო წელს!\n\nდეტალები: https://nkfund.world/news/");
  assert.equal(album.data.title, "ნიკო კვარაცხელიას ფონდი გილოცავთ ახალ სასწავლო წელს!");
  const img = await fs.stat(path.join(root, "src/assets/facebook/2026-09-15-100089583201087_900000000000003-1.jpg"));
  assert.ok(img.size > 0);

  // Failed image download: post kept, image skipped, warning reported (without the token).
  const broken = parseFrontMatter(await fs.readFile(path.join(root, "content/facebook/2026-09-02-100089583201087_900000000000001.md"), "utf8"));
  assert.deepEqual(broken.data.images, []);
  assert.ok(result.warnings.some((w) => w.includes("900000000000001") && w.includes("HTTP 403")));
  assert.ok(result.warnings.every((w) => !w.includes(TOKEN)));

  // Post without a message: full_picture used, empty body, a dated label for the CMS list.
  const shared = parseFrontMatter(await fs.readFile(path.join(root, "content/facebook/2026-08-20-100089583201087_900000000000000.md"), "utf8"));
  assert.equal(shared.data.images.length, 1);
  assert.equal(shared.body.trim(), "");
  assert.equal(shared.data.title, "ფოტო / Photo · 2026-08-20");

  // State: lastChecked = now, lastNewPost = newest imported, other keys preserved.
  const state = JSON.parse(await fs.readFile(path.join(root, "data/facebook-sync.json"), "utf8"));
  assert.equal(state.lastChecked, NOW.toISOString());
  assert.equal(state.lastNewPost, "2026-09-15T08:00:00.000Z");
  assert.equal(state.lastCommitted, "2026-10-01T05:00:00.000Z");

  // Second run: nothing new, nothing rewritten.
  const again = await syncFacebook({ rootDir: root, pageId: PAGE_ID, token: TOKEN, initial: true, fetch, now: NOW, ...quiet });
  assert.equal(again.ok, true);
  assert.equal(again.newPosts.length, 0);
});

test("--since sends a unix timestamp and ignores older posts", async () => {
  const { root } = await tempRepo();
  const { fetch, calls } = await mockFetch();
  const result = await syncFacebook({ rootDir: root, pageId: PAGE_ID, token: TOKEN, since: "2026-09-12", fetch, now: NOW, ...quiet });
  assert.equal(result.ok, true);
  assert.equal(new URL(calls[0]).searchParams.get("since"), String(Date.UTC(2026, 8, 12) / 1000));
  assert.deepEqual(result.newPosts.map((p) => p.id), [`${PAGE_ID}_900000000000003`]);
  assert.ok(!calls.some((c) => c.includes("page=2")), "stops paging once posts are older than --since");
});

test("daily mode continues from lastChecked minus 3 days", async () => {
  const { root } = await tempRepo();
  await fs.writeFile(path.join(root, "data/facebook-sync.json"), JSON.stringify({ lastChecked: "2026-09-16T05:00:00.000Z" }));
  const { fetch, calls } = await mockFetch();
  await syncFacebook({ rootDir: root, pageId: PAGE_ID, token: TOKEN, fetch, now: NOW, ...quiet });
  assert.equal(new URL(calls[0]).searchParams.get("since"), String(Date.UTC(2026, 8, 13, 5) / 1000));
});

test("API errors never throw: warning, no files, the failure is recorded (and cleared by the next good run)", async () => {
  const { root } = await tempRepo();
  const stateFile = path.join(root, "data/facebook-sync.json");
  const { fetch } = await mockFetch({ graphError: true });
  const result = await syncFacebook({ rootDir: root, pageId: PAGE_ID, token: TOKEN, initial: true, fetch, now: NOW, ...quiet });
  assert.equal(result.ok, false);
  assert.match(result.warnings[0], /OAuthException 190 Error validating access token/);
  assert.ok(!result.warnings[0].includes(TOKEN));
  assert.equal((await fs.readdir(path.join(root, "content/facebook"))).length, 1);
  const failed = JSON.parse(await fs.readFile(stateFile, "utf8"));
  assert.equal(failed.failingSince, NOW.toISOString());
  assert.match(failed.lastError, /OAuthException/);
  assert.ok(!JSON.stringify(failed).includes(TOKEN));
  assert.equal(failed.lastCommitted, "2026-10-01T05:00:00.000Z", "other keys preserved");
  assert.equal(failed.lastChecked, null, "lastChecked only moves on success");

  // A week later it still fails: failingSince keeps the first failure, and the health check reports it.
  const later = new Date(NOW.getTime() + 7 * 86400e3);
  await syncFacebook({ rootDir: root, pageId: PAGE_ID, token: TOKEN, fetch, now: later, ...quiet });
  const still = JSON.parse(await fs.readFile(stateFile, "utf8"));
  assert.equal(still.failingSince, NOW.toISOString());
  assert.deepEqual(health(still, later), { stale: true, failingSince: NOW.toISOString(), days: 7, lastError: still.lastError });
  assert.equal(health(still, new Date(NOW.getTime() + 6 * 86400e3)).stale, false);

  // The token is renewed: the next good run clears the failure and records lastOk.
  const good = await mockFetch();
  await syncFacebook({ rootDir: root, pageId: PAGE_ID, token: TOKEN, initial: true, fetch: good.fetch, now: later, ...quiet });
  const fixed = JSON.parse(await fs.readFile(stateFile, "utf8"));
  assert.equal(fixed.failingSince, undefined);
  assert.equal(fixed.lastError, undefined);
  assert.equal(fixed.lastOk, later.toISOString());
  assert.equal(health(fixed, later).stale, false);
});

test("network failure is a warning too", async () => {
  const { root } = await tempRepo();
  const fetch = async () => { throw new Error(`getaddrinfo ENOTFOUND graph.facebook.com access_token=${TOKEN}`); };
  const result = await syncFacebook({ rootDir: root, pageId: PAGE_ID, token: TOKEN, fetch, now: NOW, ...quiet });
  assert.equal(result.ok, false);
  assert.ok(!result.warnings.join(" ").includes(TOKEN));
});

test("CLI exits 0 with a warning when the secrets are missing", () => {
  const script = path.join(here, "..", "scripts", "facebook-sync.mjs");
  const env = { ...process.env, FB_PAGE_ID: "", FB_PAGE_TOKEN: "", GITHUB_ACTIONS: "", GITHUB_OUTPUT: "" };
  const run = spawnSync(process.execPath, [script, "--initial"], { env, encoding: "utf8", cwd: os.tmpdir() });
  assert.equal(run.status, 0);
  assert.match(run.stderr, /FB_PAGE_ID or FB_PAGE_TOKEN is not set/);
});

test("helpers", () => {
  assert.deepEqual(parseArgs(["--initial", "--since=2026-01-02", "--dry-run"]), { initial: true, since: "2026-01-02", dryRun: true });
  assert.equal(titleFrom("\n  first line  \nsecond"), "first line");
  assert.equal(titleFrom("", new Date("2026-09-01T20:30:00Z")), "ფოტო / Photo · 2026-09-02");
  assert.equal([...titleFrom("ა".repeat(200))].length, 80);
  assert.deepEqual(imageUrls({ full_picture: "https://x/y.jpg" }), ["https://x/y.jpg"]);
  assert.equal(imageUrls({ attachments: { data: [{ subattachments: { data: [1, 2, 3].map((n) => ({ media: { image: { src: `https://x/${n}.jpg` } } })) } }] } }).length, 1, "first image only");
  assert.deepEqual(imageUrls({ attachments: { data: [{ media: { image: { src: "http://insecure" } } }] } }), []);
});

test("Facebook's automatic posts start hidden, real posts start visible", () => {
  assert.equal(isAutomaticPost("With Iza Omadze – I just got recognized as one of their top fans! 🎉"), true);
  assert.equal(isAutomaticPost("Nico Kvaratskhelia Fund updated their cover photo."), true);
  assert.equal(isAutomaticPost("ნიკო კვარაცხელიას სახელობის ფონდი ნიკოლოზობას გილოცავთ"), false);
  assert.equal(isAutomaticPost(""), false, "photo-only posts stay visible");
});
