# nkfund.world

Website of the **Nico Kvaratskhelia Fund** (ნიკო კვარაცხელიას ფონდი, brand **nkfund.**).
Georgian at `/`, English at `/en/`. Static site built with Eleventy, hosted on GitHub Pages,
edited with Pages CMS, with a daily import of the Fund's Facebook posts.

- Editors: see **[docs/EDITING.md](docs/EDITING.md)** (Georgian + English).
- Open content questions for the owner: **[docs/OWNER_REVIEW.md](docs/OWNER_REVIEW.md)**.
- Go-live, domain, e-mail and Meta set-up guides: [docs/GO-LIVE.md](docs/GO-LIVE.md), [docs/DOMAIN_TRANSFER.md](docs/DOMAIN_TRANSFER.md), [docs/EMAIL_ZOHO.md](docs/EMAIL_ZOHO.md), [docs/META_SETUP.md](docs/META_SETUP.md), [docs/HANDOVER.md](docs/HANDOVER.md).

> **Names used by the other guides.** There is **one** GitHub Actions workflow, `.github/workflows/site.yml`,
> shown in the Actions tab as **"Deploy site + Facebook sync"**. It is both the "deploy" workflow and the
> "Facebook sync" workflow mentioned in docs/GO-LIVE.md, docs/META_SETUP.md and docs/HANDOVER.md.
> The first Facebook import (the newest 24 posts) is its **Run workflow → facebook_import: `initial`** option.

## Stack and exact versions

