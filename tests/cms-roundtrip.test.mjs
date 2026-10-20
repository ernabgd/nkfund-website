// Regression test: an editor saving files in Pages CMS must never break CI.
// Pages CMS 2.x deletes every empty value ("", null, [], {}) when it saves a file. This copies content/, data/ and
// .pages.yml to a temporary folder, "saves" every CMS-managed file the way Pages CMS does, adds a minimal new news
// item (only the required fields), and runs the same content loaders and checks as `npm run test:ci`.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ALL_CHECKS, stripEmpty, cmsConfig, allEntries } from "./lib/checks.mjs";
import { loadItems, loadPages } from "../scripts/lib/content.mjs";
import { loadYaml, dumpYaml, parseFrontMatter, stringifyFrontMatter } from "../scripts/lib/frontmatter.mjs";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function copyRepoContent() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "nkfund-cms-"));
  for (const p of ["content", "data", ".pages.yml"]) fs.cpSync(path.join(repo, p), path.join(tmp, p), { recursive: true });
  return tmp;
}

/** Save every file of every Pages CMS file entry and collection the way Pages CMS does. */
function saveEverythingLikePagesCms(root) {
  const config = cmsConfig({ root });
  let saved = 0;
  for (const entry of allEntries(config.content)) {
    if (entry.type === "file") {
      const file = path.join(root, entry.path);
      fs.writeFileSync(file, dumpYaml(stripEmpty(loadYaml(fs.readFileSync(file, "utf8")) ?? {})));
      saved++;
    } else if (entry.type === "collection") {
      const dir = path.join(root, entry.path);
      for (const f of fs.existsSync(dir) ? fs.readdirSync(dir).filter((x) => x.endsWith(".md")) : []) {
        const file = path.join(dir, f);
        const { data, body } = parseFrontMatter(fs.readFileSync(file, "utf8"));
        fs.writeFileSync(file, stringifyFrontMatter(stripEmpty(data), body));
        saved++;
      }
    }
  }
  return saved;
}

test("Pages CMS saves (empty values deleted) + a minimal new news item keep test:ci green", () => {
  const root = copyRepoContent();
  const saved = saveEverythingLikePagesCms(root);
  assert.ok(saved >= 15, `only ${saved} files saved`);
  // Proof that the simulation really removed keys the content had (e.g. the empty Georgian transcript).
  assert.equal("transcript_ka" in (loadYaml(fs.readFileSync(path.join(root, "content/pages/home.yml"), "utf8")).goal || {}), false);

  // A new news item with only the fields Pages CMS requires (everything optional left empty → not saved at all).
  fs.writeFileSync(
    path.join(root, "content/news/new-item.md"),
    stringifyFrontMatter({ title_ka: "ახალი სიახლე", slug: "new-item", date: "2026-10-20", summary_ka: "მოკლე აღწერა." }),
  );

  const dirs = { root, code: repo };
  for (const [name, check] of Object.entries(ALL_CHECKS)) {
    assert.doesNotThrow(() => check(dirs), (err) => { throw new Error(`${name}: ${err.message}`); });
  }
  // The loaders the build uses still work and see the new item.
  assert.ok(loadItems(path.join(root, "content/news"), "news").some((i) => i.slug === "new-item"));
  assert.ok(loadItems(path.join(root, "content/projects"), "project").length > 0);
  assert.ok(loadPages(path.join(root, "content/pages")).home);
  fs.rmSync(root, { recursive: true, force: true });
});

test("stripEmpty mirrors Pages CMS: '', null, [] and {} go, recursively", () => {
  assert.deepEqual(
    stripEmpty({ a: "", b: null, c: [], d: {}, e: "x", f: { g: "", h: [{ i: "" }, { j: 1 }] }, k: false, l: 0 }),
    { e: "x", f: { h: [{ j: 1 }] }, k: false, l: 0 },
  );
});
