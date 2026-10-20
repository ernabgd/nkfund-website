---
page: "home"
title: "Niko Kvaratskhelia Foundation"
url_old: "/"
url_new: "/"
also_served_at_old:
  - "/home-1"
seo_original:
  title: "nkfund."
  description: ""
  og_image: "media/images/nkfund-cover-logo.jpg"
header_variant: "transparent over the dark hero (white logo + text)"
sections:
  - key: "hero"
    order: 1
    wix_component: "comp-lbp8ztkc1"
    hidden: false
    visible:
      desktop: true
      tablet: true
      mobile: true
    heading: "Niko Kvaratskhelia Foundation"
    heading_original_tag: "h2.font_2"
    subtitle: "Together, let’s bring the projects of the future to life"
    button:
      label: "Join us"
      href_new: "/donate/"
      href_old: "/donate"
    background_video:
      media_id: "3f8517_7af606ad453c4df0bc60811808651484"
      file: "media/video/home-hero-loop-480p.mp4"
      poster: "media/images/home-hero-video-poster.jpg"
      wix_title: "RPReplay_Final1670002160 2.mov"
      size: "886x646"
      duration_s: 1.87
      autoplay: true
      loop: true
      muted: true
      opacity: 0.3
      content: "young man reaching for a book on tall library shelves (screen recording clip)"
    background_overlay_original: "0da768_95dbd595356148718d5876246a20fe90.png (Wix pattern overlay, 256x256, not reusable) over section colour {color_15} plus colour layers"
    layout_original: "full-viewport dark hero; big heading bottom-left (3 lines on desktop), subtitle below, outlined pill button below that; header sits on top of the video"
  - key: "niko-quote"
    order: 2
    wix_component: "comp-lbp8ztdp1"
    hidden: false
    visible:
      desktop: true
      tablet: true
      mobile: true
    image:
      media_id: "3f8517_71a9148a02ff43458806f6ece507c68f~mv2.jpg"
      file: "media/images/home-niko-portrait.jpg"
      width: 1620
      height: 1080
      alt_original: ""
      wix_file_name: "7E69ACEC-C756-48FB-BEFC-0B2932D13325 2_edited.jpg"
      content: "portrait of Niko Kvaratskhelia in a cream hoodie with the red Feedc logo, pink background"
      crop_original: "shown as a tall portrait crop (about 451x720 on desktop, square on mobile)"
    quote_icon_original: "3962b0f46b2341e4a021fcb37f5f4ee3.svg (Wix vector-art \"Quotation mark\", not reusable - redraw)"
    quote_paragraphs_original_tag: "three h2.font_2 in italics (styled as a quote, not real headings)"
    attribution: "Niko Kvaratskhelia"
    layout_original: "photo left (desktop) / on top (tablet, mobile); quote mark, the three quote lines and the attribution on the right"
  - key: "our-goal"
    order: 3
    wix_component: "comp-lbpqob5b"
    hidden: false
    visible:
      desktop: true
      tablet: true
      mobile: true
    heading: "Our goal"
    heading_original_tag: "h2.font_2"
    video:
      media_id: "3f8517_aaa04b6517db4ced8e6d40a2c849fcac"
      file: "media/video/home-goal-video-480p.mp4"
      poster: "media/images/home-goal-video-poster.jpg"
      wix_title: "IMG_0721.MOV"
      player_title_original: "Your Video Title (unchanged Wix placeholder label)"
      duration_s: 202.58
      play: "click to play (Wix VideoPlayer)"
      downloaded_variant: "480p (854x480, 29.0 MB)"
      other_variants_on_wix:
        720p: "1280x720, 64.4 MB"
        1080p: "1920x1080, 137.6 MB"
      content: "3 min 22 s film about Niko and the foundation: interviews (family, friends, Forbes 30 Under 30 peers, Jgali school), English subtitles burned in, nkfund. watermark; poster = nkfund. logo on grey"
    paragraph_order_note: "Desktop: heading, paragraph 1, paragraph 2 in the left column, video on the right. Tablet/mobile: heading, paragraph 1, video, then paragraph 2 (Wix used two copies of paragraph 2, one per breakpoint; texts identical after whitespace normalisation)."
    hidden_items:
      - what: "button \"WORK WITH US\" -> /careers (template page)"
        status: "template junk, hidden on all breakpoints"
      - what: "\"გაიგე მეტი\" (Learn more) + arrow icon 11062b_099a271c….svg, no link"
        status: "hidden on all breakpoints"
      - what: "second (background) media player with the same IMG_0721.MOV video"
        status: "hidden on all breakpoints"
  - key: "funded-projects"
    order: 4
    wix_component: "comp-lbprqfl1 (heading) + comp-lbp8ztgo1 (cards)"
    hidden: false
    visible:
      desktop: true
      tablet: true
      mobile: true
    heading: "Funded projects"
    heading_original_tag: "h2.font_2"
    source: "Wix dataset \"Projects dataset\" on collection Projects, pageSize 3, default sort -> the 3 most recently created projects"
    items_shown_original:
      - "cooperation-with-supergmiri"
      - "terenti-graneli-scholarship"
      - "batumi-tragedy-scholarship"
    item_not_shown: "jgali-school-it-lab (4th, oldest)"
    cards_as_displayed:
      - slug: "cooperation-with-supergmiri"
        title: "Collaboration with the Supergmiri platform"
        date_category_display: "26 Feb 2023, Scholarship"
        image: "media/images/project-supergmiri-cover.jpg"
        href_new: "/projects/cooperation-with-supergmiri/"
      - slug: "terenti-graneli-scholarship"
        title: "Terenti Graneli Scholarship announced"
        date_category_display: "18 Dec 2022, Scholarship"
        image: "media/images/project-graneli-scholarship-cover.jpg"
        href_new: "/projects/terenti-graneli-scholarship/"
      - slug: "batumi-tragedy-scholarship"
        title: "Scholarship for two children affected by the 2021 Batumi tragedy"
        date_category_display: "18 Dec 2022, Scholarship"
        image: "media/images/project-batumi-scholarship-cover.jpg"
        href_new: "/projects/batumi-tragedy-scholarship/"
    cards_note: "titles shown with the spelling fixes made in content/projects/*.md (the canonical place for these strings)"
    card_fields:
      - "cover image (alt = title)"
      - "title (p.font_7)"
      - "date (MEDIUM_DATE of CMS creation date) + \", \" + category"
      - "button \"Read more\" -> item page"
    card_layout_original: "one row per project, separated by thin lines: image left, title middle, \"date, category\" small text, outlined pill button right"
    all_projects_button:
      label: "All projects"
      href_new: "/projects/"
      href_old: "/ourprojects"
    all_projects_button_visible:
      desktop: true
      tablet: false
      mobile: false
  - key: "join-cta"
    order: 5
    wix_component: "comp-lbp8ztjt (heading) + comp-lbp8ztf9 (block)"
    hidden: false
    visible:
      desktop: true
      tablet: true
      mobile: true
    shared_block: "site.yml -> cta_block"
    left_image:
      media_id: "3f8517_b4fdd6c7e2ff4ae4bd1249832379a5b6~mv2.jpg"
      file: "media/images/nkfund-cover-logo.jpg"
      alt_original: ""
    right_background_original: "11062b_9b292a91e9104829834121f390a5ef84~mv2.jpg (Wix stock \"Dark-Background\", not reusable)"
    pdf_link:
      label: "Bank details"
      href_old: "/_files/ugd/3f8517_b79d39693f294d9d862ff0cfbb0b4d8e.pdf"
      href_new: "media/docs/bank-requisites-2022-12.pdf"
      icon_original: "11062b_5d1c6a21c4854eedae907cb106d52b91.svg (Wix stock download icon)"
    button:
      label: "Online transfer"
      href_new: "/donate/"
      href_old: "/donate"
    button_status: "obsolete (online payment closed)"
    card_logos:
      file: "media/svg/payment-card-logos.svg"
      media_id: "3f8517_2046bb44eaac43308033406deb68d542.svg"
      wix_title: "payment_logos_color.svg"
      status: "obsolete"
      href_old: "/_files/ugd/3f8517_b79d39693f294d9d862ff0cfbb0b4d8e.pdf"
  - key: "mission-hidden"
    order: null
    wix_component: "comp-lbp8zt8u"
    hidden: true
    visible:
      desktop: false
      tablet: false
      mobile: false
    heading: "Mission"
    heading_original_tag: "h2.font_2"
    paragraph: "The foundation’s mission is to serve and support projects that reflect the 17 Sustainable Development Goals. Innovative projects, in particular, will be supported."
    template_junk_in_same_section:
      - "h3 \"01 TECHNOLOGY\""
      - "h3 \"02 FEATURES\""
      - "h3 \"03 DEPLOYMENT\""
      - "image c837a6_11b93c2a47e8455886b2e5ce6f2a7a96~mv2.jpg (template, not reusable)"
      - "background video 11062b_f452d5094c724b239043f2a01532d332 \"Fashion Designer\" (Wix stock, not reusable)"
    note: "Real foundation text, hidden by CSS at every breakpoint but still in the page source."
  - key: "sdg-grid-hidden"
    order: null
    wix_component: "comp-lbp8ztla"
    hidden: true
    visible:
      desktop: false
      tablet: false
      mobile: false
    heading: "Our mission"
    heading_original_tag: "h2.font_2"
    paragraph: "The foundation’s mission is to serve and support projects that reflect the 17 Sustainable Development Goals. Innovative projects, in particular, will be supported."
    paragraph_note: "identical to the mission-hidden paragraph"
    cards_in_original_order:
      - number: 1
        label: "No poverty"
        label_lines_original:
          - "არანაირი"
          - "სიღარიბე"
        image_original: "11062b_63330aeb30c8488a9226f717267a21df~mv2.jpeg (\"Poor Kids Laughing\", Wix stock, not reusable)"
      - number: 2
        label: "Zero hunger"
        label_lines_original:
          - "ნული"
          - "შიმშილი"
        image_original: "11062b_7683f8d0e4224aa396deaa3dc2efe5c6~mv2.jpg (\"Happy Dining\", Wix stock, not reusable)"
      - number: 3
        label: "Good health and well-being"
        label_lines_original:
          - "ჯანმრთელობა და კეთილდღეობა"
        image_original: "11062b_80049b6eac78423199903c89c49a4448~mv2.jpg (\"Adult Ballet Class\", Wix stock, not reusable)"
      - number: 4
        label: "Quality education"
        label_lines_original:
          - "ხარისხიანი"
          - "განათლება"
        image_original: "11062b_62be8c88f38e40d3bf2e2c59ab2366b7~mv2.jpg (\"Woman in Library\", Wix stock, not reusable)"
      - number: 6
        label: "Clean water and sanitation"
        label_lines_original:
          - "სუფთა წყალი და"
          - "სანიტარია"
        image_original: "11062b_6c828b2f26204541b03871ad2d19e4eb~mv2.jpeg (\"Enjoying Clean Water\", Wix stock, not reusable)"
      - number: 7
        label: "Affordable and clean energy"
        label_lines_original:
          - "ხელმისაწვდომი და სუფთა ენერგია"
        image_original: "11062b_f2b95b9a585c465cb32874fde7df77e8~mv2.jpg (\"Solar Panels\", Wix stock, not reusable)"
      - number: 8
        label: "Decent work and economic growth"
        label_lines_original:
          - "ღირსეული სამუშაო და ეკონომიკური ზრდა"
        image_original: "11062b_ded07f67954e47869af24c9be57d646d~mv2.jpg (\"Colleagues at Work\", Wix stock, not reusable)"
      - number: 9
        label: "Industry, innovation and infrastructure"
        label_lines_original:
          - "ინდუსტრია, ინოვაცია და ინფრასტრუქტურა"
        image_original: "11062b_77c2f9c72ec545aca47e38b4d09a68e7~mv2.jpg (\"Electric Car Charging Station\", Wix stock, not reusable)"
      - number: 10
        label: "Good health and well-being"
        label_lines_original:
          - "ჯანმრთელობა და კეთილდღეობა"
        image_original: "11062b_80049b6eac78423199903c89c49a4448~mv2.jpg (\"Adult Ballet Class\", Wix stock, not reusable)"
      - number: 11
        label: "Good health and well-being"
        label_lines_original:
          - "ჯანმრთელობა და კეთილდღეობა"
        image_original: "11062b_80049b6eac78423199903c89c49a4448~mv2.jpg (\"Adult Ballet Class\", Wix stock, not reusable)"
      - number: 5
        label: "Gender equality"
        label_lines_original:
          - "გენდერული"
          - "თანასწორობა"
        image_original: "11062b_a350751b1f38417197db3b8eea3b79a7~mv2.jpg (\"All Gender Restroom\", Wix stock, not reusable)"
    background_video_original: "11062b_f6724cd6c55343cbaf5a291912c524f2 \"Book Club\" (Wix stock, not reusable)"
    velo_note: "Home page Velo code scrolled this grid as a ticker (#runningGoals) with wix-animations."
    content_errors:
      - "cards 10 and 11 repeat the label of goal 3 (ჯანმრთელობა და კეთილდღეობა) instead of goal 10 (reduced inequalities) and goal 11 (sustainable cities)"
      - "goal 5 is placed last"
      - "goals 12-17 are missing although the text says 17 goals"
      - "images are Wix stock photos"
    note: "Real but unfinished content, hidden at every breakpoint. Not corrected - see CONTENT_CHANGES.md \"Needs owner decision\"."
