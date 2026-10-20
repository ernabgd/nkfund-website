// Template filters (registered in eleventy.config.js). Pure functions, unit-testable.
import { toDate, normaliseEventDate, DEFAULT_LANG } from "./content.mjs";

const MONTHS = {
  ka: ["იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი", "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};
const TZ = "Asia/Tbilisi";

/** UI string: {ka, en} → value for lang (falls back to Georgian). */
export function t(entry, lang = DEFAULT_LANG) {
  if (entry === undefined || entry === null) return "";
  if (typeof entry === "string") return entry;
  return entry[lang] || entry[DEFAULT_LANG] || "";
}

/** Localised field of a content object: loc(item, "title", "en") → item.title_en || item.title_ka */
export function loc(obj, field, lang = DEFAULT_LANG) {
  if (!obj) return "";
  const v = obj[`${field}_${lang}`];
  if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  return obj[`${field}_${DEFAULT_LANG}`] ?? "";
}

/** True when the requested language is empty and loc() fell back to Georgian. */
export function isFallback(obj, field, lang = DEFAULT_LANG) {
  if (!obj || lang === DEFAULT_LANG) return false;
  const v = obj[`${field}_${lang}`];
  const ka = obj[`${field}_${DEFAULT_LANG}`];
  return (v === undefined || v === null || String(v).trim() === "") && !!ka && String(ka).trim() !== "";
}

/** Language actually used for a field (for lang="" attributes on fallback text). */
export function locLang(obj, field, lang = DEFAULT_LANG) {
  return isFallback(obj, field, lang) ? DEFAULT_LANG : lang;
}

export function langRoot(lang) {
  return lang === DEFAULT_LANG ? "/" : `/${lang}/`;
}

/** Route ("about/", "projects/x/", "") → root-relative URL for a language. */
export function langUrl(route = "", lang = DEFAULT_LANG) {
  return `${langRoot(lang)}${String(route).replace(/^\/+/, "")}`;
}

/** Root-relative URL → URL with PATH_PREFIX (for non-HTML outputs; HTML is handled by the base plugin). */
export function prefixUrl(url = "/", env) {
  const u = String(url);
  if (/^[a-z]+:/i.test(u)) return u;
  return `${env.pathPrefix}${u.replace(/^\/+/, "")}`;
}

/** Root-relative URL → absolute URL (canonical, hreflang, sitemap, og:image). */
export function absUrl(url = "/", env) {
  const u = String(url);
  if (/^[a-z]+:/i.test(u)) return u;
  return `${env.siteUrl}${prefixUrl(u, env)}`;
}

function isDateOnly(value) {
  if (value instanceof Date) return value.getUTCHours() === 0 && value.getUTCMinutes() === 0 && value.getUTCSeconds() === 0;
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value).trim());
}

function parts(value) {
  const d = toDate(value);
  if (!d) return null;
  if (isDateOnly(value)) return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate() };
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: TZ, year: "numeric", month: "numeric", day: "numeric" })
      .formatToParts(d)
      .map((x) => [x.type, x.value]),
  );
  return { y: Number(p.year), m: Number(p.month) - 1, d: Number(p.day) };
}

// Georgian dates take a comma before the year ("19 მარტი, 2023"), as on the old site and in the translation style guide.
const sep = (lang) => (lang === "ka" ? ", " : " ");

/** "18 დეკემბერი, 2022" / "18 December 2022" */
export function formatDate(value, lang = DEFAULT_LANG) {
  const p = parts(value);
  if (!p) return "";
  return `${p.d} ${(MONTHS[lang] || MONTHS.ka)[p.m]}${sep(lang)}${p.y}`;
}

/**
 * Partial dates: "2022" → "2022", "2022-09" → „2022 წლის სექტემბერი“ / "September 2022",
 * "2022-09-15" → „15 სექტემბერი, 2022“ / "15 September 2022". (A month without a day reads naturally in Georgian
 * only as „<year> წლის <month>“; „სექტემბერი, 2022“ is a calque of the English order.)
 */
export function formatEventDate(value, lang = DEFAULT_LANG) {
  const s = normaliseEventDate(value);
  if (!s) return "";
  const [y, m, d] = s.split("-").map(Number);
  const months = MONTHS[lang] || MONTHS.ka;
  if (!m) return String(y);
  if (!d) return lang === "ka" ? `${y} წლის ${months[m - 1]}` : `${months[m - 1]} ${y}`;
  return `${d} ${months[m - 1]}${sep(lang)}${y}`;
}

