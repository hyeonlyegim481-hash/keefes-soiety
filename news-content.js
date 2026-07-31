const ARTICLE_TOTAL_TIMEOUT_MS = 6_000;
const articleCache = new Map();

export async function enrichHeadlineWithArticle(headline) {
  const cacheKey = String(headline?.id || headline?.url || headline?.title || "");
  if (cacheKey && articleCache.has(cacheKey)) {
    const cached = articleCache.get(cacheKey);
    if (cached.expiresAt > Date.now()) return cached.result;
    articleCache.delete(cacheKey);
  }

  const base = {
    ...headline,
    articleUrl: String(headline?.url || ""),
    articleContent: "",
    articleSummary: "",
    articleKeyPoints: [],
    articleAuthor: String(headline?.articleAuthor || headline?.author || ""),
    articlePublishedAt: headline?.articlePublishedAt || headline?.publishedAt || null,
    articleModifiedAt: headline?.articleModifiedAt || null,
    contentBasis: "headline",
    contentStatus: "headline-fallback",
    contentFailureCode: "not-fetched",
    contentBasisReason: "언론사 원문 본문을 아직 확인하지 못했습니다."
  };

  try {
    const signal = AbortSignal.timeout(ARTICLE_TOTAL_TIMEOUT_MS);
    const articleUrl = await decodeGoogleNewsUrl(base.articleUrl, signal);
    let fallback = { ...base, articleUrl };
    if (!isSafePublicUrl(articleUrl)) {
      return rememberArticleResult(
        cacheKey,
        withArticleFailure(fallback, "unsafe-url", "안전하게 확인할 수 있는 원문 주소가 없어 제목만 사용했습니다.")
      );
    }

    const response = await fetch(articleUrl, {
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "Mozilla/5.0 (compatible; KeefesSociety/1.0; +https://keefes-society.vercel.app)"
      },
      redirect: "follow",
      signal
    });
    if (!response.ok) {
      return rememberArticleResult(
        cacheKey,
        withArticleFailure(
          fallback,
          `publisher-http-${response.status}`,
          `언론사 원문 서버가 본문 요청을 허용하지 않았습니다. (HTTP ${response.status})`
        )
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return rememberArticleResult(
        cacheKey,
        withArticleFailure(fallback, "unsupported-content-type", "원문이 분석 가능한 웹 문서 형식으로 제공되지 않았습니다.")
      );
    }
    const html = (await response.text()).slice(0, 1_500_000);
    fallback = {
      ...fallback,
      ...extractArticleMetadata(html, {
        fallbackPublishedAt: base.articlePublishedAt,
        fallbackUrl: articleUrl
      })
    };
    const articleContent = extractArticleContent(html);
    if (articleContent.length < 240) {
      return rememberArticleResult(
        cacheKey,
        withArticleFailure(fallback, "content-too-short", "원문에서 분석에 필요한 길이의 본문을 찾지 못했습니다.")
      );
    }
    if (isBlockedArticleContent(articleContent)) {
      return rememberArticleResult(
        cacheKey,
        withArticleFailure(fallback, "access-blocked", "로그인·구독·브라우저 안내 화면만 확인되어 기사 본문을 사용하지 않았습니다.")
      );
    }
    if (!hasArticleEvidence(articleContent, base.title)) {
      return rememberArticleResult(
        cacheKey,
        withArticleFailure(fallback, "evidence-mismatch", "가져온 문서가 선택한 기사와 같은 내용인지 확인할 수 없어 제목만 사용했습니다.")
      );
    }

    const articleDigest = buildArticleDigest(articleContent, base.title);
    if (articleDigest.summary.length < 45 || articleDigest.keyPoints.length < 2) {
      return rememberArticleResult(
        cacheKey,
        withArticleFailure(fallback, "digest-insufficient", "본문은 열렸지만 신뢰할 수 있는 핵심 단서를 충분히 추출하지 못했습니다.")
      );
    }
    return rememberArticleResult(cacheKey, {
      ...fallback,
      articleContent: articleContent.slice(0, 7_000),
      articleSummary: articleDigest.summary,
      articleKeyPoints: articleDigest.keyPoints,
      contentBasis: "article",
      contentStatus: "article",
      contentFailureCode: null,
      contentBasisReason: "언론사 원문 본문을 확인해 요약과 분석에 사용했습니다."
    });
  } catch (error) {
    const timedOut = error?.name === "TimeoutError" || error?.name === "AbortError";
    return rememberArticleResult(
      cacheKey,
      withArticleFailure(
        base,
        timedOut ? "fetch-timeout" : "fetch-failed",
        timedOut
          ? "원문 서버 응답 시간이 초과되어 제목만 사용했습니다."
          : "원문을 불러오는 과정에서 오류가 발생해 제목만 사용했습니다."
      )
    );
  }
}

