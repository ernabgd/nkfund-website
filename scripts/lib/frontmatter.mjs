// Minimal YAML front-matter reader/writer shared by the build and scripts/facebook-sync.mjs.
// Uses only js-yaml (already a dependency of Eleventy), so the sync script needs no extra packages.
import yaml from "js-yaml";

const FENCE = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;

/** Split "---\n<yaml>\n---\n<body>" into { data, body }. Files without front matter return { data: {}, body }. */
export function parseFrontMatter(text) {
  const source = String(text).replace(/^﻿/, "");
  const match = source.match(FENCE);
  if (!match) return { data: {}, body: source };
  const data = yaml.load(match[1]) ?? {};
  if (typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Front matter must be a YAML mapping");
  }
  return { data, body: source.slice(match[0].length) };
}

/** Serialise { data, body } back to a Markdown file with YAML front matter. */
export function stringifyFrontMatter(data, body = "") {
  const head = yaml.dump(data, { lineWidth: -1, noRefs: true, quotingType: '"', sortKeys: false });
  const text = String(body ?? "").replace(/\s+$/, "");
  return `---\n${head}---\n${text ? `\n${text}\n` : ""}`;
}

export function loadYaml(text) {
  return yaml.load(text);
}

export function dumpYaml(data) {
  return yaml.dump(data, { lineWidth: -1, noRefs: true, quotingType: '"', sortKeys: false });
}
