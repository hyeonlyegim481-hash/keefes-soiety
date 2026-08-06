const MARKET_DEEP_RULES = Object.freeze({
  kospi: {
    up: [
      "대형 수출주의 이익 기대와 국내외 수급이 KOSPI를 지지하는 흐름",
      "시가총액 상위 일부 종목만 오른 지수 쏠림일 가능성"
    ],
    down: [
      "외국인 수급과 대형 수출주의 이익 기대가 함께 약해지는 흐름",
      "실물경기 악화보다 단기 차익실현이나 특정 대형주의 조정일 가능성"
    ],
    flat: [
      "대형주 안에서 호재와 부담이 맞서 방향을 정하지 못하는 흐름",
      "장중 변동과 업종별 차이가 최종 지수에 가려졌을 가능성"
    ],
    better: [
      "상승의 폭이 한국 시장 전반으로 넓어짐",
      "KOSDAQ 동행, 원/달러 안정, 반도체 이익 전망 개선이 함께 확인될 때",
      "일부 대형주 쏠림보다 한국 위험자산 전반의 회복이라는 해석이 강해집니다."
    ],
    worse: [
      "대형주 방어선도 약해지고 외국인 부담이 확대됨",
      "KOSPI 반락과 원/달러·VIX 상승이 함께 나타날 때",
      "기업별 조정보다 대외 금융여건 악화가 한국 주식 전반으로 전해질 가능성이 커집니다."
    ],
    invalidate: [
      "KOSDAQ과 상승 종목 수가 따라오지 않으면 시장 전체 회복 해석을 낮춥니다.",
      "원/달러와 외국인 수급이 주가 방향을 확인하지 않으면 대외 수급 가설을 재검토합니다."
    ],
    channels: [
      ["수출 대형주", "환율과 해외 수요가 매출·이익 기대를 바꾸고 지수에 빠르게 반영됩니다.", "반도체 수출·기업 이익 전망"],
      ["투자·고용 심리", "주가 흐름이 오래 지속될 때 기업의 자금조달과 투자 심리에 영향을 줄 수 있습니다.", "설비투자·고용 계획"],
      ["가계 체감", "KOSPI만 오르고 중소형주·내수가 약하면 체감경기 개선은 제한될 수 있습니다.", "KOSDAQ·소매판매"]
    ]
  },
  kosdaq: {
    up: [
      "금리 부담 완화와 위험선호 회복이 성장주·중소형주로 퍼지는 흐름",
      "바이오·2차전지 등 일부 테마에 거래가 집중된 단기 반등일 가능성"
    ],
    down: [
      "높은 할인율과 유동성 부담으로 성장주 위험을 줄이는 흐름",
      "경기 판단보다 일부 업종 악재와 개인 수급이 낙폭을 키웠을 가능성"
    ],
    flat: [
      "성장 기대와 금리·유동성 부담이 맞서는 흐름",
      "업종별 등락이 서로 상쇄돼 지수 방향이 약해 보일 가능성"
    ],
    better: [
      "성장주 반등이 거래와 시장 폭으로 확인됨",
      "NASDAQ·KOSPI 동행, 거래대금 회복, 원/달러 안정이 함께 나타날 때",
      "일부 테마 반등보다 성장기업의 금융여건 개선이라는 해석이 강해집니다."
    ],
    worse: [
      "금리와 수급 부담이 중소형 성장주 전반으로 번짐",
      "NASDAQ 약세, 원/달러 상승, KOSDAQ 낙폭 확대가 겹칠 때",
      "기업별 악재보다 할인율과 유동성 충격의 영향이 커질 수 있습니다."
    ],
    invalidate: [
      "거래대금과 상승 종목 수가 늘지 않으면 위험선호 회복 판단을 낮춥니다.",
      "NASDAQ과 금리 방향이 KOSDAQ과 다르면 글로벌 성장주 가설을 재검토합니다."
    ],
    channels: [
      ["자금조달", "금리와 위험선호가 유상증자·회사채·벤처투자 여건에 먼저 반영됩니다.", "시장금리·신규 자금조달"],
      ["연구개발·고용", "자금조달 부담이 길어지면 성장기업의 연구개발과 채용 여력이 줄 수 있습니다.", "R&D·채용 공시"],
      ["개인 투자심리", "변동성이 커질수록 레버리지와 테마 수급이 지수 움직임을 과장할 수 있습니다.", "거래대금·신용잔고"]
    ]
  },
  usdkrw: {
    up: [
      "달러 선호와 원화 수요 약화가 수입비용·외국인 수급 부담을 높이는 흐름",
      "한국 고유 위험보다 글로벌 달러 강세가 대부분을 설명할 가능성"
    ],
    down: [
      "달러 부담 완화나 원화 수요 회복이 금융여건을 개선하는 흐름",
      "높은 절대 수준에서 나온 하루 조정일 뿐 추세 전환은 아닐 가능성"
    ],
    flat: [
      "달러와 원화 재료가 맞서 환율 방향이 제한된 흐름",
      "장 마감 시각 차이로 다른 시장의 변화가 아직 반영되지 않았을 가능성"
    ],
    better: [
      "원화 안정이 주가와 수입비용으로 이어짐",
      "원/달러 하락이 이어지고 외국인 수급·KOSPI·수입물가가 함께 개선될 때",
      "단기 환율 조정보다 한국 금융여건과 비용 압력의 실제 완화로 볼 근거가 강해집니다."
    ],
    worse: [
      "원화 약세가 금융시장과 생활물가로 번짐",
      "원/달러 상승과 VIX·WTI 상승, 외국인 매도가 함께 나타날 때",
      "달러 강세를 넘어 한국의 수입비용과 자금 흐름이 동시에 압박받을 수 있습니다."
    ],
    invalidate: [
      "당일 하락 뒤 다시 높은 수준으로 돌아가면 환율 안정 해석을 취소합니다.",
      "주가·외국인 수급·수입물가가 환율 방향을 확인하지 않으면 한국 영향의 강도를 낮춥니다."
    ],
    channels: [
      ["가계 물가", "원화 약세는 에너지·식품·해외서비스의 원화 환산 비용을 높일 수 있습니다.", "수입물가·소비자물가"],
      ["수출기업", "원화 환산 매출에는 도움이 될 수 있지만 원재료·외화부채 비용도 함께 봐야 합니다.", "매출 환산효과·원가율"],
      ["외국인 자금", "환차손 우려가 커지면 국내 주식·채권 수급이 약해질 수 있습니다.", "외국인 순매수·채권금리"]
    ]
  },
  sp500: {
    up: [
      "미국 경기와 대형기업 이익에 대한 신뢰가 글로벌 위험선호를 지지하는 흐름",
      "소수 대형 기술주가 지수 상승을 이끈 쏠림일 가능성"
    ],
    down: [
      "미국 경기·이익 기대 또는 금융여건 부담으로 대형주 위험을 줄이는 흐름",
      "경기 악화보다 높은 가격 부담과 단기 포지션 조정일 가능성"
    ],
    flat: [
      "미국 경기 기대와 금리 부담이 균형을 이루는 흐름",
      "업종 간 순환매가 지수 움직임을 가렸을 가능성"
    ],
    better: [
      "미국 상승이 시장 폭과 한국 수출주로 확산됨",
      "NASDAQ·시장 폭·KOSPI 동행과 VIX 안정이 함께 확인될 때",
      "대형주 쏠림보다 글로벌 성장과 위험선호 회복의 근거가 강해집니다."
    ],
    worse: [
      "미국 약세가 변동성과 한국 수급으로 전달됨",
      "S&P 500 추가 하락, VIX 상승, KOSPI·원화 약세가 겹칠 때",
      "미국 내부 조정을 넘어 글로벌 자금 축소가 한국 시장에 전달될 수 있습니다."
    ],
    invalidate: [
      "NASDAQ과 시장 폭이 따라오지 않으면 미국 전반의 회복 해석을 낮춥니다.",
      "VIX와 한국 시장이 반응하지 않으면 글로벌 위험 전염 가설의 강도를 낮춥니다."
    ],
    channels: [
      ["한국 수출", "미국 소비와 기업투자가 버티면 한국의 반도체·자동차 수요에 우호적일 수 있습니다.", "미국 소비·한국 수출"],
      ["외국인 수급", "글로벌 위험선호 변화는 한국 주식의 외국인 자금 배분으로 빠르게 이어질 수 있습니다.", "KOSPI·원/달러"],
      ["기업 자금비용", "미국 금융여건은 세계 채권금리와 달러를 통해 한국 기업의 조달비용에 영향을 줍니다.", "미국 장기금리·회사채"]
    ]
  },
  nasdaq: {
    up: [
      "금리 부담 완화와 기술기업 이익 기대가 성장주 평가를 높이는 흐름",
      "AI·반도체 소수 종목의 실적 기대가 지수 전체를 끌어올린 쏠림일 가능성"
    ],
    down: [
      "장기금리나 실적 기대 조정이 기술·성장주의 높은 평가를 압박하는 흐름",
      "기초 실적 변화보다 차익실현과 포지션 정리가 낙폭을 키웠을 가능성"
    ],
    flat: [
      "기술기업 성장 기대와 할인율 부담이 맞서는 흐름",
      "대형 기술주 내부의 엇갈린 실적이 지수 방향을 상쇄했을 가능성"
    ],
    better: [
      "기술주 상승이 실적과 한국 반도체로 확인됨",
      "기업 실적·설비투자 개선, VIX 안정, 한국 반도체주 동행이 나타날 때",
      "금리 기대만이 아니라 실제 이익과 투자에 근거한 상승이라는 판단이 강해집니다."
    ],
    worse: [
      "기술주 조정이 금리·변동성 충격으로 확대됨",
      "NASDAQ 추가 하락과 VIX·장기금리 상승, KOSDAQ 약세가 함께 나타날 때",
      "일부 종목 차익실현보다 성장주 전반의 할인율 충격 가능성이 커집니다."
    ],
    invalidate: [
      "기업 실적과 설비투자가 가격 방향을 확인하지 않으면 성장 기대 가설을 낮춥니다.",
      "S&P 500·VIX·KOSDAQ이 동행하지 않으면 기술주 충격의 전염 범위를 낮춰 봅니다."
    ],
    channels: [
      ["반도체 수출", "데이터센터와 AI 투자가 이어지면 한국 메모리·부품 수요로 연결될 수 있습니다.", "빅테크 CAPEX·반도체 수출"],
      ["성장주 할인율", "미국 장기금리 변화는 한국 성장기업의 평가와 자금조달 기대에도 영향을 줍니다.", "미국 10년물·KOSDAQ"],
      ["설비투자", "기술기업 투자 계획은 한국 공급망 기업의 주문과 이익 전망을 바꿀 수 있습니다.", "기업 실적발표·수주"]
    ]
  },
  vix: {
    up: [
      "옵션 헤지 수요가 늘며 글로벌 위험회피가 강화되는 흐름",
      "특정 일정이나 만기 수요로 변동성 가격만 일시적으로 오른 가능성"
    ],
    down: [
      "단기 충격 보험 수요가 줄며 시장 불안이 완화되는 흐름",
      "주가 위험이 해소된 것이 아니라 헤지 수요만 잠시 줄었을 가능성"
    ],
    flat: [
      "시장 참여자가 기존 수준의 변동성 위험을 유지하는 흐름",
      "주가 내부의 업종별 위험이 지수 변동성에 충분히 드러나지 않았을 가능성"
    ],
    better: [
      "공포 완화가 주가·원화 안정으로 확인됨",
      "VIX 하락이 이어지고 S&P 500·NASDAQ·KOSPI가 회복될 때",
      "옵션시장만의 변화보다 글로벌 위험회피가 실제로 완화됐다는 근거가 강해집니다."
    ],
    worse: [
      "변동성 상승이 달러와 주가 전반으로 번짐",
      "VIX 상승 지속과 미국·한국 주가 하락, 원/달러 상승이 함께 나타날 때",
      "일시적 헤지 수요를 넘어 금융시장 불안이 여러 자산으로 확산될 수 있습니다."
    ],
    invalidate: [
      "VIX 변화 뒤 주가지수와 환율이 반응하지 않으면 위험회피 가설을 낮춥니다.",
      "급등 뒤 빠르게 이전 수준으로 돌아오면 지속적인 금융불안 판단을 취소합니다."
    ],
    channels: [
      ["외국인 수급", "위험회피가 강해지면 한국 주식 비중 축소와 원화 약세가 함께 나타날 수 있습니다.", "KOSPI·원/달러"],
      ["자금조달", "변동성 상승이 길어지면 회사채와 주식 발행 조건이 나빠질 수 있습니다.", "신용스프레드·발행시장"],
      ["기업 의사결정", "불확실성이 지속되면 투자·고용 결정을 늦추는 경로가 생길 수 있습니다.", "기업심리·투자계획"]
    ]
  },
  wti: {
    up: [
      "원유 수요 증가나 공급 차질 우려가 에너지 비용을 높이는 흐름",
      "실물 수급보다 지정학 뉴스와 선물 포지션이 가격을 일시적으로 끌어올린 가능성"
    ],
    down: [
      "수요 둔화 우려 또는 공급 여유가 원유 가격을 낮추는 흐름",
      "경기 둔화가 아니라 재고·기술적 매매에 따른 단기 조정일 가능성"
    ],
    flat: [
      "원유 수요와 공급 재료가 균형을 이루는 흐름",
      "현물 수급 변화가 선물 가격에 아직 충분히 반영되지 않았을 가능성"
    ],
    better: [
      "에너지 비용 부담이 환율과 물가에서도 완화됨",
      "WTI 안정·하락이 이어지고 원/달러와 수입물가도 함께 낮아질 때",
      "한국의 운송·항공·화학과 가계 물가 부담이 실제로 완화될 가능성이 커집니다."
    ],
    worse: [
      "유가 충격이 원화·물가·기업 마진으로 확산됨",
      "WTI 상승 지속과 원/달러 상승, 물가 기대 확대가 겹칠 때",
      "하루 가격 충격보다 한국의 수입비용과 통화정책 부담으로 이어질 가능성이 커집니다."
    ],
    invalidate: [
      "재고·공급정책과 현물 가격이 선물 방향을 확인하지 않으면 수급 가설을 낮춥니다.",
      "원/달러·수입물가·운임이 반응하지 않으면 한국 비용 충격의 강도를 낮춥니다."
    ],
    channels: [
      ["생활물가", "연료·전기·운송비를 거쳐 소비자 가격에 시차를 두고 반영될 수 있습니다.", "수입물가·소비자물가"],
      ["운송·항공·화학", "연료와 원재료 비중이 높은 업종은 가격 전가 능력에 따라 마진 차이가 커집니다.", "유류비·운임·원가율"],
      ["무역수지", "원유 수입단가가 높아지면 같은 물량을 들여와도 수입액 부담이 커질 수 있습니다.", "에너지 수입액·경상수지"]
    ]
  },
  gold: {
    up: [
      "안전자산 수요·물가 우려·실질금리 하락 중 하나 이상이 금 선물 수요를 높이는 흐름",
      "위험회피가 아니라 달러나 금리 변화가 가격 대부분을 설명할 가능성"
    ],
    down: [
      "안전자산 수요 약화 또는 금리·달러 부담이 금 선물을 압박하는 흐름",
      "시장 불안 완화보다 선물 포지션 정리가 가격을 낮춘 가능성"
    ],
    flat: [
      "안전자산 수요와 금리·달러 부담이 균형을 이루는 흐름",
      "서로 반대되는 재료가 동시에 작용해 위험 신호가 가려졌을 가능성"
    ],
    better: [
      "금 움직임의 원인이 금리·달러와 함께 확인됨",
      "금 가격과 실질금리·달러·VIX 관계가 같은 설명을 지지할 때",
      "안전자산, 물가, 금리 중 어떤 경로가 가격을 움직였는지 구분할 근거가 강해집니다."
    ],
    worse: [
      "금과 변동성·달러가 함께 올라 위험회피가 강화됨",
      "금 상승과 VIX·달러 강세, 주가 하락이 동시에 이어질 때",
      "금 자체의 수급보다 글로벌 금융불안이 자산배분을 바꾸는 흐름일 수 있습니다."
    ],
    invalidate: [
      "실질금리·달러·VIX가 금 방향과 맞지 않으면 안전자산 가설을 낮춥니다.",
      "선물 가격만 움직이고 다른 방어자산이 반응하지 않으면 시장 전체 위험 신호로 확대하지 않습니다."
    ],
    channels: [
      ["위험 인식", "금과 VIX·달러가 함께 움직일 때 글로벌 위험회피 신호가 강해질 수 있습니다.", "VIX·달러·주가지수"],
      ["외환·보유자산", "금 가격은 중앙은행과 투자자의 외환보유·자산배분 논의에 영향을 줄 수 있습니다.", "외환보유 구성·달러"],
      ["한국 시장", "금 단독 상승은 한국 경기 충격을 뜻하지 않으며 원화와 외국인 수급의 확인이 필요합니다.", "원/달러·외국인 수급"]
    ]
  }
});

