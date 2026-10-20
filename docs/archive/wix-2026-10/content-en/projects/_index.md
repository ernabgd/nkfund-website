---
page: "projects-index"
title: "Our projects"
subtitle: "Together, let’s bring the projects of the future to life"
title_original_tag: "h1.font_6 (small label)"
subtitle_original_tag: "h1.font_0 (large display text) - the page had two h1"
nav_label: "Projects"
url_old: "/ourprojects"
url_new: "/projects/"
also_served_at_old:
  - "/ourprojects-1 (test copy titled \"news test\")"
  - "/projects (Wix \"Projects (All)\" dynamic page, blank)"
  - "/blank-2 (\"Projects\", protected template page)"
seo_original:
  title: "პროექტები | nkfund."
  description: ""
header_variant: "light"
list:
  source: "content/projects/*.md"
  order_original:
    - "cooperation-with-supergmiri"
    - "terenti-graneli-scholarship"
    - "batumi-tragedy-scholarship"
    - "jgali-school-it-lab"
  order_rule: "newest first (CMS order field descending / creation date descending)"
  card_fields:
    - "cover image (alt = title)"
    - "title"
    - "date + \", \" + category"
    - "button \"Read more\""
  card_layout_original: "one row per project, thin separators: image left, title, small \"date, category\", outlined pill button right"
hidden_items:
  - what: "button \"VIEW ALL ARTICLES\" (anchor to About)"
    status: "template junk, hidden"
  - what: "editor placeholder texts of the data-bound card labels, never shown (the dataset overwrites them with the CMS date and category): \"სექტემბერი 2022, ტექნოლოგიები\", \"ოქტომბერი 2022, სტიპენდია\", \"ოქრომბერი 2021, სტიპენდია\" (sic, typo for ოქტომბერი), \"სექტემბერი 2022\" (also on Home and the item templates)"
    status: "not content; recorded because they show the event months the editor first had in mind (IT lab Sept 2022, Graneli Oct 2022, Batumi Oct 2021) - see the date question in CONTENT_CHANGES.md §4 item 13. Added by the completeness check."
cta: "site.yml -> cta_block"
translation:
  language: "en"
  source_file: "content/projects/_index.md"
  translated_on: "2026-10-20"
  status: "draft translation from the Georgian; to be reviewed by the foundation"
  conventions: "content-en/README.md; names and terms: content-en/GLOSSARY.md"
  notes:
    - "Eyebrow ‘ჩვენი პროექტები’ = ‘Our projects’; nav label ‘პროექტები’ = ‘Projects’; headline = the site tagline."
---

<!-- section: hero -->
Our projects

# Together, let’s bring the projects of the future to life

<!-- section: list | project cards from content-en/projects/*.md -->

<!-- section: join-cta | shared block, see site.yml cta_block -->
## Join us

![](media/images/nkfund-cover-logo.jpg)

If you would like to join us in carrying out the projects the foundation supports, please see the bank details below.

[Bank details](media/docs/bank-requisites-2022-12.pdf)

[Online transfer](/donate/){.button .obsolete}
