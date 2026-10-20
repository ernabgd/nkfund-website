// Pages CMS (.pages.yml) and the content files agree: every key in a content file has a form field (editors can see
// and change it), every required field is filled in, and the templates only read fields the CMS offers.
// A missing key counts as empty: Pages CMS deletes empty values when it saves (see tests/cms-roundtrip.test.mjs).
import { test } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkFileForms, checkCollections, checkTemplatesReadCmsFields, checkEverythingIsUsed } from "./lib/checks.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dirs = { root, code: root };

test(".pages.yml: no key in a page/settings file without a form field", () => checkFileForms(dirs));
test(".pages.yml: collection files have no unknown keys and fill every required field", () => checkCollections(dirs));
test("templates only read page fields that Pages CMS offers", () => checkTemplatesReadCmsFields(dirs));
test("every interface string (data/ui.yml) and every page/settings field is read by the templates", () => checkEverythingIsUsed(dirs));