/** Name of the month of a date or partial date ("2022-12" → „დეკემბერი“ / "December"); "" for a year only. */
export function monthName(value, lang = DEFAULT_LANG) {
  const s = normaliseEventDate(value);
  const p = s ? { m: s.length >= 7 ? Number(s.slice(5, 7)) - 1 : -1 } : parts(value);
  if (!p || p.m < 0) return "";
  return (MONTHS[lang] || MONTHS.ka)[p.m];
}

/** True when a long Georgian word in the text gets soft hyphens (shy/shyHtml): such titles get a clean aria-label. */
export function hasShy(text = "") {
  return /[ა-ჿ]{12,}/.test(String(text ?? ""));
}

/** ISO 8601 for <time datetime> and the sitemap. Date-only values stay date-only. */
export function isoDate(value) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}(-\d{2}){0,2}$/.test(value.trim())) return value.trim();
  const d = toDate(value);
  if (!d) return "";
  return isDateOnly(value) ? d.toISOString().slice(0, 10) : d.toISOString();
}

/** "GE93BG0000000533757447" → "GE93 BG00 0000 0533 7574 47" (display only; copy the raw value). */
export function groupIban(iban = "") {
  return String(iban).replace(/\s+/g, "").replace(/(.{4})/g, "$1 ").trim();
}

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** Facebook message (plain text) → safe HTML paragraphs with linked URLs. */
export function fbText(text = "") {
  const blocks = String(text).replace(/\r\n?/g, "\n").trim().split(/\n{2,}/);
  return blocks
    .filter((b) => b.trim())
    .map((b) => {
      const html = escapeHtml(b.trim())
        .replace(/\bhttps?:\/\/[^\s<]+[^\s<.,:;"')\]!?]/g, (url) => `<a href="${url}" rel="noopener">${url}</a>`)
        .replace(/\n/g, "<br>");
      return `<p>${html}</p>`;
    })
    .join("\n");
}

/** "ka" if the text is mostly Georgian letters, "en" if mostly Latin, "" if unclear (no lang attribute). */
export function guessLang(text = "") {
  const s = String(text);
  const ka = (s.match(/[Ⴀ-ჿᲐ-Ჿ]/g) || []).length;
  const la = (s.match(/[A-Za-z]/g) || []).length;
  if (ka === 0 && la === 0) return "";
  if (ka >= la) return "ka";
  return la > ka * 3 ? "en" : "";
}

/**
 * Strip Markdown/HTML to plain text (titles, meta descriptions, excerpts). Only real Markdown syntax is removed:
 * hyphens, underscores and tildes inside words stay („Facebook-ზე“, „ქუქი-ფაილები“, „2022-2023“, snake_case).
 */
export function plain(text = "") {
  return String(text)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^[ \t]{0,3}(?:#{1,6}|>|[-*+]|\d+[.)])[ \t]+/gm, "") // headings, quotes, list markers at line start
    .replace(/^[ \t]{0,3}(?:[-*_][ \t]*){3,}$/gm, "") // horizontal rules
    .replace(/(\*\*|__)(?=\S)([^]*?\S)\1/g, "$2") // **strong**, __strong__
    .replace(/(^|[^\p{L}\p{N}*])\*(?=\S)([^*\n]*?\S)\*(?![\p{L}\p{N}*])/gu, "$1$2") // *em*
    .replace(/(^|[^\p{L}\p{N}_])_(?=\S)([^_\n]*?\S)_(?![\p{L}\p{N}_])/gu, "$1$2") // _em_ (not snake_case)
    .replace(/~~(?=\S)([^~\n]*?\S)~~/g, "$1") // ~~strike~~
    .replace(/`+([^`]*)`+/g, "$1") // `code`
    .replace(/\s+/g, " ")
    .trim();
}

/** 1468006 → "1.4 MB" (English) / "1,4 MB" (Georgian: decimal comma). */
export function formatBytes(bytes, lang = DEFAULT_LANG) {
  const n = Number(bytes) || 0;
  const s = n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
  return lang === "ka" ? s.replace(".", ",") : s;
}

/**
 * markdown-it plugin: a quotation whose last paragraph starts with a dash ("— name, role") becomes
 *   <figure class="quote-block"><blockquote>…</blockquote><figcaption class="quote-block__by">— name, role</figcaption></figure>
 * so the speaker is a caption below the quote instead of part of it. Other blockquotes are unchanged.
 */
export function quoteAttribution(md) {
  md.core.ruler.push("quote_attribution", (state) => {
    const tokens = state.tokens;
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== "blockquote_open") continue;
      const level = tokens[i].level;
      let close = -1;
      for (let j = i + 1; j < tokens.length; j++) {
        if (tokens[j].type === "blockquote_close" && tokens[j].level === level) { close = j; break; }
      }
      if (close < 0) continue;
      // last direct paragraph inside the quote
      let pOpen = -1;
      for (let k = close - 1; k > i; k--) {
        if (tokens[k].type === "paragraph_open" && tokens[k].level === level + 1) { pOpen = k; break; }
      }
      if (pOpen < 0 || pOpen === i + 1) continue; // needs a quote paragraph before the attribution
      const inline = tokens[pOpen + 1];
      if (!inline || inline.type !== "inline" || !/^\s*[—–]\s/.test(inline.content)) continue;
      const html = (content) => Object.assign(new state.Token("html_block", "", 0), { content, block: true });
      tokens[i] = html('<figure class="quote-block">\n<blockquote>\n');
      tokens[pOpen] = html('</blockquote>\n<figcaption class="quote-block__by">');
      tokens[pOpen + 2] = html("</figcaption>\n");
      tokens[close] = html("</figure>\n");
    }
  });
}

export function excerpt(text = "", max = 180) {
  const p = plain(text);
  if (p.length <= max) return p;
  const cut = p.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 20)).replace(/[\s,.;:–—-]+$/, "")}…`;
}

/** Serialise JSON-LD safely inside <script type="application/ld+json">. */
export function jsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

/** JSON-LD for the home page: the foundation as an NGO + the website. */
export function homeJsonLd(site, lang, env) {
  const root = absUrl("/", env);
  const home = absUrl(langUrl("", lang), env);
  return jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NGO",
        "@id": `${root}#organization`,
        name: site.name_ka,
        alternateName: [site.name_en, site.brand].filter(Boolean),
        legalName: site.legal_name_ka,
        url: root,
        logo: absUrl("/assets/img/icons/icon-512.png", env),
        image: absUrl("/assets/img/og-default.jpg", env),
        description: loc(site, "description", lang),
        email: site.email,
        foundingDate: site.founded,
        areaServed: { "@type": "Country", name: "Georgia" },
        sameAs: Object.values(site.social || {}).filter((v) => /^https:\/\//.test(v)),
      },
      {
        "@type": "WebSite",
        "@id": `${home}#website`,
        url: home,
        name: loc(site, "name", lang),
        inLanguage: lang,
        publisher: { "@id": `${root}#organization` },
      },
    ],
  });
}

