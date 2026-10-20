# Content changes

Everything in `source/` was copied programmatically from the live Wix site on 2026-10-20 (Wix page JSON, CMS collections, server-rendered HTML, the bank PDF). This file lists every place where the files differ from what was published.

Raw, unmodified copies of the Wix data are kept in `source/raw/` for reference.

## 1. Spelling fixes applied

Only clear, certain spelling errors were fixed. "Count" is the number of occurrences in that file; front matter repeats some strings (for example a title is also used as the image alt), so a single published error can count more than once.

| # | File | Before | After | Count in file | Published context (original text) | Reason |
|---|---|---|---|---|---|---|
| 1 | `site.yml` | მხარდეჭერილი | მხარდაჭერილი | 1 | თუ გსურთ შემოგვიერთდეთ ფონდის მიერ მხარდეჭერილი პროექტების განხორციელებაში, იხილეთ… | spelling: participle of მხარდაჭერა is მხარდაჭერილი (ე→ა) |
| 2 | `site.yml` | ქვემოთმოცემული | ქვემოთ მოცემული | 1 | …პროექტების განხორციელებაში, იხილეთ ქვემოთმოცემული რეკვიზიტები. | spelling: adverb ქვემოთ + participle მოცემული are written as two words |
| 3 | `content/home.md` | მხარდეჭერილი | მხარდაჭერილი | 1 | თუ გსურთ შემოგვიერთდეთ ფონდის მიერ მხარდეჭერილი პროექტების განხორციელებაში, იხილეთ… | spelling: participle of მხარდაჭერა is მხარდაჭერილი (ე→ა) |
| 4 | `content/home.md` | ქვემოთმოცემული | ქვემოთ მოცემული | 1 | …პროექტების განხორციელებაში, იხილეთ ქვემოთმოცემული რეკვიზიტები. | spelling: adverb ქვემოთ + participle მოცემული are written as two words |
| 5 | `content/about.md` | მხარდეჭერილი | მხარდაჭერილი | 1 | თუ გსურთ შემოგვიერთდეთ ფონდის მიერ მხარდეჭერილი პროექტების განხორციელებაში, იხილეთ… | spelling: participle of მხარდაჭერა is მხარდაჭერილი (ე→ა) |
| 6 | `content/about.md` | ქვემოთმოცემული | ქვემოთ მოცემული | 1 | …პროექტების განხორციელებაში, იხილეთ ქვემოთმოცემული რეკვიზიტები. | spelling: adverb ქვემოთ + participle მოცემული are written as two words |
| 7 | `content/projects/_index.md` | მხარდეჭერილი | მხარდაჭერილი | 1 | თუ გსურთ შემოგვიერთდეთ ფონდის მიერ მხარდეჭერილი პროექტების განხორციელებაში, იხილეთ… | spelling: participle of მხარდაჭერა is მხარდაჭერილი (ე→ა) |
| 8 | `content/projects/_index.md` | ქვემოთმოცემული | ქვემოთ მოცემული | 1 | …პროექტების განხორციელებაში, იხილეთ ქვემოთმოცემული რეკვიზიტები. | spelling: adverb ქვემოთ + participle მოცემული are written as two words |
| 9 | `content/news/_index.md` | მხარდეჭერილი | მხარდაჭერილი | 1 | თუ გსურთ შემოგვიერთდეთ ფონდის მიერ მხარდეჭერილი პროექტების განხორციელებაში, იხილეთ… | spelling: participle of მხარდაჭერა is მხარდაჭერილი (ე→ა) |
| 10 | `content/news/_index.md` | ქვემოთმოცემული | ქვემოთ მოცემული | 1 | …პროექტების განხორციელებაში, იხილეთ ქვემოთმოცემული რეკვიზიტები. | spelling: adverb ქვემოთ + participle მოცემული are written as two words |
| 11 | `content/donate.md` | მხარდეჭერილი | მხარდაჭერილი | 1 | თუ გსურთ შემოგვიერთდეთ ფონდის მიერ მხარდეჭერილი პროექტების განხორციელებაში, მიჰყევით… | spelling: participle of მხარდაჭერა is მხარდაჭერილი (ე→ა) |
| 12 | `content/donate.md` | ქვემოთმოცემული | ქვემოთ მოცემული | 1 | …ონლაინ გადარიცხვის ფორმას ან იხილეთ ქვემოთმოცემული რეკვიზიტები. | spelling: adverb ქვემოთ + participle მოცემული are written as two words |
| 13 | `content/home.md` | ფოდნის | ფონდის | 4 | ფოდნის მისია არის მოემსახუროს/ხელი შეუწყოს… | typo (transposed letters): ფონდის = "of the fund" (hidden mission paragraph, 2 copies) |
| 14 | `content/about.md` | Ნიკო კვარაცხელიას ფონდი დაარსდა | ნიკო კვარაცხელიას ფონდი დაარსდა | 1 | Ნიკო კვარაცხელიას ფონდი დაარსდა 2022 წლის იანვარში. ფონდი შეიქმნა მისი… | Mtavruli capital letter (Ნ, U+1C9C) at sentence start; Georgian has no letter case in running text, normal Mkhedruli ნ |
| 15 | `content/about.md` | Ნიკოს სახელს | ნიკოს სახელს | 1 | Ნიკოს სახელს უკავშირდება არაერთი ინოვაციური პროექტი.… | Mtavruli capital letter (Ნ) at sentence start -> Mkhedruli ნ |
| 16 | `content/about.md` | Მან შექმნა | მან შექმნა | 1 | …უკავშირდება არაერთი ინოვაციური პროექტი. Მან შექმნა ლოკაციაზე დაფუძნებული პლატფორმა Feedc,… | Mtavruli capital letter (Მ) at sentence start -> Mkhedruli მ |
| 17 | `content/about.md` | Feedc, Რომლითაც | Feedc, რომლითაც | 1 | …შექმნა ლოკაციაზე დაფუძნებული პლატფორმა Feedc, Რომლითაც დაამსხვრია მითი და დაამტკიცა რომ გლობალური… | Mtavruli capital letter (Რ) after a comma -> Mkhedruli რ |
| 18 | `content/about.md` | ხელშეყწობის | ხელშეწყობის | 1 | ფონდი პროექტების ხელშეყწობის და დაფინანსების გადაწყვეტილებას მიიღებს… | typo: ხელშეწყობა (ყ→წ, letters swapped) |
| 19 | `content/projects/cooperation-with-supergmiri.md` | პლატფორა | პლატფორმა | 4 | თანამშრომლობა პლატფორა სუგერგმირთან | typo: missing მ in პლატფორმა (title and image alt) |
| 20 | `content/projects/cooperation-with-supergmiri.md` | სუგერგმირთან | სუპერგმირთან | 4 | თანამშრომლობა პლატფორა სუგერგმირთან | typo: სუპერგმირი ("superhero"), გ→პ (title and image alt) |
| 21 | `content/projects/cooperation-with-supergmiri.md` | პლათფორმა | პლატფორმა | 3 | …კვარაცხელიას სახელობის ფონდი დაუმეგობრდა პლათფორმა სუპერგმირს. დღეის მონაცემებით, მომავლის… / …🦸. Supergmiri.ge არის გამჭვირვალე, პლათფორმა ბენეფიციარებთან ურთიერთობისა, მომავლის… | spelling: პლატფორმა is written with ტ, not თ |
| 22 | `content/projects/cooperation-with-supergmiri.md` | რამოდენიმე | რამდენიმე | 2 | დღეის მონაცემებით, ჩვენი ფონდი გახდა რამოდენიმე ბენეფიციარის სუპერგმირი 🦸 / …მონაცემებით, მომავლის ბიჭის ფონდი გახდა რამოდენიმე ბენეფიციარის სუპერგმირი 🦸. Supergmiri.ge… | spelling: normative form is რამდენიმე ("several"); რამოდენიმე is a common non-standard form |
| 23 | `content/projects/terenti-graneli-scholarship.md` | გრენელის | გრანელის | 4 | ტერენტი გრენელის სახელობის სტიპენდია დაანონსდა | typo in the poet's name: ტერენტი გრანელი (the body text of the same item already spells it გრანელის) |
| 24 | `content/projects/terenti-graneli-scholarship.md` | ოქტომბერს Ნიკო | ოქტომბერს ნიკო | 1 | 2022 წლის ოქტომბერს Ნიკო კვარაცხელიას ფონდის საინიციატივო ჯგუფის… | Mtavruli capital letter (Ნ) mid-sentence -> Mkhedruli ნ |
| 25 | `content/projects/terenti-graneli-scholarship.md` | Სტიპენდიანტი | სტიპენდიანტი | 1 | Სტიპენდიანტი გახდა წალენჯიხელი ახალგაზრდა საბა კალანდია.… | Mtavruli capital letter (Ს) at sentence start -> Mkhedruli ს |
| 26 | `content/projects/terenti-graneli-scholarship.md` | “Ჩემთვის | “ჩემთვის | 1 | …წალენჯიხელი ახალგაზრდა საბა კალანდია. “Ჩემთვის დიდი პატივია რომ ტერენტი გრანელის სტიპენდიას… | Mtavruli capital letter (Ჩ) at quote start -> Mkhedruli ჩ |
| 27 | `content/projects/batumi-tragedy-scholarship.md` | პედაგოგო | პედაგოგი | 1 | …სინათლეზე საუბარი”, - წერს წალენჯიხელი პედაგოგო თეა ქარჩავა ტერენტი გრანელისადმი მიძღვნილ… | typo: პედაგოგი ("teacher"), final ო→ი |
| 28 | `content/projects/jgali-school-it-lab.md` | Პროექტის | პროექტის | 1 | Პროექტის ფარგლებში კეთილმოეწყო და ტექნიკურად… | Mtavruli capital letter (Პ) at sentence start -> Mkhedruli პ |
| 29 | `content/projects/jgali-school-it-lab.md` | მომავალს ,ეს | მომავალს, ეს | 1 | …ახალ გამოწვევებს, ახალ იდეებს, უკეთეს მომავალს ,ეს ყველაფერი კი დიდ პასიხისმგებლობასაც… | punctuation typo: space was before the comma instead of after it |
| 30 | `content/projects/jgali-school-it-lab.md` | პასიხისმგებლობასაც | პასუხისმგებლობასაც | 1 | …უკეთეს მომავალს ,ეს ყველაფერი კი დიდ პასიხისმგებლობასაც ნიშნავს. Სწორედ ამის დასტურია, რომ… | typo: პასუხისმგებლობა ("responsibility"), ი→უ |
| 31 | `content/projects/jgali-school-it-lab.md` | Სწორედ | სწორედ | 1 | …კი დიდ პასიხისმგებლობასაც ნიშნავს. Სწორედ ამის დასტურია, რომ დღევანდელ დღეს ნიკოს… | Mtavruli capital letter (Ს) at sentence start -> Mkhedruli ს |
| 32 | `content/news/memorandum-with-energia.md` | პროეტტის | პროექტის | 1 | …გაფორმებული მემორანდუმი არაერთი საინტერესო პროეტტის განხორციელებას შეუწყობს ხელს. | typo: პროექტის ("of the project"), ტ→ქ |
| 33 | `content/home.md` | პლატფორა | პლატფორმა | 2 | თანამშრომლობა პლატფორა სუგერგმირთან (funded-projects card title, front matter + body) | same fix as #19: the Home card repeats the project title (added by the completeness check) |
| 34 | `content/home.md` | სუგერგმირთან | სუპერგმირთან | 2 | თანამშრომლობა პლატფორა სუგერგმირთან (funded-projects card title, front matter + body) | same fix as #20 (added by the completeness check) |
| 35 | `content/home.md` | გრენელის | გრანელის | 2 | ტერენტი გრენელის სახელობის სტიპენდია დაანონსდა (funded-projects card title, front matter + body) | same fix as #23 (added by the completeness check) |

