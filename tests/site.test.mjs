// CI tests (npm run test:ci): code, schema and helper checks, no build needed. They must pass after any edit made in
// Pages CMS, so they never pin the current wording, order or values (those snapshots are in tests/migration/).
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { loadItems, loadFacebookPosts, visibleFacebookPosts, parseCsv, buildRedirects, sortTime } from "../scripts/lib/content.mjs";
import * as f from "../scripts/lib/filters.mjs";
import { checkItems, checkPages, checkUiStrings, checkBank } from "./lib/checks.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const at = (p) => path.join(root, p);
const dirs = { root, code: root };

test("content items load: required fields, existing images, unique slugs", () => checkItems(dirs));
test("all page files exist", () => { checkPages(dirs); });
test("every UI string is a { ka, en } pair with Georgian text (a missing key counts as empty)", () => checkUiStrings(dirs));
test("bank details: a valid IBAN (format + mod-97), known currencies, the PDF exists", () => checkBank(dirs));

test("items are listed by the date their card shows (event date when known), newest first", () => {
  const items = loadItems(at("content/projects"), "project").concat(loadItems(at("content/news"), "news"));
  for (const list of [items.filter((i) => i.type === "project"), items.filter((i) => i.type === "news")]) {
    for (let i = 1; i < list.length; i++) assert.ok(sortTime(list[i - 1]) >= sortTime(list[i]), `${list[i - 1].slug} before ${list[i].slug}`);
  }
  const a = { event_date: "2022-10", date: new Date("2022-12-18T00:00:00Z") };
  const b = { event_date: "", date: new Date("2022-12-18T00:00:00Z") };
  assert.ok(sortTime(b) > sortTime(a), "publication date 18 Dec 2022 is newer than an event in October 2022");
});

