-- Allow admins to manage objective checklist items.
-- This replaces older or missing live policies that can block inserts from the Objectives Builder.

drop policy if exists "Admin manages objective items" on public.objective_items;
drop policy if exists "Admin reads objective items" on public.objective_items;
drop policy if exists "Admin inserts objective items" on public.objective_items;
drop policy if exists "Admin updates objective items" on public.objective_items;
drop policy if exists "Admin deletes objective items" on public.objective_items;

create policy "Admin reads objective items"
  on public.objective_items
  for select
  using (public.is_admin());

create policy "Admin inserts objective items"
  on public.objective_items
  for insert
  with check (public.is_admin());

create policy "Admin updates objective items"
  on public.objective_items
  for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admin deletes objective items"
  on public.objective_items
  for delete
  using (public.is_admin());