Notes:
- The shared "join us" sentence (`თუ გსურთ შემოგვიერთდეთ ფონდის მიერ … რეკვიზიტები.`) appeared on every page; it is fixed everywhere it is stored (site.yml and each page file that repeats it).
- Mtavruli: some sentence-initial letters were stored as Georgian Mtavruli capitals (probably automatic capitalisation by a phone keyboard or editor) (U+1C90-U+1CBF, e.g. "Ნ", "Მ", "Რ", "Ს", "Ჩ", "Პ"). Running Georgian text has no capital letters, so each was replaced by the normal Mkhedruli letter. After the fixes no Mtavruli character remains in any content file (checked automatically).
- Old URL slugs keep their original spelling (`original_slug`, `original_urls`, redirects.csv) because they are addresses, not text; the raw text of the duplicate Energia copies (`duplicate_variants`) is also left unfixed.

## 2. Whitespace and markup normalisation (no wording changed)

Applied everywhere by the extraction script:

- no-break spaces (U+00A0, `&nbsp;`) turned into normal spaces;
- zero-width spaces (U+200B) and Wix "wixGuard" spacer spans removed;
- the server-rendered HTML of the live site contains three invisible NUL characters (U+0000) inside words: "შემოგვი␀ერთდეთ" in the join text on /ourprojects, "გან␀ხორციელებაში" in the join text on the news item pages, and "მ␀ომავალი" in the footer slogan on /terms. They are not in the Wix page data the files were built from, and browsers do not display them, so the files have the plain words. (Earlier text dumps showed them as stray spaces, e.g. "შემოგვი ერთდეთ".)
- runs of two or more spaces collapsed to one (for example "თავისი  ღირებულებებით" on Home and About, "ხელშეწყობა  რომლებთაც" in the Energia quote);
- leading/trailing spaces trimmed (for example the trailing space at the end of the Batumi project title and several CMS fields);
- empty spacer paragraphs dropped;
- `&copy;` written as ©; HTML entities decoded;
- Wix styling spans (italic, underline, colour) dropped; the meaning is recorded in front matter instead (e.g. the Home quote was three italic h2 lines and is now a Markdown blockquote);
- headings re-levelled for a clean page outline (each page gets one `#` heading; the original Wix tag is recorded as `*_original_tag` in front matter);
- CMS plain-text fields: a blank line starts a new paragraph, a single line break is kept as `<br>`.

