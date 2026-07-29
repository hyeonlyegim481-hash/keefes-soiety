import { PROFILE_MARKETS, getProfileTierProgress } from "./profile-data.js";
import { indicatorDefinitions } from "./indicator-data.js";
import { financeIndicatorDefinitions } from "./indicator-finance-data.js";
import { expandedIndicatorDefinitions } from "./indicator-expanded-data.js";
import {
  resourceProductionIndicators,
  resourceProductionMetadata
} from "./resource-production-data.js";
import { indicatorSnapshot } from "./indicator-values.js";
import { futureCompanies, futureIndustries } from "./future-industry-data.js";
import { scenarioQuestions } from "./quiz-data.js";
import { extraScenarioQuestions } from "./quiz-scenario-extra-data.js";
import { moreScenarioQuestions } from "./quiz-scenario-more-data.js";
import { expandedScenarioQuestions } from "./quiz-scenario-expanded-data.js";
import { scenarioValidationQuestions } from "./quiz-scenario-validation-data.js";
import { historyQuizQuestions } from "./quiz-history-data.js";

const numberFormatter = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 });
const compactFormatter = new Intl.NumberFormat("ko-KR", {
  notation: "compact",
  maximumFractionDigits: 1
});
const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});
const timeFormatter = new Intl.DateTimeFormat("ko-KR", {
  hour: "2-digit",
  minute: "2-digit"
});

const indicatorCatalog = [
  ...indicatorDefinitions,
  ...financeIndicatorDefinitions,
  ...expandedIndicatorDefinitions,
  ...resourceProductionIndicators
];
const indicatorById = new Map(indicatorCatalog.map((item) => [item.id, item]));
const companyById = new Map(futureCompanies.map((item) => [item.id, item]));
const industryById = new Map(futureIndustries.map((item) => [item.id, item]));
const quizById = new Map(
  [
    ...scenarioQuestions,
    ...extraScenarioQuestions,
    ...moreScenarioQuestions,
    ...expandedScenarioQuestions,
    ...scenarioValidationQuestions,
    ...historyQuizQuestions
  ].map((item) => [item.id, item])
);

const companyAliases = Object.freeze({
  "samsung-electronics": ["삼성전자", "Samsung Electronics"],
  "sk-hynix": ["SK하이닉스", "하이닉스", "SK Hynix"],
  "lg-energy-solution": ["LG에너지솔루션", "LG엔솔"],
  "hyundai-motor": ["현대차", "현대자동차"],
  "doosan-enerbility": ["두산에너빌리티"],
  alphabet: ["Alphabet", "Google", "구글"],
  microsoft: ["Microsoft", "마이크로소프트"],
  nvidia: ["NVIDIA", "엔비디아"],
  "samsung-biologics": ["삼성바이오로직스", "삼성바이오"],
  tesla: ["Tesla", "테슬라"],
  tsmc: ["TSMC", "대만반도체"]
});

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

function getHeadlineKey(headline = {}) {
  return String(
    headline.id
    || `${headline.source || "news"}|${headline.title || "untitled"}`
  );
}

function normalizeText(value) {
  return String(value || "")
    .toLocaleLowerCase("ko-KR")
    .replace(/[^0-9a-z가-힣]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatSignedPercent(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "등락 계산 불가";
  const prefix = numeric > 0 ? "+" : "";
  return `${prefix}${numeric.toFixed(2)}%`;
}

function formatMarketValue(market = {}) {
  const value = Number(market.value);
  if (!Number.isFinite(value)) return "현재값 없음";
  const digits = market.id === "usdkrw" ? 1 : Math.abs(value) >= 1_000 ? 1 : 2;
  const formatted = value.toLocaleString("ko-KR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits
  });
  if (market.id === "usdkrw") return `${formatted}원`;
  if (market.id === "wti") return `$${formatted}/배럴`;
  if (market.id === "gold") return `$${formatted}/온스`;
  return `${formatted}${market.displayUnit === "지수" ? "" : "포인트"}`;
}

function getMarketTone(market = {}) {
  const value = Number(market.changePercent);
  if (!Number.isFinite(value) || Math.abs(value) < 0.005) return "flat";
  return value > 0 ? "up" : "down";
}

function getKstParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short"
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    dateKey: `${values.year}-${values.month}-${values.day}`,
    weekday: values.weekday,
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day)
  };
}

