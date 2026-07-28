begin;

create extension if not exists pgcrypto;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null
    check (nickname = btrim(nickname) and char_length(nickname) between 2 and 20),
  avatar_key text not null default 'chart-green'
    check (avatar_key in (
      'chart-green', 'globe-blue', 'coin-gold', 'bank-navy',
      'book-teal', 'graph-red', 'compass-gray', 'spark-green'
    )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_nickname_unique
  on public.profiles (lower(nickname));

create table public.profile_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp integer not null default 0 check (xp >= 0),
  quiz_correct_count integer not null default 0 check (quiz_correct_count >= 0),
  active_days integer not null default 0 check (active_days >= 0),
  last_active_on date,
  updated_at timestamptz not null default now()
);

create table public.profile_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  font_scale smallint not null default 105
    check (font_scale between 90 and 125 and font_scale % 5 = 0),
  high_contrast boolean not null default true,
  desktop_layout boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null check (item_type in ('market', 'company')),
  target_id text not null check (char_length(target_id) between 1 and 80),
  created_at timestamptz not null default now(),
  unique (user_id, item_type, target_id)
);

create table public.daily_activity (
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_date date not null
    default ((timezone('Asia/Seoul', now()))::date),
  xp_awarded smallint not null default 5 check (xp_awarded between 0 and 5),
  created_at timestamptz not null default now(),
  primary key (user_id, activity_date)
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id text not null check (char_length(quiz_id) between 1 and 100),
  selected_answer smallint not null check (selected_answer between 0 and 5),
  correct boolean not null,
  xp_awarded smallint not null default 0 check (xp_awarded between 0 and 10),
  answered_at timestamptz not null default now()
);

create index quiz_attempts_user_answered_idx
  on public.quiz_attempts (user_id, answered_at desc);
create index quiz_attempts_user_quiz_idx
  on public.quiz_attempts (user_id, quiz_id, correct);

create or replace function public.tier_for_xp(value integer)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select case
    when value >= 10000 then 'master'
    when value >= 6000 then 'diamond'
    when value >= 3500 then 'platinum'
    when value >= 1800 then 'gold'
    when value >= 800 then 'silver'
    when value >= 300 then 'bronze'
    else 'iron'
  end
$$;

create or replace function public.touch_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger touch_profiles_updated_at
before update on public.profiles
for each row execute function public.touch_profile_updated_at();

create trigger touch_preferences_updated_at
before update on public.profile_preferences
for each row execute function public.touch_profile_updated_at();

create or replace function public.enforce_watchlist_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  allowed_count integer;
  current_count integer;
begin
  allowed_count := case when new.item_type = 'market' then 20 else 50 end;
  select count(*) into current_count
  from public.watchlists
  where user_id = new.user_id and item_type = new.item_type;

  if current_count >= allowed_count then
    raise exception 'watchlist limit exceeded for %', new.item_type
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger enforce_watchlist_limit_before_insert
before insert on public.watchlists
for each row execute function public.enforce_watchlist_limit();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, nickname)
  values (new.id, 'user-' || substr(new.id::text, 1, 12));
  insert into public.profile_progress (user_id) values (new.id);
  insert into public.profile_preferences (user_id) values (new.id);
  return new;
end;
$$;

create trigger create_profile_after_signup
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (user_id, nickname)
select id, 'user-' || substr(id::text, 1, 12)
from auth.users
on conflict (user_id) do nothing;

insert into public.profile_progress (user_id)
select id from auth.users
on conflict (user_id) do nothing;

insert into public.profile_preferences (user_id)
select id from auth.users
on conflict (user_id) do nothing;

alter table public.profiles enable row level security;
alter table public.profile_progress enable row level security;
alter table public.profile_preferences enable row level security;
alter table public.watchlists enable row level security;
alter table public.daily_activity enable row level security;
alter table public.quiz_attempts enable row level security;

create policy "read own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "update own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "read own progress" on public.profile_progress
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "read own preferences" on public.profile_preferences
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "update own preferences" on public.profile_preferences
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "read own watchlist" on public.watchlists
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "add own watchlist" on public.watchlists
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "delete own watchlist" on public.watchlists
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "read own activity" on public.daily_activity
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "read own quiz attempts" on public.quiz_attempts
  for select to authenticated using ((select auth.uid()) = user_id);

revoke all on public.profiles, public.profile_progress,
  public.profile_preferences, public.watchlists,
  public.daily_activity, public.quiz_attempts from anon, authenticated;

grant select on public.profiles, public.profile_progress,
  public.profile_preferences, public.watchlists,
  public.daily_activity, public.quiz_attempts to authenticated;
grant update (nickname, avatar_key) on public.profiles to authenticated;
grant update (font_scale, high_contrast, desktop_layout)
  on public.profile_preferences to authenticated;
grant insert, delete on public.watchlists to authenticated;

revoke all on function public.tier_for_xp(integer) from public, anon;
grant execute on function public.tier_for_xp(integer) to authenticated;
revoke all on function public.touch_profile_updated_at() from public, anon, authenticated;
revoke all on function public.enforce_watchlist_limit() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;

commit;
