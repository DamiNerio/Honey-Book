-- Honey Book: Supabase PostgreSQL & Row Level Security (RLS) Setup
-- Run this script inside the Supabase Dashboard -> SQL Editor.

create table if not exists public.user_library (
  user_id uuid primary key references auth.users(id) on delete cascade,
  books jsonb not null default '[]'::jsonb,
  wishlist jsonb not null default '[]'::jsonb,
  completed jsonb not null default '{}'::jsonb,
  custom_genres jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

-- Keep updated_at current on every insert or update
create or replace function public.set_user_library_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_user_library_updated_at on public.user_library;
create trigger trg_user_library_updated_at
  before insert or update on public.user_library
  for each row
  execute function public.set_user_library_updated_at();

-- Enable Row Level Security (RLS)
alter table public.user_library enable row level security;

-- Drop existing policies if re-running this script
drop policy if exists "Users can view their own library" on public.user_library;
drop policy if exists "Users can insert their own library" on public.user_library;
drop policy if exists "Users can update their own library" on public.user_library;
drop policy if exists "Users can delete their own library" on public.user_library;

-- Allow authenticated users to access only their own row
create policy "Users can view their own library"
  on public.user_library
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own library"
  on public.user_library
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own library"
  on public.user_library
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own library"
  on public.user_library
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
