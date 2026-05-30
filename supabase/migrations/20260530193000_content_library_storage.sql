insert into storage.buckets (id, name, public)
values ('content-library', 'content-library', true)
on conflict (id) do update set public = true;

drop policy if exists "Public reads content library files" on storage.objects;
drop policy if exists "Admins upload content library files" on storage.objects;
drop policy if exists "Admins update content library files" on storage.objects;
drop policy if exists "Admins delete content library files" on storage.objects;

create policy "Public reads content library files"
  on storage.objects for select
  using (bucket_id = 'content-library');

create policy "Admins upload content library files"
  on storage.objects for insert
  with check (bucket_id = 'content-library' and public.is_admin());

create policy "Admins update content library files"
  on storage.objects for update
  using (bucket_id = 'content-library' and public.is_admin())
  with check (bucket_id = 'content-library' and public.is_admin());

create policy "Admins delete content library files"
  on storage.objects for delete
  using (bucket_id = 'content-library' and public.is_admin());
