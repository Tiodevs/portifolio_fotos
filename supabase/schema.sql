create extension if not exists "pgcrypto";

create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  album_date date,
  category text not null check (category in ('home', 'personal')),
  cover_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums(id) on delete cascade,
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists photos_album_id_idx on public.photos(album_id);

alter table public.albums enable row level security;
alter table public.photos enable row level security;

drop policy if exists "Public read albums" on public.albums;
drop policy if exists "Public read photos" on public.photos;

create policy "Public read albums" on public.albums for select using (true);
create policy "Public read photos" on public.photos for select using (true);

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "Public read photos bucket" on storage.objects;
create policy "Public read photos bucket"
  on storage.objects for select
  using (bucket_id = 'photos');