function getNewYorkOffsetHours(now = new Date()) {
  try {
    const zone = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      timeZoneName: "shortOffset"
    })
      .formatToParts(now)
      .find((part) => part.type === "timeZoneName")?.value;
    const match = String(zone || "").match(/GMT([+-]\d{1,2})/);
    if (match) return Number(match[1]);
  } catch {
    // Older browsers use the month fallback below.
  }
  const month = now.getUTCMonth() + 1;
  return month >= 4 && month <= 10 ? -4 : -5;
}

export function buildTodaySchedule(now = new Date()) {
  const kst = getKstParts(now);
  const isWeekend = kst.weekday === "Sat" || kst.weekday === "Sun";
  const newYorkOffset = getNewYorkOffsetHours(now);
  const usOpenHour = newYorkOffset === -4 ? 22 : 23;
  const usCloseHour = newYorkOffset === -4 ? 5 : 6;
  const usZone = newYorkOffset === -4 ? "미국 서머타임" : "미국 표준시";

  if (isWeekend) {
    return {
      dateKey: kst.dateKey,
      items: [
        {
          time: "휴장",
          label: "한국 증시 정규장",
          detail: "주말 기준 정규 거래 없음",
          tone: "closed"
        },
        {
          time: "휴장",
          label: "미국 증시 정규장",
          detail: "주말 기준 정규 거래 없음",
          tone: "closed"
        }
      ],
      caveat: "정규 운영시간 기준입니다. 국가별 공휴일과 임시 휴장은 거래소 공지를 따로 확인해야 합니다."
    };
  }

  return {
    dateKey: kst.dateKey,
    items: [
      {
        time: "09:00",
        label: "한국 증시 정규장 개장",
        detail: "KOSPI·KOSDAQ",
        tone: "korea"
      },
      {
        time: "15:30",
        label: "한국 증시 정규장 마감",
        detail: "종가와 외국인 수급 확인",
        tone: "korea"
      },
      {
        time: `${String(usOpenHour).padStart(2, "0")}:30`,
        label: "미국 증시 정규장 개장",
        detail: `${usZone} · 다음 날 ${String(usCloseHour).padStart(2, "0")}:00 마감`,
        tone: "global"
      }
    ],
    caveat: "시장 정규 운영시간만 표시합니다. 공식 경제지표 공표 일정이 확인되지 않으면 임의의 발표를 추가하지 않습니다."
  };
}

function parseDate(value) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function startOfKstWeek(now = new Date()) {
  const kst = getKstParts(now);
  const kstMiddayUtc = new Date(Date.UTC(kst.year, kst.month - 1, kst.day, 3));
  const weekday = kstMiddayUtc.getUTCDay();
  const daysFromMonday = (weekday + 6) % 7;
  return new Date(Date.UTC(kst.year, kst.month - 1, kst.day - daysFromMonday, -9));
}

export function buildWeeklyLearningSummary(dashboard = {}, now = new Date()) {
  const start = startOfKstWeek(now);
  const activity = (dashboard.dailyActivity || []).filter((row) => {
    const date = parseDate(`${row.activity_date}T00:00:00+09:00`);
    return date && date >= start;
  });
  const attempts = (dashboard.quizAttempts || []).filter((row) => {
    const date = parseDate(row.answered_at);
    return date && date >= start;
  });
  const terms = (dashboard.learningHistory || []).filter((row) => {
    const date = parseDate(row.viewed_at);
    return date && date >= start;
  });
  const xp = [...activity, ...attempts].reduce(
    (sum, row) => sum + (Number(row.xp_awarded) || 0),
    0
  );
  return {
    activeDays: new Set(activity.map((row) => row.activity_date)).size,
    attempts: attempts.length,
    correct: attempts.filter((row) => row.correct === true).length,
    terms: terms.length,
    xp
  };
}

