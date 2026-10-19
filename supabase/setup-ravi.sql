-- =====================================================================
-- RaVi — SETUP SEKALI JALAN (gabungan semua fitur yang butuh database)
-- Supabase → SQL Editor → New query → paste SEMUA isi file ini → Run.
-- Aman dijalankan ulang (tidak menghapus data yang sudah ada).
--
-- Isi: (A) album foto pribadi, (B) chat, feed & telepon berdua,
--      (C) notifikasi push saat aplikasi tertutup.
-- Catatan: bagian B mendaftarkan SEMUA akun yang ada sekarang sebagai pasangan.
-- Cek dulu Authentication → Users: isinya harus hanya akun Rafi & Vina.
-- =====================================================================

-- ===================== (A) ALBUM =====================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('album', 'album', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists "album_select_own" on storage.objects;
drop policy if exists "album_insert_own" on storage.objects;
drop policy if exists "album_update_own" on storage.objects;
drop policy if exists "album_delete_own" on storage.objects;

create policy "album_select_own" on storage.objects for select to authenticated
  using (bucket_id = 'album' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "album_insert_own" on storage.objects for insert to authenticated
  with check (bucket_id = 'album' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "album_update_own" on storage.objects for update to authenticated
  using (bucket_id = 'album' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "album_delete_own" on storage.objects for delete to authenticated
  using (bucket_id = 'album' and (storage.foldername(name))[1] = auth.uid()::text);

-- ===================== (B) CHAT, FEED, TELEPON =====================

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

-- ===================== (C) NOTIFIKASI PUSH =====================
create table if not exists public.push_subs (
  endpoint   text primary key,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  sub        jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.push_subs enable row level security;
drop policy if exists "push_select_own" on public.push_subs;
drop policy if exists "push_insert_own" on public.push_subs;
drop policy if exists "push_update_own" on public.push_subs;
drop policy if exists "push_delete_own" on public.push_subs;
create policy "push_select_own" on public.push_subs for select to authenticated using (user_id = auth.uid());
create policy "push_insert_own" on public.push_subs for insert to authenticated with check (user_id = auth.uid());
create policy "push_update_own" on public.push_subs for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "push_delete_own" on public.push_subs for delete to authenticated using (user_id = auth.uid());

-- Kunci push (VAPID) dibuat otomatis oleh Edge Function "ravi" saat pertama dipakai.
-- Tabel ini sengaja TANPA policy: hanya server (service role) yang bisa membaca.
create table if not exists public.ravi_keys (
  id          int primary key default 1 check (id = 1),
  vapid_pub   text not null,
  vapid_priv  text not null,
  created_at  timestamptz not null default now()
);
alter table public.ravi_keys enable row level security;

-- ===================== (D) CHANNEL REALTIME PRIVAT (telepon & status online) =====================
-- Hanya anggota pasangan yang boleh bergabung ke channel "ravi-…" (sinyal telepon, status online).
-- Orang lain yang punya anon key publik tidak bisa menguping atau menyusup ke panggilan.
drop policy if exists "ravi_rt_select" on realtime.messages;
drop policy if exists "ravi_rt_insert" on realtime.messages;
create policy "ravi_rt_select" on realtime.messages for select to authenticated
  using (public.is_couple() and realtime.topic() like 'ravi-%');
create policy "ravi_rt_insert" on realtime.messages for insert to authenticated
  with check (public.is_couple() and realtime.topic() like 'ravi-%');

-- ===================== (E) ENKRIPSI END-TO-END CHAT & FEED =====================
-- Hanya menyimpan "garam" dan nilai pemeriksa. Kata sandi chat & kuncinya TIDAK PERNAH dikirim ke server.
create table if not exists public.couple_keys (
  id         int primary key default 1 check (id = 1),
  salt       text not null,
  check_ct   text not null,
  created_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.couple_keys enable row level security;
drop policy if exists "ck_select" on public.couple_keys;
drop policy if exists "ck_insert" on public.couple_keys;
drop policy if exists "ck_delete" on public.couple_keys;
create policy "ck_select" on public.couple_keys for select to authenticated using (public.is_couple());
create policy "ck_insert" on public.couple_keys for insert to authenticated with check (public.is_couple() and created_by = auth.uid());
create policy "ck_delete" on public.couple_keys for delete to authenticated using (public.is_couple());

-- ===================== (F) WAJIBKAN 2FA BAGI AKUN YANG SUDAH MENGAKTIFKANNYA =====================
-- Kalau sebuah akun sudah memasang 2FA, database MENOLAK akses dengan login password saja (sesi aal1).
-- Akun tanpa 2FA tidak terpengaruh. Cek 2FA lewat fungsi security definer, karena role "authenticated"
-- tidak boleh membaca tabel auth.mfa_factors langsung (itu penyebab error "permission denied for table mfa_factors").
create or replace function public.mfa_ok() returns boolean
  language sql stable security definer set search_path = '' as
  $$ select coalesce((select auth.jwt()->>'aal'), 'aal1') = 'aal2'
       or not exists (select 1 from auth.mfa_factors f where f.user_id = (select auth.uid()) and f.status = 'verified') $$;
revoke execute on function public.mfa_ok() from public, anon;
grant execute on function public.mfa_ok() to authenticated;
do $$
declare t text;
begin
  foreach t in array array['docs','couple_members','couple_msgs','couple_posts','couple_comments','push_subs','couple_keys'] loop
    execute format('drop policy if exists "mfa_required" on public.%I', t);
    execute format('create policy "mfa_required" on public.%I as restrictive to authenticated using ((select public.mfa_ok())) with check ((select public.mfa_ok()))', t);
  end loop;
end $$;
drop policy if exists "mfa_required_storage" on storage.objects;
create policy "mfa_required_storage" on storage.objects as restrictive to authenticated
  using (bucket_id not in ('album','couple') or (select public.mfa_ok()))
  with check (bucket_id not in ('album','couple') or (select public.mfa_ok()));

-- ===================== (G) KIRIM FILE DI CHAT =====================
-- Bucket "couple" menerima semua jenis file (PDF, video, dokumen) sampai 50 MB.
update storage.buckets set allowed_mime_types = null, file_size_limit = 52428800 where id = 'couple';

-- ===================== (H) ENKRIPSI OTOMATIS PER PERANGKAT (ala WhatsApp) =====================
-- Hanya kunci PUBLIK tiap perangkat yang disimpan di sini. Kunci privat tidak pernah keluar dari perangkat.
create table if not exists public.couple_devices (
  id         uuid primary key,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  pub        jsonb not null,
  label      text,
  created_at timestamptz not null default now(),
  last_seen  timestamptz
);
alter table public.couple_devices enable row level security;
drop policy if exists "cd_select" on public.couple_devices;
drop policy if exists "cd_insert_own" on public.couple_devices;
drop policy if exists "cd_update_own" on public.couple_devices;
drop policy if exists "cd_delete_own" on public.couple_devices;
create policy "cd_select" on public.couple_devices for select to authenticated using (public.is_couple());
create policy "cd_insert_own" on public.couple_devices for insert to authenticated with check (public.is_couple() and user_id = auth.uid());
create policy "cd_update_own" on public.couple_devices for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "cd_delete_own" on public.couple_devices for delete to authenticated using (user_id = auth.uid());
-- kunci publik tidak boleh diganti diam-diam (mencegah penyusupan kunci): hanya label & last_seen yang boleh berubah
create or replace function public.cd_lock_pub() returns trigger language plpgsql set search_path = public as $$
begin if new.pub is distinct from old.pub or new.user_id is distinct from old.user_id then raise exception 'kunci publik perangkat tidak boleh diubah'; end if; return new; end $$;
drop trigger if exists cd_lock_pub on public.couple_devices;
create trigger cd_lock_pub before update on public.couple_devices for each row execute function public.cd_lock_pub();
drop policy if exists "mfa_required" on public.couple_devices;
create policy "mfa_required" on public.couple_devices as restrictive to authenticated using ((select public.mfa_ok())) with check ((select public.mfa_ok()));

-- ===================== (I) PENGERASAN =====================
-- is_couple() hanya untuk user yang login (bukan anon).
revoke execute on function public.is_couple() from public, anon;
grant execute on function public.is_couple() to authenticated;
revoke execute on function public.cd_lock_pub() from public, anon, authenticated;
