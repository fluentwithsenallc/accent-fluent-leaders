-- Allow students to mark their own objective checklist items complete/incomplete.

drop policy if exists "Student updates own objective items" on public.objective_items;

create policy "Student updates own objective items"
  on public.objective_items
  for update
  using (
    exists (
      select 1
      from public.objectives o
      where o.id = objective_id
        and (o.student_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1
      from public.objectives o
      where o.id = objective_id
        and (o.student_id = auth.uid() or public.is_admin())
    )
  );
