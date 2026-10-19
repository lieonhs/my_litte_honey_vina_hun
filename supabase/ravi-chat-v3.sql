-- =====================================================================
-- RaVi v3: chat banyak orang (DM + grup), pusat notifikasi, log panggilan,
-- kunci enkripsi PER AKUN, status online/terakhir dilihat.
-- Aman dijalankan ulang. Pesan lama otomatis masuk ke chat Rafi ↔ Vina.
-- =====================================================================

-- ---------- anggota ----------
alter table public.couple_members add column if not exists partner   boolean not null default false;
alter table public.couple_members add column if not exists role      text    not null default 'member';
alter table public.couple_members add column if not exists last_seen timestamptz;
alter table public.couple_members add column if not exists avatar    text;
-- dua akun pertama = pasangan; akun tertua jadi admin (boleh menambah anggota dari aplikasi)
update public.couple_members set partner = true
  where user_id in (select user_id from public.couple_members m join auth.users u on u.id = m.user_id order by u.created_at limit 2)
    and not exists (select 1 from public.couple_members where partner);
update public.couple_members set role = 'admin'
  where user_id = (select m.user_id from public.couple_members m join auth.users u on u.id = m.user_id order by u.created_at limit 1)
    and not exists (select 1 from public.couple_members where role = 'admin');
-- anggota hanya boleh mengubah nama & avatar sendiri (bukan partner/role)
revoke update on public.couple_members from authenticated;
grant update (name, avatar) on public.couple_members to authenticated;

create or replace function public.is_partner() returns boolean
  language sql stable security definer set search_path = '' as
  $$ select exists (select 1 from public.couple_members where user_id = (select auth.uid()) and partner) $$;
revoke execute on function public.is_partner() from public, anon;
grant execute on function public.is_partner() to authenticated;

-- feed & komentar: khusus pasangan (teman yang ditambahkan nanti tidak bisa melihat)
alter policy "post_select" on public.couple_posts using (public.is_partner());
alter policy "post_insert" on public.couple_posts with check (public.is_partner() and author = auth.uid());
alter policy "post_update" on public.couple_posts using (public.is_partner()) with check (public.is_partner());
alter policy "cmt_select" on public.couple_comments using (public.is_partner());
alter policy "cmt_insert" on public.couple_comments with check (public.is_partner() and author = auth.uid());
revoke update on public.couple_posts from authenticated;
grant update (likes) on public.couple_posts to authenticated;

-- ---------- percakapan ----------
create table if not exists public.couple_convs (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('dm','group')),
  name        text,
  emoji       text,
  dm_key      text unique,
  created_by  uuid default auth.uid() references auth.users(id) on delete set null,
  pinned_msg  bigint,
  created_at  timestamptz not null default now()
);
create table if not exists public.couple_conv_members (
  conv_id      uuid not null references public.couple_convs(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         text not null default 'member',
  joined_at    timestamptz not null default now(),
  delivered_at timestamptz,
  read_at      timestamptz,
  primary key (conv_id, user_id)
);
create index if not exists ccm_user on public.couple_conv_members(user_id);

create or replace function public.in_conv(c uuid) returns boolean
  language sql stable security definer set search_path = '' as
  $$ select exists (select 1 from public.couple_conv_members where conv_id = c and user_id = (select auth.uid()) and role <> 'left') $$;
revoke execute on function public.in_conv(uuid) from public, anon;
grant execute on function public.in_conv(uuid) to authenticated;

alter table public.couple_convs enable row level security;
alter table public.couple_conv_members enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='couple_convs' and policyname='conv_select') then
    create policy "conv_select" on public.couple_convs for select to authenticated using (public.in_conv(id)); end if;
  if not exists (select 1 from pg_policies where tablename='couple_convs' and policyname='conv_update') then
    create policy "conv_update" on public.couple_convs for update to authenticated using (public.in_conv(id)) with check (public.in_conv(id)); end if;
  if not exists (select 1 from pg_policies where tablename='couple_conv_members' and policyname='ccm_select') then
    create policy "ccm_select" on public.couple_conv_members for select to authenticated using (public.in_conv(conv_id)); end if;
end $$;
revoke insert, update, delete on public.couple_convs from authenticated;
grant update (name, emoji, pinned_msg) on public.couple_convs to authenticated;
revoke insert, update, delete on public.couple_conv_members from authenticated;

-- chat Rafi ↔ Vina (pasangan) untuk semua pesan lama
create or replace function public.ravi_dm_key(a uuid, b uuid) returns text language sql immutable as
  $$ select least(a::text, b::text) || ':' || greatest(a::text, b::text) $$;
