import {
  PROFILE_AVATARS,
  PROFILE_MARKETS,
  calculateProfileStreak,
  getProfileAvatar,
  getNextProfileStreakStage,
  getProfileStreakStage,
  getProfileTierProgress,
  isValidProfileNickname,
  mergeProfileProgressResult,
  normalizeProfileNickname
} from "./profile-data.js";
import { importVersioned } from "./runtime-loader.js";

const SUPABASE_BROWSER_URL =
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.110.9/dist/umd/supabase.min.js";
const DEFAULT_PREFERENCES = Object.freeze({
  fontScale: 105,
  highContrast: true,
  desktopLayout: false
});

let supabaseScriptPromise = null;

function loadSupabaseBrowser() {
  if (globalThis.supabase?.createClient) return Promise.resolve(globalThis.supabase);
  if (supabaseScriptPromise) return supabaseScriptPromise;
  supabaseScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SUPABASE_BROWSER_URL;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.addEventListener("load", () => {
      if (globalThis.supabase?.createClient) resolve(globalThis.supabase);
      else reject(new Error("Supabase browser client was not exposed"));
    }, { once: true });
    script.addEventListener("error", () => {
      script.remove();
      supabaseScriptPromise = null;
      reject(new Error("Supabase browser client failed to load"));
    }, { once: true });
    document.head.append(script);
  });
  return supabaseScriptPromise;
}

function preferencesFromRow(row = {}) {
  return {
    fontScale: Number(row.font_scale) || DEFAULT_PREFERENCES.fontScale,
    highContrast: row.high_contrast !== false,
    desktopLayout: row.desktop_layout === true
  };
}

function preferencesToRow(settings = {}) {
  return {
    font_scale: Number(settings.fontScale) || DEFAULT_PREFERENCES.fontScale,
    high_contrast: settings.highContrast !== false,
    desktop_layout: settings.desktopLayout === true
  };
}

function preferencesMatch(left, right) {
  return left.fontScale === right.fontScale
    && left.highContrast === right.highContrast
    && left.desktopLayout === right.desktopLayout;
}

function setMessage(element, message = "", tone = "muted") {
  if (!element) return;
  element.textContent = message;
  element.dataset.tone = tone;
  element.hidden = !message;
}

function setButtonBusy(button, busy, busyLabel) {
  if (!button) return;
  const label = button.querySelector("[data-button-label]");
  const currentLabel = label?.textContent?.trim() || button.textContent.trim();
  if (!button.dataset.defaultLabel) button.dataset.defaultLabel = currentLabel;
  button.disabled = Boolean(busy);
  if (label) {
    label.textContent = busy ? busyLabel : button.dataset.defaultLabel;
  } else {
    button.textContent = busy ? busyLabel : button.dataset.defaultLabel;
  }
}

function createChip(row, label, onRemove) {
  const chip = document.createElement("span");
  chip.className = "profile-watch-chip";
  const text = document.createElement("span");
  text.textContent = label;
  const remove = document.createElement("button");
  remove.type = "button";
  remove.setAttribute("aria-label", `${label} 관심목록에서 제거`);
  remove.title = "제거";
  remove.textContent = "×";
  remove.addEventListener("click", () => onRemove(row));
  chip.append(text, remove);
  return chip;
}

function createEmptyDashboardState(status = "idle") {
  return {
    status,
    storageReady: null,
    dailyActivity: [],
    quizAttempts: [],
    learningHistory: [],
    savedArticles: [],
    error: null
  };
}

function isMissingDashboardStorageError(error) {
  const code = String(error?.code || "");
  const message = String(error?.message || "");
  return code === "42P01"
    || code === "PGRST205"
    || (
      /learning_history|saved_articles/i.test(message)
      && /not find|does not exist|schema cache/i.test(message)
    );
}

function compactArticleAnalysis(result = null) {
  if (!result || typeof result !== "object") return {};
  const text = (value, limit = 1400) => String(value || "").slice(0, limit);
  const list = (value, limit = 5) => Array.isArray(value)
    ? value.slice(0, limit).map((item) => text(item, 500))
    : [];
  return {
    signal: text(result.signal, 80),
    tone: text(result.tone, 40),
    confidence: text(result.confidence, 60),
    engineLabel: text(result.engineLabel, 120),
    contentBasis: text(result.contentBasis, 40),
    contentStatus: text(result.contentStatus, 40),
    contentBasisReason: text(result.contentBasisReason, 500),
    summary: text(result.summary, 3000),
    keyPoints: list(result.keyPoints, 5),
    transmissionPath: list(result.transmissionPath, 4),
    checkpoints: list(result.checkpoints, 3),
    counterSignals: list(result.counterSignals, 2),
    whyItMatters: text(result.whyItMatters),
    marketImpact: text(result.marketImpact),
    koreaImpact: text(result.koreaImpact),
    limitation: text(result.limitation)
  };
}

