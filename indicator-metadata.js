import { indicatorProviderMetadata } from "./indicator-provider-metadata.js";

export const INDICATOR_METADATA_FIELDS = Object.freeze([
  "indicatorId",
  "officialCode",
  "indicatorName",
  "officialName",
  "value",
  "unit",
  "displayUnit",
  "multiplier",
  "referencePeriod",
  "releaseDate",
  "collectedAt",
  "frequency",
  "sourceInstitution",
  "sourceUrl",
  "nominalReal",
  "seasonalAdjustment",
  "releaseStatus",
  "currency",
  "priceBasis",
  "baseYear",
  "revisionStatus",
  "measureType",
  "changeBasis",
  "annualized",
  "valueScope"
]);

const NOT_APPLICABLE = "해당 없음";

const SEMANTIC_OVERRIDES = Object.freeze({
  fertility: {
    displayUnit: "여성 1명당 기대 자녀 수",
    valueScope: "여성 1명당 기대 출생아 수",
    measureType: "수준값"
  },
  "gdp-per-capita": {
    displayUnit: "현재가격 미국달러/명",
    nominalReal: "명목",
    currency: "미국달러(USD)",
    priceBasis: "현재가격",
    valueScope: "1인당 값"
  },
  "gdp-growth": {
    displayUnit: "% · 전년 대비(YoY)",
    nominalReal: "실질",
    priceBasis: "불변가격",
    baseYear: "국가별 국민계정 기준연도",
    measureType: "전년 대비 변화율",
    changeBasis: "YoY",
    annualized: "아니오 · 실제 연간 변화율",
    valueScope: "국가 전체 GDP"
  },
  "consumer-inflation": {
    displayUnit: "% · 전년 대비(YoY)",
    measureType: "전년 대비 변화율",
    changeBasis: "YoY",
    annualized: "아니오 · 실제 연간 변화율",
    valueScope: "소비자물가지수의 연간 변화"
  },
  "population-growth": {
    displayUnit: "% · 전년 대비(YoY)",
    measureType: "전년 대비 변화율",
    changeBasis: "YoY",
    annualized: "아니오 · 실제 연간 변화율",
    valueScope: "총인구의 연간 변화"
  },
  "real-interest-rate": {
    nominalReal: "실질",
    priceBasis: "물가 조정 금리",
    valueScope: "연간 금리 수준"
  },
  "gdp-per-capita-ppp": {
    displayUnit: "2021 국제달러/명",
    nominalReal: "실질",
    currency: "2021 국제달러(PPP)",
    priceBasis: "불변가격·구매력평가(PPP)",
    baseYear: "2021년",
    valueScope: "1인당 값"
  },
  "labor-productivity": {
    displayUnit: "2021 PPP달러/취업자",
    nominalReal: "실질",
    currency: "2021 국제달러(PPP)",
    priceBasis: "불변가격·구매력평가(PPP)",
    baseYear: "2021년",
    valueScope: "취업자 1인당 값"
  },
  "energy-intensity": {
    displayUnit: "MJ/2021 PPP달러 GDP",
    nominalReal: "실질 GDP 기준 분모",
    currency: "2021 국제달러(PPP, 분모)",
    priceBasis: "불변가격·구매력평가 GDP",
    baseYear: "2021년",
    valueScope: "GDP 단위당 1차 에너지"
  },
  "co2-per-capita": {
    displayUnit: "tCO₂e/명",
    valueScope: "1인당 연간 배출량"
  },
  "energy-use": {
    displayUnit: "kg 석유환산/명",
    valueScope: "1인당 연간 사용량"
  },
  "net-migration": {
    valueScope: "국가 전체 순이동 인구"
  },
  "resident-patents": {
    valueScope: "국가 전체 출원 건수"
  },
  "logistics-performance": {
    measureType: "지수",
    valueScope: "1~5점 종합지수"
  },
  gini: {
    measureType: "지수",
    valueScope: "0~100점 분배지수"
  }
});