Counts per file:

| File | Normalisation | Occurrences |
|---|---|---|
| `content/about.md` | leading/trailing space trimmed | 1 |
| `content/about.md` | no-break space (U+00A0) -> normal space | 4 |
| `content/about.md` | run of 2+ spaces collapsed to one space | 1 |
| `content/about.md` | zero-width space (U+200B) removed | 1 |
| `content/donate.md` | no-break space (U+00A0) -> normal space | 2 |
| `content/home.md` | empty spacer paragraph(s) dropped | 2 |
| `content/home.md` | leading/trailing space trimmed | 1 |
| `content/home.md` | no-break space (U+00A0) -> normal space | 2 |
| `content/home.md` | run of 2+ spaces collapsed to one space | 1 |
| `content/home.md` | zero-width space (U+200B) removed | 2 |
| `content/news/memorandum-with-energia.md` | leading/trailing space trimmed | 1 |
| `content/news/memorandum-with-energia.md` | run of 2+ spaces collapsed to one space | 4 |
| `content/news/mothers-day-event-2023.md` | leading/trailing space trimmed | 1 |
| `content/projects/batumi-tragedy-scholarship.md` | leading/trailing space trimmed | 3 |
| `content/projects/cooperation-with-supergmiri.md` | leading/trailing space trimmed | 1 |
| `content/projects/cooperation-with-supergmiri.md` | run of 2+ spaces collapsed to one space | 1 |
| `content/projects/jgali-school-it-lab.md` | leading/trailing space trimmed | 2 |
| `content/projects/terenti-graneli-scholarship.md` | leading/trailing space trimmed | 2 |
| `content/terms.md` | empty spacer paragraph(s) dropped | 3 |
| `content/terms.md` | leading/trailing space trimmed | 5 |
| `content/terms.md` | no-break space (U+00A0) -> normal space | 2 |
| `content/terms.md` | run of 2+ spaces collapsed to one space | 10 |
| `content/terms.md` | space next to a line break removed | 2 |
| `content/terms.md` | zero-width space (U+200B) removed | 1 |