| | Version |
|---|---|
| Node.js | **24 LTS** (`.nvmrc`; `engines: >=24`) |
| [Eleventy](https://www.11ty.dev/) `@11ty/eleventy` | **3.1.7** |
| `@11ty/eleventy-img` | **7.0.0** (sharp 0.35.5) |
| `markdown-it` | **14.3.3** (the version Eleventy itself uses; fuzzy links off: only explicit http(s) URLs become links) |
| `sharp` | **0.35.5** (the version eleventy-img uses; image sizes/edge colours, share pictures, Facebook images) |
| dev: `esbuild` | **0.28.2** (minifies the built CSS and JS; the sources stay readable) |
| dev: `html-validate` | **11.16.1** (`npm run check`: HTML validity and accessible markup) |
| `js-yaml` | **4.3.2** (the version Eleventy itself uses) |
| Facebook Graph API | **v26.0** (released 2026-07-29), pinned in `scripts/facebook-sync.mjs` |
| GitHub Actions (pinned to commit SHAs) | `actions/checkout` v7.0.1, `actions/setup-node` v7.1.0, `actions/configure-pages` v6.0.0, `actions/upload-pages-artifact` v5.0.0, `actions/deploy-pages` v5.0.1 |
| Fonts (SIL OFL 1.1, self-hosted WOFF2 subsets) | FiraGO 1.001 (300/400/500/600: text, menus, hero title), Noto Serif Georgian (variable 300–600: headings, quotes) |

All dependency versions are exact (`--save-exact`), and `package-lock.json` is committed. No CDN, analytics, tracker or third-party script is loaded at runtime.

## Quick start

```sh
nvm use            # Node 24
npm ci
npm start          # dev server on http://localhost:8080 (live reload)
npm run build      # production build into _site/
npm run test:ci    # code + schema tests (what CI runs; must pass after any Pages CMS edit)
npm test           # test:ci + test:migration (snapshots of the migrated content: developers only, see below)
npm run check      # post-build checks on _site/: links, h1, alt, noindex, redirects, external assets, file sizes
                   # (scripts/check-site.mjs) + HTML validity and accessible markup (html-validate, .htmlvalidate.json)
```

`FB_DEMO=true npm start` shows clearly-labelled **demo** Facebook posts (from `tests/fixtures/facebook-demo/`) so the
"Latest from Facebook" cards can be designed. This only works on the dev server; `npm run build` never shows them.

### Build environment variables

| Variable | Default | Preview (GitHub Pages project site) | Production |
|---|---|---|---|
| `PATH_PREFIX` | `/` | `/nkfund-website/` | `/` |
| `SITE_URL` | `https://nkfund.world` | `https://ernabgd.github.io` | `https://nkfund.world` |
| `PREVIEW` | (off) | `true` → `<meta name="robots" content="noindex, nofollow">` on every page and `robots.txt: Disallow: /` | `false` |

`npm run build:preview` builds the preview variant locally. Every build writes `_site/.build.json` (prefix, site URL,
preview flag), so `npm run check` checks the build with the settings it was made with (no need to repeat them).
`npx eleventy --output=<dir>` works too: processed images and share pictures go to `<dir>`, not `_site`.

How the path prefix works: templates always write root-relative URLs (`/about/`, `/assets/…`). Eleventy's
`HtmlBasePlugin` rewrites every URL in the generated HTML with `PATH_PREFIX` (`href`, `src`, `srcset`, `poster` …).
Non-HTML outputs (sitemap, robots.txt, web manifest) use the `absUrl` / `prefixUrl` filters; CSS uses relative URLs.

## Project layout

```
.pages.yml                Pages CMS configuration (GENERATED: edit scripts/generate-pages-yml.mjs, run `npm run cms:config`)
eleventy.config.js        build configuration
.github/workflows/site.yml  import Facebook posts → commit → test → build → deploy (one run)
content/                  editable content, one file = both languages
  projects/<slug>.md      title_ka/title_en, summary_*, body_*, date, event_date, category, cover, cover_alt_*, gallery[], draft
  news/<slug>.md          same without category
  facebook/<date>-<id>.md imported posts: id, date, link, show, title, images[] + message as the body
  pages/*.yml             home, about, projects, news, donate, join (testimonial), contact, privacy (page texts, ka + en)
data/                     global data (Eleventy data dir)
  site.yml                names, contacts, social links, descriptions
  ui.yml                  interface strings {ka, en}
  bank.yml                bank requisites (GEL/USD/EUR)
  redirects.csv           old Wix URLs → new URLs
  facebook-sync.json      {lastChecked, lastOk, lastNewPost, lastCommitted, failingSince?, lastError?} (written by CI)
src/
  _layouts/               base.njk (head, header, footer), item.njk (project/news page)
  _includes/              partials, macros.njk, logo.svg.njk
  pages/                  one template per page type; each paginates over the languages
  assets/                 css, js, fonts, img (logo, icons), video, docs, uploads (CMS media), facebook (imported images)
scripts/
  facebook-sync.mjs       Facebook Graph API import (see below)
  ci/sync-commit.mjs      commit decision + keep-alive heartbeat for the workflow
  ci/facebook-health.mjs  "has the Facebook import been failing for 7 days?" (feeds the facebook-health job)
  check-site.mjs          post-build checks (CI)
  verify-redirects.mjs    requests every old URL against a running server
  generate-pages-yml.mjs  writes .pages.yml
  lib/                    front matter, content loading, template filters
  migrate-content.mjs     one-time import from the Wix extraction (text archived in docs/archive/wix-2026-10/); do not re-run: content/ has been edited since
  sync-ui-strings.mjs     one-time: copied reviewed UI strings from the translation (docs/archive/wix-2026-10/content-en/ui.yml); re-running would undo later Pages CMS edits
  media/                  one-time media tools: prepare-media.mjs, encode-video.sh, build-fonts.py, build-icons.mjs
tests/                    node --test suites + fixtures (mock Graph API responses, demo posts)
  *.test.mjs              CI suite (npm run test:ci): helpers, schema, Pages CMS round-trip, Facebook import, CI scripts
  lib/checks.mjs          the content/schema checks, runnable against any copy of content/ and data/
  migration/              snapshots of the migrated content (npm run test:migration; not run by CI)
docs/archive/wix-2026-10/ text of the old Wix site, the content audit (CONTENT_CHANGES.md), translation sources,
                          media manifest and the original redirect list (the media files themselves: docs/GO-LIVE.md step 6)
```

### Bilingual routing

Every page template paginates over `langs` (`["ka", "en"]`) or over per-language item entries, and declares a
`route` (`about/`, `projects/<slug>/` …). `langUrl(route, lang)` gives `/about/` or `/en/about/`.
The layout emits `<html lang>`, a canonical URL, `hreflang` alternates (`ka`, `en`, `x-default` → Georgian),
and the language switcher links to the same route in the other language.

Content fields come in pairs (`title_ka` / `title_en`). The `loc` filter returns the requested language and falls back
to Georgian; the `m.text` / `m.prose` macros then mark the fallback with `lang="ka"` and a small
"(in Georgian)" note. Slugs are Latin and shared by both languages.

### Images and video

- Every `<img>` with a local `src` is processed at build time by `@11ty/eleventy-img` (transform plugin):
  AVIF + WebP + JPEG, widths 480/800/1200/1800 (or `eleventy:widths`), `width`/`height`, `loading="lazy"`
  by default. Templates must give a `sizes` attribute (or rely on `sizes="auto"` for lazy images) and an `alt`.
- Source images are kept ≤ 2400 px JPEG in the repo (`scripts/media/prepare-media.mjs` converted the 13–15 MB PNGs).
- Social preview images are made per item (1200 px JPEG) in `src/pages/pages.11tydata.js`.
- Videos (`scripts/media/encode-video.sh`, ffmpeg 8.1): `hero-loop.mp4` (the library clip re-cut as a seamless
  forward loop at real-frame half speed: the 60 fps source played at 30 fps, tail cross-faded into the head; 3.07 s,
  H.264, no audio, 246 KB), `film-720p.mp4` (1280×720 H.264 High + AAC 80k, two-pass, 24.4 MB, faststart) from the
  1080p master, plus WebP posters (`hero-poster.webp` = first frame of the loop; `film-poster.webp` = Nico on stage at
  1:26.5 of the film). No file in the repository is larger than 25 MB.
- The hero video has **no `autoplay` attribute**: `main.js` starts it unless the visitor prefers reduced motion or has
  Save-Data on, pauses it off-screen and in hidden tabs, and shows a 44 px pause/play button at every width whose
  `aria-label` swaps between pause and play (WCAG 2.2.2). Without JavaScript the poster is shown.

### Old URLs

GitHub Pages cannot send server redirects, so `src/pages/redirects.njk` writes a stub `index.html` at every old
path in `data/redirects.csv` (meta refresh + canonical + `location.replace`, all absolute URLs). Raw-Georgian and
percent-encoded rows collapse into one real UTF-8 directory; GitHub Pages decodes percent-encoded requests to it.
Rows whose old path is just the new path without the slash (`/about` → `/about/`) need no stub. The old bank-PDF
address serves the current PDF. Verify against any server:

```sh
SITE_URL=http://localhost:8765 npm run build
python3 -m http.server 8765 --directory _site &
node scripts/verify-redirects.mjs http://localhost:8765/      # 84/84 OK on 2026-10-20
```

## Facebook import

`scripts/facebook-sync.mjs` (Node ≥ 24; needs js-yaml and sharp, both already site dependencies):

```sh
FB_PAGE_ID=… FB_PAGE_TOKEN=… node scripts/facebook-sync.mjs            # since last check − 3 days (first run: 30 days)
FB_PAGE_ID=… FB_PAGE_TOKEN=… node scripts/facebook-sync.mjs --initial  # the newest 24 posts
FB_PAGE_ID=… FB_PAGE_TOKEN=… node scripts/facebook-sync.mjs --since=2026-01-01
```

- Calls `GET https://graph.facebook.com/v26.0/{page-id}/posts?fields=id,message,created_time,permalink_url,full_picture,attachments{media,subattachments,type,url}`
  and follows `paging.next`. Optional `FB_APP_SECRET` adds `appsecret_proof`; `FB_GRAPH_VERSION` overrides the version.
- Writes `content/facebook/<yyyy-mm-dd>-<id>.md` (date in Tbilisi time) with `show: true` for each **new** post and
  downloads its **first** image (the only one the site shows), scaled to ≤ 1600 px, to `src/assets/facebook/`
  (Facebook CDN links expire). Existing files are never rewritten, so an editor's `show: false` is never overwritten.
  Photo-only posts get the CMS label „ფოტო / Photo · <date>“. `--initial` imports the newest 24 posts.
- Writes `data/facebook-sync.json`: after a good run `lastChecked`, `lastOk`, `lastNewPost`; while the API fails
  `failingSince` (first failure, kept across runs) and `lastError`; other keys kept.
- Any API/network error → a warning (a GitHub Actions annotation in CI) and **exit code 0**: the build continues
  with the posts already in the repository. The token is never printed.
- **A token that stops working is noticed:** the workflow commits `failingSince` when the import starts (or stops)
  failing, and `scripts/ci/facebook-health.mjs` reports when it has failed for **7 days**; then the separate
  **"Facebook import health"** job fails (a red run, which GitHub e-mails about), while the site is still deployed.
- Home page: the 3 newest visible posts; News page: visible posts after the Fund's own news (limit in
  `content/pages/news.yml → facebook_limit`). With no visible post, a "Follow us on Facebook / Instagram" card is shown.
  Production never shows invented posts.