function finite(value) {
  return value !== null
    && value !== undefined
    && value !== ""
    && Number.isFinite(Number(value));
}

function formatNumber(value) {
  if (!finite(value)) return "--";
  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: Math.abs(Number(value)) >= 100 ? 1 : 2
  }).format(Number(value));
}

function signedPercent(value) {
  if (!finite(value)) return "자료 부족";
  const number = Number(value);
  return `${number >= 0 ? "+" : ""}${formatNumber(number)}%`;
}

function formatMarketValue(market) {
  if (!finite(market?.value)) return "--";
  const value = formatNumber(market.value);
  if (market.unit === "KRW") return `${value}원`;
  if (market.unit === "USD/bbl") return `${value}/배럴`;
  if (market.unit === "USD/oz") return `${value}/트로이온스`;
  if (market.unit === "pt") return `${value}포인트`;
  return value;
}

function availableHorizon(statistics, id) {
  const horizon = statistics?.horizons?.[id];
  return horizon?.status === "available" && finite(horizon.value)
    ? Number(horizon.value)
    : null;
}

function buildTrendSignal(selected, statistics) {
  const oneDay = availableHorizon(statistics, "1d");
  const fiveDay = availableHorizon(statistics, "5d");
  const current = finite(selected?.changePercent)
    && selected?.changeAvailable !== false
    ? Number(selected.changePercent)
    : oneDay;

  if (!finite(current) && !finite(fiveDay)) {
    return {
      state: "insufficient",
      label: "기간 추세 자료 부족",
      value: "시계열 확인 필요",
      detail: "당일과 5일 변화를 함께 계산할 자료가 충분하지 않습니다."
    };
  }
  if (!finite(fiveDay)) {
    return {
      state: "new",
      label: "당일 신호만 확인",
      value: `당일 ${signedPercent(current)}`,
      detail: "현재 움직임이 이어지는지 판단하려면 5일 시계열이 더 필요합니다."
    };
  }

  const shortValue = finite(oneDay) ? oneDay : current;
  const sameDirection =
    Math.sign(Number(shortValue)) === Math.sign(Number(fiveDay))
    || Number(shortValue) === 0
    || Number(fiveDay) === 0;
  return sameDirection
    ? {
        state: "confirming",
        label: "단기 추세 확인",
        value: `1일 ${signedPercent(shortValue)} · 5일 ${signedPercent(fiveDay)}`,
        detail: "당일과 5일 방향이 같아 현재 움직임이 하루에만 그치지 않았는지 확인할 근거가 있습니다."
      }
    : {
        state: "reversing",
        label: "단기 방향 전환",
        value: `1일 ${signedPercent(shortValue)} · 5일 ${signedPercent(fiveDay)}`,
        detail: "당일 방향이 5일 흐름과 반대입니다. 추세 전환인지 일시 반등·조정인지 다음 관측이 필요합니다."
      };
}

