-- 0016 — User column guard
--
-- The users_self_update RLS policy scopes writes to the owner's row, but RLS
-- cannot restrict WHICH columns change. That let a signed-in user edit
-- privileged columns on their own row: a banned user could set
-- account_status back to 'active', or self-grant is_creator / is_verified,
-- or change wallet_address / date_of_birth. This trigger freezes those
-- columns on any self-initiated update (auth.uid() = the row owner), while
-- service-role writes (admin actions, wallet linking — where auth.uid() is
-- null) pass through untouched. date_of_birth may be set once during profile
-- setup, then becomes immutable so the 18+ attestation can't be rewritten.

create or replace function public.protect_user_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and auth.uid() = old.id then
    new.id             := old.id;
    new.email          := old.email;
    new.account_status := old.account_status;
    new.is_creator     := old.is_creator;
    new.is_verified    := old.is_verified;
    new.is_demo        := old.is_demo;
    new.wallet_address := old.wallet_address;
    new.created_at     := old.created_at;
    if old.date_of_birth is not null then
      new.date_of_birth := old.date_of_birth;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_user_columns on public.users;
create trigger protect_user_columns
  before update on public.users
  for each row
  execute function public.protect_user_columns();
