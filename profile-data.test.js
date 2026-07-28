import test from "node:test";
import assert from "node:assert/strict";
import {
  PROFILE_AVATARS,
  PROFILE_MARKETS,
  getProfileTier,
  getProfileTierProgress,
  isValidProfileNickname,
  mergeProfileProgressResult,
  normalizeProfileNickname
} from "./profile-data.js";

test("profile tiers use the agreed XP boundaries", () => {
  assert.equal(getProfileTier(0).id, "iron");
  assert.equal(getProfileTier(299).id, "iron");
  assert.equal(getProfileTier(300).id, "bronze");
  assert.equal(getProfileTier(800).id, "silver");
  assert.equal(getProfileTier(1800).id, "gold");
  assert.equal(getProfileTier(3500).id, "platinum");
  assert.equal(getProfileTier(6000).id, "diamond");
  assert.equal(getProfileTier(10000).id, "master");
});

test("tier progress remains bounded and reports the next threshold", () => {
  const bronze = getProfileTierProgress(500);
  assert.equal(bronze.current.id, "bronze");
  assert.equal(bronze.next.id, "silver");
  assert.equal(bronze.remaining, 300);
  assert.ok(bronze.percent > 0 && bronze.percent < 100);
  assert.equal(getProfileTierProgress(50000).percent, 100);
});

test("profile choices are unique and nickname input is normalized", () => {
  assert.equal(new Set(PROFILE_AVATARS.map((item) => item.id)).size, 8);
  assert.equal(new Set(PROFILE_MARKETS.map((item) => item.id)).size, 8);
  assert.equal(normalizeProfileNickname("  경제   초보  "), "경제 초보");
  assert.equal(isValidProfileNickname("가"), false);
  assert.equal(isValidProfileNickname("경제 초보"), true);
});
test("quiz progress keeps the last known streak when the response omits streak fields", () => {
  const current = {
    xp: 20,
    active_days: 4,
    quiz_correct_count: 2,
    current_streak: 3,
    longest_streak: 6,
    streak_available: true
  };
  const merged = mergeProfileProgressResult(current, {
    xp: 30,
    activeDays: 4,
    quizCorrectCount: 3,
    lastActiveOn: "2026-07-28",
    streakAvailable: false
  });
  assert.equal(merged.xp, 30);
  assert.equal(merged.quiz_correct_count, 3);
  assert.equal(merged.current_streak, 3);
  assert.equal(merged.longest_streak, 6);
  assert.equal(merged.streak_available, true);
});

test("activity progress replaces streak fields when the response includes them", () => {
  const merged = mergeProfileProgressResult(
    { current_streak: 2, longest_streak: 4, streak_available: true },
    {
      xp: 35,
      activeDays: 5,
      quizCorrectCount: 3,
      lastActiveOn: "2026-07-28",
      currentStreak: 5,
      longestStreak: 7,
      streakAvailable: true
    }
  );
  assert.equal(merged.current_streak, 5);
  assert.equal(merged.longest_streak, 7);
  assert.equal(merged.streak_available, true);
});
