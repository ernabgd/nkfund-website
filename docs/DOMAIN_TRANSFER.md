# Move the domain nkfund.world away from GoDaddy

**Why:** GoDaddy's renewal on **3 December 2026** costs **€55.05 + €12.99 "Full Domain Protection" + 18% VAT = €80.49** a year. Other registrars charge much less for the same `.world` domain.

| | Price per year | Notes |
|---|---|---|
| **GoDaddy** (today) | **€80.49** | Renews 3 Dec 2026 |
| **Cloudflare Registrar** (recommended) | **About US$32** ("at cost", no markup) | `.world` is supported ([Cloudflare TLD list](https://www.cloudflare.com/tld-policies/)). US$32.20 per year per the independent tracker [cfdomainpricing.com](https://cfdomainpricing.com/); Cloudflare shows the exact price before you pay. Free private WHOIS. **DNS must be hosted at Cloudflare** (free). |
| **Porkbun** (alternative) | **US$37.59** registration / renewal / transfer | Free WHOIS privacy ([Porkbun .world](https://porkbun.com/tld/world)) |

**A transfer doesn't lose any time you've already paid for.** It also **adds one year**: the new expiry date becomes **3 December 2027** ([Cloudflare](https://developers.cloudflare.com/registrar/faq/), [Porkbun](https://kb.porkbun.com/article/56-how-to-transfer-your-domain-to-porkbun)).

**Recommendation: Cloudflare.** It is cheapest, and its DNS dashboard is clear and needs no SMS codes. The rest of this guide is for Cloudflare. Porkbun is at the end.

---

## ⚠️ Three rules for this transfer

1. **Do NOT change the registrant's name, organisation or email at GoDaddy before the transfer.** The email on file is the registrant's own address (ask the owner; it is deliberately not written in this public repository). Any change to those details triggers a **60-day transfer lock**, which would push the transfer past 3 December ([Cloudflare](https://developers.cloudflare.com/registrar/get-started/transfer-domain-to-cloudflare/)). Update the details **after** the move, at Cloudflare.
2. **GoDaddy's approval emails probably go to the registrant email on file at GoDaddy.** Agree with that person in advance that they will watch for GoDaddy emails and approve the transfer, or forward them to you.
3. **The transfer must finish before 3 December 2026.** Most registrars process a transfer within 5 business days, but the whole process can take up to 10 days ([Cloudflare](https://developers.cloudflare.com/registrar/get-started/transfer-domain-to-cloudflare/)). **Start the transfer (Part D) by 15 November at the latest**, ideally earlier.

### Suggested calendar

| Date (2026) | Step |
|---|---|
| After the website is live ([GO-LIVE.md](GO-LIVE.md)) and email is on Zoho ([EMAIL_ZOHO.md](EMAIL_ZOHO.md)) | Part A: preparation |
| By **10 Nov** | Part B: Cloudflare account; copy all DNS records into Cloudflare |
| **11 Nov** | Part C: switch nameservers to Cloudflare, test website and email |
| **12–13 Nov** | Part D: unlock at GoDaddy, get the code, start the transfer |
| **13–20 Nov** | Part E: approve; transfer completes |
| **28 Nov** | **Safety check:** if the transfer is *not* finished, renew at GoDaddy so the domain can't expire (website and email would stop) |

---

## Part A: preparation at GoDaddy (15 minutes)

1. GoDaddy → **Domain Portfolio → nkfund.world**. Check:
   - **Expiry date:** 3 Dec 2026.
   - **Status:** active, not expired.
   - **Registered more than 60 days ago:** yes, since 2022.
2. Note the **registrant contact** (name / organisation / email) **exactly as shown**. You'll enter the same details at Cloudflare.
3. Open **DNS**, then the **DNSSEC** section. If DNSSEC is **on**, turn it **off** and **wait 24 hours** before Part C. Changing nameservers with DNSSEC on can take the domain offline ([Cloudflare](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/)).
4. **Take screenshots of every DNS record**, all of them, scrolling to the end. You'll copy them into Cloudflare.
5. Make sure GoDaddy's **2-step verification** (SMS) has been on for at least 24 hours. Otherwise GoDaddy sends one-time codes for protected actions **to the registrant email** instead of your phone ([GoDaddy: Downgrade or remove Domain Protection](https://www.godaddy.com/help/downgrade-or-remove-domain-protection-1292)).

---

## Part B: Cloudflare account and DNS records (owner, 30 to 45 minutes)

1. Create a **free Cloudflare account** at <https://dash.cloudflare.com/sign-up> with **hello@nkfund.world**. Verify the email and **turn on two-factor authentication** (Profile → Authentication).
2. Add a **payment card** under **Billing**. The transfer is paid when you enter the code in Part D ([Cloudflare FAQ](https://developers.cloudflare.com/registrar/faq/)).
3. **Domains → Onboard a domain** → type `nkfund.world` → choose **Free** plan. Let Cloudflare **scan** for existing DNS records ([Cloudflare: Full setup](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/)).
4. **Compare the scanned list with your GoDaddy screenshots, line by line.** Cloudflare warns that the scan "is not guaranteed to find all existing DNS records". Add anything missing by hand. **Set every A, AAAA and CNAME record to "DNS only" (grey cloud).** Website records for outside services and records that prove ownership shouldn't be proxied ([Cloudflare: Proxy status](https://developers.cloudflare.com/dns/proxy-status/)).

**The records you should end up with** (after go-live and the Zoho move):

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | `@` | 185.199.108.153 | DNS only |
| A | `@` | 185.199.109.153 | DNS only |
| A | `@` | 185.199.110.153 | DNS only |
| A | `@` | 185.199.111.153 | DNS only |
| AAAA | `@` | 2606:50c0:8000::153 | DNS only |
| AAAA | `@` | 2606:50c0:8001::153 | DNS only |
| AAAA | `@` | 2606:50c0:8002::153 | DNS only |
| AAAA | `@` | 2606:50c0:8003::153 | DNS only |
| CNAME | `www` | ernabgd.github.io | DNS only |
| TXT | `_github-pages-challenge-ernabgd` | (value from GitHub) | |
| MX | `@` | Zoho MX ×3 with priorities 10 / 20 / 50, exactly as at GoDaddy | |
| TXT | `@` | `v=spf1 include:zohomail.com …` (copy exactly) | |
| TXT | `@` | `zoho-verification=zb…` | |
| TXT | `zoho._domainkey` | (Zoho DKIM key, copy the whole thing) | |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:hello@nkfund.world` | |
| TXT | `@` | Google Search Console `google-site-verification=…` (if you added it) | |

- **If Microsoft 365 is still active** at this point, also copy **exactly**: MX `0 nkfund-world.mail.protection.outlook.com` (only if you haven't switched to Zoho yet), TXT `NETORGFT12416451.onmicrosoft.com`, CNAMEs `autodiscover`, `email`, `lyncdiscover`, `msoid`, `sip`, and SRV `_sip._tls` and `_sipfederationtls._tcp`, with the same targets, priorities, weights and ports.
- **Don't copy** `_domainconnect`. It's a GoDaddy-only helper.
- Cloudflare will show you **two nameserver names** (Overview page), for example `xxx.ns.cloudflare.com` and `yyy.ns.cloudflare.com`. Write them down.

---

## Part C: switch the domain's nameservers to Cloudflare (10 minutes, then wait)

1. GoDaddy → **nkfund.world → DNS → Nameservers → Change Nameservers** → choose **"I'll use my own nameservers"**. Enter the **two Cloudflare names exactly**. **Save** and enter the SMS code.
2. Wait until Cloudflare shows the domain as **Active**. This usually takes minutes but can take up to 24 hours, and Cloudflare emails you when it happens ([Cloudflare](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/)).
3. **Test straight away:**
   - [ ] <https://nkfund.world> and <https://www.nkfund.world> open the new site with a padlock.
   - [ ] Send an email from Gmail to hello@nkfund.world, and reply. Both arrive.
   - [ ] GitHub repository **Settings → Pages** still shows the domain with a green tick.
4. **If something is broken:** fix the record in Cloudflare (compare with your screenshots). In an emergency, go back to GoDaddy → Nameservers → **GoDaddy default nameservers**. The old GoDaddy records are still there.

From now on, **all DNS changes are made in Cloudflare**, not GoDaddy.

---

## Part D: unlock at GoDaddy and start the transfer (20 minutes)

1. GoDaddy → **nkfund.world** → **Domain Protection** → **downgrade to None**, and confirm with the code. This also stops the €12.99 yearly add-on. Third-party guides report that GoDaddy hides the transfer option while "Full" protection is on ([NameSilo guide](https://www.namesilo.com/blog/en/domain-transfer/how-to-transfer-a-domain-away-from-godaddy)). GoDaddy treats unlocking and transferring as high-risk actions that need your verification code ([GoDaddy: What is Domain Protection?](https://www.godaddy.com/help/a-32311)).
2. On the same page, **Domain lock → Off** (code again).
3. Under **Transfer**, choose **Transfer to Another Registrar**, then reveal and **copy the authorization code** (also called EPP or transfer code). GoDaddy also emails it to the domain's administrative contact ([GoDaddy: Transfer my domain away](https://godaddy.com/help/transfer-domain-to-another-registrar-3560)). The code expires after a while, so use it the same day.
   - **Don't** change any contact details. If GoDaddy offers you a choice about a "60-day lock" anywhere, choose to **opt out** of it.
4. In **Cloudflare → Domain Registration → Transfer Domains**, select `nkfund.world` and paste the authorization code ([Cloudflare: Transfer to Cloudflare](https://developers.cloudflare.com/registrar/get-started/transfer-domain-to-cloudflare/)).
5. **Confirm payment.** About US$32, which includes the extra year.
6. **Contact information:** enter the **same registrant name, organisation and email as at GoDaddy**. Cloudflare keeps them private in public WHOIS.
7. Click **Confirm transfer**.
8. **Back at GoDaddy, turn auto-renew off** for nkfund.world. This stops GoDaddy from charging the €80.49 renewal while the transfer is in progress. Put the **28 November safety check** in your calendar.

---

## Part E: approve and finish (1 to 7 days)

1. **GoDaddy emails the domain's contact (the registrant email on file)** about the pending transfer. **Approving it** with the link in that email, or in the GoDaddy account if it shows a pending transfer, **speeds things up**. If nobody does anything, it normally completes by itself within about 5 days ([Cloudflare](https://developers.cloudflare.com/registrar/get-started/transfer-domain-to-cloudflare/)).
2. Cloudflare's status moves through **"Transfer in progress"** and **"Pending approval"**, and then the domain appears under **Domain Registration → Manage Domains**.
3. **When it's done:**
   - [ ] Cloudflare shows **expiry 3 Dec 2027** and **auto-renew ON**. Cloudflare tries to renew about 30 days before expiry ([Cloudflare FAQ](https://developers.cloudflare.com/registrar/faq/)), so keep the card valid.
   - [ ] Website and email still work. Nothing should change, because DNS was already at Cloudflare.
   - [ ] **Now** you may update the registrant contact at Cloudflare, e.g. email → hello@nkfund.world. This starts a 60-day lock at Cloudflare, which doesn't matter because you aren't moving again.
   - [ ] Optional: turn **DNSSEC on** in Cloudflare (DNS → Settings).
   - [ ] GoDaddy: check the domain is gone from **Domain Portfolio** and no renewal or protection charge is pending. Once Microsoft 365 is also cancelled, nothing is left at GoDaddy. You can then close the account (delete all products first, wait 24 hours, then close; this cannot be undone) ([GoDaddy: Close my account](https://www.godaddy.com/en-au/help/close-my-account-27894)).

---

## What can go wrong

| Problem | Fix |
|---|---|
| Cloudflare says the domain must be **Active** before you can enter the code | Part C isn't finished yet. Wait for the "Active" email ([Cloudflare](https://developers.cloudflare.com/registrar/get-started/transfer-domain-to-cloudflare/)). |
| GoDaddy has no transfer option | Domain Protection is still "Full": downgrade it to None (Part D.1). |
| Transfer **rejected**: wrong code or domain still locked | Unlock it again, get a **new** code, and use **Retry** in Cloudflare |
| Transfer rejected because of GoDaddy **privacy** | Turn GoDaddy Domain Privacy off temporarily (Cloudflare mentions some registrars have a separate privacy lock), then **Retry**. Don't edit the contact details themselves. |
| The approval email went to the registrant's inbox and nobody saw it | Not a problem: it completes automatically after about 5 days. Ask the registrant to check their spam folder. |
| Website or email stopped right after the nameserver change | A record wasn't copied. Compare Cloudflare with your GoDaddy screenshots. Check that GitHub records are **DNS only**. |
| **28 November and still not transferred** | Renew at GoDaddy (turn auto-renew back on or renew manually). **An expired domain takes the website and email offline.** You can transfer later. Note that Cloudflare adds no extra year if you transfer within 45 days of a renewal ([Cloudflare FAQ](https://developers.cloudflare.com/registrar/faq/)). |

---

## Alternative: Porkbun (US$37.59/year)

Porkbun lets you use its own free DNS instead of Cloudflare's.

1. Do **Part A** above.
2. Create an account at <https://porkbun.com> with hello@nkfund.world and turn on 2-factor login.
3. Go to <https://porkbun.com/transfer>, enter `nkfund.world` and the auth code (from Part D steps 1 to 3). **Keep "private contact info" and "auto-renew" ticked**, and **tick the option to set up DNS before the transfer**. Import or scan your records and **check every one against the table in Part B**. Then pay ([Porkbun: How to transfer](https://kb.porkbun.com/article/56-how-to-transfer-your-domain-to-porkbun)).
4. At GoDaddy, switch the nameservers to **Porkbun's**, as in Part C. Test the website and email.
5. In Porkbun, click **Start the transfer**. Approve the GoDaddy email as in Part E. Allow 5 to 7 business days ([Porkbun](https://kb.porkbun.com/article/56-how-to-transfer-your-domain-to-porkbun)).
