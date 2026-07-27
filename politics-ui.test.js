import test from "node:test";
import assert from "node:assert/strict";
import {
  getPoliticalTransmission,
  inferPoliticalJurisdiction,
  selectPoliticalHeadlines
} from "./politics-ui.js";

test("selects political-economic headlines and removes duplicates", () => {
  const headlines = [
    {
      section: "politics",
      title: "국회 상법 개정안 시행 기업 지배구조 변화",
      topic: "한국 정치·법",
      url: "https://example.com/a",
      publishedAt: "2026-07-27T01:00:00.000Z"
    },
    {
      section: "politics",
      title: "국회 상법 개정안 시행 기업 지배구조 변화",
      topic: "한국 정치·법",
      url: "https://example.com/a",
      publishedAt: "2026-07-27T00:00:00.000Z"
    },
    {
      section: "us",
      title: "미국 의회 관세 법안이 수입 물가에 미칠 영향",
      topic: "미국 핵심",
      url: "https://example.com/b",
      publishedAt: "2026-07-26T23:00:00.000Z"
    },
    {
      section: "korea",
      title: "프로야구 경기 결과",
      topic: "스포츠",
      url: "https://example.com/c",
      publishedAt: "2026-07-26T22:00:00.000Z"
    }
  ];

  const selected = selectPoliticalHeadlines(headlines);
  assert.equal(selected.length, 2);
  assert.equal(selected[0].url, "https://example.com/a");
  assert.equal(selected[1].url, "https://example.com/b");
});

test("labels country and transmission path from supported headline text", () => {
  const headline = {
    title: "미국 백악관 관세 정책 발표로 공급망 비용 변화",
    topic: "세계 정치·정책"
  };
  assert.equal(inferPoliticalJurisdiction(headline), "미국");
  assert.match(getPoliticalTransmission(headline), /교역 비용/);
});
