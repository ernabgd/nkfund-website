# content-en: English counterpart of the source content

This folder holds the English translation of `source/content/`, `site.yml` and `bank.yml` (2026-10-20), plus the interface strings in both languages.

## Files

```
content-en/
  home.md about.md donate.md contact.md terms.md
  projects/_index.md  projects/<slug>.md   (same 4 slugs as content/projects)
  news/_index.md      news/<slug>.md       (same 2 slugs as content/news)
  site.yml            English counterpart of source/site.yml
  bank.yml            English counterpart of source/bank.yml (account data unchanged)
  ui.yml              ALL interface strings, ka + en (nav, buttons, footer, donate/copy, Facebook, 404, privacy draft, SEO, dates, SDG, CMS labels)
  media-alt.yml       alt texts, ka + en, for every reusable image
  GLOSSARY.md         names, terms, style, uncertain renderings
```

## How the files mirror the Georgian

- **Same file names, same keys.** Each English file has every front-matter key of its Georgian counterpart. A check script confirmed this on 2026-10-20 (0 missing keys). Each file adds one extra key, `translation:`, which holds the translator's notes and `owner_defaults`.
- **Translated:** human-text values, e.g. `title`, `subtitle`, `summary`, `heading`, `label`, `alt`, `text`, `paragraph`, card titles, categories and the Markdown body.
- **Unchanged on purpose:** ids, dates, media paths, `href_*`, `url_*`, slugs, and every historical field: `*_original`, `original_*`, `wix*`, `duplicate_variants`, `seo_original`, `title_en_working`, and builder notes that quote Georgian.
- **Links stay language-neutral.** Body links are written `/donate/`, `/projects/<slug>/`, as in the Georgian files. The build adds the `/en/` prefix (and the `/nkfund-website/` path prefix for the preview).
- **Faithful first.** The Markdown files translate the Georgian **as it stands**, including the things the owner defaults change: the misplaced quote on the Batumi page, "announced" in the Graneli title, and the online-form clause in the Donate intro. `ui.yml` already has the defaults applied. Each affected file names its defaults under `translation.owner_defaults`.

## Applying the owner defaults (both languages)

| Default | Georgian | English |
|---|---|---|
| Graneli title without "announced" | ტერენტი გრანელის სახელობის სტიპენდია | Terenti Graneli Scholarship |
| Move Tea Karchava's quote from Batumi to Graneli (append after the existing body) | the body of `content/projects/batumi-tragedy-scholarship.md` | the body of `content-en/projects/batumi-tragedy-scholarship.md` (also in `translation.owner_defaults.body_append_en` of the Graneli file) |
| Batumi page keeps only title + summary | (no new text) | (no new text) |
| Publish the mission paragraph | home.md → `mission-hidden` | home.md → `mission-hidden` ("Mission") |
| SDG grid only with official UN Georgian names | ui.yml → `sdg` (candidate list, sources disagree; GLOSSARY §6) | ui.yml → `sdg` |
| Event dates where known | სექტემბერი, 2022 (IT lab) · ოქტომბერი, 2022 (Graneli) · დეკემბერი, 2022 (Energia memorandum) · 2 მარტი, 2023 (Mother's Day) | September 2022 · October 2022 · December 2022 · 2 March 2023 |
| Footer year range | © 2022–{year} ნიკო კვარაცხელიას ფონდი | © 2022–{year} Niko Kvaratskhelia Foundation |
| Donate intro without the online form | ui.yml → `donate.intro` (the shared sentence, unchanged) | ui.yml → `donate.intro` |
| No online payment | remove „ონლაინ გადარიცხვა“ and the card logos | remove "Online transfer" and the card logos |
| Contacts | ui.yml → `social`, `contact`, `footer` | same |
| Privacy notice (draft) | ui.yml → `privacy` | ui.yml → `privacy` |

## Review status

- The English is a draft for the foundation to review.
- A separate AI reviewer agent (not the translator, and not a native-speaker proof-read) reviewed it on 2026-10-20, sentence by sentence against the Georgian. The 17 corrections are listed in GLOSSARY.md §8 "Review log". They were also made in the generator data (`en_text.py`), so re-running `make_en.py` keeps them.
- Strings marked `src: new` in `ui.yml`, and all of `media-alt.yml`, are newly written Georgian. A native proof-reader should check them before launch.
- Open questions about names (Energia, the director's name, "initiative group", "the boy of the future") are listed in GLOSSARY.md §7.