function marketNames(ids, markets) {
  const byId = Object.fromEntries((markets || []).map((market) => [market.id, market]));
  return (ids || []).map((id) => byId[id]?.name || id);
}

function buildCrossMarketClues(statisticalAnalysis, selectedId) {
  const drivers = [
    ...(statisticalAnalysis?.drivers?.adverse || []),
    ...(statisticalAnalysis?.drivers?.favorable || [])
  ];
  const unique = new Map();
  for (const driver of drivers) {
    if (!driver?.id || driver.id === selectedId || unique.has(driver.id)) continue;
    unique.set(driver.id, driver);
  }
  return [...unique.values()]
    .sort((left, right) => Number(right.severity || 0) - Number(left.severity || 0))
    .slice(0, 3)
    .map((driver) => ({
      id: driver.id,
      label: driver.label || driver.id,
      state: driver.riskDirection || "neutral",
      role: driver.riskDirection === "adverse"
        ? "위험 확대 단서"
        : driver.riskDirection === "favorable"
          ? "위험 완화 단서"
          : "방향 미확정 단서",
      fact: `1일 ${signedPercent(driver.change1d)}${finite(driver.mediumChange) ? ` · ${driver.mediumLabel || "중기"} ${signedPercent(driver.mediumChange)}` : ""}`,
      detail: driver.transmission || "선택 시장과 함께 움직이는지 추가 확인합니다.",
      severity: finite(driver.severity) ? Number(driver.severity) : null,
      aligned: driver.aligned,
      caveat: driver.caveat || "동시 움직임만으로 원인을 확정할 수 없습니다."
    }));
}

