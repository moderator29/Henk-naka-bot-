-- =============================================================================
-- Aurora · 0006 — first/last name on users + richer signup provisioning
-- Adds first_name and last_name, and updates the auth-signup trigger to copy
-- first_name, last_name, username, and display_name from the signup metadata
-- onto the public.users row. Username is set best-effort: if it collides with
-- an existing unique username the row is still created (username left null) so
-- signup never fails on a race.
-- =============================================================================

alter table public.users add column if not exists first_name text;
alter table public.users add column if not exists last_name text;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  dob date;
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  uname text := nullif(meta ->> 'username', '');
  fname text := nullif(meta ->> 'first_name', '');
  lname text := nullif(meta ->> 'last_name', '');
  dname text := coalesce(nullif(meta ->> 'display_name', ''), nullif(meta ->> 'first_name', ''));
begin
  begin
    dob := (meta ->> 'date_of_birth')::date;
  exception when others then
    dob := null;
  end;

  begin
    insert into public.users
      (id, email, date_of_birth, first_name, last_name, username, display_name, created_at)
    values
      (new.id, new.email, dob, fname, lname, uname, dname, now())
    on conflict (id) do update
      set email = excluded.email,
          date_of_birth = coalesce(excluded.date_of_birth, public.users.date_of_birth),
          first_name = coalesce(excluded.first_name, public.users.first_name),
          last_name = coalesce(excluded.last_name, public.users.last_name),
          username = coalesce(public.users.username, excluded.username),
          display_name = coalesce(excluded.display_name, public.users.display_name);
  exception when unique_violation then
    -- Username already taken; create the row without it (user can set one later).
    insert into public.users
      (id, email, date_of_birth, first_name, last_name, display_name, created_at)
    values
      (new.id, new.email, dob, fname, lname, dname, now())
    on conflict (id) do update
      set email = excluded.email,
          date_of_birth = coalesce(excluded.date_of_birth, public.users.date_of_birth);
  end;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;
