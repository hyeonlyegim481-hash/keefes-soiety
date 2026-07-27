import { climateBusinessFramework } from "./climate-business-data.js";
import { buildFutureIndustryBrief } from "./chapter-live-briefs.js";
import { futureCompanies, futureIndustries, futureIndustryMethod } from "./future-industry-data.js";
import { initFutureOutlook } from "./future-outlook-ui.js";
import {
  readUrlState,
  subscribeUrlState,
  syncUrlState
} from "./url-state.js";

const MAX_COMPARE = 4;
const numberFormatter = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 1 });
const liveDateFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
});
const companyById = new Map(futureCompanies.map((company) => [company.id, company]));
const industryById = new Map(futureIndustries.map((industry) => [industry.id, industry]));
const initialUrlState = readUrlState();

const viewState = {
  view: initialUrlState.chapter === "future" ? initialUrlState.future : "industries",
  sector: initialUrlState.chapter === "future" ? initialUrlState.industry : "ai-chips",
  climatePhase: "all",
  compareIds: ["nvidia", "sk-hynix", "microsoft"],
  region: "all",
  sort: "health",
  query: "",
  snapshot: null
};

let updateChapterHeight = () => {};
let getCurrentSnapshot = () => null;
let outlookController = null;
let subscribedToUrlState = false;

const elements = {
  update: document.querySelector("#futureUpdate"),
  viewTabs: document.querySelector("#futureViewTabs"),
  viewPanels: document.querySelectorAll("[data-future-view-panel]"),
  outlookRoot: document.querySelector("#futureOutlook"),
  summary: document.querySelector("#futureSummary"),
  climateLab: document.querySelector("#climateBusinessLab"),
  industryTabs: document.querySelector("#futureIndustryTabs"),
  story: document.querySelector("#futureStory"),
  companyCount: document.querySelector("#futureCompanyCount"),
  companyTools: document.querySelector("#futureCompanyTools"),
  companySearch: document.querySelector("#futureCompanySearch"),
  regionControl: document.querySelector("#futureRegionControl"),
  companySort: document.querySelector("#futureCompanySort"),
  companyRadar: document.querySelector("#futureCompanyRadar"),
  companyList: document.querySelector("#futureCompanyList"),
  compareCount: document.querySelector("#futureCompareCount"),
  compare: document.querySelector("#futureCompare"),
  method: document.querySelector("#futureMethod")
};

export function initFutureIndustryChapter({
  updateHeight = () => {},
  getSnapshot = () => null
} = {}) {
  updateChapterHeight = updateHeight;
  getCurrentSnapshot = getSnapshot;
  viewState.snapshot = getCurrentSnapshot();

  elements.viewTabs?.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-future-view]");
    if (!button) return;
    setFutureView(button.dataset.futureView);
  });

  elements.climateLab?.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-climate-phase]");
    if (!button) return;
    viewState.climatePhase = button.dataset.climatePhase;
    renderClimateBusinessLab();
    requestAnimationFrame(updateChapterHeight);
  });

  elements.industryTabs?.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-future-sector]");
    if (!button) return;
    viewState.sector = button.dataset.futureSector;
    viewState.query = "";
    if (elements.companySearch) elements.companySearch.value = "";
    renderFutureIndustryChapter();
    syncUrlState(
      {
        chapter: "future",
        future: "industries",
        industry: viewState.sector
      },
      { mode: "push", source: "future-industry" }
    );
  });

  elements.companyList?.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-future-compare]");
    if (!button || button.disabled) return;
    toggleComparison(button.dataset.futureCompare);
  });

  elements.compare?.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-future-remove]");
    if (!button) return;
    viewState.compareIds = viewState.compareIds.filter((id) => id !== button.dataset.futureRemove);
    renderFutureIndustryChapter();
  });

  elements.regionControl?.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-future-region]");
    if (!button) return;
    viewState.region = button.dataset.futureRegion;
    renderCompanyWorkspace(getSelectedIndustry());
  });

  elements.companySearch?.addEventListener("input", (event) => {
    viewState.query = event.currentTarget.value.trim();
    renderCompanyWorkspace(getSelectedIndustry());
  });

  elements.companySort?.addEventListener("change", (event) => {
    viewState.sort = event.currentTarget.value;
    renderCompanyWorkspace(getSelectedIndustry());
  });

  outlookController = initFutureOutlook({
    root: elements.outlookRoot,
    updateHeight: updateChapterHeight,
    snapshot: viewState.snapshot
  });
  if (!subscribedToUrlState) {
    subscribedToUrlState = true;
    subscribeUrlState(applyFutureUrlState);
  }
  renderFutureIndustryChapter();
  setFutureView(viewState.view, { syncUrl: false });
  return {
    updateSnapshot(snapshot) {
      viewState.snapshot = snapshot;
      outlookController?.updateSnapshot(snapshot);
      renderFutureIndustryChapter();
      renderFutureUpdateLabel(viewState.view);
    }
  };
}

