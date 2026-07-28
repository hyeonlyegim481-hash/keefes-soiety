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
  progress_row public.profile_progress%rowtype;
begin
  if target_user is null then
    raise exception 'target_user is required' using errcode = 'invalid_parameter_value';
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
  else
    select * into progress_row
    from public.profile_progress
    where user_id = target_user;
  end if;

  if progress_row.user_id is null then
    raise exception 'profile progress not found' using errcode = 'no_data_found';
  end if;

  return jsonb_build_object(
    'xp', progress_row.xp,
    'active_days', progress_row.active_days,
    'quiz_correct_count', progress_row.quiz_correct_count,
    'last_active_on', progress_row.last_active_on,
    'xp_awarded', awarded,
    'tier', public.tier_for_xp(progress_row.xp)
  );
end;
$$;

create or replace function public.record_quiz_attempt(
  target_user uuid,
  target_quiz_id text,
  target_selected_answer smallint,
  target_correct boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  today_kst date := (timezone('Asia/Seoul', now()))::date;
  previous_attempt_exists boolean := false;
  previous_correct_exists boolean := false;
  today_attempt_count integer := 0;
  today_quiz_xp integer := 0;
  potential_award smallint := 0;
  awarded smallint := 0;
  progress_row public.profile_progress%rowtype;
begin
  if target_user is null
    or target_quiz_id is null
    or char_length(target_quiz_id) < 1
    or char_length(target_quiz_id) > 100
    or target_correct is null
    or target_selected_answer < 0
    or target_selected_answer > 5
  then
    raise exception 'invalid quiz attempt' using errcode = 'invalid_parameter_value';
  end if;

  select * into progress_row
  from public.profile_progress
  where user_id = target_user
  for update;

  if progress_row.user_id is null then
    raise exception 'profile progress not found' using errcode = 'no_data_found';
  end if;

  select count(*) into today_attempt_count
  from public.quiz_attempts
  where user_id = target_user
    and (timezone('Asia/Seoul', answered_at))::date = today_kst;

  if today_attempt_count >= 200 then
    raise exception 'daily quiz attempt limit exceeded' using errcode = 'check_violation';
  end if;

  select exists (
    select 1 from public.quiz_attempts
    where user_id = target_user and quiz_id = target_quiz_id
  ) into previous_attempt_exists;

  select exists (
    select 1 from public.quiz_attempts
    where user_id = target_user and quiz_id = target_quiz_id and correct = true
  ) into previous_correct_exists;

  if target_correct and not previous_correct_exists then
    potential_award := case when previous_attempt_exists then 3 else 10 end;
    select coalesce(sum(xp_awarded), 0) into today_quiz_xp
    from public.quiz_attempts
    where user_id = target_user
      and (timezone('Asia/Seoul', answered_at))::date = today_kst;
    awarded := least(potential_award, greatest(0, 100 - today_quiz_xp));
  end if;

  insert into public.quiz_attempts (
    user_id, quiz_id, selected_answer, correct, xp_awarded
  ) values (
    target_user, target_quiz_id, target_selected_answer, target_correct, awarded
  );

  if target_correct and not previous_correct_exists then
    update public.profile_progress
    set xp = xp + awarded,
        quiz_correct_count = quiz_correct_count + 1,
        updated_at = now()
    where user_id = target_user
    returning * into progress_row;
  end if;

  return jsonb_build_object(
    'xp', progress_row.xp,
    'active_days', progress_row.active_days,
    'quiz_correct_count', progress_row.quiz_correct_count,
    'last_active_on', progress_row.last_active_on,
    'xp_awarded', awarded,
    'tier', public.tier_for_xp(progress_row.xp)
  );
end;
$$;

create or replace function public.replace_own_watchlists(target_items jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_id uuid := (select auth.uid());
  item_count integer;
  market_count integer;
  company_count integer;
begin
  if account_id is null then
    raise exception 'authentication is required' using errcode = 'insufficient_privilege';
  end if;
  if target_items is null or jsonb_typeof(target_items) <> 'array' then
    raise exception 'target_items must be an array' using errcode = 'invalid_parameter_value';
  end if;

  select count(*),
         count(*) filter (where item_type = 'market'),
         count(*) filter (where item_type = 'company')
  into item_count, market_count, company_count
  from jsonb_to_recordset(target_items) as item(item_type text, target_id text);

  if item_count > 70 or market_count > 20 or company_count > 50 then
    raise exception 'watchlist limit exceeded' using errcode = 'check_violation';
  end if;
  if exists (
    select 1
    from jsonb_to_recordset(target_items) as item(item_type text, target_id text)
    where item_type not in ('market', 'company')
       or target_id is null
       or char_length(target_id) not between 1 and 80
       or (item_type = 'market' and target_id not in (
         'kospi', 'kosdaq', 'usdkrw', 'sp500', 'nasdaq', 'vix', 'wti', 'gold'
       ))
  ) then
    raise exception 'invalid watchlist item' using errcode = 'invalid_parameter_value';
  end if;

  delete from public.watchlists where user_id = account_id;
  insert into public.watchlists (user_id, item_type, target_id)
  select account_id, item_type, target_id
  from (
    select distinct item_type, target_id
    from jsonb_to_recordset(target_items) as item(item_type text, target_id text)
  ) deduplicated;
end;
$$;

revoke insert, delete on public.watchlists from authenticated;
revoke all on function public.replace_own_watchlists(jsonb) from public, anon;
grant execute on function public.replace_own_watchlists(jsonb) to authenticated;
create or replace function public.save_own_profile(
  target_nickname text,
  target_avatar_key text,
  target_items jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_id uuid := (select auth.uid());
begin
  if account_id is null then
    raise exception 'authentication is required' using errcode = 'insufficient_privilege';
  end if;
  if target_nickname is null
    or target_nickname <> btrim(target_nickname)
    or char_length(target_nickname) not between 2 and 20
    or target_avatar_key not in (
      'chart-green', 'globe-blue', 'coin-gold', 'bank-navy',
      'book-teal', 'graph-red', 'compass-gray', 'spark-green'
    )
  then
    raise exception 'invalid profile input' using errcode = 'invalid_parameter_value';
  end if;

  update public.profiles
  set nickname = target_nickname,
      avatar_key = target_avatar_key
  where user_id = account_id;
  if not found then
    raise exception 'profile not found' using errcode = 'no_data_found';
  end if;

  perform public.replace_own_watchlists(target_items);
end;
$$;

revoke update (nickname, avatar_key) on public.profiles from authenticated;
revoke all on function public.save_own_profile(text, text, jsonb) from public, anon;
grant execute on function public.save_own_profile(text, text, jsonb) to authenticated;
revoke all on function public.record_daily_activity(uuid)
  from public, anon, authenticated;
revoke all on function public.record_quiz_attempt(uuid, text, smallint, boolean)
  from public, anon, authenticated;
grant execute on function public.record_daily_activity(uuid) to service_role;
grant execute on function public.record_quiz_attempt(uuid, text, smallint, boolean)
  to service_role;

commit;
