-- Album foto "Momen Kita" — jalankan SEKALI di Supabase: SQL Editor → paste → Run.
-- Membuat bucket privat "album". Tiap akun hanya bisa melihat & mengubah fotonya sendiri
-- (folder = user id), sama seperti aturan tabel docs.

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
