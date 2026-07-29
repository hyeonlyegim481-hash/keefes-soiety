begin;

alter table public.profile_progress
  add column if not exists manual_refresh_on date,
  add column if not exists manual_refresh_count smallint not null default 0
    check (manual_refresh_count between 0 and 3),
  add column if not exists last_manual_refresh_at timestamptz;

create or replace function public.consume_manual_refresh(
  target_user uuid,
  target_limit smallint default 3
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  today_kst date := (timezone('Asia/Seoul', now()))::date;
  progress_row public.profile_progress%rowtype;
  next_count smallint;
  reset_at timestamptz :=
    ((today_kst + 1)::timestamp at time zone 'Asia/Seoul');
begin
  if target_user is null or target_limit <> 3 then
    raise exception 'invalid manual refresh request'
      using errcode = 'invalid_parameter_value';
  end if;

  select *
  into progress_row
  from public.profile_progress
  where user_id = target_user
  for update;

  if progress_row.user_id is null then
    raise exception 'profile progress not found'
      using errcode = 'no_data_found';
  end if;

  if progress_row.manual_refresh_on is distinct from today_kst then
    progress_row.manual_refresh_count := 0;
  end if;

  if progress_row.manual_refresh_count >= target_limit then
    return jsonb_build_object(
      'allowed', false,
      'used_count', progress_row.manual_refresh_count,
      'remaining_count', 0,
      'reset_at', reset_at
    );
  end if;

  next_count := progress_row.manual_refresh_count + 1;
  update public.profile_progress
  set manual_refresh_on = today_kst,
      manual_refresh_count = next_count,
      last_manual_refresh_at = now(),
      updated_at = now()
  where user_id = target_user;

  return jsonb_build_object(
    'allowed', true,
    'used_count', next_count,
    'remaining_count', target_limit - next_count,
    'reset_at', reset_at
  );
end;
$$;

revoke all on function public.consume_manual_refresh(uuid, smallint)
  from public, anon, authenticated;
grant execute on function public.consume_manual_refresh(uuid, smallint)
  to service_role;

commit;
