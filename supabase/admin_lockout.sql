-- ─── admin login lockout (server-side brute-force guard) ─────────────────────
-- Moves the admin-login attempt counter out of the browser and into the DB so
-- it can't be reset by clearing localStorage, and is shared across devices.
--
-- The counter table is NOT exposed to clients (RLS on, no policies). All access
-- goes through SECURITY DEFINER functions below, which the pre-auth login form
-- calls as `anon`. That way the browser can ask "am I locked?" and report a
-- failure, but can never write arbitrary values into the table.
--
-- Policy: 5 failed attempts -> locked for 10 minutes, then the counter resets.
-- Run this whole file once in the Supabase SQL editor.

create table if not exists admin_login_attempts (
  email      text primary key,
  attempts   int not null default 0,
  lock_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table admin_login_attempts enable row level security;
-- No policies on purpose: direct select/insert/update/delete is denied for all
-- client roles. Only the SECURITY DEFINER functions below can touch the table.

-- Current lock state for an email (attempts + when the lock lifts, if any).
create or replace function get_admin_lockout(p_email text)
returns table (attempts int, lock_until timestamptz)
language sql
security definer
set search_path = public
as $$
  select attempts, lock_until
  from admin_login_attempts
  where email = lower(p_email);
$$;

-- Record one failed login. Locks for 10 minutes once attempts reach 5.
-- Returns the resulting state so the UI can show the countdown.
create or replace function record_admin_login_failure(p_email text)
returns table (attempts int, lock_until timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(p_email);
  rec     admin_login_attempts%rowtype;
  v_att   int;
  v_lock  timestamptz;
begin
  select * into rec from admin_login_attempts where email = v_email for update;

  -- First-ever failure for this email.
  if not found then
    insert into admin_login_attempts (email, attempts, lock_until, updated_at)
    values (v_email, 1, null, now());
    return query select 1, null::timestamptz;
    return;
  end if;

  -- Already locked: don't keep counting, just report the existing lock.
  if rec.lock_until is not null and rec.lock_until > now() then
    return query select rec.attempts, rec.lock_until;
    return;
  end if;

  -- A previous lock has expired -> start a fresh count; otherwise increment.
  if rec.lock_until is not null and rec.lock_until <= now() then
    v_att := 1;
  else
    v_att := rec.attempts + 1;
  end if;

  if v_att >= 5 then
    v_lock := now() + interval '10 minutes';
    update admin_login_attempts
      set attempts = 0, lock_until = v_lock, updated_at = now()
      where email = v_email;
    return query select 0, v_lock;
  else
    update admin_login_attempts
      set attempts = v_att, lock_until = null, updated_at = now()
      where email = v_email;
    return query select v_att, null::timestamptz;
  end if;
end;
$$;

-- Clear the counter for an email (called after a successful login).
create or replace function clear_admin_lockout(p_email text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from admin_login_attempts where email = lower(p_email);
$$;

-- The login form runs before authentication, so anon must be able to CALL the
-- functions (but still can't touch the table directly — see RLS above).
grant execute on function get_admin_lockout(text)          to anon, authenticated;
grant execute on function record_admin_login_failure(text) to anon, authenticated;
grant execute on function clear_admin_lockout(text)        to anon, authenticated;
