import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migrationUrl = new URL("./supabase/migrations/002_profile_rewards.sql", import.meta.url);
const streakMigrationUrl = new URL(
  "./supabase/migrations/003_profile_streaks.sql",
  import.meta.url
);
const fontScaleMigrationUrl = new URL(
  "./supabase/migrations/004_profile_font_scale.sql",
  import.meta.url
);
const quizScoringMigrationUrl = new URL(
  "./supabase/migrations/005_quiz_scoring.sql",
  import.meta.url
);
const manualRefreshMigrationUrl = new URL(
  "./supabase/migrations/006_manual_refresh_quota.sql",
  import.meta.url
);

test("profile reward migration is atomic and service-role only", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  assert.match(sql, /create or replace function public\.record_daily_activity/);
  assert.match(sql, /on conflict \(user_id, activity_date\) do nothing/);
  assert.match(sql, /create or replace function public\.record_quiz_attempt/);
  assert.match(sql, /for update/);
  assert.match(sql, /grant execute .*service_role/is);
  assert.match(sql, /create or replace function public\.replace_own_watchlists/);
  assert.match(sql, /revoke insert, delete on public\.watchlists from authenticated/);
  assert.match(sql, /create or replace function public\.save_own_profile/);
  assert.match(sql, /revoke update \(nickname, avatar_key\) on public\.profiles from authenticated/);
  assert.match(sql, /grant execute on function public\.replace_own_watchlists\(jsonb\) to authenticated/);
  assert.match(sql, /revoke all on function public\.record_daily_activity\(uuid\)[\s\S]*from public, anon, authenticated/);
});

test("profile streak migration calculates consecutive KST activity safely", async () => {
  const sql = await readFile(streakMigrationUrl, "utf8");
  assert.match(sql, /timezone\('Asia\/Seoul', now\(\)\)/);
  assert.match(sql, /for update/);
  assert.match(sql, /on conflict \(user_id, activity_date\) do nothing/);
  assert.match(sql, /row_number\(\) over \(order by activity_date\)/);
  assert.match(sql, /filter \(where ended_on = today_kst\)/);
  assert.match(sql, /'current_streak', current_streak/);
  assert.match(sql, /'longest_streak', longest_streak/);
  assert.match(sql, /grant execute .*service_role/is);
});
test("profile font scale migration permits synchronized values through 150 percent", async () => {
  const sql = await readFile(fontScaleMigrationUrl, "utf8");
  assert.match(sql, /drop constraint if exists profile_preferences_font_scale_check/);
  assert.match(sql, /font_scale between 90 and 150/);
  assert.match(sql, /font_scale % 5 = 0/);
});
test("quiz scoring migration removes daily caps and applies signed XP safely", async () => {
  const sql = await readFile(quizScoringMigrationUrl, "utf8");
  assert.match(sql, /drop constraint if exists quiz_attempts_xp_awarded_check/);
  assert.match(sql, /xp_awarded between -5 and 10/);
  assert.match(sql, /case when target_correct then 10 else -5 end/);
  assert.match(sql, /greatest\(0, progress_row\.xp \+ potential_award\)/);
  assert.match(sql, /for update/);
  assert.match(sql, /grant execute .*service_role/is);
  assert.doesNotMatch(sql, /today_attempt_count|today_quiz_xp|daily quiz attempt limit/);
});

test("manual refresh quota migration is atomic, KST-based, and service-role only", async () => {
  const sql = await readFile(manualRefreshMigrationUrl, "utf8");
  assert.match(sql, /manual_refresh_on date/);
  assert.match(sql, /manual_refresh_count smallint not null default 0/);
  assert.match(sql, /manual_refresh_count between 0 and 3/);
  assert.match(sql, /create or replace function public\.consume_manual_refresh/);
  assert.match(sql, /timezone\('Asia\/Seoul', now\(\)\)/);
  assert.match(sql, /for update/);
  assert.match(sql, /manual_refresh_count >= target_limit/);
  assert.match(sql, /revoke all .*public, anon, authenticated/is);
  assert.match(sql, /grant execute .*service_role/is);
  assert.doesNotMatch(sql, /create table[\s\S]+manual_refresh/i);
});
