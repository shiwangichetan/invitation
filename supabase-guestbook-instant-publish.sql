-- Instant-publication guestbook migration. Run in Supabase > SQL Editor.
-- Public website can publish wishes and read only the five newest approved rows.
-- Admins can view/delete all rows in Supabase Dashboard > Table Editor.

create table if not exists public.guestbook_messages (
  id bigint generated always as identity primary key,
  guest_name text not null check (char_length(guest_name) between 2 and 60),
  message text not null check (char_length(message) between 2 and 500),
  approved boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.guestbook_messages alter column approved set default true;
alter table public.guestbook_messages enable row level security;

-- No direct table access from the public website.
revoke all on table public.guestbook_messages from anon, authenticated;
grant usage on schema public to anon, authenticated;

drop policy if exists "Anyone can submit pending wishes" on public.guestbook_messages;
drop policy if exists "Anyone can read approved wishes" on public.guestbook_messages;
drop policy if exists "Anyone can submit wishes" on public.guestbook_messages;
drop policy if exists "Public can read approved guestbook messages" on public.guestbook_messages;

create or replace function public.get_public_guestbook_top5()
returns table (
  id bigint,
  guest_name text,
  message text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select g.id, g.guest_name, g.message, g.created_at
  from public.guestbook_messages as g
  where g.approved = true
  order by g.created_at desc, g.id desc
  limit 5;
$$;

create or replace function public.publish_guestbook_wish(
  p_guest_name text,
  p_message text
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id bigint;
begin
  if p_guest_name is null
     or char_length(btrim(p_guest_name)) not between 2 and 60 then
    raise exception 'Name must contain 2 to 60 characters.';
  end if;
  if p_message is null
     or char_length(btrim(p_message)) not between 2 and 500 then
    raise exception 'Message must contain 2 to 500 characters.';
  end if;

  insert into public.guestbook_messages (guest_name, message, approved)
  values (btrim(p_guest_name), btrim(p_message), true)
  returning id into new_id;
  return new_id;
end;
$$;

revoke all on function public.get_public_guestbook_top5() from public;
revoke all on function public.publish_guestbook_wish(text, text) from public;
grant execute on function public.get_public_guestbook_top5() to anon, authenticated;
grant execute on function public.publish_guestbook_wish(text, text) to anon, authenticated;
