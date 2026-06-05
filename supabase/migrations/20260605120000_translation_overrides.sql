create table if not exists public.translation_overrides (
  english_key text primary key,
  spanish_text text not null,
  updated_at timestamptz not null default now()
);

grant select on table public.translation_overrides to anon, authenticated;
grant insert, update, delete on table public.translation_overrides to authenticated;

alter table public.translation_overrides enable row level security;

create policy "Anyone can read translation overrides"
  on public.translation_overrides
  for select
  using (true);

create policy "Admin manages translation overrides"
  on public.translation_overrides
  for all
  using (public.is_admin())
  with check (public.is_admin());
