# Supabase Auth email templates

Branded HTML for the emails Supabase Auth sends. Paste each file into the
Supabase dashboard under Authentication, then Emails, into its matching slot,
and set the subject line shown below. Keep the `{{ }}` template variables intact.

| File | Supabase template | Subject |
| --- | --- | --- |
| `confirm-signup.html` | Confirm signup | `Confirm your Pleasure Coin account` |
| `reset-password.html` | Reset password | `Reset your Pleasure Coin password` |
| `magic-link.html` | Magic Link | `Your Pleasure Coin sign-in link` |
| `change-email.html` | Change Email Address | `Confirm your new Pleasure Coin email` |
| `reauthentication.html` | Reauthentication | `Your Pleasure Coin verification code` |

Notes:

- These are Supabase Auth emails only. App emails (welcome, account deletion
  confirmation, password changed, creator-post and renewal notifications) are
  sent via Resend in code and branded to match.
- Resend stays on the `onboarding@resend.dev` test sender (display name
  "Pleasure Coin") until a verified domain is added. Do not wire Resend as
  custom SMTP for Supabase Auth yet.