/** JSON-LD for a news item. `image`: the 1200 × 630 share image (falls back to the cover). */
export function articleJsonLd(item, lang, site, env, image = "") {
  const url = absUrl(langUrl(`news/${item.slug}/`, lang), env);
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: loc(item, "title", lang),
    description: plain(loc(item, "summary", lang)),
    datePublished: isoDate(item.date),
    ...(item.updated ? { dateModified: isoDate(item.updated) } : {}),
    inLanguage: isFallback(item, "body", lang) ? DEFAULT_LANG : lang,
    mainEntityOfPage: url,
    url,
    ...(image || item.cover ? { image: absUrl(image || item.cover, env) } : {}),
    publisher: { "@id": `${absUrl("/", env)}#organization`, "@type": "NGO", name: site.name_ka },
  });
}

/* ---------- design helpers (headings, dates, placeholders) ---------- */

// Mkhedruli words of 12+ letters. They only break when wider than the line: shyHtml wraps them in an inline-block.
const GE_WORD = /[ა-ჿ]{12,}/g;
const GE_VOWELS = new Set([..."აეიოუ"]);

/**
 * Soft hyphens (U+00AD) at syllable boundaries in long Georgian words, so headings such as
 * „ზოგადსაგანმანათლებლო“ can break on narrow screens instead of overflowing. Breaks follow the
 * V-CV and VC-CV syllable rules and keep at least 3 letters on each side. The character is invisible
 * unless the browser actually breaks there (CSS `hyphens: manual`, the default).
 */
export function shy(text = "") {
  return String(text ?? "").replace(GE_WORD, (word) => {
    const c = [...word];
    const isV = (ch) => GE_VOWELS.has(ch);
    // Candidate break positions (a break goes BEFORE index b).
    const breaks = new Set();
    for (let i = 1; i < c.length - 1; i++) {
      if (isV(c[i]) || !isV(c[i + 1])) continue; // need consonant + vowel (the next syllable's onset)
      if (isV(c[i - 1])) breaks.add(i); //                     V-CV
      else if (i >= 2 && isV(c[i - 2])) breaks.add(c[i] === "რ" ? i - 1 : i); // VC-CV, but V-CრV
      else if (i >= 3 && isV(c[i - 3])) breaks.add(i - 1); //   VC-CCV
    }
    let out = "";
    let last = 0;
    for (const b of [...breaks].sort((x, y) => x - y)) {
      if (b < 3 || c.length - b < 3 || b - last < 2) continue; // keep >= 3 letters at each end
      out += c.slice(last, b).join("") + "\u00AD";
      last = b;
    }
    return out + c.slice(last).join("");
  });
}

