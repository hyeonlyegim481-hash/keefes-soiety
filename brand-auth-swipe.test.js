import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { isChapterSwipeEnabled } from "./reader-settings.js";

const html = await readFile(new URL("./index.html", import.meta.url), "utf8");
const css = await readFile(new URL("./styles.css", import.meta.url), "utf8");
const app = await readFile(new URL("./app.js", import.meta.url), "utf8");
const profile = await readFile(new URL("./profile-client.js", import.meta.url), "utf8");

test("brand logo uses a centered square frame at every viewport", () => {
  assert.match(html, /class="brand-mark"[\s\S]*?econest-icon\.png/);
  assert.match(css, /\.brand-mark\s*\{[\s\S]*?aspect-ratio:\s*1[\s\S]*?place-items:\s*center/);
  assert.match(css, /\.brand-mark\s*>\s*img\s*\{[\s\S]*?object-fit:\s*contain/);
});

test("Google sign-in keeps its branded icon and centered label while busy", () => {
  assert.match(html, /assets\/google-g\.svg/);
  assert.match(html, /data-button-label>Google로 계속하기/);
  assert.match(css, /grid-template-columns:\s*20px minmax\(0, 1fr\) 20px/);
  assert.match(profile, /querySelector\("\[data-button-label\]"\)/);
});

test("chapter swipe is disabled only in desktop layout and for mouse input", () => {
  assert.equal(isChapterSwipeEnabled({ desktopLayout: false }, "touch"), true);
  assert.equal(isChapterSwipeEnabled({ desktopLayout: false }, "pen"), true);
  assert.equal(isChapterSwipeEnabled({ desktopLayout: false }, "mouse"), false);
  assert.equal(isChapterSwipeEnabled({ desktopLayout: true }, "touch"), false);
  assert.match(app, /isChapterSwipeEnabled\(readerSettings, event\.pointerType\)/);
  assert.match(css, /html\[data-reader-layout="desktop"\][\s\S]*?touch-action:\s*pan-x pan-y pinch-zoom/);
});
