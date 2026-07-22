import {
  bookCategories,
  bookLevels,
  economicsBooks,
  officialResources,
  readingRoutes,
  resourceCategories,
  resourceGuides,
  resourceRegions
} from "./resource-library-data.js?v=73";

const bookById = new Map(economicsBooks.map((book) => [book.id, book]));
const resourceById = new Map(officialResources.map((resource) => [resource.id, resource]));

const state = {
  view: "books",
  bookQuery: "",
  bookLevel: "전체",
  bookCategory: "전체",
  bookRoute: "",
  resourceQuery: "",
  resourceRegion: "전체",
  resourceCategory: "전체"
};

let updateChapterHeight = () => {};

const elements = {
  count: document.querySelector("#resourceLibraryCount"),
  summary: document.querySelector("#resourceLibrarySummary"),
  tabs: document.querySelector("#resourceLibraryTabs"),
  body: document.querySelector("#resourceLibraryBody")
};

export function initResourceLibraryChapter({ updateHeight = () => {} } = {}) {
  if (!elements.body || !elements.tabs) return;
  updateChapterHeight = updateHeight;

  elements.tabs.addEventListener("click", handleTabClick);
  elements.body.addEventListener("click", handleBodyClick);
  elements.body.addEventListener("input", handleSearchInput);
  elements.body.addEventListener("toggle", () => requestAnimationFrame(updateChapterHeight), true);

  renderLibrary();
}

function handleTabClick(event) {
  const button = event.target.closest?.("[data-library-view]");
  if (!button) return;
  state.view = button.dataset.libraryView;
  renderLibrary();
}

function handleBodyClick(event) {
  const levelButton = event.target.closest?.("[data-book-level]");
  if (levelButton) {
    state.bookLevel = levelButton.dataset.bookLevel;
    state.bookRoute = "";
    renderBooksView();
    return;
  }

  const categoryButton = event.target.closest?.("[data-book-category]");
  if (categoryButton) {
    state.bookCategory = categoryButton.dataset.bookCategory;
    state.bookRoute = "";
    renderBooksView();
    return;
  }

  const routeButton = event.target.closest?.("[data-book-route]");
  if (routeButton) {
    const routeId = routeButton.dataset.bookRoute;
    state.bookRoute = state.bookRoute === routeId ? "" : routeId;
    state.bookLevel = "전체";
    state.bookCategory = "전체";
    state.bookQuery = "";
    renderBooksView();
    return;
  }

  const clearBookButton = event.target.closest?.("[data-clear-book-filters]");
  if (clearBookButton) {
    resetBookFilters();
    renderBooksView();
    return;
  }

  const regionButton = event.target.closest?.("[data-resource-region]");
  if (regionButton) {
    state.resourceRegion = regionButton.dataset.resourceRegion;
    renderResourcesView();
    return;
  }

  const resourceCategoryButton = event.target.closest?.("[data-resource-category]");
  if (resourceCategoryButton) {
    state.resourceCategory = resourceCategoryButton.dataset.resourceCategory;
    renderResourcesView();
    return;
  }

  const guideButton = event.target.closest?.("[data-resource-guide]");
  if (guideButton) {
    const guide = resourceGuides.find((item) => item.id === guideButton.dataset.resourceGuide);
    if (!guide) return;
    resetResourceFilters();

    renderResourcesView({ guideIds: guide.resourceIds });
    return;
  }

  const clearResourceButton = event.target.closest?.("[data-clear-resource-filters]");
  if (clearResourceButton) {
    resetResourceFilters();
    renderResourcesView();
  }
}

function handleSearchInput(event) {
  if (event.target.matches("#bookLibrarySearch")) {
    state.bookQuery = event.target.value;
    renderBookResults();
  }

  if (event.target.matches("#officialResourceSearch")) {
    state.resourceQuery = event.target.value;
    renderResourceResults();
  }
}

