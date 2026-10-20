// Migration snapshot (npm run test:migration): the content as migrated from Wix and reviewed in October 2026.
// NOT run by the deploy workflow — editors may legitimately change any of this in Pages CMS (add a project, edit a
// title, update the bank details). Run it by hand after a migration script or a bulk edit; update the expected values
// when the foundation has approved a change.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadItems, loadPages } from "../../scripts/lib/content.mjs";
import { loadYaml } from "../../scripts/lib/frontmatter.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const at = (p) => path.join(root, p);

test("projects are listed newest first by the date their card shows (OWNER_REVIEW #17)", () => {
  const slugs = loadItems(at("content/projects"), "project").map((p) => p.slug);
  assert.deepEqual(slugs, ["cooperation-with-supergmiri", "batumi-tragedy-scholarship", "terenti-graneli-scholarship", "jgali-school-it-lab"]);
  const news = loadItems(at("content/news"), "news").map((p) => p.slug);
  assert.deepEqual(news, ["mothers-day-event-2023", "memorandum-with-energia"]);
});

test("owner defaults: Graneli quote moved, title shortened, mission published", () => {
  const projects = Object.fromEntries(loadItems(at("content/projects"), "project").map((p) => [p.slug, p]));
  assert.equal(projects["terenti-graneli-scholarship"].title_ka, "ტერენტი გრანელის სახელობის სტიპენდია");
  assert.match(projects["terenti-graneli-scholarship"].body_ka, /თეა ქარჩავა/);
  assert.equal(projects["batumi-tragedy-scholarship"].body_ka ?? "", "");
  const pages = loadPages(at("content/pages"));
  assert.ok(pages.home.mission.body_ka.startsWith("ფონდის მისია"));
  assert.ok(!/ონლაინ გადარიცხვის ფორმას/.test(pages.donate.intro_ka), "donate intro must not mention the closed online form");
});

test("no Mtavruli capitals at sentence starts (see docs/archive/wix-2026-10/CONTENT_CHANGES.md)", () => {
  for (const [dir, type] of [["content/projects", "project"], ["content/news", "news"]]) {
    for (const item of loadItems(at(dir), type)) assert.ok(!/[Ა-Ჿ]/.test(JSON.stringify(item)), `${item.slug}: Mtavruli character in content`);
  }
});

test("bank details are exactly as printed in the bank's PDF (pages 1–3)", () => {
  const bank = loadYaml(fs.readFileSync(at("data/bank.yml"), "utf8"));
  assert.equal(bank.iban, "GE93BG0000000533757447");
  assert.equal(bank.beneficiary_ka, "ააიპ ნიკო კვარაცხელიას სახელობის ფონდი");
  assert.equal(bank.beneficiary_en, "NNLE NIKO KVARATSKHELIAS SAKHELOBIS PHONDI");
  assert.equal(bank.bank_name_ka, 'სს "საქართველოს ბანკი"', "page 1 prints straight quotes");
  assert.equal(bank.account_with_institution, "Bank of Georgia", "pages 2–3, Account With Institution");
  assert.equal(bank.bank_swift, "BAGAGE22");
  assert.equal(bank.bank_address_ka, "გაგარინის ქ. 29ა, თბილისი, 0160, საქართველო");
  assert.equal(bank.bank_address_en, "29a Gagarin street, Tbilisi 0160, Georgia");
  assert.deepEqual(
    bank.currencies.map((c) => [c.code, c.intermediary_bank || "", c.intermediary_swift || ""]),
    [["GEL", "", ""], ["USD", "Citibank N.A., New York, USA", "CITIUS33"], ["EUR", "Commerzbank, Frankfurt, Germany", "COBADEFF"]],
  );
});