function setFutureView(nextView, { syncUrl = true } = {}) {
  const normalized = nextView === "outlook" ? "outlook" : "industries";
  viewState.view = normalized;

  elements.viewTabs?.querySelectorAll("[data-future-view]").forEach((button) => {
    button.setAttribute("aria-selected", String(button.dataset.futureView === normalized));
  });
  elements.viewPanels.forEach((panel) => {
    const selected = panel.dataset.futureViewPanel === normalized;
    panel.setAttribute("aria-hidden", String(!selected));
    panel.inert = !selected;
  });

  renderFutureUpdateLabel(normalized);

  if (syncUrl) {
    syncUrlState(
      {
        chapter: "future",
        future: normalized,
        ...(normalized === "industries" ? { industry: viewState.sector } : {})
      },
      { mode: "push", source: "future-view" }
    );
  }
  requestAnimationFrame(updateChapterHeight);
}

function applyFutureUrlState(urlState) {
  if (urlState.chapter !== "future") return;
  const nextView = urlState.future === "outlook" ? "outlook" : "industries";
  const nextSector = industryById.has(urlState.industry)
    ? urlState.industry
    : "ai-chips";
  const sectorChanged = viewState.sector !== nextSector;
  const viewChanged = viewState.view !== nextView;
  if (!sectorChanged && !viewChanged) return;

  viewState.sector = nextSector;
  if (sectorChanged) {
    viewState.query = "";
    if (elements.companySearch) elements.companySearch.value = "";
    renderFutureIndustryChapter();
  }
  setFutureView(nextView, { syncUrl: false });
}

function getSelectedIndustry() {
  return industryById.get(viewState.sector) || futureIndustries[0];
}

function getIndustryCompanies(industry) {
  return industry.companyIds.map((id) => companyById.get(id)).filter(Boolean);
}

function toggleComparison(companyId) {
  if (viewState.compareIds.includes(companyId)) {
    viewState.compareIds = viewState.compareIds.filter((id) => id !== companyId);
  } else if (viewState.compareIds.length < MAX_COMPARE) {
    viewState.compareIds = [...viewState.compareIds, companyId];
  }
  renderFutureIndustryChapter();
}

function renderFutureIndustryChapter() {
  const industry = getSelectedIndustry();
  const companies = getIndustryCompanies(industry);
  const liveBrief = buildFutureIndustryBrief(viewState.snapshot, industry);

  if (viewState.view === "industries") renderFutureUpdateLabel("industries");

  renderSummary(industry, companies);
  renderIndustryTabs(industry);
  if (elements.story) elements.story.innerHTML = renderIndustryStory(industry, companies, liveBrief);
  renderCompanyWorkspace(industry);
  renderComparison();
  renderClimateBusinessLab();
  renderMethod();
  requestAnimationFrame(updateChapterHeight);
}

function renderSummary(industry, companies) {
  if (!elements.summary) return;
  const averageScore = Math.round(companies.reduce((sum, company) => sum + getHealthScore(company), 0) / companies.length);
  const strongest = [...companies].sort((a, b) => getHealthScore(b) - getHealthScore(a))[0];
  const fastest = [...companies].sort((a, b) => b.revenueGrowth - a.revenueGrowth)[0];

  elements.summary.innerHTML = `
    <div class="future-summary-current">
      <span>선택 산업</span>
      <strong>${escapeHtml(industry.shortLabel)}</strong>
      <p>${companies.length}개 기업 사례 · ${escapeHtml(industry.horizon)}</p>
    </div>
    <div>
      <span>산업 평균 체력</span>
      <strong>${averageScore}<small>/100</small></strong>
      <p>현재 연결 기업의 교육용 점수 평균</p>
    </div>
    <div>
      <span>사업체력 선두</span>
      <strong>${escapeHtml(strongest.name)}</strong>
      <p>${getHealthScore(strongest)}점 · ${escapeHtml(getCompanyRole(strongest))}</p>
    </div>
    <div>
      <span>매출 성장 선두</span>
      <strong>${escapeHtml(fastest.name)}</strong>
      <p>${formatGrowth(fastest.revenueGrowth)} · ${escapeHtml(fastest.fiscal)}</p>
    </div>
  `;
}

