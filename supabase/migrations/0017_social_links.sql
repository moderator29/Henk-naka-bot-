-- 0017 — Profile social links
--
-- Optional Telegram and X (Twitter) profile links shown as buttons on a user's
-- profile. Stored as fully-qualified https URLs after server-side validation.
-- These are owner-editable profile fields (not privileged), so the
-- protect_user_columns guard (0016) intentionally leaves them writable.

alter table public.users add column if not exists telegram_url text;
alter table public.users add column if not exists x_url text;
