# Go live: point nkfund.world at the new website

This guide moves **nkfund.world** from the old Wix site to the new site on GitHub Pages (repository `ernabgd/nkfund-website`). **Email is not touched.** Every email record stays as it is.

- **Time needed:** about 1 hour of your time, then up to 24 hours of waiting for DNS and the security certificate.
- **Who does it:** whoever can log in to **GoDaddy** (the SMS codes go to that person's phone) and to the **GitHub account `ernabgd`**.
- **When:** **by about 4 November 2026.** The Wix plan renews on **18 November 2026** (€60/month). Going live two weeks early leaves time to switch back to Wix if something goes wrong.

> **Names this guide uses.** The website's build has three settings: **`SITE_URL`** (the site's address), **`PATH_PREFIX`** (sub-folder) and **`PREVIEW`** (hidden from search engines). They can be stored as *repository variables* in GitHub (Settings → Secrets and variables → Actions → **Variables** tab). Normally only `SITE_URL` is set; the other two follow automatically from where GitHub Pages publishes the site (preview under `/nkfund-website/` → hidden; nkfund.world → visible). The workflow that publishes the site is **"Deploy site + Facebook sync"** in the repository's **Actions** tab (this guide calls it the **deploy** workflow). If the repository README gives different names, the README is right.

---

## Before you start: checklist

1. You have approved the preview at <https://ernabgd.github.io/nkfund-website/>.
2. Your phone is nearby. **GoDaddy sends an SMS code for every DNS change.** Expect 6 to 12 codes.
3. You can log in to GitHub as `ernabgd`.
4. You have 1 hour without interruptions.

### Step 0: photograph the current DNS (your safety net)

1. Log in to GoDaddy and open **Domain Portfolio**. Click **nkfund.world**, then **DNS**.
2. **Take screenshots of every record**, scrolling to the bottom of the list. Save them in a folder named `nkfund DNS before go-live <date>`.
3. You should see these records (as of October 2026):

| Type | Name | Value | Leave alone? |
|---|---|---|---|
| A | @ | 23.236.62.147 | **No.** This is Wix. It is replaced in Step 3. |
| CNAME | www | balancer.wixdns.net | **No.** This is Wix. It is replaced in Step 3. |
| MX | @ | 0 nkfund-world.mail.protection.outlook.com | **Yes**: email |
| TXT | @ | v=spf1 include:secureserver.net -all | **Yes**: email |
| TXT | @ | NETORGFT12416451.onmicrosoft.com | **Yes**: email (Microsoft 365) |
| TXT | _dmarc | v=DMARC1; p=none; rua=mailto:hello@nkfund.world | **Yes**: email |
| CNAME | autodiscover, email, lyncdiscover, msoid, sip | (Microsoft values) | **Yes**: email |
| CNAME | _domainconnect | (GoDaddy value) | **Yes** |
| SRV | _sip, _sipfederationtls | (Microsoft values) | **Yes**: email |

**Only the two Wix records change.** If you are about to delete anything other than those two, stop.

---

## Step 1: verify the domain in GitHub (protects against takeover)

Verifying proves to GitHub that the domain belongs to you. Then nobody else on GitHub can publish a site on nkfund.world, even if the repository is ever deleted or Pages is switched off. ([GitHub Docs: Verifying your custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages))

1. In GitHub, click your **profile picture** (top right), then **Settings**. These are your *profile* settings, not the repository's.
2. In the left sidebar, under "Code, planning, and automation", click **Pages**.
3. Click **Add a domain**, type `nkfund.world`, and click **Add domain**.
4. GitHub shows a **TXT record** to create. The name looks like `_github-pages-challenge-ernabgd`, followed by a long value. Leave this page open.
5. In GoDaddy, on the DNS page, click **Add New Record**:
   - **Type:** TXT
   - **Name:** `_github-pages-challenge-ernabgd`. GoDaddy adds `.nkfund.world` itself, so don't type it.
   - **Value:** paste the value from GitHub
   - **TTL:** leave the default
   - Click **Save** and enter the SMS code.
6. Wait 5 to 30 minutes, then go back to GitHub and click **Verify**. If you closed the page: Settings → Pages → the **⋯** menu next to the domain → **Continue verifying** → **Verify**.
7. **Never delete this TXT record.** GitHub checks it regularly to keep the domain verified.

> To check whether the record is visible yet, open <https://toolbox.googleapps.com/apps/dig/> (Google's DNS checker). Choose **TXT** and type `_github-pages-challenge-ernabgd.nkfund.world`.

---

## Step 2: tell GitHub Pages the site's address, and switch the build to "production"

Do Steps 2 and 3 **one after the other, in the same sitting**.

1. Open the repository **ernabgd/nkfund-website**, then **Settings → Pages** (in the sidebar, under "Code and automation").
2. Under **Custom domain**, type `nkfund.world` and click **Save**. ([GitHub Docs: Managing a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site))
   - GitHub may say the DNS check failed. **That is normal**: the DNS still points to Wix. Continue.
   - The site is published by GitHub Actions, so GitHub does not need a `CNAME` file in the repository. The setting you just saved is enough. ([same page](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site))