function renderIndustryTabs(activeIndustry) {
  if (!elements.industryTabs) return;
  elements.industryTabs.replaceChildren(
    ...futureIndustries.map((industry, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.role = "tab";
      button.dataset.futureSector = industry.id;
      button.setAttribute("aria-selected", String(industry.id === activeIndustry.id));
      button.innerHTML = `
        <i>${String(index + 1).padStart(2, "0")}</i>
        <span>${escapeHtml(industry.eyebrow)}</span>
        <strong>${escapeHtml(industry.shortLabel)}</strong>
        <em>${industry.companyIds.length}</em>
      `;
      return button;
    })
  );
}

function renderIndustryStory(industry, companies, liveBrief) {
  const strongest = [...companies].sort((a, b) => getHealthScore(b) - getHealthScore(a))[0];
  const fastest = [...companies].sort((a, b) => b.revenueGrowth - a.revenueGrowth)[0];
  const koreaCount = companies.filter((company) => company.country === "한국").length;
  const industryIndex = futureIndustries.findIndex((item) => item.id === industry.id) + 1;

  return `
    <header class="future-story-head">
      <div>
        <span>INDUSTRY ${String(industryIndex).padStart(2, "0")} · ${escapeHtml(industry.eyebrow)}</span>
        <h3>${escapeHtml(industry.label)}</h3>
        <p>${escapeHtml(industry.thesis)}</p>
      </div>
      <aside>
        <span>현재 단계</span>
        <strong>${escapeHtml(industry.stage)}</strong>
        <em>관찰 기간 · ${escapeHtml(industry.horizon)}</em>
      </aside>
    </header>
    ${renderFutureLiveBrief(liveBrief, `${industry.label} 30분 동향`)}
    <div class="future-plain">
      <span>한 문장으로 쉽게</span>
      <strong>${escapeHtml(industry.plain)}</strong>
    </div>
    <div class="future-intel-rail">
      <div>
        <span>연결 기업</span>
        <strong>${companies.length}개</strong>
        <p>한국 ${koreaCount} · 해외 ${companies.length - koreaCount}</p>
      </div>
      <div>
        <span>체력 선두</span>
        <strong>${escapeHtml(strongest.name)}</strong>
        <p>${getHealthScore(strongest)}점 · ${getHealthGrade(getHealthScore(strongest))}</p>
      </div>
      <div>
        <span>성장 선두</span>
        <strong>${escapeHtml(fastest.name)}</strong>
        <p>최근 연간 매출 ${formatGrowth(fastest.revenueGrowth)}</p>
      </div>
      <div>
        <span>먼저 볼 숫자</span>
        <strong>${escapeHtml(industry.signals[0])}</strong>
        <p>${escapeHtml(industry.signals[1])}</p>
      </div>
    </div>
    <div class="future-forces">
      <section>
        <span>성장을 만드는 힘</span>
        <ul>${industry.drivers.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </section>
      <section>
        <span>성장을 막을 수 있는 병목</span>
        <ul>${industry.bottlenecks.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </section>
    </div>
    <section class="future-value-chain">
      <div><span>돈이 이동하는 순서</span><strong>가치사슬</strong></div>
      <ol>
        ${industry.valueChain.map((item, index) => `
          <li><i>${String(index + 1).padStart(2, "0")}</i><strong>${escapeHtml(item)}</strong></li>
        `).join("")}
      </ol>
    </section>
    <div class="future-korea">
      <span>한국의 자리</span>
      <p>${escapeHtml(industry.korea)}</p>
    </div>
    <details class="future-deep-read">
      <summary>${escapeHtml(industry.label)} 전체 해설 펼치기</summary>
      <div>
        ${industry.deepDive.map((section) => `
          <article>
            <strong>${escapeHtml(section.title)}</strong>
            <p>${escapeHtml(section.body)}</p>
          </article>
        `).join("")}
      </div>
      <footer>
        <span>앞으로 확인할 숫자</span>
        ${industry.signals.map((signal) => `<em>${escapeHtml(signal)}</em>`).join("")}
      </footer>
    </details>
  `;
}

