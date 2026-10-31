-- Add this once in Supabase > SQL Editor to enable the RSVP form.
-- RSVP records are private. Visitors can submit, but cannot read or edit them.
create table if not exists public.wedding_rsvps (
  id bigint generated always as identity primary key,
  guest_name text not null check (char_length(guest_name) between 2 and 60),
  attendance text not null check (attendance in ('yes','no','maybe')),
  guest_count integer not null default 1 check (guest_count between 1 and 8),
  events text[] not null default '{}',
  created_at timestamptz not null default now()
);
alter table public.wedding_rsvps enable row level security;
revoke all on table public.wedding_rsvps from anon, authenticated;
grant insert on table public.wedding_rsvps to anon;
drop policy if exists "Anyone can submit an RSVP" on public.wedding_rsvps;
create policy "Anyone can submit an RSVP"
on public.wedding_rsvps for insert to anon
with check (
  char_length(guest_name) between 2 and 60
  and attendance in ('yes','no','maybe')
  and guest_count between 1 and 8
);
-- No public SELECT, UPDATE, or DELETE access is granted for RSVP records.
