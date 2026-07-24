import {
  economicLabControls,
  economicLabPresets,
  evaluateEconomicScenario
} from "./economic-lab-data.js?v=80";
import {
  indicatorCountries,
  indicatorDefinitions as baseIndicatorDefinitions
} from "./indicator-data.js?v=80";
import { financeIndicatorDefinitions } from "./indicator-finance-data.js?v=80";
import { expandedIndicatorDefinitions } from "./indicator-expanded-data.js?v=80";
import { indicatorSnapshot } from "./indicator-values.js?v=80";

const comparableIndicators = [
  ...baseIndicatorDefinitions,
  ...financeIndicatorDefinitions,
  ...expandedIndicatorDefinitions
];

export const countryComparisonGroups = [
  {
    id: "overview",
    label: "한눈에 보기",
    description: "인구·소득·성장·고용·혁신·에너지를 한 묶음으로 비교합니다.",
    indicatorIds: [
      "fertility",
      "gdp-per-capita-ppp",
      "gdp-growth",
      "employment-population",
      "research-development",
      "renewable-electricity"
    ]
  },
  {
    id: "economy",
    label: "경제 체력",
    description: "생산, 성장, 제조업, 무역, 물가와 대외수지를 같은 기준으로 봅니다.",
    indicatorIds: [
      "gdp-per-capita",
      "gdp-growth",
      "manufacturing-share",
      "trade-share",
      "consumer-inflation",
      "current-account"
    ]
  },
  {
    id: "people",
    label: "인구·생활",
    description: "인구구조와 수명, 고용, 의료 부담이 장기 경제에 주는 조건을 비교합니다.",
    indicatorIds: [
      "fertility",
      "older-population",
      "life-expectancy",
      "employment-population",
      "female-employment-rate",
      "dependency-ratio"
    ]
  },
  {
    id: "innovation",
    label: "산업·혁신",
    description: "생산성, 연구개발, 특허, 첨단수출과 디지털 기반을 함께 봅니다.",
    indicatorIds: [
      "labor-productivity",
      "research-development",
      "resident-patents",
      "high-tech-exports",
      "internet-use",
      "fixed-broadband"
    ]
  },
  {
    id: "sustainability",
    label: "에너지·환경",
    description: "에너지 효율과 발전 구조, 배출과 생활환경을 방향이 다른 지표로 나눠 봅니다.",
    indicatorIds: [
      "renewable-electricity",
      "energy-intensity",
      "co2-per-capita",
      "pm25",
      "forest-area",
      "renewable-energy"
    ]
  }
];

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function formatNumber(indicator, value) {
  return new Intl.NumberFormat("ko-KR", {
    minimumFractionDigits: indicator.precision,
    maximumFractionDigits: indicator.precision
  }).format(value);
}

function formatIndicatorValue(indicator, observation) {
  if (!observation || !Number.isFinite(observation.value)) return "--";
  const number = formatNumber(indicator, observation.value);
  if (indicator.format === "currency") return `$${number}`;
  if (indicator.unit === "%") return `${number}%`;
  return `${number} ${indicator.unit}`;
}

export function buildCountryComparisonModel(groupId, requestedCountryIds) {
  const group =
    countryComparisonGroups.find((item) => item.id === groupId) ||
    countryComparisonGroups[0];
  const validIds = [...new Set(requestedCountryIds)]
    .filter((id) => indicatorCountries.some((country) => country.id === id))
    .slice(0, 4);
  const countryIds = validIds.length >= 2 ? validIds : ["KOR", "USA", "JPN", "CHN"];
  const countries = countryIds.map((id) =>
    indicatorCountries.find((country) => country.id === id)
  );
  const metrics = group.indicatorIds
    .map((indicatorId) => {
      const indicator = comparableIndicators.find((item) => item.id === indicatorId);
      const data = indicatorSnapshot.indicators[indicatorId];
      if (!indicator || !data) return null;
      const observations = countries.map((country) => ({
        country,
        observation: data.countries?.[country.id] || null
      }));
      const available = observations.filter((item) =>
        Number.isFinite(item.observation?.value)
      );
      const values = available.map((item) => item.observation.value);
      const min = values.length ? Math.min(...values) : 0;
      const max = values.length ? Math.max(...values) : 0;
      const range = max - min || 1;
      const ranked = [...available].sort(
        (a, b) => b.observation.value - a.observation.value
      );
      const koreaRank =
        ranked.findIndex((item) => item.country.id === "KOR") + 1 || null;

      return {
        indicator,
        observations: observations.map((item) => ({
          ...item,
          position: item.observation
            ? clamp(((item.observation.value - min) / range) * 100, 4, 100)
            : 0
        })),
        highest: ranked[0] || null,
        lowest: ranked.at(-1) || null,
        koreaRank,
        availableCount: available.length
      };
    })
    .filter(Boolean);

  return { group, countries, metrics };
}

