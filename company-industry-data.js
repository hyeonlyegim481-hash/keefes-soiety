export const companyIndustryCatalog = Object.freeze([
  { id: "semiconductors-electronics", label: "반도체·전자부품", shortLabel: "반도체·전자", plain: "반도체 설계·제조와 전자부품, 카메라·기판·패키징 공급망을 함께 봅니다." },
  { id: "software-platform", label: "플랫폼·소프트웨어", shortLabel: "플랫폼·SW", plain: "검색·커머스·클라우드·기업 소프트웨어처럼 이용자와 데이터를 연결하는 사업입니다." },
  { id: "mobility-battery", label: "자동차·배터리", shortLabel: "차·배터리", plain: "완성차, 전기차, 배터리 셀과 소재를 포함한 이동수단 공급망입니다." },
  { id: "finance-insurance", label: "은행·증권·보험", shortLabel: "금융·보험", plain: "예대마진, 수수료, 자산운용과 보험손익을 통해 수익을 내는 금융업입니다." },
  { id: "telecom", label: "통신·네트워크", shortLabel: "통신", plain: "이동통신 가입자와 유선망, 데이터센터·기업 네트워크를 운영하는 산업입니다." },
  { id: "biotech-health", label: "제약·바이오·헬스", shortLabel: "바이오·헬스", plain: "신약, 바이오의약품 생산, 진단과 의료 서비스를 연구·판매하는 산업입니다." },
  { id: "consumer-retail", label: "유통·화장품·소비재", shortLabel: "유통·소비재", plain: "브랜드, 매장·온라인 채널과 반복 구매를 바탕으로 소비자에게 제품을 판매합니다." },
  { id: "food-beverage", label: "식품·음료", shortLabel: "식품", plain: "가공식품과 음료를 생산하고 국내외 유통망과 브랜드로 판매하는 산업입니다." },
  { id: "media-games", label: "게임·콘텐츠·엔터", shortLabel: "게임·콘텐츠", plain: "게임, 음악, 영상과 지식재산권을 제작해 이용료·광고·공연으로 수익화합니다." },
  { id: "chemicals-materials", label: "화학·철강·소재", shortLabel: "화학·소재", plain: "석유화학, 비철금속, 철강과 산업용 소재를 생산해 제조업 공급망에 판매합니다." },
  { id: "shipbuilding-defense", label: "조선·방산·항공우주", shortLabel: "조선·방산", plain: "선박, 항공기, 무기체계처럼 수주와 장기 제작기간이 중요한 산업입니다." },
  { id: "construction-infra", label: "건설·인프라", shortLabel: "건설·인프라", plain: "주택, 플랜트, 토목과 대형 인프라를 설계·시공하고 운영하는 산업입니다." },
  { id: "logistics-transport", label: "항공·해운·물류", shortLabel: "운송·물류", plain: "여객과 화물을 항공·해운·육상망으로 이동시키고 공급망을 운영합니다." },
  { id: "industrial-automation", label: "산업재·자동화·기계", shortLabel: "산업재·자동화", plain: "공장과 건설·에너지 현장에 장비, 제어기기와 자동화 시스템을 공급합니다." },
  { id: "power-utilities", label: "에너지·전력·유틸리티", shortLabel: "에너지·전력", plain: "전기·가스·정유와 전력기기를 생산·공급해 산업과 생활 인프라를 지탱합니다." },
  { id: "security-it", label: "보안·IT 인프라", shortLabel: "보안·IT", plain: "네트워크, 데이터와 업무 시스템의 안전한 연결과 운영을 지원합니다." },
  { id: "quantum-deeptech", label: "양자·딥테크", shortLabel: "양자·딥테크", plain: "양자컴퓨팅과 고난도 원천기술을 상용 장비·서비스로 전환하는 초기 산업입니다." },
  { id: "climate-water", label: "기후·물·환경", shortLabel: "기후·환경", plain: "물, 냉각, 재활용과 기후 적응 인프라로 자원 효율과 회복력을 높입니다." }
]);

const catalogIds = new Set(companyIndustryCatalog.map((industry) => industry.id));

const futureThemeFallback = Object.freeze({
  "ai-chips": "semiconductors-electronics",
  "ai-platforms": "software-platform",
  "battery-mobility": "mobility-battery",
  "bio-health": "biotech-health",
  automation: "industrial-automation",
  "energy-infra": "power-utilities",
  cybersecurity: "security-it",
  "quantum-computing": "quantum-deeptech",
  "autonomous-logistics": "logistics-transport",
  "climate-resilience": "climate-water"
});

export function getCompanyIndustryId(company = {}) {
  if (catalogIds.has(company.industryId)) return company.industryId;
  return futureThemeFallback[company.sectorId] || "software-platform";
}

export function getCompanyIndustry(company = {}) {
  const industryId = getCompanyIndustryId(company);
  return companyIndustryCatalog.find((industry) => industry.id === industryId) || null;
}
