---
page: "projects-index"
title: "ჩვენი პროექტები"
subtitle: "ერთად განვახორციელოთ მომავლის პროექტები"
title_original_tag: "h1.font_6 (small label)"
subtitle_original_tag: "h1.font_0 (large display text) - the page had two h1"
nav_label: "პროექტები"
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
    - "button \"დეტალურად\""
  card_layout_original: "one row per project, thin separators: image left, title, small \"date, category\", outlined pill button right"
hidden_items:
  - what: "button \"VIEW ALL ARTICLES\" (anchor to About)"
    status: "template junk, hidden"
  - what: "editor placeholder texts of the data-bound card labels, never shown (the dataset overwrites them with the CMS date and category): \"სექტემბერი 2022, ტექნოლოგიები\", \"ოქტომბერი 2022, სტიპენდია\", \"ოქრომბერი 2021, სტიპენდია\" (sic, typo for ოქტომბერი), \"სექტემბერი 2022\" (also on Home and the item templates)"
    status: "not content; recorded because they show the event months the editor first had in mind (IT lab Sept 2022, Graneli Oct 2022, Batumi Oct 2021) - see the date question in CONTENT_CHANGES.md §4 item 13. Added by the completeness check."
cta: "site.yml -> cta_block"
---

<!-- section: hero -->
ჩვენი პროექტები

# ერთად განვახორციელოთ მომავლის პროექტები

<!-- section: list | project cards from content/projects/*.md -->

<!-- section: join-cta | shared block, see site.yml cta_block -->
## შემოგვიერთდი

![](media/images/nkfund-cover-logo.jpg)

თუ გსურთ შემოგვიერთდეთ ფონდის მიერ მხარდაჭერილი პროექტების განხორციელებაში, იხილეთ ქვემოთ მოცემული რეკვიზიტები.

[რეკვიზიტები](media/docs/bank-requisites-2022-12.pdf)

[ონლაინ გადარიცხვა](/donate/){.button .obsolete}