export function buildIndicatorMetadata(indicator, options = {}) {
  const {
    observation = null,
    snapshot = null,
    dataset = null
  } = options;
  const provider = indicatorProviderMetadata.indicators[indicator?.code] || {};
  const inferred = inferSemantics(indicator);
  const override = SEMANTIC_OVERRIDES[indicator?.id] || {};
  const semantics = { ...inferred, ...override };

  return {
    indicatorId: indicator?.id || null,
    officialCode: indicator?.code || null,
    indicatorName: indicator?.name || null,
    officialName: provider.officialName || null,
    value: finiteOrNull(observation?.value),
    unit: indicator?.unit || null,
    displayUnit: semantics.displayUnit,
    multiplier: 1,
    referencePeriod: Number.isFinite(Number(observation?.year))
      ? `${Number(observation.year)}년`
      : null,
    releaseDate: observation?.releaseDate || null,
    collectedAt: snapshot?.collectedAt || snapshot?.dataUpdatedAt || null,
    frequency: "연간 시계열 · 일부 지표는 비정기 공표",
    sourceInstitution: summarizeSourceOrganizations(provider.sourceOrganization),
    sourceUrl: indicator?.sourceUrl || null,
    nominalReal: semantics.nominalReal,
    seasonalAdjustment: "해당 없음 · 연간값",
    releaseStatus: normalizeProviderStatus(observation?.status),
    currency: semantics.currency,
    priceBasis: semantics.priceBasis,
    baseYear: semantics.baseYear,
    revisionStatus: "수정 가능 · WDI 갱신 시 과거값이 바뀔 수 있음",
    measureType: semantics.measureType,
    changeBasis: semantics.changeBasis,
    annualized: semantics.annualized,
    valueScope: semantics.valueScope,
    sourceDataset: indicator?.source || "세계은행 World Development Indicators",
    providerMetadataRetrievedAt: indicatorProviderMetadata.retrievedAt || null,
    providerSourceUpdatedAt:
      dataset?.sourceUpdatedAt || observation?.sourceUpdatedAt || null,
    sourceNote: provider.sourceNote || null
  };
}

export function buildResourceIndicatorMetadata(indicator, resourceMetadata) {
  return {
    indicatorId: indicator?.id || null,
    officialCode: indicator?.code || null,
    indicatorName: indicator?.name || null,
    officialName: indicator?.name || null,
    value: finiteOrNull(indicator?.worldTotal),
    unit: indicator?.unit || null,
    displayUnit: indicator?.unit || null,
    multiplier: 1,
    referencePeriod: Number.isFinite(Number(indicator?.year))
      ? `${Number(indicator.year)}년`
      : null,
    releaseDate: resourceMetadata?.updatedAt || null,
    collectedAt: resourceMetadata?.updatedAt || null,
    frequency: "연간",
    sourceInstitution: "미국 지질조사국(USGS)",
    sourceUrl: indicator?.sourceUrl || resourceMetadata?.sourceUrl || null,
    nominalReal: NOT_APPLICABLE,
    seasonalAdjustment: NOT_APPLICABLE,
    releaseStatus: "추정치",
    currency: NOT_APPLICABLE,
    priceBasis: NOT_APPLICABLE,
    baseYear: NOT_APPLICABLE,
    revisionStatus: "수정 가능 · USGS 추정치",
    measureType: "물량 수준값",
    changeBasis: NOT_APPLICABLE,
    annualized: NOT_APPLICABLE,
    valueScope: "국가별 연간 광산 생산 총량",
    sourceDataset: resourceMetadata?.title || indicator?.source || null,
    providerMetadataRetrievedAt: null,
    providerSourceUpdatedAt: resourceMetadata?.updatedAt || null,
    sourceNote: indicator?.worldNote || null
  };
}

