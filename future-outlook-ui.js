import {
  climateScenarios,
  futureMilestones,
  futureOutlookMeta,
  humanityRisks,
  outlookCategories,
  outlookSources,
  policyTemperaturePaths
} from "./future-outlook-data.js";
import { buildFutureOutlookBrief } from "./chapter-live-briefs.js";

const sourceById = new Map(outlookSources.map((source) => [source.id, source]));
const liveDateFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
});
const state = {
  scenario: "middle",
  category: "all",
  snapshot: null
};

let rootElement = null;
let updateChapterHeight = () => {};

export function initFutureOutlook({
  root = document.querySelector("#futureOutlook"),
  updateHeight = () => {},
  snapshot = null
} = {}) {
  rootElement = root;
  updateChapterHeight = updateHeight;
  state.snapshot = snapshot;

  rootElement?.addEventListener("click", (event) => {
    const scenarioButton = event.target.closest?.("[data-outlook-scenario]");
    if (scenarioButton) {
      state.scenario = normalizeScenarioId(scenarioButton.dataset.outlookScenario);
      renderFutureOutlook();
      return;
    }

    const categoryButton = event.target.closest?.("[data-outlook-category]");
    if (categoryButton) {
      state.category = normalizeCategoryId(categoryButton.dataset.outlookCategory);
      renderFutureOutlook();
    }
  });

  renderFutureOutlook();
  return {
    updatedAt: futureOutlookMeta.updatedAt,
    render: renderFutureOutlook,
    updateSnapshot(snapshot) {
      state.snapshot = snapshot;
      renderFutureOutlook();
    }
  };
}

export function normalizeScenarioId(value) {
  return climateScenarios.some((scenario) => scenario.id === value) ? value : "middle";
}

export function normalizeCategoryId(value) {
  return outlookCategories.some((category) => category.id === value) ? value : "all";
}

export function filterOutlookRisks(category = "all") {
  const normalized = normalizeCategoryId(category);
  return humanityRisks.filter((risk) => normalized === "all" || risk.category === normalized);
}

export function getScenarioRangeStyle(point, maximum = 6) {
  const min = Math.max(0, Number(point?.min) || 0);
  const max = Math.max(min, Number(point?.max) || min);
  const best = Math.min(max, Math.max(min, Number(point?.best) || min));
  const roundedPercent = (value) => Math.round(value * 10_000) / 10_000;
  return {
    start: roundedPercent(Math.min(100, (min / maximum) * 100)),
    width: roundedPercent(Math.min(100, ((max - min) / maximum) * 100)),
    best: roundedPercent(Math.min(100, (best / maximum) * 100))
  };
}

function renderFutureOutlook() {
  if (!rootElement) return;
  const scenario = climateScenarios.find((item) => item.id === state.scenario)
    || climateScenarios[1];
  const visibleRisks = filterOutlookRisks(state.category);
  const activeCategory = outlookCategories.find((category) => category.id === state.category)
    || outlookCategories[0];

  rootElement.innerHTML = `
    <section class="outlook-dashboard">
      ${renderOutlookLead()}
      ${renderOutlookLiveBrief(buildFutureOutlookBrief(state.snapshot))}
      ${renderPolicyPath()}
      ${renderScenarioExplorer(scenario)}
      <section class="outlook-risk-section" aria-labelledby="outlookRiskTitle">
        <header class="outlook-section-heading">
          <div>
            <p class="section-kicker">인류 위험 신호판</p>
            <h3 id="outlookRiskTitle">현재 숫자와 미래 조건을 나란히 보기</h3>
            <p>항목마다 단위와 근거가 다르므로 위험점수 하나로 합치지 않습니다.</p>
          </div>
          <span>${visibleRisks.length}/${humanityRisks.length}개 표시</span>
        </header>
        <div class="outlook-category-tabs" role="tablist" aria-label="미래 위험 분야">
          ${outlookCategories.map((category) => `
            <button
              type="button"
              role="tab"
              data-outlook-category="${escapeHtml(category.id)}"
              aria-selected="${category.id === activeCategory.id}"
            >
              <strong>${escapeHtml(category.label)}</strong>
              <span>${escapeHtml(category.short)}</span>
            </button>
          `).join("")}
        </div>
        <div class="outlook-risk-list">
          ${visibleRisks.map(renderRiskItem).join("")}
        </div>
      </section>
      ${renderTimeline()}
      ${renderMethod()}
    </section>
  `;
  requestAnimationFrame(updateChapterHeight);
}

