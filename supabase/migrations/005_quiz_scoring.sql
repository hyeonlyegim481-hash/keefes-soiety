begin;

alter table public.quiz_attempts
  drop constraint if exists quiz_attempts_xp_awarded_check;

alter table public.quiz_attempts
  add constraint quiz_attempts_xp_awarded_check
  check (xp_awarded between -5 and 10);

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
  potential_award smallint := case when target_correct then 10 else -5 end;
  awarded smallint := 0;
  next_xp integer := 0;
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

  next_xp := greatest(0, progress_row.xp + potential_award);
  awarded := (next_xp - progress_row.xp)::smallint;

  insert into public.quiz_attempts (
    user_id, quiz_id, selected_answer, correct, xp_awarded
  ) values (
    target_user, target_quiz_id, target_selected_answer, target_correct, awarded
  );

  update public.profile_progress
  set xp = next_xp,
      quiz_correct_count = quiz_correct_count + case when target_correct then 1 else 0 end,
      updated_at = now()
  where user_id = target_user
  returning * into progress_row;

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

revoke all on function public.record_quiz_attempt(uuid, text, smallint, boolean)
from public, anon, authenticated;

grant execute on function public.record_quiz_attempt(uuid, text, smallint, boolean)
to service_role;

commit;
