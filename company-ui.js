import { renderCompanyBalanceSheet } from "./company-balance-sheet-ui.js";
import {
  futureCompanies,
  futureIndustryMethod
} from "./future-industry-data.js";
import {
  companyIndustryCatalog,
  getCompanyIndustry,
  getCompanyIndustryId
} from "./company-industry-data.js";
import {
  readUrlState,
  subscribeUrlState,
  syncUrlState
} from "./url-state.js";

const DEFAULT_COMPANY_ID = "samsung-electronics";
const COMPANY_VIEWS = new Set(["overview", "chart", "financials", "news"]);
const COMPANY_REGIONS = new Set(["all", "korea", "global"]);
const COMPANY_PERIODS = Object.freeze([
  { id: "1m", label: "1개월", days: 31 },
  { id: "3m", label: "3개월", days: 93 },
  { id: "6m", label: "6개월", days: 186 },
  { id: "1y", label: "1년", days: 366 },
  { id: "3y", label: "3년", days: 1_098 },
  { id: "5y", label: "5년", days: 1_830 }
]);

const companyById = new Map(futureCompanies.map((company) => [company.id, company]));
const initialUrlState = readUrlState();
const initialCompanyId = companyById.has(initialUrlState.company)
  ? initialUrlState.company
  : DEFAULT_COMPANY_ID;

const viewState = {
  companyId: initialCompanyId,
  view: COMPANY_VIEWS.has(initialUrlState.companyView) ? initialUrlState.companyView : "overview",
  period: "1y",
  query: "",
  region: "all",
  sector: "all",
  quoteCache: new Map(),
  quoteRequests: new Map(),
  snapshot: null
};

let root = null;
let updateChapterHeight = () => {};
let openProfile = () => {};
let unsubscribeUrlState = () => {};
let resizeFrame = 0;

const numberFormatter = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 });
const integerFormatter = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "short",
  day: "numeric"
});
const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});

export function initCompanyChapter({
  updateHeight = () => {},
  getSnapshot = () => null,
  onOpenProfile = () => {}
} = {}) {
  root = document.querySelector("#companyWorkspace");
  if (!root) throw new Error("Company workspace root is missing");
  updateChapterHeight = updateHeight;
  openProfile = onOpenProfile;
  viewState.snapshot = getSnapshot();
  bindCompanyEvents();
  unsubscribeUrlState();
  unsubscribeUrlState = subscribeUrlState((urlState) => {
    if (urlState.chapter !== "companies") return;
    applyCompanyUrlState(urlState);
  });
  renderCompanyChapter();
  void ensureCompanyQuote(viewState.companyId);

  return {
    updateSnapshot(snapshot) {
      viewState.snapshot = snapshot;
      renderCompanyDetail();
    },
    openCompany(companyId, companyView = viewState.view) {
      if (!companyById.has(companyId)) return false;
      selectCompany(companyId, companyView);
      return true;
    },
    applyUrlState: applyCompanyUrlState,
    getUrlState() {
      return {
        chapter: "companies",
        company: viewState.companyId,
        companyView: viewState.view
      };
    }
  };
}

function bindCompanyEvents() {
  root.addEventListener("input", (event) => {
    if (!event.target.matches("[data-company-search]")) return;
    viewState.query = event.target.value;
    renderCompanyBrowser();
  });
  root.addEventListener("change", (event) => {
    if (event.target.matches("[data-company-sector]")) {
      viewState.sector = event.target.value;
      renderCompanyBrowser();
    }
  });
  root.addEventListener("click", (event) => {
    const companyButton = event.target.closest?.("[data-company-id]");
    if (companyButton) {
      selectCompany(companyButton.dataset.companyId, viewState.view);
      return;
    }
    const viewButton = event.target.closest?.("[data-company-view]");
    if (viewButton) {
      setCompanyView(viewButton.dataset.companyView);
      return;
    }
    const periodButton = event.target.closest?.("[data-company-period]");
    if (periodButton) {
      setCompanyPeriod(periodButton.dataset.companyPeriod);
      return;
    }
    const regionButton = event.target.closest?.("[data-company-region]");
    if (regionButton) {
      setCompanyRegion(regionButton.dataset.companyRegion);
      return;
    }
    if (event.target.closest?.("[data-company-profile]")) {
      openProfile();
      return;
    }
    if (event.target.closest?.("[data-company-retry]")) {
      viewState.quoteCache.delete(viewState.companyId);
      void ensureCompanyQuote(viewState.companyId, { force: true });
    }
  });
  window.addEventListener("resize", scheduleChartDraw, { passive: true });
}

function selectCompany(companyId, companyView = "overview") {
  if (!companyById.has(companyId)) return;
  viewState.companyId = companyId;
  viewState.view = COMPANY_VIEWS.has(companyView) ? companyView : "overview";
  syncUrlState(
    { chapter: "companies", company: companyId, companyView: viewState.view },
    { mode: "push", source: "company-select" }
  );
  renderCompanyChapter();
  void ensureCompanyQuote(companyId);
}

function setCompanyView(view) {
  if (!COMPANY_VIEWS.has(view)) return;
  viewState.view = view;
  syncUrlState(
    { chapter: "companies", company: viewState.companyId, companyView: view },
    { mode: "push", source: "company-view" }
  );
  renderCompanyDetail();
}

function applyCompanyUrlState(urlState = {}) {
  const companyId = companyById.has(urlState.company)
    ? urlState.company
    : DEFAULT_COMPANY_ID;
  const companyView = COMPANY_VIEWS.has(urlState.companyView)
    ? urlState.companyView
    : "overview";
  const changed = companyId !== viewState.companyId || companyView !== viewState.view;
  viewState.companyId = companyId;
  viewState.view = companyView;
  if (!changed) return;
  renderCompanyChapter();
  void ensureCompanyQuote(companyId);
}

