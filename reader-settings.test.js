import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  DEFAULT_READER_SETTINGS,
  READER_SETTINGS_KEY,
  DESKTOP_VIEWPORT_CONTENT,
  RESPONSIVE_VIEWPORT_CONTENT,
  applyReaderSettings,
  applyReaderViewport,
  loadReaderSettings,
  normalizeReaderSettings,
  saveReaderSettings
} from "./reader-settings.js";

test("normalizes reader settings to safe steps and bounds", () => {
  assert.deepEqual(normalizeReaderSettings({ fontScale: 112, highContrast: false, desktopLayout: true }), {
    fontScale: 110,
    highContrast: false,
    desktopLayout: true
  });
  assert.equal(normalizeReaderSettings({ fontScale: 20 }).fontScale, 90);
  assert.equal(normalizeReaderSettings({ fontScale: 999 }).fontScale, 150);
  assert.deepEqual(normalizeReaderSettings({ fontScale: "bad" }), DEFAULT_READER_SETTINGS);
});

test("persists and restores the normalized setting", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };
  const saved = saveReaderSettings({ fontScale: 119, highContrast: false, desktopLayout: true }, storage);
  assert.deepEqual(saved, { fontScale: 120, highContrast: false, desktopLayout: true });
  assert.ok(values.has(READER_SETTINGS_KEY));
  assert.deepEqual(loadReaderSettings(storage), saved);
});

test("applies root font size and contrast without browser globals", () => {
  const properties = new Map();
  const root = {
    dataset: {},
    style: { setProperty: (name, value) => properties.set(name, value) }
  };
  const applied = applyReaderSettings({ fontScale: 150, highContrast: true, desktopLayout: true }, root);
  assert.deepEqual(applied, { fontScale: 150, highContrast: true, desktopLayout: true });
  assert.equal(properties.get("--reader-root-size"), "24.00px");
  assert.equal(root.dataset.readerContrast, "strong");
  assert.equal(root.dataset.readerScale, "150");
  assert.equal(root.dataset.readerLayout, "desktop");
});

test("switches the viewport between responsive and desktop layout modes", () => {
  const viewport = {
    content: "",
    setAttribute(name, value) {
      if (name === "content") this.content = value;
    }
  };
  applyReaderViewport({ desktopLayout: true }, viewport);
  assert.equal(viewport.content, DESKTOP_VIEWPORT_CONTENT);
  assert.match(viewport.content, /minimum-scale=0\.1/);
  assert.match(viewport.content, /maximum-scale=5\.0/);
  assert.match(viewport.content, /user-scalable=yes/);
  applyReaderViewport({ desktopLayout: false }, viewport);
  assert.equal(viewport.content, RESPONSIVE_VIEWPORT_CONTENT);
});
test("settings UI allows 150 percent and keeps profile progress outside the drawer", async () => {
  const html = await readFile(new URL("./index.html", import.meta.url), "utf8");
  assert.match(html, /id="readerFontRange"[\s\S]*max="150"/);
  assert.match(html, /id="profileGlance"/);
  assert.match(html, /id="mainProfileTier"/);
  assert.match(html, /id="mainProfileStreak"/);
  assert.match(html, /id="mainProfileStreakImage"/);
  assert.match(html, /id="profileStreakVisual"/);
  assert.doesNotMatch(html, /class="utility-shortcuts"/);
  assert.doesNotMatch(html, />빠른 이동</);
  const css = await readFile(new URL("./styles.css", import.meta.url), "utf8");
  assert.match(css, /min-width:\s*max\(288px, 18rem\)/);
  assert.doesNotMatch(css, /font-size:\s*clamp\([^;]*vw/);
  assert.doesNotMatch(css, /\.market-mini-card p \{[\s\S]*?-webkit-line-clamp:\s*3/);
});
