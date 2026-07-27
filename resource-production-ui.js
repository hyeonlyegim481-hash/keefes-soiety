import { resourceProductionMetadata } from "./resource-production-data.js";
import { buildResourceIndicatorMetadata, isMetadataUnavailable } from "./indicator-metadata.js";

const boundRoots = new WeakSet();

export function renderResourceProductionDetail(indicator) {
  const metadata = buildResourceIndicatorMetadata(indicator, resourceProductionMetadata);
  const ranked = [...indicator.countries].sort((a, b) => b.value - a.value);
  const mapped = ranked.filter((country) => Number.isFinite(country.lon) && Number.isFinite(country.lat));
  const leader = mapped[0];
  const topThreeShare = mapped.slice(0, 3).reduce((sum, country) => sum + country.value, 0) / indicator.worldTotal * 100;
  const maxValue = leader?.value || 1;

  return `
    <header class="indicator-detail-head resource-detail-head">
      <div>
        <p class="section-kicker">자원 생산 · ${escapeHtml(indicator.code)}</p>
        <h3>${escapeHtml(indicator.name)}</h3>
        <p>${escapeHtml(indicator.description)}</p>
      </div>
      <div class="indicator-primary-value">
        <span>세계 ${indicator.year}년 추정</span>
        <strong>${formatProductionCompact(indicator.worldTotal, indicator.unit)}</strong>
        <em>${mapped.length}개 생산국 지도 표시</em>
      </div>
    </header>
    <div class="resource-production-brief">
      <div><span>최대 생산국</span><strong>${escapeHtml(leader.label)}</strong><em>${formatProductionExact(leader.value, indicator.unit)}</em></div>
      <div><span>상위 3개국 비중</span><strong>${formatShare(topThreeShare)}</strong><em>지도에 표시된 국가 기준</em></div>
      <div><span>공급망 경로</span><strong>${escapeHtml(indicator.supplyChain)}</strong><em>광산부터 최종 수요까지</em></div>
    </div>
    <section class="resource-map-section">
      <div class="indicator-section-title resource-map-title">
        <div>
          <span>세계 생산 지도</span>
          <strong>${escapeHtml(indicator.shortName)} · ${indicator.year}년 국가별 생산량</strong>
        </div>
        <em>원의 넓이가 클수록 생산량이 많음</em>
      </div>
      <div class="resource-map-layout">
        <div class="resource-map-column">
          <div class="resource-world-map" role="group" aria-label="${escapeHtml(indicator.name)} 세계 생산 지도">
            <img src="/assets/world-production-map.webp" alt="" aria-hidden="true" />
            ${mapped.map((country) => renderMapBubble(indicator, country, ranked.indexOf(country) + 1, maxValue)).join("")}
            <div class="resource-map-legend" aria-hidden="true">
              <span><i></i>적음</span><span><i></i>중간</span><span><i></i>많음</span>
            </div>
          </div>
          <div class="resource-map-selection" id="resourceMapSelection" aria-live="polite">
            ${renderCountrySelection(indicator, leader, ranked.indexOf(leader) + 1)}
          </div>
          <p class="resource-map-note">${escapeHtml(indicator.worldNote)} 원의 크기는 큰 값도 비교하기 쉽도록 제곱근 비율로 표시합니다.</p>
        </div>
        <aside class="resource-rank-panel">
          <header><span>생산국 순위</span><strong>상위 ${Math.min(10, ranked.length)}개</strong></header>
          <div class="resource-rank-list">
            ${ranked.slice(0, 10).map((country, index) => renderRankRow(indicator, country, index + 1, maxValue, country.id === leader.id)).join("")}
          </div>
        </aside>
      </div>
    </section>
    <div class="resource-reading-grid">
      <section>
        <span>어디에 쓰이나</span>
        <div>${indicator.uses.map((use) => `<em>${escapeHtml(use)}</em>`).join("")}</div>
        <p>${escapeHtml(indicator.reading)}</p>
      </section>
      <section>
        <span>한국과의 연결</span>
        <p>${escapeHtml(indicator.korea)}</p>
      </section>
      <section>
        <span>숫자를 볼 때 주의</span>
        <p>${escapeHtml(indicator.caution)}</p>
      </section>
    </div>
    <footer class="indicator-source-row resource-source-row">
      <div>
        <span>생산량 출처</span>
        <strong>${escapeHtml(indicator.source)}</strong>
        <em>2025년 추정치 · 자료 수정 ${resourceProductionMetadata.updatedAt.replaceAll("-", ".")}</em>
      </div>
      <div class="resource-source-links">
        <a href="${escapeHtml(resourceProductionMetadata.mapSourceUrl)}" target="_blank" rel="noopener noreferrer">지도 경계 <span aria-hidden="true">↗</span></a>
        <a href="${escapeHtml(indicator.sourceUrl)}" target="_blank" rel="noopener noreferrer">생산량 원자료 <span aria-hidden="true">↗</span></a>
      </div>
    </footer>
    ${renderResourceMetadataDetails(metadata, indicator)}
  `;
}