function setNestedView({
  tabs,
  panels,
  selected,
  dataName,
  queryName,
  chapter,
  updateHeight,
  updateUrl = true
}) {
  tabs.forEach((button) => {
    button.setAttribute(
      "aria-selected",
      String(button.dataset[dataName] === selected)
    );
  });
  panels.forEach((panel) => {
    const isSelected = panel.dataset[`${dataName}Panel`] === selected;
    panel.setAttribute("aria-hidden", String(!isSelected));
    panel.inert = !isSelected;
  });
  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("chapter", chapter);
    url.searchParams.set(queryName, selected);
    history.replaceState(null, "", url);
  }
  requestAnimationFrame(() => {
    updateHeight();
    if (chapter === "indicators" && selected === "explorer") {
      window.dispatchEvent(new Event("resize"));
    }
  });
}

function formatControlValue(control, value) {
  if (control.id === "fiscal") {
    if (value === 0) return "중립";
    return `${value > 0 ? "확장" : "긴축"} ${Math.abs(value).toFixed(1)}단계`;
  }
  if (value === 0) return `0${control.unit}`;
  const digits = control.step < 1 ? 2 : 0;
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}${control.unit}`;
}

function renderEconomicControls(values) {
  return economicLabControls
    .map(
      (control) => `
        <label class="economic-control" for="economic-control-${control.id}">
          <span class="economic-control-head">
            <strong>${escapeHtml(control.label)}</strong>
            <output data-economic-value="${control.id}">${escapeHtml(
              formatControlValue(control, values[control.id])
            )}</output>
          </span>
          <input
            id="economic-control-${control.id}"
            type="range"
            min="${control.min}"
            max="${control.max}"
            step="${control.step}"
            value="${values[control.id]}"
            data-economic-control="${control.id}"
          />
          <span class="economic-control-range">
            <small>${escapeHtml(control.lowerLabel)}</small>
            <small>${escapeHtml(control.upperLabel)}</small>
          </span>
          <em>${escapeHtml(control.description)}</em>
        </label>
      `
    )
    .join("");
}

function buildCounterSignals(evaluation) {
  const signals = {
    rate: "은행 대출금리가 따라 움직이지 않거나 가계·기업의 고정금리 비중이 높으면 금리 충격은 약해질 수 있습니다.",
    fx: "기업의 환헤지, 달러 매출과 수입 중간재 비중에 따라 원화 약세 효과는 업종별로 반대가 될 수 있습니다.",
    oil: "유가 변화가 짧게 끝나거나 정제마진·세금·보조금이 완충하면 소비자물가 전가는 제한될 수 있습니다.",
    exports: "수출금액이 늘어도 가격 상승이나 일부 품목 집중이라면 생산·고용으로 이어지는 힘은 약할 수 있습니다.",
    fiscal: "예산 집행이 늦거나 수입품 구매로 빠져나가고 금리가 오르면 재정의 국내 경기 효과는 줄 수 있습니다.",
    productivity: "생산성 향상이 일부 기업에만 집중되거나 고용 전환 비용이 크면 가계소득 개선은 늦어질 수 있습니다."
  };
  const selected = evaluation.activeDrivers
    .slice(0, 3)
    .map((driver) => signals[driver.id]);
  return selected.length
    ? selected
    : ["입력한 변화가 없으므로 현재 경제의 구조와 다른 외부 충격이 결과를 결정합니다."];
}

function renderEconomicResults(evaluation) {
  const summary = evaluation.isNeutral
    ? {
        title: "가정을 움직여 전달 경로를 비교하세요",
        detail:
          "모든 변화가 0인 기준 상태입니다. 위 조절값이나 시나리오를 선택하면 어떤 경로가 먼저 반응하는지 계산합니다."
      }
    : {
        title: evaluation.strongestResults
          .map((result) => `${result.label} ${result.labelText}`)
          .join(" · "),
        detail: `가장 큰 입력은 ${evaluation.activeDrivers
          .slice(0, 3)
          .map((driver) => driver.label)
          .join(", ")}입니다. 결과의 크기는 예측 확률이 아니라 입력 간 상대적인 전달 압력입니다.`
      };
  const counterSignals = buildCounterSignals(evaluation);

  return `
    <section class="economic-result-summary">
      <div>
        <span>규칙 기반 결과</span>
        <h4>${escapeHtml(summary.title)}</h4>
        <p>${escapeHtml(summary.detail)}</p>
      </div>
      <div class="economic-driver-list" aria-label="주요 입력">
        ${
          evaluation.activeDrivers.length
            ? evaluation.activeDrivers
                .slice(0, 4)
                .map(
                  (driver) =>
                    `<span>${escapeHtml(driver.label)} <b>${escapeHtml(
                      formatControlValue(
                        economicLabControls.find(
                          (control) => control.id === driver.id
                        ),
                        driver.value
                      )
                    )}</b></span>`
                )
                .join("")
            : "<span>입력 변화 없음</span>"
        }
      </div>
    </section>
    <div class="economic-impact-grid">
      ${evaluation.results
        .map(
          (result) => `
            <article class="economic-impact-card" data-tone="${result.tone}">
              <header>
                <span>${escapeHtml(result.label)}</span>
                <strong>${escapeHtml(result.labelText)}</strong>
              </header>
              <div class="economic-impact-scale" aria-label="${escapeHtml(
                result.label
              )} 상대 압력 ${result.score}">
                <i style="--impact-score:${result.score}"></i>
                <b></b>
              </div>
              <p>${escapeHtml(result.explanation)}</p>
              <dl>
                <div><dt>반응 시차</dt><dd>${escapeHtml(result.timing)}</dd></div>
                <div><dt>확인 지표</dt><dd>${result.indicators
                  .map((indicator) => `<span>${escapeHtml(indicator)}</span>`)
                  .join("")}</dd></div>
              </dl>
              <div class="economic-contributions">
                <span>결과를 만든 입력</span>
                <div>
                  ${
                    result.contributions.length
                      ? result.contributions
                          .slice(0, 3)
                          .map(
                            (item) =>
                              `<i data-direction="${
                                item.contribution > 0 ? "up" : "down"
                              }">${escapeHtml(item.label)} ${
                                item.contribution > 0 ? "↑" : "↓"
                              }</i>`
                          )
                          .join("")
                      : "<i>활성 입력 없음</i>"
                  }
                </div>
              </div>
            </article>
          `
        )
        .join("")}
    </div>
    <section class="economic-timeline">
      <header>
        <span>전달 시간표</span>
        <strong>가격이 먼저, 실물경제는 나중에 움직입니다</strong>
      </header>
      <ol>
        <li><b>즉시~수주</b><strong>환율·채권·주가·에너지 수입단가</strong><p>기대와 거래가격이 새로운 조건을 가장 먼저 반영합니다.</p></li>
        <li><b>1~3분기</b><strong>대출이자·기업 마진·소비자물가·소비</strong><p>계약 갱신과 재고 소진을 거치면서 가계와 기업에 전달됩니다.</p></li>
        <li><b>2~8분기</b><strong>투자·고용·주택 수요·실질성장</strong><p>사업계획과 채용, 대출 만기가 조정되며 실물 지표에 나타납니다.</p></li>
      </ol>
    </section>
    <section class="economic-countercheck">
      <header>
        <span>결론을 바꿀 조건</span>
        <strong>아래 반대 증거가 나오면 기본 경로를 다시 판단합니다</strong>
      </header>
      <ul>${counterSignals
        .map((signal) => `<li>${escapeHtml(signal)}</li>`)
        .join("")}</ul>
    </section>
  `;
}

function renderEconomicLab(root, values) {
  root.innerHTML = `
    <section class="expansion-section economic-lab-section">
      <div class="board-heading economic-lab-heading">
        <div>
          <p class="section-kicker">경제 실험실</p>
          <h3>여러 충격이 겹칠 때 무엇이 먼저 움직일까</h3>
          <p>금리 하나만 바꾸는 예시가 아니라 환율·유가·수출·재정·생산성을 함께 조절해 상쇄와 증폭을 비교합니다.</p>
        </div>
        <button type="button" class="economic-reset-button" data-economic-reset>초기화</button>
      </div>
      <div class="economic-preset-tabs" role="group" aria-label="경제 실험 시나리오">
        ${economicLabPresets
          .map(
            (preset) => `
              <button type="button" data-economic-preset="${preset.id}" aria-pressed="false">
                <strong>${escapeHtml(preset.label)}</strong>
                <span>${escapeHtml(preset.description)}</span>
              </button>
            `
          )
          .join("")}
      </div>
      <div class="economic-lab-layout">
        <aside class="economic-controls" aria-label="경제 조건 조절">
          <header>
            <span>가정 입력</span>
            <strong>현재 상태에서 얼마나 변하는가</strong>
          </header>
          ${renderEconomicControls(values)}
        </aside>
        <div class="economic-results" id="economicLabResults" aria-live="polite">
          ${renderEconomicResults(evaluateEconomicScenario(values))}
        </div>
      </div>
      <p class="economic-method-note">
        본 실험실은 공개적으로 알려진 경제학적 전달 경로를 단순화하고 모든 입력에 같은 규칙을 적용한 교육용 비교 자료입니다.
        표시 결과는 실제 예측값·발생 확률·투자 판단이 아니며, 정책 신뢰·시장 기대·산업 구조·시차와 새로운 충격에 따라 반대 결과가 나타날 수 있습니다.
      </p>
    </section>
  `;
}

function updateEconomicLab(root, values) {
  economicLabControls.forEach((control) => {
    const input = root.querySelector(`[data-economic-control="${control.id}"]`);
    const output = root.querySelector(`[data-economic-value="${control.id}"]`);
    if (input) input.value = values[control.id];
    if (output) output.textContent = formatControlValue(control, values[control.id]);
  });
  const results = root.querySelector("#economicLabResults");
  if (results) {
    results.innerHTML = renderEconomicResults(evaluateEconomicScenario(values));
  }
}

function renderCountryComparison(root, groupId, countryIds) {
  const model = buildCountryComparisonModel(groupId, countryIds);
  root.innerHTML = `
    <section class="country-comparison-section">
      <header class="country-comparison-heading">
        <div>
          <p class="section-kicker">국가 비교실</p>
          <h3>같은 지표를 같은 줄에서 비교하기</h3>
          <p>국가별 최신 공표연도를 따로 표시하고, 높고 낮음이 곧 좋고 나쁨이라는 판단은 하지 않습니다.</p>
        </div>
        <span>${model.countries.length}개 기준 · ${model.metrics.length}개 지표</span>
      </header>
      <section class="country-selector" aria-label="비교 국가 선택">
        <div>
          <span>비교 국가</span>
          <strong>2~4개 선택</strong>
        </div>
        <div>
          ${indicatorCountries
            .map(
              (country) => `
                <button
                  type="button"
                  data-comparison-country="${country.id}"
                  aria-pressed="${model.countries.some(
                    (selected) => selected.id === country.id
                  )}"
                >${escapeHtml(country.label)}</button>
              `
            )
            .join("")}
        </div>
      </section>
      <div class="country-group-tabs" role="tablist" aria-label="국가 비교 주제">
        ${countryComparisonGroups
          .map(
            (group) => `
              <button
                type="button"
                role="tab"
                data-comparison-group="${group.id}"
                aria-selected="${group.id === model.group.id}"
              >${escapeHtml(group.label)}</button>
            `
          )
          .join("")}
      </div>
      <div class="country-group-intro">
        <span>${escapeHtml(model.group.label)}</span>
        <strong>${escapeHtml(model.group.description)}</strong>
      </div>
      <div class="country-metric-list">
        ${model.metrics
          .map(
            (metric) => `
              <article class="country-metric-card">
                <header>
                  <div>
                    <span>${escapeHtml(metric.indicator.code)}</span>
                    <h4>${escapeHtml(metric.indicator.name)}</h4>
                  </div>
                  <p>${escapeHtml(metric.indicator.description)}</p>
                </header>
                <div class="country-value-grid" style="--country-count:${
                  model.countries.length
                }">
                  ${metric.observations
                    .map(
                      (item) => `
                        <section data-country="${item.country.id}">
                          <span>${escapeHtml(item.country.label)} <em>${
                            item.observation?.year || "자료 없음"
                          }</em></span>
                          <strong>${escapeHtml(
                            formatIndicatorValue(
                              metric.indicator,
                              item.observation
                            )
                          )}</strong>
                          <div class="country-value-track">
                            <i style="width:${item.position}%"></i>
                          </div>
                        </section>
                      `
                    )
                    .join("")}
                </div>
                <footer>
                  <p>
                    ${
                      metric.highest && metric.lowest
                        ? `선택 국가 중 높은 값 ${escapeHtml(
                            metric.highest.country.label
                          )} ${escapeHtml(
                            formatIndicatorValue(
                              metric.indicator,
                              metric.highest.observation
                            )
                          )} · 낮은 값 ${escapeHtml(
                            metric.lowest.country.label
                          )} ${escapeHtml(
                            formatIndicatorValue(
                              metric.indicator,
                              metric.lowest.observation
                            )
                          )}`
                        : "비교 가능한 자료가 충분하지 않습니다."
                    }
                  </p>
                  <span>${
                    metric.koreaRank
                      ? `한국 ${metric.koreaRank}/${metric.availableCount}번째`
                      : "한국 미선택"
                  }</span>
                </footer>
                <div class="country-metric-reading">
                  <span>읽는 법</span>
                  <p>${escapeHtml(metric.indicator.reading)}</p>
                  <span>주의</span>
                  <p>${escapeHtml(metric.indicator.caution)}</p>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
      <p class="country-comparison-note">
        출처는 지표 탐색과 동일한 세계은행 WDI 기준이며 데이터셋 갱신일은 ${escapeHtml(
          indicatorSnapshot.dataUpdatedAt.replaceAll("-", ".")
        )}입니다. 국가별 최신 공표연도가 다를 수 있으므로 각 값 옆의 연도를 먼저 확인하세요.
      </p>
    </section>
  `;
}

export function initLearningTools({ updateHeight }) {
  const studyTabs = [
    ...document.querySelectorAll("[data-study-view]")
  ];
  const studyPanels = [
    ...document.querySelectorAll("[data-study-view-panel]")
  ];
  const indicatorTabs = [
    ...document.querySelectorAll("[data-indicator-view]")
  ];
  const indicatorPanels = [
    ...document.querySelectorAll("[data-indicator-view-panel]")
  ];
  const economicRoot = document.querySelector("#economicLab");
  const countryRoot = document.querySelector("#countryComparison");
  if (
    !studyTabs.length ||
    !indicatorTabs.length ||
    !economicRoot ||
    !countryRoot
  ) {
    return;
  }

  const parameters = new URLSearchParams(window.location.search);
  const requestedChapter = parameters.get("chapter");
  let studyView = requestedChapter === "history"
    ? "history"
    : parameters.get("study") || "today";
  let indicatorView = parameters.get("indicatorView") || "explorer";
  if (!["today", "connections", "lab", "history"].includes(studyView)) {
    studyView = "today";
  }
  if (!["explorer", "compare"].includes(indicatorView)) {
    indicatorView = "explorer";
  }

  let economicValues = Object.fromEntries(
    economicLabControls.map((control) => [control.id, 0])
  );
  let comparisonGroup = "overview";
  let comparisonCountries = ["KOR", "USA", "JPN", "CHN"];

  renderEconomicLab(economicRoot, economicValues);
  renderCountryComparison(countryRoot, comparisonGroup, comparisonCountries);

  setNestedView({
    tabs: studyTabs,
    panels: studyPanels,
    selected: studyView,
    dataName: "studyView",
    queryName: "study",
    chapter: "study",
    updateHeight,
    updateUrl: false
  });
  setNestedView({
    tabs: indicatorTabs,
    panels: indicatorPanels,
    selected: indicatorView,
    dataName: "indicatorView",
    queryName: "indicatorView",
    chapter: "indicators",
    updateHeight,
    updateUrl: false
  });

  document.querySelector("#studyViewTabs")?.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-study-view]");
    if (!button) return;
    studyView = button.dataset.studyView;
    setNestedView({
      tabs: studyTabs,
      panels: studyPanels,
      selected: studyView,
      dataName: "studyView",
      queryName: "study",
      chapter: "study",
      updateHeight
    });
  });

  document
    .querySelector("#indicatorViewTabs")
    ?.addEventListener("click", (event) => {
      const button = event.target.closest?.("[data-indicator-view]");
      if (!button) return;
      indicatorView = button.dataset.indicatorView;
      setNestedView({
        tabs: indicatorTabs,
        panels: indicatorPanels,
        selected: indicatorView,
        dataName: "indicatorView",
        queryName: "indicatorView",
        chapter: "indicators",
        updateHeight
      });
    });

  economicRoot.addEventListener("input", (event) => {
    const input = event.target.closest?.("[data-economic-control]");
    if (!input) return;
    economicValues[input.dataset.economicControl] = Number(input.value);
    economicRoot
      .querySelectorAll("[data-economic-preset]")
      .forEach((button) => button.setAttribute("aria-pressed", "false"));
    updateEconomicLab(economicRoot, economicValues);
    requestAnimationFrame(updateHeight);
  });

  economicRoot.addEventListener("click", (event) => {
    const presetButton = event.target.closest?.("[data-economic-preset]");
    if (presetButton) {
      const preset = economicLabPresets.find(
        (item) => item.id === presetButton.dataset.economicPreset
      );
      if (!preset) return;
      economicValues = { ...preset.values };
      economicRoot
        .querySelectorAll("[data-economic-preset]")
        .forEach((button) =>
          button.setAttribute(
            "aria-pressed",
            String(button.dataset.economicPreset === preset.id)
          )
        );
      updateEconomicLab(economicRoot, economicValues);
      requestAnimationFrame(updateHeight);
      return;
    }
    if (event.target.closest?.("[data-economic-reset]")) {
      economicValues = Object.fromEntries(
        economicLabControls.map((control) => [control.id, 0])
      );
      economicRoot
        .querySelectorAll("[data-economic-preset]")
        .forEach((button) => button.setAttribute("aria-pressed", "false"));
      updateEconomicLab(economicRoot, economicValues);
      requestAnimationFrame(updateHeight);
    }
  });

  countryRoot.addEventListener("click", (event) => {
    const groupButton = event.target.closest?.("[data-comparison-group]");
    if (groupButton) {
      comparisonGroup = groupButton.dataset.comparisonGroup;
      renderCountryComparison(
        countryRoot,
        comparisonGroup,
        comparisonCountries
      );
      requestAnimationFrame(updateHeight);
      return;
    }
    const countryButton = event.target.closest?.("[data-comparison-country]");
    if (!countryButton) return;
    const countryId = countryButton.dataset.comparisonCountry;
    if (comparisonCountries.includes(countryId)) {
      if (comparisonCountries.length <= 2) return;
      comparisonCountries = comparisonCountries.filter((id) => id !== countryId);
    } else {
      if (comparisonCountries.length >= 4) return;
      comparisonCountries = [...comparisonCountries, countryId];
    }
    renderCountryComparison(countryRoot, comparisonGroup, comparisonCountries);
    requestAnimationFrame(updateHeight);
  });
}
