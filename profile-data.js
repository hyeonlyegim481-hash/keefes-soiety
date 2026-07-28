export const PROFILE_AVATARS = Object.freeze([
  { id: "chart-green", label: "성장 차트", symbol: "↗", tone: "green" },
  { id: "globe-blue", label: "세계 경제", symbol: "◎", tone: "blue" },
  { id: "coin-gold", label: "금융 동전", symbol: "₩", tone: "gold" },
  { id: "bank-navy", label: "은행", symbol: "▥", tone: "navy" },
  { id: "book-teal", label: "경제 공부", symbol: "▤", tone: "teal" },
  { id: "graph-red", label: "시장 그래프", symbol: "∿", tone: "red" },
  { id: "compass-gray", label: "경제 나침반", symbol: "◇", tone: "gray" },
  { id: "spark-green", label: "새로운 발견", symbol: "✦", tone: "mint" }
]);

export const PROFILE_MARKETS = Object.freeze([
  { id: "kospi", label: "KOSPI" },
  { id: "kosdaq", label: "KOSDAQ" },
  { id: "usdkrw", label: "USD/KRW" },
  { id: "sp500", label: "S&P 500" },
  { id: "nasdaq", label: "NASDAQ" },
  { id: "vix", label: "VIX" },
  { id: "wti", label: "WTI 선물" },
  { id: "gold", label: "Gold 선물" }
]);

export const PROFILE_TIERS = Object.freeze([
  { id: "iron", label: "아이언", minXp: 0, color: "#58656c" },
  { id: "bronze", label: "브론즈", minXp: 300, color: "#9b5f32" },
  { id: "silver", label: "실버", minXp: 800, color: "#71808a" },
  { id: "gold", label: "골드", minXp: 1800, color: "#b47b12" },
  { id: "platinum", label: "플래티넘", minXp: 3500, color: "#0b8478" },
  { id: "diamond", label: "다이아", minXp: 6000, color: "#2563a8" },
  { id: "master", label: "마스터", minXp: 10000, color: "#792f83" }
]);

export const PROFILE_STREAK_STAGES = Object.freeze([
  { stage: 1, minDays: 1, label: "1일차", accent: "#425b66", image: "/assets/streak/streak-stage-01.png" },
  { stage: 2, minDays: 3, label: "3일차", accent: "#8f4d20", image: "/assets/streak/streak-stage-02.png" },
  { stage: 3, minDays: 5, label: "5일차", accent: "#c55c12", image: "/assets/streak/streak-stage-03.png" },
  { stage: 4, minDays: 10, label: "10일차", accent: "#e96f05", image: "/assets/streak/streak-stage-04.png" },
  { stage: 5, minDays: 30, label: "30일차", accent: "#f68000", image: "/assets/streak/streak-stage-05.png" },
  { stage: 6, minDays: 50, label: "50일차", accent: "#fa8f00", image: "/assets/streak/streak-stage-06.png" },
  { stage: 7, minDays: 100, label: "100일차", accent: "#ff9d08", image: "/assets/streak/streak-stage-07.png" },
  { stage: 8, minDays: 250, label: "250일차", accent: "#ffad12", image: "/assets/streak/streak-stage-08.png" },
  { stage: 9, minDays: 500, label: "500일차", accent: "#ffbe22", image: "/assets/streak/streak-stage-09.png" },
  { stage: 10, minDays: 1000, label: "1,000일차", accent: "#ffd24a", image: "/assets/streak/streak-stage-10.png" }
]);

export function getProfileTier(xp = 0) {
  const safeXp = Math.max(0, Number.isFinite(Number(xp)) ? Number(xp) : 0);
  return [...PROFILE_TIERS].reverse().find((tier) => safeXp >= tier.minXp) || PROFILE_TIERS[0];
}

export function getProfileTierProgress(xp = 0) {
  const current = getProfileTier(xp);
  const currentIndex = PROFILE_TIERS.findIndex((tier) => tier.id === current.id);
  const next = PROFILE_TIERS[currentIndex + 1] || null;
  const safeXp = Math.max(0, Number(xp) || 0);
  const percent = next
    ? Math.min(100, Math.max(0, ((safeXp - current.minXp) / (next.minXp - current.minXp)) * 100))
    : 100;
  return {
    current,
    next,
    percent,
    remaining: next ? Math.max(0, next.minXp - safeXp) : 0
  };
}

export function normalizeProfileNickname(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 20);
}

export function isValidProfileNickname(value) {
  const normalized = normalizeProfileNickname(value);
  return normalized.length >= 2 && normalized.length <= 20;
}

export function getProfileAvatar(avatarKey) {
  return PROFILE_AVATARS.find((avatar) => avatar.id === avatarKey) || PROFILE_AVATARS[0];
}

export function getProfileStreakStage(days = 0) {
  const safeDays = Math.max(0, Math.floor(Number(days) || 0));
  return [...PROFILE_STREAK_STAGES]
    .reverse()
    .find((stage) => safeDays >= stage.minDays) || null;
}

export function getNextProfileStreakStage(days = 0) {
  const safeDays = Math.max(0, Math.floor(Number(days) || 0));
  return PROFILE_STREAK_STAGES.find((stage) => stage.minDays > safeDays) || null;
}

function toProfileDayNumber(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return Math.floor(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / 86_400_000
  );
}

export function getProfileKstDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(now);
}

export function calculateProfileStreak(activityDates = [], today = getProfileKstDate()) {
  const days = [...new Set(activityDates.map(toProfileDayNumber).filter(Number.isInteger))]
    .sort((left, right) => left - right);
  if (!days.length) return { currentStreak: 0, longestStreak: 0 };

  let run = 1;
  let longestStreak = 1;
  for (let index = 1; index < days.length; index += 1) {
    run = days[index] === days[index - 1] + 1 ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
  }

  const todayDay = toProfileDayNumber(today);
  let currentStreak = 0;
  if (days.at(-1) === todayDay) {
    currentStreak = 1;
    for (let index = days.length - 1; index > 0; index -= 1) {
      if (days[index - 1] !== days[index] - 1) break;
      currentStreak += 1;
    }
  }
  return { currentStreak, longestStreak };
}

export function mergeProfileProgressResult(current = {}, result = {}) {
  const next = {
    ...current,
    xp: result.xp,
    active_days: result.activeDays,
    quiz_correct_count: result.quizCorrectCount,
    last_active_on: result.lastActiveOn
  };
  if (result.streakAvailable === true) {
    next.current_streak = result.currentStreak;
    next.longest_streak = result.longestStreak;
    next.streak_available = true;
  }
  return next;
}
