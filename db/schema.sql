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
  width int,
  height int,
  created_at timestamptz not null default now()
);

create index if not exists photos_album_id_idx on public.photos(album_id);
