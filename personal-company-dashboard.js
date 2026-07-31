const numberFormatter = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 });
const integerFormatter = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 });

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function amount(metric) {
  const value = Number(metric?.value);
  if (!Number.isFinite(value)) return "자료 없음";
  const absolute = Math.abs(value);
  if (metric.currency === "KRW") {
    if (absolute >= 1_000_000_000_000) return `${numberFormatter.format(value / 1_000_000_000_000)}조원`;
    if (absolute >= 100_000_000) return `${numberFormatter.format(value / 100_000_000)}억원`;
    return `${integerFormatter.format(value)}원`;
  }
  const label = { USD: "달러", EUR: "유로", JPY: "엔", CNY: "위안" }[metric.currency]
    || metric.currency
    || "통화 미확인";
  if (absolute >= 1_000_000_000_000) return `${numberFormatter.format(value / 1_000_000_000_000)}조 ${label}`;
  if (absolute >= 1_000_000_000) return `${numberFormatter.format(value / 1_000_000_000)}십억 ${label}`;
  return `${numberFormatter.format(value)} ${label}`;
}

function metricValue(metric, kind) {
  if (!Number.isFinite(metric?.value)) return "자료 없음";
  if (kind === "percent") return `${numberFormatter.format(metric.value)}%`;
  if (kind === "multiple") return `${numberFormatter.format(metric.value)}배`;
  return amount(metric);
}

function priceValue(market = {}) {
  const value = Number(market.value);
  if (!Number.isFinite(value)) return "현재값 없음";
  const symbol = { KRW: "₩", USD: "$", JPY: "¥", EUR: "€" }[market.quoteCurrency || market.unit] || "";
  return `${symbol}${numberFormatter.format(value)}`;
}

function renderFact(label, metric, kind = "amount") {
  return `<div data-available="${Number.isFinite(metric?.value)}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(metricValue(metric, kind))}</strong></div>`;
}

export function renderPersonalCompanyDetails(entry = {}) {
  if (!entry || entry.status === "idle" || entry.status === "loading") {
    return `<div class="personal-company-live" data-status="loading"><span>시장·재무 자료</span><strong>확인 중</strong><small>관심 기업을 한 번의 묶음 요청으로 불러옵니다.</small></div>`;
  }
  if (entry.status === "error" || !entry.data) {
    return `<div class="personal-company-live" data-status="error"><span>시장·재무 자료</span><strong>자료 수집 실패</strong><small>기존 실적과 뉴스는 계속 표시합니다.</small></div>`;
  }
  const market = entry.data.market || {};
  const fundamentals = entry.data.fundamentals || {};
  const metrics = fundamentals.metrics || {};
  const change = Number(market.changePercent);
  const hasChange = market.changeAvailable && Number.isFinite(change);
  const changeText = hasChange ? `${change > 0 ? "+" : ""}${numberFormatter.format(change)}%` : "등락 계산 불가";
  return `
    <div class="personal-company-live" data-status="${escapeHtml(hasChange ? (change > 0 ? "up" : change < 0 ? "down" : "flat") : "flat")}">
      <div><span>최근 시세</span><strong>${escapeHtml(priceValue(market))}</strong></div>
      <div><span>당일 등락</span><strong>${escapeHtml(changeText)}</strong></div>
      <small>${escapeHtml(market.marketStateLabel || "장 상태 미확인")} · ${escapeHtml(market.tradingDate || "거래일 미확인")}</small>
    </div>
    <div class="personal-company-facts">
      ${renderFact("시가총액", metrics.marketCap)}
      ${renderFact("PER", metrics.per, "multiple")}
      ${renderFact("PBR", metrics.pbr, "multiple")}
      ${renderFact("ROE", metrics.roe, "percent")}
      ${renderFact("유동비율", metrics.currentRatio, "percent")}
      ${renderFact("부채비율", metrics.debtRatio, "percent")}
    </div>
    <details class="personal-company-balance">
      <summary>재무상태 자세히 보기</summary>
      <dl>
        <div><dt>유동자산</dt><dd>${escapeHtml(amount(metrics.currentAssets))}</dd></div>
        <div><dt>유동부채</dt><dd>${escapeHtml(amount(metrics.currentLiabilities))}</dd></div>
        <div><dt>당좌자산(계산)</dt><dd>${escapeHtml(amount(metrics.quickAssets))}</dd></div>
        <div><dt>매출채권</dt><dd>${escapeHtml(amount(metrics.accountsReceivable))}</dd></div>
        <div><dt>재고자산</dt><dd>${escapeHtml(amount(metrics.inventory))}</dd></div>
        <div><dt>비유동자산</dt><dd>${escapeHtml(amount(metrics.nonCurrentAssets))}</dd></div>
        <div><dt>총자산</dt><dd>${escapeHtml(amount(metrics.totalAssets))}</dd></div>
        <div><dt>총부채</dt><dd>${escapeHtml(amount(metrics.totalLiabilities))}</dd></div>
      </dl>
      <small>${escapeHtml(fundamentals.basisLabel || "제공처별 최신 공표자료")} · 계산값은 동일 기준일 자료가 있을 때만 표시</small>
    </details>
  `;
}