do $$ declare a uuid; b uuid; c uuid;
begin
  select user_id into a from public.couple_members where partner order by user_id limit 1;
  select user_id into b from public.couple_members where partner and user_id <> a order by user_id limit 1;
  if a is not null and b is not null then
    insert into public.couple_convs (kind, dm_key, created_by) values ('dm', public.ravi_dm_key(a,b), a)
      on conflict (dm_key) do nothing;
    select id into c from public.couple_convs where dm_key = public.ravi_dm_key(a,b);
    insert into public.couple_conv_members (conv_id, user_id) values (c, a), (c, b) on conflict do nothing;
  end if;
end $$;

alter table public.couple_msgs add column if not exists conv_id uuid references public.couple_convs(id) on delete cascade;
create index if not exists cmsg_conv on public.couple_msgs(conv_id, id desc);
update public.couple_msgs set conv_id = (
  select c.id from public.couple_convs c where c.kind = 'dm' and c.dm_key = (
    select public.ravi_dm_key(min(user_id::text)::uuid, max(user_id::text)::uuid) from public.couple_members where partner))
  where conv_id is null;
-- aplikasi versi lama (masih di cache) tidak mengirim conv_id → masukkan ke chat pasangan
create or replace function public.cmsg_default_conv() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.conv_id is null then
    select c.id into new.conv_id from public.couple_convs c
      where c.kind = 'dm' and c.dm_key = (select public.ravi_dm_key(min(user_id::text)::uuid, max(user_id::text)::uuid) from public.couple_members where partner);
  end if;
  return new;
end $$;
revoke execute on function public.cmsg_default_conv() from public, anon, authenticated;
do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'cmsg_default_conv') then
    create trigger cmsg_default_conv before insert on public.couple_msgs for each row execute function public.cmsg_default_conv();
  end if;
end $$;

alter policy "msg_select" on public.couple_msgs using (public.in_conv(conv_id));
alter policy "msg_insert" on public.couple_msgs with check (sender = auth.uid() and public.in_conv(conv_id));
alter policy "msg_update" on public.couple_msgs using (public.in_conv(conv_id)) with check (public.in_conv(conv_id));
-- isi pesan tidak bisa diubah orang lain: hanya reaksi (dan tanda baca versi lama)
revoke update on public.couple_msgs from authenticated;
grant update (reacts, read_at) on public.couple_msgs to authenticated;

-- ---------- RPC chat ----------
create or replace function public.ravi_dm(other uuid) returns uuid
  language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); c uuid;
begin
  if me is null or other is null or other = me then raise exception 'pengguna tidak valid'; end if;
  if not exists (select 1 from public.couple_members where user_id = me)
     or not exists (select 1 from public.couple_members where user_id = other) then raise exception 'bukan anggota RaVi'; end if;
  insert into public.couple_convs (kind, dm_key, created_by) values ('dm', public.ravi_dm_key(me, other), me)
    on conflict (dm_key) do nothing;
  select id into c from public.couple_convs where dm_key = public.ravi_dm_key(me, other);
  insert into public.couple_conv_members (conv_id, user_id) values (c, me), (c, other) on conflict do nothing;
  return c;
end $$;

create or replace function public.ravi_group_create(p_name text, p_members uuid[], p_emoji text default null) returns uuid
  language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); c uuid; u uuid;
begin
  if me is null or not exists (select 1 from public.couple_members where user_id = me) then raise exception 'bukan anggota RaVi'; end if;
  if coalesce(trim(p_name), '') = '' then raise exception 'nama grup wajib diisi'; end if;
  insert into public.couple_convs (kind, name, emoji, created_by) values ('group', left(trim(p_name), 60), left(p_emoji, 8), me) returning id into c;
  insert into public.couple_conv_members (conv_id, user_id, role) values (c, me, 'admin');
  foreach u in array coalesce(p_members, '{}') loop
    if u <> me and exists (select 1 from public.couple_members where user_id = u) then
      insert into public.couple_conv_members (conv_id, user_id) values (c, u) on conflict do nothing;
      insert into public.couple_activity (target, actor, kind, ref) values (u, me, 'group', c::text);
    end if;
  end loop;
  return c;
end $$;

create or replace function public.ravi_group_add(c uuid, p_members uuid[]) returns void
  language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); u uuid;
