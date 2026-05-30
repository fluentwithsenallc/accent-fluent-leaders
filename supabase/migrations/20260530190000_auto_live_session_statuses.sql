-- Automatically move live sessions through their time-based lifecycle.
-- scheduled -> live when scheduled_at arrives
-- scheduled/live -> completed when scheduled_at + duration_minutes passes

create or replace function public.refresh_live_session_statuses()
returns table(live_count integer, completed_count integer)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'Only admins can refresh session statuses.';
  end if;

  return query
  with to_live as (
    update public.live_sessions
       set status = 'live',
           updated_at = now()
     where status = 'scheduled'
       and scheduled_at <= now()
       and scheduled_at + make_interval(mins => duration_minutes) > now()
     returning 1
  ),
  to_completed as (
    update public.live_sessions
       set status = 'completed',
           updated_at = now()
     where status in ('scheduled', 'live')
       and scheduled_at + make_interval(mins => duration_minutes) <= now()
     returning 1
  )
  select
    (select count(*)::integer from to_live),
    (select count(*)::integer from to_completed);
end;
$$;

grant execute on function public.refresh_live_session_statuses() to authenticated;

do $$
begin
  create extension if not exists pg_cron with schema extensions;

  if exists (
    select 1
    from pg_extension
    where extname = 'pg_cron'
  ) then
    if exists (
      select 1
      from cron.job
      where jobname = 'refresh-live-session-statuses-every-minute'
    ) then
      perform cron.unschedule('refresh-live-session-statuses-every-minute');
    end if;

    perform cron.schedule(
      'refresh-live-session-statuses-every-minute',
      '* * * * *',
      $sql$select public.refresh_live_session_statuses();$sql$
    );
  end if;
exception
  when insufficient_privilege or invalid_schema_name or undefined_table then
    raise notice 'pg_cron is not available here. Admin dashboard refresh will still update statuses.';
end;
$$;