- Tests: `tests/facebook-sync.test.mjs` runs the script against mocked Graph responses (`tests/fixtures/graph/`).
- Graph API versions live about two years; v26.0 has no end date yet. Bump `GRAPH_VERSION` when Meta announces one.

## Deploying (GitHub Pages)

The workflow `.github/workflows/site.yml` ("Deploy site + Facebook sync") runs on every push to `main`, on
**Run workflow**, and daily at 05:00 UTC (09:00 Tbilisi). In one run it:

1. imports new Facebook posts (only if the `FB_PAGE_ID` and `FB_PAGE_TOKEN` secrets exist, and only on the default
   branch, so posts are never published without being committed; the secrets are given to that step only),
2. commits them with `GITHUB_TOKEN` (`scripts/ci/push.sh`: `git pull --rebase` + 3 attempts; the run **fails** with an
   error annotation if the commit cannot be pushed; only on the default branch),
3. runs `npm run test:ci`, builds with `PATH_PREFIX` / `SITE_URL` / `PREVIEW`, runs `npm run check`,
4. uploads the Pages artifact and deploys it (the `github-pages` environment only accepts the default branch, so a
   manual run from another branch builds but does not deploy),
5. if the Facebook import has been failing for 7 days, the separate **Facebook import health** job fails.

