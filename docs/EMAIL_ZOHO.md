# Move hello@nkfund.world from GoDaddy's Microsoft 365 to Zoho Mail

**The address stays exactly the same: `hello@nkfund.world`.** Every account that uses it to log in (GitHub, Meta, GoDaddy, Cloudflare, banks and so on) keeps working. Only the company that stores the mail changes.

| | Now | After |
|---|---|---|
| Provider | Microsoft 365 Email Essentials, bought through GoDaddy | Zoho Mail |
| Cost | **€23.97 per quarter** (about €96/year) | **Mail Lite 5 GB: US$1 per user per month, billed yearly (US$12/year)**. In euros: €0.90/month (€10.80/year). Or **Forever Free** if Zoho offers it to you. |
| Next renewal | **2 December 2026**. Cancel before this date. | Yearly, from the day you sign up |

Prices come from Zoho's official price list as of 20 October 2026 ([Zoho Mail pricing](https://www.zoho.com/mail/zohomail-pricing.html)). Zoho shows prices in your region's currency, so the checkout page has the final number. Mail Lite is **yearly billing only**. A 10 GB version costs US$1.25 (€1.13) per user per month.

**Which plan?**
- **Mail Lite (recommended).** Includes IMAP/POP/ActiveSync, so it works in Outlook, Apple Mail and phone mail apps. It also includes the migration options below.
- **Forever Free.** Up to 5 users, 5 GB each, one domain. Works **only in the browser and the Zoho Mail app**: no IMAP/POP/ActiveSync. Zoho says it's "available only in select data centers" ([Zoho pricing](https://www.zoho.com/mail/zohomail-pricing.html)). If Zoho doesn't offer it when you sign up from Georgia, choose Mail Lite.
- **Check your mailbox size first.** In Outlook on the web (<https://outlook.office.com>), open **Settings (⚙) → General → Storage**. Over about 4 GB: choose **Mail Lite 10 GB**.

**When:** start **by about 8 November 2026**. Allow 1 week for the move and 1 week of overlap before cancelling Microsoft 365 on 2 December.

---

## Before you start

1. Read through the whole guide once.
2. In GoDaddy's **Email & Office Dashboard**, write down **every** address and alias on nkfund.world, for example whether `info@` also exists. You'll recreate them in Zoho.
3. Have your phone ready. GoDaddy asks for an SMS code for every DNS change.
4. **Make a backup copy of the mailbox first.** Use Option C in Step 4, or at least export important folders. The old mailbox is **deleted** when Microsoft 365 is cancelled.

---

## Step 1: sign up for Zoho Mail (the owner does this)

1. Go to <https://www.zoho.com/mail/> and choose **Sign up / Get started** for **business email**. Pick the plan (see above).
2. Choose the option to use **a domain you already own**. Enter `nkfund.world`.
3. Create the first account, the **super admin**, **as `hello@nkfund.world`**. Use a strong, new password and a mobile number for verification.
4. Turn on **two-factor authentication** for this account. Store the recovery codes somewhere safe.

## Step 2: prove you own the domain (doesn't affect current email)

1. In the **Zoho Mail Admin Console** (<https://mailadmin.zoho.com>), go to **Domains → nkfund.world**. Under **Verify Domain Ownership**, choose **Add a TXT record in the DNS**.
2. Zoho shows a value like `zoho-verification=zb12345678.zmverify.zoho.com`.
3. In **GoDaddy → Domain Portfolio → nkfund.world → DNS → Add New Record**: Type **TXT**, Name **`@`**, Value = the Zoho text. **Save** and enter the SMS code.
4. Back in Zoho, click **Verify TXT record**. If it fails, wait 30 minutes and try again.

([Zoho: Domain verification](https://www.zoho.com/mail/help/adminconsole/domain-verification.html))

This only **adds** a record. Email keeps arriving in Microsoft 365 as before.

## Step 3: set up the mailbox and aliases

- `hello@nkfund.world` already exists, since you created it in Step 1.
- For each extra address from "Before you start", either add an **email alias** to hello@ (Admin Console → **Users** → hello → **Email alias**) or create another user if a different person needs a separate inbox.

## Step 4: copy the existing mail into Zoho (old mail is still arriving at Microsoft)

Try **A** first. If it fails, use **B** or **C**. **C always works** and also gives you a backup.

> **Why "just use the password" won't work:** Microsoft has turned off simple password logins (Basic authentication) for IMAP and POP in Microsoft 365 for everyone, and it can't be turned back on ([Microsoft Learn](https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/deprecation-of-basic-authentication-exchange-online)). Zoho's IMAP option with "Enter user password manually" will therefore fail against `outlook.office365.com`.

### Option A: Zoho's one-click "Microsoft 365" migration

This needs Microsoft administrator rights. GoDaddy controls this Microsoft 365 setup ("federated"). However, GoDaddy says that accounts with **administrator permission in its Email & Office Dashboard get the Microsoft "Global admin" role** ([GoDaddy: change admin permissions](https://www.godaddy.com/help/change-my-microsoft-365-users-admin-permissions-42235)).

1. In GoDaddy's **Email & Office Dashboard**, make sure `hello@nkfund.world` has **Admin permissions: Yes**. Wait 15 minutes.
2. In the Zoho Admin Console: **Data Migration → Start data migration** → enter a name → **Add new server details** → under **Select Protocol/Application** choose **Microsoft 365** → **Sign In**. Sign in as hello@nkfund.world and click **Accept**.
3. Settings: tick **Mail**, **Contacts**, **Calendar**. **Folders: All folders. Emails: All emails.** → **Add → Create**.
4. **Users** tab → **Add**: source `hello@nkfund.world` → destination `hello@nkfund.world`, mailbox type **User mailbox** → **Start Migration**.
5. Watch the progress. When it finishes, compare the number of emails in the main folders on both sides.

([Zoho: Microsoft 365 migration](https://www.zoho.com/mail/help/adminconsole/o365-migration.html))

**If you see "Need admin approval" or a permissions error,** GoDaddy's setup is blocking the app. Go to B or C. Don't try to get around GoDaddy's admin controls.

> Zoho notes that, from 1 October 2026, Microsoft's retirement of EWS affects only **archive** mailboxes. Normal mail, contacts and calendars still migrate ([same Zoho page](https://www.zoho.com/mail/help/adminconsole/o365-migration.html)).

### Option B: Zoho IMAP migration with Microsoft sign-in (OAuth)

Zoho's IMAP migration from `outlook.office365.com` has a setting **Preferred Authentication Type → "Authenticate using individual user's OAuth"**. You open an **Authentication URL** and sign in on Microsoft's own page. This option is **for paid plans** and is switched on gradually: **email `support@zohomail.com`** and ask them to enable it for your organisation ([Zoho: IMAP migration from Microsoft 365](https://www.zoho.com/mail/help/adminconsole/office365-to-zoho-imap-migration.html)).

Server: `outlook.office365.com`, **SSL, port 993**. The rest is the same as Option A, steps 3 to 5.

### Option C: copy it yourself with Thunderbird (free, Mac or Windows, always works)

Thunderbird signs in to Microsoft 365 the modern way, through Microsoft's own login page ([Microsoft Learn](https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/deprecation-of-basic-authentication-exchange-online)).

1. Install Thunderbird from <https://www.thunderbird.net>.
2. **Add the old mailbox:** Account Settings → **Add Mail Account** → `hello@nkfund.world`. When it asks, choose **IMAP**, server `outlook.office365.com`, authentication **OAuth2**. Sign in on the Microsoft page. Wait until all folders have downloaded.
3. **Make the backup:** install the **ImportExportTools NG** add-on (Thunderbird → Add-ons) and export every folder as **EML files** to a folder on your computer. Copy that folder to a USB stick or cloud drive as well.
4. **Copy into Zoho:**
   - **Mail Lite:** in Zoho web, open **Settings → Mail Accounts → IMAP Access** and tick it. Then add the Zoho account in Thunderbird: server `imappro.zoho.com`, port 993, SSL. Use the exact server name shown in Zoho under **Server Configuration Details** ([Zoho: IMAP access](https://www.zoho.com/mail/help/imap-access.html)). Drag each folder from the Microsoft account onto the Zoho account.
   - **Forever Free (no IMAP):** ZIP the exported EML folders, at most 500 MB per ZIP. In Zoho web, use **Settings → Import/Export** to import each ZIP and keep the folder structure ([Zoho: Import/Export emails](https://www.zoho.com/mail/help/import-export-emails.html)).

*(Windows with Outlook desktop: you can also export a **.pst** file and use Zoho's migration wizard for PST ([Zoho](https://www.zoho.com/mail/help/adminconsole/migration.html)).)*

---

## Step 5: switch email delivery to Zoho (one sitting, about 30 minutes, on a quiet day)

Don't do this on the same day as the website go-live or the domain transfer. Fewer changes at once makes problems easier to trace.

**Get the exact values from Zoho:** Admin Console → **Domains → nkfund.world → Email Configuration**. The MX server names depend on which Zoho data centre you are in, for example `mx.zoho.com` or `mx.zoho.eu`. **Always copy them from your console.** ([Zoho: MX records](https://www.zoho.com/mail/help/adminconsole/configure-email-delivery.html))

In **GoDaddy → nkfund.world → DNS**:

1. **Add the 3 Zoho MX records:** Type **MX**, Name **`@`**, values and priorities as shown in Zoho. Typically:
   - `mx.zoho.…` priority **10**
   - `mx2.zoho.…` priority **20**
   - `mx3.zoho.…` priority **50**
2. **Delete the Microsoft MX record:** `0 nkfund-world.mail.protection.outlook.com`. Zoho warns that any other MX record left behind, especially one with a lower number like 0, keeps mail going to the old place ([Zoho](https://www.zoho.com/mail/help/adminconsole/configure-email-delivery.html)).
   - If GoDaddy won't let you delete it ("managed by your Microsoft 365 product"), call GoDaddy support and ask them to remove the Microsoft 365 MX record.
3. **Edit the SPF record.** **Change** the existing TXT record `v=spf1 include:secureserver.net -all`. Don't add a second one: a domain must have only **one** SPF record ([Zoho: SPF](https://www.zoho.com/mail/help/adminconsole/spf-configuration.html)). The new text, using the `include:` value from your Zoho console:
   - **For now (both providers):** `v=spf1 include:zohomail.com include:secureserver.net ~all`
   - **After Microsoft 365 is cancelled (Step 8):** `v=spf1 include:zohomail.com -all`
4. **Add DKIM (an email signature that proves mail is really from you):**
   1. In Zoho: **Domains → nkfund.world → Email Configuration → DKIM → Add**. Selector `zoho`, key length **2048**, then **Add**. Copy the **TXT value**.
   2. In GoDaddy: Type **TXT**, Name **`zoho._domainkey`** (GoDaddy adds the domain itself), Value = the copied text. Save.
   3. In Zoho, click **Verify**, then **Enable**.

   ([Zoho: DKIM](https://www.zoho.com/mail/help/adminconsole/dkim-configuration.html))
5. **DMARC: no change needed.** The existing `_dmarc` record `v=DMARC1; p=none; rua=mailto:hello@nkfund.world` is fine. After about a month of normal email, you can change `p=none` to `p=quarantine` for extra protection against fake mail in the Fund's name. Zoho recommends this step-by-step approach ([Zoho: DMARC](https://www.zoho.com/mail/help/adminconsole/dmarc-policy.html)).
6. **Leave the Microsoft records for now:** `autodiscover`, `email`, `lyncdiscover`, `msoid`, `sip`, the SRV records `_sip`/`_sipfederationtls`, and TXT `NETORGFT12416451.onmicrosoft.com`. They're removed in Step 8.
7. In Zoho, go to **Email Configuration → MX** and click **Verify**.

## Step 6: test (the same day)

- [ ] From a personal Gmail, send a message to hello@nkfund.world. It should arrive in **Zoho** (<https://mail.zoho.com>). Changes can take up to 12 to 24 hours to reach everyone, but usually it's minutes.
- [ ] Reply from Zoho to Gmail. In Gmail, open the message → **⋮ → Show original**. **SPF: PASS, DKIM: PASS, DMARC: PASS** should all show.
- [ ] Request a password-reset email from an important account (e.g. GitHub) and check that it arrives.
- [ ] Phone: install the **Zoho Mail** app, or (Mail Lite) set up IMAP `imappro.zoho.com:993` / SMTP `smtppro.zoho.com:465` as shown in your Zoho settings ([Zoho](https://www.zoho.com/mail/help/imap-access.html)).

## Step 7: catch late arrivals (the following week)

For a few days, some senders may still deliver to Microsoft. Their systems remember the old address for a while.
- Check the old mailbox at <https://outlook.office.com> every day for a week.
- Copy anything new across (Thunderbird drag-and-drop), or re-run the Zoho migration with **Emails to migrate: received after <switch date>**.

## Step 8: cancel GoDaddy's Microsoft 365 (after 1 week of normal use, **before 2 December 2026**)

Only do this when **all** of these are true:
- [ ] Zoho has received and sent mail normally for at least 7 days.
- [ ] All old mail is in Zoho (compare folder counts), **and** you have the EML backup from Option C or similar on your computer **and** on a second drive.
- [ ] Nothing new arrived in the old mailbox for 3 days.

Then:
1. GoDaddy → **My Products → Email & Office → Microsoft 365** → cancel the plan, or turn off auto-renew so it ends on 2 December. **Cancelling removes the mailbox and its accounts for good.** GoDaddy's help says a cancelled email plan and its user accounts are fully removed ([GoDaddy: email packs](https://www.godaddy.com/help/working-with-microsoft-365-email-packs-40154), [GoDaddy: delete user email accounts](https://www.godaddy.com/help/delete-user-email-accounts-32427)).
2. **Check GoDaddy DNS again.** The Zoho MX, SPF, `zoho._domainkey` and `zoho-verification` records must still be there. GoDaddy sometimes cleans up email records when a product is cancelled.
3. Delete the old Microsoft records: CNAME `autodiscover`, `email`, `lyncdiscover`, `msoid`, `sip`; SRV `_sip._tls`, `_sipfederationtls._tcp`; TXT `NETORGFT12416451.onmicrosoft.com`.
4. Tighten SPF to `v=spf1 include:zohomail.com -all`, using your console's include value.
5. Remove the old Microsoft account from phones and computers.

---

## What can go wrong

| Problem | Cause | Fix |
|---|---|---|
| Mail still goes to Microsoft after a day | The old MX record is still there, or there's a wrong priority | Only the 3 Zoho MX records may exist. Check with <https://toolbox.googleapps.com/apps/dig/> → **MX** → `nkfund.world`. |
| Messages to Gmail land in spam | SPF/DKIM not passing | Make sure there is **one** SPF record containing Zoho's include, and that DKIM is **verified and enabled** in Zoho |
| DKIM won't verify | The TXT value was cut short or the name is wrong | Name must be `zoho._domainkey` (GoDaddy adds the domain). Paste the **entire** value. Wait up to 24 hours ([Zoho](https://www.zoho.com/mail/help/adminconsole/dkim-configuration.html)). |
| "Need admin approval" in Option A | GoDaddy's federation blocks the Zoho app | Use Option B or C |
| IMAP migration fails with a login error | Microsoft no longer accepts plain passwords for IMAP | Use Option B (OAuth) or Option C |
| Free plan: Outlook / Apple Mail won't connect | The Free plan has no IMAP/POP | Use the Zoho Mail app or web, or upgrade to Mail Lite |
| A verification code or password reset didn't arrive during the switch | It went to the old mailbox | Look in <https://outlook.office.com> (until cancelled) |
| You cancelled Microsoft 365 and something is missing | The mailbox is gone | Restore from your EML backup (Zoho **Settings → Import/Export**) |

## If DNS has already moved to Cloudflare

Make the same record changes in **Cloudflare → DNS → Records**. Email records (MX, TXT) are always "DNS only" in Cloudflare ([Cloudflare](https://developers.cloudflare.com/dns/proxy-status/)). For DKIM, enter the name `zoho._domainkey`.