function renderOutlookLead() {
  return `
    <header class="outlook-lead">
      <div>
        <span>HUMAN FUTURES · EVIDENCE BOARD</span>
        <h3>위기를 맞히는 대신 변화를 먼저 읽습니다.</h3>
        <p>${escapeHtml(futureOutlookMeta.description)}</p>
      </div>
      <aside>
        <span>자료 기준</span>
        <strong>${futureOutlookMeta.updatedAt.replaceAll("-", ".")}</strong>
        <em>공식기관 ${outlookSources.length}개 자료</em>
      </aside>
    </header>
    <div class="outlook-key-rail" aria-label="핵심 미래 지표">
      <div data-tone="observed">
        <span>2025 관측 온도</span>
        <strong>+1.43<small>°C</small></strong>
        <p>1850~1900년 대비 · WMO</p>
      </div>
      <div data-tone="danger">
        <span>현재 정책의 세기말</span>
        <strong>2.8<small>°C</small></strong>
        <p>조건부 전망 · UNEP 2025</p>
      </div>
      <div data-tone="energy">
        <span>2030 데이터센터 전력</span>
        <strong>945<small>TWh</small></strong>
        <p>IEA 기본 시나리오</p>
      </div>
      <div data-tone="finance">
        <span>2035 적응재원 필요</span>
        <strong>12~14<small>배</small></strong>
        <p>2023년 국제 공공재원 대비</p>
      </div>
    </div>
    <div class="outlook-evidence-guide">
      <div><i>관측</i><p>이미 측정된 과거·현재 값</p></div>
      <div><i>조건부 전망</i><p>정책·추세가 이어진다는 조건</p></div>
      <div><i>시나리오</i><p>가능한 경로를 비교하는 범위</p></div>
    </div>
  `;
}

function renderPolicyPath() {
  return `
    <section class="outlook-policy-path" aria-labelledby="outlookPolicyTitle">
      <header class="outlook-section-heading">
        <div>
          <p class="section-kicker">정책 경로</p>
          <h3 id="outlookPolicyTitle">현재 세계는 어느 온도 경로에 있는가</h3>
          <p>UNEP 2025의 정책 이행 조건별 세기말 온도평가입니다.</p>
        </div>
        ${renderSourceLink("unep-egr-2025", "보고서 원문")}
      </header>
      <div class="outlook-policy-scale" aria-label="정책별 세기말 온도 경로">
        <div class="outlook-policy-axis" aria-hidden="true">
          <span>1.5°C</span><span>2.0°C</span><span>2.5°C</span><span>3.0°C</span>
        </div>
        ${policyTemperaturePaths.map((path) => `
          <article data-tone="${escapeHtml(path.tone)}">
            <div>
              <span>${escapeHtml(path.label)}</span>
              <strong>${escapeHtml(path.display)}</strong>
            </div>
            <div class="outlook-policy-track">
              <i style="width:${Math.min(100, Math.max(0, ((path.value - 1.5) / 1.5) * 100))}%"></i>
              <b style="left:${Math.min(100, Math.max(0, ((path.value - 1.5) / 1.5) * 100))}%"></b>
            </div>
            <p>${escapeHtml(path.detail)}</p>
          </article>
        `).join("")}
      </div>
      <p class="outlook-policy-note">이 숫자는 IPCC 물리 시나리오와 다른 UNEP 정책평가입니다. 아래 시나리오 차트와 같은 예측값으로 합산하지 않습니다.</p>
    </section>
  `;
}

