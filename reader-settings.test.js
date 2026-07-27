import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_READER_SETTINGS,
  READER_SETTINGS_KEY,
  applyReaderSettings,
  loadReaderSettings,
  normalizeReaderSettings,
  saveReaderSettings
} from "./reader-settings.js";

test("normalizes reader settings to safe steps and bounds", () => {
  assert.deepEqual(normalizeReaderSettings({ fontScale: 112, highContrast: false }), {
    fontScale: 110,
    highContrast: false
  });
  assert.equal(normalizeReaderSettings({ fontScale: 20 }).fontScale, 90);
  assert.equal(normalizeReaderSettings({ fontScale: 999 }).fontScale, 125);
  assert.deepEqual(normalizeReaderSettings({ fontScale: "bad" }), DEFAULT_READER_SETTINGS);
});

test("persists and restores the normalized setting", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };
  const saved = saveReaderSettings({ fontScale: 119, highContrast: false }, storage);
  assert.deepEqual(saved, { fontScale: 120, highContrast: false });
  assert.ok(values.has(READER_SETTINGS_KEY));
  assert.deepEqual(loadReaderSettings(storage), saved);
});

test("applies root font size and contrast without browser globals", () => {
  const properties = new Map();
  const root = {
    dataset: {},
    style: { setProperty: (name, value) => properties.set(name, value) }
  };
  const applied = applyReaderSettings({ fontScale: 125, highContrast: true }, root);
  assert.deepEqual(applied, { fontScale: 125, highContrast: true });
  assert.equal(properties.get("--reader-root-size"), "20.00px");
  assert.equal(root.dataset.readerContrast, "strong");
  assert.equal(root.dataset.readerScale, "125");
});
