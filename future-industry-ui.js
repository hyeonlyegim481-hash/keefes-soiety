import { climateBusinessFramework } from "./climate-business-data.js?v=72";
import { futureCompanies, futureIndustries, futureIndustryMethod } from "./future-industry-data.js?v=72";

const numberFormatter = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 1 });
const companyById = new Map(futureCompanies.map((company) => [company.id, company]));
const industryById = new Map(futureIndustries.map((industry) => [industry.id, industry]));

const viewState = {
  sector: "ai-chips",
  climatePhase: "all",
  compareIds: ["nvidia", "sk-hynix", "microsoft"]
};

let updateChapterHeight = () => {};

const elements = {
  update: document.querySelector("#futureUpdate"),
  summary: document.querySelector("#futureSummary"),
  climateLab: document.querySelector("#climateBusinessLab"),
  industryTabs: document.querySelector("#futureIndustryTabs"),
  story: document.querySelector("#futureStory"),
  companyCount: document.querySelector("#futureCompanyCount"),
  companyList: document.querySelector("#futureCompanyList"),
  compareCount: document.querySelector("#futureCompareCount"),
  compare: document.querySelector("#futureCompare"),
  method: document.querySelector("#futureMethod")
};

export function initFutureIndustryChapter({ updateHeight = () => {} } = {}) {
  updateChapterHeight = updateHeight;

  elements.climateLab?.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-climate-phase]");
    if (!button) return;
    viewState.climatePhase = button.dataset.climatePhase;
    renderClimateBusinessLab();
    requestAnimationFrame(updateChapterHeight);
  });

  elements.industryTabs.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-future-sector]");
    if (!button) return;
    viewState.sector = button.dataset.futureSector;
    renderFutureIndustryChapter();
  });

  elements.companyList.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-future-compare]");
    if (!button) return;
    const companyId = button.dataset.futureCompare;
    viewState.compareIds = viewState.compareIds.includes(companyId)
      ? viewState.compareIds.filter((id) => id !== companyId)
      : [...viewState.compareIds.slice(-2), companyId];
    renderFutureIndustryChapter();
  });

  renderFutureIndustryChapter();
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

function renderFutureIndustryChapter() {
  const industry = industryById.get(viewState.sector) || futureIndustries[0];
  const companies = industry.companyIds.map((id) => companyById.get(id)).filter(Boolean);

  elements.update.textContent = `${futureIndustryMethod.updatedAt.replaceAll("-", ".")} 기준`;
  elements.summary.innerHTML = `
    <div>
      <span>분석 범위</span>
      <strong>${futureIndustries.length}개 산업 + 기후사업 ${climateBusinessFramework.opportunities.length}개</strong>
      <p>성장 이유·고객·매출 구조와 병목을 연결</p>
    </div>
    <div>
      <span>기업 스냅샷</span>
      <strong>${futureCompanies.length}개 기업</strong>
      <p>공식 FY2025·FY2026 실적 기준</p>
    </div>
    <div>
      <span>비교 원칙</span>
      <strong>원 통화 유지</strong>
      <p>성장률·수익성·현금 신호를 분리</p>
    </div>
  `;

  renderClimateBusinessLab();

  elements.industryTabs.replaceChildren(
    ...futureIndustries.map((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.role = "tab";
      button.dataset.futureSector = item.id;
      button.setAttribute("aria-selected", String(item.id === industry.id));
      button.innerHTML = `<span>${escapeHtml(item.eyebrow)}</span><strong>${escapeHtml(item.shortLabel)}</strong>`;
      return button;
    })
  );

  elements.story.innerHTML = renderIndustryStory(industry);
  elements.companyCount.textContent = `${companies.length}개 기업 · 자세히 펼쳐보기`;
  elements.companyList.replaceChildren(...companies.map((company) => renderCompanyCard(company)));
  renderComparison();
  renderMethod();
  requestAnimationFrame(updateChapterHeight);
}

