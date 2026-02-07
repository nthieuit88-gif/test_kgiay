
-- CHẠY SCRIPT NÀY TRONG SUPABASE SQL EDITOR

-- 1. Tạo bảng Meetings (Cuộc họp)
create table if not exists meetings (
  id text primary key, -- ID dạng text để khớp với mock data (ví dụ '1', '2')
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

-- 2. Tạo bảng Documents (Tài liệu)
create table if not exists documents (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  size text,
  type text,
  url text not null,
  meeting_id text references meetings(id) on delete set null, -- Liên kết với meetings
  created_at timestamptz default now()
);

-- 3. Đảm bảo cột meeting_id có thể NULL (để lưu tài liệu chung)
alter table documents alter column meeting_id drop not null;

-- 4. Bật Row Level Security (RLS)
alter table meetings enable row level security;
alter table documents enable row level security;

-- 5. Tạo Policies (Quyền truy cập - Đang để public cho demo)
-- Meetings Policies
create policy "Public read meetings" on meetings for select using (true);
create policy "Public insert meetings" on meetings for insert with check (true);
create policy "Public update meetings" on meetings for update using (true);
create policy "Public delete meetings" on meetings for delete using (true);

-- Documents Policies
create policy "Public read documents" on documents for select using (true);
create policy "Public insert documents" on documents for insert with check (true);
create policy "Public update documents" on documents for update using (true);
create policy "Public delete documents" on documents for delete using (true);

-- 6. Hướng dẫn Storage
-- Bạn cần tạo Bucket tên là 'files' trong menu Storage của Supabase
-- Và thêm Policy cho bucket 'files' để cho phép public Select/Insert.
