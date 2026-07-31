export const broadIndicatorCategories = [
  { id: "fiscal", label: "재정·정부" },
  { id: "infrastructure", label: "교통·인프라" }
];

export const broadIndicatorDefinitions = [
  {
    id: "population-total", code: "SP.POP.TOTL", category: "population",
    name: "총인구", shortName: "인구", unit: "명", precision: 0, format: "compactNumber",
    description: "국적과 관계없이 해당 국가에 통상 거주하는 사람의 연앙 인구 추정치입니다.",
    reading: "시장 규모와 노동력, 주택·교육·의료 수요의 가장 기본적인 분모로 활용할 수 있습니다.",
    caution: "등록인구와 조사인구가 다를 수 있고 연중 이동과 추계 개편으로 과거 값도 수정될 수 있습니다."
  },
  {
    id: "working-age-share", code: "SP.POP.1564.TO.ZS", category: "population",
    name: "생산연령인구 비중", shortName: "생산연령인구", unit: "%", precision: 1,
    description: "전체 인구에서 일반적으로 일할 수 있는 연령인 15~64세가 차지하는 비율입니다.",
    reading: "비중이 낮아지면 같은 경제 규모를 유지하기 위한 생산성 향상과 노동 참여 확대가 중요해집니다.",
    caution: "실제 취업자 비중이 아니며 정년, 학업, 건강 상태와 국가별 노동시장 제도를 반영하지 않습니다."
  },
  {
    id: "child-population-share", code: "SP.POP.0014.TO.ZS", category: "population",
    name: "0~14세 인구 비중", shortName: "아동 인구", unit: "%", precision: 1,
    description: "전체 인구에서 0세부터 14세까지의 아동 인구가 차지하는 비율입니다.",
    reading: "앞으로 노동시장에 진입할 세대의 규모와 교육·돌봄 서비스 수요를 가늠할 수 있습니다.",
    caution: "연령 비중만으로 교육의 질이나 미래 취업자 수를 단정할 수 없으며 이민도 함께 봐야 합니다."
  },
  {
    id: "old-age-dependency", code: "SP.POP.DPND.OL", category: "population",
    name: "노년부양비", shortName: "노년부양비", unit: "명/생산연령 100명", precision: 1,
    description: "15~64세 인구 100명당 65세 이상 인구가 몇 명인지 보여주는 인구구조 지표입니다.",
    reading: "상승할수록 연금·의료·돌봄 재정과 생산연령층의 부담이 커질 가능성을 점검해야 합니다.",
    caution: "고령층의 취업과 자산, 실제 가족 부양과 정부 이전지출은 이 비율에 포함되지 않습니다."
  },
  {
    id: "nominal-gdp", code: "NY.GDP.MKTP.CD", category: "economy",
    name: "명목 GDP", shortName: "경제 규모", unit: "달러", precision: 1, format: "compactCurrency",
    description: "한 국가 안에서 생산된 최종 재화와 서비스의 가치를 현재가격 미국달러로 환산한 값입니다.",
    reading: "국제 시장에서 보이는 경제의 전체 크기와 재정·기업시장 규모를 비교하는 기본 지표입니다.",
    caution: "물가와 환율 변화가 함께 반영되므로 실질 생산 증가나 국민의 생활수준과 동일하지 않습니다."
  },
  {
    id: "gni-per-capita", code: "NY.GNP.PCAP.CD", category: "economy",
    name: "1인당 국민총소득", shortName: "1인당 GNI", unit: "달러/명", precision: 0, format: "currency",
    description: "국민이 국내외에서 벌어들인 총소득을 인구로 나눈 현재가격 미국달러 기준 값입니다.",
    reading: "국내 생산만 보는 GDP와 달리 해외에서 받은 소득과 지급한 소득까지 반영해 소득 수준을 봅니다.",
    caution: "평균값이므로 소득분배를 보여주지 않으며 시장환율 변동에 따라 국가 순서가 달라질 수 있습니다."
  },
  {
    id: "agriculture-share", code: "NV.AGR.TOTL.ZS", category: "economy",
    name: "농림어업 부가가치 비중", shortName: "농림어업 비중", unit: "% GDP", precision: 1,
    description: "농업·임업·어업에서 만들어진 부가가치가 국내총생산에서 차지하는 비율입니다.",
    reading: "식량 생산과 1차 산업이 경제와 고용에 미치는 구조적 중요도를 비교할 수 있습니다.",
    caution: "비중이 낮아도 생산액이 작다는 뜻은 아니며 가공식품과 유통 부가가치는 다른 산업에 잡힙니다."
  },
  {
    id: "industry-share", code: "NV.IND.TOTL.ZS", category: "economy",
    name: "산업 부가가치 비중", shortName: "산업 비중", unit: "% GDP", precision: 1,
    description: "제조업·광업·건설·전력 등 산업 부문이 GDP에서 만들어낸 부가가치의 비중입니다.",
    reading: "설비투자와 원자재·수출 경기 변화에 경제가 얼마나 민감한지 파악하는 데 도움이 됩니다.",
    caution: "제조업만의 비중이 아니며 산업의 생산성·기술 수준과 환경 비용은 별도로 확인해야 합니다."
  },
  {
    id: "household-consumption", code: "NE.CON.PRVT.ZS", category: "economy",
    name: "가계소비 비중", shortName: "민간소비", unit: "% GDP", precision: 1,
    description: "가계와 가계지원 비영리기관의 최종 소비지출을 GDP와 비교한 비율입니다.",
    reading: "경제가 수출·투자보다 가계의 소비와 내수에 어느 정도 의존하는지 보여줍니다.",
    caution: "비중 상승이 소비 호조가 아니라 투자·수출 감소로 분모 구성이 바뀐 결과일 수도 있습니다."
  },
  {
    id: "government-consumption", code: "NE.CON.GOVT.ZS", category: "economy",
    name: "정부소비 비중", shortName: "정부소비", unit: "% GDP", precision: 1,
    description: "정부가 공공서비스를 제공하기 위해 사용한 최종 소비지출을 GDP와 비교한 비율입니다.",
    reading: "행정·교육·보건 등 공공서비스가 경제 수요에서 차지하는 크기를 살펴볼 수 있습니다.",
    caution: "사회보장 현금이전과 공공투자는 포함 범위가 다르므로 정부 전체 지출과 같지 않습니다."
  },
  {
    id: "female-unemployment", code: "SL.UEM.TOTL.FE.ZS", category: "labor",
    name: "여성 실업률", shortName: "여성 실업", unit: "% 여성 노동력", precision: 1,
    description: "일할 의사와 능력이 있는 여성 노동력 중 일자리를 찾지 못한 비율입니다.",
    reading: "전체 실업률과 비교하면 성별 노동시장 진입과 경기 충격의 차이를 확인할 수 있습니다.",
    caution: "구직을 포기한 사람은 제외될 수 있어 여성 고용률과 경제활동참가율도 함께 봐야 합니다."
  },
  {
    id: "vulnerable-employment", code: "SL.EMP.VULN.ZS", category: "labor",
    name: "취약고용 비중", shortName: "취약고용", unit: "% 취업자", precision: 1,
    description: "전체 취업자 중 자영업자와 무급가족종사자가 차지하는 비율을 보여줍니다.",
    reading: "고용보험과 안정적 임금계약의 보호를 받기 어려운 일자리의 구조적 비중을 가늠합니다.",
    caution: "모든 자영업이 취약한 것은 아니며 소득 수준과 사회보험 가입 여부를 직접 보여주지는 않습니다."
  },
  {
    id: "self-employment", code: "SL.EMP.SELF.ZS", category: "labor",
    name: "자영업 종사자 비중", shortName: "자영업 비중", unit: "% 취업자", precision: 1,
    description: "전체 취업자 중 고용주·자영업자·생산자조합원·무급가족종사자의 비율입니다.",
    reading: "임금근로 중심인지 소규모 사업과 가족노동 중심인지 노동시장 구조를 비교할 수 있습니다.",
    caution: "플랫폼 노동과 법인 대표의 분류가 다를 수 있고 자영업자의 소득과 생산성은 나타나지 않습니다."
  },
  {
    id: "wage-employment", code: "SL.EMP.WORK.ZS", category: "labor",
    name: "임금근로자 비중", shortName: "임금근로", unit: "% 취업자", precision: 1,
    description: "전체 취업자 가운데 사용자와 명시적 또는 묵시적 고용계약을 맺은 근로자의 비율입니다.",
    reading: "기업·정부의 정규적인 급여 고용이 노동시장에서 차지하는 비중을 국가별로 비교합니다.",
    caution: "임금근로자라도 계약기간·임금·사회보험이 불안정할 수 있어 일자리 질과 같지 않습니다."
  },
  {
    id: "health-spending-per-capita", code: "SH.XPD.CHEX.PC.CD", category: "health",
    name: "1인당 의료비", shortName: "의료비/명", unit: "달러/명", precision: 0, format: "currency",
    description: "국가 전체 경상의료비를 인구로 나누어 현재가격 미국달러로 환산한 값입니다.",
    reading: "국민 한 명당 의료 서비스와 의약품에 투입되는 평균 재원 규모를 비교할 수 있습니다.",
    caution: "환율과 의료가격 차이가 크며 지출이 많다고 건강성과나 의료 접근성이 반드시 좋은 것은 아닙니다."
  },
  {
    id: "maternal-mortality", code: "SH.STA.MMRT", category: "health",
    name: "모성 사망비", shortName: "모성 사망", unit: "명/출생 10만명", precision: 0,
    description: "임신·출산과 관련된 원인으로 사망한 여성 수를 출생아 10만 명당 나타낸 추정치입니다.",
    reading: "산전관리와 응급 산과진료, 여성의 의료 접근성을 함께 보여주는 핵심 보건 지표입니다.",
    caution: "사망 등록이 불완전한 국가는 통계모형 추정 비중이 높고 공표 간격도 일정하지 않습니다."
  },
  {
    id: "basic-drinking-water", code: "SH.H2O.BASW.ZS", category: "health",
    name: "기본 식수 이용률", shortName: "기본 식수", unit: "% 인구", precision: 1,
    description: "개선된 식수원을 이용하며 왕복 30분 안에 물을 구할 수 있는 인구의 비율입니다.",
    reading: "위생·감염병과 생활 인프라의 기초 수준을 국가와 지역 간에 비교할 수 있습니다.",
    caution: "수질의 지속적인 안전성과 단수 빈도까지 보장하는 상위 단계의 안전관리 식수와는 다릅니다."
  },
  {
    id: "secondary-enrollment", code: "SE.SEC.ENRR", category: "education",
    name: "중등교육 총취학률", shortName: "중등교육 취학", unit: "%", precision: 1,
    description: "공식 중등교육 연령 인구와 비교한 실제 중등교육 재학생의 전체 비율입니다.",
    reading: "청소년이 기초교육 이후 학습과 기술 습득 단계에 얼마나 진입하는지 보여줍니다.",
    caution: "연령이 다른 학생도 포함해 100%를 넘을 수 있으며 졸업률과 학습 성취도는 별도입니다."
  },
  {
    id: "education-spending", code: "SE.XPD.TOTL.GD.ZS", category: "education",
    name: "정부 교육지출 비중", shortName: "교육 재정", unit: "% GDP", precision: 1,
    description: "중앙·지방정부의 교육 관련 경상·자본 지출을 GDP와 비교한 비율입니다.",
    reading: "한 국가가 인적자본 형성과 학교 운영에 투입하는 공공재원의 상대적 크기를 보여줍니다.",
    caution: "학생 수와 교사 임금, 민간교육비가 달라 지출 비중만으로 교육성과를 판단할 수 없습니다."
  },
  {
    id: "researchers-per-million", code: "SP.POP.SCIE.RD.P6", category: "education",
    name: "연구원 수", shortName: "연구인력", unit: "명/인구 100만명", precision: 0,
    description: "연구개발 활동에 참여하는 전문 연구원 수를 인구 100만 명당 나타낸 값입니다.",
    reading: "연구개발비와 함께 보면 기술혁신을 수행할 사람과 자본의 투입 강도를 비교할 수 있습니다.",
    caution: "전일제 환산 방식과 조사 범위가 다르며 연구 성과와 사업화 성공을 직접 뜻하지 않습니다."
  },
  {
    id: "electricity-access", code: "EG.ELC.ACCS.ZS", category: "environment",
    name: "전력 접근률", shortName: "전력 접근", unit: "% 인구", precision: 1,
    description: "가정에서 전기를 사용할 수 있는 인구가 전체 인구에서 차지하는 비율입니다.",
    reading: "생활 인프라뿐 아니라 교육·보건·디지털경제 참여가 가능한 기본 조건을 보여줍니다.",
    caution: "연결 여부만 나타내며 정전 빈도, 전력 품질, 가격 부담과 발전원의 탄소배출은 포함하지 않습니다."
  },
  {
    id: "electricity-consumption", code: "EG.USE.ELEC.KH.PC", category: "environment",
    name: "1인당 전력 소비", shortName: "전력 소비", unit: "kWh/명", precision: 0,
    description: "한 해 동안 사용한 전력량을 인구로 나눈 1인당 킬로와트시 기준 값입니다.",
    reading: "산업구조와 생활 전기화, 냉난방·데이터센터 수요를 함께 반영하는 에너지 지표입니다.",
    caution: "전력 수출입과 송배전 손실, 산업 비중이 달라 가계의 실제 사용량과 같지 않습니다."
  },
  {
    id: "net-energy-imports", code: "EG.IMP.CONS.ZS", category: "environment",
    name: "순에너지 수입 의존도", shortName: "에너지 수입", unit: "% 에너지사용", precision: 1,
    description: "에너지 사용량에서 국내 생산을 뺀 순수입 에너지가 차지하는 비율입니다.",
    reading: "높을수록 국제 유가·가스 가격과 환율, 공급망 충격이 국내 물가에 전달되기 쉽습니다.",
    caution: "마이너스 값은 순수출국을 뜻하며 비축량과 장기계약, 발전원 구성은 별도로 확인해야 합니다."
  },
  {
    id: "bank-npl", code: "FB.AST.NPER.ZS", category: "finance",
    name: "은행 부실채권 비율", shortName: "부실채권", unit: "% 총대출", precision: 1,
    description: "원리금이 연체되거나 회수 가능성이 낮은 대출이 전체 은행 대출에서 차지하는 비율입니다.",
    reading: "상승하면 은행의 손실흡수 부담과 신규 대출 위축, 금융불안 가능성을 점검해야 합니다.",
    caution: "국가별 부실 분류·상각 기준이 다르고 정책성 만기연장이 문제를 늦게 드러낼 수 있습니다."
  },
  {
    id: "lending-interest-rate", code: "FR.INR.LEND", category: "finance",
    name: "은행 대출금리", shortName: "대출금리", unit: "%", precision: 1,
    description: "민간 부문에 제공되는 단기·중기 대출에 은행이 적용하는 대표 금리입니다.",
    reading: "가계와 기업이 실제로 부담하는 차입비용의 방향과 통화정책 전달 정도를 살펴볼 수 있습니다.",
    caution: "상품·신용등급별 금리가 다르고 국가별 대표금리 선정 방식도 달라 직접 비교에 주의해야 합니다."
  },
  {
    id: "deposit-interest-rate", code: "FR.INR.DPST", category: "finance",
    name: "은행 예금금리", shortName: "예금금리", unit: "%", precision: 1,
    description: "일정 기간 금융기관에 예치한 자금에 지급되는 대표적인 예금 이자율입니다.",
    reading: "현금성 자산의 보상과 소비·투자 대신 저축을 선택할 유인이 얼마나 큰지 보여줍니다.",
    caution: "만기와 상품별 금리가 다르며 세금과 물가를 제외한 실질 수익률과는 차이가 있습니다."
  },
  {
    id: "stock-turnover", code: "CM.MKT.TRNR", category: "finance",
    name: "주식시장 회전율", shortName: "증시 회전율", unit: "% 시가총액", precision: 1,
    description: "한 해 주식 거래대금을 상장주식 평균 시가총액과 비교한 금융시장 유동성 지표입니다.",
    reading: "높을수록 주식이 활발히 거래되지만 단기 매매와 시장 과열도 함께 커질 수 있습니다.",
    caution: "거래량이 많아도 자금조달 기능과 장기투자 기반이 강하다는 뜻은 아니며 급등락기에 크게 뛸 수 있습니다."
  },
  {
    id: "remittance-inflows", code: "BX.TRF.PWKR.DT.GD.ZS", category: "external",
    name: "해외송금 유입 비중", shortName: "송금 유입", unit: "% GDP", precision: 2,
    description: "해외에서 일하는 개인 등이 국내 가계로 보낸 송금액을 GDP와 비교한 비율입니다.",
    reading: "일부 국가에서는 가계소득과 외화 유동성을 지탱하는 중요한 대외수입원으로 작용합니다.",
    caution: "비공식 송금은 빠질 수 있고 유학생·외국인 노동자 구조에 따라 선진국에서도 방향이 달라집니다."
  },
  {
    id: "total-reserves-usd", code: "FI.RES.TOTL.CD", category: "external",
    name: "외환보유액", shortName: "외환보유액", unit: "달러", precision: 1, format: "compactCurrency",
    description: "통화당국이 보유한 외화자산과 금 보유액 등을 현재가격 미국달러로 합산한 값입니다.",
    reading: "외화 유동성 충격과 환율 급변에 대응할 수 있는 대외 안전판의 절대 규모를 보여줍니다.",
    caution: "경제와 수입 규모가 큰 나라일수록 절대액이 커서 수입개월·단기외채와 함께 비교해야 합니다."
  },
  {
    id: "goods-services-balance", code: "NE.RSB.GNFS.ZS", category: "external",
    name: "상품·서비스 수지", shortName: "순수출", unit: "% GDP", precision: 1,
    description: "상품과 서비스 수출에서 수입을 뺀 순수출을 GDP와 비교한 비율입니다.",
    reading: "플러스면 교역이 국내 생산 수요를 보태고 마이너스면 해외 재화·서비스를 더 많이 이용한 것입니다.",
    caution: "소득수지와 이전소득이 빠져 있어 경상수지와 다르며 불황으로 수입이 줄어 개선될 수도 있습니다."
  },
  {
    id: "merchandise-exports", code: "TX.VAL.MRCH.CD.WT", category: "external",
    name: "상품 수출액", shortName: "상품 수출", unit: "달러", precision: 1, format: "compactCurrency",
    description: "국경을 넘어 판매된 상품의 연간 수출액을 현재가격 미국달러로 나타낸 값입니다.",
    reading: "제조업과 원자재의 해외 판매 규모, 세계 교역 변화에 대한 노출도를 직접 확인할 수 있습니다.",
    caution: "서비스 수출이 빠져 있고 물가·환율 효과가 포함되므로 실제 수출 물량 증가와 다를 수 있습니다."
  },
  {
    id: "merchandise-imports", code: "TM.VAL.MRCH.CD.WT", category: "external",
    name: "상품 수입액", shortName: "상품 수입", unit: "달러", precision: 1, format: "compactCurrency",
    description: "국경을 넘어 구매한 상품의 연간 수입액을 현재가격 미국달러로 나타낸 값입니다.",
    reading: "원유·원자재·소비재와 자본재에 대한 해외 의존 및 국내 수요의 규모를 살펴볼 수 있습니다.",
    caution: "서비스 수입이 빠져 있고 원자재 가격 상승만으로도 수입액이 늘 수 있어 물량과 구분해야 합니다."
  },
  {
    id: "government-debt", code: "GC.DOD.TOTL.GD.ZS", category: "fiscal",
    name: "중앙정부 부채 비중", shortName: "정부 부채", unit: "% GDP", precision: 1,
    description: "중앙정부가 상환해야 할 채무 잔액을 국내총생산과 비교한 비율입니다.",
    reading: "경제 규모에 비해 정부의 기존 채무 부담과 위기 때 재정을 사용할 여력을 점검하는 출발점입니다.",
    caution: "일반정부·공공기관·연금부채 포함 범위가 국가마다 달라 동일 정의의 직접 비교가 어렵습니다."
  },
  {
    id: "government-expense", code: "GC.XPN.TOTL.GD.ZS", category: "fiscal",
    name: "정부 비용 비중", shortName: "정부 비용", unit: "% GDP", precision: 1,
    description: "중앙정부의 보상·보조금·이자·사회급여 등 비용을 GDP와 비교한 비율입니다.",
    reading: "정부 운영과 이전지출이 경제 규모에서 차지하는 크기와 재정 구조를 비교할 수 있습니다.",
    caution: "자산 취득 같은 일부 투자는 비용 정의에서 제외되며 정부 전체 지출 범위와 일치하지 않습니다."
  },
  {
    id: "secure-internet-servers", code: "IT.NET.SECR.P6", category: "infrastructure",
    name: "보안 인터넷 서버", shortName: "보안 서버", unit: "대/인구 100만명", precision: 0, format: "compactNumber",
    description: "암호화된 인터넷 거래에 사용할 수 있는 보안 서버 수를 인구 100만 명당 나타낸 값입니다.",
    reading: "전자상거래와 디지털 금융을 운영할 기술 인프라의 보급 정도를 비교하는 보조 지표입니다.",
    caution: "클라우드 위치와 인증서 발급 관행 때문에 실제 국내 서비스 이용량이나 보안 수준과 다를 수 있습니다."
  },
  {
    id: "air-passengers", code: "IS.AIR.PSGR", category: "infrastructure",
    name: "항공 여객 운송", shortName: "항공 여객", unit: "명", precision: 0, format: "compactNumber",
    description: "해당 국가에 등록된 항공사가 국내외 노선에서 운송한 연간 승객 수입니다.",
    reading: "관광·출장·국제 연결성과 항공산업의 실제 활동량 변화를 살펴볼 수 있습니다.",
    caution: "공항 이용객 수와 다르며 외국 항공사가 운송한 승객은 해당 국가 통계에 잡히지 않을 수 있습니다."
  },
  {
    id: "container-port-traffic", code: "IS.SHP.GOOD.TU", category: "infrastructure",
    name: "컨테이너 항만 물동량", shortName: "항만 물동량", unit: "TEU", precision: 0, format: "compactNumber",
    description: "항만에서 처리한 20피트 컨테이너 환산 단위의 연간 수출입·환적 물동량입니다.",
    reading: "제조업 교역과 글로벌 물류 허브 역할, 공급망 활동의 실제 규모를 파악할 수 있습니다.",
    caution: "환적 화물은 국내 생산·소비와 무관할 수 있고 빈 컨테이너 포함 방식도 확인해야 합니다."
  }
].map((indicator) => ({
  ...indicator,
  source: "세계은행 World Development Indicators",
  sourceUrl: `https://data.worldbank.org/indicator/${indicator.code}`
}));