## 3. Content deliberately not carried over

- Wix template leftovers: the "TEAM / Meet Yonder's Superheroes" block on About, the "01 TECHNOLOGY / 02 FEATURES / 03 DEPLOYMENT" headings and "WORK WITH US" button on Home, "VIEW ALL ARTICLES" on Our Projects, the whole /contact-1 page, the "I am a title 01-05" CMS items and the 19 protected template pages. They are documented in the front matter of the page they sat on, not reproduced as content.
- Duplicate copies of the 6 real items (copy-of-projects, copy-of-projects-1, news-1, news-1-1, news-2, news3): only listed in `original_urls` / `duplicate_variants` and in redirects.csv.
- The Donate payment form fields are kept only as reference in donate.md front matter (online payment closed).

## 4. Needs owner decision

Nothing in this list was changed.

1. **Batumi project body is the wrong text** (content/projects/batumi-tragedy-scholarship.md). The whole body (Wix field longDescription) is teacher Tea Karchava's quote about the Terenti Graneli scholarship event ("…წერს წალენჯიხელი პედაგოგი თეა ქარჩავა ტერენტი გრანელისადმი მიძღვნილ ღონისძიებაზე, სადაც გამარჯვებული სტიპენდიანტი გამოვლინდა"). It belongs on the Graneli page. Not moved. Options: move it to terenti-graneli-scholarship.md and write a real body for the Batumi scholarship, or keep the Batumi page summary-only.
2. **Graneli title says "announced"** (content/projects/terenti-graneli-scholarship.md). Title "…სტიპენდია დაანონსდა" (scholarship announced) while the body already names the winner (საბა კალანდია). Owner may want a results title. Not changed.
3. **Spelling inside the Energia director's quote** (content/news/memorandum-with-energia.md). "რომლებთაც აქვთ პოტენციალი" is probably meant as "რომლებსაც აქვთ პოტენციალი"; "როგორც ეს ნიკო კვარაცხელიამ შესძლო" - the normative verb form is "შეძლო". These are inside a direct quotation of a third party (გალაქტიონ ბუაძე), so they were NOT changed. Owner to decide.
4. **Name of the Energia company** (content/news/memorandum-with-energia.md). Written as "საქართველოს საინვესტიციო ჯგუფი ენერგია" (title, quote), "ქართული საინვესტიციო ჯგუფი ენერგია" (second paragraph) and "ქართული საინვესტიციო ფონდი ენერგია" (on the cover image). No quotation marks around the name. Confirm the official name and spelling; not changed.
5. **Energia news date** (content/news/memorandum-with-energia.md). Published 19 March 2023, memorandum signed December 2022; the duplicate News1 copy was dated 1 March 2023. Kept 2023-03-19 (the date shown at /news).
6. **Hidden SDG grid and mission paragraph on Home** (content/home.md). Hidden at every breakpoint. Cards 10 and 11 repeat "ჯანმრთელობა და კეთილდღეობა" (goal 3), goal 5 is last, goals 12-17 are missing, wording is unofficial ("ნული შიმშილი" etc.), and the grid uses Wix stock photos. Kept as found (only the ფოდნის typo fixed). Decide whether to publish it (then use the official Georgian SDG names and own/UN icons) or drop it. The mission paragraph also has a number-agreement issue ("პროექტებს რომელიც შეიცავს" - plural noun, singular relative pronoun) that was not changed.
7. **Home vs About wording of the same sentence** (content/home.md, content/about.md). Home: "…რაც ამჟამად მსოფლიო დღის წესრიგია." About: "…რაც ამჟამად მსოფლიო დღის წესრიგშია." The About form ("is on the agenda") reads more naturally. Not unified.
8. **Donate intro mentions the online form** (content/donate.md). "…მიჰყევით ონლაინ გადარიცხვის ფორმას ან იხილეთ ქვემოთ მოცემული რეკვიზიტები." If the payment form is removed (online payment closed), the clause "მიჰყევით ონლაინ გადარიცხვის ფორმას ან" no longer fits. New wording needed from the owner; not changed.
9. **Obsolete online-payment elements** (site.yml (cta_block), all pages). Button "ონლაინ გადარიცხვა", the card-brand logos and the Donate payment form refer to the closed online payment account. Recommend removing them and pointing every "join" action to the bank details. The CTA sentence "…იხილეთ ქვემოთ მოცემული რეკვიზიტები" still works without the button.
10. **Terms / privacy page** (content/terms.md). English text copied from another site (workbook for sale, free e-newsletter, Unipay, analytics). Needs a new Georgian (+ English) privacy notice naming the foundation, its ID and a contact. Kept verbatim as the record.
11. **Footer year** (site.yml (footer)). "© 2022 ნიკო კვარაცხელიას ფონდი" - update the year (or a range).
12. **Supergmiri category and details** (content/projects/cooperation-with-supergmiri.md). Category "სტიპენდია" (Scholarship) does not fit a platform partnership; "რამდენიმე ბენეფიციარის" gives no number; supergmiri.ge is named but not linked; the informal "მომავლის ბიჭის ფონდი" / "მომავლის ბიჭი" wording may need review. Not changed.
13. **Project dates** (content/projects/*.md). The site shows the CMS creation date (18 Dec 2022 for three projects) rather than the event dates stated in the texts (Sept 2022 IT lab, Oct 2022 Graneli). Both are recorded (date, event_date); choose which to display.
14. **Grammar / style issues left as published (not spelling)** (several). Not changed because they are grammar or style, not clear spelling errors: "2022 წლის ოქტომბერს/დეკემბერს" (normative "ოქტომბერში/დეკემბერში"); missing commas before "რომ" / "სადაც" (About, Graneli quote, Mother's Day body); "ორ არასრულწლოვან ბავშვს, რომელიც … დაზარალდა" (Batumi summary - plural agreement); "Supergmiri.ge არის გამჭვირვალე, პლატფორმა …" (stray comma); colloquial "ეგ ნიშნავს" inside the Jgali teacher's quote. A Georgian proof-reader can review these.
15. **Titles ending with a full stop** (content/news/mothers-day-event-2023.md). Title "2 მარტს ფონდმა ჩაატარა დედის დღისადმი მიძღვნილი ღონისძიება." ends with a full stop (also in the old slug). Kept.
16. **English name of the foundation** (site.yml). The site never states an English name. Working value "Niko Kvaratskhelia Foundation"; the PDF transliteration is "NNLE NIKO KVARATSKHELIAS SAKHELOBIS PHONDI". Confirm.
17. **Bank account still valid?** (bank.yml). The requisites PDF is from Nov/Dec 2022. Confirm the account GE93BG0000000533757447 is active before publishing it as text.
18. **Contact details** (content/contact.md). No real contact data exists on the old site. Owner must supply email/phone/address/ID code/social links.
19. **Media rights** (media/manifest.json). The hero clip (3f8517_7af606ad…, "RPReplay_Final1670002160 2.mov") is a screen recording of a library scene and the Graneli cover is a video still; both are the foundation's own uploads but may contain third-party footage. The goal film (IMG_0721.MOV) has burned-in English subtitles. Confirm rights / preferred versions.