function getFilteredCompanies(industry) {
  const query = viewState.query.toLocaleLowerCase("ko");
  const companies = getIndustryCompanies(industry).filter((company) => {
    const regionMatches =
      viewState.region === "all"
      || (viewState.region === "korea" && company.country === "한국")
      || (viewState.region === "global" && company.country !== "한국");
    if (!regionMatches) return false;
    if (!query) return true;
    const searchable = [
      company.name,
      company.ticker,
      company.country,
      company.role,
      company.business
    ].join(" ").toLocaleLowerCase("ko");
    return searchable.includes(query);
  });

  return companies.sort((a, b) => {
    if (viewState.sort === "growth") return b.revenueGrowth - a.revenueGrowth;
    if (viewState.sort === "margin") return b.margin - a.margin;
    if (viewState.sort === "name") return a.name.localeCompare(b.name, "ko");
    return getHealthScore(b) - getHealthScore(a);
  });
}

function renderCompanyWorkspace(industry) {
  if (!industry || !elements.companyList) return;
  const allCompanies = getIndustryCompanies(industry);
  const companies = getFilteredCompanies(industry);

  if (elements.companyCount) {
    elements.companyCount.textContent = `${companies.length}/${allCompanies.length}개 표시 · 공식 실적 기준`;
  }

  elements.regionControl?.querySelectorAll("[data-future-region]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.futureRegion === viewState.region));
  });
  if (elements.companySort) elements.companySort.value = viewState.sort;

  renderCompanyRadar(companies);
  if (!companies.length) {
    elements.companyList.innerHTML = `
      <div class="future-company-empty">
        <strong>조건에 맞는 기업이 없습니다.</strong>
        <p>검색어 또는 지역 필터를 바꿔보세요.</p>
      </div>
    `;
  } else {
    elements.companyList.replaceChildren(
      ...companies.map((company) => renderCompanyCard(company, industry))
    );
  }
  requestAnimationFrame(updateChapterHeight);
}