function resolveQuizAttempt(attempt = {}) {
  const quizId = String(attempt.quiz_id || "");
  if (quizId.startsWith("term:")) {
    const term = quizId.slice(5);
    return {
      id: quizId,
      type: "용어",
      prompt: `‘${term}’의 뜻과 실제 쓰임을 다시 확인해 보세요.`,
      explanation: "용어 사전에서 정의, 예시와 주의점을 함께 복습하면 같은 문제를 다시 틀릴 가능성이 줄어듭니다.",
      term
    };
  }
  const question = quizById.get(quizId);
  return {
    id: quizId,
    type: question?.type === "history" ? "경제 역사" : "상황판단",
    prompt: question?.prompt || "문제 내용을 현재 퀴즈 데이터에서 찾지 못했습니다.",
    explanation: question?.explanation || "퀴즈 데이터가 갱신되어 기존 문제의 해설을 불러오지 못했습니다.",
    term: ""
  };
}

export function matchCompanyHeadlines(company = {}, headlines = []) {
  const aliases = [
    company.name,
    company.ticker,
    ...(companyAliases[company.id] || [])
  ]
    .map(normalizeText)
    .filter((value) => value.length >= 2);
  if (!aliases.length) return [];
  return headlines
    .filter((headline) => {
      const haystack = normalizeText(`${headline.title || ""} ${headline.topic || ""}`);
      return aliases.some((alias) => haystack.includes(alias));
    })
    .sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt))
    .slice(0, 2);
}

function resolveIndicator(targetId) {
  const definition = indicatorById.get(targetId);
  if (!definition) return null;
  if (definition.kind === "resource-production") {
    return {
      ...definition,
      value: definition.worldTotal,
      year: definition.year,
      geography: "세계 합계",
      source: resourceProductionMetadata.title,
      sourceUrl: resourceProductionMetadata.sourceUrl,
      available: Number.isFinite(Number(definition.worldTotal))
    };
  }
  const observation = indicatorSnapshot.indicators?.[targetId];
  const country = observation?.countries?.KOR
    ? { code: "KOR", label: "한국", ...observation.countries.KOR }
    : observation?.countries?.WLD
      ? { code: "WLD", label: "세계", ...observation.countries.WLD }
      : null;
  return {
    ...definition,
    value: country?.value,
    previous: country?.previous || null,
    year: country?.year,
    geography: country?.label || "자료 없음",
    source: "World Bank",
    sourceUrl: `https://data.worldbank.org/indicator/${encodeURIComponent(definition.code || "")}`,
    available: Number.isFinite(Number(country?.value))
  };
}

function formatIndicatorValue(indicator = {}) {
  if (!indicator.available) return "자료 없음";
  const value = Number(indicator.value);
  if (indicator.format === "currency") return `$${compactFormatter.format(value)}`;
  if (indicator.unit === "%") return `${numberFormatter.format(value)}%`;
  if (indicator.kind === "resource-production") {
    return `${compactFormatter.format(value)}톤`;
  }
  return `${numberFormatter.format(value)}${indicator.unit ? ` ${indicator.unit}` : ""}`;
}

function renderEmpty(title, detail, action = "") {
  return `
    <div class="personal-empty">
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(detail)}</p>
      ${action}
    </div>
  `;
}

function renderSectionHeading(kicker, title, detail, action = "") {
  return `
    <header class="personal-section-heading">
      <div>
        <span>${escapeHtml(kicker)}</span>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(detail)}</p>
      </div>
      ${action}
    </header>
  `;
}