/**
 * `sizes` for an image that is cover-cropped into a box of aspect ratio `boxRatio` (width / height): a picture wider
 * than its box is drawn wider than the box, so every slot width is multiplied by (image ratio / box ratio).
 * meta = { width, height } of the source (imageMeta); crop "none" (object-fit: contain) needs no scaling.
 *   scaleSizes("(min-width: 760px) 30vw, 100vw", { width: 2400, height: 1158 }, 16 / 10)
 *   → "(min-width: 760px) 39vw, 130vw"
 */
export function scaleSizes(sizes = "", meta, boxRatio = 1, crop = "") {
  if (!meta || !meta.width || !meta.height || crop === "none") return sizes;
  const f = Math.round((meta.width / meta.height / boxRatio) * 100) / 100;
  if (!(f > 1.02)) return sizes;
  return String(sizes)
    .split(",")
    .map((entry) => {
      const m = entry.trim().match(/^(\(.*\)\s+)?(.+)$/);
      if (!m) return entry;
      const [, cond = "", len] = m;
      let out;
      if (/^\d+(\.\d+)?px$/.test(len)) out = `${Math.round(parseFloat(len) * f)}px`;
      else if (/^\d+(\.\d+)?vw$/.test(len)) out = `${Math.round(parseFloat(len) * f)}vw`;
      else out = `calc(${len.replace(/^calc/, "")} * ${f})`;
      return `${cond}${out}`;
    })
    .join(", ");
}

/**
 * HTML for a heading: text escaped, every long Georgian word wrapped in <span class="hy"> with soft hyphens inside.
 * The span is an inline-block (CSS), so a word that fits on a line moves to the next line whole, and only a word
 * WIDER than the line is broken — at a syllable, with a hyphen. (Plain soft hyphens let the browser hyphenate any
 * long word just to fill a line, e.g. „ზოგადსაგანმანათ-ლებლო“ on a 1440 px screen.)
 */
export function shyHtml(text = "") {
  return escapeHtml(String(text ?? "")).replace(GE_WORD, (word) => `<span class="hy">${shy(word)}</span>`);
}

/** "{label} copied" | fill({ label: "IBAN" }) → "IBAN copied" */
export function fill(template = "", values = {}) {
  return String(template ?? "").replace(/\{(\w+)\}/g, (m, key) => (values && values[key] !== undefined ? String(values[key]) : m));
}

/** Year of a date or partial date ("2022-01" → 2022). */
export function year(value) {
  const s = String(value ?? "").trim();
  const m = s.match(/^(\d{4})/);
  if (m) return Number(m[1]);
  const p = parts(value);
  return p ? p.y : "";
}

/** Day of the month (number) of a full date, or "" for partial dates. */
export function dayOf(value) {
  const s = normaliseEventDate(value);
  if (s && s.length < 10) return "";
  const p = parts(value);
  return p ? p.d : "";
}

/** "მარტი, 2023" / "March 2023" for any date or partial date. */
export function monthYear(value, lang = DEFAULT_LANG) {
  const s = normaliseEventDate(value);
  if (s && s.length === 4) return s;
  const p = s ? { y: Number(s.slice(0, 4)), m: Number(s.slice(5, 7)) - 1 } : parts(value);
  if (!p) return "";
  return `${(MONTHS[lang] || MONTHS.ka)[p.m]}${sep(lang)}${p.y}`;
}

/** Item date shown on cards: the event date when known, otherwise the publication date. */
export function itemDate(item, lang = DEFAULT_LANG) {
  if (!item) return "";
  return item.event_date ? formatEventDate(item.event_date, lang) : formatDate(item.date, lang);
}

/** First paragraph of a Markdown text (blank-line separated). */
export function firstParagraph(text = "") {
  return String(text ?? "").replace(/\r\n?/g, "\n").trim().split(/\n{2,}/)[0] || "";
}

/** Everything after the first paragraph. */
export function restParagraphs(text = "") {
  const blocks = String(text ?? "").replace(/\r\n?/g, "\n").trim().split(/\n{2,}/);
  return blocks.slice(1).join("\n\n");
}

/** Split a short title into words (used to set the hero title one word per line). */
export function words(text = "") {
  return String(text ?? "").trim().split(/\s+/).filter(Boolean);
}