function renderCompanyChapter() {
  root.innerHTML = `
    <div class="company-terminal">
      <header class="company-terminal-head">
        <div>
          <p class="section-kicker">COMPANY TERMINAL</p>
          <h2>기업을 실적·가격·사업으로 함께 보기</h2>
          <p>${futureCompanies.length}개 기업의 검증된 실적 스냅샷 또는 공식 공시 연결과 선택 종목 시세를 분리해 확인합니다.</p>
        </div>
        <button type="button" class="company-watch-button" data-company-profile>
          <span aria-hidden="true">＋</span><strong>관심 기업 설정</strong>
        </button>
      </header>
      <div class="company-terminal-grid">
        <aside class="company-browser" aria-label="기업 찾기">
          <div class="company-browser-controls">
            <label class="company-search-field">
              <span>기업명·종목코드 검색</span>
              <input type="search" data-company-search value="${escapeHtml(viewState.query)}" placeholder="삼성전자, NVDA, 반도체" autocomplete="off" />
            </label>
            <select data-company-sector aria-label="산업 선택">
              <option value="all">모든 산업</option>
              ${companyIndustryCatalog.map((industry) => `<option value="${escapeHtml(industry.id)}" ${viewState.sector === industry.id ? "selected" : ""}>${escapeHtml(industry.label)}</option>`).join("")}
            </select>
          </div>
          <div class="company-region-switch" role="group" aria-label="기업 지역">
            ${[
              ["all", "전체"],
              ["korea", "한국"],
              ["global", "해외"]
            ].map(([id, label]) => `<button type="button" data-company-region="${id}" aria-pressed="${viewState.region === id}">${label}</button>`).join("")}
          </div>
          <div class="company-browser-summary" id="companyBrowserSummary"></div>
          <div class="company-browser-list" id="companyBrowserList"></div>
        </aside>
        <section class="company-detail" id="companyDetail" aria-live="polite"></section>
      </div>
    </div>
  `;
  renderCompanyBrowser();
  renderCompanyDetail();
  requestAnimationFrame(updateChapterHeight);
}

function getFilteredCompanies() {
  const query = normalizeText(viewState.query);
  return futureCompanies
    .filter((company) => {
      if (viewState.region === "korea" && company.country !== "한국") return false;
      if (viewState.region === "global" && company.country === "한국") return false;
      if (viewState.sector !== "all" && getCompanyIndustryId(company) !== viewState.sector) return false;
      if (!query) return true;
      const industry = getCompanyIndustry(company);
      return normalizeText([
        company.name,
        company.ticker,
        company.country,
        company.role,
        company.business,
        industry?.label
      ].join(" ")).includes(query);
    })
    .sort((left, right) => {
      const leftKorea = left.country === "한국" ? 0 : 1;
      const rightKorea = right.country === "한국" ? 0 : 1;
      return leftKorea - rightKorea || left.name.localeCompare(right.name, "ko");
    });
}

function setCompanyRegion(region) {
  if (!COMPANY_REGIONS.has(region)) return;
  viewState.region = region;
  renderCompanyBrowser();
}

function syncCompanyRegionControls() {
  root.querySelectorAll("[data-company-region]").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.companyRegion === viewState.region)
    );
  });
}

function renderCompanyBrowser() {
  const list = root.querySelector("#companyBrowserList");
  const summary = root.querySelector("#companyBrowserSummary");
  if (!list || !summary) return;
  syncCompanyRegionControls();
  const companies = getFilteredCompanies();
  summary.innerHTML = `<strong>${companies.length}개</strong><span>시세·공식 공시 연결 기업</span>`;
  if (!companies.length) {
    list.innerHTML = `<div class="company-browser-empty"><strong>검색 결과가 없습니다.</strong><span>검색어나 산업 필터를 바꿔보세요.</span></div>`;
    return;
  }
  list.replaceChildren(...companies.map((company) => {
    const industry = getCompanyIndustry(company);
    const score = getHealthScore(company);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "company-browser-item";
    button.dataset.companyId = company.id;
    button.setAttribute("aria-current", String(company.id === viewState.companyId));
    button.innerHTML = `
      <span class="company-browser-symbol">${escapeHtml(getSymbolMonogram(company))}</span>
      <span class="company-browser-name">
        <strong>${escapeHtml(company.name)}</strong>
        <small>${escapeHtml(company.ticker)} · ${escapeHtml(industry?.shortLabel || company.country)}</small>
      </span>
      <span class="company-browser-score"><strong>${score === null ? "LIVE" : score}</strong><small>${score === null ? "시세" : "체력"}</small></span>
    `;
    return button;
  }));
  const selected = list.querySelector(`[data-company-id="${CSS.escape(viewState.companyId)}"]`);
  if (selected) {
    const centeredTop = selected.offsetTop - list.offsetTop - (list.clientHeight - selected.offsetHeight) / 2;
    list.scrollTop = Math.max(0, centeredTop);
  }
}

function renderCompanyDetail() {
  const detail = root?.querySelector("#companyDetail");
  const company = companyById.get(viewState.companyId);
  if (!detail || !company) return;
  const industry = getCompanyIndustry(company);
  const quoteState = viewState.quoteCache.get(company.id);
  detail.innerHTML = `
    ${renderCompanyIdentity(company, industry, quoteState)}
    <nav class="company-view-tabs" role="tablist" aria-label="기업 상세 보기">
      ${[
        ["overview", "개요", "사업과 핵심 수치"],
        ["chart", "차트·시세", "최대 5년 흐름"],
        ["financials", "실적·체력", "재무와 비교"],
        ["news", "뉴스·위험", "사건과 확인점"]
      ].map(([id, label, hint]) => `
        <button type="button" role="tab" data-company-view="${id}" aria-selected="${viewState.view === id}">
          <strong>${label}</strong><span>${hint}</span>
        </button>
      `).join("")}
    </nav>
    <div class="company-view-body">
      ${viewState.view === "overview" ? renderOverview(company, industry, quoteState) : ""}
      ${viewState.view === "chart" ? renderChartView(company, quoteState) : ""}
      ${viewState.view === "financials" ? renderFinancials(company, industry, quoteState) : ""}
      ${viewState.view === "news" ? renderNewsAndRisk(company, industry) : ""}
    </div>
  `;
  if (viewState.view === "chart") renderCompanyChart();
  requestAnimationFrame(updateChapterHeight);
}

function renderCompanyIdentity(company, industry, quoteState) {
  const market = quoteState?.data?.market;
  const loading = quoteState?.status === "loading";
  const available = quoteState?.status === "loaded" && quoteState.data?.available && market;
  const movement = available ? formatMovement(market) : null;
  return `
    <header class="company-identity">
      <div class="company-identity-main">
        <span class="company-identity-mark">${escapeHtml(getSymbolMonogram(company))}</span>
        <div>
          <p>${escapeHtml(company.country)} · ${escapeHtml(industry?.label || company.role || "기업")}</p>
          <h3>${escapeHtml(company.name)}</h3>
          <span>${escapeHtml(company.ticker)} · ${escapeHtml(company.role || "사업 설명 준비 중")}</span>
        </div>
      </div>
      <div class="company-quote-glance" data-status="${available ? market.direction : loading ? "loading" : "unavailable"}">
        ${loading
          ? `<span>시세 확인 중</span><strong>불러오는 중</strong><small>선택 종목만 요청합니다.</small>`
          : available
            ? `<span>${escapeHtml(market.marketStateLabel || "시세")}</span><strong>${formatPrice(market.value, market.quoteCurrency || market.unit)}</strong><small>${movement.html}</small>`
            : `<span>시세 자료</span><strong>수집 실패</strong><small>${company.snapshotStatus === "profile-only" ? "사업 설명과 공식 공시 경로는 계속 볼 수 있습니다." : "공식 실적 정보는 계속 볼 수 있습니다."}</small>`}
      </div>
    </header>
  `;
}