function renderScenarioExplorer(scenario) {
  const late = scenario.temperatures.at(-1);
  return `
    <section class="outlook-scenario" data-tone="${escapeHtml(scenario.tone)}" aria-labelledby="outlookScenarioTitle">
      <header class="outlook-section-heading">
        <div>
          <p class="section-kicker">IPCC 물리 시나리오</p>
          <h3 id="outlookScenarioTitle">배출 경로별 온도·해수면 범위</h3>
          <p>선 하나가 아니라 최선 추정값과 매우 가능성이 높은 범위를 함께 표시합니다.</p>
        </div>
        ${renderSourceLink("ipcc-ar6", "IPCC 원문")}
      </header>
      <div class="outlook-scenario-tabs" role="tablist" aria-label="IPCC 배출 시나리오">
        ${climateScenarios.map((item, index) => `
          <button
            type="button"
            role="tab"
            data-outlook-scenario="${escapeHtml(item.id)}"
            aria-selected="${item.id === scenario.id}"
            data-tone="${escapeHtml(item.tone)}"
          >
            <i>${String(index + 1).padStart(2, "0")}</i>
            <span>${escapeHtml(item.code)}</span>
            <strong>${escapeHtml(item.label)}</strong>
          </button>
        `).join("")}
      </div>
      <div class="outlook-scenario-layout">
        <div class="outlook-temperature-chart">
          <header>
            <div>
              <span>세계 평균 지표면 온도</span>
              <strong>1850~1900년 대비 °C</strong>
            </div>
            <div class="outlook-chart-legend">
              <span><i></i>가능 범위</span>
              <span><b></b>최선 추정</span>
            </div>
          </header>
          <div class="outlook-temperature-axis" aria-hidden="true">
            ${[0, 1, 2, 3, 4, 5, 6].map((value) => `<span>${value}°</span>`).join("")}
          </div>
          <div class="outlook-temperature-rows">
            ${scenario.temperatures.map((point) => renderTemperaturePoint(point)).join("")}
          </div>
        </div>
        <aside class="outlook-scenario-read">
          <span>${escapeHtml(scenario.code)} · ${escapeHtml(scenario.label)}</span>
          <strong>${late.best.toFixed(1)}<small>°C</small></strong>
          <em>세기말 최선 추정 · 범위 ${late.min.toFixed(1)}~${late.max.toFixed(1)}°C</em>
          <p>${escapeHtml(scenario.plain)}</p>
          <div>
            <span>2100 해수면</span>
            <strong>${scenario.seaLevel2100.min.toFixed(2)}~${scenario.seaLevel2100.max.toFixed(2)}m</strong>
            <em>1995~2014년 평균 대비 가능 범위</em>
          </div>
          <footer>${escapeHtml(scenario.implication)}</footer>
        </aside>
      </div>
    </section>
  `;
}

function renderTemperaturePoint(point) {
  const style = getScenarioRangeStyle(point);
  return `
    <div class="outlook-temperature-row">
      <div>
        <span>${escapeHtml(point.period)}</span>
        <strong>${point.best.toFixed(1)}°C</strong>
        <em>${point.min.toFixed(1)}~${point.max.toFixed(1)}°C</em>
      </div>
      <div class="outlook-temperature-track">
        <i style="left:${style.start}%;width:${style.width}%"></i>
        <b style="left:${style.best}%"></b>
      </div>
    </div>
  `;
}

function renderRiskItem(risk) {
  return `
    <details class="outlook-risk-item" data-category="${escapeHtml(risk.category)}">
      <summary>
        <i>${escapeHtml(risk.order)}</i>
        <div class="outlook-risk-title">
          <span>${escapeHtml(risk.categoryLabel)} · ${escapeHtml(risk.horizon)}</span>
          <strong>${escapeHtml(risk.title)}</strong>
          <p>${escapeHtml(risk.plain)}</p>
        </div>
        ${renderMetric(risk.current)}
        <div class="outlook-risk-arrow" aria-hidden="true">→</div>
        ${renderMetric(risk.outlook)}
        <div class="outlook-risk-confidence">
          <span>근거 신뢰도</span>
          <strong>${escapeHtml(risk.confidence)}</strong>
        </div>
      </summary>
      <div class="outlook-risk-detail">
        <section class="outlook-risk-chain">
          <span>위기가 전달되는 순서</span>
          <ol>${risk.chain.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
        </section>
        <section>
          <span>다음 갱신에서 볼 지표</span>
          <ul>${risk.signals.map((signal) => `<li>${escapeHtml(signal)}</li>`).join("")}</ul>
        </section>
        <section>
          <span>한국에 닿는 경로</span>
          <p>${escapeHtml(risk.korea)}</p>
        </section>
        <section>
          <span>해석 한계</span>
          <p>${escapeHtml(risk.limits)}</p>
        </section>
        <footer>
          <div>
            <span>원자료·기준</span>
            <strong>${risk.sourceIds.map((sourceId) => escapeHtml(sourceById.get(sourceId)?.publisher || sourceId)).join(" · ")}</strong>
          </div>
          <div>${risk.sourceIds.map((sourceId) => renderSourceLink(sourceId, "원문")).join("")}</div>
        </footer>
      </div>
    </details>
  `;
}

function renderMetric(metric) {
  return `
    <div class="outlook-risk-metric" data-kind="${escapeHtml(metric.kind)}">
      <span>${escapeHtml(metric.kind)}</span>
      <strong>${escapeHtml(metric.value)}<small>${escapeHtml(metric.unit)}</small></strong>
      <em>${escapeHtml(metric.label)}</em>
      <p>${escapeHtml(metric.note)}</p>
    </div>
  `;
}

