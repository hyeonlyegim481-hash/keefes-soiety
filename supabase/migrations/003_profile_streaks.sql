begin;

create or replace function public.record_daily_activity(target_user uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  today_kst date := (timezone('Asia/Seoul', now()))::date;
  inserted_count integer := 0;
  awarded smallint := 0;
  current_streak integer := 0;
  longest_streak integer := 0;
  progress_row public.profile_progress%rowtype;
begin
  if target_user is null then
    raise exception 'target_user is required' using errcode = 'invalid_parameter_value';
  end if;

  select * into progress_row
  from public.profile_progress
  where user_id = target_user
  for update;

  if progress_row.user_id is null then
    raise exception 'profile progress not found' using errcode = 'no_data_found';
  end if;

  insert into public.daily_activity (user_id, activity_date, xp_awarded)
  values (target_user, today_kst, 5)
  on conflict (user_id, activity_date) do nothing;
  get diagnostics inserted_count = row_count;

  if inserted_count = 1 then
    awarded := 5;
    update public.profile_progress
    set xp = xp + awarded,
        active_days = active_days + 1,
        last_active_on = today_kst,
        updated_at = now()
    where user_id = target_user
    returning * into progress_row;
  end if;

  with ordered_activity as (
    select
      activity_date,
      activity_date
        - (row_number() over (order by activity_date))::integer as streak_group
    from public.daily_activity
    where user_id = target_user
  ),
  streaks as (
    select
      max(activity_date) as ended_on,
      count(*)::integer as streak_length
    from ordered_activity
    group by streak_group
  )
  select
    coalesce(max(streak_length) filter (where ended_on = today_kst), 0),
    coalesce(max(streak_length), 0)
  into current_streak, longest_streak
  from streaks;

  return jsonb_build_object(
    'xp', progress_row.xp,
    'active_days', progress_row.active_days,
    'quiz_correct_count', progress_row.quiz_correct_count,
    'last_active_on', progress_row.last_active_on,
    'current_streak', current_streak,
    'longest_streak', longest_streak,
    'xp_awarded', awarded,
    'tier', public.tier_for_xp(progress_row.xp)
  );
end;
$$;

revoke all on function public.record_daily_activity(uuid)
  from public, anon, authenticated;
grant execute on function public.record_daily_activity(uuid) to service_role;

commit;