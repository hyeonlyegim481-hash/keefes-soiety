export const READER_SETTINGS_KEY = "keefes-reader-settings";
export const READER_FONT_MIN = 90;
export const READER_FONT_MAX = 150;
export const READER_FONT_STEP = 5;
export const RESPONSIVE_VIEWPORT_CONTENT = "width=device-width, initial-scale=1.0";
export const DESKTOP_VIEWPORT_CONTENT =
  "width=1180, minimum-scale=0.1, maximum-scale=5.0, user-scalable=yes";
export const DEFAULT_READER_SETTINGS = Object.freeze({
  fontScale: 105,
  highContrast: true,
  desktopLayout: false
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
    highContrast: value?.highContrast !== false,
    desktopLayout: value?.desktopLayout === true
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
  root.style?.setProperty?.("--reader-page-scale", (normalized.fontScale / 100).toFixed(2));
  root.dataset.readerContrast = normalized.highContrast ? "strong" : "standard";
  root.dataset.readerScale = String(normalized.fontScale);
  root.dataset.readerLayout = normalized.desktopLayout ? "desktop" : "responsive";
  return normalized;
}

export function isChapterSwipeEnabled(settings, pointerType = "touch") {
  const normalized = normalizeReaderSettings(settings);
  return pointerType !== "mouse" && !normalized.desktopLayout;
}

export function applyReaderViewport(
  settings,
  viewport = globalThis.document?.querySelector?.('meta[name="viewport"]')
) {
  const normalized = normalizeReaderSettings(settings);
  viewport?.setAttribute?.(
    "content",
    normalized.desktopLayout ? DESKTOP_VIEWPORT_CONTENT : RESPONSIVE_VIEWPORT_CONTENT
  );
  return normalized;
}
