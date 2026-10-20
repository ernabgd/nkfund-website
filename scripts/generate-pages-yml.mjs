#!/usr/bin/env node
// Writes .pages.yml (Pages CMS configuration, https://pagescms.org/docs/configuration/).
// The "Interface text" form is generated from data/ui.yml so every UI string is editable.
// Edit this file (not .pages.yml) and run:  npm run cms:config
// tests/pages-config.test.mjs fails if .pages.yml is out of date.
import fs from "node:fs";
import { loadYaml, dumpYaml } from "./lib/frontmatter.mjs";

const SLUG = "^[a-z0-9]+(-[a-z0-9]+)*$";
const PARTIAL_DATE = "^$|^[0-9]{4}(-[0-9]{2}(-[0-9]{2})?)?$";

const ka = (label) => `${label} — ქართულად / Georgian`;
const en = (label) => `${label} — ინგლისურად / English`;
const EN_HELP = "თუ ცარიელია, ინგლისურ გვერდზე ქართული ტექსტი გამოჩნდება მინიშნებით „(in Georgian)“. / If empty, the English page shows the Georgian text marked “(in Georgian)”.";

const pair = (name, label, type = "string", extra = {}) => [
  { name: `${name}_ka`, label: ka(label), type, ...extra.ka, ...(extra.both || {}) },
  { name: `${name}_en`, label: en(label), type, description: EN_HELP, ...extra.en, ...(extra.both || {}) },
];

// Images the build can process (sharp/eleventy-img): Pages CMS's "image" category would also accept BMP, ICO and TIFF,
// which fail the whole build. Every upload field and the media library are limited to these.
const IMAGE_EXT = ["jpg", "jpeg", "png", "webp", "avif", "gif"];
const img = (path) => ({ media: "uploads", path, extensions: IMAGE_EXT });

const markdown = (folder) => ({ options: { format: "markdown", media: "uploads", path: `src/assets/uploads/${folder}`, extensions: [...IMAGE_EXT, "pdf"] } });