function renderMarkets(watchlists, snapshot) {
  const watchedIds = watchlists
    .filter((row) => row.item_type === "market")
    .map((row) => row.target_id);
  const markets = watchedIds
    .map((id) => snapshot?.markets?.find((market) => market.id === id))
    .filter(Boolean);
  const content = markets.length
    ? `<div class="personal-market-grid">${markets.map((market) => `
        <button type="button" class="personal-market-item" data-dashboard-market="${escapeHtml(market.id)}" data-tone="${getMarketTone(market)}">
          <span>${escapeHtml(market.name)}</span>
          <strong>${escapeHtml(formatMarketValue(market))}</strong>
          <em>${escapeHtml(formatSignedPercent(market.changePercent))}</em>
          <small>${escapeHtml(market.marketStateLabel || "장 상태 확인 중")} · ${escapeHtml(market.tradingDate || "거래일 미확인")}</small>
        </button>
      `).join("")}</div>`
    : renderEmpty(
        "관심 시장이 아직 없습니다.",
        "프로필에서 자주 확인할 시장을 추가하면 오늘 등락이 여기에 모입니다.",
        '<button type="button" data-dashboard-profile>관심 시장 설정</button>'
      );
  return `
    <section class="personal-dashboard-section personal-markets">
      ${renderSectionHeading("WATCHED MARKETS", "관심 시장 오늘 등락", "현재값, 당일 등락과 장 상태를 같은 기준으로 표시합니다.")}
      ${content}
    </section>
  `;
}

function renderCompanies(watchlists, snapshot) {
  const watchedIds = watchlists
    .filter((row) => row.item_type === "company")
    .map((row) => row.target_id);
  const companies = watchedIds.map((id) => companyById.get(id)).filter(Boolean);
  const content = companies.length
    ? `<div class="personal-company-list">${companies.map((company) => {
        const industry = industryById.get(company.sectorId);
        const headlines = matchCompanyHeadlines(company, snapshot?.headlines || []);
        const sourceUrl = safeUrl(company.source?.url);
        return `
          <article class="personal-company-item">
            <header>
              <div>
                <span>${escapeHtml(industry?.shortLabel || company.country || "기업")}</span>
                <h4>${escapeHtml(company.name)}</h4>
                <p>${escapeHtml(company.ticker || company.country || "")}</p>
              </div>
              <button type="button" data-dashboard-company="${escapeHtml(company.id)}" data-industry="${escapeHtml(company.sectorId || "")}">산업에서 보기</button>
            </header>
            <dl>
              <div><dt>최근 매출</dt><dd>${escapeHtml(company.revenue || "공식 수치 없음")}</dd></div>
              <div><dt>매출 변화</dt><dd data-tone="${Number(company.revenueGrowth) >= 0 ? "up" : "down"}">${Number.isFinite(Number(company.revenueGrowth)) ? `${Number(company.revenueGrowth) > 0 ? "+" : ""}${numberFormatter.format(company.revenueGrowth)}%` : "계산 불가"}</dd></div>
              <div><dt>기준</dt><dd>${escapeHtml(company.fiscal || "회계기간 미확인")}</dd></div>
            </dl>
            <p class="personal-company-signal">${escapeHtml(company.profitability || company.cashSignal || "실적 설명 준비 중")}</p>
            <div class="personal-company-news">
              <strong>관련 주요 뉴스</strong>
              ${headlines.length ? headlines.map((headline) => `
                <button type="button" data-dashboard-news="${escapeHtml(getHeadlineKey(headline))}">
                  <span>${escapeHtml(headline.source || "출처 미확인")} · ${escapeHtml(headline.publishedAt ? dateTimeFormatter.format(new Date(headline.publishedAt)) : "게시일 미확인")}</span>
                  <b>${escapeHtml(headline.title)}</b>
                </button>
              `).join("") : "<p>최근 5일 선별 뉴스에서 이 기업과 직접 일치하는 기사가 없습니다.</p>"}
            </div>
            ${sourceUrl !== "#" ? `<a class="personal-source-link" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(company.source?.label || "공식 실적 원문")} <span aria-hidden="true">↗</span></a>` : ""}
          </article>
        `;
      }).join("")}</div>`
    : renderEmpty(
        "관심 기업이 아직 없습니다.",
        "기업을 추가하면 공식 실적 스냅샷과 최근 5일 관련 뉴스를 함께 보여줍니다.",
        '<button type="button" data-dashboard-profile>관심 기업 설정</button>'
      );
  return `
    <section class="personal-dashboard-section personal-companies">
      ${renderSectionHeading("COMPANY DESK", "관심 기업 주요 뉴스와 실적", "기사 제목은 최근 뉴스와 직접 일치할 때만 연결하며, 실적은 회사가 공표한 기준을 표시합니다.")}
      ${content}
    </section>
  `;
}

