#!/usr/bin/env node
// Requests every old URL in data/redirects.csv from a running server and checks where it ends up.
// Works against a local static server or the live GitHub Pages site.
//
//   npm run build && python3 -m http.server 8765 --directory _site &
//   node scripts/verify-redirects.mjs http://localhost:8765/
//   node scripts/verify-redirects.mjs https://ernabgd.github.io/nkfund-website/
//
// For each row: HTTP-level redirects are followed (e.g. GitHub Pages adds the trailing slash), then the
// page must be either the new page itself or a stub whose meta refresh / canonical points to new_path.
// Raw Georgian and percent-encoded rows are both requested exactly as written in the CSV.
import fs from "node:fs";
import { parseCsv } from "./lib/content.mjs";

const base = new URL(process.argv[2] || "http://localhost:8765/");
const rows = parseCsv(fs.readFileSync("data/redirects.csv", "utf8"));
const prefix = base.pathname.endsWith("/") ? base.pathname : `${base.pathname}/`;
const abs = (p) => new URL(prefix + p.replace(/^\//, ""), base.origin).toString();

let ok = 0;
const failures = [];
for (const row of rows) {
  const requested = abs(row.old_path);
  const expected = new URL(abs(row.new_path)).pathname;
  try {
    const res = await fetch(requested, { redirect: "follow" });
    const finalPath = decodeURIComponent(new URL(res.url).pathname);
    const type = res.headers.get("content-type") || "";
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (/\.pdf$/i.test(row.old_path)) {
      if (!/pdf/.test(type)) throw new Error(`expected a PDF, got ${type}`);
    } else if (finalPath !== decodeURIComponent(expected)) {
      const body = await res.text();
      const refresh = body.match(/http-equiv="refresh" content="0; url=([^"]+)"/)?.[1];
      if (!refresh) throw new Error(`landed on ${finalPath} without a redirect stub`);
      const target = new URL(refresh).pathname;
      if (target !== expected) throw new Error(`stub points to ${target}, expected ${expected}`);
      const canonical = body.match(/rel="canonical" href="([^"]+)"/)?.[1];
      if (canonical !== refresh) throw new Error("canonical differs from refresh target");
      const next = await fetch(new URL(target, base.origin));
      if (!next.ok) throw new Error(`target ${target} → HTTP ${next.status}`);
    }
    ok++;
  } catch (e) {
    failures.push(`${row.old_path.slice(0, 90)} → ${row.new_path}: ${e.message}`);
  }
}
console.log(`verify-redirects: ${ok}/${rows.length} old URLs OK against ${base}`);
if (failures.length) {
  console.error(failures.map((f) => `  ✗ ${f}`).join("\n"));
  process.exit(1);
}
