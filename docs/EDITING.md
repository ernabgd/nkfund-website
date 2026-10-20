# საიტის რედაქტირება · Editing the website

ქართული ტექსტი პირველია, ინგლისური — მის შემდეგ. / Georgian first, English below.

---

## ქართულად

საიტს ვარედაქტირებთ **Pages CMS**-ით — ეს არის მარტივი ფორმები ბრაუზერში. პროგრამირება საჭირო არ არის.
ყოველი შენახვის შემდეგ საიტი თავისით განახლდება **2–4 წუთში**.

### 1. შესვლა

1. გახსენით **<https://app.pagescms.org>**.
2. დააჭირეთ **Sign in with GitHub** და შედით თქვენი GitHub-ის ანგარიშით.
   (თუ GitHub-ის ანგარიში არ გაქვთ, ფონდის ადმინისტრატორს სთხოვეთ მოსაწვევი ელფოსტით — Pages CMS-ში მას შეუძლია
   „collaborator“-ად დაგამატოთ.)
3. აირჩიეთ საცავი **ernabgd/nkfund-website** და ფილიალი **main**.

მარცხნივ მენიუში ხედავთ: **სიახლეები / News**, **პროექტები / Projects**, **Facebook პოსტები**, **გვერდები / Pages**
და **პარამეტრები / Settings**.

### 2. სიახლის დამატება

1. მარცხნივ აირჩიეთ **სიახლეები / News** → ღილაკი **Add an entry** (ახალი ჩანაწერი).
2. შეავსეთ ველები. თითო ველი ორჯერ არის — **ქართულად** და **ინგლისურად**:
   - **სათაური** — ქართული სავალდებულოა. ინგლისური შეგიძლიათ მოგვიანებით დაამატოთ; მანამდე ინგლისურ გვერდზე
     ქართული ტექსტი გამოჩნდება მინიშნებით „(in Georgian)“.
   - **მისამართი (slug)** — მხოლოდ ლათინური პატარა ასოები, ციფრები და დეფისი, მაგ. `scholarship-2026`.
     ეს იქნება გვერდის მისამართი: `nkfund.world/news/scholarship-2026/`. გამოქვეყნების შემდეგ ნუ შეცვლით.
   - **გამოქვეყნების თარიღი** — როდის გამოქვეყნდა საიტზე.
   - **ღონისძიების თარიღი** — არასავალდებულო, მაგ. `2026-09` ან `2026-09-15`. თუ შევსებულია, ბარათზე ეს თარიღი
     ჩანს; თუ არა — გამოქვეყნების თარიღი. სიაში რიგითობასაც ბარათზე ნაჩვენები თარიღი განსაზღვრავს (ახალი ზემოთაა).
   - **მოკლე აღწერა** — 1–2 წინადადება (ქართული სავალდებულოა).
   - **მთავარი ფოტო** — ატვირთეთ JPG, PNG ან WebP (სასურველია 1600 პიქსელი სიგანით ან მეტი). საიტი თავად ამზადებს
     მცირე ზომებს. სხვა ფორმატები (BMP, TIFF, ICO) არ მიიღება.
   - **ფოტოს ჩამოჭრა ბარათებზე** — ბარათებზე ფოტო ჩარჩოში ჩამოიჭრება. თუ სურათზე კიდესთან ტექსტია (ბანერი, პოსტერი),
     აირჩიეთ **„მთლიანი სურათი“**; თუ ადამიანი ან წარწერა ერთ მხარესაა, აირჩიეთ ის მხარე, რომელიც უნდა ჩანდეს.
   - **ფოტოს აღწერა** — მოკლედ დაწერეთ, რა ჩანს ფოტოზე (ეს უსინათლო მკითხველებს ეხმარება).
   - **ტექსტი** — ჩვეულებრივი ტექსტის რედაქტორი (სათაურები, სიები, ბმულები).
   - **ფოტოგალერეა** — არასავალდებულო; ფოტოები ტექსტის ქვემოთ გამოჩნდება. ტექსტიანი გრაფიკისთვის „მინიატურაში“
     აირჩიეთ **„მთლიანი სურათი“**, რომ წარწერა არ ჩამოიჭრას.
3. დააჭირეთ **Save**. რამდენიმე წუთში სიახლე საიტზე გამოჩნდება.

**სამუშაო ვერსია:** თუ მონიშნავთ ველს **„სამუშაო ვერსია / Draft“**, ჩანაწერი შეინახება, მაგრამ საიტზე არ გამოჩნდება.

### 3. პროექტის დამატება

იგივე, რაც სიახლე, ოღონდ მენიუში აირჩიეთ **პროექტები / Projects** და მიუთითეთ **კატეგორია**
(სტიპენდია ან ტექნოლოგიები). ახალი კატეგორიის დასამატებლად მიმართეთ დეველოპერს.

- **„მთავარ გვერდზე დიდად / Featured on the home page“** — მონიშნული პროექტი მთავარ გვერდზე დიდი ფოტოთი ჩანს,
  დანარჩენი — მის ქვემოთ, ბარათებად. ერთდროულად ერთი პროექტი მონიშნეთ.
