// Eleventy configuration for nkfund.world
//
// Environment (all optional):
//   PATH_PREFIX  URL path the site is served under. "/" (default, production at https://nkfund.world)
//                or "/nkfund-website/" (GitHub Pages preview at https://ernabgd.github.io/nkfund-website/).
//   SITE_URL     Absolute origin used for canonical/hreflang/sitemap/og URLs. Default https://nkfund.world
//   PREVIEW      "true" → <meta name="robots" content="noindex"> on every page + robots.txt "Disallow: /".
//   FB_DEMO      "true" → while running the local dev server only (npm start), show clearly-labelled demo
//                Facebook posts from tests/fixtures/facebook-demo/. Ignored by `npm run build`.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { HtmlBasePlugin } from "@11ty/eleventy";
import Image, { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import markdownIt from "markdown-it";
import sharp from "sharp";
import yaml from "js-yaml";

import {
  LANGS,
  loadItems,
  loadFacebookPosts,
  visibleFacebookPosts,
  loadPages,
  parseCsv,
  buildRedirects,
} from "./scripts/lib/content.mjs";
import * as f from "./scripts/lib/filters.mjs";

function normalisePrefix(value) {
  let p = String(value || "/").trim();
  if (!p.startsWith("/")) p = `/${p}`;
  if (!p.endsWith("/")) p = `${p}/`;
  return p.replace(/\/{2,}/g, "/");
}

const truthy = (v) => /^(1|true|yes|on)$/i.test(String(v ?? "").trim());

const PATH_PREFIX = normalisePrefix(process.env.PATH_PREFIX);
const SITE_URL = String(process.env.SITE_URL || "https://nkfund.world").trim().replace(/\/+$/, "");
const PREVIEW = truthy(process.env.PREVIEW);
const IS_SERVE = process.env.ELEVENTY_RUN_MODE === "serve";
const FB_DEMO = IS_SERVE && truthy(process.env.FB_DEMO);

export default function (eleventyConfig) {
  /* ---------- data ---------- */
  eleventyConfig.addDataExtension("yml,yaml", (contents) => yaml.load(contents));

  const env = {
    pathPrefix: PATH_PREFIX,
    siteUrl: SITE_URL,
    baseUrl: `${SITE_URL}${PATH_PREFIX}`, // e.g. https://nkfund.world/
    preview: PREVIEW,
    fbDemo: FB_DEMO,
    buildYear: new Date().getUTCFullYear(),
    buildDate: new Date().toISOString(),
  };
  eleventyConfig.addGlobalData("env", env);
  eleventyConfig.addGlobalData("langs", LANGS);
  eleventyConfig.addGlobalData("assetVersion", () => {
    const hash = crypto.createHash("sha256");
    for (const file of ["src/assets/css/main.css", "src/assets/js/main.js"]) {
      if (fs.existsSync(file)) hash.update(fs.readFileSync(file));
    }
    return hash.digest("hex").slice(0, 10);
  });

  // Content lives outside src/ (content/**) and is loaded as data; one file = both languages.
  eleventyConfig.addGlobalData("projects", () => loadItems("content/projects", "project"));
  eleventyConfig.addGlobalData("news", () => loadItems("content/news", "news"));
  eleventyConfig.addGlobalData("pages", () => loadPages("content/pages"));
  eleventyConfig.addGlobalData("facebook", () => {
    const dir = FB_DEMO ? "tests/fixtures/facebook-demo" : "content/facebook";
    return visibleFacebookPosts(loadFacebookPosts(dir));
  });

  // One entry per (item, language) → used to paginate item pages.
  const perLang = (items, section) =>
    items.flatMap((item, i) =>
      LANGS.map((lang) => ({
        lang,
        item,
        route: `${section}/${item.slug}/`,
        prev: items[i + 1] || null, // older
        next: items[i - 1] || null, // newer
      })),
    );
  eleventyConfig.addGlobalData("projectPages", () => perLang(loadItems("content/projects", "project"), "projects"));
  eleventyConfig.addGlobalData("newsPages", () => perLang(loadItems("content/news", "news"), "news"));

  // Old Wix URLs → static redirect stubs (GitHub Pages has no server-side redirects).
  eleventyConfig.addGlobalData("redirects", () => {
    const rows = parseCsv(fs.readFileSync("data/redirects.csv", "utf8"));
    const pageRoutes = new Set(["/", "/about/", "/projects/", "/news/", "/donate/", "/contact/", "/privacy/"]);
    return buildRedirects(rows, pageRoutes);
  });

  eleventyConfig.addWatchTarget("content/");
  eleventyConfig.addWatchTarget("data/");
  eleventyConfig.addWatchTarget("scripts/lib/");

  /* ---------- markdown ---------- */
  const md = markdownIt({ html: true, linkify: true, typographer: false, breaks: false });
  // Only explicit http(s):// and www. addresses become links: a plain domain named in the text
  // (e.g. "Supergmiri.ge", "nkfund.world") stays plain text, as on the old site.
  md.linkify.set({ fuzzyLink: false });
  md.use(f.quoteAttribution);
  // External links open normally but are marked for assistive tech / styling.
  const defaultLinkOpen = md.renderer.rules.link_open || ((tokens, idx, opts, env, self) => self.renderToken(tokens, idx, opts));
  md.renderer.rules.link_open = (tokens, idx, opts, mdEnv, self) => {
    const href = tokens[idx].attrGet("href") || "";
    if (/^https?:\/\//.test(href)) tokens[idx].attrSet("rel", "noopener");
    return defaultLinkOpen(tokens, idx, opts, mdEnv, self);
  };
  eleventyConfig.setLibrary("md", md);
  eleventyConfig.addFilter("md", (text) => (text ? md.render(String(text)) : ""));
  eleventyConfig.addFilter("mdInline", (text) => (text ? md.renderInline(String(text)) : ""));

  /* ---------- filters ---------- */
  eleventyConfig.addFilter("t", f.t);
  eleventyConfig.addFilter("loc", f.loc);
  eleventyConfig.addFilter("locLang", f.locLang);
  eleventyConfig.addFilter("isFallback", f.isFallback);
  eleventyConfig.addFilter("langRoot", f.langRoot);
  eleventyConfig.addFilter("langUrl", f.langUrl);
  eleventyConfig.addFilter("absUrl", (url) => f.absUrl(url, env));
  eleventyConfig.addFilter("prefixUrl", (url) => f.prefixUrl(url, env));
  eleventyConfig.addFilter("formatDate", f.formatDate);
  eleventyConfig.addFilter("formatEventDate", f.formatEventDate);
  eleventyConfig.addFilter("isoDate", f.isoDate);
  eleventyConfig.addFilter("groupIban", f.groupIban);
  eleventyConfig.addFilter("fbText", f.fbText);
  eleventyConfig.addFilter("guessLang", f.guessLang);
  eleventyConfig.addFilter("excerpt", f.excerpt);
  eleventyConfig.addFilter("plain", f.plain);
  eleventyConfig.addFilter("jsonLd", f.jsonLd);
  eleventyConfig.addFilter("homeJsonLd", (site, lang) => f.homeJsonLd(site, lang, env));
  eleventyConfig.addFilter("articleJsonLd", (item, lang, site, image) => f.articleJsonLd(item, lang, site, env, image));
  eleventyConfig.addFilter("limit", (arr, n) => (Array.isArray(arr) ? arr.slice(0, n) : []));
  eleventyConfig.addFilter("shy", f.shy);
  eleventyConfig.addFilter("shyHtml", f.shyHtml);
  // "/assets/docs/x.pdf" → "1.4 MB" / Georgian "1,4 MB" (size of the source file in src/)
  eleventyConfig.addFilter("fileSize", (url, lang) => {
    try {
      return f.formatBytes(fs.statSync(path.join("src", String(url))).size, lang);
    } catch {
      return "";
    }
  });
  eleventyConfig.addFilter("fill", f.fill);
  eleventyConfig.addFilter("scaleSizes", f.scaleSizes);
  eleventyConfig.addFilter("year", f.year);
  eleventyConfig.addFilter("dayOf", f.dayOf);
  eleventyConfig.addFilter("monthYear", f.monthYear);
  eleventyConfig.addFilter("monthName", f.monthName);
  eleventyConfig.addFilter("hasShy", f.hasShy);
  eleventyConfig.addFilter("itemDate", f.itemDate);
  eleventyConfig.addFilter("firstParagraph", f.firstParagraph);
  eleventyConfig.addFilter("restParagraphs", f.restParagraphs);
  eleventyConfig.addFilter("words", f.words);
  eleventyConfig.addFilter("without", (arr, item) => (Array.isArray(arr) ? arr.filter((x) => x !== item) : []));
  eleventyConfig.addFilter("uniqueCategories", (items) => [...new Set((items || []).map((i) => i.category).filter(Boolean))]);

  /* ---------- assets ---------- */
  eleventyConfig.addPassthroughCopy({
    "src/assets/css": "assets/css",
    "src/assets/js": "assets/js",
    "src/assets/fonts": "assets/fonts",
    "src/assets/video": "assets/video",
    "src/assets/docs": "assets/docs",
    "src/assets/uploads": "assets/uploads", // raw uploads stay reachable (PDF links, rich-text images)
    "src/assets/img/logo": "assets/img/logo",
    "src/assets/img/og-default.jpg": "assets/img/og-default.jpg",
    "src/assets/img/icons": "assets/img/icons",
    "src/assets/img/icons/favicon.ico": "favicon.ico",
  });
  // Old PDF addresses in data/redirects.csv (the old site linked its bank PDF from every page):
  // serve the CURRENT bank-details PDF (data/bank.yml → pdf) at those exact paths.
  {
    const rows = parseCsv(fs.readFileSync("data/redirects.csv", "utf8"));
    const bankPdf = (yaml.load(fs.readFileSync("data/bank.yml", "utf8")) || {}).pdf;
    if (bankPdf) {
      for (const { from } of buildRedirects(rows).files) {
        eleventyConfig.addPassthroughCopy({ [`src${bankPdf}`]: from.replace(/^\//, "") });
      }
    }
  }

  /* ---------- images: responsive AVIF/WebP/JPEG for every <img> with a local src ---------- */
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["avif", "webp", "jpeg"],
    widths: [480, 800, 1200, 1800],
    urlPath: "/assets/img/r/",
    // No outputDir: the plugin writes to <Eleventy output dir>/assets/img/r/, so `eleventy --output=<dir>` works.
    svgShortCircuit: true,
    // Always include the source's own width when a larger width was asked for (default 1.25 drops e.g. a 960 px
    // original when 1200 is requested, leaving only 800 px for a 960 px box).
    minimumThreshold: 1,
    failOnError: true,
    sharpJpegOptions: { quality: 80, mozjpeg: true, progressive: true },
    sharpWebpOptions: { quality: 78 },
    sharpAvifOptions: { quality: 55 },
    htmlOptions: {
      imgAttributes: { loading: "lazy", decoding: "async" },
      pictureAttributes: {},
      fallback: "largest",
    },
  });

  // Size and edge colour of every uploaded or imported image (src/assets/uploads/**, src/assets/facebook/**): lets templates keep small covers at
  // their natural width instead of upscaling them, and fill the letterbox of "whole image" covers with the
  // picture's own edge colour.
  eleventyConfig.addGlobalData("imageMeta", async () => ({ ...(await imageMeta("src/assets/uploads")), ...(await imageMeta("src/assets/facebook")) }));

  // Gallery links (lightbox and no-JS link): an optimised ≤ 1800 px WebP instead of the raw upload.
  eleventyConfig.addAsyncFilter("lightboxSrc", async (src) => {
    if (!/^\/assets\//.test(String(src))) return src;
    try {
      const meta = await Image(path.join("src", src), {
        widths: [1800],
        formats: ["webp"],
        outputDir: path.join(eleventyConfig.directories.output, "assets", "img", "l"),
        urlPath: "/assets/img/l/",
        sharpWebpOptions: { quality: 80 },
      });
      return meta.webp[0].url;
    } catch {
      return src;
    }
  });

  // Rewrites every root-relative URL in HTML (href, src, srcset, poster …) with PATH_PREFIX.
  // Templates therefore always write plain "/about/" style URLs. Non-HTML files use the prefixUrl/absUrl filters.
  eleventyConfig.addPlugin(HtmlBasePlugin);

  // Record how this build was made, so scripts/check-site.mjs checks it with the same prefix/preview settings
  // (`npm run build:preview && npm run check` works without repeating the environment variables).
  eleventyConfig.on("eleventy.after", async ({ directories }) => {
    const out = directories?.output || "_site";
    fs.mkdirSync(out, { recursive: true });
    // Minify the stylesheet and script in the build output (the sources in src/ stay readable). Not on the dev server.
    if (!IS_SERVE) {
      const { transform } = await import("esbuild");
      for (const [file, loader] of [["assets/css/main.css", "css"], ["assets/js/main.js", "js"]]) {
        const target = path.join(out, file);
        if (!fs.existsSync(target)) continue;
        const { code } = await transform(fs.readFileSync(target, "utf8"), { loader, minify: true, legalComments: "none" });
        fs.writeFileSync(target, code);
      }
    }
    fs.writeFileSync(path.join(out, ".build.json"), `${JSON.stringify({ pathPrefix: PATH_PREFIX, siteUrl: SITE_URL, preview: PREVIEW, builtAt: env.buildDate }, null, 2)}\n`);
  });

  eleventyConfig.setQuietMode(true);
}

/**
 * { "/assets/uploads/x.jpg": { width, height, edge, bandsH, bandsV } } for every image below `dir`.
 *   edge    mean colour of the outer 2 % of the picture ("#rrggbb"; share images, fallbacks)
 *   bandsH  CSS background that continues the picture's top and bottom rows (10 colours each) upwards and
 *           downwards: the letterbox of a "whole image" cover that is wider than its box, without visible seams
 *           even on gradients
 *   bandsV  the same with the left and right columns, for a picture narrower than its box
 */
async function imageMeta(dir) {
  const out = {};
  const walk = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }) : []).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
  for (const file of walk(dir).filter((x) => /\.(jpe?g|png|webp|gif|avif|tiff?)$/i.test(x))) {
    try {
      const m = await sharp(file).metadata();
      const turned = (m.orientation || 1) >= 5; // EXIF orientations 5–8 swap width and height
      const [width, height] = turned ? [m.height, m.width] : [m.width, m.height];
      // Mean colour of a 2 % strip along all four edges.
      const small = await sharp(file).rotate().resize(50, 50, { fit: "fill" }).removeAlpha().raw().toBuffer();
      let r = 0, g = 0, b = 0, n = 0;
      for (let y = 0; y < 50; y++) for (let x = 0; x < 50; x++) {
        if (x > 0 && y > 0 && x < 49 && y < 49) continue;
        const i = (y * 50 + x) * 3;
        r += small[i]; g += small[i + 1]; b += small[i + 2]; n++;
      }
      const hex = (v) => Math.round(v / n).toString(16).padStart(2, "0");
      const edge = `#${hex(r)}${hex(g)}${hex(b)}`;
      // Edge rows/columns in 10 segments (outermost pixel line of a 100 × 100 copy).
      const S = 100;
      const px = await sharp(file).rotate().resize(S, S, { fit: "fill" }).removeAlpha().raw().toBuffer();
      const seg = (pick) => Array.from({ length: 10 }, (_, k) => {
        let rr = 0, gg = 0, bb = 0;
        for (let t = k * 10; t < k * 10 + 10; t++) { const i = pick(t) * 3; rr += px[i]; gg += px[i + 1]; bb += px[i + 2]; }
        const h = (v) => Math.round(v / 10).toString(16).padStart(2, "0");
        return `#${h(rr)}${h(gg)}${h(bb)} ${k * 10 + 5}%`;
      }).join(", ");
      const top = seg((t) => t), bottom = seg((t) => (S - 1) * S + t), left = seg((t) => t * S), right = seg((t) => t * S + S - 1);
      const bandsH = `linear-gradient(to right, ${top}) top / 100% 50.5% no-repeat, linear-gradient(to right, ${bottom}) bottom / 100% 50.5% no-repeat ${edge}`;
      const bandsV = `linear-gradient(${left}) left / 50.5% 100% no-repeat, linear-gradient(${right}) right / 50.5% 100% no-repeat ${edge}`;
      out[`/${path.relative("src", file).split(path.sep).join("/")}`] = { width, height, edge, bandsH, bandsV };
    } catch {
      // unreadable image: templates fall back to the defaults
    }
  }
  return out;
}

export const config = {
  dir: {
    input: "src",
    includes: "_includes",
    layouts: "_layouts",
    data: "../data",
    output: "_site",
  },
  pathPrefix: PATH_PREFIX,
  templateFormats: ["njk", "11ty.js"],
  htmlTemplateEngine: "njk",
  markdownTemplateEngine: false,
};
