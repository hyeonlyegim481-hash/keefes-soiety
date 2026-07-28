import test from "node:test";
import assert from "node:assert/strict";
import {
  PROFILE_AVATARS,
  PROFILE_MARKETS,
  getProfileTier,
  getProfileTierProgress,
  isValidProfileNickname,
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
