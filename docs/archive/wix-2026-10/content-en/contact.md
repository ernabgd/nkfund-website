---
page: "contact"
url_new: "/contact/"
url_old:
  - "/contact-1 (public, in sitemap, Wix template content)"
  - "/contact (\"კონტაქტი\", protected template page, renders blank)"
real_contact_data_on_site: false
summary: "The live site publishes NO real contact details for the foundation: no email, phone, postal address, registration number or social links."
template_placeholders_found:
  "/contact-1 (visible)":
    - "heading \"GET IN TOUCH\""
    - "EMAIL US: INFO@MYSITE.COM"
    - "CALL US: 123-456-7890"
    - "OUR OFFICE: 500 TERRY FRANCOIS STREET, SAN FRANCISCO, CA 94158"
    - "form FIRST NAME / LAST NAME / EMAIL / MESSAGE / SEND (\"Thanks for submitting!\")"
    - "CONTACT / \"HOW FAR DO YOU WANT TO GO?\""
    - "\"I'm a paragraph. Click here to add your own text and edit me. Let your users get to know you.\""
    - "\"Created on Editor X\" badge -> editorx.com"
    - "template images 84770f_b313302e…, 84770f_e541d311…, c837a6_ecf878ab… (not reusable)"
  "/about (hidden team block)":
    - "mailto:info@mysite.com"
    - "linkedin.com/company/editorx"
not_foundation_contacts:
  - "(+995 32) 2 444 444 and welcome@bog.ge in the bank PDF are Bank of Georgia's contact details, not the foundation's."
clues:
  - "The domain has Microsoft 365 email (MX nkfund-world.mail.protection.outlook.com), so an @nkfund.world mailbox exists - address unknown."
unverified_protected_pages:
  note: "Added by the completeness check. Wix marks these pages as protected (members or password only). Their page data is not published (no pageJsonFileName in the public site model) and they render blank, so their content could not be read without logging in. The Georgian titles suggest the foundation made them itself, so they may hold draft text (for example real contact details). The owner should open them in the Wix editor before the old site is closed."
  pages:
    - "/contact - \"კონტაქტი\" (page id xm165)"
    - "/donate-1 - \"შემოგვიერთდი თეთრი\" (page id c2q1e)"
    - "/donate-1-1 - \"პროექტები dark\" (page id m0lgv)"
    - "/about-1 - \"Copy of ჩვენ შესახებ\" (page id d49lw)"
owner_must_supply:
  - "public email address"
  - "phone (optional)"
  - "postal / office address (or city only)"
  - "registration (identification) code - საიდენტიფიკაციო კოდი"
  - "social media links (Facebook / Instagram / LinkedIn / YouTube), if any"
  - "contact person / board names, if they should be public"
do_not_migrate: "none of the /contact-1 template text"
translation:
  language: "en"
  source_file: "content/contact.md"
  translated_on: "2026-10-20"
  status: "draft translation from the Georgian; to be reviewed by the foundation"
  conventions: "content-en/README.md; names and terms: content-en/GLOSSARY.md"
  notes:
    - "The Georgian file has no body text; nothing to translate. Page wording is in ui.yml -> contact (ka + en)."
  owner_defaults:
    email: "hello@nkfund.world"
    facebook: "https://www.facebook.com/profile.php?id=100089583201087"
    instagram: "https://www.instagram.com/nicokfund/"
    instagram_handle: "@nicokfund"
    not_provided: "phone, postal address, registration (identification) code - leave out"
---

<!-- No real contact content exists on the old site. Contacts confirmed by the owner (email, Facebook, Instagram) are recorded under translation.owner_defaults and worded in ui.yml -> contact. -->