function renderCompanyRadar(companies) {
  if (!elements.companyRadar) return;
  if (!companies.length) {
    elements.companyRadar.innerHTML = "";
    elements.companyRadar.hidden = true;
    return;
  }

  elements.companyRadar.hidden = false;
  elements.companyRadar.innerHTML = `
    <header>
      <div>
        <span>COMPANY SIGNAL BOARD</span>
        <h4>사업체력·성장 신호</h4>
      </div>
      <p>점수는 기업가치나 주가가 아니라 최근 실적과 경쟁 위치를 비교합니다.</p>
    </header>
    <div class="future-radar-labels" aria-hidden="true">
      <span>기업</span><span>사업체력</span><span>매출 변화</span><span>수익성 지표</span>
    </div>
    <div class="future-radar-rows">
      ${companies.map((company) => {
        const score = getHealthScore(company);
        return `
          <div class="future-radar-row" data-tone="${getHealthTone(score)}">
            <div>
              <strong>${escapeHtml(company.name)}</strong>
              <span>${escapeHtml(company.ticker)} · ${escapeHtml(company.country)}</span>
            </div>
            <div class="future-radar-score">
              <i><b style="width:${score}%"></b></i>
              <strong>${score}</strong>
            </div>
            <strong data-direction="${company.revenueGrowth >= 0 ? "up" : "down"}">${formatGrowth(company.revenueGrowth)}</strong>
            <span>${numberFormatter.format(company.margin)}%</span>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderCompanyCard(company, contextIndustry) {
  const score = getHealthScore(company);
  const selected = viewState.compareIds.includes(company.id);
  const compareFull = viewState.compareIds.length >= MAX_COMPARE && !selected;
  const card = document.createElement("article");
  card.className = "future-company-card";
  card.dataset.tone = getHealthTone(score);
  card.dataset.companyId = company.id;
  card.innerHTML = `
    <header>
      <div class="future-company-name">
        <span>${escapeHtml(company.country)} · ${escapeHtml(getCompanyRole(company, contextIndustry))}</span>
        <strong>${escapeHtml(company.name)}</strong>
        <em>${escapeHtml(company.ticker)}</em>
      </div>
      <button type="button" data-future-compare="${escapeHtml(company.id)}" aria-pressed="${selected}" ${compareFull ? "disabled" : ""} title="${compareFull ? "비교는 최대 4개까지 가능합니다" : ""}">
        <i aria-hidden="true">${selected ? "✓" : "+"}</i>
        <span>${selected ? "담김" : "비교"}</span>
      </button>
    </header>
    <div class="future-company-metrics">
      <div><span>연간 매출</span><strong>${escapeHtml(company.revenue)}</strong></div>
      <div data-direction="${company.revenueGrowth >= 0 ? "up" : "down"}"><span>매출 변화</span><strong>${formatGrowth(company.revenueGrowth)}</strong></div>
      <div><span>수익성 지표</span><strong>${numberFormatter.format(company.margin)}%</strong></div>
      <div class="future-score-cell"><span>사업체력</span><strong>${score}<em>/100 · ${getHealthGrade(score)}</em></strong></div>
    </div>
    <div class="future-company-scoreline" data-tone="${getHealthTone(score)}"><i><b style="width:${score}%"></b></i></div>
    <p class="future-company-business">${escapeHtml(company.business)}</p>
    <details>
      <summary>사업구조·강점·위험 자세히 보기</summary>
      <div class="future-company-detail">
        <section><span>현금·재무 신호</span><p>${escapeHtml(company.cashSignal)}</p></section>
        <section><span>단단한 이유</span><p>${escapeHtml(company.moat)}</p></section>
        <section><span>약해질 수 있는 지점</span><p>${escapeHtml(company.risk)}</p></section>
      </div>
      <div class="future-score-parts">
        ${futureIndustryMethod.parts.map((part) => `
          <div>
            <span>${escapeHtml(part.label)}</span>
            <i><b style="width: ${company.healthParts[part.id] * 4}%"></b></i>
            <strong>${company.healthParts[part.id]}/25</strong>
          </div>
        `).join("")}
      </div>
      <div class="future-company-watch">
        <span>다음 실적에서 확인</span>
        <ul>${company.watch.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </div>
    </details>
    <footer class="future-company-source">
      <span>${escapeHtml(company.fiscal)}</span>
      <a href="${escapeHtml(company.source.url)}" target="_blank" rel="noopener noreferrer">
        공식 원문 <i aria-hidden="true">↗</i>
      </a>
    </footer>
  `;
  return card;
}

function renderComparison() {
  if (!elements.compare || !elements.compareCount) return;
  const selected = viewState.compareIds.map((id) => companyById.get(id)).filter(Boolean);
  elements.compareCount.textContent = `${selected.length}/${MAX_COMPARE}개 선택`;

  if (!selected.length) {
    elements.compare.innerHTML = `
      <div class="future-compare-empty">
        <strong>비교할 기업을 담아보세요.</strong>
        <p>산업별 기업 카드에서 최대 4개를 선택할 수 있습니다.</p>
      </div>
    `;
    return;
  }

  elements.compare.innerHTML = `
    <div class="future-compare-note">
      매출은 통화와 회계연도가 달라 금액 순위를 매기지 않습니다. 성장률·수익성 기준·현금 신호를 함께 보세요.
    </div>
    <div class="future-compare-grid" style="--future-compare-columns: ${selected.length}">
      ${selected.map((company) => renderComparisonCard(company)).join("")}
    </div>
  `;
}

function renderComparisonCard(company) {
  const score = getHealthScore(company);
  return `
    <article data-tone="${getHealthTone(score)}">
      <header>
        <div>
          <span>${escapeHtml(getCompanyRole(company))}</span>
          <strong>${escapeHtml(company.name)}</strong>
          <em>${escapeHtml(company.fiscal)}</em>
        </div>
        <button type="button" data-future-remove="${escapeHtml(company.id)}" aria-label="${escapeHtml(company.name)} 비교에서 제거" title="비교에서 제거">×</button>
      </header>
      <dl>
        <div><dt>연간 매출</dt><dd>${escapeHtml(company.revenue)}</dd></div>
        <div><dt>매출 변화</dt><dd data-direction="${company.revenueGrowth >= 0 ? "up" : "down"}">${formatGrowth(company.revenueGrowth)}</dd></div>
        <div><dt>수익성 기준</dt><dd>${escapeHtml(company.profitability)}</dd></div>
        <div><dt>현금·재무</dt><dd>${escapeHtml(company.cashSignal)}</dd></div>
        <div><dt>사업체력</dt><dd><b>${score}</b>/100 · ${getHealthGrade(score)}</dd></div>
      </dl>
    </article>
  `;
}

function renderClimateBusinessLab() {
  if (!elements.climateLab) return;
  const selectedPhase = climateBusinessFramework.phases.find((phase) => phase.id === viewState.climatePhase)
    || climateBusinessFramework.phases[0];
  const opportunities = climateBusinessFramework.opportunities.filter((item) => (
    selectedPhase.id === "all" || item.phase === selectedPhase.id
  ));
  const phaseById = new Map(climateBusinessFramework.phases.map((phase) => [phase.id, phase]));

  elements.climateLab.innerHTML = `
    <header class="climate-business-head">
      <div>
        <span>기후 대응 미래사업</span>
        <h3>${escapeHtml(climateBusinessFramework.title)}</h3>
        <p>${escapeHtml(climateBusinessFramework.description)}</p>
      </div>
      <aside>
        <strong>${climateBusinessFramework.opportunities.length}개</strong>
        <span>사업 구조 분석</span>
      </aside>
    </header>
    <div class="climate-phase-guide">
      ${climateBusinessFramework.phases.filter((phase) => phase.id !== "all").map((phase, index) => `
        <div data-phase="${escapeHtml(phase.id)}">
          <i>${String(index + 1).padStart(2, "0")}</i>
          <span>${escapeHtml(phase.label)}</span>
          <strong>${escapeHtml(phase.short)}</strong>
          <p>${escapeHtml(phase.description)}</p>
        </div>
      `).join("")}
    </div>
    <div class="climate-filter-row" role="tablist" aria-label="기후 대응 사업 단계">
      ${climateBusinessFramework.phases.map((phase) => `
        <button type="button" role="tab" data-climate-phase="${escapeHtml(phase.id)}" aria-selected="${phase.id === selectedPhase.id}">
          ${escapeHtml(phase.label)}
          <span>${phase.id === "all" ? climateBusinessFramework.opportunities.length : climateBusinessFramework.opportunities.filter((item) => item.phase === phase.id).length}</span>
        </button>
      `).join("")}
    </div>
    <div class="climate-filter-context">
      <strong>${escapeHtml(selectedPhase.short)}</strong>
      <p>${escapeHtml(selectedPhase.description)}</p>
    </div>
    <div class="climate-opportunity-grid">
      ${opportunities.map((opportunity) => {
        const phase = phaseById.get(opportunity.phase);
        return `
          <article class="climate-opportunity-card" data-phase="${escapeHtml(opportunity.phase)}">
            <header>
              <div>
                <span>${escapeHtml(opportunity.category)}</span>
                <h4>${escapeHtml(opportunity.title)}</h4>
              </div>
              <em>${escapeHtml(phase?.label || "")}</em>
            </header>
            <p class="climate-opportunity-plain">${escapeHtml(opportunity.plain)}</p>
            <dl>
              <div><dt>누가 사나</dt><dd>${escapeHtml(opportunity.buyers)}</dd></div>
              <div><dt>어떻게 버나</dt><dd>${escapeHtml(opportunity.revenueModel)}</dd></div>
              <div><dt>사업 시계</dt><dd>${escapeHtml(opportunity.horizon)} · 투자부담 ${escapeHtml(opportunity.capital)}</dd></div>
            </dl>
            <details>
              <summary>수요·경쟁력·위험 자세히 보기</summary>
              <div class="climate-opportunity-detail">
                <section><span>수요가 커지는 신호</span><p>${escapeHtml(opportunity.demandTrigger)}</p></section>
                <section><span>오래 버틸 경쟁력</span><p>${escapeHtml(opportunity.moat)}</p></section>
                <section><span>한국의 기회</span><p>${escapeHtml(opportunity.korea)}</p></section>
                <section class="climate-opportunity-lists">
                  <div><span>확인할 숫자</span><ul>${opportunity.kpis.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>
                  <div><span>실패할 수 있는 지점</span><ul>${opportunity.risks.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>
                </section>
                <aside><span>처음 볼 것</span><p>${escapeHtml(opportunity.firstStep)}</p></aside>
              </div>
            </details>
          </article>
        `;
      }).join("")}
    </div>
    <footer class="climate-business-caution">
      <strong>사업성을 볼 때 주의</strong>
      <ul>${climateBusinessFramework.cautions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </footer>
  `;
}

function renderMethod() {
  if (!elements.method) return;
  elements.method.innerHTML = `
    <p>${escapeHtml(futureIndustryMethod.description)}</p>
    <div class="future-method-parts">
      ${futureIndustryMethod.parts.map((part) => `
        <section>
          <span>25점</span>
          <strong>${escapeHtml(part.label)}</strong>
          <p>${escapeHtml(part.detail)}</p>
        </section>
      `).join("")}
    </div>
    <aside>${escapeHtml(futureIndustryMethod.caution)}</aside>
  `;
}

function renderFutureUpdateLabel(view = viewState.view) {
  if (!elements.update) return;
  const staticDate = view === "outlook"
    ? outlookController?.updatedAt
    : futureIndustryMethod.updatedAt;
  const newsAt = viewState.snapshot?.dataQuality?.newsFetchedAt;
  const liveLabel = newsAt
    ? ` · 동향 ${formatLiveDate(newsAt)} · ${Number(viewState.snapshot?.dataQuality?.newsRefreshMinutes) || 30}분 확인`
    : " · 동향 수집 확인 중";
  elements.update.textContent = `${String(staticDate || "").replaceAll("-", ".")} 검증 기준${liveLabel}`;
}

function renderFutureLiveBrief(brief, title) {
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
    <section class="future-live-brief" data-status="${escapeHtml(current.status)}">
      <header>
        <div>
          <span>LIVE INDUSTRY WATCH</span>
          <strong>${escapeHtml(title)}</strong>
        </div>
        <aside>
          <b>${escapeHtml(statusLabels[current.status] || "확인 중")}</b>
          <time datetime="${escapeHtml(current.fetchedAt || "")}">${current.fetchedAt ? formatLiveDate(current.fetchedAt) : "기준시각 없음"}</time>
          <em>${Number(current.refreshMinutes) || 30}분 확인 · ${Number(current.count) || 0}건 연결</em>
        </aside>
      </header>
      <p>${escapeHtml(current.summary)}</p>
      ${current.transmission ? `<div class="future-live-path"><span>사업 전달 경로</span><strong>${escapeHtml(current.transmission)}</strong></div>` : ""}
      ${headlines.length ? `
        <div class="future-live-links">
          ${headlines.map((headline) => `
            <a href="${escapeHtml(safeExternalUrl(headline.url))}" target="_blank" rel="noopener noreferrer">
              <span>${escapeHtml(headline.source || "출처 미확인")} · ${formatLiveDate(headline.publishedAt, "게시일 미확인")}</span>
              <strong>${escapeHtml(headline.title)}</strong>
            </a>
          `).join("")}
        </div>
      ` : ""}
      <small>뉴스 동향은 장기 전망이나 기업 실적을 자동 확정하지 않습니다. 공식 자료가 바뀔 때 기준 수치를 별도로 수정합니다.</small>
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
function getCompanyRole(company, contextIndustry = null) {
  if (company.role) return company.role;
  return contextIndustry?.shortLabel || industryById.get(company.sectorId)?.shortLabel || "미래산업";
}

function getHealthScore(company) {
  return Object.values(company.healthParts).reduce((sum, value) => sum + value, 0);
}

function getHealthGrade(score) {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B+";
  if (score >= 60) return "B";
  return "C";
}

function getHealthTone(score) {
  if (score >= 85) return "strong";
  if (score >= 65) return "watch";
  return "fragile";
}

function formatGrowth(value) {
  return `${value > 0 ? "+" : ""}${numberFormatter.format(value)}%`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
