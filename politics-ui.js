import {
  countrySnapshots,
  lawChanges,
  politicalCalendar,
  politicalTransmissionPaths,
  politicsMeta
} from "./politics-data.js?v=87";

const viewIds = ["overview", "laws", "countries", "news"];
const lawStatusOrder = ["in-force", "upcoming", "rulemaking"];
const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
});

const documentRef = globalThis.document;
const initialParams = globalThis.location
  ? new URLSearchParams(globalThis.location.search)
  : new URLSearchParams();
const requestedView = initialParams.get("politics");
const requestedCountry = initialParams.get("country");

const viewState = {
  view: viewIds.includes(requestedView) ? requestedView : "overview",
  country: countrySnapshots.some((country) => country.id === requestedCountry)
    ? requestedCountry
    : "korea",
  jurisdiction: "전체",
  lawStatus: "all",
  snapshot: null
};

let updateChapterHeight = () => {};
let getCurrentSnapshot = () => null;

const elements = {
  update: documentRef?.querySelector("#politicsUpdate"),
  tabs: documentRef?.querySelector("#politicsViewTabs"),
  body: documentRef?.querySelector("#politicsBody")
};

export function initPoliticsChapter({
  updateHeight = () => {},
  getSnapshot = () => null
} = {}) {
  updateChapterHeight = updateHeight;
  getCurrentSnapshot = getSnapshot;
  viewState.snapshot = getCurrentSnapshot();

  elements.tabs?.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-politics-view]");
    if (!button) return;
    setView(button.dataset.politicsView);
  });

  elements.body?.addEventListener("click", (event) => {
    const viewButton = event.target.closest?.("[data-politics-open-view]");
    if (viewButton) {
      if (viewButton.dataset.politicsCountry) {
        viewState.country = viewButton.dataset.politicsCountry;
      }
      setView(viewButton.dataset.politicsOpenView);
      return;
    }

    const jurisdictionButton = event.target.closest?.("[data-law-jurisdiction]");
    if (jurisdictionButton) {
      viewState.jurisdiction = jurisdictionButton.dataset.lawJurisdiction;
      renderPoliticsChapter();
      return;
    }

    const statusButton = event.target.closest?.("[data-law-status]");
    if (statusButton) {
      viewState.lawStatus = statusButton.dataset.lawStatus;
      renderPoliticsChapter();
      return;
    }

    const countryButton = event.target.closest?.("[data-politics-country]");
    if (countryButton) {
      viewState.country = countryButton.dataset.politicsCountry;
      updateLocation();
      renderPoliticsChapter();
    }
  });

  renderPoliticsChapter();
  return {
    updateSnapshot(snapshot) {
      viewState.snapshot = snapshot;
      if (viewState.view === "overview" || viewState.view === "news") {
        renderPoliticsChapter();
      }
    }
  };
}

function setView(view) {
  if (!viewIds.includes(view)) return;
  viewState.view = view;
  updateLocation();
  renderPoliticsChapter();
}

function updateLocation() {
  if (!globalThis.location || !globalThis.history) return;
  const url = new URL(globalThis.location.href);
  url.searchParams.set("politics", viewState.view);
  if (viewState.view === "countries") url.searchParams.set("country", viewState.country);
  else url.searchParams.delete("country");
  globalThis.history.replaceState(null, "", url);
}

function renderPoliticsChapter() {
  if (!elements.body) return;
  if (elements.update) {
    const newsAt = viewState.snapshot?.dataQuality?.newsFetchedAt;
    const newsLabel = newsAt
      ? ` · 뉴스 ${formatDate(newsAt)}`
      : "";
    elements.update.textContent = `${politicsMeta.updatedAt.replaceAll("-", ".")} 구조 기준${newsLabel}`;
  }

  elements.tabs?.querySelectorAll("[data-politics-view]").forEach((button) => {
    const selected = button.dataset.politicsView === viewState.view;
    button.setAttribute("aria-selected", String(selected));
  });

  if (viewState.view === "laws") {
    renderLaws();
  } else if (viewState.view === "countries") {
    renderCountries();
  } else if (viewState.view === "news") {
    renderPoliticsNews();
  } else {
    renderOverview();
  }
  requestAnimationFrame(updateChapterHeight);
}

