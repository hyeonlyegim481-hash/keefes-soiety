import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migrationUrl = new URL("./supabase/migrations/002_profile_rewards.sql", import.meta.url);

test("profile reward migration is atomic and service-role only", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  assert.match(sql, /create or replace function public\.record_daily_activity/);
  assert.match(sql, /on conflict \(user_id, activity_date\) do nothing/);
  assert.match(sql, /create or replace function public\.record_quiz_attempt/);
  assert.match(sql, /for update/);
  assert.match(sql, /today_attempt_count >= 200/);
  assert.match(sql, /100 - today_quiz_xp/);
  assert.match(sql, /grant execute .*service_role/is);
  assert.match(sql, /create or replace function public\.replace_own_watchlists/);
  assert.match(sql, /revoke insert, delete on public\.watchlists from authenticated/);
  assert.match(sql, /create or replace function public\.save_own_profile/);
  assert.match(sql, /revoke update \(nickname, avatar_key\) on public\.profiles from authenticated/);
  assert.match(sql, /grant execute on function public\.replace_own_watchlists\(jsonb\) to authenticated/);
  assert.match(sql, /revoke all on function public\.record_daily_activity\(uuid\)[\s\S]*from public, anon, authenticated/);
});
