export const READER_SETTINGS_KEY = "keefes-reader-settings";
export const READER_FONT_MIN = 90;
export const READER_FONT_MAX = 125;
export const READER_FONT_STEP = 5;
export const DEFAULT_READER_SETTINGS = Object.freeze({
  fontScale: 105,
  highContrast: true
});

function normalizeFontScale(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return DEFAULT_READER_SETTINGS.fontScale;
  const clamped = Math.min(READER_FONT_MAX, Math.max(READER_FONT_MIN, numeric));
  return Math.round(clamped / READER_FONT_STEP) * READER_FONT_STEP;
}

export function normalizeReaderSettings(value = {}) {
  return {
    fontScale: normalizeFontScale(value?.fontScale),
    highContrast: value?.highContrast !== false
  };
}

export function loadReaderSettings(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem?.(READER_SETTINGS_KEY);
    return normalizeReaderSettings(raw ? JSON.parse(raw) : DEFAULT_READER_SETTINGS);
  } catch {
    return { ...DEFAULT_READER_SETTINGS };
  }
}

export function saveReaderSettings(settings, storage = globalThis.localStorage) {
  const normalized = normalizeReaderSettings(settings);
  try {
    storage?.setItem?.(READER_SETTINGS_KEY, JSON.stringify(normalized));
  } catch {
    // The setting still works for the current page when storage is unavailable.
  }
  return normalized;
}

export function applyReaderSettings(settings, root = globalThis.document?.documentElement) {
  const normalized = normalizeReaderSettings(settings);
  if (!root) return normalized;
  const rootSize = (16 * normalized.fontScale) / 100;
  root.style?.setProperty?.("--reader-root-size", `${rootSize.toFixed(2)}px`);
  root.dataset.readerContrast = normalized.highContrast ? "strong" : "standard";
  root.dataset.readerScale = String(normalized.fontScale);
  return normalized;
}
