#!/usr/bin/env node
// One-time migration of the extracted Wix content (nkfund-site/source/) into this repository's
// bilingual schema. Kept for reproducibility; day-to-day editing happens in Pages CMS.
//
//   node scripts/migrate-content.mjs <path to source/> [--force]
//
// Georgian text is copied programmatically (never retyped) so it stays exactly as in source/content/,
// which already contains the spelling fixes listed in source/CONTENT_CHANGES.md.
// English comes from source/content-en/ (same structure as source/content/) when present;
// missing English stays empty and the site falls back to Georgian with an "(in Georgian)" label.
// Owner-approved defaults applied here are listed in docs/OWNER_REVIEW.md.
import fs from "node:fs";
import path from "node:path";
import { parseFrontMatter, stringifyFrontMatter, dumpYaml, loadYaml } from "./lib/frontmatter.mjs";

const SRC = process.argv[2];
const FORCE = process.argv.includes("--force");
if (!SRC) {
  console.error("usage: node scripts/migrate-content.mjs <source dir> [--force]");
  process.exit(1);
}

const DIRS = { ka: path.join(SRC, "content"), en: path.join(SRC, "content-en") };

function source(lang, rel) {
  const file = path.join(DIRS[lang], rel);
  if (!fs.existsSync(file)) return null;
  return parseFrontMatter(fs.readFileSync(file, "utf8"));
}

