import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  buildTodaySchedule,
  buildWeeklyLearningSummary,
  matchCompanyHeadlines
} from "./personal-dashboard.js";

test("today schedule distinguishes weekday sessions from weekend closures", () => {
  const weekday = buildTodaySchedule(new Date("2026-07-27T03:00:00.000Z"));
  assert.equal(weekday.dateKey, "2026-07-27");
  assert.equal(weekday.items.length, 3);
  assert.equal(weekday.items[0].time, "09:00");
  assert.equal(weekday.items[2].time, "22:30");
  assert.match(weekday.caveat, /공식 경제지표 공표 일정/);

  const weekend = buildTodaySchedule(new Date("2026-08-01T03:00:00.000Z"));
  assert.equal(weekend.items.length, 2);
  assert.ok(weekend.items.every((item) => item.time === "휴장"));
  assert.match(weekend.caveat, /공휴일과 임시 휴장/);
});

test("weekly learning summary counts KST week activity and signed XP", () => {
  const summary = buildWeeklyLearningSummary(
    {
      dailyActivity: [
        { activity_date: "2026-07-27", xp_awarded: 5 },
        { activity_date: "2026-07-29", xp_awarded: 5 },
        { activity_date: "2026-07-26", xp_awarded: 5 }
      ],
      quizAttempts: [
        {
          correct: true,
          xp_awarded: 10,
          answered_at: "2026-07-27T10:00:00.000Z"
        },
        {
          correct: false,
          xp_awarded: -5,
          answered_at: "2026-07-28T10:00:00.000Z"
        },
        {
          correct: true,
          xp_awarded: 10,
          answered_at: "2026-07-25T10:00:00.000Z"
        }
      ],
      learningHistory: [
        { viewed_at: "2026-07-28T10:00:00.000Z" },
        { viewed_at: "2026-07-25T10:00:00.000Z" }
      ]
    },
    new Date("2026-07-29T03:00:00.000Z")
  );

  assert.deepEqual(summary, {
    activeDays: 2,
    attempts: 2,
    correct: 1,
    terms: 1,
    xp: 15
  });
});

test("company news matching requires a direct alias and keeps the newest first", () => {
  const matches = matchCompanyHeadlines(
    {
      id: "sk-hynix",
      name: "SK하이닉스",
      ticker: "000660"
    },
    [
      {
        id: "old",
        title: "SK하이닉스 HBM 투자 확대",
        publishedAt: "2026-07-27T00:00:00.000Z"
      },
      {
        id: "unrelated",
        title: "국내 배터리 업계 수출 점검",
        publishedAt: "2026-07-29T00:00:00.000Z"
      },
      {
        id: "new",
        title: "하이닉스 실적 발표와 메모리 가격",
        publishedAt: "2026-07-28T00:00:00.000Z"
      }
    ]
  );

  assert.deepEqual(matches.map((item) => item.id), ["new", "old"]);
});

test("dashboard chapter, persistence RPCs, and bounded storage are wired", async () => {
  const [html, app, profile, migration] = await Promise.all([
    readFile(new URL("./index.html", import.meta.url), "utf8"),
    readFile(new URL("./app.js", import.meta.url), "utf8"),
    readFile(new URL("./profile-client.js", import.meta.url), "utf8"),
    readFile(
      new URL("./supabase/migrations/007_personal_dashboard.sql", import.meta.url),
      "utf8"
    )
  ]);

  assert.match(html, /data-chapter="dashboard"[^>]*>나의 경제</);
  assert.match(html, /id="personalDashboard"/);
  assert.match(html, /id="profileIndicatorSelect"/);
  assert.match(app, /case "dashboard":\s+return initPersonalDashboardOnce\(\)/);
  assert.match(app, /recordGlossaryView\?\.\(item\)/);
  assert.match(app, /data-save-news/);
  assert.match(profile, /rpc\("record_own_learning_item"/);
  assert.match(profile, /rpc\("save_own_article"/);
  assert.match(profile, /limit\(100\)/);
  assert.match(migration, /item_type in \('market', 'company', 'indicator'\)/);
  assert.match(migration, /create table public\.learning_history/);
  assert.match(migration, /create table public\.saved_articles/);
  assert.match(migration, /offset 100/);
  assert.match(migration, /octet_length\(analysis::text\) <= 16000/);
  assert.match(migration, /grant select on public\.learning_history, public\.saved_articles/);
  assert.doesNotMatch(migration, /grant (insert|update|delete) on public\.(learning_history|saved_articles)/);
});

test("dashboard company cards use one bounded batch request and richer financial facts", async () => {
  const [dashboard, details, batch] = await Promise.all([
    readFile(new URL("./personal-dashboard.js", import.meta.url), "utf8"),
    readFile(new URL("./personal-company-dashboard.js", import.meta.url), "utf8"),
    readFile(new URL("./company-market-batch.js", import.meta.url), "utf8")
  ]);
  assert.ok(dashboard.includes("/api/company-market-batch?ids="));
  assert.ok(dashboard.includes(".slice(0, 6)"));
  assert.match(details, /유동비율/);
  assert.match(details, /매출채권/);
  assert.match(details, /재고자산/);
  assert.match(details, /시가총액/);
  assert.match(batch, /Promise.all/);
});

test("dashboard company navigation resets the viewport without scrolling the whole company list into view", async () => {
  const [app, companyUi] = await Promise.all([
    readFile(new URL("./app.js", import.meta.url), "utf8"),
    readFile(new URL("./company-ui.js", import.meta.url), "utf8")
  ]);
  assert.ok(app.includes('scrollChapterStart("companies")'));
  assert.ok(app.includes("companyController?.applyUrlState"));
  assert.doesNotMatch(companyUi, /scrollIntoView/);
  assert.ok(companyUi.includes("list.scrollTop = Math.max"));
});