**Tests in CI never pin content.** `npm run test:ci` checks code and schema only, and must pass after any edit an
editor can make in Pages CMS (new items, changed titles, changed bank details, empty optional fields — Pages CMS
deletes empty values when it saves; `tests/cms-roundtrip.test.mjs` simulates exactly that). The snapshots of the
migrated content (project order, owner defaults, the exact bank details from the PDF) are in `tests/migration/`
(`npm run test:migration`) for developers; update them when the Fund approves a change.

Everything happens in one run because commits pushed with `GITHUB_TOKEN` do not start new workflow runs.
**Heartbeat:** GitHub disables scheduled workflows in a public repository after 60 days without activity, so
scheduled/manual runs commit `data/facebook-sync.json` (`lastCommitted`) at least every 25 days even without new posts.

One-time repository set-up:

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. **Settings → Secrets and variables → Actions**
   - *Secrets* (for the Facebook import, see docs/META_SETUP.md): `FB_PAGE_ID`, `FB_PAGE_TOKEN`, optional `FB_APP_SECRET`.
   - *Variables*: none are needed for the preview. By default `PATH_PREFIX` comes from `actions/configure-pages`
     (`/nkfund-website/` for the preview, `/` once the custom domain is set in Settings → Pages), and `PREVIEW` follows
     it (`true` under a sub-path, `false` at the root of the custom domain). When going live, set
     **`SITE_URL` = `https://nkfund.world`** (docs/GO-LIVE.md step 2); delete `PATH_PREFIX` / `PREVIEW` if you created
     them. `npm run check` fails a production build whose `SITE_URL` is not `https://`.
