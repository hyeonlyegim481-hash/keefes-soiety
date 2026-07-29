import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("./app.js", import.meta.url), "utf8");
const profileClient = readFileSync(new URL("./profile-client.js", import.meta.url), "utf8");
const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");

test("cached refresh and limited live refresh remain separate controls", () => {
  assert.match(
    html,
    /id="refreshButton"[\s\S]{0,220}aria-label="화면 갱신, 서버에 저장된 자료 다시 읽기"/
  );
  assert.match(
    html,
    /id="latestRefreshButton"[\s\S]{0,260}하루 3회 원자료 재수집/
  );
  assert.match(html, /class="refresh-help"/);
  assert.match(html, /두 새로고침의 차이/);
  assert.match(html, /id="latestRefreshDescription">원자료 재수집 · 하루 3회/);
  assert.match(app, /refreshButton\.addEventListener\("click", \(\) => refreshSnapshot\(\)\)/);
  assert.match(app, /latestRefreshButton\?\.addEventListener\("click", \(\) => refreshSnapshot\(\{ manual: true \}\)\)/);
  assert.match(app, /elements\.latestRefreshButton\.dataset\.remaining/);
  assert.match(app, /latestRefreshDescription\.textContent = `원자료 재수집 · 오늘/);
  assert.match(profileClient, /fetch\("\/api\/snapshot-refresh", \{/);
  assert.match(profileClient, /method: "POST"/);
  assert.match(profileClient, /authorization: `Bearer \$\{accessToken\}`/);
});

test("manual refresh failures preserve the last successful snapshot", () => {
  assert.match(app, /if \(manual && state\.snapshot\) \{/);
  assert.match(app, /setConnection\("error", label\);\s+return;/);
  assert.match(app, /오늘 3회 완료/);
  assert.match(app, /갱신 설정 필요/);
});
