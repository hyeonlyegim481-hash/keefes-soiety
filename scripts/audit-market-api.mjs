import assert from "node:assert/strict";

const endpoint =
  process.argv[2] || "http://127.0.0.1:4173/api/snapshot";
const response = await fetch(endpoint, {
  headers: { accept: "application/json" },
  signal: AbortSignal.timeout(45_000)
});
assert.equal(response.ok, true, `snapshot request failed: ${response.status}`);

const body = await response.text();
assert.doesNotMatch(body, /NaN|Infinity/);
const snapshot = JSON.parse(body);
assert.equal(snapshot.markets.length, 8);

const required = [
  "value",
  "previousClose",
  "change",
  "changePercent",
  "asOf",
  "tradingDate",
  "marketStateLabel",
  "timezone",
  "delayed",
  "instrumentType",
  "instrumentLabel",
  "source",
  "sourceUrl",
  "seriesMeta"
];

for (const market of snapshot.markets) {
  for (const field of required) {
    assert.equal(
      Object.hasOwn(market, field),
      true,
      `${market.id} is missing ${field}`
    );
  }

  assert.equal(Number.isFinite(Number(market.value)), true);
  assert.ok(Number(market.value) > 0);
  assert.equal(Number.isFinite(Date.parse(market.asOf)), true);
  assert.ok(market.tradingDate);
  assert.ok(market.timezone);
  assert.ok(market.instrumentType);
  assert.ok(market.instrumentLabel);
  assert.ok(market.source);
  assert.match(market.sourceUrl, /^https:\/\//);

  const times = market.series.map((point) => Date.parse(point.time));
  assert.ok(times.length >= 2, `${market.id} has too few chart points`);
  assert.equal(times.every(Number.isFinite), true);
  assert.deepEqual(times, [...times].sort((a, b) => a - b));
  assert.equal(new Set(times).size, times.length);
  assert.equal(
    market.series.every(
      (point) => Number.isFinite(Number(point.value)) && Number(point.value) > 0
    ),
    true
  );
  assert.notEqual(Number(market.series.at(-1).value), 0);
  assert.equal(market.seriesMeta.startAt, market.series[0].time);
  assert.equal(market.seriesMeta.endAt, market.series.at(-1).time);
  assert.equal(market.seriesMeta.pointCount, market.series.length);

  if (market.changeAvailable) {
    assert.equal(Number.isFinite(Number(market.previousClose)), true);
    assert.ok(Number(market.previousClose) > 0);
    assert.equal(Number.isFinite(Number(market.change)), true);
    assert.equal(Number.isFinite(Number(market.changePercent)), true);
    const expected = ((market.value - market.previousClose) / market.previousClose) * 100;
    assert.ok(
      Math.abs(expected - market.changePercent) <= 0.08,
      `${market.id} change percent does not match its current and previous close`
    );
  } else {
    assert.equal(market.previousClose, null);
    assert.equal(market.change, null);
    assert.equal(market.changePercent, null);
    assert.ok(market.changeUnavailableReason);
  }
}

for (const id of ["wti", "gold"]) {
  const market = snapshot.markets.find((item) => item.id === id);
  assert.equal(market.instrumentType, "futures");
  assert.match(market.name, /선물/);
  assert.match(market.instrumentLabel, /선물/);
}

assert.equal(
  snapshot.dataQuality.marketChangeAvailableCount,
  snapshot.markets.filter((market) => market.changeAvailable).length
);
assert.equal(
  snapshot.dataQuality.unavailableChangeMarketIds.length,
  snapshot.markets.filter((market) => !market.changeAvailable).length
);

console.log(
  JSON.stringify(
    {
      endpoint,
      bytes: Buffer.byteLength(body),
      generatedAt: snapshot.generatedAt,
      analysisComplete: snapshot.analysis.dataComplete,
      marketChangeAvailableCount:
        snapshot.dataQuality.marketChangeAvailableCount,
      delayedMarketIds: snapshot.dataQuality.delayedMarketIds,
      rejectedMarketPointCount:
        snapshot.dataQuality.rejectedMarketPointCount,
      markets: snapshot.markets.map((market) => ({
        id: market.id,
        value: market.value,
        previousClose: market.previousClose,
        change: market.change,
        changePercent: market.changePercent,
        tradingDate: market.tradingDate,
        state: market.marketStateLabel,
        timezone: market.timezone,
        delayed: market.delayed,
        instrumentType: market.instrumentType,
        points: market.series.length,
        startAt: market.seriesMeta.startAt,
        endAt: market.seriesMeta.endAt
      }))
    },
    null,
    2
  )
);