function renderOverview() {
  const politicalNews = selectPoliticalHeadlines(viewState.snapshot?.headlines || []);
  const effectiveCount = lawChanges.filter((law) => law.status === "in-force").length;
  const nextCalendar = politicalCalendar.find((item) => item.tone === "upcoming");

  elements.body.innerHTML = `
    <section class="politics-overview">
      <div class="politics-summary-rail" aria-label="정치 정보 요약">
        <div class="politics-summary-primary">
          <span>현재 범위</span>
          <strong>${countrySnapshots.length}개 국가·권역</strong>
          <p>공식 직책과 공개 정책 기준</p>
        </div>
        <div>
          <span>법·제도 변화</span>
          <strong>${lawChanges.length}건</strong>
          <p>시행 중 ${effectiveCount} · 예정·규칙 마련 ${lawChanges.length - effectiveCount}</p>
        </div>
        <div>
          <span>정치 뉴스</span>
          <strong>${viewState.snapshot ? `${politicalNews.length}건` : "수집 확인 중"}</strong>
          <p>경제 전달 경로가 있는 기사만</p>
        </div>
        <div>
          <span>다음 일정</span>
          <strong>${escapeHtml(nextCalendar?.date || "일정 확인")}</strong>
          <p>${escapeHtml(nextCalendar?.title || "공식 일정을 확인합니다.")}</p>
        </div>
      </div>

      <div class="politics-overview-layout">
        <section class="politics-transmission" aria-labelledby="politicsTransmissionTitle">
          <header class="politics-section-heading">
            <div>
              <p class="section-kicker">정치에서 경제까지</p>
              <h3 id="politicsTransmissionTitle">뉴스를 숫자로 연결하는 4개 경로</h3>
            </div>
            <span>평가 점수 없음</span>
          </header>
          <div class="politics-path-list">
            ${politicalTransmissionPaths.map((item) => `
              <article>
                <i>${item.order}</i>
                <div>
                  <span>${escapeHtml(item.label)}</span>
                  <strong>${escapeHtml(item.lead)}</strong>
                  <ol>
                    ${item.path.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
                  </ol>
                  <p>${escapeHtml(item.checkpoint)}</p>
                </div>
              </article>
            `).join("")}
          </div>
        </section>

        <aside class="politics-calendar" aria-labelledby="politicsCalendarTitle">
          <header class="politics-section-heading">
            <div>
              <p class="section-kicker">입법·정치 일정</p>
              <h3 id="politicsCalendarTitle">앞으로 확인할 날짜</h3>
            </div>
          </header>
          <div class="politics-calendar-list">
            ${politicalCalendar.map((item) => `
              <article data-tone="${escapeHtml(item.tone)}">
                <time datetime="${escapeHtml(item.date)}">${escapeHtml(item.date)}</time>
                <div>
                  <span>${escapeHtml(item.jurisdiction)}</span>
                  <strong>${escapeHtml(item.title)}</strong>
                  <p>${escapeHtml(item.detail)}</p>
                </div>
              </article>
            `).join("")}
          </div>
        </aside>
      </div>

      <section class="politics-country-directory" aria-labelledby="politicsDirectoryTitle">
        <header class="politics-section-heading">
          <div>
            <p class="section-kicker">국가별 상황</p>
            <h3 id="politicsDirectoryTitle">누가 결정하고 경제에 어떻게 닿는가</h3>
          </div>
          <button type="button" data-politics-open-view="countries">전체 비교 보기</button>
        </header>
        <div class="politics-country-strip">
          ${countrySnapshots.map((country) => `
            <button type="button" data-politics-open-view="countries" data-politics-country="${escapeHtml(country.id)}">
              <i>${escapeHtml(country.code)}</i>
              <span>${escapeHtml(country.region)}</span>
              <strong>${escapeHtml(country.name)}</strong>
              <em>${escapeHtml(country.leadership)}</em>
              <p>${escapeHtml(country.agenda[0])}</p>
            </button>
          `).join("")}
        </div>
      </section>

      <details class="politics-method">
        <summary>정치 상황 정리 기준과 한계 보기</summary>
        <div>
          <section>
            <span>포함하는 것</span>
            <p>${escapeHtml(politicsMeta.principle)}</p>
          </section>
          <section>
            <span>출처 읽는 법</span>
            <p>${escapeHtml(politicsMeta.sourcePolicy)}</p>
          </section>
          <section>
            <span>업데이트 구분</span>
            <p>국가·법률 설명은 ${escapeHtml(politicsMeta.updatedAt)} 기준으로 검증한 정적 자료이며, 정치 뉴스만 서버 스냅샷 주기에 맞춰 갱신됩니다.</p>
          </section>
        </div>
      </details>
    </section>
  `;
}

function renderLaws() {
  const jurisdictions = ["전체", ...new Set(lawChanges.map((law) => law.jurisdiction))];
  const visibleLaws = lawChanges
    .filter((law) => viewState.jurisdiction === "전체" || law.jurisdiction === viewState.jurisdiction)
    .filter((law) => viewState.lawStatus === "all" || law.status === viewState.lawStatus)
    .sort((left, right) => {
      const statusDifference = lawStatusOrder.indexOf(left.status) - lawStatusOrder.indexOf(right.status);
      return statusDifference || left.jurisdiction.localeCompare(right.jurisdiction, "ko");
    });

  elements.body.innerHTML = `
    <section class="politics-laws">
      <header class="politics-feature-intro">
        <div>
          <p class="section-kicker">법·제도 변화</p>
          <h3>통과와 시행을 구분해서 보기</h3>
          <p>제목만 읽지 않고 적용 대상, 시행일, 경제 경로와 추가 확인사항을 함께 정리했습니다.</p>
        </div>
        <aside>
          <span>현재 표시</span>
          <strong>${visibleLaws.length}<small> / ${lawChanges.length}건</small></strong>
          <em>${escapeHtml(politicsMeta.updatedAt)} 확인</em>
        </aside>
      </header>

      <div class="politics-law-toolbar">
        <div class="politics-law-filter" role="group" aria-label="법률 국가 필터">
          <span>국가·권역</span>
          <div>
            ${jurisdictions.map((jurisdiction) => {
              const count = jurisdiction === "전체"
                ? lawChanges.length
                : lawChanges.filter((law) => law.jurisdiction === jurisdiction).length;
              return `
                <button type="button" data-law-jurisdiction="${escapeHtml(jurisdiction)}" aria-pressed="${viewState.jurisdiction === jurisdiction}">
                  ${escapeHtml(jurisdiction)} <em>${count}</em>
                </button>
              `;
            }).join("")}
          </div>
        </div>
        <div class="politics-law-filter" role="group" aria-label="법률 상태 필터">
          <span>진행 상태</span>
          <div>
            ${[
              ["all", "전체"],
              ["in-force", "시행 중"],
              ["upcoming", "시행 예정"],
              ["rulemaking", "하위규칙·단계 시행"]
            ].map(([status, label]) => `
              <button type="button" data-law-status="${status}" aria-pressed="${viewState.lawStatus === status}">
                ${label}
              </button>
            `).join("")}
          </div>
        </div>
      </div>

      <div class="politics-law-list">
        ${visibleLaws.length
          ? visibleLaws.map(renderLawChange).join("")
          : `
            <div class="politics-empty">
              <strong>선택한 조건에 맞는 법·제도 항목이 없습니다.</strong>
              <p>다른 국가 또는 진행 상태를 선택해 확인하세요.</p>
            </div>
          `}
      </div>
      <p class="politics-legal-note">${escapeHtml(politicsMeta.legalNotice)}</p>
    </section>
  `;
}

function renderLawChange(law) {
  const sourceUrl = safeExternalUrl(law.source.url);
  const secondaryUrl = law.secondarySource
    ? safeExternalUrl(law.secondarySource.url)
    : "";
  return `
    <details class="politics-law-item" data-status="${escapeHtml(law.status)}">
      <summary>
        <div class="politics-law-marker">
          <span>${escapeHtml(law.jurisdiction)}</span>
          <em>${escapeHtml(law.statusLabel)}</em>
        </div>
        <div class="politics-law-title">
          <span>${escapeHtml(law.shortTitle)}</span>
          <strong>${escapeHtml(law.title)}</strong>
          <p>${escapeHtml(law.plain)}</p>
        </div>
        <div class="politics-law-date">
          <span>적용·시행</span>
          <strong>${escapeHtml(law.effectiveAt)}</strong>
          <em>${escapeHtml(law.scope)}</em>
        </div>
      </summary>
      <div class="politics-law-detail">
        <section class="politics-law-change">
          <span>정확히 무엇이 달라졌나</span>
          <ol>
            ${law.changes.map((change) => `<li>${escapeHtml(change)}</li>`).join("")}
          </ol>
        </section>
        <section class="politics-law-economy">
          <span>경제에 닿는 경로</span>
          <p>${escapeHtml(law.economy)}</p>
        </section>
        <section>
          <span>영향을 받는 곳</span>
          <ul>${law.affected.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </section>
        <section>
          <span>추가로 확인할 것</span>
          <ul>${law.verify.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </section>
        <footer>
          <div>
            <span>원자료 제공기관</span>
            <strong>${escapeHtml(law.source.publisher)}</strong>
            <em>공포·성립 ${escapeHtml(law.enactedAt)}</em>
          </div>
          <div class="politics-source-links">
            <a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(law.source.label)} <span aria-hidden="true">↗</span></a>
            ${secondaryUrl ? `<a href="${escapeHtml(secondaryUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(law.secondarySource.label)} <span aria-hidden="true">↗</span></a>` : ""}
          </div>
        </footer>
      </div>
    </details>
  `;
}

function renderCountries() {
  const selected = countrySnapshots.find((country) => country.id === viewState.country)
    || countrySnapshots[0];

  elements.body.innerHTML = `
    <section class="politics-countries">
      <header class="politics-feature-intro">
        <div>
          <p class="section-kicker">국가별 정치</p>
          <h3>제도·정책·경제 경로를 한 번에 보기</h3>
          <p>정당이나 인물을 평가하지 않고 현재 공식 지도부, 공개 의제와 시장에 전달되는 경로를 나눠 봅니다.</p>
        </div>
        <aside>
          <span>기준일</span>
          <strong>${politicsMeta.updatedAt.replaceAll("-", ".")}</strong>
          <em>공식 기관 확인</em>
        </aside>
      </header>

      <nav class="politics-country-tabs" role="tablist" aria-label="국가 선택">
        ${countrySnapshots.map((country) => `
          <button type="button" role="tab" data-politics-country="${escapeHtml(country.id)}" aria-selected="${country.id === selected.id}">
            <i>${escapeHtml(country.code)}</i>
            <span>${escapeHtml(country.region)}</span>
            <strong>${escapeHtml(country.name)}</strong>
          </button>
        `).join("")}
      </nav>

      <article class="politics-country-detail">
        <header>
          <div class="politics-country-identity">
            <i>${escapeHtml(selected.code)}</i>
            <div>
              <span>${escapeHtml(selected.system)}</span>
              <h3>${escapeHtml(selected.name)}</h3>
              <strong>${escapeHtml(selected.leadership)}</strong>
              <em>${escapeHtml(selected.leadershipDetail)}</em>
            </div>
          </div>
          <div class="politics-country-agenda">
            <span>현재 공개 의제</span>
            <div>${selected.agenda.map((item) => `<em>${escapeHtml(item)}</em>`).join("")}</div>
          </div>
        </header>

        <div class="politics-country-facts">
          <section>
            <span>제도적 사실</span>
            <p>${escapeHtml(selected.institution)}</p>
          </section>
          <section>
            <span>현재 상황 정리</span>
            <p>${escapeHtml(selected.currentState)}</p>
          </section>
        </div>

        <section class="politics-country-economy">
          <div class="politics-section-heading">
            <div>
              <p class="section-kicker">정책 전달 경로</p>
              <h4>경제에는 이렇게 연결됩니다</h4>
            </div>
          </div>
          <div>
            ${selected.economyLinks.map((link, index) => `
              <article>
                <i>${String(index + 1).padStart(2, "0")}</i>
                <span>${escapeHtml(link.title)}</span>
                <p>${escapeHtml(link.body)}</p>
              </article>
            `).join("")}
          </div>
        </section>

        <div class="politics-country-bottom">
          <section class="politics-country-watch">
            <span>앞으로 확인할 것</span>
            <ol>${selected.watch.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
          </section>
          <section class="politics-country-sources">
            <span>공식 확인 출처</span>
            <div>
              ${selected.sources.map((source) => `
                <a href="${escapeHtml(safeExternalUrl(source.url))}" target="_blank" rel="noopener noreferrer">
                  ${escapeHtml(source.label)} <span aria-hidden="true">↗</span>
                </a>
              `).join("")}
            </div>
            <p>정부 공식 자료는 해당 정부의 정책 입장을 담습니다. 사건·갈등 평가는 뉴스의 복수 출처와 함께 확인합니다.</p>
          </section>
        </div>
      </article>
    </section>
  `;
}

function renderPoliticsNews() {
  const snapshot = viewState.snapshot || getCurrentSnapshot();
  const headlines = selectPoliticalHeadlines(snapshot?.headlines || [], 14);
  const quality = snapshot?.dataQuality || {};
  const fetchedAt = quality.newsFetchedAt;
  const sourceMode = quality.newsSourceMode === "scheduled"
    ? "서버 예약 수집"
    : "실시간 보완 수집";

  elements.body.innerHTML = `
    <section class="politics-news">
      <header class="politics-feature-intro">
        <div>
          <p class="section-kicker">정치 뉴스</p>
          <h3>경제에 전달되는 정치·법률 기사</h3>
          <p>대통령·의회·정부·법안 기사 중 예산, 세금, 규제, 무역, 산업과 연결되는 기사만 기존 중복 제거 결과에서 다시 선별합니다.</p>
        </div>
        <aside>
          <span>${escapeHtml(sourceMode)}</span>
          <strong>${snapshot ? `${headlines.length}건` : "연결 확인"}</strong>
          <em>${fetchedAt ? formatDate(fetchedAt) : "갱신 시각 없음"}</em>
        </aside>
      </header>

      <div class="politics-news-quality">
        <div>
          <span>수집 주기</span>
          <strong>${Number(quality.newsRefreshMinutes) || 30}분 캐시</strong>
        </div>
        <div>
          <span>선별 원칙</span>
          <strong>최근성 · 경제 연결 · 중복 제거</strong>
        </div>
        <div>
          <span>내용 범위</span>
          <strong>기사 제목·출처 메타데이터</strong>
        </div>
      </div>

      <div class="politics-news-list">
        ${!snapshot
          ? `
            <div class="politics-empty politics-empty-error">
              <strong>정치 뉴스를 불러오지 못했습니다.</strong>
              <p>자료가 복구될 때까지 임의 기사나 예측 요약을 대신 표시하지 않습니다.</p>
            </div>
          `
          : headlines.length
            ? headlines.map((headline, index) => renderPoliticalHeadline(headline, index)).join("")
            : `
              <div class="politics-empty">
                <strong>현재 선별 기준을 통과한 정치·경제 기사가 없습니다.</strong>
                <p>수를 맞추기 위해 오래되거나 경제 관련성이 낮은 정치 기사를 채우지 않습니다.</p>
              </div>
            `}
      </div>
      <p class="politics-news-note">헤드라인은 사실 확정이 아니라 기사 단위 정보입니다. 원문과 후속 공식 발표를 확인하고, 기사 수정·삭제 가능성을 고려해야 합니다.</p>
    </section>
  `;
}

function renderPoliticalHeadline(headline, index) {
  const url = safeExternalUrl(headline.url);
  const jurisdiction = inferPoliticalJurisdiction(headline);
  const transmission = getPoliticalTransmission(headline);
  return `
    <article class="politics-news-item">
      <i>${String(index + 1).padStart(2, "0")}</i>
      <div>
        <div class="politics-news-meta">
          <span>${escapeHtml(jurisdiction)}</span>
          <em>${escapeHtml(headline.impactArea || "정책·제도")}</em>
          <strong data-tier="${escapeHtml(headline.sourceTier || "other")}">${escapeHtml(headline.importanceLabel || "선별")}</strong>
        </div>
        <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(headline.title || "제목 미확인")}</a>
        <p><span>경제 확인 경로</span>${escapeHtml(transmission)}</p>
        <footer>
          <span>${escapeHtml(headline.source || "출처 미확인")}</span>
          <time datetime="${escapeHtml(headline.publishedAt || "")}">${formatDate(headline.publishedAt, "게시일 미확인")}</time>
          ${Number(headline.relatedSourceCount) > 1 ? `<em>교차 ${Number(headline.relatedSourceCount)}곳</em>` : ""}
          <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">원문 보기 <span aria-hidden="true">↗</span></a>
        </footer>
      </div>
    </article>
  `;
}

export function selectPoliticalHeadlines(headlines = [], limit = 12) {
  const politicsPattern = /대통령|대통령실|청와대|국회|의회|상원|하원|백악관|내각|총리|정부|국무원|전인대|집행위원회|법안|법률|상법|시행령|예산안|선거|정당|관세|제재|규제/i;
  const economyPattern = /경제|예산|재정|세금|조세|금리|물가|관세|무역|수출|수입|산업|기업|노동|고용|부동산|금융|은행|AI|반도체|에너지|공급망|제재|투자|성장/i;
  const seenTitles = new Set();
  const seenUrls = new Set();

  return [...headlines]
    .filter((headline) => {
      const text = `${headline.title || ""} ${headline.topic || ""} ${headline.impactArea || ""}`;
      return headline.section === "politics"
        || (politicsPattern.test(text) && economyPattern.test(text));
    })
    .sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt))
    .filter((headline) => {
      const titleKey = normalizeText(headline.title);
      const urlKey = normalizeText(headline.url);
      if (
        !titleKey
        || seenTitles.has(titleKey)
        || (urlKey && seenUrls.has(urlKey))
      ) {
        return false;
      }
      seenTitles.add(titleKey);
      if (urlKey) seenUrls.add(urlKey);
      return true;
    })
    .slice(0, limit);
}

export function getPoliticalTransmission(headline = {}) {
  const text = `${headline.title || ""} ${headline.topic || ""}`;
  if (/관세|무역|수출통제|제재|공급망/i.test(text)) {
    return "정책 결정 → 교역 비용·물량 → 수출기업 이익·환율·물가";
  }
  if (/예산|재정|세금|조세|감세|보조금/i.test(text)) {
    return "법안·예산 → 가계 세부담·정부 지출 → 소비·투자·국채금리";
  }
  if (/금융|은행|가상자산|스테이블코인|자본시장|상법/i.test(text)) {
    return "법·감독 기준 → 자금조달·준수 비용 → 금융시장·기업가치";
  }
  if (/노동|고용|임금|노조/i.test(text)) {
    return "노동 제도 → 임금·교섭·고용 비용 → 소비와 기업 마진";
  }
  if (/AI|반도체|기술|에너지|산업/i.test(text)) {
    return "산업정책·규제 → 지원·준수 비용 → 설비투자·생산·경쟁";
  }
  return "정책 발표 → 법안·시행 여부 확인 → 기업·가계 행동 → 시장 가격";
}

export function inferPoliticalJurisdiction(headline = {}) {
  const text = `${headline.title || ""} ${headline.topic || ""}`;
  if (/한국|국내|대통령실|청와대|국회|기획재정부|금융위원회/i.test(text)) return "한국";
  if (/미국|트럼프|백악관|상원|하원|Congress|U\.S\./i.test(text)) return "미국";
  if (/중국|시진핑|국무원|전인대|China/i.test(text)) return "중국";
  if (/일본|다카이치|일본\s*내각|Japan/i.test(text)) return "일본";
  if (/러시아|푸틴|크렘린|Russia/i.test(text)) return "러시아";
  if (/EU|유럽연합|집행위원회|유럽의회|European Commission/i.test(text)) return "EU";
  if (/인도|모디|India/i.test(text)) return "인도";
  return "세계";
}

function formatDate(value, fallback = "기준시각 미확인") {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? dateFormatter.format(date) : fallback;
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^0-9a-z가-힣]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function safeExternalUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : "#";
  } catch {
    return "#";
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