function renderResourceMetadataDetails(metadata, indicator) {
  const rows = [
    ["공식 코드", metadata.officialCode],
    ["현재 표시값", formatProductionExact(metadata.value, indicator.unit)],
    ["단위", metadata.displayUnit],
    ["배율", `×${metadata.multiplier}`],
    ["기준기간", metadata.referencePeriod],
    ["발표·수정일", formatMetadataDate(metadata.releaseDate)],
    ["수집일", formatMetadataDate(metadata.collectedAt)],
    ["자료 주기", metadata.frequency],
    ["값의 범위", metadata.valueScope],
    ["잠정·확정", metadata.releaseStatus],
    ["명목·실질", metadata.nominalReal],
    ["통화·가격 기준", `${metadata.currency} · ${metadata.priceBasis}`],
    ["계절조정", metadata.seasonalAdjustment],
    ["수정 여부", metadata.revisionStatus]
  ];
  return `
    <details class="indicator-source-details resource-metadata-details">
      <summary>
        <span>출처·단위·기준 자세히 보기</span>
        <strong>${escapeHtml(metadata.sourceDataset)}</strong>
      </summary>
      <div class="indicator-metadata-body">
        <section class="indicator-metadata-source">
          <span>원자료 기관</span>
          <strong>${escapeHtml(metadata.sourceInstitution)}</strong>
          <p>광산 생산 물량이며 가격이나 매장량이 아닙니다.</p>
        </section>
        <dl class="indicator-metadata-grid">
          ${rows.map(([label, value]) => `
            <div>
              <dt>${escapeHtml(label)}</dt>
              <dd${isMetadataUnavailable(value) ? ' class="is-unavailable"' : ""}>${escapeHtml(isMetadataUnavailable(value) ? "제공처 미공개" : value)}</dd>
            </div>
          `).join("")}
        </dl>
        <div class="indicator-metadata-footer">
          <p><b>표시 계산</b> USGS 공표 물량 × 1; 국가 비중은 국가 생산량 ÷ 세계 총량 × 100입니다.</p>
          <a href="${escapeHtml(metadata.sourceUrl)}" target="_blank" rel="noopener noreferrer">USGS 원자료 보기 <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </details>
  `.replace(/^\+/gm, "");
}

function formatMetadataDate(value) {
  if (isMetadataUnavailable(value)) return null;
  return String(value).replaceAll("-", ".");
}