3. Switch the build from "preview" to "production":
   1. Go to **Settings → Secrets and variables → Actions**, then the **Variables** tab.
   2. Click **New repository variable**. Name: **`SITE_URL`**, value: **`https://nkfund.world`** (with `https`, no slash at the end). Click **Add variable**.
   3. If variables named **`PATH_PREFIX`** or **`PREVIEW`** exist, **delete them** (the trash-can icon). Without them the build uses `/` and "visible to search engines" automatically once the custom domain is set.

   *What these do:* `SITE_URL` is the address written into the links that search engines and Facebook read (canonical, language versions, sitemap, share pictures). `PATH_PREFIX` tells the site whether it lives in a sub-folder (`/nkfund-website/` on the preview) or at the root of its own domain (`/`). `PREVIEW` decides whether the site tells Google "don't index me". The build checks itself and **fails** (nothing is published) if a production build has an address that does not start with `https://`.
4. Publish again with the new settings: open the **Actions** tab, click the **deploy** workflow on the left, then **Run workflow → Run workflow**. ([GitHub Docs: Manually running a workflow](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow)) Wait for the green tick, about 2 to 4 minutes.

From now on the old preview address `ernabgd.github.io/nkfund-website/` forwards to `nkfund.world`. Until Step 3 is done, that still shows the Wix site. This is expected.

---

## Step 3: change the website records at GoDaddy

The two Wix records are **locked by a GoDaddy "Wix" template**, so you can't edit them one by one. Removing the template deletes **exactly** those two records (A `@` and CNAME `www`). The email records are not part of the template.

1. On the GoDaddy DNS page, find the **Wix** template or connection entry. Choose its **remove / disconnect** option and confirm with the SMS code.
2. Refresh the page. **Check:** A `@` 23.236.62.147 and CNAME `www` are gone, and **all the email records from Step 0 are still there**.
3. If GoDaddy has added a default **"Parked"** A record for `@` or any other new A record, delete it. Default records stop GitHub from working. ([GitHub Docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site))
4. Add **four A records**. Click **Add New Record** for each one: Type **A**, Name **`@`**, TTL default, Value:
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
5. Add **four AAAA records** (for IPv6 visitors). Type **AAAA**, Name **`@`**, Value:
   - `2606:50c0:8000::153`
   - `2606:50c0:8001::153`
   - `2606:50c0:8002::153`
   - `2606:50c0:8003::153`
6. Add **one CNAME record**. Type **CNAME**, Name **`www`**, Value **`ernabgd.github.io`**. Do **not** add the repository name. GitHub then sends `www.nkfund.world` to `nkfund.world` automatically.

These are the addresses GitHub publishes for custom domains. ([GitHub Docs: Managing a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site))

**Never add a wildcard record (`*`).** GitHub warns that it allows domain takeover, even on a verified domain. ([same page](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site))

---

## Step 4: wait, then turn on "Enforce HTTPS"

1. DNS changes can take **up to 24 hours** to reach everyone, but usually take less than 1 hour. ([GitHub Docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site))
2. In **repository Settings → Pages**, the custom-domain box should turn green (**DNS check successful**).
3. GitHub then requests a free security certificate from Let's Encrypt. This can take **up to an hour**. ([GitHub Docs: Troubleshooting custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages))
4. When the **Enforce HTTPS** checkbox becomes clickable, **tick it**. All visitors then use the secure `https://` address. ([GitHub Docs: Securing your site with HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https))
5. **Publish once more:** Actions → **deploy** → **Run workflow**. This build is the first one made after the domain and HTTPS are fully set up, so every address in it is final.

---

## Step 5: test everything (15 minutes)

Use a phone **on mobile data**, not Wi-Fi, as well as your computer. This avoids old cached answers.

- [ ] <https://nkfund.world> shows the **new** site, with a padlock in the address bar.
- [ ] <https://www.nkfund.world> lands on `https://nkfund.world`.
- [ ] `http://nkfund.world` (without the "s") switches to `https://`.
- [ ] The English version works: <https://nkfund.world/en/>. The language switcher moves between matching pages.
- [ ] Old Wix links still lead somewhere sensible, for example <https://nkfund.world/ourprojects> → Projects, `/donate` → Donate, `/terms` → Privacy. The full list is in `data/redirects.csv` in the repository.
- [ ] Donate page: the bank details show, the copy buttons work and the PDF downloads.
- [ ] Pictures, fonts and the hero video load. **If the page looks unstyled, see "What can go wrong".**
- [ ] <https://nkfund.world/robots.txt> does **not** say `Disallow: /`. Also open any page, view the page source (Ctrl+U or ⌥⌘U) and search for `noindex`. It must **not** be found.
- [ ] **Email still works.** From a personal Gmail, send a message to hello@nkfund.world, then reply to it.

