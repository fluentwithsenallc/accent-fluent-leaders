alter table public.applications
  drop constraint if exists applications_weekly_hours_check;

alter table public.applications
  add constraint applications_weekly_hours_check
    check (weekly_hours in ('4_hours', '4_5_hours'));
