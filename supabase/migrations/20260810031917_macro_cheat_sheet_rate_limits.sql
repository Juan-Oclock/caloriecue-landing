-- Persists privacy-preserving delivery rate-limit counters.
create table public.macro_cheat_sheet_rate_limits (
  bucket_type text not null check (bucket_type in ('ip', 'email')),
  key_hash text not null check (key_hash ~ '^[0-9a-f]{64}$'),
  window_start timestamptz not null,
  request_count integer not null check (request_count > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (bucket_type, key_hash, window_start)
);

comment on table public.macro_cheat_sheet_rate_limits is
  'Fixed-window counters for the macro cheat-sheet email endpoint. Keys are HMAC-SHA256 digests; raw IP and email values are never stored.';

create index macro_cheat_sheet_rate_limits_window_start_idx
  on public.macro_cheat_sheet_rate_limits (window_start);

alter table public.macro_cheat_sheet_rate_limits enable row level security;
alter table public.macro_cheat_sheet_rate_limits force row level security;

revoke all on table public.macro_cheat_sheet_rate_limits from public;
revoke all on table public.macro_cheat_sheet_rate_limits from anon;
revoke all on table public.macro_cheat_sheet_rate_limits from authenticated;
grant select, insert, update, delete
  on table public.macro_cheat_sheet_rate_limits
  to service_role;

create or replace function public.consume_macro_cheat_sheet_rate_limit(
  p_ip_hash text,
  p_email_hash text,
  p_ip_limit integer,
  p_ip_window_seconds integer,
  p_email_limit integer,
  p_email_window_seconds integer
)
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_ip_window_start timestamptz;
  v_email_window_start timestamptz;
  v_ip_count integer;
  v_email_count integer;
  v_ip_retry integer := 0;
  v_email_retry integer := 0;
  v_lock_key text;
begin
  if p_ip_hash !~ '^[0-9a-f]{64}$'
    or p_email_hash !~ '^[0-9a-f]{64}$'
    or p_ip_limit < 1 or p_ip_limit > 1000
    or p_email_limit < 1 or p_email_limit > 1000
    or p_ip_window_seconds < 1 or p_ip_window_seconds > 86400
    or p_email_window_seconds < 1 or p_email_window_seconds > 86400
  then
    raise exception 'invalid macro cheat-sheet rate-limit parameters'
      using errcode = '22023';
  end if;

  v_ip_window_start := to_timestamp(
    floor(extract(epoch from v_now) / p_ip_window_seconds)
      * p_ip_window_seconds
  );
  v_email_window_start := to_timestamp(
    floor(extract(epoch from v_now) / p_email_window_seconds)
      * p_email_window_seconds
  );

  -- Both keyed locks are acquired in lexical order so concurrent requests for
  -- the same email and different IPs cannot deadlock or oversubscribe a bucket.
  for v_lock_key in
    select lock_key
    from (values
      ('email:' || p_email_hash),
      ('ip:' || p_ip_hash)
    ) as locks(lock_key)
    order by lock_key
  loop
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(v_lock_key, 0)
    );
  end loop;

  -- Bound table growth without retaining identifiers beyond operational need.
  -- The window_start index keeps this opportunistic cleanup inexpensive.
  delete from public.macro_cheat_sheet_rate_limits
    where window_start < v_now - interval '2 days';

  select coalesce(max(request_count), 0)
    into v_ip_count
    from public.macro_cheat_sheet_rate_limits
    where bucket_type = 'ip'
      and key_hash = p_ip_hash
      and window_start = v_ip_window_start;

  select coalesce(max(request_count), 0)
    into v_email_count
    from public.macro_cheat_sheet_rate_limits
    where bucket_type = 'email'
      and key_hash = p_email_hash
      and window_start = v_email_window_start;

  if v_ip_count >= p_ip_limit then
    v_ip_retry := greatest(
      1,
      ceil(extract(epoch from (
        v_ip_window_start
          + make_interval(secs => p_ip_window_seconds)
          - v_now
      )))::integer
    );
  end if;

  if v_email_count >= p_email_limit then
    v_email_retry := greatest(
      1,
      ceil(extract(epoch from (
        v_email_window_start
          + make_interval(secs => p_email_window_seconds)
          - v_now
      )))::integer
    );
  end if;

  if v_ip_retry > 0 or v_email_retry > 0 then
    return query select false, greatest(v_ip_retry, v_email_retry);
    return;
  end if;

  insert into public.macro_cheat_sheet_rate_limits (
    bucket_type,
    key_hash,
    window_start,
    request_count,
    updated_at
  ) values (
    'ip', p_ip_hash, v_ip_window_start, 1, v_now
  )
  on conflict (bucket_type, key_hash, window_start)
  do update set
    request_count = public.macro_cheat_sheet_rate_limits.request_count + 1,
    updated_at = excluded.updated_at;

  insert into public.macro_cheat_sheet_rate_limits (
    bucket_type,
    key_hash,
    window_start,
    request_count,
    updated_at
  ) values (
    'email', p_email_hash, v_email_window_start, 1, v_now
  )
  on conflict (bucket_type, key_hash, window_start)
  do update set
    request_count = public.macro_cheat_sheet_rate_limits.request_count + 1,
    updated_at = excluded.updated_at;

  return query select true, 0;
end;
$$;

comment on function public.consume_macro_cheat_sheet_rate_limit(text, text, integer, integer, integer, integer) is
  'Atomically checks and consumes IP and email fixed-window counters. Callable only with the service role.';

revoke all on function public.consume_macro_cheat_sheet_rate_limit(text, text, integer, integer, integer, integer) from public;
revoke all on function public.consume_macro_cheat_sheet_rate_limit(text, text, integer, integer, integer, integer) from anon;
revoke all on function public.consume_macro_cheat_sheet_rate_limit(text, text, integer, integer, integer, integer) from authenticated;
grant execute on function public.consume_macro_cheat_sheet_rate_limit(text, text, integer, integer, integer, integer) to service_role;
