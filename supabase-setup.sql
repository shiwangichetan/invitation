-- Run this in Supabase > SQL Editor.
-- New messages are private until you approve them in Table Editor.

create table if not exists public.guestbook_messages (
  id bigint generated always as identity primary key,
  guest_name text not null check (char_length(guest_name) between 2 and 60),
  message text not null check (char_length(message) between 2 and 500),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.guestbook_messages enable row level security;

-- Give public visitors only the two operations the website needs.
-- Admin review is performed in the Supabase Dashboard, not from the public site.
revoke all on table public.guestbook_messages from anon, authenticated;
grant select, insert on table public.guestbook_messages to anon;

-- Remove these policies first if you are rerunning this script.
drop policy if exists "Anyone can submit pending wishes" on public.guestbook_messages;
drop policy if exists "Anyone can read approved wishes" on public.guestbook_messages;

create policy "Anyone can submit pending wishes"
on public.guestbook_messages
for insert
to anon
with check (approved = false);

create policy "Anyone can read approved wishes"
on public.guestbook_messages
for select
to anon
using (approved = true);

-- Do not create public UPDATE or DELETE policies.
-- Moderate messages in Supabase Dashboard > Table Editor.
-- Never put a service_role / secret key in frontend code.
