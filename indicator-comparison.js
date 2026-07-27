export const COUNTRY_DATA_STATUS = Object.freeze({
  NO_PUBLISHED_DATA: "공표 자료 없음",
  COLLECTION_FAILED: "자료 수집 실패",
  INCOMPARABLE: "비교 기준 불일치",
  PROVIDER_UNSUPPORTED: "제공처 미지원"
});

export const REQUIRED_COMPARISON_COUNTRY_IDS = Object.freeze([
  "KOR",
  "USA",
  "CHN",
  "JPN",
  "DEU",
  "FRA",
  "GBR",
  "IND",
  "WLD"
]);

export const DIFFERENT_YEAR_NOTICE =
  "국가별 최신 공표 시점이 달라 기준연도가 다를 수 있습니다. 연도가 다른 수치는 동일 시점의 직접 비교가 아니므로 참고자료로 이용해 주세요.";

const FAST_MOVING_INDICATORS = new Set([
  "gdp-growth",
  "consumer-inflation",
  "real-interest-rate",
  "unemployment",
  "youth-unemployment",
  "current-account",
  "fdi-inflows",
  "fdi-outflows",
  "market-capitalization",
  "reserve-cover",
  "population-growth"
]);

const SLOW_MOVING_INDICATORS = new Set([
  "fertility",
  "older-population",
  "life-expectancy",
  "dependency-ratio",
  "urban-population",
  "forest-area"
]);

export function buildIndicatorCountryComparison({
  indicator,
  dataset,
  countries,
  countryIds
}) {
  const requestedIds = Array.isArray(countryIds)
    ? [...new Set(countryIds)]
    : countries.map((country) => country.id);
  const selectedCountries = requestedIds
    .map((id) => countries.find((country) => country.id === id))
    .filter(Boolean);
  const countrySeries = selectedCountries.map((country) => ({
    country,
    series: getCountrySeries(dataset?.countries?.[country.id])
  }));
  const commonYear = findLatestCommonYear(countrySeries);
  const basis = commonYear === null ? "latest-by-country" : "common-year";
  const entries = countrySeries.map(({ country, series }) => {
    const observation = commonYear === null
      ? series[0] || null
      : series.find((item) => item.year === commonYear) || null;
    const missingStatus = observation
      ? null
      : resolveCountryDataStatus(dataset, country.id);
    return {
      country,
      observation,
      available: Boolean(observation),
      missingStatus,
      basis
    };
  });
  const available = entries.filter((entry) => entry.available);
  const years = [...new Set(available.map((entry) => entry.observation.year))]
    .sort((a, b) => a - b);
  const minYear = years[0] ?? null;
  const maxYear = years.at(-1) ?? null;
  const yearGap = minYear === null || maxYear === null ? null : maxYear - minYear;
  const yearsDiffer = years.length > 1;
  const pace = classifyIndicatorPace(indicator);
  const ranked = [...available].sort(
    (a, b) => b.observation.value - a.observation.value
  );

  return {
    indicatorId: indicator?.id || null,
    basis,
    commonYear,
    entries,
    available,
    ranked,
    years,
    minYear,
    maxYear,
    yearGap,
    yearsDiffer,
    pace,
    comparisonLabel: commonYear === null
      ? "각 국가의 최근 공표자료 기준"
      : `${commonYear}년 공통 기준`,
    yearNotice: yearsDiffer ? DIFFERENT_YEAR_NOTICE : null,
    yearDifferenceLabel:
      yearsDiffer && yearGap >= 2 ? `기준연도 차이 · 최대 ${yearGap}년` : null,
    rankingLabel: yearsDiffer ? "참고 순서" : "같은 연도 값 순서",
    interpretation: buildInterpretation({ yearsDiffer, yearGap, pace }),
    worldReferenceYear:
      entries.find((entry) => entry.country.id === "WLD")?.observation?.year || null
  };
}

export function getCountrySeries(countryData) {
  if (!countryData) return [];
  const candidates = [
    ...(Array.isArray(countryData.history) ? countryData.history : []),
    countryData,
    countryData.previous
  ];
  const byYear = new Map();

  for (const candidate of candidates) {
    if (
      !candidate ||
      !Number.isFinite(candidate.year) ||
      !Number.isFinite(candidate.value)
    ) {
      continue;
    }
    const existing = byYear.get(candidate.year);
    byYear.set(candidate.year, {
      year: candidate.year,
      value: candidate.value,
      ...(candidate.status ? { status: candidate.status } : {}),
      ...(candidate.releaseDate ? { releaseDate: candidate.releaseDate } : {}),
      ...(existing || {})
    });
  }

  return [...byYear.values()].sort((a, b) => b.year - a.year);
}

export function classifyIndicatorPace(indicator) {
  if (FAST_MOVING_INDICATORS.has(indicator?.id)) return "fast";
  if (SLOW_MOVING_INDICATORS.has(indicator?.id)) return "slow";
  return "structural";
}

export function resolveCountryDataStatus(dataset, countryId) {
  const explicitStatus = dataset?.countryStatuses?.[countryId];
  if (Object.values(COUNTRY_DATA_STATUS).includes(explicitStatus)) {
    return explicitStatus;
  }
  if (
    dataset?.collectionStatus === "failed" ||
    dataset?.status === "failed" ||
    dataset?.error
  ) {
    return COUNTRY_DATA_STATUS.COLLECTION_FAILED;
  }
  if (dataset?.incompatibleCountryIds?.includes(countryId)) {
    return COUNTRY_DATA_STATUS.INCOMPARABLE;
  }
  if (
    dataset?.unsupportedCountryIds?.includes(countryId) ||
    (
      Array.isArray(dataset?.supportedCountryIds) &&
      !dataset.supportedCountryIds.includes(countryId)
    )
  ) {
    return COUNTRY_DATA_STATUS.PROVIDER_UNSUPPORTED;
  }
  return COUNTRY_DATA_STATUS.NO_PUBLISHED_DATA;
}

function findLatestCommonYear(countrySeries) {
  if (
    !countrySeries.length ||
    countrySeries.some(({ series }) => series.length === 0)
  ) {
    return null;
  }
  let common = new Set(countrySeries[0].series.map((item) => item.year));
  for (const { series } of countrySeries.slice(1)) {
    const years = new Set(series.map((item) => item.year));
    common = new Set([...common].filter((year) => years.has(year)));
    if (!common.size) return null;
  }
  return Math.max(...common);
}

function buildInterpretation({ yearsDiffer, yearGap, pace }) {
  if (!yearsDiffer) {
    return "모든 표시값의 기준연도가 같아 같은 시점의 값으로 비교합니다.";
  }
  if (pace === "fast") {
    return "빠르게 변하는 지표이므로 기준연도가 다른 값의 우열이나 현재 순위를 단정하지 않습니다.";
  }
  if (yearGap >= 2) {
    return "기준연도 차이가 2년 이상이므로 정확한 순위가 아닌 참고 순서로만 봅니다.";
  }
  if (pace === "slow") {
    return "변화가 비교적 느린 지표로, 실제 연도를 함께 표시한 일반 참고 비교입니다.";
  }
  return "연도 차이가 1년 이내인 참고 비교이며 동일 시점의 직접 비교는 아닙니다.";
}