function renderOverview(company, industry, quoteState) {
  const score = getHealthScore(company);
  const quote = quoteState?.data;
  return `
    <section class="company-overview-hero">
      <div>
        <span>이 회사는 무엇으로 버는가</span>
        <h4>${escapeHtml(company.business)}</h4>
      </div>
      <div class="company-overview-score" data-tone="${getHealthTone(score)}">
        <span>${score === null ? "실적 검증" : "사업체력"}</span><strong>${score === null ? "대기" : `${score}<small>/100</small>`}</strong><p>${escapeHtml(getHealthGrade(score))}${score === null ? "" : " · 교육용 비교 점수"}</p>
      </div>
    </section>
    <dl class="company-key-metrics">
      <div><dt>최근 매출</dt><dd>${escapeHtml(company.revenue)}</dd><small>${escapeHtml(company.fiscal)}</small></div>
      <div><dt>매출 변화</dt><dd data-tone="${getMetricTone(company.revenueGrowth)}">${formatSignedPercent(company.revenueGrowth)}</dd><small>${hasMetricValue(company.revenueGrowth) ? "직전 비교기간 대비" : "검증된 수치만 표시"}</small></div>
      <div><dt>수익성</dt><dd>${formatStaticMargin(company.margin)}</dd><small>${escapeHtml(company.profitability)}</small></div>
      <div><dt>시가총액</dt><dd>${formatFundamentalValue(quote?.fundamentals?.metrics?.marketCap, "amount")}</dd><small>${quote?.fundamentals?.available ? escapeHtml(quote.fundamentals.providerLabel) : "수집 실패 시 임의 계산하지 않음"}</small></div>
    </dl>
    ${renderCompactValuation(quoteState)}
    <div class="company-thesis-grid">
      <article data-kind="moat"><span>경쟁력이 생기는 이유</span><strong>${escapeHtml(company.moat)}</strong></article>
      <article data-kind="risk"><span>가장 먼저 볼 위험</span><strong>${escapeHtml(company.risk)}</strong></article>
    </div>
    ${renderPeerSnapshot(company, industry)}
    <footer class="company-basis-strip">
      <div><span>실적 기준</span><strong>${escapeHtml(company.fiscal)}</strong></div>
      <div><span>공식 원문</span><a href="${escapeHtml(safeUrl(company.source?.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(company.source?.label || "기업 공시")} <i aria-hidden="true">↗</i></a></div>
      <p>시세와 기업 실적의 기준일은 다를 수 있습니다. 시세가 없을 때 실적 수치로 현재 주가를 추정하지 않습니다.</p>
    </footer>
  `;
}

function renderChartView(company, quoteState) {
  if (!quoteState || quoteState.status === "loading") {
    return `<div class="company-data-state" role="status"><span class="company-loading-line"></span><strong>선택한 기업의 장기 시세를 확인하고 있습니다.</strong><p>다른 기업의 시세는 동시에 호출하지 않습니다.</p></div>`;
  }
  if (quoteState.status === "error" || !quoteState.data?.available) {
    const attempts = quoteState.data?.attempts || [];
    return `
      <div class="company-data-state" data-kind="error" role="status">
        <span aria-hidden="true">!</span>
        <strong>현재 시세 자료를 가져오지 못했습니다.</strong>
        <p>가격을 추정하거나 0으로 표시하지 않았습니다. 공식 실적과 사업 분석은 다른 탭에서 계속 확인할 수 있습니다.</p>
        <button type="button" data-company-retry>다시 시도</button>
      </div>
      ${renderProviderDetails(quoteState.data || { attempts, providerPlan: [] })}
    `;
  }
  const payload = quoteState.data;
  const market = payload.market;
  const movement = formatMovement(market);
  return `
    ${payload.warning ? `<div class="company-stale-warning" role="status"><strong>마지막 정상 자료</strong><span>${escapeHtml(payload.warning)}</span></div>` : ""}
    <section class="company-chart-shell">
      <header class="company-chart-head">
        <div>
          <span>최근 차트값</span>
          <strong>${formatPrice(market.value, market.quoteCurrency || market.unit)}</strong>
          <small data-tone="${market.direction}">${movement.text}</small>
        </div>
        <dl>
          <div><dt>이전 종가</dt><dd>${market.changeAvailable ? formatPrice(market.previousClose, market.quoteCurrency || market.unit) : "계산 불가"}</dd></div>
          <div><dt>거래일</dt><dd>${escapeHtml(market.tradingDate || "확인 불가")}</dd></div>
          <div><dt>상태</dt><dd>${escapeHtml(market.marketStateLabel || "확인 불가")}</dd></div>
          <div><dt>제공처</dt><dd>${escapeHtml(market.providerLabel || market.source || "확인 불가")}</dd></div>
        </dl>
      </header>
      <div class="company-period-tabs" role="tablist" aria-label="기업 차트 기간">
        ${COMPANY_PERIODS.map((period) => `<button type="button" role="tab" data-company-period="${period.id}" aria-selected="${viewState.period === period.id}">${period.label}</button>`).join("")}
      </div>
      <div class="company-chart-stage" id="companyChartStage">
        <canvas id="companyChartCanvas" aria-label="${escapeHtml(company.name)} ${escapeHtml(viewState.period)} 가격 차트"></canvas>
        <div class="company-chart-tooltip" id="companyChartTooltip" hidden></div>
      </div>
      <div class="company-chart-caption" id="companyChartCaption"></div>
    </section>
    ${renderProviderDetails(payload)}
  `;
}

