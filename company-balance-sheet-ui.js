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

function safeUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return ["http:", "https:"].includes(url.protocol) ? url.href : "#";
  } catch {
    return "#";
  }
}

function formatAmount(metric) {
  const value = Number(metric?.value);
  if (!Number.isFinite(value)) return "자료 없음";
  const absolute = Math.abs(value);
  if (metric.currency === "KRW") {
    if (absolute >= 1_000_000_000_000) return `${numberFormatter.format(value / 1_000_000_000_000)}조원`;
    if (absolute >= 100_000_000) return `${numberFormatter.format(value / 100_000_000)}억원`;
    return `${integerFormatter.format(value)}원`;
  }
  const labels = { USD: "달러", EUR: "유로", JPY: "엔", CNY: "위안", CHF: "스위스프랑", HKD: "홍콩달러" };
  const currency = labels[metric.currency] || metric.currency || "통화 미확인";
  if (absolute >= 1_000_000_000_000) return `${numberFormatter.format(value / 1_000_000_000_000)}조 ${currency}`;
  if (absolute >= 1_000_000_000) return `${numberFormatter.format(value / 1_000_000_000)}십억 ${currency}`;
  if (absolute >= 1_000_000) return `${numberFormatter.format(value / 1_000_000)}백만 ${currency}`;
  return `${numberFormatter.format(value)} ${currency}`;
}

function formatMetric(metric, kind = "amount") {
  if (!Number.isFinite(metric?.value)) return "자료 없음";
  if (kind === "percent") return `${numberFormatter.format(metric.value)}%`;
  return formatAmount(metric);
}

function formatBasis(metric) {
  if (!metric) return "제공처 미지원 또는 수집 실패";
  const basis = [metric.periodType, metric.asOf].filter(Boolean).join(" · ") || "기준 미확인";
  return metric.calculated ? `계산값 · ${basis}` : basis;
}

function renderMetric(item, loading) {
  const available = Number.isFinite(item.metric?.value);
  return `
    <div class="company-balance-metric" data-available="${available}">
      <span>${escapeHtml(item.label)}</span>
      <strong>${loading ? "확인 중" : escapeHtml(formatMetric(item.metric, item.kind))}</strong>
      <small>${available ? escapeHtml(formatBasis(item.metric)) : escapeHtml(item.hint || "제공처 미지원 또는 수집 실패")}</small>
    </div>
  `;
}

function renderGroup(title, detail, items, loading) {
  return `
    <section class="company-balance-group">
      <header><strong>${escapeHtml(title)}</strong><small>${escapeHtml(detail)}</small></header>
      <div>${items.map((item) => renderMetric(item, loading)).join("")}</div>
    </section>
  `;
}

export function renderCompanyBalanceSheet(quoteState = {}) {
  const fundamentals = quoteState?.data?.fundamentals;
  const metrics = fundamentals?.metrics || {};
  const loading = quoteState?.status === "loading";
  const sourceUrl = safeUrl(fundamentals?.sourceUrl);
  const currentRatioText = Number.isFinite(metrics.currentRatio?.value)
    ? `유동부채 100원당 유동자산 ${numberFormatter.format(metrics.currentRatio.value)}원`
    : "유동성 비교 자료 부족";
  const quickRatioText = Number.isFinite(metrics.quickRatio?.value)
    ? `유동부채 100원당 계산 당좌자산 ${numberFormatter.format(metrics.quickRatio.value)}원`
    : "당좌비율 계산 자료 부족";
  const groups = [
    {
      title: "유동성",
      detail: "1년 안에 현금화하거나 갚아야 할 항목",
      items: [
        { label: "유동자산", metric: metrics.currentAssets },
        { label: "유동부채", metric: metrics.currentLiabilities },
        { label: "유동비율", metric: metrics.currentRatio, kind: "percent" },
        { label: "당좌자산(계산)", metric: metrics.quickAssets },
        { label: "당좌비율(계산)", metric: metrics.quickRatio, kind: "percent" },
        { label: "순운전자본(계산)", metric: metrics.workingCapital }
      ]
    },
    {
      title: "자산 구성",
      detail: "영업에 묶인 자금과 장기 자산",
      items: [
        { label: "총자산", metric: metrics.totalAssets },
        { label: "비유동자산", metric: metrics.nonCurrentAssets },
        { label: "현금·단기투자", metric: metrics.cashAndShortTermInvestments },
        { label: "현금·현금성자산", metric: metrics.cashAndCashEquivalents },
        { label: "매출채권", metric: metrics.accountsReceivable },
        { label: "재고자산", metric: metrics.inventory }
      ]
    },
    {
      title: "부채·자본",
      detail: "상환 부담과 주주 몫을 함께 확인",
      items: [
        { label: "총부채", metric: metrics.totalLiabilities },
        { label: "비유동부채", metric: metrics.nonCurrentLiabilities },
        { label: "매입·기타채무", metric: metrics.payables },
        { label: "매입채무", metric: metrics.accountsPayable },
        { label: "총차입금", metric: metrics.totalDebt },
        { label: "자기자본", metric: metrics.stockholdersEquity },
        { label: "부채비율(계산)", metric: metrics.debtRatio, kind: "percent" }
      ]
    }
  ];
  return `
    <section class="company-balance-panel">
      <header class="company-balance-head">
        <div><span>BALANCE SHEET</span><h4>재무상태표·유동성</h4><p>동일한 분기 기준일과 통화가 확인될 때만 계산값을 만듭니다.</p></div>
        <div><strong>${escapeHtml(currentRatioText)}</strong><small>${escapeHtml(quickRatioText)}</small></div>
      </header>
      ${groups.map((group) => renderGroup(group.title, group.detail, group.items, loading)).join("")}
      <details class="company-balance-method">
        <summary>항목 뜻과 계산식 보기</summary>
        <dl>
          <div><dt>유동비율</dt><dd>유동자산 ÷ 유동부채 × 100입니다. 단기 지급능력의 한 단면이며 업종별 적정 수준은 다릅니다.</dd></div>
          <div><dt>당좌자산·당좌비율</dt><dd>제공된 현금·단기투자와 매출채권을 합산한 계산값입니다. 회사 공시의 공식 당좌자산 항목과 정의가 다를 수 있습니다.</dd></div>
          <div><dt>순운전자본</dt><dd>유동자산 - 유동부채입니다. 양수라고 현금흐름이 반드시 좋다는 뜻은 아니며 재고와 채권 회수 속도를 함께 봐야 합니다.</dd></div>
          <div><dt>매출채권·재고자산</dt><dd>매출채권은 아직 받지 못한 판매대금, 재고자산은 판매나 생산을 위해 보유한 자산입니다. 증가 원인을 매출 성장과 함께 확인해야 합니다.</dd></div>
          <div><dt>비유동자산</dt><dd>보통 1년 이내 현금화하지 않을 유형자산·무형자산·장기투자 등을 포함합니다.</dd></div>
          <div><dt>부채비율</dt><dd>총부채 ÷ 자기자본 × 100입니다. 자기자본이 0 이하이거나 기준일이 다르면 계산하지 않습니다.</dd></div>
        </dl>
      </details>
      <footer class="company-balance-source">
        <span>최근 분기 재무상태표 · 누락값은 0으로 바꾸지 않음</span>
        ${sourceUrl !== "#" ? `<a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">원자료 보기 <i aria-hidden="true">↗</i></a>` : ""}
      </footer>
    </section>
  `;
}

