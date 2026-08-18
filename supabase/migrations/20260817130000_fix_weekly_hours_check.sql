-- Widen (not replace) the check: keep legacy values from existing
-- applications ('3_4', '4_5') alongside the new form options.
alter table public.applications
  drop constraint if exists applications_weekly_hours_check;

alter table public.applications
  add constraint applications_weekly_hours_check
    check (weekly_hours in ('3_4', '4_5', '3_hours', '4_hours', '5_hours'));
