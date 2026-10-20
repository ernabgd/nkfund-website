#!/usr/bin/env node
// Rasterise the favicon / app icons from the two SVG masters in src/assets/img/icons/
// (developer tool, run once; outputs are committed).
//
//   favicon.svg      white nkfund. mark on a brand-blue disc (visible on light and dark tabs)
//   icon-square.svg  white mark on a full-bleed blue square (maskable / apple-touch)
//
//   node scripts/media/build-icons.mjs
import fs from "node:fs/promises";
import sharp from "sharp";

const dir = "src/assets/img/icons";
const disc = await fs.readFile(`${dir}/favicon.svg`);
const square = await fs.readFile(`${dir}/icon-square.svg`);

async function png(svg, size, file) {
  await sharp(svg, { density: 384 }).resize(size, size).png({ compressionLevel: 9, palette: true }).toFile(`${dir}/${file}`);
  console.log(`${file} ${size}x${size}`);
}

await png(square, 180, "apple-touch-icon.png");
await png(disc, 192, "icon-192.png");
await png(disc, 512, "icon-512.png");
await png(square, 512, "icon-maskable-512.png");

// favicon.ico with 16, 32 and 48 px PNG frames (ICO may embed PNG data since Windows Vista).
const sizes = [16, 32, 48];
const frames = await Promise.all(sizes.map((s) => sharp(disc, { density: 384 }).resize(s, s).png().toBuffer()));
const header = Buffer.alloc(6 + 16 * frames.length);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(frames.length, 4);
let offset = header.length;
frames.forEach((buf, i) => {
  const o = 6 + 16 * i;
  header.writeUInt8(sizes[i] % 256, o); // width
  header.writeUInt8(sizes[i] % 256, o + 1); // height
  header.writeUInt8(0, o + 2); // palette
  header.writeUInt8(0, o + 3); // reserved
  header.writeUInt16LE(1, o + 4); // colour planes
  header.writeUInt16LE(32, o + 6); // bits per pixel
  header.writeUInt32LE(buf.length, o + 8);
  header.writeUInt32LE(offset, o + 12);
  offset += buf.length;
});
await fs.writeFile(`${dir}/favicon.ico`, Buffer.concat([header, ...frames]));
console.log("favicon.ico 16/32/48");

// Default social-sharing card, 1200x630: the foundation's logo card (3f8517_b4fdd6c7…) centred on its own grey.
await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#EAE9E5" } })
  .composite([{ input: await sharp("src/assets/img/nkfund-card.jpg").resize({ height: 630 }).toBuffer(), gravity: "center" }])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile("src/assets/img/og-default.jpg");
console.log("og-default.jpg 1200x630");
