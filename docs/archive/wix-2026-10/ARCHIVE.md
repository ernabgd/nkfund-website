# Archive of the old Wix site (extracted 20 October 2026)

This folder keeps the **text** of the extraction that the new site was built from, so it survives when the Wix plan is
cancelled. It is a record: the website does not read anything from here, and nothing here should be edited.

- `README.md`: what the extraction contains and its conventions (paths in it are relative to the original `source/` folder).
- `CONTENT_CHANGES.md`: every difference from the published Wix text, and §4 "Needs owner decision".
- `content/`, `content-en/`: the Georgian texts as published (with the certain typo fixes) and the reviewed English
  translation, glossary, alt texts and interface strings.
- `bank.yml`, `raw/bank-pdf-text.txt`: the bank details, transcribed from the bank's PDF and verified.
- `redirects.csv`, `raw/sitemaps/`: the old addresses (the site uses `data/redirects.csv`).
- `media/manifest.json`: every foundation-owned photo and video on the old site, with sizes, checksums and where it was used.

**Not in the repository** (too large, 237 MB): the photo and video files themselves, the raw Wix page data and the
extraction scripts. They are in `nkfund-wix-source-2026-10-20.zip` (SHA-256
`1340012273b3dcb5a64cda2ede6551b25854b7274819e8124d2a5ed37038db75`), to be uploaded as a GitHub release asset
(tag `wix-archive-2026-10`) before Wix is cancelled: see docs/GO-LIVE.md, step 6.