function withArticleFailure(headline, code, reason) {
  return {
    ...headline,
    articleContent: "",
    articleSummary: "",
    articleKeyPoints: [],
    contentBasis: "headline",
    contentStatus: "headline-fallback",
    contentFailureCode: code,
    contentBasisReason: reason
  };
}

function rememberArticleResult(cacheKey, result) {
  if (!cacheKey) return result;
  if (articleCache.size > 100) articleCache.clear();
  const ttl = result.contentBasis === "article" ? 30 * 60_000 : 45_000;
  articleCache.set(cacheKey, { result, expiresAt: Date.now() + ttl });
  return result;
}

async function decodeGoogleNewsUrl(sourceUrl, signal = AbortSignal.timeout(ARTICLE_TOTAL_TIMEOUT_MS)) {
  const url = new URL(sourceUrl);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const articleIndex = pathParts.findIndex((part) => part === "articles" || part === "read");
  if (url.hostname !== "news.google.com" || articleIndex < 0) return sourceUrl;

  const articleId = pathParts[articleIndex + 1];
  if (!articleId) return sourceUrl;
  const binary = decodeBase64Url(articleId);
  const oldStyleUrl = decodeLegacyArticleUrl(binary);
  if (oldStyleUrl) return oldStyleUrl;

  const articlePage = await fetch(`https://news.google.com/articles/${articleId}`, {
    headers: { "user-agent": "Mozilla/5.0" },
    signal
  });
  if (!articlePage.ok) return sourceUrl;
  const html = await articlePage.text();
  const signature = html.match(/data-n-a-sg="([^"]+)"/)?.[1];
  const timestamp = html.match(/data-n-a-ts="([^"]+)"/)?.[1];
  if (!signature || !timestamp) return sourceUrl;

  const requestPayload = [
    "Fbv4je",
    JSON.stringify([
      "garturlreq",
      [["X", "X", ["X", "X"], null, null, 1, 1, "KR:ko", null, 1, null, null, null, null, null, 0, 1], "X", "X", 1, [1, 1, 1], 1, 1, null, 0, 0, null, 0],
      articleId,
      Number(timestamp),
      signature
    ])
  ];
  const body = new URLSearchParams({ "f.req": JSON.stringify([[[...requestPayload]]]) });
  const decodedResponse = await fetch("https://news.google.com/_/DotsSplashUi/data/batchexecute", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body,
    signal
  });
  if (!decodedResponse.ok) return sourceUrl;
  const responseText = await decodedResponse.text();
  const payloadLine = responseText.split("\n\n").find((line) => line.trim().startsWith("[["));
  if (!payloadLine) return sourceUrl;
  const outer = JSON.parse(payloadLine);
  const inner = JSON.parse(outer[0][2]);
  return typeof inner?.[1] === "string" ? inner[1] : sourceUrl;
}

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64");
}

function decodeLegacyArticleUrl(bytes) {
  let offset = bytes.subarray(0, 3).equals(Buffer.from([0x08, 0x13, 0x22])) ? 3 : 0;
  const firstLength = bytes[offset];
  if (!Number.isFinite(firstLength)) return "";
  const lengthBytes = firstLength >= 0x80 ? 2 : 1;
  const length = firstLength >= 0x80
    ? (firstLength & 0x7f) | ((bytes[offset + 1] & 0x7f) << 7)
    : firstLength;
  offset += lengthBytes;
  const decoded = bytes.subarray(offset, offset + length).toString("utf8");
  return /^https?:\/\//i.test(decoded) ? decoded : "";
}

