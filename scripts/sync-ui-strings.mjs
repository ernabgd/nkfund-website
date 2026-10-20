#!/usr/bin/env node
// Copies the reviewed interface strings from the translation file (source/content-en/ui.yml, ka + en; archived in docs/archive/wix-2026-10/content-en/ui.yml)
// into data/ui.yml, using the key map below. Keys that are not mapped keep their current value, so
// edits made in Pages CMS to unmapped strings survive. One-time / on-demand developer tool.
//
//   node scripts/sync-ui-strings.mjs <path to source/content-en/ui.yml> [--dry-run]
import fs from "node:fs";
import { loadYaml, dumpYaml } from "./lib/frontmatter.mjs";

const src = process.argv[2];
if (!src) {
  console.error("usage: node scripts/sync-ui-strings.mjs <content-en/ui.yml> [--dry-run]");
  process.exit(1);
}
const tr = loadYaml(fs.readFileSync(src, "utf8"));
const FILE = "data/ui.yml";
const ui = loadYaml(fs.readFileSync(FILE, "utf8"));

const get = (path) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), tr);
const pair = (path) => {
  const v = get(path);
  return v && typeof v.ka === "string" && typeof v.en === "string" ? { ka: v.ka, en: v.en } : null;
};

// data/ui.yml key  ←  content-en/ui.yml key
const MAP = {
  "nav.home": "nav.home",
  "nav.about": "nav.about",
  "nav.projects": "nav.projects",
  "nav.news": "nav.news",
  "nav.contact": "nav.contact",
  "nav.privacy": "nav.privacy",
  "nav.donate": "nav.join",
  "nav.menu": "a11y.menu",
  "nav.close": "a11y.menu_close",
  "nav.main_label": "a11y.main_nav",
  "nav.skip": "a11y.skip_link",
  "nav.home_link": "a11y.home_link",
  "nav.language": "lang_switch.label",
  "buttons.details": "buttons.details",
  "buttons.all_projects": "buttons.all_projects",
  "buttons.all_news": "buttons.all_news",
  "buttons.previous": "buttons.previous",
  "buttons.next": "buttons.next",
  "buttons.bank_details": "buttons.bank_details",
  "buttons.download_pdf": "buttons.download_pdf",
  "buttons.pause_background": "home.video_pause",
  "buttons.play_background": "home.video_play",
  "labels.date": "item.date",
  "labels.event_date": "item.event_date",
  "labels.published": "item.published",
  "labels.category": "item.category",
  "labels.photo": "cms.fields.image",
  "labels.gallery": "item.gallery",
  "labels.film": "home.film_title",
  "labels.draft": "misc.draft",
  "categories.scholarship": "categories.scholarship",
  "categories.technology": "categories.technology",
  "join.heading": "cta_block.heading",
  "join.text": "cta_block.text",
  "join.button": "buttons.bank_details",
  "donate.bank_heading": "donate.section_heading",
  "donate.currency_GEL": "donate.currencies.GEL.tab",
  "donate.currency_USD": "donate.currencies.USD.tab",
  "donate.currency_EUR": "donate.currencies.EUR.tab",
  "donate.beneficiary": "donate.fields.beneficiary",
  "donate.iban": "donate.fields.iban",
  "donate.bank": "donate.fields.beneficiary_bank",
  "donate.swift": "donate.fields.swift",
  "donate.bank_address": "donate.fields.bank_address",
  "donate.intermediary": "donate.fields.intermediary_bank",
  "donate.intermediary_swift": "donate.fields.intermediary_swift",
  "donate.purpose": "donate.fields.purpose",
  "donate.same_account": "donate.same_account_note",
  "donate.copy": "copy.button",
  "donate.copied": "copy.copied",
  "donate.copy_failed": "copy.failed",
  "donate.pdf_note": "donate.pdf_label",
  "facebook.heading": "facebook.heading",
  "facebook.view": "facebook.view_post",
  "facebook.follow_heading": "facebook.follow_card.heading",
  "facebook.follow_text": "facebook.follow_card.text",
  "contact.email": "contact.email_label",
  "contact.social": "a11y.social_nav",
  "not_found.title": "not_found.title",
  "not_found.text": "not_found.text",
  "not_found.home": "not_found.home",
};

let changed = 0;
const missing = [];
for (const [to, from] of Object.entries(MAP)) {
  const value = pair(from);
  if (!value) { missing.push(from); continue; }
  const [group, key] = to.split(".");
  ui[group] ??= {};
  const cur = ui[group][key] || {};
  if (cur.ka !== value.ka || cur.en !== value.en) changed++;
  ui[group][key] = value;
}

// Language switch: the link is written in the target language.
const toEn = get("lang_switch.to_en");
const toKa = get("lang_switch.to_ka");
if (toEn?.text && toKa?.text) {
  ui.nav.switch_to = { ka: toEn.text, en: toKa.text };
  ui.nav.switch_to_label = { ka: toEn.aria, en: toKa.aria };
}
// "3 min 22 s, with English subtitles"
const len = pair("home.film_length");
const subs = pair("home.film_subtitles");
if (len && subs) ui.labels.film_note = { ka: `${len.ka}, ${subs.ka.charAt(0).toLowerCase()}${subs.ka.slice(1)}`, en: `${len.en}, ${subs.en.charAt(0).toLowerCase()}${subs.en.slice(1)}` };

// No header comment: Pages CMS rewrites data/ui.yml on every save and would drop it (editing notes live in
// docs/EDITING.md and in the field descriptions of .pages.yml).
const header = "";
if (missing.length) console.warn(`not found in ${src}: ${missing.join(", ")}`);
if (process.argv.includes("--dry-run")) {
  console.log(`${changed} string(s) would change`);
} else {
  fs.writeFileSync(FILE, header + dumpYaml(ui));
  console.log(`${FILE}: ${changed} string(s) updated from the translation file`);
}
