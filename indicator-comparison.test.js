import test from "node:test";
import assert from "node:assert/strict";

import {
  indicatorCountries,
  indicatorDefinitions
} from "./indicator-data.js";
import { indicatorSnapshot } from "./indicator-values.js";
import {
  COUNTRY_DATA_STATUS,
  DIFFERENT_YEAR_NOTICE,
  REQUIRED_COMPARISON_COUNTRY_IDS,
  buildIndicatorCountryComparison,
  getCountrySeries,
  resolveCountryDataStatus
} from "./indicator-comparison.js";

const countries = indicatorCountries.filter((country) =>
  ["KOR", "USA", "CHN"].includes(country.id)
);
const slowIndicator = indicatorDefinitions.find(
  (indicator) => indicator.id === "fertility"
);
const fastIndicator = indicatorDefinitions.find(
  (indicator) => indicator.id === "gdp-growth"
);

test("uses the latest year shared by every selected country", () => {
  const dataset = {
    countries: {
      KOR: {
        year: 2024,
        value: 0.75,
        history: [
          { year: 2022, value: 0.78 },
          { year: 2023, value: 0.72 },
          { year: 2024, value: 0.75 }
        ]
      },
      USA: {
        year: 2023,
        value: 1.62,
        history: [
          { year: 2022, value: 1.66 },
          { year: 2023, value: 1.62 }
        ]
      },
      CHN: {
        year: 2022,
        value: 1.03,
        history: [{ year: 2022, value: 1.03 }]
      }
    }
  };
  const model = buildIndicatorCountryComparison({
    indicator: slowIndicator,
    dataset,
    countries
  });

  assert.equal(model.basis, "common-year");
  assert.equal(model.commonYear, 2022);
  assert.equal(model.comparisonLabel, "2022년 공통 기준");
  assert.equal(model.yearsDiffer, false);
  assert.equal(model.yearNotice, null);
  assert.deepEqual(
    model.entries.map((entry) => entry.observation.year),
    [2022, 2022, 2022]
  );
});

test("falls back to each country's latest value and labels differing years", () => {
  const dataset = {
    countries: {
      KOR: { year: 2024, value: 0.75 },
      USA: { year: 2024, value: 1.63 },
      CHN: { year: 2023, value: 1 }
    }
  };
  const model = buildIndicatorCountryComparison({
    indicator: slowIndicator,
    dataset,
    countries
  });

  assert.equal(model.basis, "latest-by-country");
  assert.equal(model.commonYear, null);
  assert.equal(model.comparisonLabel, "각 국가의 최근 공표자료 기준");
  assert.equal(model.yearGap, 1);
  assert.equal(model.yearNotice, DIFFERENT_YEAR_NOTICE);
  assert.equal(model.yearDifferenceLabel, null);
  assert.equal(model.rankingLabel, "참고 순서");
  assert.match(model.interpretation, /일반 참고 비교/);
});

test("a two-year gap becomes reference order rather than an exact rank", () => {
  const dataset = {
    countries: {
      KOR: { year: 2025, value: 1.2 },
      USA: { year: 2024, value: 2.3 },
      CHN: { year: 2022, value: 3.4 }
    }
  };
  const model = buildIndicatorCountryComparison({
    indicator: slowIndicator,
    dataset,
    countries
  });

  assert.equal(model.yearGap, 3);
  assert.equal(model.yearDifferenceLabel, "기준연도 차이 · 최대 3년");
  assert.equal(model.rankingLabel, "참고 순서");
  assert.match(model.interpretation, /정확한 순위가 아닌 참고 순서/);
});

test("fast-moving indicators forbid superiority claims across years", () => {
  const dataset = {
    countries: {
      KOR: { year: 2025, value: 1.1 },
      USA: { year: 2024, value: 2.2 },
      CHN: { year: 2023, value: 3.3 }
    }
  };
  const model = buildIndicatorCountryComparison({
    indicator: fastIndicator,
    dataset,
    countries
  });

  assert.equal(model.pace, "fast");
  assert.match(model.interpretation, /우열이나 현재 순위를 단정하지 않습니다/);
});

test("all four missing-data states remain distinct and missing is never zero", () => {
  assert.equal(
    resolveCountryDataStatus({}, "KOR"),
    COUNTRY_DATA_STATUS.NO_PUBLISHED_DATA
  );
  assert.equal(
    resolveCountryDataStatus({ collectionStatus: "failed" }, "KOR"),
    COUNTRY_DATA_STATUS.COLLECTION_FAILED
  );
  assert.equal(
    resolveCountryDataStatus({ incompatibleCountryIds: ["KOR"] }, "KOR"),
    COUNTRY_DATA_STATUS.INCOMPARABLE
  );
  assert.equal(
    resolveCountryDataStatus({ unsupportedCountryIds: ["KOR"] }, "KOR"),
    COUNTRY_DATA_STATUS.PROVIDER_UNSUPPORTED
  );

  const model = buildIndicatorCountryComparison({
    indicator: slowIndicator,
    dataset: { countries: { KOR: { year: 2024, value: 0 } } },
    countries: indicatorCountries.filter((country) =>
      ["KOR", "USA"].includes(country.id)
    )
  });
  assert.equal(model.entries[0].observation.value, 0);
  assert.equal(model.entries[0].available, true);
  assert.equal(model.entries[1].observation, null);
  assert.equal(
    model.entries[1].missingStatus,
    COUNTRY_DATA_STATUS.NO_PUBLISHED_DATA
  );
});

test("country series keeps real zeroes, removes invalid rows, and sorts years", () => {
  const series = getCountrySeries({
    year: 2024,
    value: 0,
    previous: { year: 2023, value: 1 },
    history: [
      { year: 2022, value: null },
      { year: 2021, value: 2 },
      { year: 2024, value: 0 }
    ]
  });
  assert.deepEqual(
    series.map((item) => [item.year, item.value]),
    [
      [2024, 0],
      [2023, 1],
      [2021, 2]
    ]
  );
});

test("required countries and world aggregate are available in the country catalog", () => {
  const catalogIds = new Set(indicatorCountries.map((country) => country.id));
  for (const id of REQUIRED_COMPARISON_COUNTRY_IDS) {
    assert.ok(catalogIds.has(id), `missing required country ${id}`);
  }
});

test("actual indicator data keeps missing countries visible as statuses", () => {
  const model = buildIndicatorCountryComparison({
    indicator: slowIndicator,
    dataset: indicatorSnapshot.indicators.fertility,
    countries: indicatorCountries,
    countryIds: REQUIRED_COMPARISON_COUNTRY_IDS
  });
  assert.equal(model.entries.length, REQUIRED_COMPARISON_COUNTRY_IDS.length);
  assert.ok(
    model.entries.every(
      (entry) => entry.available || Object.values(COUNTRY_DATA_STATUS).includes(entry.missingStatus)
    )
  );
});