export function formatIndicatorDisplayValue(indicator, observation) {
  const value = typeof observation === "number" ? observation : observation?.value;
  if (!Number.isFinite(value)) return "--";
  const formatted = formatIndicatorNumber(indicator, value);

  if (indicator?.id === "gdp-per-capita") return `US$${formatted}/명`;
  if (indicator?.id === "gdp-per-capita-ppp") return `${formatted} 2021 국제달러/명`;
  if (indicator?.id === "labor-productivity") return `${formatted} 2021 PPP달러/취업자`;
  if (indicator?.id === "energy-intensity") return `${formatted} MJ/2021 PPP달러 GDP`;
  if (indicator?.id === "fertility") return `${formatted}명`;
  if (indicator?.format === "currency") return `US$${formatted}`;
  if (indicator?.unit === "%") return `${formatted}%`;
  if (String(indicator?.unit || "").startsWith("% ")) {
    return `${formatted}% ${String(indicator.unit).slice(2)}`;
  }
  return `${formatted} ${indicator?.unit || ""}`.trim();
}

export function formatIndicatorDisplayDelta(indicator, value) {
  if (!Number.isFinite(value)) return "--";
  const sign = value > 0 ? "+" : "";
  if (indicator?.format === "currency") {
    return `${sign}US$${formatIndicatorNumber(indicator, value)}`;
  }
  const suffix = isPercentUnit(indicator?.unit) ? "%p" : indicator?.unit;
  return `${sign}${formatIndicatorNumber(indicator, value)}${suffix ? ` ${suffix}` : ""}`;
}

export function formatIndicatorDisplayMagnitude(indicator, value) {
  if (!Number.isFinite(value)) return "--";
  if (indicator?.format === "currency") {
    return `US$${formatIndicatorNumber(indicator, value)}`;
  }
  const suffix = isPercentUnit(indicator?.unit) ? "%p" : indicator?.unit;
  return `${formatIndicatorNumber(indicator, value)}${suffix ? ` ${suffix}` : ""}`;
}

export function isMetadataUnavailable(value) {
  return value === null || value === undefined || value === "";
}

function inferSemantics(indicator) {
  const unit = String(indicator?.unit || "");
  const code = String(indicator?.code || "");
  const isPercent = isPercentUnit(unit);
  const isShare = isPercent && !/\.ZG$/.test(code);

  return {
    displayUnit: normalizeDisplayUnit(unit),
    nominalReal: NOT_APPLICABLE,
    currency: NOT_APPLICABLE,
    priceBasis: NOT_APPLICABLE,
    baseYear: NOT_APPLICABLE,
    measureType: isShare ? "비율 수준값" : "수준값",
    changeBasis: /\.ZG$/.test(code) ? "YoY" : NOT_APPLICABLE,
    annualized: /\.ZG$/.test(code) ? "아니오 · 실제 연간 변화율" : NOT_APPLICABLE,
    valueScope: inferValueScope(indicator)
  };
}

function inferValueScope(indicator) {
  const unit = String(indicator?.unit || "");
  if (unit === "% GDP") return "GDP 대비 비중";
  if (unit.startsWith("% ")) return `${unit.slice(2)} 대비 비중`;
  if (unit === "%") return "비율 또는 변화율";
  if (/\/(?:인구|출생|100명)/.test(unit)) return "인구·대상 집단당 값";
  if (/1인당|per-capita/.test(String(indicator?.id || ""))) return "1인당 값";
  return "지표 정의의 수준값";
}

function normalizeDisplayUnit(unit) {
  if (unit === "% GDP") return "% · GDP 대비";
  if (unit.startsWith("% ")) return `% · ${unit.slice(2)} 대비`;
  return unit || null;
}

function normalizeProviderStatus(status) {
  if (!status) return null;
  const normalized = String(status).trim();
  return normalized || null;
}

function summarizeSourceOrganizations(value) {
  if (!value) return null;
  return String(value)
    .split(/;\s*\n?/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) =>
      entry.replace(
        /,\s*(?:uri|note|publisher|type|date accessed|date published|license):.*$/i,
        ""
      )
    )
    .join("; ");
}

function finiteOrNull(value) {
  return Number.isFinite(Number(value)) ? Number(value) : null;
}

function isPercentUnit(unit) {
  return String(unit || "").startsWith("%");
}

function formatIndicatorNumber(indicator, value) {
  return new Intl.NumberFormat("ko-KR", {
    minimumFractionDigits: indicator?.precision ?? 0,
    maximumFractionDigits: indicator?.precision ?? 0
  }).format(value);
}