footer: "site.yml -> footer"
translation:
  language: "en"
  source_file: "content/home.md"
  translated_on: "2026-10-20"
  status: "draft translation from the Georgian; to be reviewed by the foundation"
  conventions: "content-en/README.md; names and terms: content-en/GLOSSARY.md"
  notes:
    - "Hero subtitle: the Georgian is a first-person-plural exhortation (literally ‘let us carry out the projects of the future together’); rendered ‘Together, let’s bring the projects of the future to life’."
    - "Niko’s quote is first-person speech; translated plainly. Set it upright, not in italics."
    - "‘Our goal’ paragraph 2: the Home wording (‘…მსოფლიო დღის წესრიგია’) and the About wording (‘…წესრიგშია’) both become ‘now on the world’s agenda’ (CONTENT_CHANGES §4.7)."
    - "Mission paragraph: ‘მოემსახუროს/ხელი შეუწყოს’ = ‘serve and support’; ‘შეიცავს’ (literally ‘contain’) = ‘reflect’. The Georgian has no final full stop; the English adds one."
    - "SDG labels: the English labels are the official UN English names of the goals that the Georgian labels translate. Cards 10 and 11 repeat goal 3, exactly as in the Georgian (content error, CONTENT_CHANGES §4.6)."
    - "Card dates (‘26 Feb 2023’, ‘18 Dec 2022’) are the English form of the CMS creation dates the old site showed."
  owner_defaults:
    mission_section: "publish (heading ‘Mission’ / ‘მისია’, paragraph as translated above)"
    sdg_grid: "only with official UN Georgian goal names; candidate names and sources in ui.yml -> sdg (the two UN sources found disagree; see GLOSSARY.md)"
    hero_extra_strings: "ui.yml -> home.hero_mission and home.hero_secondary"
    join_cta: "drop the ‘Online transfer’ button and the card logos; use ui.yml -> cta_block"
    footer_copyright: "© 2022–{year} Niko Kvaratskhelia Foundation (ui.yml -> footer.copyright)"