function renderTimeline() {
  return `
    <section class="outlook-timeline" aria-labelledby="outlookTimelineTitle">
      <header class="outlook-section-heading">
        <div>
          <p class="section-kicker">시간축</p>
          <h3 id="outlookTimelineTitle">2030에서 2100까지 무엇을 확인할까</h3>
          <p>먼 미래 숫자보다 가까운 이정표가 실제 경로를 바꾸는지 먼저 봅니다.</p>
        </div>
      </header>
      <div class="outlook-timeline-track">
        ${futureMilestones.map((item, index) => `
          <article>
            <i>${String(index + 1).padStart(2, "0")}</i>
            <time>${escapeHtml(item.period)}</time>
            <span>${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(item.title)}</strong>
            <ul>${item.facts.map((fact) => `<li>${escapeHtml(fact)}</li>`).join("")}</ul>
            <div>${item.sourceIds.map((sourceId) => renderSourceLink(sourceId, "근거")).join("")}</div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderMethod() {
  return `
    <details class="outlook-method">
      <summary>전망 자료의 계산 기준과 한계 보기</summary>
      <div>
        <section>
          <span>관측과 전망 구분</span>
          <p>${escapeHtml(futureOutlookMeta.principle)}</p>
        </section>
        <section>
          <span>숫자 비교 원칙</span>
          <p>${escapeHtml(futureOutlookMeta.caution)}</p>
        </section>
        <section>
          <span>업데이트 방식</span>
          <p>공식 수치는 각 기관의 개정판이 발표될 때 교체하고, 관련 뉴스 동향은 30분마다 확인합니다. 뉴스만으로 전망 수치나 시나리오를 변경하지 않습니다.</p>
        </section>
        <section class="outlook-source-directory">
          <span>사용한 공식 자료</span>
          <div>
            ${outlookSources.map((source) => `
              <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">
                <strong>${escapeHtml(source.publisher)}</strong>
                <span>${escapeHtml(source.title)}</span>
                <em>${escapeHtml(source.publishedAt)} · ${escapeHtml(source.basis)}</em>
              </a>
            `).join("")}
          </div>
        </section>
      </div>
    </details>
  `;
}

function renderOutlookLiveBrief(brief) {
  const current = brief || {
    status: "unavailable",
    count: 0,
    fetchedAt: null,
    refreshMinutes: 30,
    headlines: [],
    summary: "최신 동향을 수집하지 못했습니다."
  };
  const statusLabels = {
    current: "새 동향",
    empty: "새 기사 없음",
    stale: "마지막 정상 뉴스",
    unavailable: "수집 실패"
  };
  const headlines = Array.isArray(current.headlines) ? current.headlines : [];
  return `
    <section class="outlook-live-brief" data-status="${escapeHtml(current.status)}" aria-labelledby="outlookLiveTitle">
      <header>
        <div>
          <span>30-MINUTE EVIDENCE WATCH</span>
          <h3 id="outlookLiveTitle">미래 위험·전환 최신 동향</h3>
          <p>기후·에너지·물·식량·재난 관련 기사를 공식 장기 전망과 분리해 봅니다.</p>
        </div>
        <aside>
          <b>${escapeHtml(statusLabels[current.status] || "확인 중")}</b>
          <time datetime="${escapeHtml(current.fetchedAt || "")}">${current.fetchedAt ? formatLiveDate(current.fetchedAt) : "기준시각 없음"}</time>
          <em>${Number(current.refreshMinutes) || 30}분 확인 · ${Number(current.count) || 0}건 연결</em>
        </aside>
      </header>
      <p class="outlook-live-summary">${escapeHtml(current.summary)}</p>
      ${current.transmission ? `<p class="outlook-live-path"><span>전망 확인 경로</span>${escapeHtml(current.transmission)}</p>` : ""}
      ${headlines.length ? `
        <div class="outlook-live-links">
          ${headlines.map((headline) => `
            <a href="${escapeHtml(safeExternalUrl(headline.url))}" target="_blank" rel="noopener noreferrer">
              <span>${escapeHtml(headline.source || "출처 미확인")} · ${formatLiveDate(headline.publishedAt, "게시일 미확인")}</span>
              <strong>${escapeHtml(headline.title)}</strong>
            </a>
          `).join("")}
        </div>
      ` : ""}
      <small>기사는 변화 신호입니다. 관측값·공식 전망·정책 시나리오는 원자료가 개정될 때만 수정합니다.</small>
    </section>
  `;
}

function formatLiveDate(value, fallback = "기준시각 미확인") {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? liveDateFormatter.format(date) : fallback;
}

function safeExternalUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : "#";
  } catch {
    return "#";
  }
}
function renderSourceLink(sourceId, label) {
  const source = sourceById.get(sourceId);
  if (!source) return "";
  return `
    <a class="outlook-source-link" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">
      ${escapeHtml(label)} <span aria-hidden="true">↗</span>
    </a>
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