function buildCauseCandidates({ hypothesis, trend, clues, agreement, confidenceLabel }) {
  const firstClue = clues[0];
  return [
    {
      kind: "primary",
      label: "01 · 주요 가설",
      title: hypothesis[0],
      detail: trend.detail,
      basis: trend.value,
      confidence: confidenceLabel
    },
    {
      kind: "cross",
      label: "02 · 교차시장 단서",
      title: firstClue ? `${firstClue.label}의 동시 움직임을 함께 확인` : "교차 시장의 방향이 원인 가설을 충분히 확인하지 못함",
      detail: firstClue ? `${firstClue.fact} · ${firstClue.detail}` : `${agreement.dominant || "혼조"} · 추가 교차 자료가 필요합니다.`,
      basis: firstClue ? firstClue.role : "시장 신호 일치",
      confidence: firstClue ? "보조 근거" : "자료 부족"
    },
    {
      kind: "alternative",
      label: "03 · 대안 가설",
      title: hypothesis[1],
      detail: "업종 기여도·수급·뉴스 발생 시점이 추가되면 주요 가설보다 이 설명이 더 적절할 수 있습니다.",
      basis: "반대 설명을 의도적으로 유지",
      confidence: "추가 확인"
    }
  ];
}

function formatTimestamp(value, timezone = "Asia/Seoul") {
  const timestamp = Date.parse(String(value || ""));
  if (!Number.isFinite(timestamp)) return null;
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timezone
    }).format(new Date(timestamp));
  } catch {
    return new Date(timestamp).toISOString();
  }
}