export async function createProfileController({
  getReaderSettings = () => ({ ...DEFAULT_PREFERENCES }),
  applyReaderSettings = () => {}
} = {}) {
  const elements = {
    panel: document.querySelector("#profilePanel"),
    authStatus: document.querySelector("#profileAuthStatus"),
    loggedOut: document.querySelector("#profileLoggedOut"),
    loggedIn: document.querySelector("#profileLoggedIn"),
    loginButton: document.querySelector("#profileLoginButton"),
    logoutButton: document.querySelector("#profileLogoutButton"),
    editButton: document.querySelector("#profileEditButton"),
    avatar: document.querySelector("#profileAvatarDisplay"),
    nickname: document.querySelector("#profileNicknameDisplay"),
    tier: document.querySelector("#profileTierBadge"),
    tierImage: document.querySelector("#profileTierImage"),
    xpText: document.querySelector("#profileXpText"),
    xpBar: document.querySelector("#profileXpBar"),
    nextTier: document.querySelector("#profileNextTier"),
    mainGlance: document.querySelector("#profileGlance"),
    mainTier: document.querySelector("#mainProfileTier"),
    mainTierImage: document.querySelector("#mainProfileTierImage"),
    mainStreak: document.querySelector("#mainProfileStreak"),
    mainStreakImage: document.querySelector("#mainProfileStreakImage"),
    streakSummary: document.querySelector("#profileStreakSummary"),
    streakVisual: document.querySelector("#profileStreakVisual"),
    streakImage: document.querySelector("#profileStreakImage"),
    streakStageLabel: document.querySelector("#profileStreakStageLabel"),
    streakNext: document.querySelector("#profileStreakNext"),
    currentStreak: document.querySelector("#profileCurrentStreak"),
    longestStreak: document.querySelector("#profileLongestStreak"),
    activeDays: document.querySelector("#profileActiveDays"),
    message: document.querySelector("#profileMessage"),
    dialog: document.querySelector("#profileDialog"),
    dialogClose: document.querySelector("#profileDialogClose"),
    form: document.querySelector("#profileForm"),
    nicknameInput: document.querySelector("#profileNicknameInput"),
    avatarOptions: document.querySelector("#profileAvatarOptions"),
    marketSelect: document.querySelector("#profileMarketSelect"),
    marketAdd: document.querySelector("#profileMarketAdd"),
    marketList: document.querySelector("#profileMarketList"),
    companyInput: document.querySelector("#profileCompanyInput"),
    companyOptions: document.querySelector("#profileCompanyOptions"),
    companyAdd: document.querySelector("#profileCompanyAdd"),
    companyList: document.querySelector("#profileCompanyList"),
    indicatorSelect: document.querySelector("#profileIndicatorSelect"),
    indicatorAdd: document.querySelector("#profileIndicatorAdd"),
    indicatorList: document.querySelector("#profileIndicatorList"),
    formMessage: document.querySelector("#profileFormMessage"),
    saveButton: document.querySelector("#profileSaveButton")
  };

  if (!elements.panel) return createNoopController();

  const state = {
    client: null,
    session: null,
    profile: null,
    progress: null,
    preferences: null,
    watchlists: [],
    draftWatchlists: [],
    companies: [],
    indicators: [],
    companyByInput: new Map(),
    selectedAvatar: "chart-green",
    dashboard: createEmptyDashboardState(),
    dashboardLoadPromise: null,
    dashboardLoadRequest: 0,
    loadRequest: 0,
    preferenceTimer: 0,
    activityRecorded: false
  };

  const dashboardListeners = new Set();

  renderLoading();

  let config;
  try {
    const response = await fetch("/api/profile-config", {
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000)
    });
    config = await response.json();
    if (!response.ok || !config?.configured) {
      throw new Error("프로필 연결 환경이 준비되지 않았습니다.");
    }
    const browser = await loadSupabaseBrowser();
    state.client = browser.createClient(config.supabaseUrl, config.publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } catch (error) {
    console.error("[profile] initialization failed", error);
    renderUnavailable(error.message);
    return createNoopController();
  }

  bindEvents();
  state.client.auth.onAuthStateChange((_event, session) => {
    queueMicrotask(() => {
      void setSession(session).catch((error) => {
        console.error("[profile] session update failed", error);
        setMessage(elements.message, "프로필을 불러오지 못했습니다. 잠시 후 다시 열어 주세요.", "error");
      });
    });
  });
  const { data, error } = await state.client.auth.getSession();
  if (error) console.error("[profile] getSession failed", error);
  await setSession(data?.session || null);

  return {
    openProfile,
    startSignIn,
    queuePreferenceSync,
    recordQuizAnswer,
    requestFreshSnapshot,
    loadDashboardData,
    getDashboardState,
    subscribeDashboard,
    recordGlossaryView,
    toggleSavedArticle,
    removeSavedArticle,
    isArticleSaved,
    getArticleKey,
    isAuthenticated: () => Boolean(state.session?.user)
  };

  function bindEvents() {
    [elements.tierImage, elements.mainTierImage].forEach((image) => {
      image?.addEventListener("load", () => {
        image.hidden = false;
      });
      image?.addEventListener("error", () => {
        image.hidden = true;
        console.error("[profile] tier artwork failed", image.getAttribute("src"));
      });
    });
    elements.loginButton?.addEventListener("click", () => {
      void startSignIn();
    });
    elements.logoutButton?.addEventListener("click", async () => {
      setButtonBusy(elements.logoutButton, true, "로그아웃 중...");
      const { error: signOutError } = await state.client.auth.signOut();
      if (signOutError) setMessage(elements.message, "로그아웃하지 못했습니다.", "error");
      setButtonBusy(elements.logoutButton, false);
    });
    elements.editButton?.addEventListener("click", openProfile);
    elements.dialogClose?.addEventListener("click", closeProfile);
    elements.dialog?.addEventListener("click", (event) => {
      if (event.target === elements.dialog) closeProfile();
    });
    elements.form?.addEventListener("submit", saveProfile);
    elements.marketAdd?.addEventListener("click", addSelectedMarket);
    elements.companyAdd?.addEventListener("click", addSelectedCompany);
    elements.indicatorAdd?.addEventListener("click", addSelectedIndicator);
  }

  async function startSignIn() {
    if (!state.client) return false;
    setButtonBusy(elements.loginButton, true, "Google 연결 중...");
    setMessage(elements.message);
    const { error: signInError } = await state.client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/?chapter=dashboard` }
    });
    if (signInError) {
      console.error("[profile] OAuth start failed", signInError);
      setMessage(elements.message, "Google 로그인을 시작하지 못했습니다.", "error");
      setButtonBusy(elements.loginButton, false);
      return false;
    }
    return true;
  }

  async function setSession(session) {
    const requestId = ++state.loadRequest;
    state.session = session;
    state.activityRecorded = false;
    if (!session?.user) {
      state.profile = null;
      state.progress = null;
      state.watchlists = [];
      state.dashboardLoadRequest += 1;
      state.dashboardLoadPromise = null;
      state.dashboard = createEmptyDashboardState();
      renderSignedOut();
      emitDashboardChange();
      return;
    }
    renderLoading("프로필 불러오는 중");
    try {
      await loadProfile(requestId);
    } catch (error) {
      if (requestId !== state.loadRequest) return;
      console.error("[profile] load failed", error);
      renderUnavailable("프로필을 불러오지 못했습니다.");
      setMessage(
        elements.message,
        "로그인 정보는 유지되지만 프로필 데이터 연결에 실패했습니다. 새로고침하면 다시 확인합니다.",
        "error"
      );
    }
  }

  async function loadProfile(requestId = state.loadRequest) {
    const userId = state.session?.user?.id;
    if (!userId) return;
    const [
      profileResult,
      progressResult,
      preferencesResult,
      watchlistResult,
      activityResult
    ] = await Promise.all([
      state.client.from("profiles").select("user_id,nickname,avatar_key,updated_at").eq("user_id", userId).single(),
      state.client.from("profile_progress").select("xp,quiz_correct_count,active_days,last_active_on,updated_at").eq("user_id", userId).single(),
      state.client.from("profile_preferences").select("font_scale,high_contrast,desktop_layout,updated_at").eq("user_id", userId).single(),
      state.client.from("watchlists").select("id,item_type,target_id,created_at").eq("user_id", userId).order("created_at"),
      state.client.from("daily_activity").select("activity_date").eq("user_id", userId)
        .order("activity_date", { ascending: false }).limit(1000)
    ]);
    if (requestId !== state.loadRequest) return;
    const firstError = [
      profileResult.error,
      progressResult.error,
      preferencesResult.error,
      watchlistResult.error
    ].find(Boolean);
    if (firstError) throw firstError;
    state.profile = profileResult.data;
    state.progress = progressResult.data;
    state.preferences = preferencesResult.data;
    state.watchlists = watchlistResult.data || [];
    emitDashboardChange();
    if (activityResult.error) {
      console.error("[profile] initial streak lookup failed", activityResult.error);
    } else {
      applyActivityRows(activityResult.data);
    }
    state.selectedAvatar = state.profile.avatar_key;
    const preferenceWarning = await reconcilePreferences();
    renderSignedIn();
    if (preferenceWarning) {
      setMessage(elements.message, preferenceWarning, "error");
    }
    void loadDashboardData({ force: true });
    if (!state.activityRecorded) {
      state.activityRecorded = true;
      void recordDailyActivity();
    }
  }

  async function reconcilePreferences() {
    const cloud = preferencesFromRow(state.preferences);
    const local = getReaderSettings();
    const cloudIsDefault = preferencesMatch(cloud, DEFAULT_PREFERENCES);
    if (cloudIsDefault && !preferencesMatch(local, DEFAULT_PREFERENCES)) {
      try {
        await savePreferences(local);
        return "";
      } catch (error) {
        console.error("[profile] initial preference sync failed", error);
        applyReaderSettings(local);
        return "읽기 설정은 현재 기기에 적용됐지만 계정에는 동기화하지 못했습니다.";
      }
    }
    applyReaderSettings(cloud);
    return "";
  }

  function renderLoading(label = "로그인 상태 확인 중") {
    if (elements.mainGlance) elements.mainGlance.hidden = true;
    elements.authStatus.textContent = label;
    elements.authStatus.hidden = false;
    elements.loggedOut.hidden = true;
    elements.loggedIn.hidden = true;
    setMessage(elements.message);
  }

  function renderUnavailable(message) {
    if (elements.mainGlance) elements.mainGlance.hidden = true;
    elements.authStatus.textContent = message || "프로필 연결을 사용할 수 없습니다.";
    elements.authStatus.hidden = false;
    elements.loggedOut.hidden = true;
    elements.loggedIn.hidden = true;
    setMessage(elements.message, "경제 정보와 설정은 로그인 없이 계속 이용할 수 있습니다.", "muted");
  }

  function renderSignedOut() {
    if (elements.mainGlance) elements.mainGlance.hidden = true;
    elements.authStatus.hidden = true;
    elements.loggedOut.hidden = false;
    elements.loggedIn.hidden = true;
    setButtonBusy(elements.loginButton, false);
    setMessage(elements.message, "로그인하면 퀴즈 XP와 설정이 기기 간 동기화됩니다.", "muted");
  }

  function renderSignedIn() {
    elements.authStatus.hidden = true;
    elements.loggedOut.hidden = true;
    elements.loggedIn.hidden = false;
    setMessage(elements.message);
    const avatar = getProfileAvatar(state.profile?.avatar_key);
    elements.avatar.textContent = avatar.symbol;
    elements.avatar.dataset.tone = avatar.tone;
    elements.avatar.setAttribute("aria-label", avatar.label);
    elements.nickname.textContent = state.profile?.nickname || "사용자";
    if (elements.mainGlance) {
      elements.mainGlance.hidden = false;
      elements.mainGlance.dataset.avatarKey = avatar.id;
    }
    renderProgress();
  }

  function renderProgress() {
    const xp = Math.max(0, Number(state.progress?.xp) || 0);
    const tierProgress = getProfileTierProgress(xp);
    elements.tier.textContent = tierProgress.current.label;
    elements.tier.style.setProperty("--tier-color", tierProgress.current.color);
    if (elements.mainTier) elements.mainTier.textContent = tierProgress.current.label;
    [elements.tierImage, elements.mainTierImage].forEach((image) => {
      if (!image) return;
      image.style.setProperty("--tier-color", tierProgress.current.color);
      if (image.getAttribute("src") !== tierProgress.current.image) {
        image.hidden = true;
        image.src = tierProgress.current.image;
      } else if (image.complete && image.naturalWidth > 0) {
        image.hidden = false;
      }
    });
    if (elements.mainGlance) {
      elements.mainGlance.style.setProperty("--tier-color", tierProgress.current.color);
    }
    elements.xpText.textContent = `${xp.toLocaleString("ko-KR")} XP`;
    elements.xpBar.style.width = `${tierProgress.percent.toFixed(1)}%`;
    elements.nextTier.textContent = tierProgress.next
      ? `${tierProgress.next.label}까지 ${tierProgress.remaining.toLocaleString("ko-KR")} XP`
      : "최고 티어 달성";
    const hasStreak = state.progress?.streak_available === true;
    const currentStreak = Math.max(0, Number(state.progress?.current_streak) || 0);
    const longestStreak = Math.max(0, Number(state.progress?.longest_streak) || 0);
    const activeDays = Math.max(0, Number(state.progress?.active_days) || 0);
    if (elements.currentStreak) {
      elements.currentStreak.textContent = hasStreak ? `${currentStreak}일` : "확인 중";
    }
    if (elements.longestStreak) {
      elements.longestStreak.textContent = hasStreak ? `${longestStreak}일` : "확인 중";
    }
    if (elements.activeDays) elements.activeDays.textContent = `${activeDays}일`;
    if (elements.mainStreak) {
      elements.mainStreak.textContent = hasStreak ? `${currentStreak}일` : "확인 중";
    }
    const streakStage = hasStreak ? getProfileStreakStage(currentStreak) : null;
    renderStreakVisual(streakStage, currentStreak);
    if (elements.streakSummary) {
      elements.streakSummary.dataset.streakLevel = streakStage
        ? String(streakStage.stage)
        : "0";
      elements.streakSummary.style.setProperty(
        "--streak-accent",
        streakStage?.accent || "#66757e"
      );
    }
    if (elements.mainGlance) {
      elements.mainGlance.dataset.tier = tierProgress.current.id;
      elements.mainGlance.dataset.streakLevel = streakStage
        ? String(streakStage.stage)
        : "0";
      elements.mainGlance.style.setProperty(
        "--streak-accent",
        streakStage?.accent || "#66757e"
      );
    }
  }

  function renderStreakVisual(stage, currentStreak = 0) {
    const showStage = Boolean(stage);
    [elements.streakImage, elements.mainStreakImage].forEach((image) => {
      if (!image) return;
      image.hidden = !showStage;
      if (showStage && image.getAttribute("src") !== stage.image) {
        image.src = stage.image;
      }
    });
    if (elements.streakVisual) {
      elements.streakVisual.hidden = !showStage;
      elements.streakVisual.style.setProperty(
        "--streak-accent",
        stage?.accent || "#66757e"
      );
    }
    if (!showStage) return;
    if (elements.streakStageLabel) {
      elements.streakStageLabel.textContent = `${stage.label} 그래프`;
    }
    const nextStage = getNextProfileStreakStage(currentStreak);
    if (elements.streakNext) {
      elements.streakNext.textContent = nextStage
        ? `다음 이미지까지 ${nextStage.minDays - currentStreak}일`
        : "1,000일 최고 단계 달성";
    }
  }

  function renderStreakFailure() {
    if (elements.currentStreak) elements.currentStreak.textContent = "확인 실패";
    if (elements.longestStreak) elements.longestStreak.textContent = "확인 실패";
    if (elements.mainStreak) elements.mainStreak.textContent = "확인 실패";
    if (elements.streakSummary) elements.streakSummary.dataset.streakLevel = "0";
    if (elements.mainGlance) elements.mainGlance.dataset.streakLevel = "0";
    renderStreakVisual(null);
    setMessage(
      elements.message,
      "연속 접속 기록을 확인하지 못했습니다. 새로고침하면 다시 확인합니다.",
      "error"
    );
  }

  async function recordDailyActivity() {
    const result = await authenticatedPost("/api/profile-activity", {});
    if (!result) {
      try {
        await refreshActivityStreak();
        setMessage(
          elements.message,
          "기존 연속 기록을 표시합니다. 오늘 기록 저장은 잠시 후 다시 시도해 주세요.",
          "error"
        );
      } catch (error) {
        console.error("[profile] streak recovery failed", error);
        renderStreakFailure();
      }
      return;
    }
    applyProgressResult(result);
    if (result.streakAvailable !== true) {
      try {
        await refreshActivityStreak();
      } catch (error) {
        console.error("[profile] streak refresh failed", error);
        renderStreakFailure();
        return;
      }
    }
    void loadDashboardData({ force: true });
    if (result.xpAwarded > 0) {
      const currentStreak = Math.max(0, Number(state.progress?.current_streak) || 0);
      const streakText = currentStreak > 0
        ? ` · ${currentStreak}일 연속`
        : "";
      setMessage(
        elements.message,
        `오늘 첫 방문 +${result.xpAwarded} XP${streakText}`,
        "success"
      );
    }
  }

  function getDashboardState() {
    return {
      available: Boolean(state.client),
      authenticated: Boolean(state.session?.user),
      profile: state.profile ? { ...state.profile } : null,
      progress: state.progress ? { ...state.progress } : null,
      watchlists: state.watchlists.map((row) => ({ ...row })),
      dashboard: {
        ...state.dashboard,
        dailyActivity: [...state.dashboard.dailyActivity],
        quizAttempts: [...state.dashboard.quizAttempts],
        learningHistory: [...state.dashboard.learningHistory],
        savedArticles: [...state.dashboard.savedArticles]
      }
    };
  }

  function emitDashboardChange() {
    const snapshot = getDashboardState();
    dashboardListeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (error) {
        console.error("[profile] dashboard listener failed", error);
      }
    });
    window.dispatchEvent(new CustomEvent("keefes:profile-state", { detail: snapshot }));
  }

  function subscribeDashboard(listener) {
    if (typeof listener !== "function") return () => {};
    dashboardListeners.add(listener);
    listener(getDashboardState());
    return () => dashboardListeners.delete(listener);
  }

  function markDashboardStorageFailure(error) {
    if (isMissingDashboardStorageError(error)) {
      state.dashboard.storageReady = false;
      state.dashboard.error = "개인 대시보드 저장 마이그레이션이 적용되지 않았습니다.";
    } else {
      state.dashboard.error = "개인 기록을 저장하지 못했습니다.";
    }
    emitDashboardChange();
  }

  async function loadDashboardData({ force = false } = {}) {
    const userId = state.session?.user?.id;
    if (!userId) {
      state.dashboard = createEmptyDashboardState();
      emitDashboardChange();
      return getDashboardState();
    }
    if (state.dashboardLoadPromise && !force) return state.dashboardLoadPromise;
    if (state.dashboardLoadPromise) return state.dashboardLoadPromise;

    const requestId = ++state.dashboardLoadRequest;
    state.dashboard = { ...state.dashboard, status: "loading", error: null };
    emitDashboardChange();

    const promise = (async () => {
      const [activityResult, quizResult, learningResult, savedResult] = await Promise.all([
        state.client.from("daily_activity")
          .select("activity_date,xp_awarded")
          .eq("user_id", userId)
          .order("activity_date", { ascending: false })
          .limit(14),
        state.client.from("quiz_attempts")
          .select("id,quiz_id,selected_answer,correct,xp_awarded,answered_at")
          .eq("user_id", userId)
          .order("answered_at", { ascending: false })
          .limit(500),
        state.client.from("learning_history")
          .select("target_id,label,category,viewed_at")
          .eq("user_id", userId)
          .order("viewed_at", { ascending: false })
          .limit(100),
        state.client.from("saved_articles")
          .select("article_key,title,source,original_url,published_at,section,analysis,saved_at")
          .eq("user_id", userId)
          .order("saved_at", { ascending: false })
          .limit(100)
      ]);
      if (requestId !== state.dashboardLoadRequest || state.session?.user?.id !== userId) {
        return getDashboardState();
      }

      const storageErrors = [learningResult.error, savedResult.error].filter(Boolean);
      const operationalError = [activityResult.error, quizResult.error, ...storageErrors]
        .find((error) => error && !isMissingDashboardStorageError(error));
      const storageReady = !storageErrors.some(isMissingDashboardStorageError);
      if (!storageReady) {
        console.warn("[profile] personal dashboard migration is not available yet");
      }
      state.dashboard = {
        status: operationalError ? "error" : "loaded",
        storageReady,
        dailyActivity: activityResult.error ? [] : activityResult.data || [],
        quizAttempts: quizResult.error ? [] : quizResult.data || [],
        learningHistory: learningResult.error ? [] : learningResult.data || [],
        savedArticles: savedResult.error ? [] : savedResult.data || [],
        error: operationalError ? "일부 개인 기록을 불러오지 못했습니다." : null
      };
      emitDashboardChange();
      return getDashboardState();
    })().catch((error) => {
      console.error("[profile] dashboard data load failed", error);
      state.dashboard = {
        ...state.dashboard,
        status: "error",
        error: "개인 기록을 불러오지 못했습니다."
      };
      emitDashboardChange();
      return getDashboardState();
    }).finally(() => {
      if (requestId === state.dashboardLoadRequest) state.dashboardLoadPromise = null;
    });

    state.dashboardLoadPromise = promise;
    return promise;
  }

  async function recordGlossaryView(item = {}) {
    if (!state.session?.user || !item.term || state.dashboard.storageReady === false) return false;
    const targetId = String(item.id || item.term).slice(0, 120);
    const { error } = await state.client.rpc("record_own_learning_item", {
      target_id: targetId,
      target_label: String(item.term).slice(0, 180),
      target_category: String(item.category || "").slice(0, 80)
    });
    if (error) {
      console.error("[profile] learning history save failed", error);
      markDashboardStorageFailure(error);
      return false;
    }
    const row = {
      target_id: targetId,
      label: String(item.term),
      category: String(item.category || ""),
      viewed_at: new Date().toISOString()
    };
    state.dashboard.storageReady = true;
    state.dashboard.learningHistory = [
      row,
      ...state.dashboard.learningHistory.filter((entry) => entry.target_id !== targetId)
    ].slice(0, 100);
    emitDashboardChange();
    return true;
  }

  function getArticleKey(headline = {}) {
    return String(
      headline.article_key
      || headline.id
      || headline.url
      || `${headline.source || "news"}|${headline.title || "untitled"}`
    ).slice(0, 160);
  }

  function isArticleSaved(headlineOrKey) {
    const key = typeof headlineOrKey === "string"
      ? headlineOrKey
      : getArticleKey(headlineOrKey);
    return state.dashboard.savedArticles.some((article) => article.article_key === key);
  }

  async function removeSavedArticle(articleKey) {
    if (!state.session?.user || !articleKey || state.dashboard.storageReady === false) {
      return { ok: false, reason: "unavailable" };
    }
    const { error } = await state.client.rpc("delete_own_article", {
      target_article_key: String(articleKey).slice(0, 160)
    });
    if (error) {
      console.error("[profile] saved article delete failed", error);
      markDashboardStorageFailure(error);
      return { ok: false, reason: "save-failed" };
    }
    state.dashboard.savedArticles = state.dashboard.savedArticles.filter(
      (article) => article.article_key !== articleKey
    );
    emitDashboardChange();
    return { ok: true, saved: false };
  }

  async function toggleSavedArticle(headline = {}, analysis = null) {
    if (!state.session?.user) return { ok: false, reason: "authentication-required" };
    const articleKey = getArticleKey(headline);
    if (isArticleSaved(articleKey) && !analysis) {
      return removeSavedArticle(articleKey);
    }
    const originalUrl = String(headline.url || headline.original_url || "");
    if (!/^https?:\/\//i.test(originalUrl)) {
      return { ok: false, reason: "original-url-required" };
    }
    const analysisSnapshot = compactArticleAnalysis(analysis);
    const { error } = await state.client.rpc("save_own_article", {
      target_article_key: articleKey,
      target_title: String(headline.title || "제목 미확인").slice(0, 500),
      target_source: String(headline.source || "").slice(0, 120),
      target_original_url: originalUrl.slice(0, 2048),
      target_published_at: headline.publishedAt || headline.published_at || null,
      target_section: String(headline.section || headline.topic || "").slice(0, 80),
      target_analysis: analysisSnapshot
    });
    if (error) {
      console.error("[profile] saved article write failed", error);
      markDashboardStorageFailure(error);
      return { ok: false, reason: "save-failed" };
    }
    const previous = state.dashboard.savedArticles.find(
      (article) => article.article_key === articleKey
    );
    const row = {
      article_key: articleKey,
      title: String(headline.title || "제목 미확인"),
      source: String(headline.source || ""),
      original_url: originalUrl,
      published_at: headline.publishedAt || headline.published_at || null,
      section: String(headline.section || headline.topic || ""),
      analysis: Object.keys(analysisSnapshot).length ? analysisSnapshot : previous?.analysis || {},
      saved_at: new Date().toISOString()
    };
    state.dashboard.storageReady = true;
    state.dashboard.savedArticles = [
      row,
      ...state.dashboard.savedArticles.filter((article) => article.article_key !== articleKey)
    ].slice(0, 100);
    emitDashboardChange();
    return { ok: true, saved: true };
  }

  async function requestFreshSnapshot({ companyIds = [] } = {}) {
    const accessToken = state.session?.access_token;
    if (!accessToken) {
      return {
        ok: false,
        status: 401,
        data: { error: "로그인하면 하루 3회 최신 자료를 즉시 확인할 수 있습니다." }
      };
    }
    try {
      const response = await fetch("/api/snapshot-refresh", {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ companyIds }),
        cache: "no-store",
        signal: AbortSignal.timeout(28_000)
      });
      const data = await response.json().catch(() => ({
        error: "즉시 갱신 응답을 확인하지 못했습니다."
      }));
      if (response.status === 401) await state.client.auth.signOut();
      return { ok: response.ok, status: response.status, data };
    } catch (error) {
      console.error("[profile] snapshot refresh failed", error);
      return {
        ok: false,
        status: 0,
        data: { error: "즉시 갱신 요청이 시간 안에 완료되지 않았습니다." }
      };
    }
  }

  async function recordQuizAnswer(question = {}) {
    if (!state.session?.access_token || !question.id || !question.selectedAnswer) return null;
    const result = await authenticatedPost("/api/profile-quiz", {
      questionId: question.id,
      selectedAnswer: question.selectedAnswer
    });
    if (!result) return null;
    applyProgressResult(result);
    void loadDashboardData({ force: true });
    return result;
  }

  function applyProgressResult(result) {
    state.progress = mergeProfileProgressResult(state.progress, result);
    renderProgress();
    emitDashboardChange();
  }

  function applyActivityRows(rows = []) {
    const streak = calculateProfileStreak(rows.map((row) => row?.activity_date));
    state.progress = {
      ...state.progress,
      current_streak: streak.currentStreak,
      longest_streak: streak.longestStreak,
      streak_available: true
    };
  }

  async function refreshActivityStreak() {
    const userId = state.session?.user?.id;
    if (!userId) throw new Error("Profile session is unavailable");
    const { data, error } = await state.client
      .from("daily_activity")
      .select("activity_date")
      .eq("user_id", userId)
      .order("activity_date", { ascending: false })
      .limit(1000);
    if (error) throw error;
    applyActivityRows(data);
    renderProgress();
  }

  async function authenticatedPost(url, body) {
    const accessToken = state.session?.access_token;
    if (!accessToken) return null;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json"
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000)
      });
      const result = await response.json();
      if (response.status === 401) {
        await state.client.auth.signOut();
        return null;
      }
      if (!response.ok) throw new Error(result?.error || "Profile request failed");
      return result;
    } catch (error) {
      console.error(`[profile] ${url} failed`, error);
      return null;
    }
  }

  function queuePreferenceSync(settings) {
    if (!state.session?.user) return;
    clearTimeout(state.preferenceTimer);
    state.preferenceTimer = setTimeout(() => {
      void savePreferences(settings).catch((error) => {
        console.error("[profile] preference sync failed", error);
        setMessage(
          elements.message,
          "설정은 이 기기에 저장됐지만 계정 동기화에 실패했습니다.",
          "error"
        );
      });
    }, 500);
  }

  async function savePreferences(settings) {
    const userId = state.session?.user?.id;
    if (!userId) return;
    const { data, error } = await state.client
      .from("profile_preferences")
      .update(preferencesToRow(settings))
      .eq("user_id", userId)
      .select("font_scale,high_contrast,desktop_layout,updated_at")
      .single();
    if (error) throw error;
    state.preferences = data;
  }

  async function openProfile() {
    if (!state.session?.user || !state.profile) return;
    setMessage(elements.formMessage);
    elements.nicknameInput.value = state.profile.nickname;
    state.selectedAvatar = state.profile.avatar_key;
    state.draftWatchlists = state.watchlists.map((row) => ({ ...row }));
    renderAvatarOptions();
    renderMarketOptions();
    await Promise.all([loadCompanies(), loadIndicators()]);
    renderWatchlists();
    if (!elements.dialog.open) elements.dialog.showModal();
    elements.nicknameInput.focus({ preventScroll: true });
  }

  function closeProfile() {
    if (elements.dialog?.open) elements.dialog.close();
  }

  function renderAvatarOptions() {
    elements.avatarOptions.replaceChildren();
    PROFILE_AVATARS.forEach((avatar) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "profile-avatar-option";
      button.dataset.tone = avatar.tone;
      button.dataset.selected = String(avatar.id === state.selectedAvatar);
      button.setAttribute("aria-pressed", String(avatar.id === state.selectedAvatar));
      button.setAttribute("aria-label", avatar.label);
      button.title = avatar.label;
      button.textContent = avatar.symbol;
      button.addEventListener("click", () => {
        state.selectedAvatar = avatar.id;
        renderAvatarOptions();
      });
      elements.avatarOptions.append(button);
    });
  }

  function renderMarketOptions() {
    if (elements.marketSelect.options.length) return;
    PROFILE_MARKETS.forEach((market) => {
      const option = document.createElement("option");
      option.value = market.id;
      option.textContent = market.label;
      elements.marketSelect.append(option);
    });
  }

  async function loadCompanies() {
    if (state.companies.length) return;
    const module = await importVersioned("./future-industry-data.js");
    state.companies = [...module.futureCompanies].sort((a, b) => a.name.localeCompare(b.name, "ko"));
    state.companyByInput.clear();
    const fragment = document.createDocumentFragment();
    state.companies.forEach((company) => {
      const label = `${company.name}${company.ticker ? ` · ${company.ticker}` : ""}`;
      state.companyByInput.set(label, company);
      const option = document.createElement("option");
      option.value = label;
      fragment.append(option);
    });
    elements.companyOptions.replaceChildren(fragment);
  }

  async function loadIndicators() {
    if (state.indicators.length) return;
    const [base, finance, expanded, broad, production] = await Promise.all([
      importVersioned("./indicator-data.js"),
      importVersioned("./indicator-finance-data.js"),
      importVersioned("./indicator-expanded-data.js"),
      importVersioned("./indicator-broad-data.js"),
      importVersioned("./resource-production-data.js")
    ]);
    state.indicators = [
      ...base.indicatorDefinitions,
      ...finance.financeIndicatorDefinitions,
      ...expanded.expandedIndicatorDefinitions,
      ...broad.broadIndicatorDefinitions,
      ...production.resourceProductionIndicators
    ].sort((left, right) => left.name.localeCompare(right.name, "ko"));
    if (!elements.indicatorSelect) return;
    const fragment = document.createDocumentFragment();
    state.indicators.forEach((indicator) => {
      const option = document.createElement("option");
      option.value = indicator.id;
      option.textContent = `${indicator.name} · ${indicator.unit || "단위 확인"}`;
      fragment.append(option);
    });
    elements.indicatorSelect.replaceChildren(fragment);
  }

  function addSelectedMarket() {
    const targetId = elements.marketSelect.value;
    if (!targetId || state.draftWatchlists.some((row) => row.item_type === "market" && row.target_id === targetId)) return;
    state.draftWatchlists.push({ item_type: "market", target_id: targetId });
    renderWatchlists();
  }

  function addSelectedCompany() {
    const company = state.companyByInput.get(elements.companyInput.value.trim());
    if (!company) {
      setMessage(elements.formMessage, "목록에서 기업을 선택해 주세요.", "error");
      return;
    }
    if (!state.draftWatchlists.some((row) => row.item_type === "company" && row.target_id === company.id)) {
      state.draftWatchlists.push({ item_type: "company", target_id: company.id });
    }
    elements.companyInput.value = "";
    setMessage(elements.formMessage);
    renderWatchlists();
  }

  function addSelectedIndicator() {
    const targetId = elements.indicatorSelect?.value;
    if (!targetId || state.draftWatchlists.some(
      (row) => row.item_type === "indicator" && row.target_id === targetId
    )) return;
    state.draftWatchlists.push({ item_type: "indicator", target_id: targetId });
    renderWatchlists();
  }

  function removeDraftWatchlist(row) {
    state.draftWatchlists = state.draftWatchlists.filter((item) => item !== row);
    renderWatchlists();
  }

  function renderWatchlists() {
    elements.marketList.replaceChildren();
    elements.companyList.replaceChildren();
    elements.indicatorList?.replaceChildren();
    const marketById = new Map(PROFILE_MARKETS.map((market) => [market.id, market]));
    const companyById = new Map(state.companies.map((company) => [company.id, company]));
    const indicatorById = new Map(state.indicators.map((indicator) => [indicator.id, indicator]));
    state.draftWatchlists.forEach((row) => {
      if (row.item_type === "market") {
        elements.marketList.append(
          createChip(row, marketById.get(row.target_id)?.label || row.target_id, removeDraftWatchlist)
        );
      } else if (row.item_type === "company") {
        elements.companyList.append(
          createChip(row, companyById.get(row.target_id)?.name || row.target_id, removeDraftWatchlist)
        );
      } else if (row.item_type === "indicator") {
        elements.indicatorList?.append(
          createChip(row, indicatorById.get(row.target_id)?.name || row.target_id, removeDraftWatchlist)
        );
      }
    });
    setEmptyListState(elements.marketList, "선택한 시장이 없습니다.");
    setEmptyListState(elements.companyList, "선택한 기업이 없습니다.");
    if (elements.indicatorList) {
      setEmptyListState(elements.indicatorList, "선택한 경제지표가 없습니다.");
    }
  }

  function setEmptyListState(element, label) {
    if (element.children.length) {
      element.classList.remove("is-empty");
      return;
    }
    element.textContent = label;
    element.classList.add("is-empty");
  }

  async function saveProfile(event) {
    event.preventDefault();
    const nickname = normalizeProfileNickname(elements.nicknameInput.value);
    if (!isValidProfileNickname(nickname)) {
      setMessage(elements.formMessage, "닉네임은 공백 제외 2~20자로 입력해 주세요.", "error");
      return;
    }
    setButtonBusy(elements.saveButton, true, "저장 중...");
    setMessage(elements.formMessage);
    try {
      const saved = await saveProfileChanges(nickname, state.selectedAvatar);
      state.profile = saved.profile;
      state.watchlists = saved.watchlists;
      state.draftWatchlists = saved.watchlists.map((row) => ({ ...row }));
      renderSignedIn();
      emitDashboardChange();
      setMessage(elements.formMessage, "프로필을 저장했습니다.", "success");
      setTimeout(closeProfile, 450);
    } catch (error) {
      console.error("[profile] save failed", error);
      const storageUpgradeNeeded = error?.code === "23514"
        || /watchlists_item_type_check|invalid watchlist item|indicator/i.test(String(error?.message || ""));
      setMessage(
        elements.formMessage,
        error?.code === "23505"
          ? "이미 사용 중인 닉네임입니다."
          : storageUpgradeNeeded
            ? "관심 지표 저장 준비가 필요합니다. 007 개인 대시보드 SQL을 적용한 뒤 다시 저장해 주세요."
            : "프로필을 저장하지 못했습니다.",
        "error"
      );
    } finally {
      setButtonBusy(elements.saveButton, false);
    }
  }

  async function saveProfileChanges(nickname, avatarKey) {
    const targetItems = state.draftWatchlists.map((row) => ({
      item_type: row.item_type,
      target_id: row.target_id
    }));
    const { error: saveError } = await state.client.rpc("save_own_profile", {
      target_nickname: nickname,
      target_avatar_key: avatarKey,
      target_items: targetItems
    });
    if (saveError) throw saveError;
    const [profileResult, watchlistResult] = await Promise.all([
      state.client
        .from("profiles")
        .select("user_id,nickname,avatar_key,updated_at")
        .eq("user_id", state.session.user.id)
        .single(),
      state.client
        .from("watchlists")
        .select("id,item_type,target_id,created_at")
        .eq("user_id", state.session.user.id)
        .order("created_at")
    ]);
    if (profileResult.error) throw profileResult.error;
    if (watchlistResult.error) throw watchlistResult.error;
    return {
      profile: profileResult.data,
      watchlists: watchlistResult.data || []
    };
  }
}

function createNoopController() {
  const dashboardState = {
    available: false,
    authenticated: false,
    profile: null,
    progress: null,
    watchlists: [],
    dashboard: createEmptyDashboardState("unavailable")
  };
  const articleKey = (headline = {}) => String(
    headline.article_key
    || headline.id
    || headline.url
    || `${headline.source || "news"}|${headline.title || "untitled"}`
  ).slice(0, 160);
  return {
    openProfile() {},
    startSignIn() {
      return Promise.resolve(false);
    },
    queuePreferenceSync() {},
    recordQuizAnswer() {
      return Promise.resolve(null);
    },
    loadDashboardData() {
      return Promise.resolve(dashboardState);
    },
    getDashboardState() {
      return {
        ...dashboardState,
        dashboard: { ...dashboardState.dashboard }
      };
    },
    subscribeDashboard(listener) {
      if (typeof listener === "function") listener(this.getDashboardState());
      return () => {};
    },
    recordGlossaryView() {
      return Promise.resolve(false);
    },
    toggleSavedArticle() {
      return Promise.resolve({ ok: false, reason: "unavailable" });
    },
    removeSavedArticle() {
      return Promise.resolve({ ok: false, reason: "unavailable" });
    },
    isArticleSaved() {
      return false;
    },
    getArticleKey: articleKey,
    requestFreshSnapshot() {
      return Promise.resolve({
        ok: false,
        status: 503,
        data: { error: "프로필 연결이 준비되지 않았습니다." }
      });
    },
    isAuthenticated() {
      return false;
    }
  };
}