**Optional (recommended):** add the site to [Google Search Console](https://search.google.com/search-console) as a **Domain** property. It asks for one more TXT record at GoDaddy. Then submit `https://nkfund.world/sitemap.xml` so Google picks up the new pages sooner.

---

## Step 6: close down Wix (only after at least 2 to 3 days live without problems, and before 18 November)

1. **Export the Wix form submissions first.** In the Wix dashboard, open **Forms & Submissions**. Next to each form, click **⋯ → View submissions → Export** to download a CSV. Uploaded files are not included in the CSV, so download each one separately. ([Wix: Viewing and managing a submissions table](https://support.wix.com/en/article/wix-forms-viewing-and-managing-a-submissions-table))
2. **Make sure the archive of the old site is safe.** It has two parts:
   - **Text** (all page texts, the content audit `CONTENT_CHANGES.md`, the translation sources, the list of old addresses and the media list): already in the repository, folder **`docs/archive/wix-2026-10/`**. Nothing to do.
   - **The Fund's own photos and videos as downloaded from Wix** (including the 1080p film, 237 MB in total — too big for the repository): the file **`nkfund-wix-source-2026-10-20.zip`** (242 MB, SHA-256 `1340012273b3dcb5a64cda2ede6551b25854b7274819e8124d2a5ed37038db75`), handed over with this project in the folder `nkfund-site/archive/`. **Before cancelling Wix**, upload it to GitHub: repository → **Releases** → **Draft a new release** → tag `wix-archive-2026-10`, title "Archive of the old Wix site (October 2026)" → drag the zip into "Attach binaries" → **Publish release**. (Files up to 2 GB are allowed there. A copy in the Fund's Google Drive is a good second place.) Then tick: ☐ uploaded, link: ____________
   - Also download anything else you want to keep, for example invoices (Wix → Billing & Payments).
3. Stop the plan: Wix → **Premium Subscriptions** → **⋯** next to the plan → **Cancel Plan**, or turn **auto-renew off**. **Do this a few days before 18 November.** The plan keeps running until the end of the period you already paid for. ([Wix: Canceling a Premium plan](https://support.wix.com/en/article/canceling-a-wix-premium-plan), [Wix: Turning off auto renewal](https://support.wix.com/en/article/turning-off-the-auto-renewal-for-a-wix-premium-plan))
4. Cancelling does **not** delete the Wix site. It falls back to a free `wixsite.com` address with Wix ads. To avoid a duplicate copy online, **unpublish** the Wix site in the Wix editor. ([same Wix page](https://support.wix.com/en/article/canceling-a-wix-premium-plan))
5. If Wix still lists nkfund.world as a connected domain, remove it there. Then **check GoDaddy DNS again**: the GitHub A/AAAA/CNAME records must still be there.

---

## What can go wrong (and what to do)

| Problem | Likely cause | Fix |
|---|---|---|
| GitHub says "DNS check unsuccessful" or "improperly configured" | DNS not updated yet, or an old record is still there | Wait 1 hour. Look in GoDaddy for any extra A record on `@` (Wix 23.236.62.147, "Parked") or a `www` CNAME not pointing to `ernabgd.github.io`, and delete it. ([GitHub Docs](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)) |
| **Enforce HTTPS** stays grey for more than 24 hours | Certificate stuck | In repository Settings → Pages, click **Remove** next to the custom domain, type `nkfund.world` again and **Save**. This restarts the certificate. ([GitHub Docs](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)) Also make sure there is no **CAA** record. If one exists, it must allow `letsencrypt.org`. ([GitHub Docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages)) |
| The site shows **without styling**, or links go to `/nkfund-website/...` | The site was built before the custom domain was saved, or an old `PATH_PREFIX` variable is still set | Delete the `PATH_PREFIX` variable (Step 2.3) and run the **deploy** workflow again |
| Google still shows "no information is available for this page" weeks later | An old `PREVIEW` variable is still `true` | Delete the `PREVIEW` variable (or set it to `false`) and run **deploy** again |
| The **deploy** run fails with "production build with SITE_URL … (must start with https://)" | `SITE_URL` is missing or has `http://` | Set the `SITE_URL` variable to `https://nkfund.world` (Step 2.3) and run **deploy** again |
| Some people see the new site, others the old one | DNS is still spreading | Normal for up to 24 hours. Test on mobile data. |
| **Email stopped working** | An email record was deleted or changed by mistake | Recreate it exactly from your Step 0 screenshots |
| `www.nkfund.world` doesn't work | The `www` CNAME is missing or wrong | It must be **CNAME `www` → `ernabgd.github.io`** (no repository name, no `https://`) |
| Something is badly wrong and you need the old site back (before 18 Nov only) | | Delete the 4 A, 4 AAAA and `www` CNAME records. Add back **A `@` → 23.236.62.147** and **CNAME `www` → balancer.wixdns.net**. In repository Settings → Pages, remove the custom domain. |

## If DNS has already moved to Cloudflare

If you did [DOMAIN_TRANSFER.md](DOMAIN_TRANSFER.md) first, make the **same record changes in Cloudflare** (DNS → Records) instead of GoDaddy. Set every website record (A, AAAA, `www`) to **DNS only** (grey cloud), not "Proxied". Cloudflare says records for outside hosting services should be DNS only. ([Cloudflare: Proxy status](https://developers.cloudflare.com/dns/proxy-status/)) Cloudflare doesn't ask for SMS codes.
