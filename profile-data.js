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
