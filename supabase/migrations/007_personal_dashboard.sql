begin;

alter table public.watchlists
  drop constraint if exists watchlists_item_type_check;

alter table public.watchlists
  add constraint watchlists_item_type_check
  check (item_type in ('market', 'company', 'indicator'));

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
  allowed_count := case
    when new.item_type = 'market' then 20
    when new.item_type = 'indicator' then 20
    else 50
  end;

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
  indicator_count integer;
begin
  if account_id is null then
    raise exception 'authentication is required' using errcode = 'insufficient_privilege';
  end if;
  if target_items is null or jsonb_typeof(target_items) <> 'array' then
    raise exception 'target_items must be an array' using errcode = 'invalid_parameter_value';
  end if;

  select count(*),
         count(*) filter (where item_type = 'market'),
         count(*) filter (where item_type = 'company'),
         count(*) filter (where item_type = 'indicator')
  into item_count, market_count, company_count, indicator_count
  from jsonb_to_recordset(target_items) as item(item_type text, target_id text);

  if item_count > 90
    or market_count > 20
    or company_count > 50
    or indicator_count > 20
  then
    raise exception 'watchlist limit exceeded' using errcode = 'check_violation';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(target_items) as item(item_type text, target_id text)
    where item_type not in ('market', 'company', 'indicator')
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

create table public.learning_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null default 'term' check (item_type = 'term'),
  target_id text not null check (char_length(target_id) between 1 and 120),
  label text not null check (char_length(label) between 1 and 180),
  category text not null default '' check (char_length(category) <= 80),
  viewed_at timestamptz not null default now(),
  unique (user_id, item_type, target_id)
);

create index learning_history_user_viewed_idx
  on public.learning_history (user_id, viewed_at desc);

create table public.saved_articles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  article_key text not null check (char_length(article_key) between 1 and 160),
  title text not null check (char_length(title) between 1 and 500),
  source text not null default '' check (char_length(source) <= 120),
  original_url text not null check (
    char_length(original_url) between 8 and 2048
    and original_url ~ '^https?://'
  ),
  published_at timestamptz,
  section text not null default '' check (char_length(section) <= 80),
  analysis jsonb not null default '{}'::jsonb
    check (octet_length(analysis::text) <= 16000),
  saved_at timestamptz not null default now(),
  unique (user_id, article_key)
);

create index saved_articles_user_saved_idx
  on public.saved_articles (user_id, saved_at desc);

alter table public.learning_history enable row level security;
alter table public.saved_articles enable row level security;

create policy "read own learning history" on public.learning_history
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "read own saved articles" on public.saved_articles
  for select to authenticated using ((select auth.uid()) = user_id);

revoke all on public.learning_history, public.saved_articles
  from anon, authenticated;
grant select on public.learning_history, public.saved_articles
  to authenticated;

create or replace function public.record_own_learning_item(
  target_id text,
  target_label text,
  target_category text default ''
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
  if target_id is null
    or char_length(target_id) not between 1 and 120
    or target_label is null
    or char_length(target_label) not between 1 and 180
    or char_length(coalesce(target_category, '')) > 80
  then
    raise exception 'invalid learning item' using errcode = 'invalid_parameter_value';
  end if;

  insert into public.learning_history (
    user_id, item_type, target_id, label, category, viewed_at
  ) values (
    account_id, 'term', target_id, target_label, coalesce(target_category, ''), now()
  )
  on conflict (user_id, item_type, target_id)
  do update set
    label = excluded.label,
    category = excluded.category,
    viewed_at = now();

  delete from public.learning_history
  where user_id = account_id
    and id in (
      select id
      from public.learning_history
      where user_id = account_id
      order by viewed_at desc
      offset 100
    );
end;
$$;

create or replace function public.save_own_article(
  target_article_key text,
  target_title text,
  target_source text,
  target_original_url text,
  target_published_at timestamptz,
  target_section text,
  target_analysis jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_id uuid := (select auth.uid());
  safe_analysis jsonb := coalesce(target_analysis, '{}'::jsonb);
begin
  if account_id is null then
    raise exception 'authentication is required' using errcode = 'insufficient_privilege';
  end if;
  if target_article_key is null
    or char_length(target_article_key) not between 1 and 160
    or target_title is null
    or char_length(target_title) not between 1 and 500
    or char_length(coalesce(target_source, '')) > 120
    or target_original_url is null
    or char_length(target_original_url) not between 8 and 2048
    or target_original_url !~ '^https?://'
    or char_length(coalesce(target_section, '')) > 80
    or octet_length(safe_analysis::text) > 16000
  then
    raise exception 'invalid saved article' using errcode = 'invalid_parameter_value';
  end if;

  insert into public.saved_articles (
    user_id, article_key, title, source, original_url,
    published_at, section, analysis, saved_at
  ) values (
    account_id, target_article_key, target_title, coalesce(target_source, ''),
    target_original_url, target_published_at, coalesce(target_section, ''),
    safe_analysis, now()
  )
  on conflict (user_id, article_key)
  do update set
    title = excluded.title,
    source = excluded.source,
    original_url = excluded.original_url,
    published_at = excluded.published_at,
    section = excluded.section,
    analysis = case
      when safe_analysis = '{}'::jsonb then public.saved_articles.analysis
      else safe_analysis
    end,
    saved_at = now();

  delete from public.saved_articles
  where user_id = account_id
    and id in (
      select id
      from public.saved_articles
      where user_id = account_id
      order by saved_at desc
      offset 100
    );
end;
$$;

create or replace function public.delete_own_article(target_article_key text)
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
  delete from public.saved_articles
  where user_id = account_id and article_key = target_article_key;
end;
$$;

revoke all on function public.record_own_learning_item(text, text, text)
  from public, anon;
revoke all on function public.save_own_article(
  text, text, text, text, timestamptz, text, jsonb
) from public, anon;
revoke all on function public.delete_own_article(text)
  from public, anon;

grant execute on function public.record_own_learning_item(text, text, text)
  to authenticated;
grant execute on function public.save_own_article(
  text, text, text, text, timestamptz, text, jsonb
) to authenticated;
grant execute on function public.delete_own_article(text)
  to authenticated;

revoke all on function public.enforce_watchlist_limit()
  from public, anon, authenticated;
revoke all on function public.replace_own_watchlists(jsonb)
  from public, anon;
grant execute on function public.replace_own_watchlists(jsonb)
  to authenticated;

commit;
