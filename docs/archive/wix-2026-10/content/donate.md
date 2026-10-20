---
page: "donate"
title: "შემოგვიერთდი"
url_old: "/donate"
url_new: "/donate/"
also_served_at_old:
  - "/donate-1 (\"შემოგვიერთდი თეთრი\", protected, blank)"
  - "/donate-1-1 (\"პროექტები dark\", protected, blank)"
seo_original:
  title: "შემოგვიერთდი | nkfund."
  description: ""
header_variant: "transparent over a dark blue gradient background"
background_original: "84770f_b313302e436740449d14795a7ac0b832~mv2.jpg (Wix template image, dark blue glow - NOT reusable; recreate with CSS gradient)"
restructure:
  status: "Online payment (card) is no longer available - the owner says the payment provider closed the account. Bank transfer using the requisites is enough."
  keep:
    - "heading + headline"
    - "intro sentence (see Needs owner decision about its \"online form\" clause)"
    - "bank details: show as plain text from bank.yml for GEL / USD / EUR, with copy-to-clipboard for the IBAN, plus the PDF download"
  remove:
    - "\"გადარიცხვის ფორმა\" Wix payment form"
    - "button \"ონლაინ გადარიცხვა\" and card logos on all pages"
sections:
  - key: "hero"
    order: 1
    visible:
      desktop: true
      tablet: true
      mobile: true
    label: "შემოგვიერთდი"
    label_original_tag: "h1.font_6 (small label above the headline)"
    headline: "ერთად განვახორციელოთ მომავლის პროექტები."
    headline_original_tag: "p.font_0 (very large display text)"
  - key: "intro-and-pdf"
    order: 2
    visible:
      desktop: true
      tablet: true
      mobile: true
    text_original_tag: "p.font_5"
    pdf_link:
      label: "რეკვიზიტები"
      href_old: "/_files/ugd/3f8517_b79d39693f294d9d862ff0cfbb0b4d8e.pdf"
      href_new: "media/docs/bank-requisites-2022-12.pdf"
  - key: "payment-form-obsolete"
    order: 3
    visible:
      desktop: true
      tablet: true
      mobile: true
    status: "remove"
    form_title: "გადარიცხვის ფორმა"
    form_title_original_tag: "h6.font_6"
    fields_in_visual_order:
      - label: "First Name"
        type: "text"
        required: true
        placeholder: "e.g. Jane"
      - label: "Last Name"
        type: "text"
        required: true
        placeholder: "e.g. D"
      - label: "Company"
        type: "text"
        required: false
        placeholder: "e.g. Apple"
      - label: "Email"
        type: "email"
        required: true
        placeholder: "e.g. jane@gmail.com"
      - label: "Message"
        type: "TextAreaInput"
        required: false
        placeholder: "Tell us more "
      - label: "Enter the amount you wish to donate:"
        type: "number"
        required: true
        placeholder: "10.00"
        prefix: "GEL"
        min: 1
        max: 100000
        step: 0.01
      - label: "I agree to the terms & conditions"
        type: "CheckboxInput"
        required: true
    submit_button: "გაგრძელება"
    wix_config: "Wix Forms (legacy, app 14ce1214…) with the \"payment-form\" plugin: currency GEL, item \"Donation\", min 1.00, max 100000.00, success action SHOW_MESSAGE, contact label \"contacts-contacted_me\", preset responsiveGridSales01. Labels are English and the terms checkbox has no link."
bank_details: "bank.yml"
---

<!-- section: hero -->
შემოგვიერთდი

# ერთად განვახორციელოთ მომავლის პროექტები.

<!-- section: intro-and-pdf -->
თუ გსურთ შემოგვიერთდეთ ფონდის მიერ მხარდაჭერილი პროექტების განხორციელებაში, მიჰყევით ონლაინ გადარიცხვის ფორმას ან იხილეთ ქვემოთ მოცემული რეკვიზიტები.

[რეკვიზიტები](media/docs/bank-requisites-2022-12.pdf)

<!-- section: bank-details (NEW - render from bank.yml; replaces the payment form) -->

<!-- section: payment-form-obsolete | remove - fields listed in front matter for reference only -->