- **ციტატა ტექსტში:** თუ აბზაცი მთლიანად ვინმეს სიტყვებია, ტექსტის რედაქტორში აირჩიეთ **ციტატა (Quote)** —
  საიტზე ის ვარდისფერ ფონზე, დიდი შრიფტით გამოჩნდება. ავტორი ციტატის ბოლო, ცალკე აბზაცში დაწერეთ ტირით:
  `— სახელი გვარი, თანამდებობა` — საიტი მას ციტატის ქვეშ, პატარა შრიფტით აჩვენებს.

### 4. Facebook-ის პოსტის დამალვა

ფონდის Facebook-გვერდის ახალი პოსტები საიტზე **ავტომატურად** ემატება ყოველ დილით და მაშინვე ჩანს.
თუ რომელიმე პოსტი საიტზე არ უნდა ჩანდეს:

1. მენიუში აირჩიეთ **Facebook პოსტები**.
2. გახსენით სასურველი პოსტი (სიაში ჩანს პოსტის პირველი სტრიქონი და თარიღი).
3. **მოხსენით მონიშვნა** ველს **„ჩანდეს საიტზე / Show on website“**.
4. დააჭირეთ **Save**.

პოსტის **წაშლა არ შეიძლება** — წაშლილ პოსტს შემდეგი იმპორტი ისევ დააბრუნებს. დამალვა საკმარისია.
დამალული პოსტის დასაბრუნებლად ისევ მონიშნეთ ეს ველი.

Facebook ფოტოს აღწერას არ გვაძლევს. თუ შეგიძლიათ, შეავსეთ ველი **„ფოტოს აღწერა (alt)“** — რა ჩანს პოსტის
პირველ ფოტოზე. თუ ცარიელია, საიტი წერს „ფოტო ფონდის Facebook-პოსტიდან“. თუ საჩვენებელი პოსტი არ არის,
მთავარ გვერდზე მხოლოდ ლურჯი ბარათი „გამოგვყევით“ ჩანს (Facebook და Instagram).

### 5. სხვა ტექსტები

- **გვერდები / Pages** — მთავარი გვერდის, „ჩვენ შესახებ“, შემოწირულობის, კონტაქტის და სხვა გვერდების ტექსტები.
- **გვერდები → ბლოკი „შემოგვიერთდი“** — ბენეფიციარის ციტატა (ახლა: საბა კალანდია), რომელიც ყველა გვერდის ბოლოს
  და შემოწირულობის გვერდზე ჩანს. დასამალად წაშალეთ ქართული ციტატა.
- **პარამეტრები → საიტის პარამეტრები** — ფონდის სახელი, ელფოსტა, Facebook-ისა და Instagram-ის ბმულები.
- **პარამეტრები → ინტერფეისის ტექსტები** — მენიუს პუნქტები, ღილაკები და მცირე წარწერები ორივე ენაზე.
- **პარამეტრები → საბანკო რეკვიზიტები** — IBAN და ბანკის მონაცემები. აქ ცვლილება მხოლოდ ბანკის ახალი
  დოკუმენტის მიხედვით შეიძლება და **ზუსტად** ისე, როგორც დოკუმენტშია (PDF ატვირთეთ იმავე გვერდზე). მიმღებს,
  IBAN-სა და SWIFT-ს შემომწირველები ბანკის ფორმაში აკოპირებენ: ნუ თარგმნით და ნუ შეცვლით (IBAN — ჰარების
  გარეშე). ბანკის სახელი ზუსტად PDF-ის მიხედვით: ლარისთვის სს "საქართველოს ბანკი", დოლარისა და ევროსთვის
  (Account With Institution) Bank of Georgia.
- **ინტერფეისის ტექსტები:** თითოეულ წარწერას ორი მნიშვნელობა აქვს — ქართული (სავალდებულო) და ინგლისური.
- **კონფიდენციალურობის გვერდი** ჯერ სამუშაო ვერსიაა: როცა ფონდი ტექსტს დაამტკიცებს, მოხსენით მონიშვნა „Draft“.
- **ბენეფიციარის ციტატა** სიტყვასიტყვით უნდა იყოს (ახლა: ტერენტი გრანელის სტიპენდიის გვერდიდან).

### 6. თუ რამე შეცდა

ყოველი შენახვა ინახება ისტორიაში (GitHub). დეველოპერს შეუძლია ნებისმიერი წინა ვერსიის აღდგენა.
თუ საიტი 10 წუთში არ განახლდა, GitHub-ზე გახსენით **Actions** — წითელი ნიშანი ნიშნავს შეცდომას; მიწერეთ დეველოპერს.
ცარიელი ველები (მაგ. ინგლისური ტექსტი, რომელიც ჯერ არ გაქვთ) პრობლემა არ არის: Pages CMS მათ შენახვისას შლის
და საიტი ამას ითვალისწინებს.

---

## In English

The site is edited with **Pages CMS**: simple forms in the browser, no programming. After every save the
website updates itself in **2–4 minutes**.

