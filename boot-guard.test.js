import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const appSource = readFileSync(new URL("./app.js", import.meta.url), "utf8");

function readBootGuardSource() {
  const match = html.match(/<script data-app-boot-guard>([\s\S]*?)<\/script>/);
  assert.ok(match, "inline boot guard must exist independently of app.js");
  return match[1];
}

test("inline boot guard is valid JavaScript and has a bounded timeout", () => {
  const source = readBootGuardSource();
  assert.doesNotThrow(() => new Function(source));
  assert.match(source, /BOOT_TIMEOUT_MS\s*=\s*12_000/);
  assert.match(source, /화면 파일을 불러오지 못했습니다/);
});

test("boot retry reloads only from an explicit button action", () => {
  const source = readBootGuardSource();
  const clickHandlerAt = source.indexOf('addEventListener("click"');
  const reloadAt = source.indexOf("window.location.reload()");
  assert.ok(clickHandlerAt >= 0);
  assert.ok(reloadAt > clickHandlerAt);
  assert.match(source, /retryRequested/);
});

test("app reports ready before the snapshot network request starts", () => {
  const readyAt = appSource.indexOf("globalThis.__KEEFES_MARK_BOOT_READY__?.()");
  const snapshotQueueAt = appSource.indexOf("queueMicrotask(() => {", readyAt);
  const refreshAt = appSource.indexOf("refreshSnapshot();", snapshotQueueAt);
  assert.ok(readyAt >= 0);
  assert.ok(snapshotQueueAt > readyAt);
  assert.ok(refreshAt > snapshotQueueAt);
});