function renderLibrary() {
  elements.tabs.innerHTML = `
    <button type="button" role="tab" data-library-view="books" aria-selected="${state.view === "books"}">
      경제책 추천 <span>${economicsBooks.length}</span>
    </button>
    <button type="button" role="tab" data-library-view="resources" aria-selected="${state.view === "resources"}">
      공식 자료실 <span>${officialResources.length}</span>
    </button>
  `;

  elements.count.textContent = state.view === "books"
    ? `${economicsBooks.length}권 선별`
    : `${officialResources.length}개 공식 출처`;

  elements.summary.innerHTML = state.view === "books"
    ? `
      <div><span>읽는 기준</span><strong>난이도보다 목적부터</strong><p>처음에는 생활 사례, 다음은 개념과 통계, 마지막은 위기·제도 순서로 읽습니다.</p></div>
      <div><span>활용 방법</span><strong>책의 주장과 현재 자료 연결</strong><p>책에서 얻은 질문을 공식 자료실의 최신 통계로 다시 확인하세요.</p></div>
    `
    : `
      <div><span>자료 선택</span><strong>기관보다 질문부터</strong><p>한국 물가는 KOSIS, 금리·환율은 ECOS처럼 질문에 맞는 원출처를 선택합니다.</p></div>
      <div><span>숫자 확인</span><strong>단위·기간·잠정치 확인</strong><p>같은 지표도 기준과 발표 시점이 다릅니다. 표의 주석과 메타데이터까지 읽으세요.</p></div>
    `;

  if (state.view === "books") renderBooksView();
  else renderResourcesView();
}

function renderBooksView() {
  elements.body.innerHTML = `
    <section class="reading-paths" aria-labelledby="readingPathsTitle">
      <div class="library-section-heading">
        <div><span>추천 경로</span><h3 id="readingPathsTitle">목적에 맞춰 3권씩 읽기</h3></div>
        <p>순서를 누르면 해당 책만 아래에 모아 볼 수 있습니다.</p>
      </div>
      <div class="reading-path-grid">
        ${readingRoutes.map(renderReadingRoute).join("")}
      </div>
    </section>
    <section class="book-directory" aria-labelledby="bookDirectoryTitle">
      <div class="library-section-heading library-directory-heading">
        <div><span>책 목록</span><h3 id="bookDirectoryTitle">경제를 보는 힘을 키우는 책</h3></div>
        <p>번역본의 판·출판사는 달라질 수 있으므로 최신 판을 확인하세요.</p>
      </div>
      <div class="library-toolbar">
        <label class="library-search-field" for="bookLibrarySearch">
          <span>책·저자·주제 검색</span>
          <input id="bookLibrarySearch" type="search" value="${escapeAttribute(state.bookQuery)}" placeholder="예: 금리, 위기, 통계, 투자" autocomplete="off" spellcheck="false" />
        </label>
        <div class="library-filter-group" role="group" aria-label="책 난이도">
          <span>난이도</span>
          <div>${bookLevels.map((level) => renderFilterButton("book-level", level, state.bookLevel)).join("")}</div>
        </div>
      </div>
      <div class="library-category-row" role="group" aria-label="책 분야">
        ${bookCategories.map((category) => renderFilterButton("book-category", category, state.bookCategory)).join("")}
      </div>
      <div class="library-results-head">
        <p id="resourceLibraryResultCount" aria-live="polite"></p>
        <button type="button" data-clear-book-filters>전체 책 보기</button>
      </div>
      <div class="book-recommendation-grid" id="bookRecommendations"></div>
    </section>
  `;
  renderBookResults();
}

function renderReadingRoute(route, index) {
  const books = route.bookIds.map((id) => bookById.get(id)).filter(Boolean);
  const isActive = state.bookRoute === route.id;
  return `
    <button type="button" class="reading-path" data-book-route="${escapeAttribute(route.id)}" aria-pressed="${isActive}" data-tone="${index + 1}">
      <span>${String(index + 1).padStart(2, "0")} · ${escapeHtml(route.label)}</span>
      <strong>${escapeHtml(route.description)}</strong>
      <ol>${books.map((book) => `<li>${escapeHtml(book.title)}</li>`).join("")}</ol>
      <em>${isActive ? "선택됨" : "이 순서만 보기"}</em>
    </button>
  `;
}