function itemFields(kind) {
  const folder = kind === "project" ? "projects" : "news";
  return [
    ...pair("title", "სათაური / Title", "string", { ka: { required: true } }),
    {
      name: "slug",
      label: "მისამართი (slug) / Web address (slug)",
      type: "string",
      required: true,
      pattern: { regex: SLUG, message: "მხოლოდ ლათინური პატარა ასოები, ციფრები და დეფისი / Only lowercase latin letters, digits and hyphens" },
      description: `გვერდის მისამართი: /${folder}/<slug>/ — ლათინური ასოებით, მაგ. „new-scholarship-2026“. გამოქვეყნების შემდეგ ნუ შეცვლით. / The page address /${folder}/<slug>/ in latin letters, e.g. "new-scholarship-2026". Do not change it after publishing.`,
    },
    {
      name: "date",
      label: "გამოქვეყნების თარიღი / Publication date",
      type: "date",
      required: true,
      options: { format: "yyyy-MM-dd" },
      description: "როდის გამოქვეყნდა საიტზე. თუ ღონისძიების თარიღი ცარიელია, ბარათზე ეს თარიღი ჩანს და სიაში რიგითობასაც ის განსაზღვრავს (ახალი — პირველი). / When it was published. If the event date is empty, the card shows this date and it sets the order in the list (newest first).",
    },
    {
      name: "event_date",
      label: "ღონისძიების თარიღი / Event date",
      type: "string",
      pattern: { regex: PARTIAL_DATE, message: "ფორმატი / Format: 2026, 2026-09 ან/or 2026-09-15" },
      description: "არასავალდებულო: როდის ჩატარდა / განხორციელდა. თუ შევსებულია, ბარათზე ეს თარიღი ჩანს და სიაში რიგითობასაც ის განსაზღვრავს. ფორმატი: 2026, 2026-09 ან 2026-09-15. / Optional: when it took place. If filled in, the card shows this date and it sets the order in the list. Format: 2026, 2026-09 or 2026-09-15.",
    },
    ...(kind === "project"
      ? [
          {
            name: "category",
            label: "კატეგორია / Category",
            type: "select",
            options: {
              values: [
                { name: "scholarship", label: "სტიპენდია / Scholarship" },
                { name: "technology", label: "ტექნოლოგიები / Technologies" },
              ],
            },
            description: "ახალი კატეგორიის დასამატებლად საჭიროა დეველოპერი (data/ui.yml → categories). / A new category needs a developer (data/ui.yml → categories).",
          },
        ]
      : []),
    ...pair("summary", "მოკლე აღწერა / Summary", "text", {
      both: { description: "1–2 წინადადება ბარათისთვის და გვერდის თავში. / 1–2 sentences for the card and the top of the page." },
      ka: { required: true },
    }),
    {
      name: "cover",
      label: "მთავარი ფოტო / Cover image",
      type: "image",
      options: img(`src/assets/uploads/${folder}`),
      description: "JPG, PNG ან WebP, სასურველია ≥ 1600 px სიგანის. საიტი ავტომატურად ამზადებს მცირე ვერსიებს. / JPG or PNG, ideally ≥ 1600 px wide. The site makes the small versions automatically.",
    },
    {
      name: "cover_crop",
      label: "ფოტოს ჩამოჭრა ბარათებზე / Cover cropping on cards",
      type: "select",
      default: "center",
      options: {
        values: [
          { name: "center", label: "ცენტრი (ჩვეულებრივ) / Keep the centre (default)" },
          { name: "top", label: "ზედა ნაწილი / Keep the top" },
          { name: "bottom", label: "ქვედა ნაწილი / Keep the bottom" },
          { name: "left", label: "მარცხენა ნაწილი / Keep the left side" },
          { name: "right", label: "მარჯვენა ნაწილი / Keep the right side" },
          { name: "none", label: "მთლიანი სურათი, ჩამოჭრის გარეშე / Whole image, no cropping" },
        ],
      },
      description: "ბარათებზე ფოტო ჩარჩოში ჩამოიჭრება. თუ სურათზე კიდესთან ტექსტია (მაგ. ბანერი), აირჩიეთ „მთლიანი სურათი“ ან მხარე, რომელიც უნდა ჩანდეს. / Cards crop the cover to their frame. For graphics with text near the edges choose “Whole image”, or the side that must stay visible.",
    },
    ...pair("cover_alt", "ფოტოს აღწერა (alt) / Cover image description (alt)", "string", {
      both: { description: "მოკლედ აღწერეთ, რა ჩანს ფოტოზე (უსინათლო მკითხველებისთვის). თუ ცარიელია, გამოიყენება სათაური. / Describe what the photo shows (for blind readers). If empty, the title is used." },
    }),
    ...pair("body", "ტექსტი / Text", "rich-text", { both: markdown(folder) }),
    {
      name: "gallery",
      label: "ფოტოგალერეა / Photo gallery",
      type: "object",
      list: { collapsible: { collapsed: true, summary: "{index}. {image}" } },
      fields: [
        { name: "image", label: "ფოტო / Photo", type: "image", required: true, options: img(`src/assets/uploads/${folder}`) },
        { name: "alt_ka", label: ka("ფოტოს აღწერა / Description"), type: "string" },
        { name: "alt_en", label: en("ფოტოს აღწერა / Description"), type: "string" },
        {
          name: "crop",
          label: "მინიატურა / Thumbnail",
          type: "select",
          options: {
            values: [
              { name: "center", label: "ჩამოჭრილი ჩარჩოში (ჩვეულებრივ) / Cropped to the frame (default)" },
              { name: "none", label: "მთლიანი სურათი (ტექსტიანი გრაფიკისთვის) / Whole image (for graphics with text)" },
            ],
          },
        },
      ],
      description: "არასავალდებულო. ფოტოები ტექსტის ქვემოთ ჩანს. / Optional. Shown below the text.",
    },
    ...(kind === "project"
      ? [
          {
            name: "featured",
            label: "მთავარ გვერდზე დიდად / Featured on the home page",
            type: "boolean",
            default: false,
            description: "მონიშნული პროექტი მთავარ გვერდზე დიდი ფოტოთი ჩანს (თუ რამდენიმეა მონიშნული — უახლესი). / The ticked project is shown large on the home page (if several are ticked, the newest).",
          },
        ]
      : []),
    {
      name: "draft",
      label: "სამუშაო ვერსია (არ გამოქვეყნდეს) / Draft (do not publish)",
      type: "boolean",
      default: false,
      description: "მონიშნული ჩანაწერი საიტზე არ ჩანს. / Ticked entries are not shown on the website.",
    },
  ];
}