function extractArticleContent(html) {
  const jsonBody = html.match(/"articleBody"\s*:\s*"((?:\\.|[^"\\])*)"/i)?.[1];
  const jsonText = stripBoilerplatePhrases(cleanPlainText(jsonBody ? decodeJsonString(jsonBody) : ""));
  const metaDescription = stripBoilerplatePhrases(readMetaDescription(html));
  const paragraphTexts = [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => stripBoilerplatePhrases(cleanHtmlText(match[1])))
    .filter((text) => text.length >= 45 && !isBoilerplate(text));
  const uniqueParagraphs = [...new Set(paragraphTexts)].slice(0, 30);
  const paragraphContent = uniqueParagraphs.join(" ");

  if (jsonText.length >= 240 && !isBoilerplate(jsonText)) {
    return jsonText.slice(0, 12_000);
  }
  if (paragraphContent.length >= 240) {
    return paragraphContent.slice(0, 12_000);
  }
  return [metaDescription, ...uniqueParagraphs]
    .filter((text, index, list) => text && !isBoilerplate(text) && list.indexOf(text) === index)
    .join(" ")
    .slice(0, 12_000);
}

function readMetaDescription(html) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const key = readAttribute(tag, "property") || readAttribute(tag, "name");
    if (!["og:description", "description", "twitter:description"].includes(key.toLowerCase())) continue;
    const content = readAttribute(tag, "content");
    if (content) return cleanPlainText(content);
  }
  return "";
}

