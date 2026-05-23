-- =============================================================================
-- Aurora · 0004 — provision public.users on auth signup
--
-- Supabase stores authentication identities in auth.users. This trigger mirrors
-- a new auth user into our public.users table (and seeds user_preferences),
-- copying the date_of_birth captured at signup from the auth metadata so the
-- 18+ gate has it on the profile row (RPD §5.4 / §9.1).
-- =============================================================================

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  dob date;
begin
  -- date_of_birth arrives as a 'YYYY-MM-DD' string in raw_user_meta_data.
  begin
    dob := (new.raw_user_meta_data ->> 'date_of_birth')::date;
  exception when others then
    dob := null;
  end;

  insert into public.users (id, email, date_of_birth, created_at)
  values (new.id, new.email, dob, now())
  on conflict (id) do update
    set email = excluded.email,
        date_of_birth = coalesce(excluded.date_of_birth, public.users.date_of_birth);

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();

-- Keep email + dob in sync if the auth row is updated (e.g. email change,
-- or dob backfilled after an OAuth signup completes its age check).
create or replace function public.handle_auth_user_updated()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  dob date;
begin
  begin
    dob := (new.raw_user_meta_data ->> 'date_of_birth')::date;
  exception when others then
    dob := null;
  end;

  update public.users
     set email = new.email,
         date_of_birth = coalesce(dob, public.users.date_of_birth)
   where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row
  execute function public.handle_auth_user_updated();
