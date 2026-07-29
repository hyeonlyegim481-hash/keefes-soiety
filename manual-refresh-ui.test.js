import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("./app.js", import.meta.url), "utf8");
const profileClient = readFileSync(new URL("./profile-client.js", import.meta.url), "utf8");
const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");

test("the visible refresh control requests a server-enforced manual refresh", () => {
  assert.match(html, /id="refreshButton"[^>]+하루 3회 최신 자료를 즉시 확인/);
  assert.match(app, /refreshSnapshot\(\{ manual: true \}\)/);
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