function renderIndicators(watchlists) {
  const watchedIds = watchlists
    .filter((row) => row.item_type === "indicator")
    .map((row) => row.target_id);
  const indicators = watchedIds.map(resolveIndicator).filter(Boolean);
  const content = indicators.length
    ? `<div class="personal-indicator-grid">${indicators.map((indicator) => {
        const sourceUrl = safeUrl(indicator.sourceUrl);
        return `
          <button type="button" class="personal-indicator-item" data-dashboard-indicator="${escapeHtml(indicator.id)}">
            <span>${escapeHtml(indicator.geography)} · ${escapeHtml(indicator.year ? `${indicator.year}년` : "기준연도 미확인")}</span>
            <strong>${escapeHtml(indicator.shortName || indicator.name)}</strong>
            <b>${escapeHtml(formatIndicatorValue(indicator))}</b>
            <p>${escapeHtml(indicator.description || "설명 준비 중")}</p>
            <small>${escapeHtml(indicator.source || "원자료 미확인")}${sourceUrl === "#" ? "" : " · 원자료 연결됨"}</small>
          </button>
        `;
      }).join("")}</div>`
    : renderEmpty(
        "관심 지표가 아직 없습니다.",
        "출산율, 물가, 성장률, 고용과 자원 생산량 중 필요한 지표를 프로필에 추가할 수 있습니다.",
        '<button type="button" data-dashboard-profile>관심 지표 설정</button>'
      );
  return `
    <section class="personal-dashboard-section personal-indicators">
      ${renderSectionHeading("WATCHED INDICATORS", "관심 경제지표 최신 수치", `검증 데이터 수집 기준 ${indicatorSnapshot.dataUpdatedAt || "확인 중"}`)}
      ${content}
    </section>
  `;
}

function renderSchedule(now) {
  const schedule = buildTodaySchedule(now);
  return `
    <section class="personal-dashboard-section personal-calendar">
      ${renderSectionHeading("TODAY", "오늘 예정된 경제 일정", `${schedule.dateKey} · 한국시간`)}
      <ol class="personal-schedule-list">
        ${schedule.items.map((item) => `
          <li data-tone="${escapeHtml(item.tone)}">
            <time>${escapeHtml(item.time)}</time>
            <div><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(item.detail)}</span></div>
          </li>
        `).join("")}
      </ol>
      <p class="personal-data-note">${escapeHtml(schedule.caveat)}</p>
    </section>
  `;
}

function renderLearning(profileState, weekly) {
  const recentTerms = (profileState.dashboard?.learningHistory || []).slice(0, 6);
  const mistakes = (profileState.dashboard?.quizAttempts || [])
    .filter((attempt) => attempt.correct === false)
    .slice(0, 6)
    .map(resolveQuizAttempt);
  return `
    <section class="personal-dashboard-section personal-learning">
      ${renderSectionHeading("LEARNING REVIEW", "이번 주 학습과 복습", "최근 본 용어와 틀린 문제를 다음 행동으로 바로 연결합니다.")}
      <div class="personal-week-summary">
        <div><span>이번 주 XP</span><strong data-tone="${weekly.xp >= 0 ? "up" : "down"}">${weekly.xp > 0 ? "+" : ""}${weekly.xp.toLocaleString("ko-KR")}</strong></div>
        <div><span>활동일</span><strong>${weekly.activeDays}일</strong></div>
        <div><span>퀴즈</span><strong>${weekly.correct}/${weekly.attempts}</strong><small>정답/도전</small></div>
        <div><span>본 용어</span><strong>${weekly.terms}개</strong></div>
      </div>
      <div class="personal-review-columns">
        <section>
          <header><strong>최근 학습한 용어</strong><button type="button" data-dashboard-chapter="glossary">용어 사전</button></header>
          ${recentTerms.length ? `<div class="personal-term-list">${recentTerms.map((item) => `
            <button type="button" data-dashboard-term="${escapeHtml(item.label)}">
              <span>${escapeHtml(item.category || "경제용어")}</span>
              <strong>${escapeHtml(item.label)}</strong>
              <time>${escapeHtml(item.viewed_at ? dateTimeFormatter.format(new Date(item.viewed_at)) : "시각 미확인")}</time>
            </button>
          `).join("")}</div>` : renderEmpty("아직 기록된 용어가 없습니다.", "용어 설명을 펼치면 최근 학습 목록에 기록됩니다.")}
        </section>
        <section>
          <header><strong>틀린 퀴즈</strong><button type="button" data-dashboard-chapter="quiz">퀴즈 복습</button></header>
          ${mistakes.length ? `<div class="personal-mistake-list">${mistakes.map((item) => `
            <article>
              <span>${escapeHtml(item.type)}</span>
              <strong>${escapeHtml(item.prompt)}</strong>
              <p>${escapeHtml(item.explanation)}</p>
              ${item.term ? `<button type="button" data-dashboard-term="${escapeHtml(item.term)}">용어 다시 보기</button>` : ""}
            </article>
          `).join("")}</div>` : renderEmpty("최근 틀린 문제가 없습니다.", "오답이 생기면 최신 문제부터 복습할 수 있게 표시합니다.")}
        </section>
      </div>
    </section>
  `;
}

