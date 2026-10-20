#!/usr/bin/env node
// Used by .github/workflows/site.yml after the Facebook import.
// Decides whether the workflow should commit, and stamps data/facebook-sync.json → lastCommitted.
//
//   node scripts/ci/sync-commit.mjs --new-posts=true|false [--heartbeat]
//
// Prints "commit" or "skip". It commits when new posts were imported, when the import started or stopped failing
// (failingSince appeared or disappeared, so the failure date survives until the next run and facebook-health.mjs can
// tell how long it lasts), or — with --heartbeat (scheduled and manual runs) — when the last bot commit is older than
// HEARTBEAT_DAYS, so the repository never goes 60 days without activity (GitHub disables scheduled workflows in
// public repositories after 60 days without repository activity:
// https://docs.github.com/en/actions/how-tos/manage-workflow-runs/disable-and-enable-workflows).
import { spawnSync } from "node:child_process";
import fs from "node:fs";

const HEARTBEAT_DAYS = 25;
const FILE = "data/facebook-sync.json";

const args = process.argv.slice(2);
const newPosts = args.includes("--new-posts=true");
const heartbeat = args.includes("--heartbeat");

let state = {};
try { state = JSON.parse(fs.readFileSync(FILE, "utf8")); } catch { state = {}; }

const now = new Date();
const last = state.lastCommitted ? new Date(state.lastCommitted) : null;
const ageDays = last && !Number.isNaN(last.getTime()) ? (now - last) / 86400e3 : Infinity;
const due = heartbeat && ageDays >= HEARTBEAT_DAYS;

// The committed state (HEAD): did the failure status change in this run?
let committed = {};
const head = spawnSync("git", ["show", `HEAD:${FILE}`], { encoding: "utf8" });
if (head.status === 0) { try { committed = JSON.parse(head.stdout); } catch { committed = {}; } }
const statusChanged = Boolean(committed.failingSince) !== Boolean(state.failingSince);

if (newPosts || due || statusChanged) {
  state.lastCommitted = now.toISOString();
  state.lastChecked ??= null;
  state.lastNewPost ??= null;
  fs.writeFileSync(FILE, `${JSON.stringify(state, null, 2)}\n`);
  console.log("commit");
} else {
  console.log("skip");
}
