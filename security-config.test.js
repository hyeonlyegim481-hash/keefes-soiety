import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("Vercel security headers protect the app without blocking required services", () => {
  const config = JSON.parse(readFileSync(new URL("./vercel.json", import.meta.url), "utf8"));
  const securityRule = config.headers.find((item) => item.source === "/(.*)");
  const headers = Object.fromEntries(
    securityRule.headers.map((header) => [header.key.toLowerCase(), header.value])
  );
  const csp = headers["content-security-policy"];

  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /script-src 'self' https:\/\/cdn\.jsdelivr\.net/);
  assert.doesNotMatch(csp.match(/script-src[^;]*/)?.[0] || "", /'unsafe-inline'/);
  assert.match(csp, /https:\/\/\*\.supabase\.co/);
  assert.match(csp, /wss:\/\/\*\.supabase\.co/);
  assert.equal(headers["x-frame-options"], "DENY");
  assert.equal(headers["x-content-type-options"], "nosniff");
  assert.equal(headers["referrer-policy"], "strict-origin-when-cross-origin");
  assert.match(headers["permissions-policy"], /camera=\(\)/);
});

test("Vercel always revalidates the app version and service worker", () => {
  const config = JSON.parse(readFileSync(new URL("./vercel.json", import.meta.url), "utf8"));
  for (const source of ["/app-version.js", "/sw.js"]) {
    const rule = config.headers.find((item) => item.source === source);
    const headers = Object.fromEntries(rule.headers.map((header) => [header.key.toLowerCase(), header.value]));
    assert.equal(headers["cache-control"], "no-cache, max-age=0, must-revalidate");
  }
});

test("telemetry initialization uses an external CSP-compatible shell asset", () => {
  const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
  const serviceWorker = readFileSync(new URL("./sw.js", import.meta.url), "utf8");
  const telemetry = readFileSync(new URL("./telemetry-init.js", import.meta.url), "utf8");
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];

  assert.ok(scripts.every((match) => /\bsrc=/.test(match[1]) || !match[2].trim()));
  assert.match(html, /src="\/telemetry-init\.js"/);
  assert.match(serviceWorker, /"\/telemetry-init\.js"/);
  assert.match(telemetry, /globalThis\.va/);
  assert.match(telemetry, /globalThis\.si/);
});
