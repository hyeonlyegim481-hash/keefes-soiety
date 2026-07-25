import {
  economicLabControls,
  economicLabPresets,
  evaluateEconomicScenario
} from "./economic-lab-data.js?v=85";
import {
  indicatorCountries,
  indicatorDefinitions as baseIndicatorDefinitions
} from "./indicator-data.js?v=85";
import { financeIndicatorDefinitions } from "./indicator-finance-data.js?v=85";
import { expandedIndicatorDefinitions } from "./indicator-expanded-data.js?v=85";
import { indicatorSnapshot } from "./indicator-values.js?v=85";

const comparableIndicators = [
  ...baseIndicatorDefinitions,
  ...financeIndicatorDefinitions,
  ...expandedIndicatorDefinitions
];

const MIN_COMPARISON_COUNTRIES = 2;
const MAX_COMPARISON_COUNTRIES = 5;

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
  const requestedIds = Array.isArray(requestedCountryIds)
    ? requestedCountryIds
    : [];
  const validIds = [...new Set(requestedIds)]
    .filter((id) => indicatorCountries.some((country) => country.id === id))
    .slice(0, MAX_COMPARISON_COUNTRIES);
  const countryIds = validIds.length >= MIN_COMPARISON_COUNTRIES
    ? validIds
    : ["KOR", "USA", "JPN", "CHN"];
  const countries = countryIds
    .map((id) => indicatorCountries.find((country) => country.id === id))
    .filter(Boolean);
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
          position: Number.isFinite(item.observation?.value)
            ? clamp(((item.observation.value - min) / range) * 100, 4, 100)
            : null
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
  if (control.unit === "단계") {
    if (value === 0) return "중립";
    return `${value > 0 ? control.upperLabel : control.lowerLabel} ${Math.abs(value).toFixed(1)}단계`;
  }
  if (value === 0) return `0${control.unit}`;
  const digits = control.step < 1 ? 2 : 0;
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}${control.unit}`;
}

function getEconomicControlPosition(control, value) {
  return ((value - control.min) / (control.max - control.min)) * 100;
}

const economicControlGroups = [
  {
    id: "financial",
    label: "금융 여건",
    description: "한국·미국 금리와 가계 상환 부담"
  },
  {
    id: "external",
    label: "대외 환경",
    description: "환율·에너지 비용과 해외 주문"
  },
  {
    id: "domestic",
    label: "국내 수요·공급",
    description: "재정·생산성·경제 심리"
  }
];

function renderEconomicControls(values) {
  return economicControlGroups
    .map((group) => {
      const controls = economicLabControls.filter((control) => control.group === group.id);
      return `
        <section class="economic-control-group" data-control-group="${group.id}">
          <div class="economic-control-group-title">
            <strong>${escapeHtml(group.label)}</strong>
            <span>${escapeHtml(group.description)}</span>
          </div>
          ${controls
            .map((control) => {
              const value = values[control.id];
              const position = getEconomicControlPosition(control, value);
              const direction = value > 0 ? "positive" : value < 0 ? "negative" : "neutral";
              return `
                <label class="economic-control" for="economic-control-${control.id}">
                  <span class="economic-control-head">
                    <strong>${escapeHtml(control.label)}</strong>
                    <output data-economic-value="${control.id}">${escapeHtml(
                      formatControlValue(control, value)
                    )}</output>
                  </span>
                  <span
                    class="economic-range-wrap"
                    data-economic-direction="${direction}"
                    style="--economic-position:${position}%"
                  >
                    <input
                      id="economic-control-${control.id}"
                      type="range"
                      min="${control.min}"
                      max="${control.max}"
                      step="${control.step}"
                      value="${value}"
                      data-economic-control="${control.id}"
                      aria-valuetext="${escapeHtml(formatControlValue(control, value))}"
                    />
                  </span>
                  <span class="economic-control-range">
                    <small>${escapeHtml(control.lowerLabel)}</small>
                    <small>0 기준</small>
                    <small>${escapeHtml(control.upperLabel)}</small>
                  </span>
                  <em>${escapeHtml(control.description)}</em>
                </label>
              `;
            })
            .join("")}
        </section>
      `;
    })
    .join("");
}

function buildCounterSignals(evaluation) {
  const signals = {
    rate: "은행 대출금리가 따라 움직이지 않거나 가계·기업의 고정금리 비중이 높으면 금리 충격은 약해질 수 있습니다.",
    fx: "기업의 환헤지, 달러 매출과 수입 중간재 비중에 따라 원화 약세 효과는 업종별로 반대가 될 수 있습니다.",
    oil: "유가 변화가 짧게 끝나거나 정제마진·세금·보조금이 완충하면 소비자물가 전가는 제한될 수 있습니다.",
    exports: "수출금액이 늘어도 가격 상승이나 일부 품목 집중이라면 생산·고용으로 이어지는 힘은 약할 수 있습니다.",
    fiscal: "예산 집행이 늦거나 수입품 구매로 빠져나가고 금리가 오르면 재정의 국내 경기 효과는 줄 수 있습니다.",
    productivity: "생산성 향상이 일부 기업에만 집중되거나 고용 전환 비용이 크면 가계소득 개선은 늦어질 수 있습니다.",
    globalRate: "미국 금리가 올라도 국내 성장과 물가 흐름이 다르면 한국 금리와 원화가 같은 폭으로 움직이지 않을 수 있습니다.",
    debt: "대출 만기, 고정금리 비중, 소득 증가와 채무조정에 따라 같은 부채 규모라도 실제 소비 위축은 달라질 수 있습니다.",
    confidence: "심리 개선이 실제 주문·고용·소득으로 이어지지 않으면 체감 회복은 일시적으로 끝날 수 있습니다."
  };
  const selected = evaluation.activeDrivers
    .slice(0, 3)
    .map((driver) => signals[driver.id]);
  return selected.length
    ? selected
    : ["입력한 변화가 없으므로 현재 경제의 구조와 다른 외부 충격이 결과를 결정합니다."];
}

function signedPoints(value) {
  const numeric = Number(value) || 0;
  return `${numeric > 0 ? "+" : ""}${numeric}점`;
}

function renderEconomicMethodology(evaluation) {
  return `
    <details class="economic-method-details">
      <summary>
        <span class="economic-method-summary-copy">
          <small>모형 설명</small>
          <strong>계산식·가중치 자세히 보기</strong>
        </span>
        <em>규칙 v${escapeHtml(evaluation.methodology.version)} · -100~+100</em>
      </summary>
      <div class="economic-method-body">
        <section class="economic-formula-panel">
          <div>
            <span>기본 계산식</span>
            <strong>입력의 크기와 방향을 같은 척도로 바꾼 뒤 결과별 계수를 적용합니다</strong>
            <code>표준화 입력 × 영향계수 × ${evaluation.methodology.pointsPerStandardizedUnit}점</code>
          </div>
          <ol>
            <li>
              <b>01</b>
              <span><strong>입력 표준화</strong><em>각 입력값을 해당 변수의 scale로 나눕니다.</em></span>
            </li>
            <li>
              <b>02</b>
              <span><strong>방향·크기 적용</strong><em>결과별 영향계수를 곱해 올림·내림 압력을 계산합니다.</em></span>
            </li>
            <li>
              <b>03</b>
              <span><strong>합산·범위 제한</strong><em>모든 압력을 더하고 -100에서 +100 사이로 제한합니다.</em></span>
            </li>
          </ol>
        </section>

        <div class="economic-method-rules">
          <article>
            <span>점수의 뜻</span>
            <strong>-100 하방 · 0 중립 · +100 상방</strong>
            <p>실제 성장률·물가상승률·수익률 또는 발생 확률이 아니라 상대적인 방향 압력입니다.</p>
          </article>
          <article>
            <span>중립 구간</span>
            <strong>-11점부터 +11점까지</strong>
            <p>절댓값 ${evaluation.methodology.neutralBand}점 미만은 방향이 뚜렷하지 않은 것으로 표시합니다.</p>
          </article>
          <article>
            <span>상한 처리</span>
            <strong>원점수가 범위를 넘으면 ±100</strong>
            <p>충격이 겹쳐도 숫자가 과도하게 커지지 않도록 표시 범위에서 잘라 냅니다.</p>
          </article>
        </div>

        <section class="economic-weight-section">
          <header>
            <div>
              <span>결과별 영향계수</span>
              <strong>같은 입력도 결과에 따라 방향과 전달 강도가 달라집니다</strong>
            </div>
            <p>
              <i data-sign="positive">+ 결과를 올림</i>
              <i data-sign="negative">- 결과를 내림</i>
            </p>
          </header>
          <div class="economic-weight-list">
            ${evaluation.results
              .map(
                (result) => `
                  <article class="economic-weight-row">
                    <header>
                      <strong>${escapeHtml(result.label)}</strong>
                      <span>원점수 ${signedPoints(result.rawScore)} · 표시 ${signedPoints(result.score)}</span>
                    </header>
                    <div>
                      ${Object.entries(result.coefficients)
                        .map(([controlId, coefficient]) => {
                          const control = economicLabControls.find(
                            (item) => item.id === controlId
                          );
                          return `
                            <span data-sign="${coefficient >= 0 ? "positive" : "negative"}">
                              <em>${escapeHtml(control?.label || controlId)}</em>
                              <b>${coefficient > 0 ? "+" : ""}${coefficient.toFixed(2)}</b>
                            </span>
                          `;
                        })
                        .join("")}
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
        </section>

        <p class="economic-method-warning">
          <strong>해석 주의</strong>
          <span>계수는 알려진 경제 전달 방향을 일관되게 비교하기 위한 교육용 규칙입니다. 과거 예측력을 통계적으로 검증한 모형이 아니며 실제 정책·투자 판단에 그대로 사용할 수 없습니다.</span>
        </p>
      </div>
    </details>
  `;
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
                <div>
                  <strong>${escapeHtml(result.labelText)}</strong>
                  <em>${signedPoints(result.score)}/100${result.wasCapped ? " · 상한 적용" : ""}</em>
                </div>
              </header>
              <div class="economic-impact-scale" aria-label="${escapeHtml(
                result.label
              )} 상대 압력 ${result.score}">
                <i style="--impact-score:${result.score}"></i>
                <b></b>
              </div>
              <div class="economic-impact-scale-labels" aria-hidden="true">
                <small>-100 하방</small>
                <small>0 중립</small>
                <small>+100 상방</small>
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
                              }" title="영향계수 ${item.coefficient > 0 ? "+" : ""}${item.coefficient}">${escapeHtml(item.label)} ${
                                item.contribution > 0 ? "↑" : "↓"
                              } <b>${signedPoints(item.contribution)}</b></i>`
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
    ${renderEconomicMethodology(evaluation)}
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
          <p>한국·미국 금리, 가계부채, 환율, 유가, 수출, 재정, 생산성과 경제 심리를 함께 조절해 충격의 상쇄와 증폭을 비교합니다.</p>
        </div>
      </div>

      <section class="economic-preset-section">
        <header>
          <span>빠른 시나리오</span>
          <strong>${economicLabPresets.length}개 상황을 선택하거나 아래 값을 직접 조절하세요</strong>
        </header>
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
      </section>

      <div class="economic-lab-layout">
        <aside class="economic-controls" aria-label="경제 조건 조절">
          <header class="economic-controls-header">
            <div>
              <span>가정 입력 · ${economicLabControls.length}개</span>
              <strong>현재 상태에서 얼마나 변하는가</strong>
            </div>
            <button
              type="button"
              class="economic-reset-button"
              data-economic-reset
              aria-label="모든 경제 실험 입력을 0으로 초기화"
            >
              <span aria-hidden="true">↺</span>
              <span>0으로 초기화</span>
            </button>
            <small class="economic-reset-status" data-economic-reset-status aria-live="polite">현재 기본값입니다.</small>
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
    const value = values[control.id];
    if (input) {
      input.value = value;
      input.setAttribute("aria-valuetext", formatControlValue(control, value));
      const range = input.closest(".economic-range-wrap");
      if (range) {
        range.style.setProperty(
          "--economic-position",
          `${getEconomicControlPosition(control, value)}%`
        );
        range.dataset.economicDirection =
          value > 0 ? "positive" : value < 0 ? "negative" : "neutral";
      }
    }
    if (output) output.textContent = formatControlValue(control, value);
  });
  const results = root.querySelector("#economicLabResults");
  if (results) {
    results.innerHTML = renderEconomicResults(evaluateEconomicScenario(values));
  }
}

function renderCountryComparison(root, groupId, countryIds, selectionMessage = "") {
  const model = buildCountryComparisonModel(groupId, countryIds);
  const selectionFull = model.countries.length >= MAX_COMPARISON_COUNTRIES;
  root.innerHTML = `
    <section class="country-comparison-section">
      <header class="country-comparison-heading">
        <div>
          <p class="section-kicker">국가 비교실</p>
          <h3>같은 지표를 같은 줄에서 비교하기</h3>
          <p>국가별 최신 공표연도를 따로 표시하고, 높고 낮음이 곧 좋고 나쁨이라는 판단은 하지 않습니다.</p>
        </div>
        <span>${model.countries.length}개 선택 · ${model.metrics.length}개 지표</span>
      </header>
      <section class="country-selector" aria-label="비교 국가 선택">
        <div>
          <span>비교 국가·지역</span>
          <strong>${MIN_COMPARISON_COUNTRIES}~${MAX_COMPARISON_COUNTRIES}개 선택 · 전체 ${indicatorCountries.length}개</strong>
        </div>
        <div>
          ${indicatorCountries
            .map((country) => {
              const selected = model.countries.some(
                (item) => item.id === country.id
              );
              const blocked = selectionFull && !selected;
              return `
                <button
                  type="button"
                  data-comparison-country="${country.id}"
                  aria-pressed="${selected}"
                  aria-disabled="${blocked}"
                  title="${blocked ? `최대 ${MAX_COMPARISON_COUNTRIES}개까지 비교할 수 있습니다.` : `${country.label} ${selected ? "제외" : "추가"}`}"
                >${escapeHtml(country.label)}</button>
              `;
            })
            .join("")}
        </div>
        <p class="country-selection-status" data-comparison-status aria-live="polite">
          ${escapeHtml(selectionMessage || `현재 ${model.countries.map((country) => country.label).join(", ")} 비교 중`)}
        </p>
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
                    .map((item) => {
                      const available = Number.isFinite(
                        item.observation?.value
                      );
                      return `
                        <section data-country="${item.country.id}" data-available="${available}">
                          <span>${escapeHtml(item.country.label)} <em>${
                            item.observation?.year || "연도 없음"
                          }</em></span>
                          <strong>${escapeHtml(
                            formatIndicatorValue(
                              metric.indicator,
                              item.observation
                            )
                          )}</strong>
                          ${
                            available
                              ? `<div class="country-value-track"><i style="width:${item.position}%"></i></div>`
                              : '<div class="country-value-track" data-missing><span>비교 자료 없음</span></div>'
                          }
                        </section>
                      `;
                    })
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
                      : `비교 가능 ${metric.availableCount}/${model.countries.length}개`
                  }</span>
                </footer>
                <div class="country-metric-reading">
                  <span>읽는 법</span>
                  <p>${escapeHtml(metric.indicator.reading)}</p>
                  <span>주의</span>
                  <p>${escapeHtml(metric.indicator.caution)}</p>
                  <span>출처·기준</span>
                  <p>
                    ${escapeHtml(metric.indicator.source)} · 국가별 표시연도 기준 · 단위 ${escapeHtml(metric.indicator.unit)} · 연간 WDI 값
                    <a href="${escapeHtml(metric.indicator.sourceUrl)}" target="_blank" rel="noopener noreferrer">원자료 보기</a>
                  </p>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
      <details class="country-comparison-method">
        <summary>출처·기준·수정 가능성 자세히 보기</summary>
        <div>
          <p><b>원자료 제공기관</b> 세계은행 World Development Indicators</p>
          <p><b>데이터 기준일</b> 각 값 옆의 국가별 공표연도</p>
          <p><b>사이트 갱신일</b> ${escapeHtml(indicatorSnapshot.dataUpdatedAt.replaceAll("-", "."))}</p>
          <p><b>계산식</b> 원자료 값을 변환하지 않고 표시하며, 막대는 현재 선택 국가 안의 최솟값~최댓값 상대 위치입니다.</p>
          <p><b>명목·실질</b> 지표 코드별 정의가 다르므로 각 카드의 원자료 링크에서 확인합니다.</p>
          <p><b>계절조정·수정</b> 연간 WDI 값으로 별도 계절조정 표시는 없으며, 제공기관 갱신 때 과거 값이 수정될 수 있습니다.</p>
          <p><b>잠정·확정</b> WDI 응답에 공통 상태 필드가 없어 확정치로 단정하지 않습니다.</p>
        </div>
      </details>
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
  let comparisonMessage = "";

  renderEconomicLab(economicRoot, economicValues);
  renderCountryComparison(
    countryRoot,
    comparisonGroup,
    comparisonCountries,
    comparisonMessage
  );

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
    const status = economicRoot.querySelector("[data-economic-reset-status]");
    if (status) status.textContent = "직접 조절한 조건을 계산 중입니다.";
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
      const status = economicRoot.querySelector("[data-economic-reset-status]");
      if (status) status.textContent = `"${preset.label}" 시나리오를 적용했습니다.`;
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
      const status = economicRoot.querySelector("[data-economic-reset-status]");
      if (status) status.textContent = "모든 입력을 기본값 0으로 되돌렸습니다.";
      updateEconomicLab(economicRoot, economicValues);
      requestAnimationFrame(updateHeight);
    }
  });

  countryRoot.addEventListener("click", (event) => {
    const groupButton = event.target.closest?.("[data-comparison-group]");
    if (groupButton) {
      comparisonGroup = groupButton.dataset.comparisonGroup;
      comparisonMessage = "";
      renderCountryComparison(
        countryRoot,
        comparisonGroup,
        comparisonCountries,
        comparisonMessage
      );
      requestAnimationFrame(updateHeight);
      return;
    }
    const countryButton = event.target.closest?.("[data-comparison-country]");
    if (!countryButton) return;
    const countryId = countryButton.dataset.comparisonCountry;
    if (comparisonCountries.includes(countryId)) {
      if (comparisonCountries.length <= MIN_COMPARISON_COUNTRIES) {
        comparisonMessage = `비교 기준을 유지하려면 최소 ${MIN_COMPARISON_COUNTRIES}개가 필요합니다.`;
      } else {
        comparisonCountries = comparisonCountries.filter(
          (id) => id !== countryId
        );
        comparisonMessage = "";
      }
    } else if (comparisonCountries.length >= MAX_COMPARISON_COUNTRIES) {
      comparisonMessage = `최대 ${MAX_COMPARISON_COUNTRIES}개까지 비교할 수 있습니다. 한 국가를 먼저 제외하세요.`;
    } else {
      comparisonCountries = [...comparisonCountries, countryId];
      comparisonMessage = "";
    }
    renderCountryComparison(
      countryRoot,
      comparisonGroup,
      comparisonCountries,
      comparisonMessage
    );
    requestAnimationFrame(updateHeight);
  });
}
