# SMTP setup — Resend

Supabase's built-in mailer is capped at roughly **2–4 emails per hour** and is
marked development-only. Since signup now requires an emailed OTP code, that
cap is a hard limit on how many people can register. Connecting your own SMTP
removes it.

All of this is done in dashboards — no code changes.

---

## 1. Create a Resend account

1. Sign up at **https://resend.com** (free tier: 3,000 emails/month, 100/day)
2. Go to **API Keys** → **Create API Key**
3. Name it `jobalert24-supabase`, permission **Sending access**
4. Copy the key — it starts with `re_` and is shown **once**

## 2. Choose a sender address

**Starting out — no domain needed:**

```
onboarding@resend.dev
```

Resend's shared test domain. Works immediately. Fine for testing, but mail
says "via resend.dev" and deliverability is weaker.

**For production — use your own domain:**

1. Resend → **Domains** → **Add Domain** → enter `jobalert24.com`
2. Add the DNS records it gives you (SPF, DKIM, and a return-path CNAME) at
   your registrar
3. Wait for verification — usually minutes, occasionally up to an hour
4. Then send from `noreply@jobalert24.com`

Worth doing before launch: a verified domain is what keeps OTP codes out of
the spam folder, which otherwise silently blocks signups.

## 3. Point Supabase at it

**Supabase → Project Settings → Authentication → SMTP Settings**

Turn on **Enable Custom SMTP**, then:

| Field | Value |
|---|---|
| Sender email | `onboarding@resend.dev` (or your verified address) |
| Sender name | `jobalert24` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | your `re_...` API key |

The username is the literal word `resend` — not your email. That trips most
people up.

Port 465 is implicit TLS. If your host blocks it, `587` works with STARTTLS.

**Save**, then send yourself a test signup to confirm the code arrives.

## 4. Raise the rate limit

**Supabase → Authentication → Rate Limits**

The default email limit stays low even after SMTP is connected — it is a
separate setting. Raise "Emails per hour" to something realistic for your
traffic (100+ is reasonable to start).

---

## Checking it worked

After the first real signup:

- The email arrives from your sender address, not `noreply@mail.app.supabase.io`
- It contains a **6-digit code**, not a confirmation link — if it is a link,
  the "Confirm signup" template still needs replacing with
  `supabase/email-templates/confirm-signup.html`
- Resend → **Logs** shows the send, with delivery status

## If codes stop arriving

1. **Resend → Logs** — was it sent? bounced? rejected?
2. **Supabase → Logs → Auth** — did Supabase attempt the send at all?
3. Hitting the rate limit returns `over_email_send_rate_limit` from the API,
   which the signup form surfaces as an error
4. Unverified domain plus a strict recipient (Gmail, Outlook) often means
   spam-foldered rather than blocked — check there before assuming failure

---

# Verifying jobalerts24.com in Resend

Checked before writing this:

- DNS is hosted at **GoDaddy** (nameservers `ns19/ns20.domaincontrol.com`)
- **No MX records** — no mailboxes on this domain, so nothing to break
- **No SPF record** — a clean slate, which avoids the common failure where
  two SPF records invalidate each other
- Site already serves on both `jobalerts24.com` and `www.` (Vercel)

## 1. Add the domain in Resend

Resend → **Domains** → **Add Domain**

- Name: `jobalerts24.com`
- Region: **ap-south-1 (Mumbai)** if offered — closest to your users

Resend then shows three or four records to add.

## 2. Add the records in GoDaddy

**GoDaddy → My Products → jobalerts24.com → DNS → Manage Zones**

Resend gives the exact values; the shapes are:

| Type | Name | Value |
|---|---|---|
| TXT | `send` | `v=spf1 include:amazonses.com ~all` |
| TXT | `resend._domainkey` | long `p=MIGfMA0...` key |
| MX | `send` | `feedback-smtp.ap-south-1.amazonses.com` priority `10` |

Two GoDaddy-specific traps:

- **Enter the host name only.** GoDaddy appends the domain itself. Type
  `send`, not `send.jobalerts24.com` — the latter becomes
  `send.jobalerts24.com.jobalerts24.com`.
- **The MX record is on the `send` subdomain**, not the root. It handles
  bounce reports and does not affect mail to the main domain.

## 3. Verify

Back in Resend → **Verify DNS Records**. Usually a few minutes; GoDaddy can
take up to an hour.

## 4. Switch the sender

Once verified, Supabase → Authentication → SMTP Settings:

```
Sender email:  noreply@jobalerts24.com
Sender name:   jobalert24
```

Host, port, username and password stay the same.

## Why bother before launch

On the free tier with an unverified domain, Resend only delivers to **your
own account email**. Good enough to test signup, but no one else can
register. Verifying lifts that, and a domain with SPF and DKIM is also what
keeps OTP codes out of the spam folder.
