-- Automated client email reminders for upcoming live sessions.
-- One-time setup note:
--   Store a Vault secret named `session_reminder_apikey` with a Supabase secret key
--   (for example the service role key) so pg_cron can invoke the edge function securely.

create unique index if not exists notifications_session_reminder_once_per_session
  on public.notifications (recipient_id, related_id)
  where type = 'session_reminder'
    and related_table = 'live_sessions';

do $$
begin
  create extension if not exists pg_cron with schema extensions;
  create extension if not exists pg_net;
exception
  when insufficient_privilege or invalid_schema_name or undefined_file then
    raise notice 'pg_cron or pg_net is not available here. Session reminders will need to be scheduled manually.';
end;
$$;

do $$
begin
  perform 1 from vault.decrypted_secrets limit 1;

  if exists (
    select 1
    from cron.job
    where jobname = 'session-reminder-emails-every-minute'
  ) then
    perform cron.unschedule('session-reminder-emails-every-minute');
  end if;

  perform cron.schedule(
    'session-reminder-emails-every-minute',
    '* * * * *',
    $job$
    select
      case
        when exists (
          select 1
          from vault.decrypted_secrets
          where name = 'session_reminder_apikey'
        )
        then net.http_post(
          url := 'https://tpbbiwzwufmdhynsddwf.supabase.co/functions/v1/session-reminders',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'apikey', (
              select decrypted_secret
              from vault.decrypted_secrets
              where name = 'session_reminder_apikey'
              limit 1
            ),
            'Authorization', 'Bearer ' || (
              select decrypted_secret
              from vault.decrypted_secrets
              where name = 'session_reminder_apikey'
              limit 1
            )
          ),
          body := '{}'::jsonb
        )
        else null
      end;
    $job$
  );
exception
  when insufficient_privilege or invalid_schema_name or undefined_table or undefined_function then
    raise notice 'Session reminder cron could not be scheduled automatically. Ensure pg_cron, pg_net, and Vault are available.';
end;
$$;