function renderIndustryStory(industry) {
  return `
    <header class="future-story-head">
      <div>
        <span>${escapeHtml(industry.eyebrow)}</span>
        <h3>${escapeHtml(industry.label)}</h3>
        <p>${escapeHtml(industry.thesis)}</p>
      </div>
      <aside>
        <span>현재 단계</span>
        <strong>${escapeHtml(industry.stage)}</strong>
        <em>관찰 기간 · ${escapeHtml(industry.horizon)}</em>
      </aside>
    </header>
    <div class="future-plain">
      <span>한 문장으로 쉽게</span>
      <strong>${escapeHtml(industry.plain)}</strong>
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

function renderCompanyCard(company) {
  const industry = industryById.get(company.sectorId);
  const score = getHealthScore(company);
  const selected = viewState.compareIds.includes(company.id);
  const card = document.createElement("article");
  card.className = "future-company-card";
  card.dataset.tone = getHealthTone(score);
  card.innerHTML = `
    <header>
      <div class="future-company-name">
        <span>${escapeHtml(company.country)} · ${escapeHtml(industry?.shortLabel || "")}</span>
        <strong>${escapeHtml(company.name)}</strong>
        <em>${escapeHtml(company.ticker)} · ${escapeHtml(company.fiscal)}</em>
      </div>
      <button type="button" data-future-compare="${escapeHtml(company.id)}" aria-pressed="${selected}">
        ${selected ? "비교 빼기" : "비교 담기"}
      </button>
    </header>
    <div class="future-company-metrics">
      <div><span>연간 매출</span><strong>${escapeHtml(company.revenue)}</strong></div>
      <div data-direction="${company.revenueGrowth >= 0 ? "up" : "down"}"><span>매출 성장</span><strong>${formatGrowth(company.revenueGrowth)}</strong></div>
      <div><span>영업수익성</span><strong>${numberFormatter.format(company.margin)}%</strong></div>
      <div class="future-score-cell"><span>사업체력</span><strong>${score}<em>/100 · ${getHealthGrade(score)}</em></strong></div>
    </div>
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
      <a href="${escapeHtml(company.source.url)}" target="_blank" rel="noopener noreferrer">
        ${escapeHtml(company.source.label)} <span aria-hidden="true">↗</span>
      </a>
    </details>
  `;
  return card;
}

function renderComparison() {
  const selected = viewState.compareIds.map((id) => companyById.get(id)).filter(Boolean);
  elements.compareCount.textContent = `${selected.length}/3개 선택`;

  if (!selected.length) {
    elements.compare.innerHTML = `
      <div class="future-compare-empty">
        <strong>비교할 기업을 담아보세요.</strong>
        <p>산업별 기업의 비교 담기 버튼으로 최대 3개를 나란히 볼 수 있습니다.</p>
      </div>
    `;
    return;
  }

  elements.compare.innerHTML = `
    <div class="future-compare-note">
      매출액은 통화와 회계연도가 달라 직접 순위를 매기지 않습니다. 성장률·수익성과 현금 신호를 함께 보세요.
    </div>
    <div class="future-compare-grid" style="--future-compare-columns: ${selected.length}">
      ${selected.map((company) => renderComparisonCard(company)).join("")}
    </div>
  `;
}

function renderComparisonCard(company) {
  const score = getHealthScore(company);
  const industry = industryById.get(company.sectorId);
  return `
    <article data-tone="${getHealthTone(score)}">
      <header>
        <span>${escapeHtml(industry?.shortLabel || "")}</span>
        <strong>${escapeHtml(company.name)}</strong>
        <em>${escapeHtml(company.fiscal)}</em>
      </header>
      <dl>
        <div><dt>연간 매출</dt><dd>${escapeHtml(company.revenue)}</dd></div>
        <div><dt>매출 성장</dt><dd data-direction="${company.revenueGrowth >= 0 ? "up" : "down"}">${formatGrowth(company.revenueGrowth)}</dd></div>
        <div><dt>영업수익성</dt><dd>${escapeHtml(company.profitability)}</dd></div>
        <div><dt>현금·재무</dt><dd>${escapeHtml(company.cashSignal)}</dd></div>
        <div><dt>사업체력</dt><dd><b>${score}</b>/100 · ${getHealthGrade(score)}</dd></div>
      </dl>
    </article>
  `;
}

function renderMethod() {
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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
