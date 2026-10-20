#!/usr/bin/env node
// Used by .github/workflows/site.yml right after the Facebook import.
// Reads data/facebook-sync.json and reports whether the import has been failing for STALE_DAYS or more
// (typically an expired or revoked Page token: the import itself only warns, so the build stays green and the
// "Latest from Facebook" section would silently stop updating).
//
//   node scripts/ci/facebook-health.mjs      → prints stale=true|false, failing_since=…, last_error=… (GITHUB_OUTPUT format)
//
// The workflow passes these to the separate "facebook-health" job, which fails visibly (red run + GitHub's e-mail
// about the failed run) while the site itself is still built and deployed.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const STALE_DAYS = 7;

/** { stale, failingSince, days, lastError } for a state object at time `now`. */
export function health(state = {}, now = new Date(), staleDays = STALE_DAYS) {
  const since = state.failingSince ? new Date(state.failingSince) : null;
  if (!since || Number.isNaN(since.getTime())) return { stale: false, failingSince: "", days: 0, lastError: "" };
  const days = Math.floor((now - since) / 86400e3);
  return { stale: days >= staleDays, failingSince: since.toISOString(), days, lastError: String(state.lastError || "") };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  let state = {};
  try { state = JSON.parse(fs.readFileSync("data/facebook-sync.json", "utf8")); } catch { state = {}; }
  const h = health(state);
  // One line per output; strip newlines so a message can never inject another output.
  const clean = (v) => String(v).replace(/[\r\n]+/g, " ").slice(0, 300);
  const lines = [`stale=${h.stale}`, `failing_since=${clean(h.failingSince)}`, `days=${h.days}`, `last_error=${clean(h.lastError)}`];
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${lines.join("\n")}\n`);
  console.log(lines.join("\n"));
  if (h.days > 0) console.log(`::warning title=Facebook import::The Facebook import has been failing for ${h.days} day(s) (since ${h.failingSince}).`);
}