function renderBookResults() {
  const resultElement = elements.body.querySelector("#bookRecommendations");
  const countElement = elements.body.querySelector("#resourceLibraryResultCount");
  if (!resultElement || !countElement) return;

  const normalizedQuery = normalizeText(state.bookQuery);
  const selectedRoute = readingRoutes.find((route) => route.id === state.bookRoute);
  const routeIds = new Set(selectedRoute?.bookIds || []);
  const books = economicsBooks.filter((book) => {
    const matchesRoute = !selectedRoute || routeIds.has(book.id);
    const matchesLevel = state.bookLevel === "전체" || book.level === state.bookLevel;
    const matchesCategory = state.bookCategory === "전체" || book.category === state.bookCategory;
    const searchable = normalizeText([
      book.title,
      book.author,
      book.category,
      book.oneLine,
      book.why,
      ...book.learn
    ].join(" "));
    return matchesRoute && matchesLevel && matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
  });

  const context = selectedRoute ? `‘${selectedRoute.label}’ 경로` : "선택 조건";
  countElement.textContent = `${context} · ${books.length}권`;
  resultElement.innerHTML = books.length
    ? books.map(renderBookCard).join("")
    : renderEmptyState("조건에 맞는 책이 없습니다.", "검색어를 줄이거나 전체 책 보기로 필터를 초기화해 보세요.");
  requestAnimationFrame(updateChapterHeight);
}

function renderBookCard(book, index) {
  return `
    <article class="book-recommendation-card" data-level="${escapeAttribute(book.level)}">
      <header>
        <div><span>${escapeHtml(book.category)}</span><em>${escapeHtml(book.level)}</em></div>
        <b>${String(index + 1).padStart(2, "0")}</b>
      </header>
      <div class="book-title-block">
        <h4>${escapeHtml(book.title)}</h4>
        <p>${escapeHtml(book.author)}</p>
      </div>
      <p class="book-one-line">${escapeHtml(book.oneLine)}</p>
      <dl class="book-meta">
        <div><dt>예상 독서</dt><dd>${escapeHtml(book.readingTime)}</dd></div>
        <div><dt>다음 책</dt><dd>${escapeHtml(book.next)}</dd></div>
      </dl>
      <details>
        <summary>추천 이유와 읽는 법</summary>
        <div class="book-detail">
          <section><span>왜 추천하나</span><p>${escapeHtml(book.why)}</p></section>
          <section><span>읽고 나면</span><ul>${book.learn.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
          <aside><span>주의해서 읽기</span><p>${escapeHtml(book.caution)}</p></aside>
        </div>
      </details>
    </article>
  `;
}

function renderResourcesView({ guideIds = null } = {}) {
  elements.body.innerHTML = `
    <section class="resource-guides" aria-labelledby="resourceGuidesTitle">
      <div class="library-section-heading">
        <div><span>빠른 길잡이</span><h3 id="resourceGuidesTitle">질문에서 공식 원자료까지</h3></div>
        <p>하나의 수치로 결론내리지 말고 서로 다른 기관의 정의와 시점을 비교하세요.</p>
      </div>
      <div class="resource-guide-grid">
        ${resourceGuides.map(renderResourceGuide).join("")}
      </div>
    </section>
    <section class="official-directory" aria-labelledby="officialDirectoryTitle">
      <div class="library-section-heading library-directory-heading">
        <div><span>공식 자료 목록</span><h3 id="officialDirectoryTitle">한국과 세계의 원자료 찾기</h3></div>
        <p>기관이 직접 운영하는 사이트만 모았습니다. 링크는 새 창에서 열립니다.</p>
      </div>
      <div class="library-toolbar official-toolbar">
        <label class="library-search-field" for="officialResourceSearch">
          <span>기관·지표·활용 목적 검색</span>
          <input id="officialResourceSearch" type="search" value="${escapeAttribute(guideIds ? "" : state.resourceQuery)}" placeholder="예: 출산율, 리튬, 환율, 수출, 기온" autocomplete="off" spellcheck="false" />
        </label>
        <div class="library-filter-group" role="group" aria-label="자료 지역">
          <span>지역</span>
          <div>${resourceRegions.map((region) => renderFilterButton("resource-region", region, state.resourceRegion)).join("")}</div>
        </div>
      </div>
      <div class="library-category-row resource-category-row" role="group" aria-label="자료 분야">
        ${resourceCategories.map((category) => renderFilterButton("resource-category", category, state.resourceCategory)).join("")}
      </div>
      <div class="library-results-head">
        <p id="officialResourceResultCount" aria-live="polite"></p>
        <button type="button" data-clear-resource-filters>전체 자료 보기</button>
      </div>
      <div class="official-resource-grid" id="officialResourceResults"></div>
    </section>
  `;

  if (guideIds) {
    const resultElement = elements.body.querySelector("#officialResourceResults");
    const countElement = elements.body.querySelector("#officialResourceResultCount");
    const resources = guideIds.map((id) => resourceById.get(id)).filter(Boolean);
    countElement.textContent = `길잡이에서 선택한 공식 자료 · ${resources.length}개`;
    resultElement.innerHTML = resources.map(renderOfficialResource).join("");
    requestAnimationFrame(updateChapterHeight);
    return;
  }

  renderResourceResults();
}

