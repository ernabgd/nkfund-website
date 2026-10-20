// scripts/ci/push.sh: the workflow's push step must fail loudly (never "succeed" without pushing).
// scripts/ci/sync-commit.mjs: when the workflow commits the Facebook sync state.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const script = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../scripts/ci/push.sh");
const syncCommit = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../scripts/ci/sync-commit.mjs");
const git = (cwd, ...args) => {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(r.status, 0, `git ${args.join(" ")}: ${r.stderr}`);
  return r.stdout.trim();
};

function repo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "nkfund-push-"));
  const remote = path.join(dir, "remote.git");
  const work = path.join(dir, "work");
  git(dir, "init", "--bare", "-b", "main", remote);
  git(dir, "clone", remote, work);
  git(work, "config", "user.email", "test@example.invalid");
  git(work, "config", "user.name", "test");
  git(work, "checkout", "-b", "main");
  fs.writeFileSync(path.join(work, "a.txt"), "a\n");
  git(work, "add", "a.txt");
  git(work, "commit", "-m", "init");
  git(work, "push", "origin", "main");
  fs.writeFileSync(path.join(work, "b.txt"), "b\n");
  git(work, "add", "b.txt");
  git(work, "commit", "-m", "bot commit");
  return { remote, work };
}

const run = (cwd, env) => spawnSync("bash", [script], { cwd, encoding: "utf8", env: { ...process.env, RETRY_SLEEP: "0", ...env } });

test("empty BRANCH (e.g. github.event.repository.default_branch on a schedule run) fails visibly", () => {
  const { work } = repo();
  const r = run(work, { BRANCH: "" });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /::error title=Push::No branch/);
});

test("unknown branch: every attempt fails → exit 1 with an error annotation", () => {
  const { work } = repo();
  const r = run(work, { BRANCH: "does-not-exist" });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /::error title=Push::Could not push/);
});

test("normal run pushes the commit", () => {
  const { remote, work } = repo();
  const r = run(work, { BRANCH: "main" });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(git(remote, "log", "-1", "--format=%s", "main"), "bot commit");
});

test("sync-commit: commits when the import starts or stops failing, otherwise only for new posts or the heartbeat", () => {
  const { work } = repo();
  const file = path.join(work, "data/facebook-sync.json");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const recent = new Date().toISOString();
  fs.writeFileSync(file, JSON.stringify({ lastChecked: recent, lastCommitted: recent }));
  git(work, "add", "data/facebook-sync.json");
  git(work, "commit", "-m", "state");
  const decide = (...args) => spawnSync(process.execPath, [syncCommit, ...args], { cwd: work, encoding: "utf8" }).stdout.trim();

  fs.writeFileSync(file, JSON.stringify({ lastChecked: recent, lastCommitted: recent, lastOk: recent }));
  assert.equal(decide("--new-posts=false", "--heartbeat"), "skip", "a normal good run: nothing to commit");
  assert.equal(decide("--new-posts=true"), "commit");

  git(work, "checkout", "--", "data/facebook-sync.json");
  fs.writeFileSync(file, JSON.stringify({ lastChecked: recent, lastCommitted: recent, failingSince: recent, lastError: "HTTP 400" }));
  assert.equal(decide("--new-posts=false"), "commit", "the import started failing: record since when");
  git(work, "commit", "-am", "failing");
  fs.writeFileSync(file, JSON.stringify({ lastChecked: recent, lastCommitted: new Date().toISOString(), failingSince: recent, lastError: "HTTP 400 again" }));
  assert.equal(decide("--new-posts=false"), "skip", "still failing: no new commit");
  fs.writeFileSync(file, JSON.stringify({ lastChecked: recent, lastCommitted: recent, lastOk: recent }));
  assert.equal(decide("--new-posts=false"), "commit", "fixed: clear the failure");
});
