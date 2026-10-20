---
page: "news-index"
title: "News"
subtitle: "Discover the foundation’s news and initiatives"
title_original_tag: "h2.font_2"
subtitle_original_tag: "p.font_8"
nav_label: "News"
url_old: "/news"
url_new: "/news/"
also_served_at_old:
  - "/news-1 (\"News1\" list with 5 template placeholders)"
  - "/news3 (blank)"
  - "/copy-of-news (blank)"
seo_original:
  title: "News - სიახლეები"
  description: ""
  keywords_configured: "ნიკო კვარაცხელია, ფონდი"
  keywords_note: "set in the Wix SEO settings of the /news dynamic page (router config); Wix did not output it as a meta tag. Added by the completeness check."
header_variant: "light"
list:
  source: "content/news/*.md"
  order_original:
    - "memorandum-with-energia"
    - "mothers-day-event-2023"
  order_rule: "newest first"
  card_fields:
    - "cover image (alt = title, links to item)"
    - "title (h3.font_3)"
    - "date (LONG_DATE)"
    - "summary (shortDescription)"
    - "button \"Read more\""
  card_layout_original: "image left, text right; one card per row"
cta: "site.yml -> cta_block"
translation:
  language: "en"
  source_file: "content/news/_index.md"
  translated_on: "2026-10-20"
  status: "draft translation from the Georgian; to be reviewed by the foundation"
  conventions: "content-en/README.md; names and terms: content-en/GLOSSARY.md"
  notes:
    - "Subtitle ‘გაეცანით ფონდის სიახლეებს და ინიციატივებს’ (literally ‘get to know the foundation’s news and initiatives’) is rendered ‘Discover the foundation’s news and initiatives’."
---

<!-- section: hero -->
# News

Discover the foundation’s news and initiatives

<!-- section: list | news cards from content-en/news/*.md -->

<!-- section: join-cta | shared block, see site.yml cta_block -->
## Join us

![](media/images/nkfund-cover-logo.jpg)

If you would like to join us in carrying out the projects the foundation supports, please see the bank details below.

[Bank details](media/docs/bank-requisites-2022-12.pdf)

[Online transfer](/donate/){.button .obsolete}
