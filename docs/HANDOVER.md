# nkfund.world: handover sheet

One page: what runs where, what it costs, who holds which login, and what to check each year.
*Last updated: 20 October 2026. Update this page whenever something changes.*

## 1. What runs where

| Piece | Where | What it does | Cost |
|---|---|---|---|
| **Website code and content** | GitHub repository **`ernabgd/nkfund-website`** (<https://github.com/ernabgd/nkfund-website>) | All pages, texts (Georgian + English), photos, settings | Free (public repository) |
| **Publishing** | **GitHub Actions**, workflow **deploy** | Rebuilds the site whenever content changes | Free: standard runners are free for public repositories ([GitHub Docs](https://docs.github.com/en/actions/concepts/billing-and-usage)) |
| **Hosting** | **GitHub Pages**, with free HTTPS that renews itself | Serves the site | Free for public repositories. Soft limits: 1 GB site, about 100 GB traffic per month ([GitHub Docs](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)) |
| **Editing** | **Pages CMS**: <https://app.pagescms.org> (settings file `.pages.yml` in the repo) | Non-technical editors add news and projects in both languages and tick/untick Facebook posts | Free. Sign in with GitHub, or editors without GitHub get an **email invite** as collaborators ([Pages CMS](https://pagescms.org/docs/configuration/collaborators/)) |
| **Facebook feed** | GitHub Actions workflow **Facebook sync**, daily. Secrets `FB_PAGE_ID`, `FB_PAGE_TOKEN`. Meta app "nkfund website" | Copies new Page posts into the site. Each post has a "Show on website" tick box. | Free. Setup: [META_SETUP.md](META_SETUP.md) |
| **Domain** `nkfund.world` | Now **GoDaddy** → moving to **Cloudflare Registrar** | The address | €80.49/yr at GoDaddy → about **US$32/yr** at Cloudflare. [DOMAIN_TRANSFER.md](DOMAIN_TRANSFER.md) |
| **DNS** (the domain's address book) | Now **GoDaddy** → **Cloudflare** (free plan) | Points the website to GitHub and the email to Zoho | Free |
| **Email** `hello@nkfund.world` | Now **Microsoft 365 via GoDaddy** → **Zoho Mail** | Fund mailbox; also the login email for most accounts | €23.97/quarter → **US$12/yr** (Mail Lite) or free. [EMAIL_ZOHO.md](EMAIL_ZOHO.md) |
| **Old website** | **Wix** | Being retired | €60/month → €0. [GO-LIVE.md](GO-LIVE.md) |
| **Archive of the old website** | Text: repository folder **`docs/archive/wix-2026-10/`**. Photos and videos (242 MB zip): GitHub → Releases → **`wix-archive-2026-10`** (uploaded in [GO-LIVE.md](GO-LIVE.md) step 6) | Everything the Wix site contained, in case it is ever needed again | Free |

**Settings that switch the site between "preview" and "real":** the custom domain in Settings → Pages decides it automatically (preview under `/nkfund-website/` = hidden from Google; nkfund.world = public). The repository variable **`SITE_URL`** (`https://nkfund.world` once live) sets the address used in search-engine and social-media links. **`PATH_PREFIX`** and **`PREVIEW`** variables can override the automatic choice but are normally not set. All are under Settings → Secrets and variables → Actions → Variables.

## 2. Dates and money

| Date | What | Action |
|---|---|---|
| **by ~4 Nov 2026** | Website go-live | [GO-LIVE.md](GO-LIVE.md) |
| **by ~8 Nov 2026** | Email to Zoho | [EMAIL_ZOHO.md](EMAIL_ZOHO.md) |
| **by 15 Nov 2026** at the latest | Start the domain transfer | [DOMAIN_TRANSFER.md](DOMAIN_TRANSFER.md) |
| **before 18 Nov 2026** | Wix plan renews (€60) | **Cancel** after the new site has been live for a few days. Export form submissions first. |
| **28 Nov 2026** | Safety check | Is the domain at Cloudflare? If not, renew at GoDaddy. |
| **before 2 Dec 2026** | Microsoft 365 renews (€23.97) | **Cancel** after a week on Zoho, with a backup saved |
| **3 Dec 2026** | GoDaddy domain renewal (€80.49) | Avoided by the transfer |
| **every 3 Dec** (from 2027) | Domain renewal at Cloudflare (about US$32) | Automatic. Cloudflare charges about **30 days before**, i.e. early November ([Cloudflare](https://developers.cloudflare.com/registrar/faq/)). |
| **yearly, on the sign-up date** | Zoho Mail Lite (US$12 per user) | Automatic |
| **by mid-2028** | Facebook Graph API version | A developer raises the version number in the sync script (see section 4) |

## 3. Who holds which login (fill in)

Keep passwords in a password manager, not in this file. Turn on 2-factor login everywhere.

| Account | Login / username | Person responsible | 2FA on? | Recovery codes kept at |
|---|---|---|---|---|
| GitHub `ernabgd` (repo, Actions, Pages, secrets) | ___ | ___ | ☐ | ___ |
| Pages CMS editors | GitHub sign-in or email invite | ___ | – | – |
| Facebook Page admin(s) | ___ | ___ | ☐ | ___ |
| Meta developer app "nkfund website" (whoever created the token) | ___ | ___ | ☐ | ___ |
| Cloudflare (DNS + domain) | hello@nkfund.world | ___ | ☐ | ___ |
| Zoho Mail admin | hello@nkfund.world | ___ | ☐ | ___ |
| Instagram @nicokfund | ___ | ___ | ☐ | ___ |
| GoDaddy (until closed) | ___ | ___ | ☐ (SMS) | ___ |
| Wix (until closed) | ___ | ___ | ☐ | ___ |
| Domain registrant email (at GoDaddy) | The registrant e-mail on file at GoDaddy (ask the owner; kept outside this public repository). Change it to hello@ **after** the transfer. | ___ | | |

**Payment card used for:** Cloudflare (domain), Zoho. Card ends in ____, expires __/__.

## 4. Yearly checklist (every October)

- [ ] **The payment card for Cloudflare and Zoho is valid** past next December. An unpaid domain takes the website **and** email offline.
- [ ] Cloudflare → Domain Registration: **auto-renew ON**, expiry date in the future.
- [ ] **Facebook sync is still updating:** **Actions → Facebook sync** shows recent green ticks, and the newest Facebook post appears on the home page. A red run whose failed job is **"Facebook import health"** means the import has failed for 7 days (usually an expired token); the website itself is still published.
  - If the workflow says **"disabled"**: GitHub switches off scheduled jobs in public repositories after **60 days without any repository activity** ([GitHub Docs](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)). Click **Enable workflow**, then **Run workflow**.
  - If it **fails with a token error**: reconnect as in [META_SETUP.md](META_SETUP.md).
- [ ] **Graph API version.** Look in the Facebook sync script for `graph.facebook.com/vNN.0` and compare with Meta's [changelog](https://developers.facebook.com/docs/graph-api/changelog). Versions last about 2 years; for example, v25.0 is available until 29 July 2028. When the version in the script is within about 6 months of its end date, ask a developer to raise it and test with **Run workflow**.
- [ ] The website opens at <https://nkfund.world> with a padlock. Spot-check the Donate page: the bank details are still correct.
- [ ] Email: send a test from Gmail and check "Show original" → SPF/DKIM/DMARC PASS.
- [ ] Review this page and the logins table: is everyone still the right person? Remove people who have left the Fund (GitHub, Facebook Page roles, Meta app roles, Cloudflare, Zoho, Pages CMS).
- [ ] Footer year updates automatically. The privacy notice is marked **draft** until the owner approves it.

## 5. When something breaks

| Symptom | First check | Then |
|---|---|---|
| Website down or showing an old version | <https://www.githubstatus.com>; repo **Actions → deploy**: last run green? | A red run: open it, read the error, re-run. DNS: [GO-LIVE.md](GO-LIVE.md) "What can go wrong". |
| "Your connection is not private" | Repo **Settings → Pages**: custom domain green, Enforce HTTPS ticked | Remove and re-add the custom domain ([GitHub Docs](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)) |
| **Website and email down together** | **Domain expired?** (Cloudflare → Domain Registration) | Renew immediately |
| Email not arriving | Zoho Admin Console → Domains: MX verified? Google [Dig tool](https://toolbox.googleapps.com/apps/dig/) → MX | [EMAIL_ZOHO.md](EMAIL_ZOHO.md) |
| Facebook posts stopped appearing, or a red **"Facebook import health"** job | **Actions → Facebook sync** log (the error is in the "Facebook import health" job and in `data/facebook-sync.json` → `lastError`) | [META_SETUP.md](META_SETUP.md) → "Reconnect" |
| A wrong Facebook post is on the website | Pages CMS → Facebook posts | Untick **Show on website** |
| The Facebook token may have leaked | The token's creator **changes their Facebook password** (this kills the token) | Make a new token and update the `FB_PAGE_TOKEN` secret |
| An editor can't log in to Pages CMS | Are they a repo collaborator or an invited collaborator? | Re-invite from Pages CMS |

GitHub emails failures of the daily Facebook job to **the person who last edited its schedule** ([GitHub Docs](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)). Make sure that person reads their GitHub email.

## 6. Useful links

Repository <https://github.com/ernabgd/nkfund-website> · Pages CMS <https://app.pagescms.org> · Cloudflare <https://dash.cloudflare.com> · Zoho Mail <https://mail.zoho.com> / Admin <https://mailadmin.zoho.com> · Meta apps <https://developers.facebook.com/apps/> · Token debugger <https://developers.facebook.com/tools/debug/accesstoken/> · Facebook Page <https://www.facebook.com/profile.php?id=100089583201087> · Instagram <https://www.instagram.com/nicokfund/> · GitHub status <https://www.githubstatus.com> · DNS checker <https://toolbox.googleapps.com/apps/dig/> · Open owner questions: [OWNER_REVIEW.md](OWNER_REVIEW.md)