export function buildMarketDeepModel({
  selected,
  markets = [],
  read = {},
  statisticalAnalysis = {}
} = {}) {
  if (!selected) {
    return {
      available: false,
      thesis: "선택 시장 자료가 없어 심층 판단을 만들지 않습니다.",
      causeAssessment: {
        title: "시장 움직임의 원인을 판단할 자료가 없습니다.",
        summary: "선택 시장의 현재값과 등락 자료가 확인될 때 원인 가설을 표시합니다.",
        alternative: "자료가 없는 상태에서는 다른 원인도 추정하지 않습니다.",
        evidence: [],
        statusLabel: "판단 자료 부족",
        confidenceLabel: "자료 부족",
        confidenceScore: null,
        warning: "확인되지 않은 숫자나 사건으로 원인을 만들지 않습니다."
      },
      evidence: [],
      facts: [],
      inferences: [],
      pathSteps: [],
      impactChannels: [],
      counterSignals: [],
      invalidation: [],
      scenarios: [],
      causeCandidates: [],
      crossMarketClues: [],
      historicalAnalogs: { status: "insufficient", reason: "선택 시장 자료 없음", matches: [] },
      confidenceComponents: [],
      dataQualityComponents: []
    };
  }

  const rule = MARKET_DEEP_RULES[selected.id] || {};
  const changeAvailable =
    finite(selected.changePercent)
    && selected.changeAvailable !== false;
  const change = changeAvailable ? Number(selected.changePercent) : null;
  const direction = !changeAvailable || change === 0
    ? "flat"
    : change > 0
      ? "up"
      : "down";
  const hypothesis = rule[direction] || rule.flat || [
    read.interpretation || "선택 시장의 현재 움직임을 교차 확인합니다.",
    read.caution || "한 시장만으로 원인을 확정하지 않습니다."
  ];
  const selectedStatistics = statisticalAnalysis?.markets?.[selected.id] || null;
  const baseTrend = buildTrendSignal(selected, selectedStatistics);
  const assessment = selectedStatistics?.assessment || null;
  const trend = assessment
    ? {
        ...baseTrend,
        detail: `${baseTrend.detail} 다기간 종합은 ${assessment.label || "판단 자료 부족"}${assessment.position?.label ? `, 현재 위치는 ${assessment.position.label}` : ""}입니다.`
      }
    : baseTrend;
  const agreement = statisticalAnalysis?.directionAgreement || {};
  const crossMarketClues = buildCrossMarketClues(statisticalAnalysis, selected.id);
  const agreeingNames = marketNames(agreement.agreeingSignals, markets);
  const counterNames = marketNames(agreement.counterSignals, markets);
  const agreementValue = finite(agreement.rate)
    ? `${formatNumber(agreement.rate)}% · ${agreement.dominant || "혼조"}`
    : "판단 자료 부족";
  const agreementDetail = agreeingNames.length
    ? `같은 방향의 위험 신호: ${agreeingNames.join(", ")}`
    : "방향이 확인된 교차 시장이 충분하지 않습니다.";
  const quality = statisticalAnalysis?.dataQuality || {};
  const freshness = finite(quality.ageMinutes)
    ? `${formatNumber(quality.ageMinutes)}분 경과`
    : "기준시각 확인 필요";
  const currentValue = `${formatMarketValue(selected)} · ${changeAvailable ? signedPercent(change) : "등락률 계산 불가"}`;
  const peerFacts = Array.isArray(read.checks) ? read.checks.slice(0, 2) : [];
  const watch = Array.isArray(read.watch) ? read.watch.slice(0, 3) : [];
  const confidenceScore = finite(statisticalAnalysis?.confidence?.score)
    ? Number(statisticalAnalysis.confidence.score)
    : null;
  const movementLabel = !changeAvailable
    ? "움직임"
    : direction === "down"
      ? "하락"
      : direction === "up"
        ? "상승"
        : "보합";
  const confidenceLabel = statisticalAnalysis?.confidence?.label || "자료 부족";
  const causeCandidates = changeAvailable
    ? buildCauseCandidates({
        hypothesis,
        trend,
        clues: crossMarketClues,
        agreement,
        confidenceLabel
      })
    : [
        {
          kind: "primary",
          label: "01 · 원인 판단 보류",
          title: "이전 종가가 없어 상승·하락 방향부터 확정할 수 없음",
          detail: "방향 기준이 없는 상태에서는 가격 원인을 만들지 않습니다.",
          basis: "등락률 계산 불가",
          confidence: "판단 보류"
        },
        {
          kind: "cross",
          label: "02 · 확인 가능한 범위",
          title: "현재값과 기간 시계열은 참고하되 당일 원인에는 사용하지 않음",
          detail: trend.detail,
          basis: trend.value,
          confidence: "참고 자료"
        },
        {
          kind: "alternative",
          label: "03 · 분석 재개 조건",
          title: "같은 거래일의 현재값·이전 종가·기준시각이 모두 확인돼야 함",
          detail: "원자료가 복구되면 기간 흐름과 교차 시장을 다시 계산합니다.",
          basis: "원자료 복구",
          confidence: "대기"
        }
      ];
  const causeAssessment = changeAvailable
    ? {
        title: `${selected.name} ${movementLabel}의 가장 유력한 설명`,
        summary: hypothesis[0],
        alternative: hypothesis[1],
        evidence: [
          `현재값 ${currentValue}`,
          trend.value,
          crossMarketClues[0]
            ? `${crossMarketClues[0].label} ${crossMarketClues[0].fact}`
            : `교차 시장 ${agreementValue}`
        ],
        statusLabel: "추정 분석 · 틀릴 수 있음",
        confidenceLabel: statisticalAnalysis?.confidence?.label || "자료 부족",
        confidenceScore,
        warning: "가격과 다른 시장의 동시 움직임을 규칙으로 연결한 원인 가설입니다. 실제 원인과 다를 수 있으며 수급·업종 기여도·뉴스 발생 시점 자료가 추가되면 판단이 바뀔 수 있습니다."
      }
    : {
        title: `${selected.name} 움직임의 원인 판단 보류`,
        summary: "이전 종가 또는 등락률이 확인되지 않아 상승·하락 원인을 추정하지 않습니다.",
        alternative: "원자료가 복구된 뒤 기간 흐름과 교차 시장을 다시 확인합니다.",
        evidence: [currentValue, trend.value],
        statusLabel: "판단 자료 부족 · 원인 단정 안 함",
        confidenceLabel: "자료 부족",
        confidenceScore: null,
        warning: "등락 기준이 없는 상태에서 원인을 만들면 방향 자체를 잘못 설명할 수 있으므로 판단을 보류합니다."
      };
  const analogResult = selectedStatistics?.analogs || {
    status: "insufficient",
    reason: "장기 시계열 자료 부족",
    matches: []
  };
  const historicalAnalogs = {
    status: analogResult.status || "insufficient",
    reason: analogResult.reason || null,
    current: analogResult.current || null,
    matches: Array.isArray(analogResult.matches) ? analogResult.matches.slice(0, 3) : [],
    methodology: analogResult.methodology || "5일·20일 가격 변화 비교",
    warning: "비슷한 가격 모양을 찾은 결과이며 당시 뉴스·정책·기업 실적이 같다는 뜻이 아닙니다. 이후 20일 변화도 재현 확률이나 전망치로 사용하지 않습니다."
  };
  const counterDriverTexts = (statisticalAnalysis?.drivers?.counter || [])
    .filter((driver) => driver?.id !== selected.id)
    .slice(0, 2)
    .map((driver) => `${driver.label || driver.id}: 1일 ${signedPercent(driver.change1d)}${finite(driver.mediumChange) ? ` · ${driver.mediumLabel || "중기"} ${signedPercent(driver.mediumChange)}` : ""}`);

  return {
    available: true,
    direction,
    thesis: hypothesis[0],
    alternative: hypothesis[1],
    causeAssessment,
    causeCandidates,
    crossMarketClues,
    assessment,
    historicalAnalogs,
    confidenceComponents: statisticalAnalysis?.confidence?.components || [],
    dataQualityComponents: statisticalAnalysis?.dataQuality?.components || [],
    trend,
    evidence: [
      {
        id: "current",
        label: "현재 움직임",
        value: currentValue,
        detail: read.movement || "현재 움직임을 계산할 수 없습니다.",
        state: read.tone || "neutral"
      },
      {
        id: "trend",
        label: trend.label,
        value: trend.value,
        detail: trend.detail,
        state: trend.state
      },
      {
        id: "agreement",
        label: "시장 간 신호 일치",
        value: agreementValue,
        detail: agreementDetail,
        state: agreement.dominant === "위험 확대"
          ? "negative"
          : agreement.dominant === "위험 완화"
            ? "positive"
            : "neutral"
      },
      {
        id: "quality",
        label: "자료 최신성",
        value: `${quality.label || "자료 부족"} · ${freshness}`,
        detail: `사용 가능 자료 ${finite(quality.availableRatio) ? `${formatNumber(quality.availableRatio)}%` : "확인 필요"} · 충분한 시계열 ${finite(quality.sufficientSampleRatio) ? `${formatNumber(quality.sufficientSampleRatio)}%` : "확인 필요"}`,
        state: quality.label === "양호"
          ? "positive"
          : quality.label === "부족"
            ? "negative"
            : "watch"
      }
    ],
    facts: [
      {
        label: `${selected.name} 현재값`,
        value: currentValue,
        note: formatTimestamp(selected.asOf, selected.timezone)
          ? `원자료 기준 ${formatTimestamp(selected.asOf, selected.timezone)} (${selected.timezone || "Asia/Seoul"})`
          : "기준시각 확인 필요"
      },
      ...peerFacts.map((item) => ({
        label: item.name,
        value: item.value,
        note: item.question
      })),
      {
        label: "기간 비교",
        value: trend.value,
        note: trend.detail
      }
    ],
    inferences: [
      {
        label: "주요 가설",
        title: hypothesis[0],
        basis: `${read.movement || ""} ${agreementDetail}`.trim(),
        confidence: statisticalAnalysis?.confidence?.label || "자료 부족"
      },
      {
        label: "대안 가설",
        title: hypothesis[1],
        basis: "선택 시장 하나의 움직임만으로 원인을 확정하지 않기 위한 반대 설명",
        confidence: "추가 확인"
      },
      {
        label: "한국 전달",
        title: read.koreaImpact || "한국 경제 영향은 관련 시장과 공식 지표의 확인이 필요합니다.",
        basis: read.transmission || "전달 경로 자료 부족",
        confidence: quality.label === "양호" ? "중간" : "낮음"
      }
    ],
    pathSteps: String(read.transmission || "")
      .split("→")
      .map((step) => step.trim())
      .filter(Boolean),
    impactChannels: (rule.channels || []).map(([label, text, check]) => ({
      label,
      text,
      check
    })),
    counterSignals: [
      ...(counterNames.length
        ? [`현재 주된 방향과 반대로 움직이는 시장: ${counterNames.join(", ")}`]
        : ["통계상 뚜렷한 반대 시장 신호는 확인되지 않았습니다."]),
      ...counterDriverTexts,
      hypothesis[1]
    ],
    invalidation: [
      `다음 관측에서 ${selected.name}이 현재 방향을 되돌리고 기간 추세도 확인되지 않으면 주요 가설을 낮춥니다.`,
      ...(rule.invalidate || []),
      "원자료 기준시각이나 이전 종가가 바뀌어 등락률이 수정되면 현재 판단을 다시 계산합니다."
    ],
    scenarios: [
      {
        id: "base",
        label: "기본 시나리오",
        title: trend.state === "reversing"
          ? `${selected.name}의 방향 전환 여부를 확인`
          : `${selected.name}의 현재 흐름이 이어지는 확인 구간`,
        trigger: `${trend.value} 흐름이 유지되고 핵심 교차 지표가 현재 방향을 뒤집지 않을 때`,
        meaning: hypothesis[0],
        checks: watch
      },
      {
        id: "better",
        label: "개선 시나리오",
        title: rule.better?.[0] || "교차 지표가 개선 방향을 확인",
        trigger: rule.better?.[1] || "선택 시장과 관련 지표가 함께 개선될 때",
        meaning: rule.better?.[2] || "현재 부담을 낮춰 볼 근거가 강해집니다.",
        checks: watch
      },
      {
        id: "worse",
        label: "위험 시나리오",
        title: rule.worse?.[0] || "부담이 다른 시장으로 확산",
        trigger: rule.worse?.[1] || "선택 시장의 부담과 관련 지표 악화가 겹칠 때",
        meaning: rule.worse?.[2] || "현재 판단보다 위험을 높여 볼 근거가 강해집니다.",
        checks: watch
      }
    ]
  };
}