test(".pages.yml is generated from the current schema", () => {
  const run = spawnSync(process.execPath, ["scripts/generate-pages-yml.mjs", "--check"], { cwd: root, encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
});

test("redirects: raw and percent-encoded Georgian rows collapse to one UTF-8 path", () => {
  const rows = parseCsv(fs.readFileSync(at("data/redirects.csv"), "utf8"));
  const { stubs, files } = buildRedirects(rows, new Set(["/", "/about/", "/projects/", "/news/", "/donate/", "/contact/", "/privacy/"]));
  const froms = stubs.map((s) => s.from);
  assert.equal(new Set(froms).size, froms.length);
  assert.ok(froms.includes("/projects/თანამშრომლობა-პლატფორა-სუგერგმირთან"));
  assert.ok(!froms.some((p) => p.includes("%")), "paths are decoded");
  assert.ok(!froms.includes("/about"), "same-page rows are left to GitHub Pages");
  assert.deepEqual(files.map((x) => x.from), ["/_files/ugd/3f8517_b79d39693f294d9d862ff0cfbb0b4d8e.pdf"]);
  for (const s of stubs) assert.match(s.to, /^\/[a-z0-9/-]*$/);
  // Each old path becomes a directory: every segment must fit the 255-byte file-name limit of Linux CI runners
  // (with index.html it is a directory name, so the segment itself is what counts).
  for (const s of stubs) {
    for (const seg of s.from.split("/")) assert.ok(Buffer.byteLength(seg) <= 255, `${s.from}: segment of ${Buffer.byteLength(seg)} bytes`);
  }
});

test("filters", () => {
  const item = { title_ka: "სათაური", title_en: "" };
  assert.equal(f.loc(item, "title", "en"), "სათაური");
  assert.equal(f.isFallback(item, "title", "en"), true);
  assert.equal(f.isFallback(item, "title", "ka"), false);
  assert.equal(f.t({ ka: "კი", en: "" }, "en"), "კი");
  assert.equal(f.langUrl("about/", "en"), "/en/about/");
  assert.equal(f.langUrl("", "ka"), "/");
  const env = { pathPrefix: "/nkfund-website/", siteUrl: "https://ernabgd.github.io" };
  assert.equal(f.absUrl("/en/", env), "https://ernabgd.github.io/nkfund-website/en/");
  assert.equal(f.prefixUrl("/sitemap.xml", env), "/nkfund-website/sitemap.xml");
  assert.equal(f.formatDate("2022-12-18", "ka"), "18 დეკემბერი, 2022");
  assert.equal(f.formatDate("2022-12-18", "en"), "18 December 2022");
  assert.equal(f.formatDate("2026-09-01T20:30:00Z", "en"), "2 September 2026", "Tbilisi time");
  assert.equal(f.formatEventDate("2022-09", "ka"), "2022 წლის სექტემბერი");
  assert.equal(f.formatEventDate("2022-09", "en"), "September 2022");
  assert.equal(f.formatEventDate("2023-03-02", "ka"), "2 მარტი, 2023");
  assert.equal(f.monthName("2022-12", "ka"), "დეკემბერი");
  assert.equal(f.monthName("2022", "en"), "");
  assert.equal(f.hasShy("ზოგადსაგანმანათლებლო სკოლა"), true);
  assert.equal(f.hasShy("ტერენტი გრანელის სტიპენდია"), false);
  assert.equal(f.groupIban("GE93BG0000000533757447"), "GE93 BG00 0000 0533 7574 47");
  assert.equal(f.fbText('<b>hi</b>\n\nsee https://nkfund.world/.'), '<p>&lt;b&gt;hi&lt;/b&gt;</p>\n<p>see <a href="https://nkfund.world/" rel="noopener">https://nkfund.world/</a>.</p>');
  assert.equal(f.guessLang("ნიკო კვარაცხელიას ფონდი"), "ka");
  assert.equal(f.guessLang("Hello from the foundation"), "en");
  assert.ok(f.jsonLd({ a: "</script>" }).includes("\\u003c/script>"));
  // soft hyphens in long Georgian words (headings), nothing else changes
  const shy = f.shy("სოფელ ჯგალის ზოგადსაგანმანათლებლო საჯარო სკოლაში");
  assert.equal(shy.replace(/\u00AD/g, ""), "სოფელ ჯგალის ზოგადსაგანმანათლებლო საჯარო სკოლაში");
  assert.equal(shy.replace(/\u00AD/g, "|"), "სოფელ ჯგალის ზოგად|სა|გან|მა|ნათ|ლებლო საჯარო სკოლაში");
  assert.equal(f.shy("Niko Kvaratskhelia Foundation"), "Niko Kvaratskhelia Foundation");
  assert.equal(f.shyHtml("A & ზოგადსაგანმანათლებლო <b>").replace(/\u00AD/g, ""), 'A &amp; <span class="hy">ზოგადსაგანმანათლებლო</span> &lt;b&gt;');
  // plain(): only Markdown syntax goes, hyphens/underscores inside words stay (titles, meta descriptions)
  assert.equal(f.plain("Facebook-ზე ქუქი-ფაილების snake_case 2022-2023 IT-ლაბორატორია"), "Facebook-ზე ქუქი-ფაილების snake_case 2022-2023 IT-ლაბორატორია");
  assert.equal(f.plain("# Title\n\n> quote with **bold**, *em* and `code`\n- item"), "Title quote with bold, em and code item");
  assert.equal(f.formatBytes(1468006, "ka"), "1,4 MB");
  assert.equal(f.formatBytes(1468006, "en"), "1.4 MB");
  assert.equal(f.scaleSizes("(min-width: 760px) 30vw, 100vw", { width: 2400, height: 1158 }, 16 / 10), "(min-width: 760px) 39vw, 130vw");
  assert.equal(f.scaleSizes("88px", { width: 900, height: 1200 }, 4 / 3), "88px", "portrait in a landscape box: no scaling");
  assert.equal(f.fill("{label} — კოპირება", { label: "IBAN" }), "IBAN — კოპირება");
  assert.equal(f.year("2022-01"), 2022);
  assert.equal(f.dayOf("2023-03-19"), 19);
  assert.equal(f.dayOf("2022-09"), "");
  assert.equal(f.monthYear("2023-03-19", "ka"), "მარტი, 2023");
  assert.equal(f.monthYear("2022-09", "en"), "September 2022");
  assert.equal(f.firstParagraph("a\n\nb\n\nc"), "a");
  assert.equal(f.restParagraphs("a\n\nb\n\nc"), "b\n\nc");
});

test("Facebook: only ticked posts with content are shown; demo posts never in content/", () => {
  const demo = visibleFacebookPosts(loadFacebookPosts(at("tests/fixtures/facebook-demo")));
  assert.ok(demo.length >= 1);
  assert.ok(demo.every((p) => p.show));
  assert.ok(!demo.some((p) => p.id === "demo_hidden"));
  const real = loadFacebookPosts(at("content/facebook"));
  assert.ok(!real.some((p) => String(p.id).startsWith("demo")), "demo posts must not be committed to content/facebook");
});