### 1. Signing in

1. Open **<https://app.pagescms.org>**.
2. Click **Sign in with GitHub** and sign in with your GitHub account.
   (No GitHub account? Ask the Fund's administrator for an e-mail invitation: Pages CMS can add you as a collaborator.)
3. Choose the repository **ernabgd/nkfund-website** and the branch **main**.

The menu on the left has **სიახლეები / News**, **პროექტები / Projects**, **Facebook posts**, **გვერდები / Pages** and
**პარამეტრები / Settings**.

### 2. Adding a news item

1. Click **სიახლეები / News** → **Add an entry**.
2. Fill in the fields. Each text field appears twice, **Georgian** and **English**:
   - **Title**: Georgian is required. English can be added later; until then the English page shows the Georgian
     text marked "(in Georgian)".
   - **Web address (slug)**: lowercase Latin letters, digits and hyphens only, e.g. `scholarship-2026`.
     It becomes the page address `nkfund.world/en/news/scholarship-2026/`. Do not change it after publishing.
   - **Publication date**: when it was published on the website.
   - **Event date**: optional, e.g. `2026-09` or `2026-09-15`. If filled in, the card shows this date; otherwise the
     publication date. Lists are ordered by the date the card shows (newest first).
   - **Summary**: one or two sentences (Georgian is required).
   - **Cover image**: upload a JPG, PNG or WebP, ideally 1600 pixels wide or more. The site makes the smaller sizes
     itself. Other formats (BMP, TIFF, ICO) are not accepted.
   - **Cover cropping on cards**: cards crop the photo to their frame. For a picture with text near the edges (a
     banner, a poster) choose **"Whole image"**; if a person or caption is on one side, choose the side that must show.
   - **Image description (alt)**: say briefly what the photo shows (this helps blind readers).
   - **Text**: a normal text editor (headings, lists, links).
   - **Photo gallery**: optional; photos appear below the text. For a graphic with text, set its **Thumbnail** to
     **"Whole image"** so the words are not cut.
3. Click **Save**. The item appears on the site a few minutes later.

**Draft:** tick **"სამუშაო ვერსია / Draft"** to save an entry without showing it on the website.

### 3. Adding a project

Same as a news item, but choose **პროექტები / Projects** and pick a **category** (Scholarship or Technologies).
Ask the developer to add a new category.

- **"მთავარ გვერდზე დიდად / Featured on the home page"**: the ticked project is shown large on the home page, with the
  others as cards below it. Tick one project at a time.
- **Quotes in the text:** if a whole paragraph is someone's words, choose **Quote** in the text editor; the site shows
  it on a blush background in a larger serif type. Put the speaker in a last, separate paragraph of the quote that
  starts with a dash: `— Name Surname, role`; the site shows it as a small caption under the quote.

### 4. Hiding a Facebook post

New posts from the Fund's Facebook Page are added to the website **automatically** every morning and are shown
straight away. To keep a post off the website:

1. Click **Facebook posts** in the menu.
2. Open the post (the list shows its first line and date).
3. **Untick "ჩანდეს საიტზე / Show on website"**.
4. Click **Save**.

Posts **cannot be deleted** here: a deleted post would come back with the next import. Hiding is enough.
Tick the box again to show the post again.

Facebook does not provide image descriptions. If you can, fill in **"ფოტოს აღწერა (alt) / Image description"**: what the
post's first photo shows. If it is empty, the site uses "Photo from the Fund's Facebook post". When no post is
visible, the home page shows only the blue "Follow us" card (Facebook and Instagram).

### 5. Other texts

- **Pages**: texts of the home page, About, Donate, Contact and the other pages.
- **Pages → "Join us" band**: the beneficiary quote (now Saba Kalandia) shown at the end of every page and on the
  Donate page. Delete the Georgian quote to hide it.
- **Settings → Site settings**: the Fund's name, e-mail, Facebook and Instagram links.
- **Settings → Interface text**: menu items, buttons and small labels in both languages.
- **Settings → Bank details**: IBAN and bank data. Change these only from a new bank document, and **exactly** as printed
  there (upload the PDF on the same screen). Donors copy the beneficiary, IBAN and SWIFT into their bank form: never
  translate or reformat them (the IBAN without spaces). The bank name exactly as in the PDF: for lari
  სს "საქართველოს ბანკი", for dollars and euros (Account With Institution) Bank of Georgia.
- **Interface text**: every label has two values, Georgian (required) and English.
- **The privacy page** is still a draft: untick "Draft" once the Fund has approved the text.
- **The beneficiary quote** must be quoted word for word (now: from the Terenti Graneli Scholarship page).
- Developers: do not add YAML comments to these files — Pages CMS rewrites the whole file when it saves and drops them.

### 6. If something goes wrong

Every save is kept in the history (GitHub); a developer can restore any earlier version. If the website has not
updated after 10 minutes, open **Actions** on GitHub: a red mark means the update failed. Tell the developer.
Empty fields (for example an English text you do not have yet) are fine: Pages CMS removes them when it saves, and the
website and its checks are built for that.