begin
  if not exists (select 1 from public.couple_conv_members m join public.couple_convs v on v.id = m.conv_id
                 where m.conv_id = c and m.user_id = me and m.role = 'admin' and v.kind = 'group') then raise exception 'hanya admin grup'; end if;
  foreach u in array coalesce(p_members, '{}') loop
    if exists (select 1 from public.couple_members where user_id = u) then
      insert into public.couple_conv_members (conv_id, user_id) values (c, u)
        on conflict (conv_id, user_id) do update set role = 'member', joined_at = now() where public.couple_conv_members.role = 'left';
      if found then insert into public.couple_activity (target, actor, kind, ref) values (u, me, 'group', c::text); end if;
    end if;
  end loop;
end $$;

-- keluar / dikeluarkan dari grup: tandai "left" (riwayat tetap utuh, akses dicabut)
create or replace function public.ravi_group_remove(c uuid, u uuid) returns void
  language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid();
begin
  if not exists (select 1 from public.couple_convs where id = c and kind = 'group') then raise exception 'bukan grup'; end if;
  if u <> me and not exists (select 1 from public.couple_conv_members m
                 where m.conv_id = c and m.user_id = me and m.role = 'admin') then raise exception 'hanya admin grup'; end if;
  update public.couple_conv_members set role = 'left' where conv_id = c and user_id = u;
  if not exists (select 1 from public.couple_conv_members where conv_id = c and role = 'admin') then
    update public.couple_conv_members set role = 'admin'
      where conv_id = c and user_id = (select user_id from public.couple_conv_members where conv_id = c and role <> 'left' order by joined_at limit 1);
  end if;
end $$;

-- tanda terkirim / dibaca memakai jam server (supaya ✓✓ tidak meleset karena jam HP berbeda)
create or replace function public.ravi_mark(c uuid, p_read boolean) returns timestamptz
  language plpgsql security definer set search_path = '' as $$
declare t timestamptz := now();
begin
  update public.couple_conv_members set delivered_at = t, read_at = case when p_read then t else read_at end
    where conv_id = c and user_id = auth.uid();
  return t;
end $$;
create or replace function public.ravi_mark_all() returns void
  language sql security definer set search_path = '' as
  $$ update public.couple_conv_members set delivered_at = now() where user_id = (select auth.uid()) $$;
create or replace function public.ravi_seen() returns void
  language sql security definer set search_path = '' as
  $$ update public.couple_members set last_seen = now() where user_id = (select auth.uid()) $$;

-- daftar chat: pesan terakhir + jumlah belum dibaca
create or replace function public.ravi_inbox() returns table (
  conv_id uuid, kind text, name text, emoji text, pinned_msg bigint, members jsonb,
  last_id bigint, last_sender uuid, last_body text, last_img text, last_at timestamptz, unread int)
  language sql stable security definer set search_path = '' as $$
  select c.id, c.kind, c.name, c.emoji, c.pinned_msg,
    (select jsonb_agg(jsonb_build_object('u', m2.user_id, 'r', m2.role, 'd', m2.delivered_at, 'rd', m2.read_at))
       from public.couple_conv_members m2 where m2.conv_id = c.id and m2.role <> 'left'),
    l.id, l.sender, l.body, l.img, coalesce(l.created_at, c.created_at),
    (select count(*)::int from public.couple_msgs x where x.conv_id = c.id and x.sender <> me.user_id
       and x.created_at > coalesce(me.read_at, me.joined_at - interval '100 years'))
  from public.couple_conv_members me
  join public.couple_convs c on c.id = me.conv_id
  left join lateral (select * from public.couple_msgs x where x.conv_id = c.id order by x.id desc limit 1) l on true
  where me.user_id = (select auth.uid()) and me.role <> 'left'
  order by coalesce(l.created_at, c.created_at) desc $$;

do $$ declare f text;
begin
  foreach f in array array['ravi_dm(uuid)','ravi_group_create(text,uuid[],text)','ravi_group_add(uuid,uuid[])','ravi_group_remove(uuid,uuid)',
                           'ravi_mark(uuid,boolean)','ravi_mark_all()','ravi_seen()','ravi_inbox()'] loop
    execute format('revoke execute on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;

-- ---------- kunci enkripsi PER AKUN ----------
-- Kunci privat dibungkus (AES-GCM) dengan kunci turunan PBKDF2 dari password login. Server hanya menyimpan bungkusannya.
create table if not exists public.couple_ukeys (
  user_id    uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  pub        jsonb not null,
  wrapped    text not null,
  salt       text not null,
  iter       int  not null default 600000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.couple_ukeys enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='couple_ukeys' and policyname='uk_select') then
    create policy "uk_select" on public.couple_ukeys for select to authenticated using (public.is_couple()); end if;
  if not exists (select 1 from pg_policies where tablename='couple_ukeys' and policyname='uk_insert_own') then
    create policy "uk_insert_own" on public.couple_ukeys for insert to authenticated with check (user_id = auth.uid() and public.is_couple()); end if;
  if not exists (select 1 from pg_policies where tablename='couple_ukeys' and policyname='uk_update_own') then
    create policy "uk_update_own" on public.couple_ukeys for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid()); end if;
