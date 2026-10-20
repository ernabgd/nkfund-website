#!/usr/bin/env node
// One-time import of the foundation's own media (Wix ids 3f8517_… only) from the extracted
// source folder into the repository. Outputs are committed; the build never runs this.
//
//   node scripts/media/prepare-media.mjs <source/media dir>
//
// Every raster is auto-oriented, flattened onto white (the PNG phone photos carry an unused
// alpha channel) and, if larger than MAX_EDGE, resized and saved as high-quality JPEG.
// Small JPEGs are copied unchanged to avoid a second lossy generation.
// Responsive AVIF/WebP/JPEG variants are made at build time by @11ty/eleventy-img.
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const MAX_EDGE = 2400;
const JPEG = { quality: 86, mozjpeg: true, chromaSubsampling: "4:4:4" };

const src = process.argv[2];
if (!src) {
  console.error("usage: node scripts/media/prepare-media.mjs <source/media dir>");
  process.exit(1);
}

// [source file (relative to source/media), destination (relative to repo root)]
const MAP = [
  ["images/home-niko-portrait.jpg", "src/assets/uploads/pages/niko-portrait.jpg"],
  ["images/nkfund-cover-logo.jpg", "src/assets/img/nkfund-card.jpg"],
  ["images/project-supergmiri-cover.jpg", "src/assets/uploads/projects/supergmiri-cover.jpg"],
  ["images/project-graneli-scholarship-cover.jpg", "src/assets/uploads/projects/graneli-scholarship-cover.jpg"],
  ["images/project-batumi-scholarship-cover.jpg", "src/assets/uploads/projects/batumi-scholarship-cover.jpg"],
  ["images/project-jgali-it-lab-cover.jpg", "src/assets/uploads/projects/jgali-it-lab-cover.jpg"],
  ["images/news-energia-cover.png", "src/assets/uploads/news/energia-cover.jpg"],
  ["images/news-energia-gallery-01.png", "src/assets/uploads/news/energia-01.jpg"],
  ["images/news-energia-gallery-02.jpg", "src/assets/uploads/news/energia-02.jpg"],
  ["images/news-energia-gallery-03.jpg", "src/assets/uploads/news/energia-03.jpg"],
  ["images/news-energia-gallery-04.jpg", "src/assets/uploads/news/energia-04.jpg"],
  ["images/news-energia-gallery-05.jpg", "src/assets/uploads/news/energia-05.jpg"],
  ["images/news-mothers-day-cover.png", "src/assets/uploads/news/mothers-day-cover.jpg"],
  ["images/news-mothers-day-gallery-01.png", "src/assets/uploads/news/mothers-day-01.jpg"],
  ["images/news-mothers-day-gallery-02.png", "src/assets/uploads/news/mothers-day-02.jpg"],
  ["images/news-mothers-day-gallery-04.jpg", "src/assets/uploads/news/mothers-day-04.jpg"],
  ["images/news-mothers-day-gallery-05.png", "src/assets/uploads/news/mothers-day-05.jpg"],
  ["images/news-mothers-day-gallery-06.png", "src/assets/uploads/news/mothers-day-06.jpg"],
  ["docs/bank-requisites-2022-12.pdf", "src/assets/docs/bank-requisites-2022-12.pdf"],
];

for (const [from, to] of MAP) {
  const input = path.join(src, from);
  await fs.mkdir(path.dirname(to), { recursive: true });
  if (!/\.(jpe?g|png)$/i.test(from)) {
    await fs.copyFile(input, to);
    console.log(`copy  ${to}`);
    continue;
  }
  const meta = await sharp(input).metadata();
  const isJpeg = meta.format === "jpeg";
  const tooBig = Math.max(meta.width, meta.height) > MAX_EDGE;
  if (isJpeg && !tooBig && (!meta.orientation || meta.orientation === 1)) {
    await fs.copyFile(input, to);
  } else {
    await sharp(input)
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg(JPEG)
      .toFile(to);
  }
  const out = await sharp(to).metadata();
  const { size } = await fs.stat(to);
  console.log(`${isJpeg && !tooBig ? "copy " : "jpeg "} ${to}  ${out.width}x${out.height}  ${(size / 1024).toFixed(0)} KB`);
}

// The video posters (hero-poster.webp, film-poster.webp) are made by scripts/media/encode-video.sh.