const commit = (what) => ({
  templates: {
    create: `${what}: create {filename} (Pages CMS, {userName})`,
    update: `${what}: update {filename} (Pages CMS, {userName})`,
    delete: `${what}: delete {filename} (Pages CMS, {userName})`,
    rename: `${what}: rename {oldFilename} → {newFilename} (Pages CMS, {userName})`,
  },
});

/* ---------- Interface text (data/ui.yml) ---------- */
const GROUP_LABELS = {
  nav: "მენიუ / Menu",
  buttons: "ღილაკები / Buttons",
  labels: "წარწერები / Labels",
  categories: "პროექტის კატეგორიები / Project categories",
  join: "ბლოკი „შემოგვიერთდი“ / “Join us” block",
  donate: "შემოწირულობის გვერდი / Donate page",
  facebook: "Facebook ბლოკი / Facebook block",
  contact: "კონტაქტი / Contact",
  home: "მთავარი გვერდი / Home page",
  item: "პროექტის / სიახლის გვერდი / Project and news pages",
  footer: "ქვედა ნაწილი / Footer",
  privacy: "კონფიდენციალურობა / Privacy",
  not_found: "გვერდი 404 / Page 404",
  redirect: "გადამისამართება / Redirect page",
};
const ui = loadYaml(fs.readFileSync("data/ui.yml", "utf8"));
const uiFields = Object.entries(ui).map(([group, entries]) => ({
  name: group,
  label: GROUP_LABELS[group] || group,
  type: "object",
  fields: Object.entries(entries).map(([key, value]) => ({
    name: key,
    label: `${value.ka || value.en || key} (${group}.${key})`,
    component: String(value.ka ?? "").length > 60 || String(value.en ?? "").length > 60 ? "t_long" : "t",
  })),
}));

