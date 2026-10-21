# Connect the Facebook Page to the website (Meta setup)

The home page has a **"Latest from Facebook"** section. Once a day, GitHub copies new posts from the Fund's Facebook Page into the website's content files. For that, GitHub needs two things from Meta (Facebook's company):

- **`FB_PAGE_ID`**: the Page's number. It is not secret.
- **`FB_PAGE_TOKEN`**: a long "key" that lets the website **read** the Page's posts. **It is secret. Treat it like a password.**

This guide gets both and stores them safely in GitHub. Until this is done, the website shows a "Follow us on Facebook / Instagram" card instead of posts. Nothing is broken in the meantime.

- **Time needed:** 30 to 45 minutes.
- **Who does it:** a person who is an **admin of the Facebook Page** with full control, and who plans to stay an admin. The key is tied to that person's Facebook account. Ideally this is the Fund's main Page owner, with two-factor login turned on.
- **Page:** <https://www.facebook.com/profile.php?id=100089583201087>

> **The key can only read.** The app you create below cannot post, delete or reply on your Page. Never paste the token into email, chat, a document or a file in the repository. It goes **only** into GitHub's secret store (Part 4).

---

## Part 1: register as a Meta developer (one time, free)

1. While logged in to Facebook, open <https://developers.facebook.com/> and click **Get Started**, or go straight to <https://developers.facebook.com/async/registration>.
2. Click **Next** to accept the Platform Terms and Developer Policies.
3. **Verify your account.** Meta sends a confirmation code to your phone number and email. Enter it.
4. When asked for your **occupation**, pick the closest one, for example "Other" or "Business owner".

([Meta: Register as a Meta Developer](https://developers.facebook.com/docs/development/register/))

---

## Part 2: create the app

1. Open <https://developers.facebook.com/apps/creation/>.
2. **App details:** App name `nkfund website`. Contact email `hello@nkfund.world`. Click **Next**.
3. **Use cases:** select **"Manage everything on your Page"**. Click **Next**.
   - This use case adds `pages_show_list` automatically. On the next screens, also make sure **`pages_read_engagement`** is added (it's optional in this use case, so click **Add** if needed). You can **remove** `pages_manage_engagement`; the website doesn't need it.
4. **Business:** choose **"I don't want to connect a business portfolio yet."** This is allowed when the app only reads Pages that you yourself manage. Click **Next**.
5. **Requirements:** read the screen and click **Next**. No "App Review" is needed: the only people using this app are its own admins, and Meta calls that **Standard Access**. ([Meta: Access levels](https://developers.facebook.com/docs/graph-api/overview/access-levels/))
6. **Overview:** click **Go to dashboard**.

([Meta: Create an app](https://developers.facebook.com/docs/development/create-an-app/))

**Leave the app in "Development" mode.** You don't need to publish it or make it "Live".

---

## Part 3: get a Page token that never expires

There are three short steps: a **short user key**, then a **60-day user key**, then the **permanent Page key**. Use a computer browser.

### 3a. Short user key (valid about 1 to 2 hours)

1. Open the **Graph API Explorer**: <https://developers.facebook.com/tools/explorer/>
2. On the right, set **Meta App** to your new app **nkfund website**.
3. Set **User or Page** to **User Token**.
4. Under **Permissions**, add **`pages_show_list`** and **`pages_read_engagement`**.
5. Click **Generate Access Token**. A Facebook window opens:
   - Continue as yourself.
   - When it asks **which Pages** the app may use, choose **only the Fund's Page**.
   - Allow the permissions.
6. The **Access Token** box now shows a long code beginning with `EAA…`. That's your short key.

### 3b. Turn it into a 60-day user key

1. Click the small **ⓘ (info)** icon next to the token and choose to open it in the **Access Token Tool**. Or copy the token, open the **Access Token Debugger** at <https://developers.facebook.com/tools/debug/accesstoken/>, paste it and click **Debug**.
2. At the bottom of the result, click **Extend Access Token**. Meta may ask for your Facebook password.
3. A **new, longer token** appears. **Copy it.** This is the 60-day user key. A long-lived user token "generally lasts about 60 days". ([Meta: Long-lived tokens](https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived/))

### 3c. Get the permanent Page key and the Page ID

1. Go back to the **Graph API Explorer**.
2. Paste the **60-day user key** into the **Access Token** box. Replace what's there.
3. In the query box, type `112566158405959?fields=id,name,access_token` (or `me/accounts`) and click **Submit**.
4. The answer lists the Pages you manage. Find the Fund's Page and note two values:
   - **`id`**: this is **`FB_PAGE_ID`**. For this Page it is **`112566158405959`** (confirmed 21 Oct 2026). It is *not* `100089583201087`, the number in the Page's web address: that is the Page's profile number, which the Graph API does not accept.
   - **`access_token`**: this is **`FB_PAGE_TOKEN`**.

   Meta says a Page token obtained from a long-lived user token **does not expire**. ([Meta: Long-lived tokens](https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived/))
5. **Check it:** paste the Page token into the **Access Token Debugger** and click **Debug**. You should see:
   - **Type:** Page
   - **Expires:** **Never**
   - **Scopes:** include `pages_read_engagement` and `pages_show_list`

   If "Expires" shows a date, you used the short key from 3a by mistake. Repeat 3b and 3c.

> **Plan B for 3b, if the "Extend" button is missing.** If the token already lasts about 60 days, Meta doesn't show the button: you already have the long key. Otherwise, in the app dashboard go to **App settings → Basic** and note the **App ID** and **App Secret**. Then open this address in your browser, with the three parts in `{…}` replaced:
> `https://graph.facebook.com/v26.0/oauth/access_token?grant_type=fb_exchange_token&client_id={App ID}&client_secret={App Secret}&fb_exchange_token={short token}`
> The `access_token` in the answer is the 60-day key. ([Meta: Long-lived tokens](https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived/)) Close the tab afterwards. The address contains your app secret.

---

## Part 4: store the two values as GitHub secrets

1. Open the repository **<https://github.com/ernabgd/nkfund-website>**, logged in as `ernabgd`.
2. Click **Settings**. In the sidebar under **Security**, click **Secrets and variables → Actions**, then the **Secrets** tab.
3. Click **New repository secret**:
   - **Name:** `FB_PAGE_ID`
   - **Secret:** the Page `id` from 3c
   - Click **Add secret**.
4. Click **New repository secret** again:
   - **Name:** `FB_PAGE_TOKEN`
   - **Secret:** the Page `access_token` from 3c. Paste the whole thing, with no spaces before or after.
   - Click **Add secret**.

([GitHub Docs: Using secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets))

GitHub never shows a secret again after you save it, not even to you. To change one later, click it and choose **Update**. Now **delete the token from anywhere else you pasted it**: notes, the clipboard history and so on.

---

## Part 5: run the first full import

The daily job only fetches **recent** posts. The first run should fetch **everything Meta allows**. Meta returns roughly 600 posts per year. ([Meta: Page feed](https://developers.facebook.com/docs/graph-api/reference/page/feed/))

1. In the repository, open the **Actions** tab.
2. On the left, click the **Facebook sync** workflow.
3. Click **Run workflow** (above the list of runs). Keep **Branch: main**. Choose the **initial** option (first import: the Page's newest 24 posts), which runs the import with `--initial`. Click the green **Run workflow** button. ([GitHub Docs: Manually running a workflow](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow))
4. Wait for the green tick, usually 1 to 5 minutes. The website is then rebuilt automatically with the posts.
5. **Review the posts.** Open **Pages CMS** (<https://app.pagescms.org>) → **Facebook posts**. Each post has a **"Show on website"** tick box:
   - New posts are **ticked** (shown) by default.
   - **Untick** any post that shouldn't appear on the website, for example private announcements or very old posts. Save.
6. From now on the import runs **daily on its own**. You don't need to do anything.

---

> **Status (21 Oct 2026):** connected. App "nkfund website" (App ID 1792577828327945, in development mode) under the Facebook account that admins the Page; `FB_PAGE_ID` = 112566158405959; `FB_PAGE_TOKEN` saved in GitHub. The first full import brought in 49 posts (January 2023 – June 2026). Facebook's automatic posts (for example "top fan" badges) are imported hidden.

## What breaks the token, and how to reconnect

The Page token doesn't expire by date, but **it stops working** if any of these happens to **the person who created it**:

- They **change their Facebook password**, or Facebook makes them reset it after a security check.
- They are **removed as an admin** of the Page, or lose "full control".
- They **remove the app** under Facebook **Settings & privacy → Settings → Business integrations** (or "Apps and websites").
- The **app is deleted**, or Meta restricts it. Answer any email from Meta about your app, for example a "Data Use Checkup".
- The app hasn't used a permission for **90 days** ([Meta](https://developers.facebook.com/docs/facebook-login/auth-vs-data/)). This won't happen while the daily import runs.

Meta's own documentation says tokens can become invalid "under certain conditions" ([Meta](https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived/)). Vendors that use the same API name **password changes** and **admin-role removal** as the usual reasons ([example](https://docs.chatlayer.ai/channels/facebook/facebook-admin-removal)).

**How you'll notice:**
- GitHub sends a **"Run failed: Facebook sync"** email.
- The **Actions** tab shows a red ✗ next to **Facebook sync**. The log mentions **error 190** or "Error validating access token".
- New Facebook posts stop appearing on the website. The website keeps working and shows the posts it already has.

**To reconnect (15 minutes):**
1. Make sure the person doing it is a Page admin with full control.
2. Repeat **Part 3** (3a → 3b → 3c). If a *different* person does it, that person must first be added to the app: [App dashboard](https://developers.facebook.com/apps/) → your app → **App roles → Roles → Add people** as Administrator.
3. In GitHub, **Settings → Secrets and variables → Actions → `FB_PAGE_TOKEN` → Update**, and paste the new token.
4. **Actions → Facebook sync → Run workflow** (normal run, without "initial") to check it's green again.

## Other things that can go wrong

| Problem | Fix |
|---|---|
| `me/accounts` returns an empty list | First check the Page was ticked: click **Generate Access Token → Edit settings** (not "Continue") and make sure the Fund's Page is ticked. If it is ticked and the list is *still* empty (this happened on 21 Oct 2026), skip `me/accounts`: with the 60-day user key in the Explorer, run **`112566158405959?fields=id,name,access_token`** instead and copy that `access_token`. |
| Error about **`pages_read_user_content`** | The import also asked for posts written by visitors. Add `pages_read_user_content` in 3a as well, redo 3b–3c and update the secret. |
| Error **"(#10) … permission"** | `pages_read_engagement` is missing from the token. Redo Part 3 with both permissions. |
| A post shows on the website but shouldn't | Untick **Show on website** in Pages CMS. The next import doesn't re-tick it. |
| Meta announces a new **Graph API version** | Nothing to do right away. Versions stay available for about 2 years. For example, v25.0 (Feb 2026) is available until 29 July 2028. ([Meta: Changelog](https://developers.facebook.com/docs/graph-api/changelog)) About once every two years, ask a developer to raise the version number in the Facebook sync script. See [HANDOVER.md](HANDOVER.md). |