function readAttribute(tag, name) {
  const match = tag.match(new RegExp(`${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, "i"));
  return match?.[2] || "";
}

function extractArticleMetadata(
  html,
  { fallbackPublishedAt = "", fallbackUrl = "" } = {}
) {
  const jsonObjects = readJsonLdObjects(html);
  const articleObject =
    jsonObjects.find((item) => {
      const types = Array.isArray(item?.["@type"])
        ? item["@type"]
        : [item?.["@type"]];
      return types.some((type) =>
        /^(?:NewsArticle|Article|ReportageNewsArticle|AnalysisNewsArticle)$/i.test(
          String(type || "")
        )
      );
    }) ||
    jsonObjects.find(
      (item) => item?.datePublished || item?.author || item?.headline
    ) ||
    {};

  const author =
    readMetaValue(html, ["author", "article:author", "byl"]) ||
    readAuthorName(articleObject.author);
  const publishedAt = normalizeArticleDate(
    readMetaValue(html, [
      "article:published_time",
      "datepublished",
      "date",
      "pubdate"
    ]) ||
      articleObject.datePublished ||
      fallbackPublishedAt
  );
  const modifiedAt = normalizeArticleDate(
    readMetaValue(html, [
      "article:modified_time",
      "datemodified",
      "lastmod"
    ]) || articleObject.dateModified
  );
  const canonicalUrl =
    readCanonicalUrl(html) ||
    readMetaValue(html, ["og:url"]) ||
    String(articleObject.url || fallbackUrl || "");

  return {
    articleAuthor: cleanPlainText(author).slice(0, 120),
    articlePublishedAt: publishedAt || null,
    articleModifiedAt: modifiedAt || null,
    articleUrl: isSafePublicUrl(canonicalUrl) ? canonicalUrl : fallbackUrl
  };
}

function readMetaValue(html, keys) {
  const wanted = new Set(keys.map((key) => key.toLowerCase()));
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const key =
      readAttribute(tag, "property") ||
      readAttribute(tag, "name") ||
      readAttribute(tag, "itemprop");
    if (!wanted.has(String(key || "").toLowerCase())) continue;
    const content = readAttribute(tag, "content");
    if (content) return cleanPlainText(content);
  }
  return "";
}

function readCanonicalUrl(html) {
  const tags = html.match(/<link\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const rel = readAttribute(tag, "rel").toLowerCase();
    if (!rel.split(/\s+/).includes("canonical")) continue;
    const href = readAttribute(tag, "href");
    if (href) return href;
  }
  return "";
}

function readJsonLdObjects(html) {
  const blocks = [
    ...html.matchAll(
      /<script\b[^>]*type\s*=\s*(["'])application\/ld\+json\1[^>]*>([\s\S]*?)<\/script>/gi
    )
  ];
  const objects = [];
  for (const block of blocks) {
    try {
      const value = JSON.parse(decodeHtmlEntities(block[2]).trim());
      collectJsonLdObjects(value, objects);
    } catch {
      // Invalid publisher metadata is ignored instead of guessed.
    }
  }
  return objects;
}

function collectJsonLdObjects(value, output) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectJsonLdObjects(item, output));
    return;
  }
  if (!value || typeof value !== "object") return;
  output.push(value);
  if (Array.isArray(value["@graph"])) {
    value["@graph"].forEach((item) => collectJsonLdObjects(item, output));
  }
}

function readAuthorName(author) {
  const authors = Array.isArray(author) ? author : [author];
  return authors
    .map((item) =>
      typeof item === "string"
        ? item
        : String(item?.name || item?.alternateName || "")
    )
    .map((item) => cleanPlainText(item))
    .filter(Boolean)
    .join(", ");
}

function normalizeArticleDate(value) {
  const timestamp = Date.parse(String(value || ""));
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : "";
}
const articleKeywordStopWords = new Set([
  "관련", "대한", "통해", "위해", "오늘", "이번", "종합", "속보", "단독", "전망", "한국", "경제", "시장", "뉴스"
]);

function hasArticleEvidence(content, title) {
  const text = cleanPlainText(content);
  const sentences = rankSentences(text, title);
  if (text.length < 240 || sentences.length < 2) return false;

  const titleKeywords = cleanPlainText(title)
    .split(/[^0-9A-Za-z가-힣]+/)
    .filter((word) => word.length >= 2 && !articleKeywordStopWords.has(word))
    .slice(0, 12);
  if (titleKeywords.length === 0) return text.length >= 500 && sentences.length >= 3;
  return titleKeywords.some((word) => text.includes(word));
}

function stripBoilerplatePhrases(value) {
  return cleanPlainText(value)
    .replace(/\(예시\)\s*다음뉴스는\s*국내외 주요이슈와\s*실시간 속보,?\s*문화생활 및 다양한 분야의 뉴스를\s*입체적으로 전달하고 있습니다\.?/gi, " ")
    .replace(/가장 빠른 뉴스가 있고\s*다양한 정보,?\s*쌍방향 소통이 숨쉬는\s*다음뉴스를 만나보세요\.?/gi, " ")
    .replace(/다양한 정보와?\s*쌍방향 소통이 숨쉬는\s*다음뉴스(?:를 만나보세요)?\.?/gi, " ")
    .replace(/다음뉴스를 만나보세요\.?/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildExtractiveSummary(content, title, limit) {
  return rankSentences(content, title)
    .slice(0, limit)
    .join(" ")
    .slice(0, 900);
}

function buildArticleDigest(content, title) {
  const sentences = rankSentences(content, title);
  return {
    summary: sentences.slice(0, 3).join(" ").slice(0, 900),
    keyPoints: sentences.slice(0, 5).map((sentence) => sentence.slice(0, 300))
  };
}

function rankSentences(content, title) {
  const keywords = cleanPlainText(title)
    .split(/[^0-9A-Za-z가-힣]+/)
    .filter((word) => word.length >= 2)
    .slice(0, 12);
  const seenSentences = [];
  return cleanPlainText(content)
    .split(/(?<=[.!?。]|다\.)\s+/)
    .map((sentence, index) => {
      const cleanSentence = sentence.trim();
      const titleScore = keywords.reduce(
        (score, word) => score + (cleanSentence.includes(word) ? 3 : 0),
        0
      );
      const numberScore = Math.min(3, (cleanSentence.match(/\d+(?:[.,]\d+)?(?:%|원|달러|조원|억|만|배|명)?/g) || []).length);
      const economyScore = /금리|물가|환율|수출|매출|이익|고용|투자|주가|채권|달러|유가|정부|중앙은행|기업|시장/i.test(cleanSentence) ? 2 : 0;
      const readableLengthScore = cleanSentence.length >= 55 && cleanSentence.length <= 240 ? 1 : 0;
      return {
        sentence: cleanSentence,
        index,
        score: titleScore + numberScore + economyScore + readableLengthScore + (index < 5 ? 2 : 0)
      };
    })
    .filter(({ sentence }) => sentence.length >= 35 && sentence.length <= 420 && !isBoilerplate(sentence))
    .filter(({ sentence }) => {
      const fingerprint = sentence.toLowerCase().replace(/[^0-9a-z가-힣]+/g, "");
      const duplicate = seenSentences.some(
        (seen) => fingerprint === seen || (Math.min(fingerprint.length, seen.length) >= 35 && (fingerprint.includes(seen) || seen.includes(fingerprint)))
      );
      if (!duplicate) seenSentences.push(fingerprint);
      return !duplicate;
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 8)
    .sort((a, b) => a.index - b.index)
    .map(({ sentence }) => sentence);
}

function cleanHtmlText(value) {
  return decodeHtmlEntities(
    String(value || "")
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );
}

function cleanPlainText(value) {
  return decodeHtmlEntities(String(value || ""))
    .replace(/\\n|\\r|\\t/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeJsonString(value) {
  try {
    return JSON.parse(`"${value}"`);
  } catch {
    return value.replace(/\\"/g, '"').replace(/\\n/g, " ");
  }
}

function decodeHtmlEntities(value) {
  const named = {
    amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
    lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”", middot: "·",
    ndash: "–", mdash: "—", hellip: "…", laquo: "«", raquo: "»"
  };
  return String(value || "")
    .replace(/&([a-z]+);/gi, (match, name) => named[name.toLowerCase()] ?? match)
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function isBlockedArticleContent(value) {
  const text = cleanPlainText(value);
  if (!text) return true;

  const compatibilityWarning =
    /잠깐!?\s*현재\s*Internet Explorer\s*8\s*이하|Internet Explorer\s*(?:[0-8](?:\.0)?|이하)|익스플로러\s*8\s*이하|지원(?:하지|되지)\s*않는\s*브라우저|브라우저(?:를|의)?\s*(?:업데이트|업그레이드)|최신\s*브라우저(?:를)?\s*(?:사용|설치)|자바스크립트(?:를)?\s*활성화/i;
  if (compatibilityWarning.test(text)) return true;

  const blockedRequest =
    /Access Denied|Request (?:blocked|denied)|403 Forbidden|captcha|로봇이 아닙니다|비정상적인 접근|자동화된 접근|접근이 차단/i;
  return text.length < 2_000 && blockedRequest.test(text);
}

function isBoilerplate(text) {
  return /무단전재|재배포 금지|저작권|구독|로그인|회원가입|쿠키|개인정보|광고|기자\s*[=@]|copyright|가장 빠른 뉴스|쌍방향 소통이 숨쉬는|다음뉴스를 만나보세요|다음뉴스는 국내외 주요이슈|뉴스를 입체적으로 전달|문화생활 및 다양한 분야의 뉴스|언론사별 뉴스|많이 본 뉴스|뉴스홈|뉴스 전체 메뉴|Internet Explorer|익스플로러|지원(?:하지|되지)\s*않는\s*브라우저|브라우저(?:를|의)?\s*(?:업데이트|업그레이드)|자바스크립트(?:를)?\s*활성화|Access Denied|Request (?:blocked|denied)|403 Forbidden|captcha|로봇이 아닙니다|비정상적인 접근|자동화된 접근|접근이 차단/i.test(text);
}

function isSafePublicUrl(value) {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return false;
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return false;
    if (/^(127\.|10\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)) return false;
    if (host === "::1" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80:")) return false;
    return true;
  } catch {
    return false;
  }
}

export { buildArticleDigest, buildExtractiveSummary, decodeGoogleNewsUrl, extractArticleContent, extractArticleMetadata, hasArticleEvidence, isBlockedArticleContent };