end $$;

-- ---------- pusat notifikasi + log panggilan ----------
-- Tidak menyimpan isi pesan/komentar (itu terenkripsi); hanya "siapa, apa, kapan".
create table if not exists public.couple_activity (
  id         bigint generated always as identity primary key,
  target     uuid not null references auth.users(id) on delete cascade,
  actor      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind       text not null check (kind in ('like','comment','post','react','call','group','mention')),
  ref        text,
  meta       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at    timestamptz
);
create index if not exists cact_target on public.couple_activity(target, id desc);
create index if not exists cact_actor on public.couple_activity(actor, id desc);
alter table public.couple_activity enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='couple_activity' and policyname='act_select') then
    create policy "act_select" on public.couple_activity for select to authenticated using (target = auth.uid() or actor = auth.uid()); end if;
  if not exists (select 1 from pg_policies where tablename='couple_activity' and policyname='act_insert') then
    create policy "act_insert" on public.couple_activity for insert to authenticated with check (
      actor = auth.uid() and target <> actor and public.is_couple()
      and exists (select 1 from public.couple_members where user_id = target)); end if;
  if not exists (select 1 from pg_policies where tablename='couple_activity' and policyname='act_update_own') then
    create policy "act_update_own" on public.couple_activity for update to authenticated using (target = auth.uid()) with check (target = auth.uid()); end if;
  if not exists (select 1 from pg_policies where tablename='couple_activity' and policyname='act_delete') then
    create policy "act_delete" on public.couple_activity for delete to authenticated using (target = auth.uid() or actor = auth.uid()); end if;
end $$;
revoke update on public.couple_activity from authenticated;
grant update (read_at) on public.couple_activity to authenticated;

-- ---------- pesan berbintang ----------
create table if not exists public.couple_stars (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  msg_id     bigint not null references public.couple_msgs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, msg_id)
);
alter table public.couple_stars enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='couple_stars' and policyname='star_own') then
    create policy "star_own" on public.couple_stars for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid()); end if;
end $$;

-- ---------- 2FA wajib (bila aktif) untuk tabel baru ----------
do $$ declare t text;
begin
  foreach t in array array['couple_convs','couple_conv_members','couple_ukeys','couple_activity','couple_stars'] loop
    if not exists (select 1 from pg_policies where tablename = t and policyname = 'mfa_required') then
      execute format('create policy "mfa_required" on public.%I as restrictive to authenticated using ((select public.mfa_ok())) with check ((select public.mfa_ok()))', t);
    end if;
  end loop;
end $$;

-- ---------- realtime ----------
do $$ begin alter publication supabase_realtime add table public.couple_convs; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.couple_conv_members; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.couple_activity; exception when duplicate_object then null; end $$;

-- channel privat:
--   ravi-presence      → status online semua anggota
--   ravi-u-<user id>   → kotak masuk sinyal telepon (hanya pemiliknya yang bisa mendengar, anggota lain boleh mengirim)
--   ravi-c-<chat id>   → "sedang mengetik…" (hanya anggota chat itu)
--   ravi-call-* / ravi-presence-* → versi lama, khusus pasangan
create or replace function public.ravi_topic_ok(t text, sending boolean) returns boolean
  language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.couple_members where user_id = (select auth.uid())) then return false; end if;
  if t = 'ravi-presence' then return true; end if;
  if t like 'ravi-u-%' then return sending or t = 'ravi-u-' || (select auth.uid())::text; end if;
  if t ~ '^ravi-c-[0-9a-f-]{36}$' then return public.in_conv(substring(t from 8)::uuid); end if;
  if t like 'ravi-call-%' or t like 'ravi-presence-%' then return public.is_partner(); end if;
  return false;
end $$;
revoke execute on function public.ravi_topic_ok(text, boolean) from public, anon;
grant execute on function public.ravi_topic_ok(text, boolean) to authenticated;
alter policy "ravi_rt_select" on realtime.messages using (public.ravi_topic_ok(realtime.topic(), false));
alter policy "ravi_rt_insert" on realtime.messages with check (public.ravi_topic_ok(realtime.topic(), true));

-- status awal: anggota lama dianggap sudah membaca semua pesan lama
update public.couple_conv_members set read_at = coalesce(read_at, now()), delivered_at = coalesce(delivered_at, now()) where read_at is null;