function hasSavedAnalysis(article = {}) {
  const analysis = article.analysis;
  return analysis && typeof analysis === "object" && Object.keys(analysis).length > 0;
}

function renderSavedArticles(profileState) {
  const articles = (profileState.dashboard?.savedArticles || []).slice(0, 12);
  const content = articles.length
    ? `<div class="personal-saved-list">${articles.map((article) => {
        const url = safeUrl(article.original_url);
        const analysis = hasSavedAnalysis(article) ? article.analysis : null;
        const points = Array.isArray(analysis?.keyPoints) ? analysis.keyPoints.slice(0, 3) : [];
        return `
          <article class="personal-saved-item">
            <header>
              <div>
                <span>${escapeHtml(article.section || "저장 기사")} · ${escapeHtml(article.source || "출처 미확인")}</span>
                <h4>${escapeHtml(article.title)}</h4>
                <time>${escapeHtml(article.published_at ? dateTimeFormatter.format(new Date(article.published_at)) : "게시일 미확인")}</time>
              </div>
              <button type="button" data-dashboard-remove-saved="${escapeHtml(article.article_key)}" aria-label="저장 기사 삭제" title="저장 해제">×</button>
            </header>
            ${analysis ? `
              <details>
                <summary>저장한 분석 보기</summary>
                <p>${escapeHtml(analysis.summary || "요약문이 저장되지 않았습니다.")}</p>
                ${points.length ? `<ul>${points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>` : ""}
              </details>
            ` : '<p class="personal-saved-no-analysis">기사만 저장되었습니다. 뉴스에서 상세 요약을 연 뒤 다시 저장하면 분석도 함께 보관됩니다.</p>'}
            <div class="personal-saved-actions">
              ${url !== "#" ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">원문 보기 <span aria-hidden="true">↗</span></a>` : "<span>원문 주소 없음</span>"}
              <button type="button" data-dashboard-current-news="${escapeHtml(article.article_key)}">현재 뉴스에서 찾기</button>
            </div>
          </article>
        `;
      }).join("")}</div>`
    : renderEmpty(
        "저장한 기사와 분석이 없습니다.",
        "뉴스의 저장 버튼을 누르면 기사 메타데이터와 선택한 분석만 계정에 보관합니다.",
        '<button type="button" data-dashboard-chapter="news">뉴스 보러 가기</button>'
      );
  return `
    <section class="personal-dashboard-section personal-saved">
      ${renderSectionHeading("READING LIST", "저장한 기사와 분석", "기사 원문 HTML이나 이미지는 저장하지 않고 제목, 출처, 링크와 선택한 분석만 보관합니다.")}
      ${content}
    </section>
  `;
}

function renderSignedOut(root, profileState) {
  const unavailable = profileState?.available === false;
  root.innerHTML = `
    <section class="personal-dashboard-welcome">
      <span>MY ECONOMY</span>
      <h2>나의 경제 대시보드</h2>
      <p>${unavailable ? "프로필 연결을 확인하지 못했습니다. 경제 정보는 계속 이용할 수 있습니다." : "로그인하면 관심 시장·기업·지표와 학습 기록을 한 화면에서 이어서 볼 수 있습니다."}</p>
      <button type="button" data-dashboard-sign-in ${unavailable ? "disabled" : ""}>${unavailable ? "프로필 연결 확인 필요" : "Google로 시작"}</button>
      <small>로그인 전에는 개인 관심목록과 학습 기록을 임의로 만들거나 표시하지 않습니다.</small>
    </section>
  `;
}

function renderDashboard(root, profileState, snapshot, now = new Date()) {
  if (!profileState?.authenticated) {
    renderSignedOut(root, profileState);
    return;
  }
  const weekly = buildWeeklyLearningSummary(profileState.dashboard, now);
  const xp = Math.max(0, Number(profileState.progress?.xp) || 0);
  const tier = getProfileTierProgress(xp);
  const storageReady = profileState.dashboard?.storageReady !== false;
  const loading = profileState.dashboard?.status === "loading";
  const loadError = profileState.dashboard?.status === "error"
    ? profileState.dashboard?.error || "일부 개인 기록을 불러오지 못했습니다."
    : "";
  const watchlists = profileState.watchlists || [];
  const updatedAt = snapshot?.generatedAt ? parseDate(snapshot.generatedAt) : null;

  root.innerHTML = `
    <div class="personal-dashboard-shell">
      <header class="personal-dashboard-head">
        <div>
          <span>MY ECONOMY</span>
          <h2>${escapeHtml(profileState.profile?.nickname || "사용자")}님의 경제 대시보드</h2>
          <p>관심 흐름과 학습 기록을 현재 검증 데이터에 연결합니다.</p>
        </div>
        <div class="personal-dashboard-head-actions">
          <time>${updatedAt ? `시장 자료 ${escapeHtml(timeFormatter.format(updatedAt))} 기준` : "시장 자료 확인 중"}</time>
          <button type="button" data-dashboard-profile>관심 설정</button>
        </div>
      </header>
      <div class="personal-dashboard-status">
        <div><span>현재 티어</span><strong style="--personal-tier:${escapeHtml(tier.current.color)}">${escapeHtml(tier.current.label)}</strong><small>${xp.toLocaleString("ko-KR")} XP</small></div>
        <div><span>관심 항목</span><strong>${watchlists.length}</strong><small>시장·기업·지표</small></div>
        <div><span>이번 주 학습</span><strong>${weekly.attempts + weekly.terms}</strong><small>퀴즈·용어</small></div>
        <div><span>이번 주 XP</span><strong data-tone="${weekly.xp >= 0 ? "up" : "down"}">${weekly.xp > 0 ? "+" : ""}${weekly.xp}</strong><small>월요일부터</small></div>
      </div>
      ${!storageReady ? `
        <div class="personal-storage-warning" role="status">
          <strong>개인 대시보드 저장 준비가 필요합니다.</strong>
          <p>시장·기업과 기존 XP는 표시되지만 관심 지표, 최근 용어와 저장 기사는 새 데이터베이스 마이그레이션 적용 후 계정에 저장됩니다.</p>
        </div>
      ` : loadError ? `
        <div class="personal-storage-error" role="alert">
          <strong>일부 개인 기록을 불러오지 못했습니다.</strong>
          <p>${escapeHtml(loadError)} 시장·기업·지표의 현재 자료는 계속 확인할 수 있습니다.</p>
          <button type="button" data-dashboard-retry>다시 불러오기</button>
        </div>
      ` : loading ? '<div class="personal-storage-loading" role="status">학습 기록과 저장 기사를 불러오는 중입니다.</div>' : ""}
      ${renderMarkets(watchlists, snapshot)}
      ${renderCompanies(watchlists, snapshot)}
      <div class="personal-dashboard-split">
        ${renderIndicators(watchlists)}
        ${renderSchedule(now)}
      </div>
      ${renderLearning(profileState, weekly)}
      ${renderSavedArticles(profileState)}
      <p class="personal-dashboard-footnote">개인 대시보드는 투자 판단을 대신하지 않습니다. 누락 자료는 0으로 바꾸지 않고 ‘자료 없음’으로 표시합니다.</p>
    </div>
  `;
}

export function initPersonalDashboard({
  root = document.querySelector("#personalDashboard"),
  getSnapshot = () => null,
  getProfileController = () => null,
  onOpenProfile = () => {},
  onSignIn = () => {},
  onNavigate = () => {},
  onOpenNewsAnalysis = () => {},
  updateHeight = () => {}
} = {}) {
  if (!root) return { updateSnapshot() {}, destroy() {} };

  let snapshot = getSnapshot();
  let profile = getProfileController();
  let profileState = profile?.getDashboardState?.() || {
    available: Boolean(profile),
    authenticated: false
  };
  let unsubscribe = null;

  const render = () => {
    renderDashboard(root, profileState, snapshot);
    requestAnimationFrame(updateHeight);
  };

  const bindProfile = () => {
    profile = getProfileController();
    unsubscribe?.();
    unsubscribe = profile?.subscribeDashboard?.((nextState) => {
      profileState = nextState;
      render();
    }) || null;
    profileState = profile?.getDashboardState?.() || {
      available: Boolean(profile),
      authenticated: false
    };
    void profile?.loadDashboardData?.();
  };

  root.addEventListener("click", async (event) => {
    const profileButton = event.target.closest?.("[data-dashboard-profile]");
    if (profileButton) {
      onOpenProfile();
      return;
    }
    if (event.target.closest?.("[data-dashboard-sign-in]")) {
      await onSignIn();
      return;
    }
    if (event.target.closest?.("[data-dashboard-retry]")) {
      await profile?.loadDashboardData?.({ force: true });
      return;
    }
    const marketButton = event.target.closest?.("[data-dashboard-market]");
    if (marketButton) {
      onNavigate({ type: "market", id: marketButton.dataset.dashboardMarket });
      return;
    }
    const indicatorButton = event.target.closest?.("[data-dashboard-indicator]");
    if (indicatorButton) {
      onNavigate({ type: "indicator", id: indicatorButton.dataset.dashboardIndicator });
      return;
    }
    const companyButton = event.target.closest?.("[data-dashboard-company]");
    if (companyButton) {
      onNavigate({
        type: "company",
        id: companyButton.dataset.dashboardCompany,
        industry: companyButton.dataset.industry
      });
      return;
    }
    const termButton = event.target.closest?.("[data-dashboard-term]");
    if (termButton) {
      onNavigate({ type: "term", label: termButton.dataset.dashboardTerm });
      return;
    }
    const chapterButton = event.target.closest?.("[data-dashboard-chapter]");
    if (chapterButton) {
      onNavigate({ type: "chapter", chapter: chapterButton.dataset.dashboardChapter });
      return;
    }
    const newsButton = event.target.closest?.("[data-dashboard-news]");
    if (newsButton) {
      const headline = snapshot?.headlines?.find(
        (item) => getHeadlineKey(item) === newsButton.dataset.dashboardNews
      );
      if (headline) onOpenNewsAnalysis(headline);
      return;
    }
    const currentNewsButton = event.target.closest?.("[data-dashboard-current-news]");
    if (currentNewsButton) {
      const key = currentNewsButton.dataset.dashboardCurrentNews;
      const headline = snapshot?.headlines?.find(
        (item) => profile?.getArticleKey?.(item) === key
      );
      if (headline) onOpenNewsAnalysis(headline);
      else onNavigate({ type: "chapter", chapter: "news" });
      return;
    }
    const removeButton = event.target.closest?.("[data-dashboard-remove-saved]");
    if (removeButton) {
      removeButton.disabled = true;
      await profile?.removeSavedArticle?.(removeButton.dataset.dashboardRemoveSaved);
    }
  });

  bindProfile();
  render();

  return {
    updateSnapshot(nextSnapshot) {
      snapshot = nextSnapshot;
      render();
    },
    refreshProfile() {
      bindProfile();
      render();
    },
    destroy() {
      unsubscribe?.();
    }
  };
}
