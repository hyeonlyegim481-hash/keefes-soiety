const ARTICLE_TIMEOUT_MS = 4_000;
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
    contentBasis: "headline"
  };

  try {
    const articleUrl = await decodeGoogleNewsUrl(base.articleUrl);
    const fallback = { ...base, articleUrl };
    if (!isSafePublicUrl(articleUrl)) return rememberArticleResult(cacheKey, fallback);

    const response = await fetch(articleUrl, {
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "Mozilla/5.0 (compatible; KeefesSoiety/1.0; +https://keefes-soiety.vercel.app)"
      },
      redirect: "follow",
      signal: AbortSignal.timeout(ARTICLE_TIMEOUT_MS)
    });
    if (!response.ok) return rememberArticleResult(cacheKey, fallback);

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return rememberArticleResult(cacheKey, fallback);
    const html = (await response.text()).slice(0, 1_500_000);
    const articleContent = extractArticleContent(html);
    if (
      articleContent.length < 240 ||
      isBlockedArticleContent(articleContent) ||
      !hasArticleEvidence(articleContent, base.title)
    ) {
      return rememberArticleResult(cacheKey, fallback);
    }

    const articleSummary = buildExtractiveSummary(articleContent, base.title, 3);
    const articleKeyPoints = buildKeyPoints(articleContent, base.title, 3);
    if (articleSummary.length < 80 || articleKeyPoints.length < 2) {
      return rememberArticleResult(cacheKey, fallback);
    }
    return rememberArticleResult(cacheKey, {
      ...base,
      articleUrl,
      articleContent: articleContent.slice(0, 7_000),
      articleSummary,
      articleKeyPoints,
      contentBasis: "article"
    });
  } catch {
    return rememberArticleResult(cacheKey, base);
  }
}

function rememberArticleResult(cacheKey, result) {
  if (!cacheKey) return result;
  if (articleCache.size > 100) articleCache.clear();
  const ttl = result.contentBasis === "article" ? 30 * 60_000 : 45_000;
  articleCache.set(cacheKey, { result, expiresAt: Date.now() + ttl });
  return result;
}

async function decodeGoogleNewsUrl(sourceUrl) {
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
    signal: AbortSignal.timeout(ARTICLE_TIMEOUT_MS)
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
    signal: AbortSignal.timeout(ARTICLE_TIMEOUT_MS)
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
  const jsonText = stripBoilerplatePhrases(jsonBody ? decodeJsonString(jsonBody) : "");
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

function buildKeyPoints(content, title, limit) {
  return rankSentences(content, title)
    .slice(0, limit)
    .map((sentence) => sentence.slice(0, 240));
}

function rankSentences(content, title) {
  const keywords = cleanPlainText(title)
    .split(/[^0-9A-Za-z가-힣]+/)
    .filter((word) => word.length >= 2)
    .slice(0, 12);
  const seenSentences = [];
  return cleanPlainText(content)
    .split(/(?<=[.!?。]|다\.)\s+/)
    .map((sentence, index) => ({
      sentence: sentence.trim(),
      index,
      score: keywords.reduce((score, word) => score + (sentence.includes(word) ? 2 : 0), 0) + (index < 5 ? 2 : 0)
    }))
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
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
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

export { buildExtractiveSummary, decodeGoogleNewsUrl, extractArticleContent, hasArticleEvidence, isBlockedArticleContent };
