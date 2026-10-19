-- Chat & Feed berdua (Rafi & Vina) — jalankan SEKALI di Supabase: SQL Editor → paste → Run.
-- Hanya akun yang terdaftar di couple_members yang bisa membaca/menulis.
-- Skrip ini otomatis mendaftarkan SEMUA akun yang ada sekarang (pendaftaran baru sudah dimatikan,
-- jadi isinya hanya akun Rafi & Vina). Kalau nanti ada akun lain, hapus barisnya dari couple_members.

-- 1) Anggota
create table if not exists public.couple_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name    text
);
insert into public.couple_members (user_id, name)
  select id, split_part(email, '@', 1) from auth.users
  on conflict (user_id) do nothing;

create or replace function public.is_couple() returns boolean
  language sql stable security definer set search_path = public as
  $$ select exists (select 1 from public.couple_members where user_id = auth.uid()) $$;

alter table public.couple_members enable row level security;
drop policy if exists "cm_select" on public.couple_members;
drop policy if exists "cm_update_own" on public.couple_members;
create policy "cm_select" on public.couple_members for select to authenticated using (public.is_couple());
create policy "cm_update_own" on public.couple_members for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 2) Chat
create table if not exists public.couple_msgs (
  id         bigint generated always as identity primary key,
  sender     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  body       text,
  img        text,
  reacts     jsonb not null default '{}'::jsonb,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
alter table public.couple_msgs enable row level security;
drop policy if exists "msg_select" on public.couple_msgs;
drop policy if exists "msg_insert" on public.couple_msgs;
drop policy if exists "msg_update" on public.couple_msgs;
drop policy if exists "msg_delete_own" on public.couple_msgs;
create policy "msg_select" on public.couple_msgs for select to authenticated using (public.is_couple());
create policy "msg_insert" on public.couple_msgs for insert to authenticated with check (public.is_couple() and sender = auth.uid());
create policy "msg_update" on public.couple_msgs for update to authenticated using (public.is_couple()) with check (public.is_couple());
create policy "msg_delete_own" on public.couple_msgs for delete to authenticated using (sender = auth.uid());

-- 3) Feed
create table if not exists public.couple_posts (
  id         bigint generated always as identity primary key,
  author     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  img        text not null,
  caption    text,
  likes      uuid[] not null default '{}',
  created_at timestamptz not null default now()
);
create table if not exists public.couple_comments (
  id         bigint generated always as identity primary key,
  post_id    bigint not null references public.couple_posts(id) on delete cascade,
  author     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);
alter table public.couple_posts enable row level security;
alter table public.couple_comments enable row level security;
drop policy if exists "post_select" on public.couple_posts;
drop policy if exists "post_insert" on public.couple_posts;
drop policy if exists "post_update" on public.couple_posts;
drop policy if exists "post_delete_own" on public.couple_posts;
create policy "post_select" on public.couple_posts for select to authenticated using (public.is_couple());
create policy "post_insert" on public.couple_posts for insert to authenticated with check (public.is_couple() and author = auth.uid());
create policy "post_update" on public.couple_posts for update to authenticated using (public.is_couple()) with check (public.is_couple());
create policy "post_delete_own" on public.couple_posts for delete to authenticated using (author = auth.uid());
drop policy if exists "cmt_select" on public.couple_comments;
drop policy if exists "cmt_insert" on public.couple_comments;
drop policy if exists "cmt_delete_own" on public.couple_comments;
create policy "cmt_select" on public.couple_comments for select to authenticated using (public.is_couple());
create policy "cmt_insert" on public.couple_comments for insert to authenticated with check (public.is_couple() and author = auth.uid());
create policy "cmt_delete_own" on public.couple_comments for delete to authenticated using (author = auth.uid());

-- 4) Realtime (pesan baru langsung muncul)
do $$ begin alter publication supabase_realtime add table public.couple_msgs; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.couple_posts; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.couple_comments; exception when duplicate_object then null; end $$;

-- 5) Foto bersama: bucket privat "couple" (keduanya bisa melihat, masing-masing upload ke foldernya sendiri)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('couple', 'couple', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
drop policy if exists "couple_obj_select" on storage.objects;
drop policy if exists "couple_obj_insert" on storage.objects;
drop policy if exists "couple_obj_delete" on storage.objects;
create policy "couple_obj_select" on storage.objects for select to authenticated
  using (bucket_id = 'couple' and public.is_couple());
create policy "couple_obj_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'couple' and public.is_couple() and (storage.foldername(name))[1] = auth.uid()::text);
create policy "couple_obj_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'couple' and (storage.foldername(name))[1] = auth.uid()::text);