const config = {
  settings: {
    // Keep keys that are not in a form (e.g. `legacy`, `order`) when an editor saves a file.
    content: { merge: true },
    commit: { identity: "app" },
  },
  media: [
    {
      name: "uploads",
      label: "სურათები და ფაილები / Images and files",
      input: "src/assets/uploads",
      output: "/assets/uploads",
      rename: "safe",
      extensions: [...IMAGE_EXT, "pdf"],
    },
    {
      name: "facebook",
      label: "Facebook-ის სურათები (ავტომატური) / Facebook images (automatic)",
      input: "src/assets/facebook",
      output: "/assets/facebook",
      extensions: IMAGE_EXT,
    },
  ],
  components: {
    t: {
      type: "object",
      fields: [
        { name: "ka", label: "ქართული / Georgian", type: "string" },
        { name: "en", label: "English", type: "string" },
      ],
    },
    t_long: {
      type: "object",
      fields: [
        { name: "ka", label: "ქართული / Georgian", type: "text" },
        { name: "en", label: "English", type: "text" },
      ],
    },
  },
  content: [
    {
      name: "news",
      label: "სიახლეები / News",
      type: "collection",
      path: "content/news",
      format: "yaml-frontmatter",
      filename: { template: "{fields.slug}.md", field: false },
      view: { fields: ["title_ka", "date", "draft"], primary: "title_ka", sort: ["date", "title_ka"], search: ["title_ka", "title_en"], default: { sort: "date", order: "desc" } },
      fields: itemFields("news"),
      commit: commit("News"),
    },
    {
      name: "projects",
      label: "პროექტები / Projects",
      type: "collection",
      path: "content/projects",
      format: "yaml-frontmatter",
      filename: { template: "{fields.slug}.md", field: false },
      view: { fields: ["title_ka", "date", "category", "draft"], primary: "title_ka", sort: ["date", "title_ka"], search: ["title_ka", "title_en"], default: { sort: "date", order: "desc" } },
      fields: itemFields("project"),
      commit: commit("Projects"),
    },
    {
      name: "facebook",
      label: "Facebook პოსტები / Facebook posts",
      type: "collection",
      path: "content/facebook",
      format: "yaml-frontmatter",
      // Posts are imported automatically every day. Hide a post by unticking "show"; do not delete it
      // (a deleted post would be imported again).
      operations: { create: false, rename: false, delete: false },
      view: { fields: ["show", "date", "title"], primary: "title", sort: ["date"], search: ["title", "body"], default: { sort: "date", order: "desc" } },
      fields: [
        {
          name: "show",
          label: "ჩანდეს საიტზე / Show on website",
          type: "boolean",
          default: true,
          description: "მოხსენით მონიშვნა, რომ პოსტი საიტზე აღარ გამოჩნდეს. ახალი პოსტები ავტომატურად ჩანს. / Untick to hide this post on the website. New posts are shown automatically.",
        },
        { name: "title", label: "პოსტის პირველი სტრიქონი / First line of the post", type: "string", readonly: true },
        { name: "date", label: "გამოქვეყნდა Facebook-ზე / Published on Facebook", type: "string", readonly: true },
        { name: "link", label: "ბმული Facebook-ზე / Link on Facebook", type: "string", readonly: true },
        {
          name: "images",
          label: "სურათები / Images",
          type: "image",
          options: { media: "facebook", path: "src/assets/facebook", multiple: { max: 10 }, extensions: IMAGE_EXT },
          description: "Facebook-იდან გადმოწერილი. შეგიძლიათ წაშალოთ ზედმეტი სურათი. / Downloaded from Facebook. You may remove an image.",
        },
        ...pair("image_alt", "ფოტოს აღწერა (alt) / Image description (alt)", "string", {
          both: { description: "არასავალდებულო: რა ჩანს პირველ ფოტოზე (უსინათლო მკითხველებისთვის). თუ ცარიელია: „ფოტო ფონდის Facebook-პოსტიდან“. / Optional: what the first photo shows (for blind readers). If empty: “Photo from the Fund’s Facebook post”." },
        }),
        {
          name: "body",
          label: "პოსტის ტექსტი / Post text",
          type: "text",
          description: "Facebook-იდან გადმოტანილი. შეცვალეთ მხოლოდ შეცდომის გასასწორებლად. / Copied from Facebook. Edit only to fix a mistake.",
        },
        { name: "id", label: "Facebook ID", type: "string", readonly: true, hidden: true },
      ],
      commit: commit("Facebook"),
    },
    {
      name: "pages",
      label: "გვერდები / Pages",
      type: "group",
      items: [
        {
          name: "home",
          label: "მთავარი გვერდი / Home page",
          type: "file",
          path: "content/pages/home.yml",
          format: "yaml",
          operations: { delete: false },
          fields: [
            { name: "hero", label: "პირველი ეკრანი / Top of the page", type: "object", fields: [...pair("title", "სათაური / Title"), ...pair("tagline", "ქვესათაური / Tagline")] },
            {
              name: "quote",
              label: "ნიკოს ციტატა / Nico's quote",
              type: "object",
              fields: [
                { name: "image", label: "ფოტო / Photo", type: "image", options: img("src/assets/uploads/pages") },
                ...pair("image_alt", "ფოტოს აღწერა / Photo description"),
                ...pair("text", "ციტატა / Quote", "rich-text", { both: { options: { format: "markdown", media: false } } }),
                ...pair("attribution", "ავტორი / Attribution"),
                ...pair("role", "ავტორის შესახებ (მაგ. „Feedc-ის შემქმნელი“) / About the author (e.g. “Creator of Feedc”)"),
              ],
            },
            {
              name: "goal",
              label: "ჩვენი მიზანი + ფილმი / Our goal + film",
              type: "object",
              fields: [
                ...pair("heading", "სათაური / Heading"),
                ...pair("body", "ტექსტი / Text", "rich-text", { both: { options: { format: "markdown", media: false } } }),
                { name: "video", label: "ვიდეო (MP4) / Video (MP4)", type: "string", readonly: true, description: "იცვლება დეველოპერის მიერ (დიდი ფაილი). / Changed by a developer (large file)." },
                { name: "poster", label: "ვიდეოს გარეკანი / Video poster", type: "string", readonly: true },
                { name: "subtitles_en", label: "ინგლისური სუბტიტრები (WebVTT) / English subtitles (WebVTT)", type: "string", readonly: true, description: "იცვლება დეველოპერის მიერ. / Changed by a developer." },
                { name: "captions_ka", label: "ქართული სუბტიტრები (WebVTT) / Georgian captions (WebVTT)", type: "string", readonly: true, description: "ჯერ არ არსებობს (იხ. docs/OWNER_REVIEW.md #18). დეველოპერი ამატებს ფაილს, მაგ. /assets/video/film.ka.vtt; ქართულ გვერდზე ავტომატურად ჩაირთვება. / Not yet available (see docs/OWNER_REVIEW.md #18). A developer adds the file, e.g. /assets/video/film.ka.vtt; it is switched on by default on Georgian pages." },
                ...pair("transcript", "ფილმის ტექსტი (ტრანსკრიპტი) / Transcript of the film", "rich-text", {
                  both: { options: { format: "markdown", media: false } },
                  ka: { description: "ქართული ტრანსკრიპტი ჯერ არ არსებობს: სანამ ცარიელია, ქართულ გვერდზე ინგლისური ტექსტი ჩანს. / No Georgian transcript yet: while empty, the Georgian page shows the English one." },
                }),
              ],
            },
            { name: "mission", label: "მისია / Mission", type: "object", fields: [...pair("heading", "სათაური / Heading"), ...pair("body", "ტექსტი / Text", "rich-text", { both: { options: { format: "markdown", media: false } } })] },
            {
              name: "projects",
              label: "დაფინანსებული პროექტები / Funded projects",
              type: "object",
              fields: [...pair("heading", "სათაური / Heading"), { name: "count", label: "რამდენი პროექტი ჩანდეს დიდი პროექტის ქვემოთ / How many projects to show below the featured one", type: "number", options: { min: 1, max: 12 } }],
            },
            {
              name: "news",
              label: "სიახლეები / News",
              type: "object",
              fields: [...pair("heading", "სათაური / Heading"), { name: "count", label: "რამდენი სიახლე ჩანდეს / How many news items to show", type: "number", options: { min: 1, max: 6 } }],
            },
          ],
        },
        {
          name: "about",
          label: "ჩვენ შესახებ / About",
          type: "file",
          path: "content/pages/about.yml",
          format: "yaml",
          operations: { delete: false },
          fields: [
            ...pair("description", "აღწერა საძიებო სისტემებისთვის / Description for search engines", "text", { both: { description: "1 წინადადება; ჩანს Google-ში და გაზიარებისას. / One sentence; shown in search results and link previews." } }),...pair("title", "სათაური / Title"), ...pair("body", "ტექსტი / Text", "rich-text", { both: markdown("pages") })],
        },
        {
          name: "projects_page",
          label: "პროექტების გვერდი / Projects page",
          type: "file",
          path: "content/pages/projects.yml",
          format: "yaml",
          operations: { delete: false },
          fields: [
            ...pair("description", "აღწერა საძიებო სისტემებისთვის / Description for search engines", "text", { both: { description: "1 წინადადება; ჩანს Google-ში და გაზიარებისას. / One sentence; shown in search results and link previews." } }),...pair("label", "მცირე სათაური / Small label"), ...pair("title", "დიდი სათაური / Large title")],
        },
        {
          name: "news_page",
          label: "სიახლეების გვერდი / News page",
          type: "file",
          path: "content/pages/news.yml",
          format: "yaml",
          operations: { delete: false },
          fields: [
            ...pair("description", "აღწერა საძიებო სისტემებისთვის / Description for search engines", "text", { both: { description: "1 წინადადება; ჩანს Google-ში და გაზიარებისას. / One sentence; shown in search results and link previews." } }),
            ...pair("title", "სათაური / Title"),
            ...pair("intro", "შესავალი / Intro", "text"),
            { name: "facebook_limit", label: "რამდენი Facebook პოსტი ჩანდეს / How many Facebook posts to list", type: "number", options: { min: 0, max: 100 }, description: "ნაგულისხმევი 24 / Default 24" },
          ],
        },
        {
          name: "donate",
          label: "შემოგვიერთდი (შემოწირულობა) / Join us (donate)",
          type: "file",
          path: "content/pages/donate.yml",
          format: "yaml",
          operations: { delete: false },
          fields: [
            ...pair("description", "აღწერა საძიებო სისტემებისთვის / Description for search engines", "text", { both: { description: "1 წინადადება; ჩანს Google-ში და გაზიარებისას. / One sentence; shown in search results and link previews." } }),...pair("label", "მცირე სათაური / Small label"), ...pair("title", "სათაური / Title"), ...pair("intro", "შესავალი / Intro", "text")],
        },
        {
          name: "join",
          label: "ბლოკი „შემოგვიერთდი“ (ყველა გვერდის ბოლოს) / “Join us” band (end of every page)",
          type: "file",
          path: "content/pages/join.yml",
          format: "yaml",
          operations: { delete: false },
          fields: [
            {
              name: "testimonial",
              label: "ბენეფიციარის სიტყვები / A beneficiary’s words",
              type: "object",
              description: "ჩანს „შემოგვიერთდი“ ბლოკში (ყველა გვერდის ბოლოს, გარდა იმ გვერდისა, საიდანაც ციტატაა) და შემოწირულობის გვერდზე. ციტატა სიტყვასიტყვით (ახლა: ტერენტი გრანელის სტიპენდიის გვერდიდან), ბრჭყალების გარეშე. დასამალად წაშალეთ ქართული ციტატა. / Shown in the “Join us” band (end of every page except the page the quote comes from) and on the Donate page. Quote word for word (now: from the Terenti Graneli Scholarship page), without quotation marks. Delete the Georgian quote to hide it.",
              fields: [
                ...pair("quote", "ციტატა / Quote", "text"),
                ...pair("name", "სახელი / Name"),
                ...pair("role", "ვინ არის / Who they are"),
                { name: "link", label: "ბმული (გვერდის მისამართი, მაგ. projects/terenti-graneli-scholarship/) / Link (page address)", type: "string" },
                { name: "image", label: "ფოტო / Photo", type: "image", options: img("src/assets/uploads/projects") },
                ...pair("image_alt", "ფოტოს აღწერა / Photo description"),
              ],
            },
          ],
        },
        {
          name: "contact",
          label: "კონტაქტი / Contact",
          type: "file",
          path: "content/pages/contact.yml",
          format: "yaml",
          operations: { delete: false },
          fields: [
            ...pair("description", "აღწერა საძიებო სისტემებისთვის / Description for search engines", "text", { both: { description: "1 წინადადება; ჩანს Google-ში და გაზიარებისას. / One sentence; shown in search results and link previews." } }),...pair("title", "სათაური / Title"), ...pair("intro", "ტექსტი (არასავალდებულო) / Text (optional)", "rich-text", { both: { options: { format: "markdown", media: false } } })],
        },
        {
          name: "privacy",
          label: "კონფიდენციალურობა / Privacy",
          type: "file",
          path: "content/pages/privacy.yml",
          format: "yaml",
          operations: { delete: false },
          fields: [
            ...pair("description", "აღწერა საძიებო სისტემებისთვის / Description for search engines", "text", { both: { description: "1 წინადადება; ჩანს Google-ში და გაზიარებისას. / One sentence; shown in search results and link previews." } }),
            { name: "draft", label: "სამუშაო ვერსია (ნიშანი „Draft“) / Draft (shows a “Draft” badge)", type: "boolean", description: "მოხსენით მონიშვნა, როცა ფონდი ტექსტს დაამტკიცებს (იხ. docs/OWNER_REVIEW.md #8). / Untick once the Fund has approved the text (see docs/OWNER_REVIEW.md #8)." },
            { name: "updated", label: "ბოლო განახლება / Last updated", type: "date", options: { format: "yyyy-MM-dd" } },
            ...pair("title", "სათაური / Title"),
            ...pair("body", "ტექსტი / Text", "rich-text", { both: { options: { format: "markdown", media: false } } }),
          ],
        },
      ],
    },
    {
      name: "settings",
      label: "პარამეტრები / Settings",
      type: "group",
      items: [
        {
          name: "site",
          label: "საიტის პარამეტრები / Site settings",
          type: "file",
          path: "data/site.yml",
          format: "yaml",
          operations: { delete: false },
          fields: [
            ...pair("name", "ფონდის სახელი / Fund name"),
            { name: "brand", label: "ბრენდი / Brand", type: "string" },
            ...pair("legal_name", "იურიდიული სახელი / Legal name"),
            ...pair("slogan", "სლოგანი (ქვედა კოლონტიტული) / Slogan (footer)"),
            ...pair("description", "საიტის აღწერა (საძიებო სისტემებისთვის) / Site description (for search engines)", "text", { both: { description: "გამოიყენება Google-ში და გაზიარებისას, როცა გვერდს საკუთარი აღწერა არ აქვს. / Used in search results and link previews when a page has no description of its own." } }),
            { name: "founded", label: "დაარსდა (YYYY-MM) / Founded (YYYY-MM)", type: "string" },
            { name: "copyright_start", label: "© საწყისი წელი / © first year", type: "number" },
            { name: "email", label: "ელფოსტა / Email", type: "string", required: true },
            {
              name: "social",
              label: "სოციალური ქსელები / Social media",
              type: "object",
              fields: [
                { name: "facebook", label: "Facebook (URL)", type: "string" },
                { name: "instagram", label: "Instagram (URL)", type: "string" },
                { name: "instagram_handle", label: "Instagram (@name)", type: "string" },
              ],
            },
          ],
        },
        {
          name: "ui",
          label: "ინტერფეისის ტექსტები / Interface text",
          type: "file",
          path: "data/ui.yml",
          format: "yaml",
          operations: { delete: false },
          fields: uiFields,
        },
        {
          name: "bank",
          label: "საბანკო რეკვიზიტები / Bank details",
          type: "file",
          path: "data/bank.yml",
          format: "yaml",
          operations: { delete: false },
          fields: [
            { name: "pdf", label: "რეკვიზიტების PDF / Bank details PDF", type: "file", options: { media: "uploads", path: "src/assets/uploads", extensions: ["pdf"] }, description: "ბანკის მიერ გაცემული PDF. ყველა ქვემოთ მოცემული მონაცემი ზუსტად ამ PDF-იდან უნდა იყოს გადაწერილი. ახალი PDF-ის ატვირთვისას განაახლეთ თარიღიც. / The PDF issued by the bank: every value below must be copied exactly from it. When you upload a new PDF, update the date too." },
            { name: "pdf_date", label: "PDF-ის თარიღი (YYYY-MM) / PDF date (YYYY-MM)", type: "string" },
            ...pair("purpose", "გადარიცხვის დანიშნულება / Payment reference"),
            ...pair("beneficiary", "მიმღები (ზუსტად როგორც ბანკის დოკუმენტში) / Beneficiary (exactly as in the bank document)", "string", { both: { description: "შემომწირველები ამას ბანკის ფორმაში აკოპირებენ: არ თარგმნოთ და არ შეცვალოთ. / Donors copy this into their bank form: never translate or reformat it." } }),
            {
              name: "iban",
              label: "IBAN",
              type: "string",
              required: true,
              pattern: { regex: "^GE[0-9]{2}[A-Z]{2}[0-9]{16}$", message: "ქართული IBAN, ჰარების გარეშე / A Georgian IBAN without spaces" },
              description: "ჰარების გარეშე, ზუსტად PDF-დან; საიტი თავად ყოფს ოთხ-ოთხ სიმბოლოდ. / Without spaces, exactly as in the PDF; the site groups it in fours itself.",
            },
            ...pair("account_type", "ანგარიშის ტიპი / Account type"),
            ...pair("bank_name", "ბანკი / Bank", "string", { ka: { description: "ზუსტად როგორც PDF-ის 1-ელ გვერდზე (სწორი ბრჭყალებით): სს \"საქართველოს ბანკი\". / Exactly as on page 1 of the PDF (straight quotes)." } }),
            {
              name: "account_with_institution",
              label: "მიმღები ბანკი დოლარისა და ევროსთვის (Account With Institution) / Beneficiary’s bank for USD and EUR (Account With Institution)",
              type: "string",
              description: "SWIFT-ის ველი 57, ზუსტად როგორც PDF-ის მე-2 და მე-3 გვერდზე: Bank of Georgia. / SWIFT field 57, exactly as on pages 2 and 3 of the PDF: Bank of Georgia.",
            },
            { name: "bank_swift", label: "ბანკის SWIFT / Bank SWIFT", type: "string" },
            ...pair("bank_address", "ბანკის მისამართი / Bank address"),
            {
              name: "currencies",
              label: "ვალუტები / Currencies",
              type: "object",
              list: { collapsible: { collapsed: true, summary: "{code}" } },
              fields: [
                { name: "code", label: "ვალუტა / Currency", type: "select", options: { values: ["GEL", "USD", "EUR"] } },
                { name: "intermediary_bank", label: "შუამავალი ბანკი / Intermediary bank", type: "string" },
                { name: "intermediary_swift", label: "შუამავალი ბანკის SWIFT / Intermediary SWIFT", type: "string" },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const header = `# Pages CMS configuration — https://pagescms.org/docs/configuration/
# GENERATED by scripts/generate-pages-yml.mjs (npm run cms:config). Do not edit by hand.
`;
const out = header + dumpYaml(config);
if (process.argv.includes("--check")) {
  const current = fs.existsSync(".pages.yml") ? fs.readFileSync(".pages.yml", "utf8") : "";
  if (current !== out) {
    console.error(".pages.yml is out of date: run `npm run cms:config`");
    process.exit(1);
  }
  console.log(".pages.yml is up to date");
} else {
  fs.writeFileSync(".pages.yml", out);
  console.log("wrote .pages.yml");
}
