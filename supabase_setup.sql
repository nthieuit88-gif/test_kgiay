
-- CHẠY TOÀN BỘ SCRIPT NÀY TRONG SUPABASE SQL EDITOR ĐỂ FIX LỖI

-- 1. Setup Tables (Bảng dữ liệu)
create table if not exists meetings (
  id text primary key,
  title text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  room_id text not null,
  host text not null,
  participants int default 0,
  status text default 'pending',
  color text default 'blue',
  created_at timestamptz default now()
);

create table if not exists documents (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  size text,
  type text,
  url text not null,
  meeting_id text references meetings(id) on delete set null,
  created_at timestamptz default now()
);

alter table documents alter column meeting_id drop not null;

alter table meetings enable row level security;
alter table documents enable row level security;

-- Clean up old policies to avoid conflicts
drop policy if exists "Public read meetings" on meetings;
drop policy if exists "Public insert meetings" on meetings;
drop policy if exists "Public update meetings" on meetings;
drop policy if exists "Public delete meetings" on meetings;

drop policy if exists "Public read documents" on documents;
drop policy if exists "Public insert documents" on documents;
drop policy if exists "Public update documents" on documents;
drop policy if exists "Public delete documents" on documents;

-- Re-create Table Policies
create policy "Public read meetings" on meetings for select using (true);
create policy "Public insert meetings" on meetings for insert with check (true);
create policy "Public update meetings" on meetings for update using (true);
create policy "Public delete meetings" on meetings for delete using (true);

create policy "Public read documents" on documents for select using (true);
create policy "Public insert documents" on documents for insert with check (true);
create policy "Public update documents" on documents for update using (true);
create policy "Public delete documents" on documents for delete using (true);

-- 2. SETUP STORAGE (Quan trọng để fix lỗi Upload)
-- Tạo bucket 'files'
insert into storage.buckets (id, name, public)
values ('files', 'files', true)
on conflict (id) do nothing;

-- Xóa policies cũ của storage để tránh lỗi
drop policy if exists "Public Access Files" on storage.objects;
drop policy if exists "Public Upload Files" on storage.objects;
drop policy if exists "Public Update Files" on storage.objects;
drop policy if exists "Public Delete Files" on storage.objects;

-- Tạo Policies cho phép mọi người (anon) thao tác trên bucket 'files'
create policy "Public Access Files"
on storage.objects for select
using ( bucket_id = 'files' );

create policy "Public Upload Files"
on storage.objects for insert
with check ( bucket_id = 'files' );

create policy "Public Update Files"
on storage.objects for update
using ( bucket_id = 'files' );

create policy "Public Delete Files"
on storage.objects for delete
using ( bucket_id = 'files' );