function write(file, text) {
  if (fs.existsSync(file) && !FORCE) {
    console.log(`skip  ${file} (exists; use --force)`);
    return;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  console.log(`write ${file}`);
}

/** Body text after the first "# " heading, without HTML comments; trims surrounding blank lines. */
function bodyAfterH1(body = "") {
  const lines = body.split("\n");
  const h1 = lines.findIndex((l) => l.startsWith("# "));
  return lines
    .slice(h1 + 1)
    .join("\n")
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim();
}

/** Split a Markdown body into sections keyed by "<!-- section: key … -->" markers. */
function sections(body = "") {
  const out = {};
  const marks = [...body.matchAll(/<!-- section: ([\w-]+)[^>]*-->/g)];
  marks.forEach((m, i) => {
    const start = m.index + m[0].length;
    const end = i + 1 < marks.length ? marks[i + 1].index : body.length;
    out[m[1]] = body.slice(start, end).trim();
  });
  return out;
}

const paragraphs = (text = "") => text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
const section = (doc, key) => doc?.data?.sections?.find((s) => s.key === key) ?? {};

const manifest = JSON.parse(fs.readFileSync(path.join(SRC, "media/manifest.json"), "utf8"));
const describe = (file) => (manifest.media.find((m) => m.file === file)?.description_en || "").trim();

// Reviewed alt texts (ka + en) and SEO descriptions written with the translation (source/content-en/).
const readYaml = (rel) => {
  const file = path.join(SRC, rel);
  return fs.existsSync(file) ? loadYaml(fs.readFileSync(file, "utf8")) : null;
};
const trUi = readYaml("content-en/ui.yml") ?? {};
const seo = (key) => trUi.seo?.descriptions?.[key] ?? {};
// Reviewed bilingual alt texts (source/content-en/media-alt.yml, keyed by source media path) are preferred;
// the manifest description is only an English fallback. Decorative entries give "".
const altFile = path.join(SRC, "content-en/media-alt.yml");
const ALT = fs.existsSync(altFile) ? loadYaml(fs.readFileSync(altFile, "utf8"))?.images || {} : {};
const alt = (file, lang) => String(ALT[file]?.[lang] ?? "").trim() || (lang === "en" ? describe(file) : "");

/* ---------------- projects ---------------- */

const PROJECTS = {
  "cooperation-with-supergmiri": { cover: "supergmiri-cover.jpg", category: "scholarship" },
  "terenti-graneli-scholarship": { cover: "graneli-scholarship-cover.jpg", category: "scholarship" },
  "batumi-tragedy-scholarship": { cover: "batumi-scholarship-cover.jpg", category: "scholarship" },
  "jgali-school-it-lab": { cover: "jgali-it-lab-cover.jpg", category: "technology" },
};

const proj = (lang, slug) => source(lang, `projects/${slug}.md`);

// Owner default: the teacher's quote about the Graneli event moves from the Batumi page to the Graneli page
// (both languages); the Batumi page keeps only its own text (the summary).
const moved = {
  ka: bodyAfterH1(proj("ka", "batumi-tragedy-scholarship").body),
  en: bodyAfterH1(proj("en", "batumi-tragedy-scholarship")?.body),
};

for (const [slug, cfg] of Object.entries(PROJECTS)) {
  const ka = proj("ka", slug);
  const en = proj("en", slug);
  const t = { ka: ka.data.title, en: en?.data.title || "" };
  const b = { ka: bodyAfterH1(ka.body), en: bodyAfterH1(en?.body) };
  if (slug === "terenti-graneli-scholarship") {
    // Owner default: the title drops "დაანონსდა" (announced), the body already names the winner.
    t.ka = t.ka.replace(/\s*დაანონსდა$/, "");
    t.en = t.en.replace(/\s+announced$/i, "");
    b.ka = [b.ka, moved.ka].filter(Boolean).join("\n\n");
    b.en = b.en && moved.en ? `${b.en}\n\n${moved.en}` : b.en;
  }
  if (slug === "batumi-tragedy-scholarship") {
    b.ka = "";
    b.en = "";
  }
  const fm = {
    slug,
    title_ka: t.ka,
    title_en: t.en,
    summary_ka: ka.data.summary,
    summary_en: en?.data.summary || "",
    date: ka.data.date,
    event_date: ka.data.event_date || "",
    category: cfg.category,
    // Tie-breaker for items with the same date (higher first); kept from the Wix "order" field.
    order: ka.data.order ?? 0,
    cover: `/assets/uploads/projects/${cfg.cover}`,
    cover_alt_ka: alt(ka.data.cover.file, "ka"),
    cover_alt_en: alt(ka.data.cover.file, "en"),
    gallery: [],
    body_ka: b.ka,
    body_en: b.en,
    draft: false,
    // Record only: not shown and not in the CMS schema (Pages CMS keeps it: settings.content.merge = true).
    legacy: {
      wix_item_id: ka.data.wix?.item_id,
      wix_created: ka.data.wix?.created,
      original_slug: ka.data.original_slug,
      original_title: ka.data.title !== t.ka ? ka.data.title : undefined,
      body_moved_to: slug === "batumi-tragedy-scholarship" ? "terenti-graneli-scholarship" : undefined,
    },
  };
  for (const k of Object.keys(fm.legacy)) if (fm.legacy[k] === undefined) delete fm.legacy[k];
  write(`content/projects/${slug}.md`, stringifyFrontMatter(fm));
}

/* ---------------- news ---------------- */

const NEWS = {
  "memorandum-with-energia": {
    cover: "energia-cover.jpg",
    gallery: [
      ["energia-01.jpg", "media/images/news-energia-gallery-01.png"],
      ["energia-02.jpg", "media/images/news-energia-gallery-02.jpg"],
      ["energia-03.jpg", "media/images/news-energia-gallery-03.jpg"],
      ["energia-04.jpg", "media/images/news-energia-gallery-04.jpg"],
      ["energia-05.jpg", "media/images/news-energia-gallery-05.jpg"],
    ],
  },
  "mothers-day-event-2023": {
    cover: "mothers-day-cover.jpg",
    gallery: [
      ["mothers-day-01.jpg", "media/images/news-mothers-day-gallery-01.png"],
      ["mothers-day-02.jpg", "media/images/news-mothers-day-gallery-02.png"],
      ["mothers-day-04.jpg", "media/images/news-mothers-day-gallery-04.jpg"],
      ["mothers-day-05.jpg", "media/images/news-mothers-day-gallery-05.png"],
      ["mothers-day-06.jpg", "media/images/news-mothers-day-gallery-06.png"],
    ],
  },
};

for (const [slug, cfg] of Object.entries(NEWS)) {
  const ka = source("ka", `news/${slug}.md`);
  const en = source("en", `news/${slug}.md`);
  const fm = {
    slug,
    title_ka: ka.data.title,
    title_en: en?.data.title || "",
    summary_ka: ka.data.summary,
    summary_en: en?.data.summary || "",
    date: ka.data.date,
    event_date: ka.data.event_date || "",
    cover: `/assets/uploads/news/${cfg.cover}`,
    cover_alt_ka: alt(ka.data.cover.file, "ka"),
    cover_alt_en: alt(ka.data.cover.file, "en"),
    // The Wix gallery repeated the cover image; here it is shown once, as the cover.
    gallery: cfg.gallery.map(([file, original]) => ({
      image: `/assets/uploads/news/${file}`,
      alt_ka: alt(original, "ka"),
      alt_en: alt(original, "en"),
    })),
    body_ka: bodyAfterH1(ka.body),
    body_en: bodyAfterH1(en?.body),
    draft: false,
    legacy: {
      wix_item_id: ka.data.wix?.item_id,
      wix_collection: ka.data.wix?.collection,
      original_slug: ka.data.original_slug,
    },
  };
  write(`content/news/${slug}.md`, stringifyFrontMatter(fm));
}

/* ---------------- pages ---------------- */

function homeParts(doc) {
  if (!doc) return {};
  const s = sections(doc.body);
  const quote = (s["niko-quote"] || "")
    .split("\n")
    .filter((l) => l.startsWith(">"))
    .map((l) => l.replace(/^>\s?/, ""))
    .join("\n")
    .trim();
  const attribution = paragraphs(s["niko-quote"]).find((p) => !p.startsWith(">") && !p.startsWith("![")) || "";
  const goal = paragraphs(s["our-goal"]).filter((p) => !p.startsWith("#") && !p.startsWith("!["));
  const mission = paragraphs(s["mission-hidden"]).filter((p) => !p.startsWith("#"));
  return {
    title: section(doc, "hero").heading || "",
    tagline: section(doc, "hero").subtitle || "",
    quote,
    attribution,
    goalHeading: section(doc, "our-goal").heading || "",
    goal: goal.join("\n\n"),
    projectsHeading: section(doc, "funded-projects").heading || "",
    missionHeading: section(doc, "mission-hidden").heading || "",
    mission: section(doc, "mission-hidden").paragraph || mission.join("\n\n"),
  };
}

const hk = homeParts(source("ka", "home.md"));
const he = homeParts(source("en", "home.md"));
write(
  "content/pages/home.yml",
  dumpYaml({
    hero: {
      title_ka: hk.title,
      title_en: he.title || "Niko Kvaratskhelia Foundation",
      tagline_ka: hk.tagline,
      tagline_en: he.tagline || "",
    },
    quote: {
      image: "/assets/uploads/pages/niko-portrait.jpg",
      image_alt_ka: alt("media/images/home-niko-portrait.jpg", "ka") || hk.attribution,
      image_alt_en: alt("media/images/home-niko-portrait.jpg", "en") || he.attribution || "Niko Kvaratskhelia",
      text_ka: hk.quote,
      text_en: he.quote || "",
      attribution_ka: hk.attribution,
      attribution_en: he.attribution || "Niko Kvaratskhelia",
    },
    goal: {
      heading_ka: hk.goalHeading,
      heading_en: he.goalHeading || "",
      body_ka: hk.goal,
      body_en: he.goal || "",
      video: "/assets/video/film-720p.mp4",
      poster: "/assets/video/film-poster.webp",
    },
    // Owner default: publish the mission paragraph that Wix hid with CSS.
    mission: {
      heading_ka: hk.missionHeading,
      heading_en: he.missionHeading || "",
      body_ka: hk.mission,
      body_en: he.mission || "",
    },
    projects: {
      heading_ka: hk.projectsHeading,
      heading_en: he.projectsHeading || "",
      count: 3,
    },
  }),
);

function aboutParts(doc) {
  if (!doc) return {};
  return { title: doc.data.title || "", body: (sections(doc.body).about || "").replace(/^# .*\n+/, "").trim() };
}
const ak = aboutParts(source("ka", "about.md"));
const ae = aboutParts(source("en", "about.md"));
write(
  "content/pages/about.yml",
  dumpYaml({
    title_ka: ak.title,
    title_en: ae.title || "",
    description_ka: seo("about").ka || "",
    description_en: seo("about").en || "",
    body_ka: ak.body,
    body_en: ae.body || "",
  }),
);

const siteKa = loadYaml(fs.readFileSync(path.join(SRC, "site.yml"), "utf8"));
const siteEnFile = path.join(SRC, "content-en/site.yml");
const siteEn = fs.existsSync(siteEnFile) ? loadYaml(fs.readFileSync(siteEnFile, "utf8")) : null;
const donateKa = source("ka", "donate.md");
const donateEn = source("en", "donate.md");
write(
  "content/pages/donate.yml",
  dumpYaml({
    label_ka: section(donateKa, "hero").label,
    label_en: section(donateEn, "hero").label || "",
    title_ka: section(donateKa, "hero").headline,
    title_en: section(donateEn, "hero").headline || "",
    // Owner default: the original intro pointed to the closed online form; the shared "join us"
    // sentence (same wording without the form clause) is used instead.
    intro_ka: siteKa.cta_block.text,
    intro_en: siteEn?.cta_block?.text || "",
    description_ka: seo("donate").ka || "",
    description_en: seo("donate").en || "",
  }),
);

const pk = source("ka", "projects/_index.md");
const pe = source("en", "projects/_index.md");
write(
  "content/pages/projects.yml",
  dumpYaml({
    label_ka: pk.data.title,
    label_en: pe?.data.title || "",
    title_ka: pk.data.subtitle,
    title_en: pe?.data.subtitle || "",
    description_ka: seo("projects").ka || "",
    description_en: seo("projects").en || "",
  }),
);
const nk = source("ka", "news/_index.md");
const ne = source("en", "news/_index.md");
write(
  "content/pages/news.yml",
  dumpYaml({
    title_ka: nk.data.title,
    title_en: ne?.data.title || "",
    intro_ka: nk.data.subtitle,
    intro_en: ne?.data.subtitle || "",
    description_ka: seo("news").ka || "",
    description_en: seo("news").en || "",
    facebook_limit: 24,
  }),
);

console.log(fs.existsSync(DIRS.en) ? "English: source/content-en/ used where present" : "English: none yet (*_en left empty)");

/* ---------------- bank details ---------------- */

const bank = loadYaml(fs.readFileSync(path.join(SRC, "bank.yml"), "utf8"));
const acc = bank.account;
const bankEnFile = path.join(SRC, "content-en/bank.yml");
const bankEn = fs.existsSync(bankEnFile) ? loadYaml(fs.readFileSync(bankEnFile, "utf8")) : null;
write(
  "data/bank.yml",
  `# Bank requisites shown on the Donate page (both languages). Transcribed exactly from the Bank of Georgia
# PDF (src/assets/docs/bank-requisites-2022-12.pdf, Nov/Dec 2022); the owner confirmed in Oct 2026 that the
# account is still valid. IBAN/SWIFT/beneficiary values are what donors type into their bank form: never
# "translate" or reformat them. Edit in Pages CMS → "Bank details / საბანკო რეკვიზიტები".\n` +
    dumpYaml({
      pdf: "/assets/docs/bank-requisites-2022-12.pdf",
      pdf_date: "2022-12",
      purpose_ka: "შემოწირულობა",
      purpose_en: "Donation",
      beneficiary_ka: acc.beneficiary_ka,
      beneficiary_en: acc.beneficiary_en,
      iban: acc.iban,
      account_type_ka: acc.account_type_ka,
      account_type_en: bankEn?.account?.account_type_en || "Standard current account",
      bank_name_ka: acc.bank_name_ka,
      bank_name_en: acc.bank_name_en,
      bank_swift: acc.bank_swift,
      bank_address_ka: acc.bank_address_ka,
      bank_address_en: acc.bank_address_en,
      currencies: ["GEL", "USD", "EUR"].map((code) => {
        const c = bank.currencies[code];
        return {
          code,
          intermediary_bank: c.intermediary_bank || "",
          intermediary_swift: c.intermediary_swift || "",
        };
      }),
    }),
);