function renderCompactValuation(quoteState) {
  const fundamentals = quoteState?.data?.fundamentals;
  const loading = quoteState?.status === "loading";
  const metrics = fundamentals?.metrics || {};
  const items = [
    { label: "PER", metric: metrics.per, kind: "multiple", hint: "TTM 이익 대비" },
    { label: "PBR", metric: metrics.pbr, kind: "multiple", hint: "순자산 대비" },
    { label: "PSR", metric: metrics.psr, kind: "multiple", hint: "TTM 매출 대비" },
    { label: "ROE", metric: metrics.roe, kind: "percent", hint: "자기자본 수익성" }
  ];
  return `
    <section class="company-valuation-strip" data-available="${Boolean(fundamentals?.available)}">
      <header>
        <div><span>VALUATION SNAPSHOT</span><h4>가치평가 바로보기</h4></div>
        <small>${loading ? "기업지표 확인 중" : escapeHtml(fundamentals?.providerLabel || "기업지표 자료 없음")}</small>
      </header>
      <div class="company-valuation-strip-grid">
        ${items.map((item) => `
          <div data-available="${Number.isFinite(item.metric?.value)}">
            <span>${item.label}</span>
            <strong>${loading ? "확인 중" : escapeHtml(formatFundamentalValue(item.metric, item.kind))}</strong>
            <small>${Number.isFinite(item.metric?.value) ? escapeHtml(formatFundamentalBasis(item.metric)) : item.hint}</small>
          </div>
        `).join("")}
      </div>
      ${fundamentals?.warning ? `<p class="company-fundamental-warning">${escapeHtml(fundamentals.warning)}</p>` : ""}
    </section>
  `;
}