export function bindResourceProductionDetail(root, updateHeight = () => {}) {
  if (boundRoots.has(root)) return;
  boundRoots.add(root);
  root.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-resource-country]");
    if (!button || !root.contains(button)) return;
    const id = button.dataset.resourceCountry;
    const label = button.dataset.resourceLabel;
    const value = Number(button.dataset.resourceValue);
    const share = Number(button.dataset.resourceShare);
    const rank = Number(button.dataset.resourceRank);
    const unit = button.dataset.resourceUnit;

    root.querySelectorAll("[data-resource-country]").forEach((item) => {
      const active = item.dataset.resourceCountry === id;
      item.setAttribute("aria-pressed", String(active));
      item.classList.toggle("is-active", active);
    });

    const selection = root.querySelector("#resourceMapSelection");
    if (selection) {
      selection.innerHTML = renderCountrySelectionFromValues(label, value, unit, share, rank);
    }
    requestAnimationFrame(updateHeight);
  });
}

export function formatProductionExact(value, unit = "톤") {
  return `${new Intl.NumberFormat("ko-KR").format(value)}${unit === "톤 REO" ? "톤 REO" : "톤"}`;
}

export function formatProductionCompact(value, unit = "톤") {
  const suffix = unit === "톤 REO" ? "톤 REO" : "톤";
  if (value >= 100_000_000) return `${trimNumber(value / 100_000_000)}억 ${suffix}`;
  if (value >= 10_000) return `${trimNumber(value / 10_000)}만 ${suffix}`;
  return formatProductionExact(value, unit);
}

function renderMapBubble(indicator, country, rank, maxValue) {
  const share = country.value / indicator.worldTotal * 100;
  const size = 16 + Math.sqrt(country.value / maxValue) * 42;
  const left = (country.lon + 180) / 360 * 100;
  const top = (84 - country.lat) / 142 * 100;
  const data = countryDataAttributes(indicator, country, share, rank);
  return `
    <button class="resource-map-bubble" type="button" ${data} aria-pressed="${rank === 1}" style="--map-x:${left}%;--map-y:${top}%;--bubble-size:${size}px" aria-label="${escapeHtml(country.label)} ${formatProductionExact(country.value, indicator.unit)}, 세계 ${formatShare(share)}">
      <span><strong>${escapeHtml(country.label)}</strong><em>${formatProductionExact(country.value, indicator.unit)}</em><small>세계 ${formatShare(share)}</small></span>
    </button>
  `;
}

function renderRankRow(indicator, country, rank, maxValue, active) {
  const share = country.value / indicator.worldTotal * 100;
  const width = Math.max(2, country.value / maxValue * 100);
  const data = countryDataAttributes(indicator, country, share, rank);
  return `
    <button class="resource-rank-row${active ? " is-active" : ""}" type="button" ${data} aria-pressed="${active}">
      <i>${String(rank).padStart(2, "0")}</i>
      <span><strong>${escapeHtml(country.label)}</strong><em>${formatProductionExact(country.value, indicator.unit)}</em></span>
      <span class="resource-rank-bar"><b style="width:${width}%"></b></span>
      <small>${formatShare(share)}</small>
    </button>
  `;
}

function countryDataAttributes(indicator, country, share, rank) {
  return [
    `data-resource-country="${escapeHtml(country.id)}"`,
    `data-resource-label="${escapeHtml(country.label)}"`,
    `data-resource-value="${country.value}"`,
    `data-resource-share="${share}"`,
    `data-resource-rank="${rank}"`,
    `data-resource-unit="${escapeHtml(indicator.unit)}"`
  ].join(" ");
}

function renderCountrySelection(indicator, country, rank) {
  const share = country.value / indicator.worldTotal * 100;
  return renderCountrySelectionFromValues(country.label, country.value, indicator.unit, share, rank);
}

function renderCountrySelectionFromValues(label, value, unit, share, rank) {
  return `
    <span>선택한 생산국</span>
    <strong>${escapeHtml(label)}</strong>
    <em>${formatProductionExact(value, unit)} · 세계 ${formatShare(share)} · ${rank}위</em>
  `;
}

function formatShare(value) {
  return `${new Intl.NumberFormat("ko-KR", { minimumFractionDigits: value < 1 ? 1 : 0, maximumFractionDigits: 1 }).format(value)}%`;
}

function trimNumber(value) {
  return new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 1 }).format(value);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
