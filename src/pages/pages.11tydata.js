// Computed data for every template in src/pages/ (JS, so values are not HTML-escaped twice).
// Templates declare `pageKey`; item templates paginate over `entry` = { lang, item, route, prev, next }.
import path from "node:path";
import Image from "@11ty/eleventy-img";
import { loc, excerpt, plain } from "../../scripts/lib/filters.mjs";

/**
 * Social-preview image: a 1200 × 630 JPEG (the 1.91 : 1 that Facebook and others display) cut from the item's cover.
 * The crop follows the item's "cover_crop" setting; "none" letterboxes the whole picture on its own edge colour.
 * Written to <Eleventy output dir>/assets/img/og/ (so `eleventy --output=<dir>` works).
 */
const POSITIONS = { top: "top", bottom: "bottom", left: "left", right: "right" };
async function shareImage(item, outputDir, edge) {
  const src = item?.cover;
  if (!src || !/^\/assets\//.test(src)) return "";
  const crop = item.cover_crop || "center";
  try {
    const meta = await Image(path.join("src", src), {
      widths: [1200],
      formats: ["jpeg"],
      outputDir: path.join(outputDir || "_site", "assets", "img", "og"),
      urlPath: "/assets/img/og/",
      sharpJpegOptions: { quality: 82, mozjpeg: true },
      // eleventy-img keys its cache on the function name: one name per crop setting.
      transform: Object.defineProperty(
        (sharp) => {
          sharp.resize(
            crop === "none"
              ? { width: 1200, height: 630, fit: "contain", background: edge || "#1a1816" }
              : { width: 1200, height: 630, fit: "cover", position: POSITIONS[crop] || "centre" },
          );
        },
        "name",
        { value: `og_${crop}_${(edge || "").replace("#", "")}` },
      ),
    });
    return meta.jpeg[0].url;
  } catch {
    return "";
  }
}

const titles = {
  about: (p) => loc(p.about, "title", p.lang),
  projects: (p) => loc(p.projects, "label", p.lang),
  news: (p) => loc(p.news, "title", p.lang),
  donate: (p) => loc(p.donate, "label", p.lang),
  contact: (p) => loc(p.contact, "title", p.lang),
  privacy: (p) => loc(p.privacy, "title", p.lang),
};

const descriptions = {
  about: (p) => excerpt(loc(p.about, "body", p.lang), 200),
  projects: (p) => loc(p.projects, "title", p.lang),
  news: (p) => loc(p.news, "intro", p.lang),
  donate: (p) => loc(p.donate, "intro", p.lang),
};

export default {
  eleventyComputed: {
    lang: (data) => (data.entry ? data.entry.lang : data.lang),
    route: (data) => (data.entry ? data.entry.route : data.route),
    item: (data) => (data.entry ? data.entry.item : data.item),
    pageTitle: (data) => {
      if (data.entry) return plain(loc(data.entry.item, "title", data.entry.lang));
      const fn = titles[data.pageKey];
      return fn && data.pages ? plain(fn({ ...data.pages, lang: data.lang })) : data.pageTitle || "";
    },
    description: (data) => {
      if (data.entry) return plain(loc(data.entry.item, "summary", data.entry.lang));
      // A page file may carry its own SEO description (description_ka / description_en).
      const own = data.pages?.[data.pageKey] ? loc(data.pages[data.pageKey], "description", data.lang) : "";
      if (own) return plain(own);
      const fn = descriptions[data.pageKey];
      return fn && data.pages ? plain(fn({ ...data.pages, lang: data.lang })) : data.description || "";
    },
    ogImage: async (data) => {
      const item = data.entry?.item;
      if (!item?.cover) return data.ogImage || "";
      const edge = data.imageMeta?.[item.cover]?.edge;
      return (await shareImage(item, data.eleventy?.directories?.output, edge)) || data.ogImage || "";
    },
    ogImageAlt: (data) => (data.entry?.item ? loc(data.entry.item, "cover_alt", data.entry.lang) || plain(loc(data.entry.item, "title", data.entry.lang)) : ""),
  },
};