function renderDetailedValuation(quoteState) {
  const payload = quoteState?.data || {};
  const fundamentals = payload.fundamentals;
  const metrics = fundamentals?.metrics || {};
  const market = payload.market || {};
  const loading = quoteState?.status === "loading";
  const valuationItems = [
    { label: "시가총액", metric: metrics.marketCap, kind: "amount", hint: "주식시장 전체 가치" },
    { label: "기업가치 EV", metric: metrics.enterpriseValue, kind: "amount", hint: "시총에 순부채 등을 반영" },
    { label: "PER", metric: metrics.per, kind: "multiple", hint: "TTM 이익 대비 주가" },
    { label: "예상 PER", metric: metrics.forwardPer, kind: "multiple", hint: "예상 이익 기준" },
    { label: "PBR", metric: metrics.pbr, kind: "multiple", hint: "순자산 대비 주가" },
    { label: "PSR", metric: metrics.psr, kind: "multiple", hint: "TTM 매출 대비 시총" },
    { label: "ROE", metric: metrics.roe, kind: "percent", hint: "자기자본 수익성" },
    { label: "EPS", metric: metrics.eps, kind: "currency", hint: "주당순이익" },
    { label: "배당수익률", metric: metrics.dividendYield, kind: "percent", hint: "주가 대비 배당" },
    { label: "TTM 매출", metric: metrics.revenueTtm, kind: "amount", hint: "최근 12개월 매출" },
    { label: "TTM 순이익", metric: metrics.netIncomeTtm, kind: "amount", hint: "최근 12개월 지배주주순이익" },
    { label: "이익률", metric: metrics.profitMargin, kind: "percent", hint: "최근 12개월 순이익률" }
  ];
  const tradingItems = [
    { label: "당일 고가", metric: resolveTradingMetric(market, metrics, "dayHigh"), kind: "currency" },
    { label: "당일 저가", metric: resolveTradingMetric(market, metrics, "dayLow"), kind: "currency" },
    { label: "52주 최고", metric: resolveTradingMetric(market, metrics, "week52High"), kind: "currency" },
    { label: "52주 최저", metric: resolveTradingMetric(market, metrics, "week52Low"), kind: "currency" },
    { label: "거래량", metric: resolveTradingMetric(market, metrics, "volume"), kind: "volume" },
    { label: "베타", metric: metrics.beta, kind: "number", hint: "시장 대비 변동성" }
  ];
  const collectedAt = fundamentals?.collectedAt
    ? formatHeadlineDate(fundamentals.collectedAt)
    : "수집시각 없음";
  const sourceUrl = safeUrl(fundamentals?.sourceUrl);
  return `
    <section class="company-valuation-panel" data-available="${Boolean(fundamentals?.available)}">
      <header class="company-valuation-panel-head">
        <div><span>MARKET VALUATION</span><h4>가치평가·시장지표</h4><p>현재 가격과 최근 공표 재무자료의 제공처·기준일을 구분해 표시합니다.</p></div>
        <div><strong>${escapeHtml(fundamentals?.providerLabel || (loading ? "확인 중" : "자료 없음"))}</strong><small>${escapeHtml(collectedAt)}</small></div>
      </header>
      <div class="company-valuation-grid">
        ${valuationItems.map((item) => renderValuationMetric(item, loading)).join("")}
      </div>
      <div class="company-trading-stats">
        <header><strong>가격 범위와 거래</strong><small>시세 제공처 메타데이터 우선</small></header>
        <div>${tradingItems.map((item) => renderValuationMetric(item, loading, true)).join("")}</div>
      </div>
      ${fundamentals?.warning ? `<p class="company-fundamental-warning">${escapeHtml(fundamentals.warning)}</p>` : ""}
      <details class="company-valuation-method">
        <summary>PER·PBR·PSR·ROE 뜻과 계산 기준</summary>
        <dl>
          <div><dt>시가총액</dt><dd>현재 주가에 발행주식 수를 곱한 주식시장의 기업 가치입니다.</dd></div>
          <div><dt>PER</dt><dd>주가 또는 시가총액을 최근 12개월 순이익과 비교합니다. 적자 기업의 음수 PER은 단독 비교에 적합하지 않습니다.</dd></div>
          <div><dt>예상 PER</dt><dd>향후 예상 이익을 사용하므로 실적 전망이 바뀌면 크게 달라질 수 있습니다.</dd></div>
          <div><dt>PBR</dt><dd>주가를 주당순자산과 비교합니다. 금융·자본집약 업종과 무형자산 중심 업종의 의미가 다릅니다.</dd></div>
          <div><dt>PSR</dt><dd>시가총액을 최근 12개월 매출과 비교합니다. 이익이 없는 성장기업도 비교할 수 있지만 수익성을 설명하지는 않습니다.</dd></div>
          <div><dt>ROE</dt><dd>${escapeHtml(metrics.roe?.formula || "TTM 지배주주순이익 ÷ 최근·약 1년 전 평균 자기자본 × 100")}</dd></div>
          <div><dt>기업가치 EV</dt><dd>시가총액에 부채와 현금 등을 반영한 값입니다. 인수 관점의 전체 사업가치 비교에 사용합니다.</dd></div>
          <div><dt>주의</dt><dd>한 비율이 낮다는 이유만으로 저평가라고 단정하지 않습니다. 업종·성장률·회계기준·일회성 손익을 함께 봐야 합니다.</dd></div>
        </dl>
      </details>
      <footer class="company-valuation-source">
        <span>기준: ${escapeHtml(fundamentals?.basisLabel || "제공처별 최신 공표자료")}</span>
        ${sourceUrl !== "#" ? `<a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">원자료 보기 <i aria-hidden="true">↗</i></a>` : ""}
      </footer>
    </section>
  `;
}

function renderValuationMetric(item, loading, compact = false) {
  const available = Number.isFinite(item.metric?.value);
  const value = loading ? "확인 중" : formatFundamentalValue(item.metric, item.kind);
  return `
    <div class="company-valuation-metric" data-available="${available}" data-compact="${compact}">
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${available ? escapeHtml(formatFundamentalBasis(item.metric)) : escapeHtml(item.hint || "제공처 미지원 또는 수집 실패")}</small>
    </div>
  `;
}

function resolveTradingMetric(market, metrics, key) {
  const rawMarketValue = market?.statistics?.[key];
  const marketValue = rawMarketValue === null || rawMarketValue === undefined || rawMarketValue === ""
    ? Number.NaN
    : Number(rawMarketValue);
  if (Number.isFinite(marketValue)) {
    return {
      value: marketValue,
      currency: key === "volume" ? null : market.quoteCurrency || market.unit || null,
      asOf: market.tradingDate || market.asOf || null,
      periodType: key.startsWith("week52") ? "52주" : "당일"
    };
  }
  return metrics?.[key] || null;
}

function renderFinancials(company, industry, quoteState) {
  const score = getHealthScore(company);
  return `
    <section class="company-financial-lead">
      <div>
        <span>최근 공식 실적</span>
        <h4>${escapeHtml(company.fiscal)}</h4>
        <p>통화·회계기준·연결 여부가 다른 기업을 매출액 크기만으로 직접 순위화하지 않습니다.</p>
      </div>
      <div><span>${score === null ? "실적 검증" : "사업체력"}</span><strong>${score === null ? "대기" : score}</strong><small>${escapeHtml(getHealthGrade(score))}</small></div>
    </section>
    ${renderDetailedValuation(quoteState)}
    ${renderCompanyBalanceSheet(quoteState)}
    <div class="company-financial-grid">
      <article><span>매출</span><strong>${escapeHtml(company.revenue)}</strong><p>${formatSignedPercent(company.revenueGrowth)} 변화</p></article>
      <article><span>공표 수익성</span><strong>${formatStaticMargin(company.margin)}</strong><p>${escapeHtml(company.profitability)}</p></article>
      <article><span>현금·재무 신호</span><strong>${escapeHtml(company.cashSignal)}</strong><p>회사별 공표 항목이 달라 같은 정의의 현금흐름은 아닐 수 있습니다.</p></article>
    </div>
    <section class="company-health-method">
      <header><div><span>점수 구성</span><h4>${escapeHtml(futureIndustryMethod.title)}</h4></div><strong>${score === null ? "검증 대기" : `${score}/100`}</strong></header>
      ${score === null
        ? `<div class="company-health-pending"><strong>임의 점수를 만들지 않았습니다.</strong><p>이 기업은 시세·시장 재무지표를 먼저 연결하며, 공식 실적의 회계기준과 현금흐름을 검증한 뒤 사업체력 점수를 제공합니다.</p></div>`
        : `<div class="company-health-parts">${futureIndustryMethod.parts.map((part) => {
            const value = Number(company.healthParts?.[part.id]);
            return `<div><span>${escapeHtml(part.label)}</span><i><b style="width:${Math.min(100, value * 4)}%"></b></i><strong>${value}/25</strong><small>${escapeHtml(part.detail)}</small></div>`;
          }).join("")}</div>`}
      <details>
        <summary>계산 기준과 한계 보기</summary>
        <div><p>${escapeHtml(futureIndustryMethod.description)}</p><p>${escapeHtml(futureIndustryMethod.caution)}</p></div>
      </details>
    </section>
    ${renderPeerComparison(company, industry)}
  `;
}

function renderNewsAndRisk(company, industry) {
  const headlines = matchCompanyHeadlines(company, viewState.snapshot?.headlines || []);
  return `
    <div class="company-risk-layout">
      <section class="company-watchlist-panel">
        <header><span>NEXT CHECK</span><h4>다음 실적에서 확인할 것</h4></header>
        <ol>${company.watch.map((item, index) => `<li><i>${String(index + 1).padStart(2, "0")}</i><strong>${escapeHtml(item)}</strong></li>`).join("")}</ol>
      </section>
      <section class="company-risk-panel">
        <header><span>RISK MAP</span><h4>현재 확인된 핵심 위험</h4></header>
        <p>${escapeHtml(company.risk)}</p>
        <div><span>연결 산업</span><strong>${escapeHtml(industry?.label || company.role)}</strong><small>${escapeHtml(industry?.plain || "산업 설명 준비 중")}</small></div>
      </section>
    </div>
    <section class="company-news-panel">
      <header><div><span>RELATED NEWS</span><h4>${escapeHtml(company.name)} 관련 최근 뉴스</h4></div><small>최근 5일 선별 뉴스 · 제목 직접 일치 또는 기업 ID 연결</small></header>
      ${headlines.length
        ? `<div class="company-news-list">${headlines.map((headline) => `
            <a href="${escapeHtml(safeUrl(headline.url))}" target="_blank" rel="noopener noreferrer">
              <span>${escapeHtml(headline.source || "출처 미확인")} · ${formatHeadlineDate(headline.publishedAt)}</span>
              <strong>${escapeHtml(headline.title)}</strong>
              <small>${escapeHtml(headline.topic || "기업 뉴스")}</small>
            </a>
          `).join("")}</div>`
        : `<div class="company-news-empty"><strong>직접 연결된 최근 뉴스가 없습니다.</strong><p>관련 없는 기사를 억지로 붙이지 않았습니다. 나의 경제에서 관심 기업 최신 요청을 사용하면 해당 기업 검색을 추가로 시도합니다.</p></div>`}
    </section>
    <footer class="company-source-footer">
      <span>기업 설명과 실적</span>
      <a href="${escapeHtml(safeUrl(company.source?.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(company.source?.label || "공식 원문")} <i aria-hidden="true">↗</i></a>
    </footer>
  `;
}

function renderPeerSnapshot(company, industry) {
  const peers = getPeers(company).slice(0, 4);
  return `
    <section class="company-peer-snapshot">
      <header><div><span>동종기업 읽기</span><h4>${escapeHtml(industry?.shortLabel || "같은 산업")} 안에서 비교</h4></div><small>검증된 값만 표시하며 미확인 값은 순위에 쓰지 않습니다.</small></header>
      <div>
        ${peers.map((peer) => {
          const score = getHealthScore(peer);
          return `<button type="button" data-company-id="${escapeHtml(peer.id)}"><span>${escapeHtml(peer.name)}</span><strong>${score === null ? "LIVE" : score}</strong><small>${formatSignedPercent(peer.revenueGrowth)} · 마진 ${formatStaticMargin(peer.margin)}</small></button>`;
        }).join("")}
      </div>
    </section>
  `;
}

function renderPeerComparison(company, industry) {
  const peers = [company, ...getPeers(company).slice(0, 5)]
    .sort((left, right) => compareHealthScores(left, right));
  return `
    <section class="company-peer-table">
      <header><div><span>PEER TABLE</span><h4>${escapeHtml(industry?.label || "동종기업")} 비교</h4></div><small>적정가치나 매수 순위가 아닙니다.</small></header>
      <div class="company-peer-table-scroll">
        <table>
          <thead><tr><th>기업</th><th>사업체력</th><th>매출 변화</th><th>공표 수익성</th><th>실적 기준</th></tr></thead>
          <tbody>${peers.map((peer) => {
            const score = getHealthScore(peer);
            return `
            <tr data-current="${peer.id === company.id}">
              <th><button type="button" data-company-id="${escapeHtml(peer.id)}">${escapeHtml(peer.name)}<small>${escapeHtml(peer.ticker)}</small></button></th>
              <td><strong>${score === null ? "검증 대기" : score}</strong>${score === null ? "" : "/100"}</td>
              <td data-tone="${getMetricTone(peer.revenueGrowth)}">${formatSignedPercent(peer.revenueGrowth)}</td>
              <td>${formatStaticMargin(peer.margin)}<small>${escapeHtml(peer.profitability)}</small></td>
              <td>${escapeHtml(peer.fiscal)}</td>
            </tr>
          `; }).join("")}</tbody>
        </table>
      </div>
    </section>
  `;
}
function renderProviderDetails(payload = {}) {
  const attempts = payload.attempts || [];
  const plan = payload.providerPlan || [];
  const fundamentalAttempts = payload.fundamentalAttempts || [];
  const fundamentalPlan = payload.fundamentalProviderPlan || [];
  return `
    <details class="company-provider-details">
      <summary>시세 제공처와 대체 경로 보기</summary>
      <div class="company-provider-body">
        <p>기본 제공처가 실패하면 준비된 보조 제공처를 순서대로 확인합니다. 서로 다른 기준의 값을 섞지 않고, 한 제공처에서 검증을 통과한 전체 시계열만 사용합니다.</p>
        ${attempts.length ? `<ol>${attempts.map((attempt) => `<li data-status="${escapeHtml(attempt.status)}"><strong>${escapeHtml(attempt.label)}</strong><span>${attempt.status === "success" ? "사용" : escapeHtml(attempt.reason || "실패")}</span></li>`).join("")}</ol>` : ""}
        <div class="company-provider-plan">${plan.map((provider) => `<span data-enabled="${provider.enabled}">시세 · ${escapeHtml(provider.label)} · ${provider.enabled ? "준비됨" : "키 미연결"}</span>`).join("")}</div>
        ${fundamentalAttempts.length ? `<h4>기업지표 수집 경로</h4><ol>${fundamentalAttempts.map((attempt) => `<li data-status="${escapeHtml(attempt.status)}"><strong>${escapeHtml(attempt.label)}</strong><span>${attempt.status === "success" ? "사용" : escapeHtml(attempt.reason || "실패")}</span></li>`).join("")}</ol>` : ""}
        <div class="company-provider-plan">${fundamentalPlan.map((provider) => `<span data-enabled="${provider.enabled}">지표 · ${escapeHtml(provider.label)} · ${provider.enabled ? "준비됨" : "키 미연결"}</span>`).join("")}</div>
        <small>모든 제공처가 실패하고 마지막 정상 자료도 없으면 ‘자료 수집 실패’로 표시합니다. 실패한 가격이나 재무비율을 다른 값으로 추정하지 않습니다.</small>
      </div>
    </details>
  `;
}

async function ensureCompanyQuote(companyId, { force = false } = {}) {
  if (!companyById.has(companyId)) return;
  const cached = viewState.quoteCache.get(companyId);
  if (!force && cached?.status === "loaded") return;
  if (!force && viewState.quoteRequests.has(companyId)) return viewState.quoteRequests.get(companyId);
  viewState.quoteCache.set(companyId, { status: "loading", data: null });
  if (companyId === viewState.companyId) renderCompanyDetail();
  const request = fetch(`/api/company-market?id=${encodeURIComponent(companyId)}`, {
    headers: { accept: "application/json" },
    cache: force ? "reload" : "default",
    signal: AbortSignal.timeout(16_000)
  })
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
      viewState.quoteCache.set(companyId, { status: "loaded", data });
      return data;
    })
    .catch((error) => {
      console.error("[company-market] quote request failed", { companyId, error });
      viewState.quoteCache.set(companyId, {
        status: "error",
        data: {
          available: false,
          reason: "기업 시세 API 요청에 실패했습니다.",
          attempts: [],
          providerPlan: []
        }
      });
      return null;
    })
    .finally(() => {
      if (viewState.quoteRequests.get(companyId) === request) {
        viewState.quoteRequests.delete(companyId);
      }
      if (companyId === viewState.companyId) renderCompanyDetail();
    });
  viewState.quoteRequests.set(companyId, request);
  return request;
}

function setCompanyPeriod(periodId) {
  if (!COMPANY_PERIODS.some((period) => period.id === periodId)) return;
  viewState.period = periodId;
  root?.querySelectorAll("[data-company-period]").forEach((button) => {
    button.setAttribute(
      "aria-selected",
      String(button.dataset.companyPeriod === viewState.period)
    );
  });
  renderCompanyChart();
}

function renderCompanyChart() {
  const canvas = root?.querySelector("#companyChartCanvas");
  const stage = root?.querySelector("#companyChartStage");
  const caption = root?.querySelector("#companyChartCaption");
  const tooltip = root?.querySelector("#companyChartTooltip");
  const market = viewState.quoteCache.get(viewState.companyId)?.data?.market;
  if (!canvas || !stage || !caption || !tooltip || !market) return;
  const period = COMPANY_PERIODS.find((item) => item.id === viewState.period) || COMPANY_PERIODS[3];
  const points = filterSeries(market.series, period.days);
  if (points.length < 2) {
    caption.textContent = "선택 기간의 차트 자료가 부족합니다.";
    return;
  }
  const bounds = stage.getBoundingClientRect();
  const width = Math.max(1, Math.floor(stage.clientWidth || bounds.width));
  const height = Math.max(240, Math.floor(stage.clientHeight || bounds.height));
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  const context = canvas.getContext("2d");
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  const padding = width < 480
    ? { top: 20, right: 12, bottom: 36, left: 52 }
    : { top: 24, right: 22, bottom: 38, left: 66 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const values = points.map((point) => Number(point.value));
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const range = Math.max(rawMax - rawMin, Math.abs(rawMax) * 0.03, 1);
  const min = rawMin - range * 0.12;
  const max = rawMax + range * 0.12;
  const xAt = (index) => padding.left + (index / (points.length - 1)) * plotWidth;
  const yAt = (value) => padding.top + ((max - value) / (max - min)) * plotHeight;
  const rising = values.at(-1) >= values[0];
  const lineColor = rising ? "#087f73" : "#c43d4e";

  context.clearRect(0, 0, width, height);
  context.font = "12px system-ui, sans-serif";
  context.lineWidth = 1;
  for (let index = 0; index <= 4; index += 1) {
    const y = padding.top + (plotHeight / 4) * index;
    const value = max - ((max - min) / 4) * index;
    context.strokeStyle = "#dce4e8";
    context.setLineDash([3, 5]);
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();
    context.setLineDash([]);
    context.fillStyle = "#687680";
    context.textAlign = "right";
    context.fillText(formatAxisValue(value), padding.left - 10, y + 4);
  }

  const gradient = context.createLinearGradient(0, padding.top, 0, height - padding.bottom);
  gradient.addColorStop(0, rising ? "rgba(8,127,115,.24)" : "rgba(196,61,78,.22)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.beginPath();
  points.forEach((point, index) => {
    const x = xAt(index);
    const y = yAt(Number(point.value));
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.lineTo(xAt(points.length - 1), height - padding.bottom);
  context.lineTo(xAt(0), height - padding.bottom);
  context.closePath();
  context.fillStyle = gradient;
  context.fill();

  context.beginPath();
  points.forEach((point, index) => {
    const x = xAt(index);
    const y = yAt(Number(point.value));
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.strokeStyle = lineColor;
  context.lineWidth = 2.5;
  context.lineJoin = "round";
  context.lineCap = "round";
  context.stroke();

  context.fillStyle = "#687680";
  context.textAlign = "left";
  context.fillText(formatPointDate(points[0].time), padding.left, height - 12);
  context.textAlign = "center";
  context.fillText(formatPointDate(points[Math.floor(points.length / 2)].time), padding.left + plotWidth / 2, height - 12);
  context.textAlign = "right";
  context.fillText(formatPointDate(points.at(-1).time), width - padding.right, height - 12);

  const baseImage = context.getImageData(0, 0, canvas.width, canvas.height);
  const restoreBaseImage = () => {
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.putImageData(baseImage, 0, 0);
    context.restore();
  };
  const change = ((values.at(-1) - values[0]) / values[0]) * 100;
  caption.innerHTML = `<span>${formatPointDate(points[0].time)} ~ ${formatPointDate(points.at(-1).time)}</span><strong data-tone="${change >= 0 ? "up" : "down"}">${change >= 0 ? "+" : ""}${numberFormatter.format(change)}%</strong><small>${points.length}개 일별 종가 · ${escapeHtml(market.providerLabel || market.source || "제공처 미확인")}</small>`;

  canvas.onpointermove = (event) => {
    const canvasBounds = canvas.getBoundingClientRect();
    if (!canvasBounds.width) return;
    const layoutX = (event.clientX - canvasBounds.left) * (width / canvasBounds.width);
    const pointerX = Math.max(padding.left, Math.min(width - padding.right, layoutX));
    const index = Math.max(0, Math.min(points.length - 1, Math.round(((pointerX - padding.left) / plotWidth) * (points.length - 1))));
    const point = points[index];
    const x = xAt(index);
    const y = yAt(Number(point.value));
    restoreBaseImage();
    drawHoverOverlay(context, { width, height, x, y, padding, lineColor });
    tooltip.hidden = false;
    tooltip.innerHTML = `<span>${formatPointDate(point.time)}</span><strong>${formatPrice(point.value, market.quoteCurrency || market.unit)}</strong>`;
    const tooltipWidth = tooltip.offsetWidth || 150;
    const tooltipHeight = tooltip.offsetHeight || 54;
    const preferredLeft = x + 12 + tooltipWidth <= width - 8
      ? x + 12
      : x - tooltipWidth - 12;
    const maxLeft = Math.max(8, width - tooltipWidth - 8);
    const maxTop = Math.max(8, height - tooltipHeight - 8);
    tooltip.style.left = `${Math.min(maxLeft, Math.max(8, preferredLeft))}px`;
    tooltip.style.top = `${Math.min(maxTop, Math.max(8, y - tooltipHeight / 2))}px`;
  };
  canvas.onpointerleave = () => {
    tooltip.hidden = true;
    restoreBaseImage();
  };
}

function drawHoverOverlay(context, { width, height, x, y, padding, lineColor }) {
  context.save();
  context.strokeStyle = "rgba(23,42,52,.38)";
  context.setLineDash([4, 4]);
  context.beginPath();
  context.moveTo(x, padding.top);
  context.lineTo(x, height - padding.bottom);
  context.stroke();
  context.setLineDash([]);
  context.fillStyle = "#fff";
  context.strokeStyle = lineColor;
  context.lineWidth = 3;
  context.beginPath();
  context.arc(x, y, 5, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.restore();
}

function scheduleChartDraw() {
  if (viewState.view !== "chart" || resizeFrame) return;
  resizeFrame = requestAnimationFrame(() => {
    resizeFrame = 0;
    renderCompanyChart();
  });
}

function filterSeries(series = [], days = 366) {
  const normalized = series
    .map((point) => ({ ...point, timestamp: Date.parse(point?.time), value: Number(point?.value) }))
    .filter((point) => Number.isFinite(point.timestamp) && Number.isFinite(point.value) && point.value > 0)
    .sort((left, right) => left.timestamp - right.timestamp);
  if (normalized.length < 2) return normalized;
  const threshold = normalized.at(-1).timestamp - days * 24 * 60 * 60_000;
  const filtered = normalized.filter((point) => point.timestamp >= threshold);
  return filtered.length >= 2 ? filtered : normalized.slice(-2);
}

function getPeers(company) {
  return futureCompanies
    .filter((peer) => getCompanyIndustryId(peer) === getCompanyIndustryId(company) && peer.id !== company.id)
    .sort(compareHealthScores);
}

function matchCompanyHeadlines(company, headlines) {
  const companyName = normalizeText(company.name);
  const ticker = normalizeText(String(company.ticker || "").split(/[·,/]/)[0]);
  return headlines
    .filter((headline) => {
      if (headline.companyId === company.id || headline.companyIds?.includes(company.id)) return true;
      const title = normalizeText(headline.title);
      if (companyName.length >= 3 && title.includes(companyName)) return true;
      return ticker.length >= 4 && title.includes(ticker);
    })
    .sort((left, right) => Date.parse(right.publishedAt || 0) - Date.parse(left.publishedAt || 0))
    .slice(0, 8);
}

function getHealthScore(company) {
  const values = futureIndustryMethod.parts.map((part) => company.healthParts?.[part.id]);
  if (!values.every((value) => hasMetricValue(value))) return null;
  return values.reduce((sum, value) => sum + Number(value), 0);
}

function compareHealthScores(left, right) {
  const leftScore = getHealthScore(left);
  const rightScore = getHealthScore(right);
  if (leftScore === null && rightScore === null) return left.name.localeCompare(right.name, "ko");
  if (leftScore === null) return 1;
  if (rightScore === null) return -1;
  return rightScore - leftScore;
}

function getHealthGrade(score) {
  if (score === null) return "공식 실적 검증 후 제공";
  if (score >= 90) return "매우 단단함";
  if (score >= 80) return "단단함";
  if (score >= 70) return "보통 이상";
  if (score >= 60) return "점검 필요";
  return "위험 요인 큼";
}

function getHealthTone(score) {
  if (score === null) return "pending";
  if (score >= 85) return "strong";
  if (score >= 70) return "steady";
  return "watch";
}

function hasMetricValue(value) {
  return value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
}

function getMetricTone(value) {
  if (!hasMetricValue(value)) return "unavailable";
  return Number(value) >= 0 ? "up" : "down";
}

function formatStaticMargin(value) {
  return hasMetricValue(value) ? `${numberFormatter.format(Number(value))}%` : "검증 대기";
}

function getSymbolMonogram(company) {
  const korean = company.name.match(/[가-힣]/g)?.slice(0, 1).join("");
  return korean || String(company.ticker || company.name).replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase();
}

function formatMovement(market) {
  if (!market?.changeAvailable) {
    return { text: "당일 등락 계산 불가", html: "당일 등락 계산 불가" };
  }
  const percent = Number(market.changePercent);
  const change = Number(market.change);
  const sign = percent > 0 ? "+" : "";
  const text = `${sign}${numberFormatter.format(change)} · ${sign}${numberFormatter.format(percent)}%`;
  return { text, html: escapeHtml(text) };
}

function formatFundamentalValue(metric, kind = "number") {
  const value = Number(metric?.value);
  if (!Number.isFinite(value)) return "자료 없음";
  if (kind === "amount") return formatLargeAmount(value, metric.currency);
  if (kind === "multiple") return `${numberFormatter.format(value)}배`;
  if (kind === "percent") return `${numberFormatter.format(value)}%`;
  if (kind === "currency") return formatPrice(value, metric.currency);
  if (kind === "volume") return `${integerFormatter.format(value)}주`;
  return numberFormatter.format(value);
}

function formatLargeAmount(value, currency = "") {
  const number = Number(value);
  if (!Number.isFinite(number)) return "자료 없음";
  const absolute = Math.abs(number);
  if (currency === "KRW") {
    if (absolute >= 1_000_000_000_000) return `${numberFormatter.format(number / 1_000_000_000_000)}조원`;
    if (absolute >= 100_000_000) return `${numberFormatter.format(number / 100_000_000)}억원`;
    return `${integerFormatter.format(number)}원`;
  }
  const currencyLabel = {
    USD: "달러",
    EUR: "유로",
    JPY: "엔",
    CHF: "스위스프랑",
    CNY: "위안",
    HKD: "홍콩달러"
  }[currency] || currency || "통화 미확인";
  if (absolute >= 1_000_000_000_000) return `${numberFormatter.format(number / 1_000_000_000_000)}조 ${currencyLabel}`;
  if (absolute >= 1_000_000_000) return `${numberFormatter.format(number / 1_000_000_000)}십억 ${currencyLabel}`;
  if (absolute >= 1_000_000) return `${numberFormatter.format(number / 1_000_000)}백만 ${currencyLabel}`;
  return `${numberFormatter.format(number)} ${currencyLabel}`;
}

function formatFundamentalBasis(metric) {
  if (!metric) return "기준 미확인";
  return [metric.periodType, metric.asOf].filter(Boolean).join(" · ") || "기준 미확인";
}

function formatPrice(value, currency = "") {
  const number = Number(value);
  if (!Number.isFinite(number)) return "자료 없음";
  const symbols = { KRW: "₩", USD: "$", JPY: "¥", EUR: "€", CHF: "CHF ", CNY: "CN¥", HKD: "HK$" };
  return `${symbols[currency] || `${currency ? `${currency} ` : ""}`}${numberFormatter.format(number)}`;
}

function formatAxisValue(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "--";
  if (Math.abs(number) >= 10_000) return integerFormatter.format(number);
  return numberFormatter.format(number);
}

function formatSignedPercent(value) {
  if (!hasMetricValue(value)) return "검증 대기";
  const number = Number(value);
  return `${number > 0 ? "+" : ""}${numberFormatter.format(number)}%`;
}

function formatPointDate(value) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? dateFormatter.format(date) : "날짜 미확인";
}

function formatHeadlineDate(value) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? escapeHtml(dateTimeFormatter.format(date)) : "게시일 미확인";
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, "").toLocaleLowerCase("ko");
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "#";
  } catch {
    return "#";
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