3. **Settings → Actions → General → Workflow permissions:** "Read and write permissions" are not needed (the job asks
   for `contents: write` itself), but a branch-protection rule on `main` must allow GitHub Actions to push.
4. With a custom workflow, GitHub ignores a `CNAME` file; the custom domain is set in Settings → Pages.

First Facebook import: **Actions → Deploy site + Facebook sync → Run workflow → facebook_import: initial**.

Note: crawlers only read `robots.txt` at the host root, so on the project-site preview the per-page
`noindex` meta tag is what keeps the preview out of search results.

## Pages CMS

`.pages.yml` is generated by `scripts/generate-pages-yml.mjs` (`npm run cms:config`; a test fails if it is stale).
Collections: News, Projects (both languages on one screen, rich-text Markdown bodies, cover + gallery with alt texts,
date, optional event date, draft flag; projects also have "Featured on the home page"), Facebook posts (list of
imported posts; "ჩანდეს საიტზე / Show on website" tick box and an optional image description in both languages;
create/rename/delete disabled — hide posts instead of deleting them, or the next import brings them back),
page files (home, about, projects, news, donate, the "Join us" band testimonial, contact, privacy) and settings (site,
interface text, bank details). Media: `src/assets/uploads` (→ `/assets/uploads`) and `src/assets/facebook`, limited to
jpg/jpeg/png/webp/avif/gif (+ pdf for uploads): Pages CMS's "image" category would also accept BMP/ICO/TIFF, which
the image pipeline cannot read. `settings.content.merge: true` keeps keys that are not in a form (e.g. `legacy`, `order`).
**Do not put YAML comments in CMS-edited files** (data/*.yml except redirects, content/**): Pages CMS rewrites the
whole file on save and drops them. Editing notes belong in the field descriptions (scripts/generate-pages-yml.mjs) or
in docs/EDITING.md.

`tests/pages-config.test.mjs` checks that every key in each content file has a CMS field, that every field the CMS marks
required is filled in, and that every `pages.<file>.<field>` the templates read is a CMS field. A missing key counts as
empty everywhere (templates and tests), because Pages CMS deletes empty values when it saves.

## Design

The final design is prototype C ("warm and human") on the current site's architecture, with the judges' grafts:

- **Home:** full-bleed dark hero (the Fund's library clip at low brightness, grain, frame lines with crosses,
  logo top-left, menu top-right, three-line title bottom-left, tagline, outlined pill CTA, pause button); Nico's quote
  on a full-bleed band in the sampled colour of his portrait's backdrop (`--blush: #cfbbb2`) so the photo dissolves into
  it; about statement + hairline numbers row (2022 · project count); goal + film (poster: Nico on stage) + the mission
  as a full-width statement; one featured project + cards; two news teasers; Facebook posts with a blue "Follow us"
  tile (or the follow card alone); the "Join us" band with all three currencies; footer with a giant faint wordmark.
  Inner pages end with a compact "Join us" band (IBAN + copy, bank and SWIFT, links to all details and the PDF).
- **Inner pages:** white header with hairline (solid black on dark pages once scrolled, compact 76 px), hairline frame
  lines on light sections (`.ruled`), square photos, radii ≤ 12 px, serif headings (`Noto Serif Georgian` 400),
  FiraGO text. Project/news pages have breadcrumbs, the title with an "At a glance" box beside it, the cover, the text
  (whole-paragraph quotes become blush pull-quotes), a lightbox gallery and a prev/next pager. The News index uses
  large date numerals; the Projects index uses numbered hairline rows.
- **Donate:** dark page with the six-column hairline grid; the IBAN (≈40 px, tabular figures) with a solid
  "Copy IBAN" button above the fold on desktop and within the first screen on phones; three step chips; the full
  bank card with ₾ / $ / € tabs (radio buttons: work without JS and with arrow keys), bilingual field labels, copy
  buttons with visible text and a "Copied" state (the IBAN is copied without spaces), intermediary banks for USD/EUR;
  honest note that card payment is unavailable; testimonial, PDF and e-mail cards in the same dark glass as the bank
  card (the IBAN stays the brightest thing on screen); print stylesheet.
- **Typography:** no `text-transform: uppercase` or letter-spacing on Georgian; labels are 14 px FiraGO 600 with a blue
  star and a hairline; nothing smaller than 14 px. Long Georgian words (12+ letters) in headings get soft hyphens at
  build time inside an inline-block (`shyHtml` filter in `scripts/lib/filters.mjs`), so a word is hyphenated only
  when it is wider than the line; headings use `text-wrap: balance`, paragraphs `pretty`.

## Accessibility and performance

WCAG 2.2 AA: skip link, landmarks, one `<h1>` per page, `lang`/`hreflang` on every language switch ("ქარ / EN" in the
header at every width, in the menu and in the footer), visible 2 px focus rings, 44 px targets, reduced motion and
Save-Data respected, pausable background video, alt text on every content image in both languages, text contrast
≥ 4.5:1 (muted text #5f5a55 on #faf8f5 = 6.4:1; on the dark bands #aaa39c on #0b0b0c = 7.9:1). The menu is a modal
dialog with a focus trap and Esc (role, aria-modal and aria-expanded are set by the script); copy results are announced
in a live region. Without JavaScript: the menu opens via `#menu:target` and the page behind it leaves the tab order,
currency tabs still work, copy buttons are hidden (CSS, `html.no-js`; they are in the HTML from the start, so nothing
shifts when the script loads), the hero shows its poster and the film has native controls. Nothing depends on
`main.js` to become visible: the reveal-on-scroll and fixed-header classes are added by the script itself, each part
runs on its own, and Safari ≤ 13 media-query listeners are supported. The film has an English subtitle track
(off by default because English subtitles are burned in) and a transcript below it; a Georgian transcript is pending
(docs/OWNER_REVIEW.md #18). The language switch's accessible name starts with its visible text (WCAG 2.5.3).

Measured on 2026-10-20 after the first review round (local server, uncompressed; GitHub Pages gzips HTML/CSS/JS):
home 480 KB on first load at 1440 px and at 390 px @3× excluding the 240 KB hero video (budget ≈ 600 KB; it includes
the full-resolution 1620 px portrait of Nico), donate 282–329 KB, a project page ≈ 287 KB. Fonts are 133–160 KB of
that (4 FiraGO weights + the serif); the minified CSS is 57 KB (≈ 13 KB gzipped) and the JS 7 KB. Images are lazy
below the fold, `sizes` match the drawn width (cover-cropped images: `scaleSizes` filter); there are no third-party
requests.

Also checked on 2026-10-20: a 320–1600 px width sweep (10 px steps) of every page type finds no word split without a
hyphen and no horizontal scrolling; html-validate passes on all 85 pages in both build modes; forced-colours mode
shows the selected currency and language.

## Media and licences

Only the Fund's own Wix uploads (ids `3f8517_…`) are used; no Wix stock or template media. Fonts are SIL OFL 1.1
(licence files in `src/assets/fonts/`). Icons and the favicon are drawn from the Fund's own logo.