---

<!-- section: hero | visible: desktop, tablet, mobile -->
# Niko Kvaratskhelia Foundation

Together, let’s bring the projects of the future to life

[Join us](/donate/){.button}

<!-- section: niko-quote | visible: desktop, tablet, mobile -->
![](media/images/home-niko-portrait.jpg)

> I often think about how lucky we are — the small percentage of young people who have the opportunity to receive a quality education.
>
> I think a lot about the children who don’t even know what is happening in the world.
>
> I have so many ideas about this. I want to create projects that involve young people who live in the regions.

Niko Kvaratskhelia

<!-- section: our-goal | visible: desktop, tablet, mobile -->
## Our goal

The foundation’s aim is to follow Niko’s vision and to help young people realise their potential. To this end, the foundation will support innovative projects and education-focused initiatives.

Niko was a person of global vision, and his values were in line with the 17 Sustainable Development Goals that are now on the world’s agenda. Accordingly, Niko’s foundation will also serve the Sustainable Development Goals, so that young people can create a better and more sustainable future.

![video](media/video/home-goal-video-480p.mp4){poster=media/images/home-goal-video-poster.jpg}

<!-- section: funded-projects | visible: desktop, tablet, mobile | cards come from content-en/projects/*.md (3 newest) -->
## Funded projects

- [Collaboration with the Supergmiri platform](/projects/cooperation-with-supergmiri/) — 26 Feb 2023, Scholarship — [Read more](/projects/cooperation-with-supergmiri/){.button}
- [Terenti Graneli Scholarship announced](/projects/terenti-graneli-scholarship/) — 18 Dec 2022, Scholarship — [Read more](/projects/terenti-graneli-scholarship/){.button}
- [Scholarship for two children affected by the 2021 Batumi tragedy](/projects/batumi-tragedy-scholarship/) — 18 Dec 2022, Scholarship — [Read more](/projects/batumi-tragedy-scholarship/){.button}

[All projects](/projects/){.button}

<!-- section: join-cta | visible: desktop, tablet, mobile | shared block, see site.yml cta_block -->
## Join us

![](media/images/nkfund-cover-logo.jpg)

If you would like to join us in carrying out the projects the foundation supports, please see the bank details below.

[Bank details](media/docs/bank-requisites-2022-12.pdf)

[Online transfer](/donate/){.button .obsolete}

<!-- section: mission-hidden | hidden: true (CSS-hidden at every breakpoint on the Wix site; owner default: publish) -->
## Mission

The foundation’s mission is to serve and support projects that reflect the 17 Sustainable Development Goals. Innovative projects, in particular, will be supported.

<!-- section: sdg-grid-hidden | hidden: true (labels as on the Wix site, incl. its errors; corrected list in ui.yml -> sdg) -->
## Our mission

The foundation’s mission is to serve and support projects that reflect the 17 Sustainable Development Goals. Innovative projects, in particular, will be supported.

- 1 — No poverty
- 2 — Zero hunger
- 3 — Good health and well-being
- 4 — Quality education
- 6 — Clean water and sanitation
- 7 — Affordable and clean energy
- 8 — Decent work and economic growth
- 9 — Industry, innovation and infrastructure
- 10 — Good health and well-being
- 11 — Good health and well-being
- 5 — Gender equality