function renderResourceGuide(guide, index) {
  const resources = guide.resourceIds.map((id) => resourceById.get(id)).filter(Boolean);
  return `
    <button type="button" class="resource-guide" data-resource-guide="${escapeAttribute(guide.id)}" data-tone="${index + 1}">
      <span>${String(index + 1).padStart(2, "0")}</span>
      <strong>${escapeHtml(guide.label)}</strong>
      <p>${escapeHtml(guide.description)}</p>
      <em>${resources.map((resource) => escapeHtml(resource.organization)).join(" → ")}</em>
    </button>
  `;
}

function renderResourceResults() {
  const resultElement = elements.body.querySelector("#officialResourceResults");
  const countElement = elements.body.querySelector("#officialResourceResultCount");
  if (!resultElement || !countElement) return;

  const normalizedQuery = normalizeText(state.resourceQuery);
  const resources = officialResources.filter((resource) => {
    const matchesRegion = state.resourceRegion === "전체" || resource.region === state.resourceRegion;
    const matchesCategory = state.resourceCategory === "전체" || resource.category === state.resourceCategory;
    const searchable = normalizeText([
      resource.name,
      resource.organization,
      resource.category,
      resource.description,
      ...resource.formats,
      ...resource.useFor
    ].join(" "));
    return matchesRegion && matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
  });

  countElement.textContent = `선택 조건 · ${resources.length}개 공식 자료`;
  resultElement.innerHTML = resources.length
    ? resources.map(renderOfficialResource).join("")
    : renderEmptyState("조건에 맞는 공식 자료가 없습니다.", "검색어를 줄이거나 지역·분야 필터를 초기화해 보세요.");
  requestAnimationFrame(updateChapterHeight);
}

function renderOfficialResource(resource) {
  return `
    <article class="official-resource-card" data-region="${escapeAttribute(resource.region)}">
      <header>
        <div>
          <span>${escapeHtml(resource.category)}</span>
          <em>${escapeHtml(resource.region)} 공식</em>
        </div>
        ${resource.featured ? "<b>추천</b>" : ""}
      </header>
      <div class="official-resource-title">
        <p>${escapeHtml(resource.organization)}</p>
        <h4>${escapeHtml(resource.name)}</h4>
      </div>
      <p class="official-resource-description">${escapeHtml(resource.description)}</p>
      <div class="official-resource-formats">
        ${resource.formats.map((format) => `<span>${escapeHtml(format)}</span>`).join("")}
        <span>${escapeHtml(resource.update)}</span>
      </div>
      <section class="official-resource-use">
        <span>이럴 때 사용</span>
        <ul>${resource.useFor.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </section>
      <details>
        <summary>자료 해석 주의점</summary>
        <p>${escapeHtml(resource.caution)}</p>
      </details>
      <a href="${escapeAttribute(resource.url)}" target="_blank" rel="noopener noreferrer">
        공식 사이트 열기 <span aria-hidden="true">↗</span>
      </a>
    </article>
  `;
}

function renderFilterButton(attribute, value, activeValue) {
  return `<button type="button" data-${attribute}="${escapeAttribute(value)}" aria-pressed="${value === activeValue}">${escapeHtml(value)}</button>`;
}

function renderEmptyState(title, description) {
  return `
    <div class="library-empty-state">
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(description)}</p>
    </div>
  `;
}

function resetBookFilters() {
  state.bookQuery = "";
  state.bookLevel = "전체";
  state.bookCategory = "전체";
  state.bookRoute = "";
}

function resetResourceFilters() {
  state.resourceQuery = "";
  state.resourceRegion = "전체";
  state.resourceCategory = "전체";
}

function normalizeText(value) {
  return String(value ?? "").toLocaleLowerCase("ko-KR").replace(/\s+/g, " ").trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}
