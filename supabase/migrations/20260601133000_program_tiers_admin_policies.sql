alter table public.program_tiers enable row level security;

drop policy if exists "Authenticated users read program tiers" on public.program_tiers;
drop policy if exists "Admin manages program tiers" on public.program_tiers;

create policy "Authenticated users read program tiers"
  on public.program_tiers
  for select
  using (auth.role() = 'authenticated');

create policy "Admin manages program tiers"
  on public.program_tiers
  for all
  using (public.is_admin())
  with check (public.is_admin());
