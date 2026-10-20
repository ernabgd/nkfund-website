# nkfund.world: source content

Content and media extracted from the live Wix Studio site https://www.nkfund.world on 2026-10-20, for the static rebuild. This folder is the working copy of the content. The Wix site is only the fallback.

## What is here

```
source/
  site.yml               org names (ka/en), taglines, header/nav, footer, shared "join us" block, button labels, SEO originals
  bank.yml               bank requisites for GEL / USD / EUR, transcribed exactly from the bank PDF
  CONTENT_CHANGES.md     every difference from the published text (spelling fixes, whitespace) + "Needs owner decision"
  redirects.csv          old_path,new_path for all 40 sitemap URLs + unlisted/template pages (raw Georgian and %-encoded forms)
  content/
    home.md              all Home sections in visual order, incl. hidden mission + SDG grid (hidden: true)
    about.md  donate.md  terms.md  contact.md
    projects/_index.md   "Our projects" list page
    projects/<slug>.md   cooperation-with-supergmiri, terenti-graneli-scholarship, batumi-tragedy-scholarship, jgali-school-it-lab
    news/_index.md       news list page
    news/<slug>.md       memorandum-with-energia, mothers-day-event-2023
  media/
    manifest.json        every file: id, size, bytes, sha256, where used, alt/caption, description; plus not_reusable list
    images/ svg/ video/ docs/
  raw/                   unmodified Wix data (page JSON, CMS items, sitemaps, PDF text layer) + the extraction scripts
```

## Conventions in the Markdown files

- **Front matter** (YAML between `---` lines) holds the structured data: titles, dates, slugs, media, buttons, visibility, layout notes and the old URLs. The **body** holds the readable text in visual order.
- `<!-- section: key | … -->` comments mark the sections. They match `sections[].key` in the front matter.
- `hidden: true` is real foundation text that the Wix site hid with CSS on every breakpoint. It is kept for the record. Publishing it is the owner's decision.
- `visible: {desktop, tablet, mobile}` shows where an element was shown on Wix. Some elements were hidden on some breakpoints only.
- Buttons are written `[label](/new-url/){.button}`. `{.button .obsolete}` marks the online-payment button, which should be removed.
- Media paths are relative to `source/`, for example `media/images/home-niko-portrait.jpg`. Each file's Wix media id is listed in the front matter and in `media/manifest.json`.
- `<br>` is a hard line break that the original kept inside a paragraph.
- Fields named `original_*`, `*_original`, `wix_*` and `duplicate_variants` keep the old spelling on purpose: slugs are addresses, and these fields are historical records. All other text has the spelling fixes from CONTENT_CHANGES.md applied.
- `title_en_working` and `name_en` are working translations. They do not appear on the site.

## New URL scheme

`/`, `/about/`, `/projects/`, `/projects/<slug>/`, `/news/`, `/news/<slug>/`, `/donate/`, `/contact/`, `/privacy/` (from old `/terms`). See `redirects.csv`.

## Things builders must know

- **Donations.** Online card payment is gone (the owner says the provider closed the account). Show the bank details from `bank.yml` as text: IBAN GE93BG0000000533757447 (GEL, USD and EUR), with the PDF as a download. Remove the Wix payment form, the "ონლაინ გადარიცხვა" button and the card logos. The owner still needs to confirm that the account is active.
- **There are no real contact details** on the old site. See `content/contact.md` for what the owner must supply.
- **Stock and template media cannot be reused.** Only ids that start `3f8517_` are the foundation's own uploads, and only those were downloaded. Ids that start `11062b_`, `0446d4_`, `c837a6_`, `84770f_` and other Wix library ids are Wix-licensed. They are listed under `media/manifest.json → not_reusable` and were never downloaded. This covers the dark-blue background images, the icons and the hidden SDG photos. Replace them with CSS or your own art.
- **Media weight.** The five Mother's Day PNGs are 13–15 MB phone photos; convert them to WebP/AVIF/JPEG. The goal film is the 480p Wix variant (854×480, 29 MB, 3 min 22 s); re-encode it or host it externally. Wix also serves the same film at 1080p (1920×1080, 138 MB, checked 2026-10-20): `https://video.wixstatic.com/video/3f8517_aaa04b6517db4ced8e6d40a2c849fcac/1080p/mp4/file.mp4`. Use that as the master for any re-encode (see `media/manifest.json`). The hero loop is 886×646 and 1.9 s (480p is the best Wix has). ffmpeg 8.1.2 is available on this machine.
- **Typos** are fixed only where the fix is certain; the rest are listed in CONTENT_CHANGES.md §4 for the owner. Known wrong content (for example the Graneli quote on the Batumi page) was **not** moved.
- **Dates.** Projects show the CMS creation date, as the old site did (`date`, `date_display_original`). The real event dates are in `event_date`. News items use their `date` field.
