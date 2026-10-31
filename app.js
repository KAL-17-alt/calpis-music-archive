(function() {
  "use strict";

  const DATA = window.ARCHIVE_DATA || [];

  // Calculate dynamic statistics strictly from Category 1 & 2 artists
  const countCat1 = DATA.filter(a => a.cat === 1).length;
  const countCat2 = DATA.filter(a => a.cat === 2).length;
  const countTotal = countCat1 + countCat2;

  // Constants for Activity Classifications & Subscriber Buckets
  const ACTIVITY_ROLES = [
    "Vsinger",
    "Vtuber",
    "歌い手",
    "声優",
    "キャラ",
    "歌手",
    "音楽グループ"
  ];

  const SUBSCRIBER_BUCKETS = [
    { key: "under10k", label: "1万人未満" },
    { key: "10kTo100k", label: "1万人以上～10万人未満" },
    { key: "100kTo1m", label: "10万人以上～100万人未満" },
    { key: "over1m", label: "100万人以上" },
    { key: "unknown", label: "登録者数が取得できない名義" }
  ];

  const SUB_BUCKET_LABEL_MAP = {};
  SUBSCRIBER_BUCKETS.forEach(b => { SUB_BUCKET_LABEL_MAP[b.key] = b.label; });

  // PC Font Scale steps (4 steps in v6: 100%, 125%, 150%, 175%; 200% removed)
  const VALID_FONT_SCALES = [100, 125, 150, 175];
  const FONT_SCALE_STORAGE_KEY = "calpis_pc_font_scale";
  const RECOMMENDED_STORAGE_KEY = "calpis_recommended_artists_v1";
  const RECOMMENDED_BACKUP_KEY = "calpis_recommended_artists_v1_backup";
  const FAV_SERVER_CACHE_KEY = "calpis_fav_server_cache_v1";
  const FAV_UNSAVED_DRAFT_KEY = "calpis_fav_unsaved_draft_v1";
  const FAV_MIGRATION_STATE_KEY = "calpis_fav_migration_state_v1";
  const FAV_API_ENDPOINT = "./api/favorites";

  // Build stable Artist Identifier (`aid`) maps so renames or sort order changes never break hearts
  const AID_TO_ARTIST = new Map();
  const NAME_TO_AID = new Map();
  const NORM_NAME_TO_AID = new Map();

  function normLookupKey(s) {
    return String(s || "").trim().replace(/[\s\u3000]+/g, " ").toLowerCase();
  }

  DATA.forEach((a, idx) => {
    if (!a) return;
    if (!a.aid || typeof a.aid !== "string") {
      a.aid = "a_" + String(idx + 1).padStart(4, "0");
    }
    AID_TO_ARTIST.set(a.aid, a);
    if (a.name) {
      NAME_TO_AID.set(a.name, a.aid);
      NORM_NAME_TO_AID.set(normLookupKey(a.name), a.aid);
    }
    if (Array.isArray(a.al)) {
      a.al.forEach(alias => {
        if (typeof alias === "string" && alias.trim()) {
          const nk = normLookupKey(alias);
          if (!NORM_NAME_TO_AID.has(nk)) NORM_NAME_TO_AID.set(nk, a.aid);
        }
      });
    }
  });

  function resolveToAid(nameOrAid) {
    if (!nameOrAid || typeof nameOrAid !== "string") return null;
    const t = nameOrAid.trim();
    if (!t) return null;
    if (AID_TO_ARTIST.has(t)) return t;
    if (NAME_TO_AID.has(t)) return NAME_TO_AID.get(t);
    const nk = normLookupKey(t);
    if (NORM_NAME_TO_AID.has(nk)) return NORM_NAME_TO_AID.get(nk);
    return null;
  }

  function resolveAidToName(aid) {
    const a = AID_TO_ARTIST.get(aid);
    return a ? a.name : null;
  }

  // Active set of recommended artist stable IDs (`aid`)
  const recommendedAidSet = new Set();
  let favQuickEditMode = false;
  let isSavingFavorites = false;

  // Server synchronization & optimistic concurrency tracking
  let serverFavIds = [];         // Sorted array of `aid`s confirmed on server
  let serverVersion = 0;         // Server version integer (0 = uninitialized)
  let serverConfigured = true;   // Whether server storage backend is configured
  let hasFetchedServerOnce = false;
  let lastServerFetchAt = 0;

  // Edit session baseline snapshot (captured when entering edit mode)
  let editSessionBaseIds = [];
  let editSessionBaseVersion = 0;

  function getSortedCurrentAids() {
    const arr = [];
    DATA.forEach(a => {
      if (a && a.aid && recommendedAidSet.has(a.aid)) {
        arr.push(a.aid);
      }
    });
    arr.sort();
    return arr;
  }

  function areAidArraysEqual(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  function setRecommendedFromAids(aids) {
    recommendedAidSet.clear();
    if (!Array.isArray(aids)) return;
    aids.forEach(item => {
      const aid = resolveToAid(item);
      if (aid) recommendedAidSet.add(aid);
    });
  }

  /**
   * Reads legacy `calpis_recommended_artists_v1` from localStorage without modifying or deleting it.
   * Returns an array of resolved `aid`s.
   */
  function getLegacyLocalStorageAids() {
    const tempSet = new Set();
    DATA.forEach(a => {
      if (a && a.rec && a.aid) tempSet.add(a.aid);
    });
    try {
      const raw = localStorage.getItem(RECOMMENDED_STORAGE_KEY) || localStorage.getItem(RECOMMENDED_BACKUP_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      parsed.forEach(entry => {
        if (typeof entry === "string" && entry.trim()) {
          if (entry.startsWith("-")) {
            const aid = resolveToAid(entry.slice(1));
            if (aid) tempSet.delete(aid);
          } else {
            const aid = resolveToAid(entry.trim());
            if (aid) tempSet.add(aid);
          }
        }
      });
    } catch (e) {
      return [];
    }
    return Array.from(tempSet).sort();
  }

  function loadFavServerCache() {
    try {
      const raw = localStorage.getItem(FAV_SERVER_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.ids)) {
        const cleanIds = [];
        const seen = new Set();
        parsed.ids.forEach(x => {
          const aid = resolveToAid(x);
          if (aid && !seen.has(aid)) {
            seen.add(aid);
            cleanIds.push(aid);
          }
        });
        cleanIds.sort();
        return {
          ids: cleanIds,
          version: typeof parsed.version === "number" ? parsed.version : 0,
          updatedAt: parsed.updatedAt || null
        };
      }
    } catch (e) {}
    return null;
  }

  function saveFavServerCache(ids, version, updatedAt) {
    try {
      localStorage.setItem(FAV_SERVER_CACHE_KEY, JSON.stringify({
        ids: Array.isArray(ids) ? ids : [],
        version: typeof version === "number" ? version : 0,
        updatedAt: updatedAt || new Date().toISOString(),
        cachedAt: Date.now()
      }));
    } catch (e) {}
  }

  function loadUnsavedDraft() {
    try {
      const raw = localStorage.getItem(FAV_UNSAVED_DRAFT_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.ids)) return null;
      const cleanIds = [];
      const seen = new Set();
      parsed.ids.forEach(x => {
        const aid = resolveToAid(x);
        if (aid && !seen.has(aid)) {
          seen.add(aid);
          cleanIds.push(aid);
        }
      });
      cleanIds.sort();
      const baseIds = Array.isArray(parsed.baseIds)
        ? parsed.baseIds.map(resolveToAid).filter(Boolean).sort()
        : [];
      return {
        ids: cleanIds,
        baseIds,
        baseVersion: typeof parsed.baseVersion === "number" ? parsed.baseVersion : 0,
        updatedAt: parsed.updatedAt || Date.now()
      };
    } catch (e) {}
    return null;
  }

  function saveUnsavedDraft() {
    try {
      const currentIds = getSortedCurrentAids();
      if (areAidArraysEqual(currentIds, editSessionBaseIds)) {
        localStorage.removeItem(FAV_UNSAVED_DRAFT_KEY);
        return;
      }
      localStorage.setItem(FAV_UNSAVED_DRAFT_KEY, JSON.stringify({
        ids: currentIds,
        baseIds: editSessionBaseIds,
        baseVersion: editSessionBaseVersion,
        updatedAt: Date.now()
      }));
    } catch (e) {}
  }

  function clearUnsavedDraft() {
    try {
      localStorage.removeItem(FAV_UNSAVED_DRAFT_KEY);
    } catch (e) {}
  }

  function hasActiveUnsavedDraft() {
    const d = loadUnsavedDraft();
    if (!d) return false;
    return !areAidArraysEqual(d.ids, d.baseIds);
  }

  // Initial synchronous boot load (0ms blocking)
  function loadRecommendedArtists() {
    const cachedServer = loadFavServerCache();
    const unsavedDraft = loadUnsavedDraft();
    const legacyAids = getLegacyLocalStorageAids();

    if (cachedServer && (cachedServer.version > 0 || cachedServer.ids.length > 0)) {
      serverFavIds = cachedServer.ids;
      serverVersion = cachedServer.version;
      setRecommendedFromAids(serverFavIds);
    } else if (legacyAids.length > 0) {
      // Display local legacy hearts until server responds
      setRecommendedFromAids(legacyAids);
    } else {
      setRecommendedFromAids([]);
    }

    // If there is an uncommitted draft from a previous session, keep it protected and visible
    if (unsavedDraft && !areAidArraysEqual(unsavedDraft.ids, unsavedDraft.baseIds)) {
      editSessionBaseIds = unsavedDraft.baseIds;
      editSessionBaseVersion = unsavedDraft.baseVersion;
      setRecommendedFromAids(unsavedDraft.ids);
    } else {
      editSessionBaseIds = [...serverFavIds];
      editSessionBaseVersion = serverVersion;
    }
  }

  function isRecommendedArtist(nameOrAid) {
    const aid = resolveToAid(nameOrAid);
    return Boolean(aid && recommendedAidSet.has(aid));
  }

  function getRecommendedCount() {
    let cnt = 0;
    DATA.forEach(a => {
      if (a && a.aid && recommendedAidSet.has(a.aid)) cnt++;
    });
    return cnt;
  }

  // Toggling in Quick-Heart Edit Mode ONLY updates screen + localStorage draft (NO server request!)
  function toggleRecommendedArtist(name) {
    if (isSavingFavorites) return;
    const aid = resolveToAid(name);
    if (!aid) return;
    if (recommendedAidSet.has(aid)) {
      recommendedAidSet.delete(aid);
    } else {
      recommendedAidSet.add(aid);
    }
    saveUnsavedDraft();
    updateFavEditBannerStatus();
    renderStaticStats();
    updateUI(false);
    renderDetailPanel(false);
  }

  loadRecommendedArtists();

  // Application State
  const state = {
    view: "all",           // "all" | "cat1" | "cat2" | "search"
    searchScope: "all",    // "all" | "cat1" | "cat2"
    searchTarget: "all",   // "all" | "artist" | "song" | "group"
    searchQuery: "",
    sortBy: "countDesc",   // "countDesc" | "countAsc" | "kanaAsc" | "alphaAsc" | "nameAsc" | "nameDesc"
    savedSortBy: "countDesc", // Sort order saved before 50-on or Alphabet filter auto-switches sort
    lastIndexType: "",     // "kana" | "alpha" | "" (tracks which index filter was operated most recently)
    roles: [],             // Selected activity roles (OR within group)
    subBuckets: [],        // Removed from filter drawer in v26
    agencyGroup: "",       // Selected broad agency/content group
    unitGroup: "",         // Selected standalone unit group (for artists without a broader agencyGroup)
    kanaRows: [],          // Selected 50-on rows e.g. ["あ", "か"] (multi-select supported)
    kanaChar: "",          // Optional sub-character when a single 50-on row is focused
    alphaChars: [],        // Selected alphabet letters e.g. ["A", "B"] (multi-select supported)
    selectedArtistName: null,
    detailMode: "top5",    // "top5" (default when artist clicked) | "archive" (かるが聴いてる曲)
    songSort: "titleAsc",  // "titleAsc" (default, persisted across artist switches) | "regAsc"
    pcFilterOpen: false,
    mobFilterOpen: false,
    pcFontScale: 100,      // 100 | 125 | 150 | 175
    renderLimit: 100,
    profileBackAvailable: false
  };

  // Undo / Redo History Stacks for in-site navigation
  const undoStack = [];
  const redoStack = [];
  const MAX_HISTORY = 60;

  function captureStateSnapshot() {
    return {
      view: state.view,
      searchScope: state.searchScope,
      searchTarget: state.searchTarget,
      searchQuery: state.searchQuery,
      sortBy: state.sortBy,
      savedSortBy: state.savedSortBy,
      lastIndexType: state.lastIndexType,
      roles: [...state.roles],
      agencyGroup: state.agencyGroup,
      unitGroup: state.unitGroup,
      kanaRows: [...state.kanaRows],
      kanaChar: state.kanaChar,
      alphaChars: [...state.alphaChars],
      selectedArtistName: state.selectedArtistName,
      detailMode: state.detailMode,
      songSort: state.songSort,
      profileBackAvailable: state.profileBackAvailable
    };
  }

  function snapshotsEqual(a, b) {
    if (!a || !b) return false;
    return JSON.stringify(a) === JSON.stringify(b);
  }

  function pushHistorySnapshot(markProfileJump = false) {
    const snap = captureStateSnapshot();
    if (undoStack.length > 0 && snapshotsEqual(undoStack[undoStack.length - 1], snap)) {
      if (markProfileJump) state.profileBackAvailable = true;
      syncHistoryButtons();
      return;
    }
    undoStack.push(snap);
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack.length = 0;
    if (markProfileJump) {
      state.profileBackAvailable = true;
    }
    syncHistoryButtons();
  }

  function applyStateSnapshot(snap) {
    if (!snap) return;
    state.view = snap.view;
    state.searchScope = snap.searchScope;
    state.searchTarget = snap.searchTarget || "all";
    state.searchQuery = snap.searchQuery;
    state.sortBy = snap.sortBy;
    state.savedSortBy = snap.savedSortBy;
    state.lastIndexType = snap.lastIndexType;
    state.roles = [...(snap.roles || [])];
    state.agencyGroup = snap.agencyGroup || "";
    state.unitGroup = snap.unitGroup || "";
    state.kanaRows = [...(snap.kanaRows || [])];
    state.kanaChar = snap.kanaChar || "";
    state.alphaChars = [...(snap.alphaChars || [])];
    state.selectedArtistName = snap.selectedArtistName || null;
    state.detailMode = snap.detailMode || "top5";
    state.songSort = snap.songSort || "titleAsc";
    // Never open the filter drawer on Undo or Redo
    state.pcFilterOpen = false;
    state.mobFilterOpen = false;
    state.profileBackAvailable = Boolean(snap.profileBackAvailable);

    const mobSheet = document.getElementById("mobFilterSheet");
    const backdrop = document.getElementById("sheetBackdrop");
    if (mobSheet) mobSheet.classList.remove("open");
    if (backdrop) {
      const showBd = (window.innerWidth <= 900 && Boolean(state.selectedArtistName));
      backdrop.classList.toggle("visible", showBd);
    }

    const searchInput = document.getElementById("mainSearchInput");
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    if (searchInput) searchInput.value = state.searchQuery;
    if (clearSearchBtn) clearSearchBtn.style.display = state.searchQuery ? "flex" : "none";
    document.querySelectorAll("[data-search-scope]").forEach(t => {
      t.classList.toggle("active", t.getAttribute("data-search-scope") === state.searchScope);
    });
    syncSearchTargetUI();
  }

  function syncHistoryButtons() {
    const isFilterDrawerOpen = Boolean(state.pcFilterOpen || state.mobFilterOpen);
    const canUndo = isFilterDrawerOpen || undoStack.length > 0;
    const canRedo = redoStack.length > 0;
    document.querySelectorAll('[data-history-action="undo"]').forEach(btn => {
      btn.disabled = !canUndo;
    });
    document.querySelectorAll('[data-history-action="redo"]').forEach(btn => {
      btn.disabled = !canRedo;
    });
    const detailBackBtn = document.getElementById("detailBackBtn");
    if (detailBackBtn) {
      const showProfileBack = (undoStack.length > 0) && (state.profileBackAvailable || Boolean(state.agencyGroup) || undoStack.length > 0);
      detailBackBtn.style.display = showProfileBack ? "inline-flex" : "none";
    }
  }

  function undoStateAction() {
    // Requirement: If filter drawer is currently open, pressing Undo first closes the filter drawer
    // (keeping current filters intact); subsequent Undo presses remove filters one by one while staying closed.
    if (state.pcFilterOpen || state.mobFilterOpen) {
      state.pcFilterOpen = false;
      state.mobFilterOpen = false;
      const mobSheet = document.getElementById("mobFilterSheet");
      const backdrop = document.getElementById("sheetBackdrop");
      if (mobSheet) mobSheet.classList.remove("open");
      if (backdrop && (!state.selectedArtistName || window.innerWidth > 900)) {
        backdrop.classList.remove("visible");
      }
      syncMobileScrollLock();
      updateUI(false);
      syncHistoryButtons();
      return;
    }
    if (undoStack.length === 0) return;
    const currentSnap = captureStateSnapshot();
    redoStack.push(currentSnap);
    const prevSnap = undoStack.pop();
    applyStateSnapshot(prevSnap);
    updateUI(false);
    renderDetailPanel(true);
    syncHistoryButtons();
  }

  function redoStateAction() {
    if (redoStack.length === 0) return;
    // Requirement: Redo re-applies selections without opening the filter drawer
    state.pcFilterOpen = false;
    state.mobFilterOpen = false;
    const currentSnap = captureStateSnapshot();
    undoStack.push(currentSnap);
    const nextSnap = redoStack.pop();
    applyStateSnapshot(nextSnap);
    updateUI(false);
    renderDetailPanel(true);
    syncHistoryButtons();
  }

  // KANA ROWS mapping for sub-character selection
  const KANA_ROW_CHARS = {
    "あ": ["あ", "い", "う", "え", "お"],
    "か": ["か", "き", "く", "け", "こ"],
    "さ": ["さ", "し", "す", "せ", "そ"],
    "た": ["た", "ち", "つ", "て", "と"],
    "な": ["な", "に", "ぬ", "ね", "の"],
    "は": ["は", "ひ", "ふ", "へ", "ほ"],
    "ま": ["ま", "み", "む", "め", "も"],
    "や": ["や", "ゆ", "よ"],
    "ら": ["ら", "り", "る", "れ", "ろ"],
    "わ": ["わ", "を", "ん"]
  };

  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Natural Collators for Japanese & English
  const jaCollator = new Intl.Collator("ja", { numeric: true, sensitivity: "base" });
  const enCollator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

  // Format numbers with commas
  const fmtNum = n => new Intl.NumberFormat("ja-JP").format(n);

  // Escape HTML
  function esc(str) {
    return String(str ?? "").replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[ch]));
  }

  // PC Font Size Scaling (Strictly PC-only; 4 steps: 100%, 125%, 150%, 175%; auto-corrects 200 -> 175)
  function loadSavedFontScale() {
    try {
      const raw = localStorage.getItem(FONT_SCALE_STORAGE_KEY);
      if (raw !== null) {
        const saved = parseInt(raw, 10);
        if (saved >= 200) {
          state.pcFontScale = 175;
          localStorage.setItem(FONT_SCALE_STORAGE_KEY, "175");
        } else if (VALID_FONT_SCALES.includes(saved)) {
          state.pcFontScale = saved;
        }
      }
    } catch (e) {}
  }

  function applyPcFontScale(pct, persist = true) {
    let normalized = Number(pct);
    if (normalized >= 200) normalized = 175;
    if (!VALID_FONT_SCALES.includes(normalized)) normalized = 100;
    state.pcFontScale = normalized;
    if (persist) {
      try {
        localStorage.setItem(FONT_SCALE_STORAGE_KEY, String(normalized));
      } catch (e) {}
    }
    const isMobile = window.innerWidth <= 900;
    const scaleFactor = isMobile ? 1 : (normalized / 100);
    document.documentElement.style.setProperty("--pc-font-scale", String(scaleFactor));

    const valEl = document.getElementById("pcFontScaleVal");
    if (valEl) valEl.textContent = `${normalized}%`;

    const sliderEl = document.getElementById("pcFontScaleSlider");
    if (sliderEl) {
      sliderEl.value = String(normalized);
      sliderEl.setAttribute("aria-valuenow", String(normalized));
    }

    document.querySelectorAll("[data-font-scale]").forEach(btn => {
      const btnVal = parseInt(btn.getAttribute("data-font-scale"), 10);
      btn.classList.toggle("active", btnVal === normalized);
    });
  }

  // Normalize query for search (absorbs full/half width, case, and converts katakana to hiragana)
  function normSearch(str) {
    const s = String(str ?? "").normalize("NFKC").toLowerCase().trim();
    let res = "";
    for (let i = 0; i < s.length; i++) {
      const code = s.charCodeAt(i);
      if (code >= 0x30a1 && code <= 0x30f6) {
        res += String.fromCharCode(code - 0x60);
      } else {
        res += s[i];
      }
    }
    return res;
  }

  function stripSpaces(str) {
    return String(str ?? "").replace(/[\s\-_・.／/()（）【】「」『』]+/g, "");
  }

  // Hiragana to Romaji (Hepburn & Kunrei) generator for confirmed reading strings
  const HIRA_ROMAJI_MAP = {
    "きゃ":["kya"],"きゅ":["kyu"],"きょ":["kyo"],
    "しゃ":["sha","sya"],"しゅ":["shu","syu"],"しょ":["sho","syo"],
    "ちゃ":["cha","tya"],"ちゅ":["chu","tyu"],"ちょ":["cho","tyo"],
    "にゃ":["nya"],"にゅ":["nyu"],"にょ":["nyo"],
    "ひゃ":["hya"],"ひゅ":["hyu"],"ひょ":["hyo"],
    "みゃ":["mya"],"みゅ":["myu"],"みょ":["myo"],
    "りゃ":["rya"],"りゅ":["ryu"],"りょ":["ryo"],
    "ぎゃ":["gya"],"ぎゅ":["gyu"],"ぎょ":["gyo"],
    "じゃ":["ja","jya","zya"],"じゅ":["ju","jyu","zyu"],"じょ":["jo","jyo","zyo"],
    "びゃ":["bya"],"びゅ":["byu"],"びょ":["byo"],
    "ぴゃ":["pya"],"ぴゅ":["pyu"],"ぴょ":["pyo"],
    "ふぁ":["fa"],"ふぃ":["fi"],"ふぇ":["fe"],"ふぉ":["fo"],
    "てぃ":["ti"],"でぃ":["di"],"うぃ":["wi"],"うぇ":["we"],"うぉ":["wo"],
    "ゔぁ":["va"],"ゔぃ":["vi"],"ゔ":["vu"],"ゔぇ":["ve"],"ゔぉ":["vo"],
    "あ":["a"],"い":["i"],"う":["u"],"え":["e"],"お":["o"],
    "か":["ka"],"き":["ki"],"く":["ku"],"け":["ke"],"こ":["ko"],
    "さ":["sa"],"し":["shi","si"],"す":["su"],"せ":["se"],"そ":["so"],
    "た":["ta"],"ち":["chi","ti"],"つ":["tsu","tu"],"て":["te"],"と":["to"],
    "な":["na"],"に":["ni"],"ぬ":["nu"],"ね":["ne"],"の":["no"],
    "は":["ha"],"ひ":["hi"],"ふ":["fu","hu"],"へ":["he"],"ほ":["ho"],
    "ま":["ma"],"み":["mi"],"む":["mu"],"め":["め"],"も":["mo"],
    "や":["ya"],"ゆ":["yu"],"よ":["yo"],
    "ら":["ra"],"り":["ri"],"る":["ru"],"れ":["re"],"ろ":["ro"],
    "わ":["wa"],"ゐ":["wi"],"ゑ":["we"],"を":["o","wo"],"ん":["n"],
    "が":["ga"],"ぎ":["gi"],"ぐ":["gu"],"げ":["ge"],"ご":["go"],
    "ざ":["za"],"じ":["ji","zi"],"ず":["zu"],"ぜ":["ze"],"ぞ":["zo"],
    "だ":["da"],"ぢ":["ji","di"],"づ":["zu","du"],"で":["de"],"ど":["do"],
    "ば":["ba"],"び":["bi"],"ぶ":["bu"],"べ":["be"],"ぼ":["bo"],
    "ぱ":["pa"],"ぴ":["pi"],"ぷ":["pu"],"ぺ":["pe"],"ぽ":["po"],
    "ぁ":["a"],"ぃ":["i"],"ぅ":["u"],"ぇ":["e"],"ぉ":["o"],
    "ゃ":["ya"],"ゅ":["yu"],"ょ":["yo"],"ゎ":["wa"]
  };
  HIRA_ROMAJI_MAP["め"] = ["me"];

  function hiraToRomajiPair(hira) {
    if (!hira) return [];
    let hep = "";
    let kun = "";
    let i = 0;
    const n = hira.length;
    while (i < n) {
      if (hira[i] === "っ") {
        let nextSyl = "";
        if (i + 2 < n && HIRA_ROMAJI_MAP[hira.slice(i + 1, i + 3)]) {
          nextSyl = HIRA_ROMAJI_MAP[hira.slice(i + 1, i + 3)][0];
        } else if (i + 1 < n && HIRA_ROMAJI_MAP[hira[i + 1]]) {
          nextSyl = HIRA_ROMAJI_MAP[hira[i + 1]][0];
        }
        if (nextSyl) {
          hep += nextSyl[0];
          kun += nextSyl[0];
        }
        i++;
        continue;
      }
      if (hira[i] === "ー") {
        i++;
        continue;
      }
      if (i + 1 < n && HIRA_ROMAJI_MAP[hira.slice(i, i + 2)]) {
        const opts = HIRA_ROMAJI_MAP[hira.slice(i, i + 2)];
        hep += opts[0];
        kun += opts[opts.length > 1 ? 1 : 0];
        i += 2;
        continue;
      }
      if (HIRA_ROMAJI_MAP[hira[i]]) {
        const opts = HIRA_ROMAJI_MAP[hira[i]];
        hep += opts[0];
        kun += opts[opts.length > 1 ? 1 : 0];
        i++;
        continue;
      }
      hep += hira[i];
      kun += hira[i];
      i++;
    }
    return hep === kun ? [hep] : [hep, kun];
  }

  // Extract confirmed hiragana reading key for 50-on sort (returns "" if reading is not verified kana)
  function extractConfirmedKanaKey(a) {
    const r = normSearch(a.reading || "");
    if (r && /^[ぁ-んー・\s]+$/.test(r)) {
      return r.replace(/[^ぁ-んー]/g, "");
    }
    const als = Array.isArray(a.al) ? a.al : [];
    for (let i = 0; i < als.length; i++) {
      const na = normSearch(als[i]);
      if (na && /^[ぁ-んー・\s]+$/.test(na)) {
        return na.replace(/[^ぁ-んー]/g, "");
      }
    }
    if (a.row && r) {
      const onlyKana = r.replace(/[^ぁ-んー]/g, "");
      if (onlyKana) return onlyKana;
    }
    return "";
  }

  // Extract normalized alphabet key for Alphabet sort
  function extractAlphaKey(a) {
    const cleanName = String(a.name || "")
      .normalize("NFKC")
      .replace(/^[\(\[（【「『《\-＋+#♯♪★☆\s]+/, "")
      .trim();
    if (/^[A-Za-z]/.test(cleanName)) {
      return cleanName.toLowerCase();
    }
    const als = Array.isArray(a.al) ? a.al : [];
    for (let i = 0; i < als.length; i++) {
      const cand = String(als[i] || "").normalize("NFKC").trim();
      if (/^[A-Za-z]/.test(cand)) {
        return cand.toLowerCase();
      }
    }
    return cleanName.toLowerCase();
  }

  // Precompute normalized search tokens & sort keys for artists & songs
  DATA.forEach((a, idx) => {
    a._id = idx;
    a._normName = normSearch(a.name);
    a._normNameNoSpace = stripSpaces(a._normName);
    a._normReading = normSearch(a.reading || "");
    a._normReadingNoSpace = stripSpaces(a._normReading);
    a._kanaSortKey = extractConfirmedKanaKey(a);
    a._alphaSortKey = extractAlphaKey(a);
    a._hasAlphaPrefix = Boolean(a.alpha) || /^[a-z]/i.test(a._alphaSortKey);

    const romajiFromReading = hiraToRomajiPair(a._normReading);
    const rawAliases = Array.isArray(a.al) ? a.al : [];
    const tokenSet = new Set();
    const noSpaceSet = new Set();

    [...rawAliases, ...romajiFromReading].forEach(tok => {
      const nt = normSearch(tok);
      if (nt) {
        tokenSet.add(nt);
        const ns = stripSpaces(nt);
        if (ns) noSpaceSet.add(ns);
      }
    });

    a._normAliases = Array.from(tokenSet);
    a._normAliasesNoSpace = Array.from(noSpaceSet);
    a._normSongs = (a.songs || []).map(s => normSearch(s));
    a._normSongsNoSpace = a._normSongs.map(s => stripSpaces(s));
    a._normTopSongs = (a.topSongs || []).map(s => normSearch(s));
  });

  // Fast Map from artist name to artist object
  const ARTIST_MAP = new Map();
  DATA.forEach(a => ARTIST_MAP.set(a.name, a));

  // Precompute clickable broad agency/content groups (>= 2 artists) for PC Filter Drawer
  const AGENCY_GROUP_COUNTS = new Map();
  DATA.forEach(a => {
    const ag = a.agencyGroup || a.agency || "";
    if (ag) {
      AGENCY_GROUP_COUNTS.set(ag, (AGENCY_GROUP_COUNTS.get(ag) || 0) + 1);
    }
  });
  const CLICKABLE_AGENCY_GROUPS = Array.from(AGENCY_GROUP_COUNTS.entries())
    .filter(([, cnt]) => cnt >= 1)
    .map(([name, count]) => ({ name, count }))
    .sort((x, y) => {
      if (y.count !== x.count) return y.count - x.count;
      return jaCollator.compare(x.name, y.name);
    });

  // Readings & aliases for 所属（事務所・作品）
  const AGENCY_SEARCH_ALIASES = {
    "ホロライブ": ["ほろらいぶ", "hololive", "ホロライブプロダクション"],
    "にじさんじ": ["にじさんじ", "nijisanji"],
    "ぶいすぽっ！": ["ぶいすぽっ", "ぶいすぽ", "vspo"],
    "神椿スタジオ": ["かみつばきすたじお", "かみつばき", "kamitsubaki", "sinsekai"],
    "ミリプロ": ["みりぷろ", "millionproduction"],
    "RIOT MUSIC": ["らいおっとみゅーじっく", "riotmusic", "blitzwing"],
    "RK Music": ["あーるけーみゅーじっく", "rkmusic"],
    "Re:AcT": ["りあくと", "react"],
    "ななしいんく": ["ななしいんく", "774inc"],
    "あおぎり高校": ["あおぎりこうこう", "aogiri"],
    "ネオポルテ": ["ねおぽるて", "neoporte"],
    "のりプロ": ["のりぷろ", "noripro"],
    "StelLive": ["すてるらいぶ", "stellive"],
    "Varium": ["ぶいありうむ", "varium"],
    "VEE": ["ぶいー", "vee"],
    "VOMS Project": ["ぼむず", "voms"],
    "Palette Project": ["ぱれっとぷろじぇくと", "パレプロ", "paletteproject"],
    "Phase Connect": ["ふぇいずこねくと", "phaseconnect"],
    "PRISM Project": ["ぷりずむぷろじぇくと", "prismproject"],
    "Propro": ["ぷろぷろ", "propro"],
    "Specialite": ["すぺしゃりて", "specialite"],
    "Voice-ore": ["ぼいすおれ", "voiceore"],
    "ホロスターズ": ["ほろすたーず", "holostars"],
    "ラブライブ！シリーズ": ["らぶらいぶ", "らぶらいぶしりーず", "lovelive", "μ's", "aqours", "虹ヶ咲", "liella", "蓮ノ空"],
    "アイドルマスターシリーズ": ["あいどるますたー", "アイマス", "imas", "idolmaster", "デレマス", "シンデレラガールズ", "ミリマス", "ミリオンライブ", "シャニマス", "シャイニーカラーズ", "学マス", "学園アイドルマスター"],
    "BanG Dream!": ["ばんどり", "バンドリ", "ガルパ", "bangdream", "ゆめみた"],
    "IDOLY PRIDE": ["あいどりーぷらいど", "アイプラ", "idolypride"],
    "プロジェクトセカイ カラフルステージ！ feat. 初音ミク": ["ぷろじぇくとせかい", "プロセカ", "pjsekai", "projectsekai"],
    "ウマ娘 プリティーダービー": ["うまむすめ", "umamusume"],
    "Re:ステージ！": ["りすてーじ", "リステージ", "restage"],
    "少女☆歌劇 レヴュースタァライト": ["れゔゅーすたぁらいと", "スタァライト", "revuestarlight"],
    "D4DJ": ["でぃーふぉーでぃーじぇー", "グルミク", "d4dj"],
    "ヘブンバーンズレッド": ["へぶんばーんずれっど", "ヘブバン", "heavenburnsred"],
    "プリンセスコネクト！Re:Dive": ["ぷりんせすこねくと", "プリコネ", "priconne"],
    "けいおん！": ["けいおん", "k-on"],
    "マクロスシリーズ": ["まくろす", "macross", "マクロスδ", "マクロスf"],
    "ぼっち・ざ・ろっく！": ["ぼっちざろっく", "ぼざろ", "bocchi"],
    "【推しの子】": ["おしのこ", "推しの子", "oshinoko"],
    "青春ブタ野郎シリーズ": ["せいしゅんぶたやろう", "青ブタ", "aobuta"],
    "ワールドダイスター": ["わーるどだいすたー", "ユメステ", "worlddai"],
    "ひなビタ♪": ["ひなびた", "hinabita"],
    "Wake Up, Girls!": ["うぇいくあっぷがーるず", "wug"],
    "アイカツ！シリーズ": ["あいかつ", "aikatsu"],
    "ソードアート・オンライン": ["そーどあーとおんらいん", "sao", "ggo", "ガンゲイル・オンライン"],
    "超かぐや姫！": ["ちょうかぐやひめ"],
    "混血のカレコレ": ["こんけつのかれこれ", "カレコレ"],
    "告白実行委員会 (HoneyWorks)": ["こくはくじっこういいんかい", "ハニワ", "honeyworks"],
    "ガールズバンドクライ": ["がーるずばんどくらい", "ガルクラ", "girlsbandcry"],
    "アズールレーン": ["あずーるれーん", "アズレン", "azurlane"],
    "アークナイツ": ["あーくないつ", "arknights"],
    "温泉むすめ": ["おんせんむすめ", "onsenmusume"],
    "電音部": ["でんおんぶ", "denonbu"],
    "SHOW BY ROCK!!": ["しょーばいろっく", "sb69"],
    "NEW GAME!": ["にゅーげーむ", "newgame"]
  };

  // Build SEARCHABLE_GROUPS:
  // 1) All 所属（事務所・作品） (agencyGroup)
  // 2) All standalone ユニット (units of people who do NOT have a broader 所属（事務所・作品）)
  const SEARCHABLE_GROUPS = [];
  CLICKABLE_AGENCY_GROUPS.forEach(ag => {
    const members = DATA.filter(a => (a.agencyGroup || a.agency || "") === ag.name);
    const cat1Cnt = members.filter(a => a.cat === 1).length;
    const cat2Cnt = members.filter(a => a.cat === 2).length;
    const aliases = AGENCY_SEARCH_ALIASES[ag.name] || [];
    const readingHira = aliases[0] || "";
    const romajiTokens = readingHira ? hiraToRomajiPair(normSearch(readingHira)) : [];
    const normTokens = [
      normSearch(ag.name),
      ...aliases.map(x => normSearch(x)),
      ...romajiTokens.map(x => normSearch(x))
    ].filter(Boolean);
    const normTokensNoSpace = normTokens.map(x => stripSpaces(x)).filter(Boolean);
    const sampleNames = members.slice(0, 4).map(m => m.name).join("・") + (members.length > 4 ? " ほか" : "");
    SEARCHABLE_GROUPS.push({
      type: "agency",
      typeLabel: "所属（事務所・作品）",
      name: ag.name,
      count: members.length,
      cat1Count: cat1Cnt,
      cat2Count: cat2Cnt,
      subtitle: sampleNames,
      _normName: normSearch(ag.name),
      _normNameNoSpace: stripSpaces(normSearch(ag.name)),
      _normTokens: normTokens,
      _normTokensNoSpace: normTokensNoSpace
    });
  });

  // Find units of artists who do NOT have a broader agencyGroup
  const standaloneUnitMembersMap = new Map();
  DATA.forEach(a => {
    const hasBroadAgency = Boolean(a.agencyGroup || a.agency);
    if (!hasBroadAgency && Array.isArray(a.memberOf)) {
      a.memberOf.forEach(uName => {
        if (uName && uName !== a.name && ARTIST_MAP.has(uName)) {
          const uArtist = ARTIST_MAP.get(uName);
          // Exclude units that are themselves already a broad agencyGroup or belong to a broad agencyGroup
          if (uArtist && !(uArtist.agencyGroup || uArtist.agency) && !AGENCY_GROUP_COUNTS.has(uName)) {
            if (!standaloneUnitMembersMap.has(uName)) {
              standaloneUnitMembersMap.set(uName, new Set([uName]));
            }
            standaloneUnitMembersMap.get(uName).add(a.name);
          }
        }
      });
    }
  });

  standaloneUnitMembersMap.forEach((memberSet, uName) => {
    const uArtist = ARTIST_MAP.get(uName);
    if (!uArtist) return;
    const memberObjs = Array.from(memberSet).map(n => ARTIST_MAP.get(n)).filter(Boolean);
    const cat1Cnt = memberObjs.filter(a => a.cat === 1).length;
    const cat2Cnt = memberObjs.filter(a => a.cat === 2).length;
    const indivMembers = Array.from(memberSet).filter(n => n !== uName);
    const subtitle = (uName === "MAISONdes") ? "" : (indivMembers.length > 0 ? `ボーカル: ${indivMembers.join("・")}` : (uArtist.vocal ? `ボーカル: ${uArtist.vocal}` : ""));
    const normTokens = [
      uArtist._normName,
      uArtist._normReading,
      ...(uArtist._normAliases || []),
      ...indivMembers.map(m => normSearch(m))
    ].filter(Boolean);
    const normTokensNoSpace = normTokens.map(x => stripSpaces(x)).filter(Boolean);
    SEARCHABLE_GROUPS.push({
      type: "unit",
      typeLabel: "ユニット",
      name: uName,
      count: memberObjs.length,
      cat1Count: cat1Cnt,
      cat2Count: cat2Cnt,
      subtitle: subtitle,
      _normName: uArtist._normName,
      _normNameNoSpace: uArtist._normNameNoSpace,
      _normTokens: normTokens,
      _normTokensNoSpace: normTokensNoSpace
    });
  });

  // Deterministic luxury avatar gradient & monogram generator
  const AVATAR_PALETTES = [
    ["#1DB954", "#0c5927"],
    ["#2E77D0", "#13335c"],
    ["#8E44AD", "#3d194d"],
    ["#E67E22", "#6e3607"],
    ["#16A085", "#09473b"],
    ["#D35400", "#5e2500"],
    ["#2980B9", "#103752"],
    ["#C0392B", "#59160f"],
    ["#27AE60", "#0e4a27"],
    ["#6C5CE7", "#2d2470"]
  ];

  function getMonogram(name) {
    const clean = String(name || "").replace(/^[\(\[（【「『《\-＋+]+/, "").trim();
    if (!clean) return "♪";
    if (/^[A-Za-z0-9]/.test(clean)) {
      const words = clean.split(/[\s\-_.]+/).filter(Boolean);
      if (words.length >= 2 && /^[A-Za-z0-9]/.test(words[1])) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return clean.slice(0, 2).toUpperCase();
    }
    return clean.slice(0, 2);
  }

  function getAvatarGradient(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash) + name.charCodeAt(i);
      hash |= 0;
    }
    const pair = AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
    return `linear-gradient(135deg, ${pair[0]} 0%, ${pair[1]} 100%)`;
  }

  // Optimize Google/YouTube avatar URLs dynamically by display target size (88px for 42px list rows, 48px for 18px chips, 240px for 140px detail view)
  function optimizeAvatarUrl(url, targetSize = 88) {
    if (!url) return "";
    if (
      url.includes("yt3.googleusercontent.com") ||
      url.includes("yt3.ggpht.com") ||
      url.includes("lh3.googleusercontent.com")
    ) {
      return url.replace(/=(?:s\d+|w\d+-h\d+)[^/?#]*/, `=s${targetSize}-c-k-c0x00ffffff-no-rj`);
    }
    return url;
  }

  function getDetailAvatarUrl(url) {
    return optimizeAvatarUrl(url, 240);
  }

  const preloadedAvatarUrls = new Set();
  function preloadAvatarUrl(url) {
    if (!url || preloadedAvatarUrls.has(url)) return;
    preloadedAvatarUrls.add(url);
    const img = new Image();
    img.referrerPolicy = "no-referrer";
    img.decoding = "async";
    img.src = url;
  }

  let lookaheadTimer = null;
  function scheduleLookaheadAvatarPreload(startIndex = 12, count = 36) {
    if (lookaheadTimer) {
      if (typeof cancelIdleCallback === "function") cancelIdleCallback(lookaheadTimer);
      else clearTimeout(lookaheadTimer);
      lookaheadTimer = null;
    }
    const runner = () => {
      const end = Math.min(currentFiltered.length, startIndex + count);
      for (let i = startIndex; i < end; i++) {
        const a = currentFiltered[i];
        if (a && a.img) {
          preloadAvatarUrl(optimizeAvatarUrl(a.img, 88));
        }
      }
      if (state.selectedArtistName && ARTIST_MAP.has(state.selectedArtistName)) {
        const sel = ARTIST_MAP.get(state.selectedArtistName);
        if (sel && sel.img) preloadAvatarUrl(getDetailAvatarUrl(sel.img));
      }
    };
    if (typeof requestIdleCallback === "function") {
      lookaheadTimer = requestIdleCallback(runner, { timeout: 300 });
    } else {
      lookaheadTimer = setTimeout(runner, 50);
    }
  }

  function renderAvatarHTML(artist, isDetail = false, rowIndex = 999) {
    const mono = esc(getMonogram(artist.name));
    const grad = getAvatarGradient(artist.name);
    const dim = isDetail ? 140 : 42;
    const imgUrl = isDetail ? getDetailAvatarUrl(artist.img) : optimizeAvatarUrl(artist.img, 88);
    if (imgUrl) {
      let loadAttr = 'loading="lazy" decoding="async"';
      if (isDetail) {
        loadAttr = 'loading="eager" fetchpriority="high" decoding="async"';
      } else if (rowIndex < 12) {
        loadAttr = 'loading="eager" fetchpriority="high" decoding="async"';
      } else if (rowIndex < 28) {
        loadAttr = 'loading="eager" decoding="async"';
      }
      const fallbackHandler = artist.name === "MyGO!!!!!"
        ? "if(!this.dataset.fb){this.dataset.fb='1';this.src='data:image/webp;base64,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';return;}this.style.display='none';this.nextElementSibling.style.display='flex';"
        : "this.style.display='none';this.nextElementSibling.style.display='flex';";
      return `<img class="row-avatar-img" src="${esc(imgUrl)}" alt="${esc(artist.name)}" width="${dim}" height="${dim}" ${loadAttr} referrerpolicy="no-referrer" onerror="${fallbackHandler}"><div class="avatar-fallback" style="display:none;background:${grad}">${mono}</div>`;
    }
    return `<div class="avatar-fallback" style="background:${grad}">${mono}</div>`;
  }

  // Format representative song title with " (cover)" when songType === "cover" (never duplicating)
  function formatTop5SongTitle(songTitle, songType) {
    const base = String(songTitle ?? "").trim();
    if (songType === "cover" && !/\(cover\)\s*$/i.test(base)) {
      return `${base} (cover)`;
    }
    return base;
  }

  // Helper to check if any 50-on or Alphabet filter is active
  function hasKanaFilter() {
    return state.kanaRows.length > 0 || Boolean(state.kanaChar);
  }

  function hasAlphaFilter() {
    return state.alphaChars.length > 0;
  }

  function hasAnyIndexFilter() {
    return hasKanaFilter() || hasAlphaFilter();
  }

  // Auto-sync sort order when 50-on or Alphabet filters are selected/cleared
  function syncSortWithIndexFilters(triggeredBy) {
    const kanaActive = hasKanaFilter();
    const alphaActive = hasAlphaFilter();

    if (!kanaActive && !alphaActive) {
      state.lastIndexType = "";
      state.sortBy = state.savedSortBy || "countDesc";
      return;
    }

    if (triggeredBy === "kana" && kanaActive) {
      state.lastIndexType = "kana";
      state.sortBy = "kanaAsc";
      return;
    }
    if (triggeredBy === "alpha" && alphaActive) {
      state.lastIndexType = "alpha";
      state.sortBy = "alphaAsc";
      return;
    }

    // One of the systems was cleared, but the other is still active
    if (kanaActive && !alphaActive) {
      state.lastIndexType = "kana";
      state.sortBy = "kanaAsc";
    } else if (alphaActive && !kanaActive) {
      state.lastIndexType = "alpha";
      state.sortBy = "alphaAsc";
    } else if (kanaActive && alphaActive) {
      state.sortBy = state.lastIndexType === "alpha" ? "alphaAsc" : "kanaAsc";
    }
  }

  // Filter & Sort Pipeline with Exact-Match Priority
  let currentFiltered = [];

  function syncSearchTargetUI() {
    if (state.searchTarget === "both") state.searchTarget = "all";
    const target = state.searchTarget || "all";
    document.querySelectorAll("[data-search-target]").forEach(btn => {
      const isAct = btn.getAttribute("data-search-target") === target;
      btn.classList.toggle("active", isAct);
      btn.setAttribute("aria-selected", isAct ? "true" : "false");
    });
    const titleEl = document.getElementById("searchViewTitle");
    const inputEl = document.getElementById("mainSearchInput");
    if (titleEl) {
      if (target === "artist") titleEl.textContent = "アーティストを検索";
      else if (target === "song") titleEl.textContent = "楽曲を検索";
      else if (target === "group") titleEl.textContent = "グループを検索";
      else titleEl.textContent = "すべて検索";
    }
    if (inputEl) {
      if (target === "artist") {
        inputEl.placeholder = "アーティスト名・ひらがな・カタカナ・ローマ字を入力...";
      } else if (target === "song") {
        inputEl.placeholder = "楽曲名（登録曲・代表曲）を入力...";
      } else if (target === "group") {
        inputEl.placeholder = "所属（事務所・作品）やユニット名を入力...";
      } else {
        inputEl.placeholder = "アーティスト・楽曲・所属（事務所・作品）・ユニット名を入力...";
      }
    }
  }

  let currentMatchedGroups = [];

  function findMatchingSearchGroups(q, qNoSpace) {
    const scope = state.searchScope || "all";
    const pool = SEARCHABLE_GROUPS.filter(g => {
      if (scope === "cat1" && g.cat1Count === 0) return false;
      if (scope === "cat2" && g.cat2Count === 0) return false;
      return true;
    });
    if (!q) {
      if (state.searchTarget !== "group") return [];
      return pool.slice().sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return jaCollator.compare(a.name, b.name);
      });
    }
    const matched = [];
    pool.forEach(g => {
      let tier = 99;
      if (g._normName === q || (qNoSpace && g._normNameNoSpace === qNoSpace)) {
        tier = 1;
      } else if (g._normTokens.includes(q) || (qNoSpace && g._normTokensNoSpace.includes(qNoSpace))) {
        tier = 2;
      } else if (g._normName.startsWith(q) || (qNoSpace && g._normNameNoSpace.startsWith(qNoSpace)) || g._normTokens.some(t => t.startsWith(q))) {
        tier = 3;
      } else if (g._normName.includes(q) || (qNoSpace && g._normNameNoSpace.includes(qNoSpace)) || g._normTokens.some(t => t.includes(q)) || (qNoSpace && g._normTokensNoSpace.some(t => t.includes(qNoSpace)))) {
        tier = 4;
      }
      if (tier < 99) {
        matched.push(g);
      }
    });
    matched.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return jaCollator.compare(a.name, b.name);
    });
    return matched;
  }

  function findMatchedSongsForArtist(a, q, qNoSpace) {
    const exactMatches = [];
    const partialMatches = [];
    const seen = new Set();

    for (let i = 0; i < a._normSongs.length; i++) {
      const rawSong = a.songs[i];
      if (seen.has(rawSong)) continue;
      const ns = a._normSongs[i];
      const nsNoSpace = a._normSongsNoSpace[i];
      if (ns === q || (qNoSpace && nsNoSpace === qNoSpace)) {
        exactMatches.push(rawSong);
        seen.add(rawSong);
      } else if (ns.includes(q) || (qNoSpace && nsNoSpace.includes(qNoSpace))) {
        partialMatches.push(rawSong);
        seen.add(rawSong);
      }
    }
    if (a._normTopSongs) {
      for (let i = 0; i < a._normTopSongs.length; i++) {
        const rawTop = a.topSongs[i];
        if (seen.has(rawTop)) continue;
        const nt = a._normTopSongs[i];
        if (nt === q) {
          exactMatches.push(rawTop);
          seen.add(rawTop);
        } else if (nt.includes(q)) {
          partialMatches.push(rawTop);
          seen.add(rawTop);
        }
      }
    }
    const allMatched = [...exactMatches, ...partialMatches];
    if (allMatched.length === 0) return null;
    const displaySongs = allMatched.slice(0, 3).join(" / ") + (allMatched.length > 3 ? ` ほか${allMatched.length - 3}曲` : "");
    return {
      tier: exactMatches.length > 0 ? 4 : 5,
      first: allMatched[0],
      display: displaySongs,
      count: allMatched.length
    };
  }

  function evaluateSearchMatch(a, q, qNoSpace) {
    const rawMode = state.searchTarget || "all";
    const mode = rawMode === "all" ? "both" : rawMode;
    a._matchedSongsDisplay = null;
    if (mode === "group") {
      a._searchTier = 99;
      return false;
    }

    if (mode !== "song") {
      // Tier 1: Exact match on artist name, reading, or confirmed alias/romaji
      if (
        a._normName === q ||
        (qNoSpace && a._normNameNoSpace === qNoSpace) ||
        (a._normReading && (a._normReading === q || (qNoSpace && a._normReadingNoSpace === qNoSpace))) ||
        a._normAliases.includes(q) ||
        (qNoSpace && a._normAliasesNoSpace.includes(qNoSpace))
      ) {
        a._searchTier = 1;
        a._matchedSongPreview = null;
        a._matchedSongsDisplay = null;
        a._matchedAliasHint = (a._normName !== q && a._normNameNoSpace !== qNoSpace) ? (a.reading || "") : "";
        return true;
      }

      // Tier 2: Prefix match on artist name, reading, or confirmed alias/romaji
      if (
        a._normName.startsWith(q) ||
        (qNoSpace && a._normNameNoSpace.startsWith(qNoSpace)) ||
        (a._normReading && (a._normReading.startsWith(q) || (qNoSpace && a._normReadingNoSpace.startsWith(qNoSpace)))) ||
        a._normAliases.some(al => al.startsWith(q)) ||
        (qNoSpace && a._normAliasesNoSpace.some(al => al.startsWith(qNoSpace)))
      ) {
        a._searchTier = 2;
        a._matchedSongPreview = null;
        a._matchedSongsDisplay = null;
        a._matchedAliasHint = (!a._normName.includes(q) && a.reading) ? a.reading : "";
        return true;
      }

      // Tier 3: Substring match on artist name, reading, or confirmed alias/romaji
      if (
        a._normName.includes(q) ||
        (qNoSpace && a._normNameNoSpace.includes(qNoSpace)) ||
        (a._normReading && (a._normReading.includes(q) || (qNoSpace && a._normReadingNoSpace.includes(qNoSpace)))) ||
        a._normAliases.some(al => al.includes(q)) ||
        (qNoSpace && a._normAliasesNoSpace.some(al => al.includes(qNoSpace)))
      ) {
        a._searchTier = 3;
        a._matchedSongPreview = null;
        a._matchedSongsDisplay = null;
        a._matchedAliasHint = (!a._normName.includes(q) && a.reading) ? a.reading : "";
        return true;
      }
    }

    if (mode !== "artist") {
      // Tier 4 & 5: Song title match (exact song title = Tier 4, partial song title = Tier 5)
      const sm = findMatchedSongsForArtist(a, q, qNoSpace);
      if (sm) {
        a._searchTier = sm.tier;
        a._matchedSongPreview = sm.first;
        a._matchedSongsDisplay = sm.display;
        a._matchedAliasHint = "";
        return true;
      }
    }

    a._searchTier = 99;
    a._matchedSongPreview = null;
    a._matchedSongsDisplay = null;
    a._matchedAliasHint = "";
    return false;
  }

  function compareBySelectedSort(a, b) {
    if (state.sortBy === "countDesc") {
      if (b.count !== a.count) return b.count - a.count;
      return jaCollator.compare(a.reading || a.name, b.reading || b.name);
    }
    if (state.sortBy === "countAsc") {
      if (a.count !== b.count) return a.count - b.count;
      return jaCollator.compare(a.reading || a.name, b.reading || b.name);
    }
    if (state.sortBy === "kanaAsc") {
      // Confirmed hiragana readings first in 50-on order; unconfirmed readings placed at the end in deterministic order
      const ka = a._kanaSortKey;
      const kb = b._kanaSortKey;
      if (ka && !kb) return -1;
      if (!ka && kb) return 1;
      if (ka && kb) {
        const cmp = jaCollator.compare(ka, kb);
        if (cmp !== 0) return cmp;
      }
      const nameCmp = jaCollator.compare(a.name, b.name);
      if (nameCmp !== 0) return nameCmp;
      return b.count - a.count;
    }
    if (state.sortBy === "alphaAsc") {
      // Case-insensitive A-Z order; entries with alphabet keys first, then fallback by reading/name
      if (a._hasAlphaPrefix && !b._hasAlphaPrefix) return -1;
      if (!a._hasAlphaPrefix && b._hasAlphaPrefix) return 1;
      const cmp = enCollator.compare(a._alphaSortKey, b._alphaSortKey);
      if (cmp !== 0) return cmp;
      const jaCmp = jaCollator.compare(a.name, b.name);
      if (jaCmp !== 0) return jaCmp;
      return b.count - a.count;
    }
    if (state.sortBy === "nameAsc") {
      const cmp = jaCollator.compare(a.reading || a.name, b.reading || b.name);
      if (cmp !== 0) return cmp;
      return b.count - a.count;
    }
    if (state.sortBy === "nameDesc") {
      const cmp = jaCollator.compare(b.reading || b.name, a.reading || a.name);
      if (cmp !== 0) return cmp;
      return b.count - a.count;
    }
    if (state.sortBy === "subDesc") {
      const aHas = a.sub !== null && a.sub !== undefined;
      const bHas = b.sub !== null && b.sub !== undefined;
      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;
      if (aHas && bHas && b.sub !== a.sub) return b.sub - a.sub;
      if (b.count !== a.count) return b.count - a.count;
      return jaCollator.compare(a.reading || a.name, b.reading || b.name);
    }
    if (state.sortBy === "subAsc") {
      const aHas = a.sub !== null && a.sub !== undefined;
      const bHas = b.sub !== null && b.sub !== undefined;
      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;
      if (aHas && bHas && a.sub !== b.sub) return a.sub - b.sub;
      if (b.count !== a.count) return b.count - a.count;
      return jaCollator.compare(a.reading || a.name, b.reading || b.name);
    }
    return 0;
  }

  function isCat1OnlyContext() {
    return (state.view === "cat1") || (state.view === "search" && state.searchScope === "cat1");
  }

  function getEffectiveRolesForArtist(a) {
    const rawRoles = (Array.isArray(a.roles) && a.roles.length > 0)
      ? a.roles
      : (a.role && a.role !== "判定保留" ? [a.role] : []);
    const cat1Only = isCat1OnlyContext();
    return rawRoles.map(r => {
      if (cat1Only) {
        if (r === "音楽グループ(アニゲー関連)" || r === "音楽グループ(その他)") return "音楽グループ";
        return r;
      } else {
        if (r === "音楽グループ") return a.groupSubRole || "音楽グループ(アニゲー関連)";
        return r;
      }
    });
  }

  function applyFilterAndSort() {
    const isSearch = state.view === "search";
    const q = isSearch ? normSearch(state.searchQuery) : "";
    const qNoSpace = q ? stripSpaces(q) : "";
    const kanaActive = hasKanaFilter();
    const alphaActive = hasAlphaFilter();

    if (isSearch && (state.searchTarget === "all" || state.searchTarget === "both" || state.searchTarget === "group")) {
      currentMatchedGroups = findMatchingSearchGroups(q, qNoSpace);
    } else {
      currentMatchedGroups = [];
    }

    currentFiltered = DATA.filter(a => {
      // Unit group filter (standalone unit selected from search)
      if (state.unitGroup) {
        const inUnit = (a.name === state.unitGroup) || (Array.isArray(a.memberOf) && a.memberOf.includes(state.unitGroup));
        if (!inUnit) return false;
      }
      // Agency / Content group filter
      if (state.agencyGroup) {
        if ((a.agencyGroup || a.agency || "") !== state.agencyGroup) return false;
      }
      if (state.view === "recommend") {
        if (!isRecommendedArtist(a.name)) return false;
      } else if (!isSearch && !state.agencyGroup && !state.unitGroup) {
        if (state.view === "cat1" && a.cat !== 1) return false;
        if (state.view === "cat2" && a.cat !== 2) return false;
      } else if (isSearch) {
        if (state.searchScope === "cat1" && a.cat !== 1) return false;
        if (state.searchScope === "cat2" && a.cat !== 2) return false;
      }

      // Activity Classification filter (OR within selected roles, supports effective roles per view)
      if (state.roles.length > 0) {
        const effRoles = getEffectiveRolesForArtist(a);
        const rawRoles = (Array.isArray(a.roles) && a.roles.length > 0) ? a.roles : [a.role];
        const matchesRole = effRoles.some(r => state.roles.includes(r)) ||
          rawRoles.some(r => state.roles.includes(r)) ||
          Boolean(a.groupSubRole && state.roles.includes(a.groupSubRole)) ||
          Boolean(state.roles.includes("音楽グループ") && (a.role === "音楽グループ" || a.role === "音楽グループ(アニゲー関連)" || a.role === "音楽グループ(その他)"));
        if (!matchesRole) return false;
      }

      // YouTube Subscriber Count Bucket filter (OR within selected buckets, AND with other filter groups)
      if (state.subBuckets.length > 0) {
        const bucket = a.subBucket || "unknown";
        if (!state.subBuckets.includes(bucket)) return false;
      }

      // 50-on & Alphabet index filter (supports multi-row, sub-char, multi-letter, and combined 50-on + Alphabet)
      if (kanaActive || alphaActive) {
        let matchKana = false;
        let matchAlpha = false;
        if (kanaActive) {
          if (state.kanaChar) {
            matchKana = (a.kana === state.kanaChar);
          } else {
            matchKana = Boolean(a.row && state.kanaRows.includes(a.row));
          }
        }
        if (alphaActive) {
          matchAlpha = Boolean(a.alpha && state.alphaChars.includes(a.alpha));
        }
        if (!matchKana && !matchAlpha) return false;
      }

      // Search query filter
      if (isSearch && q) {
        if (!evaluateSearchMatch(a, q, qNoSpace)) return false;
      } else {
        a._searchTier = 99;
        a._matchedSongPreview = null;
        a._matchedAliasHint = "";
      }

      return true;
    });

    // Sort: when searching with a query, prioritize exact matches (Tier 1 > Tier 2 > Tier 3 > Tier 4 > Tier 5)
    currentFiltered.sort((a, b) => {
      if (isSearch && q && a._searchTier !== b._searchTier) {
        return a._searchTier - b._searchTier;
      }
      // If both 50-on and Alphabet filters are active simultaneously, group the most-recently-operated system first
      if (kanaActive && alphaActive && (state.sortBy === "kanaAsc" || state.sortBy === "alphaAsc")) {
        const aIsAlpha = Boolean(a.alpha && state.alphaChars.includes(a.alpha));
        const bIsAlpha = Boolean(b.alpha && state.alphaChars.includes(b.alpha));
        if (aIsAlpha !== bIsAlpha) {
          if (state.sortBy === "alphaAsc") return aIsAlpha ? -1 : 1;
          return aIsAlpha ? 1 : -1;
        }
      }
      return compareBySelectedSort(a, b);
    });

    // Precalculate display rank
    let prevCount = null;
    let currentRank = 0;
    currentFiltered.forEach((a, idx) => {
      if (state.sortBy === "countDesc" && !(isSearch && q)) {
        if (a.count !== prevCount) {
          currentRank = idx + 1;
          prevCount = a.count;
        }
        a._displayRank = currentRank;
      } else {
        a._displayRank = idx + 1;
      }
    });
  }

  // Render Search Candidate Chips below Search Input
  function renderSearchCandidates() {
    const bar = document.getElementById("searchCandidatesBar");
    if (!bar) return;
    const isSearch = state.view === "search";
    const q = isSearch ? normSearch(state.searchQuery) : "";
    if (!isSearch || !q) {
      bar.style.display = "none";
      bar.innerHTML = "";
      return;
    }

    if (state.searchTarget === "song") {
      const allSongHits = currentFiltered.filter(a => a._matchedSongPreview);
      const songHits = allSongHits.slice(0, 6);
      if (songHits.length === 0) {
        bar.style.display = "none";
        bar.innerHTML = "";
        return;
      }
      const moreCount = Math.max(0, allSongHits.length - songHits.length);
      const moreNoteHTML = moreCount > 0
        ? `<span class="search-cand-more-note">＋ほか${fmtNum(moreCount)}件（下の一覧に表示）</span>`
        : "";
      bar.style.display = "flex";
      bar.innerHTML = `<span class="search-cand-label">上位候補:</span>` + songHits.map(a => {
        const isExact = a._searchTier === 4;
        return `
          <button type="button" class="search-cand-chip ${isExact ? "exact-hit" : ""}" data-cand-artist="${esc(a.name)}" title="${esc(a.name)} の詳細を表示">
            <span class="search-cand-name">♪ ${esc(a._matchedSongPreview)}</span>
            <span class="search-cand-count">${esc(a.name)}</span>
          </button>
        `;
      }).join("") + moreNoteHTML;
      return;
    }

    const allGroupHits = (state.searchTarget === "all" || state.searchTarget === "group")
      ? currentMatchedGroups
      : [];
    const allArtistHits = state.searchTarget === "group"
      ? []
      : currentFiltered.filter(a => a._searchTier <= 3);
    const allSongHits = state.searchTarget === "all"
      ? currentFiltered.filter(a => a._matchedSongPreview)
      : [];

    const groupHits = allGroupHits.slice(0, state.searchTarget === "group" ? 6 : 3);
    const artistHits = allArtistHits.slice(0, state.searchTarget === "all" ? 4 : 6);
    const songHits = allSongHits.slice(0, 4);

    if (groupHits.length === 0 && artistHits.length === 0 && songHits.length === 0) {
      bar.style.display = "none";
      bar.innerHTML = "";
      return;
    }

    const totalHidden =
      Math.max(0, allGroupHits.length - groupHits.length) +
      Math.max(0, allArtistHits.length - artistHits.length) +
      Math.max(0, allSongHits.length - songHits.length);
    const moreNoteHTML = totalHidden > 0
      ? `<span class="search-cand-more-note">＋ほか${fmtNum(totalHidden)}件（下の一覧に表示）</span>`
      : "";

    const groupChipsHTML = groupHits.map(g => `
      <button type="button" class="search-cand-chip exact-hit" data-cand-group-type="${esc(g.type)}" data-cand-group-name="${esc(g.name)}" title="グループ「${esc(g.name)}」で絞り込む">
        <span>${esc(g.name)}</span>
        <span class="search-cand-count">${fmtNum(g.count)}名義</span>
      </button>
    `).join("");

    const artistChipsHTML = artistHits.map(a => {
      const isExact = a._searchTier === 1;
      const mono = esc(getMonogram(a.name));
      const grad = getAvatarGradient(a.name);
      const dotContent = a.img
        ? `<img src="${esc(optimizeAvatarUrl(a.img, 48))}" alt="" width="18" height="18" loading="eager" decoding="async" referrerpolicy="no-referrer" onerror="this.style.display='none'">`
        : `<span style="background:${grad};width:100%;height:100%;display:flex;align-items:center;justify-content:center;">${mono[0] || "♪"}</span>`;
      return `
        <button type="button" class="search-cand-chip ${isExact ? "exact-hit" : ""}" data-cand-artist="${esc(a.name)}" title="${esc(a.name)} の詳細を表示">
          <span class="search-cand-dot">${dotContent}</span>
          <span>${esc(a.name)}</span>
          <span class="search-cand-count">${fmtNum(a.count)}曲</span>
        </button>
      `;
    }).join("");

    const songChipsHTML = songHits.map(a => {
      const isExact = a._searchTier === 4;
      return `
        <button type="button" class="search-cand-chip ${isExact ? "exact-hit" : ""}" data-cand-artist="${esc(a.name)}" title="一致楽曲: ${esc(a._matchedSongPreview)}（${esc(a.name)}）">
          <span class="search-cand-name">♪ ${esc(a._matchedSongPreview)}</span>
          <span class="search-cand-count">${esc(a.name)}</span>
        </button>
      `;
    }).join("");

    bar.style.display = "flex";
    bar.innerHTML = `<span class="search-cand-label">上位候補:</span>` + groupChipsHTML + artistChipsHTML + songChipsHTML + moreNoteHTML;
  }

  // Update Header Stats & Navigation Badges (PC & Mobile Stat Cards dynamically populated)
  function renderStaticStats() {
    document.getElementById("statTotal").textContent = fmtNum(countTotal);
    document.getElementById("statCat1").textContent = fmtNum(countCat1);
    document.getElementById("statCat2").textContent = fmtNum(countCat2);
    document.getElementById("mobStatTotal").textContent = fmtNum(countTotal);
    document.getElementById("mobStatCat1").textContent = fmtNum(countCat1);
    document.getElementById("mobStatCat2").textContent = fmtNum(countCat2);
    const navAll = document.getElementById("navBadgeAll");
    if (navAll) navAll.textContent = fmtNum(countTotal);
    document.getElementById("navBadgeCat1").textContent = fmtNum(countCat1);
    document.getElementById("navBadgeCat2").textContent = fmtNum(countCat2);
    const recCnt = fmtNum(getRecommendedCount());
    const navRec = document.getElementById("navBadgeRecommend");
    if (navRec) navRec.textContent = recCnt;
    const statRec = document.getElementById("statRecommend");
    if (statRec) statRec.textContent = recCnt;
    const mobStatRec = document.getElementById("mobStatRecommend");
    if (mobStatRec) mobStatRec.textContent = recCnt;
    const scAll = document.getElementById("scopeCntAll");
    if (scAll) scAll.textContent = fmtNum(countTotal);
    const scCat1 = document.getElementById("scopeCntCat1");
    if (scCat1) scCat1.textContent = fmtNum(countCat1);
    const scCat2 = document.getElementById("scopeCntCat2");
    if (scCat2) scCat2.textContent = fmtNum(countCat2);

  }

  // Render Filter Controls (Activity Roles, YouTube Subscribers, 50-on, Alphabet) into both PC drawer & Mobile sheet
  // Item 3: Heading labels simplified to "活動形態" and "YouTubeチャンネル登録者数" without "（複数選択可）"
  function buildFilterControlsHTML() {
    const rows = ["あ", "か", "さ", "た", "な", "は", "ま", "や", "ら", "わ"];
    const singleRow = state.kanaRows.length === 1 ? state.kanaRows[0] : "";
    const subChars = singleRow ? (KANA_ROW_CHARS[singleRow] || []) : [];

    return `
      <div class="filter-grid">
        <div>
          <div class="filter-group-title">
            <span>活動形態</span>
            ${state.roles.length ? `<button type="button" class="clear-all-chips-btn" data-clear-roles="1">解除</button>` : ""}
          </div>
          <div class="preset-pills">
            ${(() => {
              const isCat1Only = (state.view === "cat1") || (state.view === "search" && state.searchScope === "cat1");
              const isCat2Only = (state.view === "cat2") || (state.view === "search" && state.searchScope === "cat2");
              let rolesToShow;
              if (isCat1Only) {
                rolesToShow = ["Vsinger", "Vtuber", "歌い手", "声優", "キャラ", "歌手", "音楽グループ"];
              } else if (isCat2Only) {
                rolesToShow = ["Vtuber", "Vsinger", "歌手", "声優", "キャラ", "音楽グループ(アニゲー関連)", "音楽グループ(その他)"];
                if (state.roles.includes("歌い手")) rolesToShow.unshift("歌い手");
              } else {
                rolesToShow = ["Vsinger", "Vtuber", "歌い手", "声優", "キャラ", "歌手", "音楽グループ(アニゲー関連)", "音楽グループ(その他)"];
              }
              return rolesToShow.map(role => {
                const isAct = state.roles.includes(role);
                const mobRoleLabel = role.startsWith("音楽グループ(") ? role.replace(/^音楽/, "") : role;
                const labelHTML = (mobRoleLabel !== role)
                  ? `<span class="tab-label-pc">${esc(role)}</span><span class="tab-label-mob">${esc(mobRoleLabel)}</span>`
                  : esc(role);
                return `<button type="button" class="pill-btn ${isAct ? "active" : ""}" data-filter-role="${esc(role)}" aria-pressed="${isAct}">${labelHTML}</button>`;
              }).join("");
            })()}
          </div>
        </div>

        <div>
          <div class="filter-group-title">
            <span>五十音</span>
            ${hasKanaFilter() ? `<button type="button" class="clear-all-chips-btn" data-clear-kana="1">解除</button>` : ""}
          </div>
          <div class="index-pills">
            ${rows.map(r => {
              const isAct = state.kanaRows.includes(r);
              return `<button type="button" class="pill-btn ${isAct ? "active" : ""}" data-kana-row="${r}" aria-pressed="${isAct}">${r}行</button>`;
            }).join("")}
          </div>
          ${subChars.length ? `
            <div class="sub-kana-row">
              <div class="sub-kana-top">
                <span class="sub-kana-label">${singleRow}行の文字:</span>
                <button type="button" class="pill-btn ${!state.kanaChar ? "active" : ""}" data-kana-char="">${singleRow}行すべて</button>
              </div>
              <div class="sub-kana-chars">
                ${subChars.map(c => `<button type="button" class="pill-btn ${state.kanaChar === c ? "active" : ""}" data-kana-char="${c}">${c}</button>`).join("")}
              </div>
            </div>
          ` : ""}
        </div>

        <div>
          <div class="filter-group-title">
            <span>アルファベット (A–Z)</span>
            ${hasAlphaFilter() ? `<button type="button" class="clear-all-chips-btn" data-clear-alpha="1">解除</button>` : ""}
          </div>
          <div class="index-pills">
            ${ALPHABET.map(ch => {
              const isAct = state.alphaChars.includes(ch);
              return `<button type="button" class="pill-btn ${isAct ? "active" : ""}" data-alpha-char="${ch}" aria-pressed="${isAct}">${ch}</button>`;
            }).join("")}
          </div>
        </div>

        <div class="pc-only-filter-group filter-agency-wide">
          <div class="filter-group-title">
            <span>所属（事務所・作品）</span>
            ${state.agencyGroup ? `<button type="button" class="clear-all-chips-btn" data-clear-agency="1">解除</button>` : ""}
          </div>
          <div class="preset-pills">
            ${CLICKABLE_AGENCY_GROUPS.map(ag => {
              const isAct = state.agencyGroup === ag.name;
              return `<button type="button" class="pill-btn ${isAct ? "active" : ""}" data-filter-agency-pill="${esc(ag.name)}" aria-pressed="${isAct}">${esc(ag.name)}<span class="ag-pill-cnt">(${ag.count})</span></button>`;
            }).join("")}
          </div>
        </div>
      </div>
    `;
  }

  function renderActiveFilterChips() {
    const chips = [];
    if (state.agencyGroup) {
      chips.push({ key: "agencyGroup", label: `所属: ${state.agencyGroup}` });
    }
    if (state.unitGroup) {
      chips.push({ key: "unitGroup", label: `ユニット: ${state.unitGroup}` });
    }
    state.roles.forEach(role => {
      chips.push({ key: `role:${role}`, label: `活動形態: ${role}` });
    });
    if (state.kanaChar) {
      chips.push({ key: "kanaChar", label: `頭文字: 「${state.kanaChar}」` });
    } else {
      state.kanaRows.forEach(r => {
        chips.push({ key: `kanaRow:${r}`, label: `五十音: ${r}行` });
      });
    }
    state.alphaChars.forEach(ch => {
      chips.push({ key: `alpha:${ch}`, label: `英字: ${ch}` });
    });

    const container = document.getElementById("activeChipsContainer");
    const filterBtn = document.getElementById("pcFilterToggleBtn");

    const hasFilters = chips.length > 0;
    filterBtn.classList.toggle("has-filters", hasFilters);
    filterBtn.classList.toggle("open", state.pcFilterOpen || state.mobFilterOpen);

    if (!hasFilters) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = chips.map(c => `
      <span class="filter-chip">
        <span>${esc(c.label)}</span>
        <button type="button" class="chip-remove-btn" data-remove-chip="${esc(c.key)}" title="この条件を解除" aria-label="${esc(c.label)}を解除">×</button>
      </span>
    `).join("") + `<button type="button" class="clear-all-chips-btn" data-remove-chip="all">× すべて解除</button>`;
  }

  // Format YouTube subscriber count in readable Japanese (e.g. 134万人, 5.15万人, 4,560人, 未取得)
  function formatSubscribersJP(sub) {
    if (sub === null || sub === undefined || Number.isNaN(Number(sub))) {
      return "未取得";
    }
    const n = Number(sub);
    if (n >= 10000) {
      const man = n / 10000;
      const formatted = Number.isInteger(man)
        ? String(man)
        : man.toFixed(2).replace(/\.?0+$/, "");
      return `${formatted}万人`;
    }
    return `${fmtNum(n)}人`;
  }

  function formatArtistNameHTML(rawName, forSongSubtitle = false) {
    const s = String(rawName || "");
    if (s === "神崎エルザ (ガンゲイル・オンライン)") {
      if (forSongSubtitle) {
        return `<span class="name-pc-only">${esc(s)}</span><span class="name-mob-only">神崎エルザ(GGO)</span>`;
      }
      return `<span class="name-pc-only">${esc(s)}</span><span class="name-mob-only">神崎エルザ<br class="mob-paren-br">(GGO)</span>`;
    }
    const m = s.match(/^([^\(（]+?)(\s*)([\(（].*)$/);
    if (m && m[1]) {
      const basePart = esc(m[1]);
      const spacePart = m[2] ? `<span class="pc-paren-space">${esc(m[2])}</span>` : "";
      const parenPart = esc(m[3]);
      if (forSongSubtitle) {
        return `${basePart}${spacePart}<span class="mob-paren-chunk">${parenPart}</span>`;
      }
      return `${basePart}${spacePart}<br class="mob-paren-br"><span class="mob-paren-chunk">${parenPart}</span>`;
    }
    return esc(s);
  }

  // Build a single Artist Row HTML string (PC: 6 columns / Smartphone: 4 columns)
  function buildArtistRowHTML(a, isSearch, rowIndex = 999, hideRankNumber = false) {
    const isSelected = state.selectedArtistName === a.name;
    const isFav = isRecommendedArtist(a.name);
    const favHeartHTML = isFav ? `<span class="artist-fav-heart" title="かるのオススメ" aria-label="かるのオススメ"><svg class="heart-soft-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20.6c-.35 0-.7-.12-1-.35C7.1 17.2 2 12.8 2 7.8 2 4.5 4.6 2 7.9 2c1.75 0 3.25.8 4.1 2.05C12.85 2.8 14.35 2 16.1 2 19.4 2 22 4.5 22 7.8c0 5-5.1 9.4-9 12.45-.3.23-.65.35-1 .35Z"/></svg></span>` : "";
    const rankClass = (!hideRankNumber && state.sortBy === "countDesc" && !isSearch && a._displayRank <= 3) ? `top-${a._displayRank}` : "";
    const isSongSearchMode = isSearch && (state.searchTarget === "song" || state.searchTarget === "all") && Boolean(a._matchedSongPreview);
    const songDisplayStr = a._matchedSongsDisplay || a._matchedSongPreview || "";
    let nameWrapInner = "";

    if (isSongSearchMode) {
      nameWrapInner = `
        <div class="row-song-primary">♪ ${esc(songDisplayStr)}</div>
        <div class="row-name row-name-with-song"><span class="row-artist-prefix">アーティスト:</span>${formatArtistNameHTML(a.name, true)}${favHeartHTML}</div>
      `;
    } else {
      let matchSub = "";
      if (isSearch) {
        if (a._matchedSongPreview) {
          matchSub = `<div class="row-match-sub row-match-song-both">♪ 一致楽曲: ${esc(songDisplayStr)}</div>`;
        } else if (a._matchedAliasHint) {
          matchSub = `<div class="row-match-sub row-match-kana">よみがな: ${esc(a._matchedAliasHint)}</div>`;
        }
      }
      nameWrapInner = `
        <div class="row-name">${formatArtistNameHTML(a.name, false)}${favHeartHTML}</div>
        ${matchSub}
      `;
    }

    const isUnclassified = !a.role || a.role === "判定保留";
    const effRoles = getEffectiveRolesForArtist(a);
    const rowRoles = effRoles.length > 0 ? effRoles : [isUnclassified ? "未分類" : a.role];
    const rowRoleBadgesHTML = rowRoles
      .map(r => `<span class="row-role-badge ${isUnclassified ? "unclassified" : ""}">${esc(r)}</span>`)
      .join("");
  const AGENCY_SHORT_LABELS = {
    "アイドルマスターシリーズ": "アイマス",
    "ラブライブ！シリーズ": "ラブライブ！",
    "神椿スタジオ": "神椿",
    "BanG Dream!": "バンドリ",
    "ウマ娘 プリティーダービー": "ウマ娘",
    "Tokyo 7th シスターズ": "ナナシス",
    "ガールズバンドクライ": "ガルク",
    "プロジェクトセカイ カラフルステージ！ feat. 初音ミク": "プロセカ",
    "青春ブタ野郎シリーズ": "青ブタ",
    "アイカツ！シリーズ": "アイカツ",
    "少女☆歌劇 レヴュースタァライト": "スタァライト",
    "INCS toenter (インクストゥエンター)": "INCS toenter",
    "ソードアート・オンライン": "SAO",
    "プリンセスコネクト！Re:Dive": "プリコネ",
    "ブルーアーカイブ -Blue Archive-": "ブルアカ",
    "ヘブンバーンズレッド": "ヘブバン",
    "ライヴラリ (ゆにクリエイト)": "ライヴラリ",
    "陰の実力者になりたくて！": "陰実",
    "告白実行委員会 (HoneyWorks)": "告白実行委員会"
  };

  function getShortAgencyLabel(rawAgency) {
    if (!rawAgency) return "";
    return AGENCY_SHORT_LABELS[rawAgency] || rawAgency;
  }

    const hasSub = a.sub !== null && a.sub !== undefined;
    const subLabel = formatSubscribersJP(a.sub);
    const subTitle = hasSub
      ? `YouTube公式チャンネル公開登録者数（${a.subDate || "2026-10-27"}取得）`
      : "YouTube公式チャンネル登録者数：未取得";

    const rawAgency = (a.agencyGroup || a.agency || "").trim();
    const shortAgency = getShortAgencyLabel(rawAgency);
    const agencyCellHTML = shortAgency
      ? `<span class="row-agency-badge" title="所属（事務所・作品）：${esc(rawAgency)}">${esc(shortAgency)}</span>`
      : `<span class="row-agency-empty">—</span>`;

    return `
      <div class="artist-row ${isSelected ? "selected" : ""}" data-artist-name="${esc(a.name)}" role="button" tabindex="0">
        <div class="row-rank ${hideRankNumber ? "row-rank-blank" : rankClass}">${hideRankNumber ? "" : a._displayRank}</div>
        <div class="row-avatar-wrap">${renderAvatarHTML(a, false, rowIndex)}</div>
        <div class="row-name-wrap">
          ${nameWrapInner}
        </div>
        <div class="row-role col-pc-only">
          ${rowRoleBadgesHTML}
        </div>
        <div class="row-agency col-pc-only col-agency-wide">
          ${agencyCellHTML}
        </div>
        <div class="row-subs col-pc-only ${hasSub ? "" : "unacquired"}" title="${esc(subTitle)}">${esc(subLabel)}</div>
        <div class="row-count">${fmtNum(a.count)}<span>曲</span></div>
      </div>
    `;
  }

  // Render Artist Rows (Initial / Reset render)
  function buildSearchGroupsSectionHTML(groups) {
    if (!groups || groups.length === 0) return "";
    const isGroupOnly = state.searchTarget === "group";
    const shown = isGroupOnly ? groups : groups.slice(0, 16);
    return `
      <div class="search-groups-section">
        <div class="search-groups-heading">
          <span>一致したグループ（所属・ユニット）：${fmtNum(groups.length)}件（クリックで絞り込み）</span>
        </div>
        <div class="search-groups-grid">
          ${shown.map(g => `
            <button type="button" class="search-group-card" data-select-search-group="${esc(g.name)}" data-select-search-group-type="${esc(g.type)}" title="「${esc(g.name)}」で絞り込む">
              <span class="search-group-name">${esc(g.name)}</span>
              <span class="search-group-count">${fmtNum(g.count)}名義</span>
            </button>
          `).join("")}
        </div>
      </div>
    `;
  }

  function renderArtistList(resetScroll = false) {
    const listEl = document.getElementById("artistListContainer");
    const totalEl = document.getElementById("resultSummaryText");
    const mobColCountEl = document.getElementById("mobCollectionCount");
    const scrollEl = document.getElementById("centerScrollArea");

    const isGroupSearchOnly = state.view === "search" && state.searchTarget === "group";
    if (isGroupSearchOnly) {
      totalEl.innerHTML = `表示中: <strong>${fmtNum(currentMatchedGroups.length)}</strong> グループ`;
    } else {
      totalEl.innerHTML = `表示中: <strong>${fmtNum(currentFiltered.length)}</strong> 名義`;
    }
    if (mobColCountEl) {
      mobColCountEl.textContent = `${fmtNum(currentFiltered.length)} 名義`;
    }

    renderSearchCandidates();

    if (resetScroll) {
      state.renderLimit = 100;
      scrollEl.scrollTop = 0;
    }

    const groupsHTML = (state.view === "search" && currentMatchedGroups.length > 0)
      ? buildSearchGroupsSectionHTML(currentMatchedGroups)
      : "";

    if (isGroupSearchOnly) {
      if (currentMatchedGroups.length === 0) {
        listEl.innerHTML = `
          <div class="empty-list-state">
            <h3>条件に一致するグループ（所属・ユニット）が見つかりません</h3>
            <p>別の所属（事務所・作品）名やユニット名でお試しください。</p>
          </div>
        `;
      } else {
        listEl.innerHTML = groupsHTML;
      }
      return;
    }

    if (state.view === "recommend") {
      if (currentFiltered.length === 0) {
        listEl.innerHTML = `
          <div class="empty-list-state">
            <h3>「かるのオススメ」に設定されたアーティストがまだありません</h3>
            <p>お気に入りのアーティストを設定すると、ここに活動形態別で一覧表示されます。</p>
          </div>
        `;
        return;
      }
      const roleOrder = [
        "Vsinger",
        "Vtuber",
        "歌い手",
        "歌手",
        "声優",
        "キャラ",
        "音楽グループ(アニゲー関連)",
        "音楽グループ(その他)"
      ];
      const buckets = new Map();
      roleOrder.forEach(r => buckets.set(r, []));
      currentFiltered.forEach(a => {
        let primaryRole = a.role || "その他";
        if (primaryRole === "音楽グループ") {
          primaryRole = a.groupSubRole || "音楽グループ(アニゲー関連)";
        }
        if (!buckets.has(primaryRole)) {
          buckets.set(primaryRole, []);
        }
        buckets.get(primaryRole).push(a);
      });
      let globalIdx = 0;
      let sectionsHTML = "";
      buckets.forEach((groupList, roleName) => {
        if (!groupList || groupList.length === 0) return;
        const rowsHTML = groupList.map(a => {
          const htmlRow = buildArtistRowHTML(a, false, globalIdx, true);
          globalIdx++;
          return htmlRow;
        }).join("");
        sectionsHTML += `
          <div class="recommend-role-section">
            <div class="recommend-role-group-header">
              <span class="recommend-role-dot" aria-hidden="true"></span>
              <span class="recommend-role-title">${esc(roleName)}</span>
              <span class="recommend-role-count">${fmtNum(groupList.length)} 名義</span>
            </div>
            ${rowsHTML}
          </div>
        `;
      });
      listEl.innerHTML = sectionsHTML;
      scheduleLookaheadAvatarPreload(12, 40);
      return;
    }

    if (currentFiltered.length === 0 && !groupsHTML) {
      listEl.innerHTML = `
        <div class="empty-list-state">
          <h3>条件に一致するアーティストが見つかりません</h3>
          <p>検索キーワードや絞り込み条件（活動形態・五十音・英字・所属）を変更してお試しください。</p>
        </div>
      `;
      return;
    }

    const slice = currentFiltered.slice(0, state.renderLimit);
    const isSearch = state.view === "search" && state.searchQuery.trim() !== "";
    listEl.innerHTML = groupsHTML + slice.map((a, idx) => buildArtistRowHTML(a, isSearch, idx)).join("");
    scheduleLookaheadAvatarPreload(12, 40);
  }

  // Append additional artist rows on scroll using DocumentFragment (Zero existing DOM destruction)
  function appendArtistRows(prevLimit, newLimit) {
    const listEl = document.getElementById("artistListContainer");
    if (!listEl) return;
    const slice = currentFiltered.slice(prevLimit, newLimit);
    if (slice.length === 0) return;
    const isSearch = state.view === "search" && state.searchQuery.trim() !== "";
    const temp = document.createElement("div");
    temp.innerHTML = slice.map((a, idx) => buildArtistRowHTML(a, isSearch, prevLimit + idx)).join("");
    const frag = document.createDocumentFragment();
    while (temp.firstElementChild) {
      frag.appendChild(temp.firstElementChild);
    }
    listEl.appendChild(frag);
    scheduleLookaheadAvatarPreload(prevLimit, 40);
  }

  // Update selected row class in-place without re-rendering list (Preserves 100% scroll & images)
  function updateSelectedRowHighlight() {
    const listEl = document.getElementById("artistListContainer");
    if (!listEl) return;
    const prevSelected = listEl.querySelectorAll(".artist-row.selected");
    prevSelected.forEach(row => {
      if (row.getAttribute("data-artist-name") !== state.selectedArtistName) {
        row.classList.remove("selected");
      }
    });
    if (state.selectedArtistName) {
      const rows = listEl.querySelectorAll(".artist-row");
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].getAttribute("data-artist-name") === state.selectedArtistName) {
          rows[i].classList.add("selected");
          break;
        }
      }
    }
  }

  // Lock/Unlock background scroll on mobile when bottom sheet is open
  function syncMobileScrollLock() {
    const scrollEl = document.getElementById("centerScrollArea");
    if (!scrollEl) return;
    const isMobile = window.innerWidth <= 900;
    const isSheetOpen = isMobile && (Boolean(state.selectedArtistName) || state.mobFilterOpen);
    scrollEl.classList.toggle("scroll-locked", isSheetOpen);
  }

  // Render Artist Detail Panel (Representative Songs TOP 5 with (cover) & YouTube links + Toggle to かるが聴いてる曲)
  function renderDetailPanel(resetDetailScroll = false) {
    const shell = document.getElementById("appShell");
    const rightPanel = document.getElementById("rightDetailPanel");
    const backdrop = document.getElementById("sheetBackdrop");
    const contentEl = document.getElementById("detailScrollContent");
    const topTitleEl = document.getElementById("detailTopBarTitle");

    const artist = state.selectedArtistName ? ARTIST_MAP.get(state.selectedArtistName) : null;
    if (!artist) {
      shell.classList.add("detail-closed");
      rightPanel.classList.remove("mobile-open");
      if (!state.mobFilterOpen) backdrop.classList.remove("visible");
      syncMobileScrollLock();
      return;
    }

    // Clear any previous image immediately before painting new artist to prevent image flash
    const oldImg = contentEl.querySelector(".detail-avatar-wrap img");
    if (oldImg && oldImg.getAttribute("alt") !== artist.name) {
      oldImg.src = "";
      oldImg.style.display = "none";
    }

    shell.classList.remove("detail-closed");
    if (window.innerWidth <= 900) {
      rightPanel.classList.add("mobile-open");
      backdrop.classList.add("visible");
    }
    syncMobileScrollLock();

    topTitleEl.textContent = (window.innerWidth <= 900 && artist.name === "神崎エルザ (ガンゲイル・オンライン)") ? "神崎エルザ(GGO)" : artist.name;

    const rawSongs = artist.songs || [];
    const topSongs = artist.topSongs || [];
    const topTypes = artist.topTypes || [];
    const topLinks = artist.topLinks || [];
    let displaySongs = rawSongs.map((t, idx) => ({ title: t, regIdx: idx + 1 }));
    if (state.songSort === "titleAsc") {
      displaySongs.sort((x, y) => jaCollator.compare(x.title, y.title));
    }

    const q = state.view === "search" ? normSearch(state.searchQuery) : "";
    const catLabel = artist.cat === 1 ? "カバーあり" : "カバーなし";
    const catClass = artist.cat === 1 ? "cat-1" : "cat-2";
    const detailRoles = getEffectiveRolesForArtist(artist);
    const roleBadgeHTML = detailRoles
      .map(r => `<span class="detail-role-badge static-role-badge">${esc(r)}</span>`)
      .join("");
    const hasArchiveSongs = (artist.count || 0) >= 1 && rawSongs.length >= 1;
    if (!hasArchiveSongs && state.detailMode === "archive") {
      state.detailMode = "top5";
    }
    const isTop5Mode = state.detailMode === "top5";

    const subMetaParts = [];
    if (artist.vocal) {
      const vParts = Array.isArray(artist.vocalParts) && artist.vocalParts.length > 0
        ? artist.vocalParts.map(pt => {
            if (pt.target && ARTIST_MAP.has(pt.target)) {
              return `<button type="button" class="vocal-artist-link" data-open-artist="${esc(pt.target)}" title="${esc(pt.target)}のアーティスト詳細を開く">${esc(pt.text)}</button>`;
            }
            return `<span>${esc(pt.text)}</span>`;
          }).join("")
        : esc(artist.vocal);
      subMetaParts.push(`<span class="detail-vocal-badge">（ボーカル：${vParts}）</span>`);
    }
    if (Array.isArray(artist.memberOf) && artist.memberOf.length > 0) {
      const grpLinks = artist.memberOf
        .filter(gName => ARTIST_MAP.has(gName))
        .map(gName => `<button type="button" class="vocal-artist-link" data-open-artist="${esc(gName)}" title="${esc(gName)}のアーティスト詳細を開く">${esc(gName)}</button>`)
        .join("<span>・</span>");
      if (grpLinks) {
        subMetaParts.push(`<span class="detail-vocal-badge detail-memberof-badge">（参加ユニット：${grpLinks}）</span>`);
      }
    }
    if (artist.agency) {
      const agGroup = artist.agencyGroup || artist.agency;
      const isAgActive = state.agencyGroup === agGroup;
      const canFilterAg = Boolean(artist.agencyClickable && (artist.agencyGroupCount || 0) >= 2);
      if (canFilterAg) {
        subMetaParts.push(`<button type="button" class="detail-agency-badge interactive-agency-btn ${isAgActive ? "active-agency" : ""}" data-filter-agency="${esc(agGroup)}" title="「${esc(agGroup)}」のランキング（${artist.agencyGroupCount}名義）を表示">所属：${esc(artist.agency)}</button>`);
      } else {
        subMetaParts.push(`<span class="detail-agency-badge static-agency-badge">所属：${esc(artist.agency)}</span>`);
      }
    }
    const subMetaRowHTML = subMetaParts.length > 0
      ? `<div class="detail-submeta-row">${subMetaParts.join("")}</div>`
      : "";

    const repHeadingLabel = (topSongs.length > 0 && topSongs.length < 5)
      ? `代表曲（${topSongs.length}曲）`
      : "代表曲 TOP 5";
    const modeTabsHTML = `
      <div class="detail-mode-tabs" role="tablist" aria-label="表示楽曲の切り替え">
        <button type="button" class="detail-mode-tab ${isTop5Mode ? "active" : ""}" data-detail-mode="top5" role="tab" aria-selected="${isTop5Mode}">
          ${repHeadingLabel}
        </button>
        ${hasArchiveSongs ? `
        <button type="button" class="detail-mode-tab ${!isTop5Mode ? "active" : ""}" data-detail-mode="archive" role="tab" aria-selected="${!isTop5Mode}">
          かるが聴いてる曲 (${fmtNum(artist.count)})
        </button>
        ` : ""}
      </div>
    `;

    let bodySectionHTML = "";
    if (isTop5Mode) {
      bodySectionHTML = `
        <div class="top5-section-box">
          <div class="top5-header-row">
            <div class="top5-title-wrap">
              <span class="top5-badge-dot"></span>
              <h3 class="top5-heading">${repHeadingLabel}</h3>
            </div>
          </div>
          ${topSongs.length === 0 ? `
            <div class="empty-songs-box">
              代表曲データは未確認です
            </div>
          ` : `
            <div class="detail-song-list">
              ${topSongs.slice(0, 5).map((songTitle, idx) => {
                const sType = topTypes[idx] || "unconfirmed";
                const dispTitle = formatTop5SongTitle(songTitle, sType);
                const videoId = topLinks[idx] || "";
                if (videoId) {
                  const ytUrl = videoId.startsWith("http")
                    ? videoId
                    : `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
                  return `
                    <div class="top5-song-item has-yt-link">
                      <span class="top5-rank-num">${idx + 1}</span>
                      <a class="top5-song-link" href="${esc(ytUrl)}" target="_blank" rel="noopener noreferrer" title="YouTube公式動画を開く: ${esc(dispTitle)}">
                        <span class="song-name">${esc(dispTitle)}</span>
                        <span class="yt-link-badge" aria-hidden="true">
                          <svg class="yt-ext-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/></svg>
                        </span>
                      </a>
                    </div>
                  `;
                }
                return `
                  <div class="top5-song-item">
                    <span class="top5-rank-num">${idx + 1}</span>
                    <span class="song-name">${esc(dispTitle)}</span>
                  </div>
                `;
              }).join("")}
            </div>
          `}
        </div>


      `;
    } else {
      bodySectionHTML = `
        <button type="button" class="back-to-top5-btn" data-detail-mode="top5">
          <span>← ${repHeadingLabel} に戻る</span>
        </button>

        <div class="detail-actions-row">
          <div class="detail-section-heading">かるが聴いてる曲（${fmtNum(artist.count)}曲）</div>
          <div style="display:flex;align-items:center;gap:6px;">
            <div class="song-sort-toggle" role="group" aria-label="楽曲の並び替え">
              <button type="button" class="song-sort-btn ${state.songSort === "titleAsc" ? "active" : ""}" data-song-sort="titleAsc">曲名順</button>
              <button type="button" class="song-sort-btn ${state.songSort === "regAsc" ? "active" : ""}" data-song-sort="regAsc">登録順</button>
            </div>
          </div>
        </div>

        ${displaySongs.length === 0 ? `
          <div class="empty-songs-box">
            登録されている楽曲データはありません（0曲）
          </div>
        ` : `
          <div class="detail-song-list">
            ${displaySongs.map((s, i) => {
              const isMatch = q && normSearch(s.title).includes(q);
              return `
                <div class="detail-song-item ${isMatch ? "highlight-match" : ""}">
                  <span class="song-idx">${i + 1}</span>
                  <span class="song-name">${esc(s.title)}</span>
                </div>
              `;
            }).join("")}
          </div>
        `}
      `;
    }

    contentEl.innerHTML = `
      <div class="detail-hero">
        <div class="detail-avatar-wrap">
          ${renderAvatarHTML(artist, true)}
        </div>
        <h2 class="detail-artist-name">${artist.name === "神崎エルザ (ガンゲイル・オンライン)" ? `<span class="name-pc-only">${esc(artist.name)}</span><span class="name-mob-only">神崎エルザ(GGO)</span>` : esc(artist.name)}${isRecommendedArtist(artist.name) ? `<span class="detail-fav-heart" title="かるのオススメ" aria-label="かるのオススメ"><svg class="heart-soft-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20.6c-.35 0-.7-.12-1-.35C7.1 17.2 2 12.8 2 7.8 2 4.5 4.6 2 7.9 2c1.75 0 3.25.8 4.1 2.05C12.85 2.8 14.35 2 16.1 2 19.4 2 22 4.5 22 7.8c0 5-5.1 9.4-9 12.45-.3.23-.65.35-1 .35Z"/></svg></span>` : ""}</h2>
        <div class="detail-meta-row">
          ${roleBadgeHTML}
        </div>
        ${subMetaRowHTML}
        ${artist.ytChannelUrl ? `
        <div class="detail-yt-channel-row">
          <a class="detail-yt-channel-btn yt-type-${esc(artist.ytChannelType || "official")}" href="${esc(artist.ytChannelUrl)}" target="_blank" rel="noopener noreferrer" title="${esc(artist.name)} の ${esc(artist.ytChannelLabel || "YouTubeチャンネル")} を新しいタブで開く">
            <svg class="detail-yt-channel-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/></svg>
            <span>${esc(artist.ytChannelLabel || "YouTubeチャンネル →")}</span>
          </a>
        </div>
        ` : ""}
      </div>
      ${modeTabsHTML}
      ${bodySectionHTML}
      ${artist.profileBio ? `
      <div class="detail-profile-bio-box">
        <div class="detail-profile-bio-header">
          <span class="top5-badge-dot"></span>
          <h3 class="detail-profile-bio-heading">プロフィール</h3>
        </div>
        <p class="detail-profile-bio-text">${esc(artist.profileBio)}</p>
      </div>
      ` : ""}
    `;

    if (resetDetailScroll) {
      contentEl.scrollTop = 0;
    }
  }

  // Sync full UI with state
  function updateUI(resetScroll = false) {
    applyFilterAndSort();

    // Update desktop nav buttons & mobile bottom nav buttons
    document.querySelectorAll("[data-nav-view]").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-nav-view") === state.view);
    });

    // Normalize music group role filters when switching between cat1 ("音楽グループ") and all/cat2 ("音楽グループ(アニゲー関連)" / "音楽グループ(その他)")
    if (isCat1OnlyContext()) {
      const hadSubGrp = state.roles.some(r => r === "音楽グループ(アニゲー関連)" || r === "音楽グループ(その他)");
      if (hadSubGrp) {
        state.roles = Array.from(new Set(state.roles.map(r => (r === "音楽グループ(アニゲー関連)" || r === "音楽グループ(その他)") ? "音楽グループ" : r)));
      }
    } else {
      if (state.roles.includes("音楽グループ")) {
        state.roles = Array.from(new Set(state.roles.flatMap(r => r === "音楽グループ" ? ["音楽グループ(アニゲー関連)", "音楽グループ(その他)"] : [r])));
      }
    }

    // Highlight Home button when in clean initial state
    const isInitialDefault = (
      state.view === "all" &&
      !state.agencyGroup &&
      !state.unitGroup &&
      !state.searchQuery &&
      state.roles.length === 0 &&
      !hasAnyIndexFilter() &&
      state.sortBy === "countDesc"
    );
    const pcHomeBtn = document.getElementById("pcHomeBtn");
    if (pcHomeBtn) {
      pcHomeBtn.classList.toggle("is-home-default", isInitialDefault);
    }

    // Update hero, mobile stat cards, mobile collection header vs search header visibility
    const heroEl = document.getElementById("heroHeaderSection");
    const mobStatsEl = document.getElementById("mobileStatsGrid");
    const mobColHeaderEl = document.getElementById("mobileCollectionHeader");
    const searchHeaderEl = document.getElementById("searchHeaderSection");

    if (state.view === "search") {
      heroEl.style.display = "none";
      mobStatsEl.style.display = "none";
      mobColHeaderEl.style.display = "none";
      searchHeaderEl.style.display = "block";
    } else {
      heroEl.style.display = "";
      mobStatsEl.style.display = "";
      mobColHeaderEl.style.display = "";
      searchHeaderEl.style.display = "none";
    }

    // Update mobileRecommendWrap visibility & active state
    const mobRecWrap = document.getElementById("mobileRecommendWrap");
    if (mobRecWrap) {
      mobRecWrap.style.display = state.view === "search" ? "none" : "";
    }
    const mobRecBtn = document.getElementById("mobRecommendBtn");
    if (mobRecBtn) {
      mobRecBtn.classList.toggle("active-cat", state.view === "recommend");
    }

    // Hide "#" rank header text when in "recommend" view (since rank numbers are hidden)
    const listColFirstSpan = document.querySelector(".list-col-header > span:first-child");
    if (listColFirstSpan) {
      listColFirstSpan.textContent = state.view === "recommend" ? "" : "#";
    }

    // Highlight active stat pill (PC) & stat card (Mobile)
    const pillAllEl = document.getElementById("pillAll");
    if (pillAllEl) pillAllEl.classList.toggle("active-cat", state.view === "all");
    document.getElementById("pillCat1").classList.toggle("active-cat", state.view === "cat1");
    document.getElementById("pillCat2").classList.toggle("active-cat", state.view === "cat2");
    const pillRecEl = document.getElementById("pillRecommend");
    if (pillRecEl) pillRecEl.classList.toggle("active-cat", state.view === "recommend");
    const mobCardTotalEl = document.getElementById("mobCardTotal");
    if (mobCardTotalEl) mobCardTotalEl.classList.toggle("active-cat", state.view === "all");
    document.getElementById("mobCardCat1").classList.toggle("active-cat", state.view === "cat1");
    document.getElementById("mobCardCat2").classList.toggle("active-cat", state.view === "cat2");

    // Update mobile top bar title & collection header title
    const mobTitleEl = document.getElementById("mobileTopTitle");
    const mobColTitleEl = document.getElementById("mobCollectionTitle");
    const mobColSubEl = document.getElementById("mobCollectionSub");
    const sortDescMap = {
      countDesc: "歌い手・アーティストを登録楽曲数順に表示",
      countAsc: "歌い手・アーティストを登録楽曲数が少ない順に表示",
      kanaAsc: "歌い手・アーティストを五十音順に表示",
      alphaAsc: "歌い手・アーティストをアルファベット順に表示",
      nameAsc: "歌い手・アーティストを名前順（昇順）に表示",
      nameDesc: "歌い手・アーティストを名前順（降順）に表示",
      subDesc: "歌い手・アーティストを登録者数が多い順に表示",
      subAsc: "歌い手・アーティストを登録者数が少ない順に表示"
    };
    if (mobColSubEl) {
      mobColSubEl.textContent = sortDescMap[state.sortBy] || sortDescMap.countDesc;
    }

    if (state.unitGroup && state.view !== "search") {
      mobTitleEl.textContent = `ユニット：${state.unitGroup}`;
      if (mobColTitleEl) mobColTitleEl.textContent = `ユニット：${state.unitGroup}`;
    } else if (state.agencyGroup && state.view !== "search") {
      mobTitleEl.textContent = `所属：${state.agencyGroup}`;
      if (mobColTitleEl) mobColTitleEl.textContent = `所属：${state.agencyGroup}`;
    } else if (state.view === "all") {
      mobTitleEl.textContent = "すべて";
      if (mobColTitleEl) mobColTitleEl.textContent = "すべて";
    } else if (state.view === "cat1") {
      mobTitleEl.textContent = "カバーあり";
      if (mobColTitleEl) mobColTitleEl.textContent = "カバーあり";
    } else if (state.view === "cat2") {
      mobTitleEl.textContent = "カバーなし";
      if (mobColTitleEl) mobColTitleEl.textContent = "カバーなし";
    } else if (state.view === "recommend") {
      mobTitleEl.textContent = "かるのオススメ";
      if (mobColTitleEl) mobColTitleEl.textContent = "かるのオススメ";
      if (mobColSubEl) mobColSubEl.textContent = "好き設定したアーティストを活動形態別に表示";
    } else {
      mobTitleEl.textContent = "検索";
    }

    // Sync unified sort select dropdown & custom sort menu
    const sortSelect = document.getElementById("pcSortSelect");
    if (sortSelect) {
      sortSelect.value = state.sortBy;
    }
    const customSortMenu = document.getElementById("customSortMenu");
    if (customSortMenu) {
      customSortMenu.querySelectorAll(".custom-sort-option").forEach(btn => {
        const isSelected = btn.getAttribute("data-sort-value") === state.sortBy;
        btn.classList.toggle("active", isSelected);
        btn.setAttribute("aria-selected", isSelected ? "true" : "false");
      });
    }

    // Sync filter drawers
    const pcDrawer = document.getElementById("pcFilterDrawer");
    pcDrawer.classList.toggle("open", state.pcFilterOpen);
    pcDrawer.innerHTML = buildFilterControlsHTML();

    const mobSheetBody = document.getElementById("mobFilterSheetBody");
    mobSheetBody.innerHTML = buildFilterControlsHTML();

    renderActiveFilterChips();
    renderArtistList(resetScroll);
    renderDetailPanel(false);
    syncHistoryButtons();
  }

  // Select / Open Artist Detail (Always defaults to Representative TOP 5, resets detail scroll, preserves list scroll & songSort)
  function selectArtist(name, fromProfileJump = false) {
    if (!name || !ARTIST_MAP.has(name)) return;
    if (state.selectedArtistName !== name || state.detailMode !== "top5") {
      pushHistorySnapshot(fromProfileJump);
    }
    state.selectedArtistName = name;
    state.detailMode = "top5";
    if (window.innerWidth <= 900) {
      try {
        history.pushState({ sheet: "detail", artist: name }, "");
      } catch (e) {}
    }
    updateSelectedRowHighlight();
    renderDetailPanel(true);
  }

  function closeDetailPanel() {
    if (state.selectedArtistName !== null) {
      pushHistorySnapshot(false);
    }
    state.selectedArtistName = null;
    updateSelectedRowHighlight();
    renderDetailPanel(false);
  }

  function openMobFilterSheet(recordHistory = false) {
    if (recordHistory && !state.mobFilterOpen) pushHistorySnapshot(false);
    state.mobFilterOpen = true;
    document.getElementById("mobFilterSheet").classList.add("open");
    document.getElementById("sheetBackdrop").classList.add("visible");
    syncMobileScrollLock();
    renderActiveFilterChips();
    try {
      history.pushState({ sheet: "filter" }, "");
    } catch (e) {}
  }

  function closeMobFilterSheet(recordHistory = false) {
    if (recordHistory && state.mobFilterOpen) pushHistorySnapshot(false);
    state.mobFilterOpen = false;
    document.getElementById("mobFilterSheet").classList.remove("open");
    if (!state.selectedArtistName || window.innerWidth > 900) {
      document.getElementById("sheetBackdrop").classList.remove("visible");
    }
    syncMobileScrollLock();
    renderActiveFilterChips();
  }

  function clearAllFilters() {
    const hadIndex = hasAnyIndexFilter();
    state.agencyGroup = "";
    state.unitGroup = "";
    state.roles = [];
    state.subBuckets = [];
    state.kanaRows = [];
    state.kanaChar = "";
    state.alphaChars = [];
    if (hadIndex) {
      syncSortWithIndexFilters("");
    }
  }

  // Item 5: Home Button Reset Function (Resets all search, filters, sort, category, detail panel, and scroll to initial state; preserves PC font scale)
  function resetToHomeState() {
    pushHistorySnapshot(false);
    state.profileBackAvailable = false;
    state.view = "all";
    state.searchScope = "all";
    state.searchTarget = "all";
    state.searchQuery = "";
    state.agencyGroup = "";
    state.unitGroup = "";
    state.roles = [];
    state.subBuckets = [];
    state.kanaRows = [];
    state.kanaChar = "";
    state.alphaChars = [];
    state.lastIndexType = "";
    state.sortBy = "countDesc";
    state.savedSortBy = "countDesc";
    state.selectedArtistName = null;
    state.detailMode = "top5";
    state.pcFilterOpen = false;
    state.mobFilterOpen = false;

    const searchInput = document.getElementById("mainSearchInput");
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    if (searchInput) searchInput.value = "";
    if (clearSearchBtn) clearSearchBtn.style.display = "none";

    document.querySelectorAll("[data-search-scope]").forEach(t => {
      t.classList.toggle("active", t.getAttribute("data-search-scope") === "all");
    });

    document.getElementById("mobFilterSheet").classList.remove("open");
    document.getElementById("sheetBackdrop").classList.remove("visible");
    syncMobileScrollLock();

    updateUI(true);
  }

  // Delegate Filter Control Events (including Item 4 Auto-Link of 50-on & Alphabet filters with Sort Order)
  function handleFilterControlClick(e) {
    if (e.target.closest("button")) {
      pushHistorySnapshot(false);
    }
    const roleBtn = e.target.closest("[data-filter-role]");
    if (roleBtn) {
      const r = roleBtn.getAttribute("data-filter-role");
      const idx = state.roles.indexOf(r);
      if (idx >= 0) state.roles.splice(idx, 1);
      else state.roles.push(r);
      updateUI(true);
      return;
    }

    const subBtn = e.target.closest("[data-filter-sub]");
    if (subBtn) {
      const bKey = subBtn.getAttribute("data-filter-sub");
      const idx = state.subBuckets.indexOf(bKey);
      if (idx >= 0) state.subBuckets.splice(idx, 1);
      else state.subBuckets.push(bKey);
      updateUI(true);
      return;
    }

    if (e.target.closest("[data-clear-roles]")) {
      state.roles = [];
      updateUI(true);
      return;
    }

    const agPillBtn = e.target.closest("[data-filter-agency-pill]");
    if (agPillBtn) {
      const ag = agPillBtn.getAttribute("data-filter-agency-pill") || "";
      state.agencyGroup = (state.agencyGroup === ag) ? "" : ag;
      updateUI(true);
      return;
    }

    if (e.target.closest("[data-clear-agency]")) {
      state.agencyGroup = "";
      updateUI(true);
      return;
    }

    if (e.target.closest("[data-clear-subs]")) {
      state.subBuckets = [];
      updateUI(true);
      return;
    }

    const rowBtn = e.target.closest("[data-kana-row]");
    if (rowBtn) {
      const r = rowBtn.getAttribute("data-kana-row");
      const hadIndexBefore = hasAnyIndexFilter();
      const idx = state.kanaRows.indexOf(r);
      if (idx >= 0) {
        state.kanaRows.splice(idx, 1);
        state.kanaChar = "";
      } else {
        if (!hadIndexBefore) {
          state.savedSortBy = state.sortBy;
        }
        state.kanaRows.push(r);
        state.kanaChar = "";
      }
      syncSortWithIndexFilters("kana");
      updateUI(true);
      return;
    }

    const charBtn = e.target.closest("[data-kana-char]");
    if (charBtn) {
      const c = charBtn.getAttribute("data-kana-char");
      state.kanaChar = c;
      syncSortWithIndexFilters("kana");
      updateUI(true);
      return;
    }

    const alphaBtn = e.target.closest("[data-alpha-char]");
    if (alphaBtn) {
      const ch = alphaBtn.getAttribute("data-alpha-char");
      const hadIndexBefore = hasAnyIndexFilter();
      const idx = state.alphaChars.indexOf(ch);
      if (idx >= 0) {
        state.alphaChars.splice(idx, 1);
      } else {
        if (!hadIndexBefore) {
          state.savedSortBy = state.sortBy;
        }
        state.alphaChars.push(ch);
      }
      syncSortWithIndexFilters("alpha");
      updateUI(true);
      return;
    }

    if (e.target.closest("[data-clear-kana]")) {
      state.kanaRows = [];
      state.kanaChar = "";
      syncSortWithIndexFilters("");
      updateUI(true);
      return;
    }

    if (e.target.closest("[data-clear-alpha]")) {
      state.alphaChars = [];
      syncSortWithIndexFilters("");
      updateUI(true);
      return;
    }
  }

  // Initialize Event Listeners
  function initEvents() {
    // PC 4-Step Font Scale Slider & Tick Buttons (100% / 125% / 150% / 175%)
    const fontSlider = document.getElementById("pcFontScaleSlider");
    if (fontSlider) {
      fontSlider.addEventListener("input", e => {
        const val = parseInt(e.target.value, 10);
        applyPcFontScale(val, true);
      });
      fontSlider.addEventListener("change", e => {
        const val = parseInt(e.target.value, 10);
        applyPcFontScale(val, true);
      });
    }
    const fontBox = document.getElementById("pcFontScaleBox");
    if (fontBox) {
      fontBox.addEventListener("click", e => {
        const tickBtn = e.target.closest("[data-font-scale]");
        if (!tickBtn) return;
        const val = parseInt(tickBtn.getAttribute("data-font-scale"), 10);
        applyPcFontScale(val, true);
      });
    }

    // Home Button (PC Left Sidebar & Smartphone Top Header)
    const pcHomeBtn = document.getElementById("pcHomeBtn");
    if (pcHomeBtn) {
      pcHomeBtn.addEventListener("click", resetToHomeState);
    }
    const mobTopHomeBtn = document.getElementById("mobTopHomeBtn");
    if (mobTopHomeBtn) {
      mobTopHomeBtn.addEventListener("click", resetToHomeState);
    }

    // Navigation buttons (Left Sidebar & Mobile Bottom Nav)
    document.querySelectorAll("[data-nav-view]").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetView = btn.getAttribute("data-nav-view");
        pushHistorySnapshot(false);
        state.view = targetView;
        if (targetView === "all" || targetView === "cat1" || targetView === "cat2" || targetView === "recommend") {
          state.agencyGroup = "";
          state.unitGroup = "";
        }
        if (window.innerWidth <= 900) {
          closeDetailPanel();
          closeMobFilterSheet();
        }
        updateUI(true);
        if (targetView === "search") {
          setTimeout(() => {
            const inp = document.getElementById("mainSearchInput");
            if (inp) inp.focus();
          }, 50);
        }
      });
    });

    // Mobile Top Bar quick search button
    const mobTopSearchBtn = document.getElementById("mobTopSearchBtn");
    if (mobTopSearchBtn) {
      mobTopSearchBtn.addEventListener("click", () => {
        state.view = "search";
        closeDetailPanel();
        closeMobFilterSheet();
        updateUI(true);
        setTimeout(() => {
          const inp = document.getElementById("mainSearchInput");
          if (inp) inp.focus();
        }, 50);
      });
    }

    // Hero stat pills (PC) & Mobile Stat Cards can switch category (すべて / カバーあり / カバーなし)
    const pillAllBtn = document.getElementById("pillAll");
    if (pillAllBtn) {
      pillAllBtn.addEventListener("click", () => {
        pushHistorySnapshot(false);
        state.view = "all";
        state.agencyGroup = "";
        state.unitGroup = "";
        updateUI(true);
      });
    }
    document.getElementById("pillCat1").addEventListener("click", () => {
      pushHistorySnapshot(false);
      state.view = "cat1";
      state.agencyGroup = "";
      state.unitGroup = "";
      updateUI(true);
    });
    document.getElementById("pillCat2").addEventListener("click", () => {
      pushHistorySnapshot(false);
      state.view = "cat2";
      state.agencyGroup = "";
      state.unitGroup = "";
      updateUI(true);
    });
    const pillRecBtn = document.getElementById("pillRecommend");
    if (pillRecBtn) {
      pillRecBtn.addEventListener("click", () => {
        pushHistorySnapshot(false);
        state.view = "recommend";
        state.agencyGroup = "";
        state.unitGroup = "";
        updateUI(true);
      });
    }
    const mobRecBtn = document.getElementById("mobRecommendBtn");
    if (mobRecBtn) {
      mobRecBtn.addEventListener("click", () => {
        pushHistorySnapshot(false);
        state.view = state.view === "recommend" ? "all" : "recommend";
        state.agencyGroup = "";
        state.unitGroup = "";
        updateUI(true);
      });
    }
    const mobCardTotalBtn = document.getElementById("mobCardTotal");
    if (mobCardTotalBtn) {
      mobCardTotalBtn.addEventListener("click", () => {
        pushHistorySnapshot(false);
        state.view = "all";
        state.agencyGroup = "";
        state.unitGroup = "";
        updateUI(true);
      });
    }
    document.getElementById("mobCardCat1").addEventListener("click", () => {
      pushHistorySnapshot(false);
      state.view = "cat1";
      state.agencyGroup = "";
      state.unitGroup = "";
      updateUI(true);
    });
    document.getElementById("mobCardCat2").addEventListener("click", () => {
      pushHistorySnapshot(false);
      state.view = "cat2";
      state.agencyGroup = "";
      state.unitGroup = "";
      updateUI(true);
    });

    // Unified Sort select & Custom compact sort popup menu
    const pcSortSelectEl = document.getElementById("pcSortSelect");
    const sortWrapEl = document.getElementById("sortWrapContainer") || (pcSortSelectEl && pcSortSelectEl.closest(".sort-wrap"));
    const customSortMenuEl = document.getElementById("customSortMenu");

    if (pcSortSelectEl) {
      pcSortSelectEl.addEventListener("change", e => {
        pushHistorySnapshot(false);
        state.sortBy = e.target.value;
        state.savedSortBy = e.target.value;
        if (customSortMenuEl) customSortMenuEl.classList.remove("open");
        updateUI(true);
      });
      // On mobile (<= 900px), intercept native select opening and use the compact custom sort popup
      pcSortSelectEl.addEventListener("mousedown", e => {
        if (window.innerWidth <= 900 && customSortMenuEl) {
          e.preventDefault();
          customSortMenuEl.classList.toggle("open");
        }
      });
      pcSortSelectEl.addEventListener("touchstart", e => {
        if (window.innerWidth <= 900 && customSortMenuEl) {
          e.preventDefault();
          customSortMenuEl.classList.toggle("open");
        }
      }, { passive: false });
    }

    if (sortWrapEl && customSortMenuEl) {
      sortWrapEl.addEventListener("click", e => {
        if (window.innerWidth <= 900 && !e.target.closest(".custom-sort-option")) {
          e.preventDefault();
          e.stopPropagation();
          customSortMenuEl.classList.toggle("open");
        }
      });
      customSortMenuEl.addEventListener("click", e => {
        const optBtn = e.target.closest(".custom-sort-option");
        if (!optBtn) return;
        e.preventDefault();
        e.stopPropagation();
        const newVal = optBtn.getAttribute("data-sort-value");
        customSortMenuEl.classList.remove("open");
        if (newVal && newVal !== state.sortBy) {
          pushHistorySnapshot(false);
          state.sortBy = newVal;
          state.savedSortBy = newVal;
          if (pcSortSelectEl) pcSortSelectEl.value = newVal;
          updateUI(true);
        }
      });
      document.addEventListener("click", e => {
        if (!sortWrapEl.contains(e.target)) {
          customSortMenuEl.classList.remove("open");
        }
      });
    }

    // Unified Filter button: opens collapsible drawer on PC, or bottom filter sheet on Smartphone (does not pollute undoStack)
    document.getElementById("pcFilterToggleBtn").addEventListener("click", () => {
      if (window.innerWidth <= 900) {
        if (state.mobFilterOpen) closeMobFilterSheet(false);
        else openMobFilterSheet(false);
      } else {
        state.pcFilterOpen = !state.pcFilterOpen;
        updateUI(false);
        if (state.pcFilterOpen) {
          const drawerEl = document.getElementById("pcFilterDrawer");
          const scrollEl = document.getElementById("centerScrollArea");
          const stickyEl = document.querySelector(".sticky-controls");
          if (drawerEl && scrollEl) {
            const stickyH = stickyEl ? stickyEl.offsetHeight : 62;
            const dRect = drawerEl.getBoundingClientRect();
            const sRect = scrollEl.getBoundingClientRect();
            const visibleTop = sRect.top + stickyH + 10;
            if (dRect.top < visibleTop) {
              const targetTop = Math.max(0, scrollEl.scrollTop + (dRect.top - visibleTop));
              scrollEl.scrollTo({ top: targetTop, behavior: "smooth" });
            }
          }
        }
      }
    });

    document.getElementById("closeMobFilterBtn").addEventListener("click", closeMobFilterSheet);
    document.getElementById("applyMobFilterBtn").addEventListener("click", closeMobFilterSheet);
    document.getElementById("resetMobFilterBtn").addEventListener("click", () => {
      clearAllFilters();
      updateUI(true);
    });

    // Filter controls delegation
    document.getElementById("pcFilterDrawer").addEventListener("click", handleFilterControlClick);
    document.getElementById("mobFilterSheetBody").addEventListener("click", handleFilterControlClick);

    // Active filter chips removal (individual & clear all, with automatic sort restoration)
    document.getElementById("activeChipsContainer").addEventListener("click", e => {
      const btn = e.target.closest("[data-remove-chip]");
      if (!btn) return;
      const key = btn.getAttribute("data-remove-chip");
      pushHistorySnapshot(false);
      if (key === "all") {
        clearAllFilters();
      } else if (key === "agencyGroup") {
        state.agencyGroup = "";
      } else if (key === "unitGroup") {
        state.unitGroup = "";
      } else if (key.startsWith("role:")) {
        const r = key.slice(5);
        state.roles = state.roles.filter(item => item !== r);
      } else if (key.startsWith("sub:")) {
        const bKey = key.slice(4);
        state.subBuckets = state.subBuckets.filter(item => item !== bKey);
      } else if (key === "kanaChar") {
        state.kanaChar = "";
        state.kanaRows = [];
        syncSortWithIndexFilters("");
      } else if (key.startsWith("kanaRow:")) {
        const r = key.slice(8);
        state.kanaRows = state.kanaRows.filter(item => item !== r);
        state.kanaChar = "";
        syncSortWithIndexFilters("");
      } else if (key.startsWith("alpha:")) {
        const ch = key.slice(6);
        state.alphaChars = state.alphaChars.filter(item => item !== ch);
        syncSortWithIndexFilters("");
      }
      updateUI(true);
    });

    // Search input with 80ms debounce & candidate click delegation
    const searchInput = document.getElementById("mainSearchInput");
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    let searchDebounceTimer = null;

    function runSearchUpdate() {
      applyFilterAndSort();
      renderArtistList(true);
      if (state.selectedArtistName) renderDetailPanel(false);
    }

    searchInput.addEventListener("input", e => {
      state.searchQuery = e.target.value;
      clearSearchBtn.style.display = state.searchQuery ? "flex" : "none";
      if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(runSearchUpdate, 80);
    });

    clearSearchBtn.addEventListener("click", () => {
      if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
      state.searchQuery = "";
      searchInput.value = "";
      clearSearchBtn.style.display = "none";
      runSearchUpdate();
      searchInput.focus();
    });

    function applySearchGroupFilter(groupType, groupName) {
      if (!groupName) return;
      pushHistorySnapshot(false);
      if (groupType === "agency") {
        state.agencyGroup = groupName;
        state.unitGroup = "";
      } else {
        state.unitGroup = groupName;
        state.agencyGroup = "";
      }
      state.view = state.searchScope === "cat1" ? "cat1" : (state.searchScope === "cat2" ? "cat2" : "all");
      updateUI(true);
    }

    const candBar = document.getElementById("searchCandidatesBar");
    if (candBar) {
      candBar.addEventListener("click", e => {
        const grpChip = e.target.closest("[data-cand-group-name]");
        if (grpChip) {
          applySearchGroupFilter(
            grpChip.getAttribute("data-cand-group-type"),
            grpChip.getAttribute("data-cand-group-name")
          );
          return;
        }
        const chip = e.target.closest("[data-cand-artist]");
        if (!chip) return;
        const name = chip.getAttribute("data-cand-artist");
        selectArtist(name);
      });
    }

    document.querySelectorAll("[data-search-scope]").forEach(tab => {
      tab.addEventListener("click", () => {
        pushHistorySnapshot(false);
        state.searchScope = tab.getAttribute("data-search-scope");
        document.querySelectorAll("[data-search-scope]").forEach(t => {
          t.classList.toggle("active", t === tab);
        });
        updateUI(true);
      });
    });

    document.querySelectorAll("[data-search-target]").forEach(tab => {
      tab.addEventListener("click", () => {
        const nextTarget = tab.getAttribute("data-search-target") || "both";
        if (state.searchTarget === nextTarget) return;
        pushHistorySnapshot(false);
        state.searchTarget = nextTarget;
        syncSearchTargetUI();
        updateUI(true);
      });
    });

    // Artist row click & hover/touch detail avatar preloader
    const listContainer = document.getElementById("artistListContainer");
    const handleRowHoverPreload = e => {
      const row = e.target.closest(".artist-row");
      if (!row) return;
      const name = row.getAttribute("data-artist-name");
      const a = name ? ARTIST_MAP.get(name) : null;
      if (a && a.img) {
        preloadAvatarUrl(getDetailAvatarUrl(a.img));
      }
    };
    listContainer.addEventListener("pointerover", handleRowHoverPreload, { passive: true });
    listContainer.addEventListener("touchstart", handleRowHoverPreload, { passive: true });
    listContainer.addEventListener("click", e => {
      const grpCard = e.target.closest("[data-select-search-group]");
      if (grpCard) {
        applySearchGroupFilter(
          grpCard.getAttribute("data-select-search-group-type"),
          grpCard.getAttribute("data-select-search-group")
        );
        return;
      }
      const row = e.target.closest(".artist-row");
      if (!row) return;
      const name = row.getAttribute("data-artist-name");
      // When Quick-Heart Edit Mode is active, tapping the circular avatar in the list toggles ❤
      if (favQuickEditMode && e.target.closest(".row-avatar-wrap")) {
        e.preventDefault();
        e.stopPropagation();
        toggleRecommendedArtist(name);
        return;
      }
      selectArtist(name);
    });
    listContainer.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        const row = e.target.closest(".artist-row");
        if (!row) return;
        e.preventDefault();
        selectArtist(row.getAttribute("data-artist-name"));
      }
    });

    // Infinite smooth chunk rendering on scroll using DocumentFragment append
    const scrollEl = document.getElementById("centerScrollArea");
    scrollEl.addEventListener("scroll", () => {
      if (state.view === "recommend" || state.renderLimit >= currentFiltered.length) return;
      if (scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 420) {
        const prevLimit = state.renderLimit;
        state.renderLimit = Math.min(currentFiltered.length, state.renderLimit + 100);
        appendArtistRows(prevLimit, state.renderLimit);
      }
    }, { passive: true });

    // Detail panel close, mode toggle (TOP 5 <-> かるが聴いてる曲), & song sort toggle
    document.getElementById("closeDetailBtn").addEventListener("click", closeDetailPanel);

    // About Site Modal ("当サイトについて") open & close handlers
    const aboutModal = document.getElementById("aboutSiteModal");
    const openAboutModal = () => {
      if (!aboutModal) return;
      aboutModal.classList.add("open");
      aboutModal.setAttribute("aria-hidden", "false");
    };
    const closeAboutModal = () => {
      if (!aboutModal) return;
      aboutModal.classList.remove("open");
      aboutModal.setAttribute("aria-hidden", "true");
    };
    const mobAboutBtn = document.getElementById("mobAboutBtn");
    if (mobAboutBtn) mobAboutBtn.addEventListener("click", openAboutModal);
    const pcAboutBtn = document.getElementById("pcAboutBtn");
    if (pcAboutBtn) pcAboutBtn.addEventListener("click", openAboutModal);
    const closeAboutBtn = document.getElementById("closeAboutModalBtn");
    if (closeAboutBtn) closeAboutBtn.addEventListener("click", closeAboutModal);
    if (aboutModal) {
      aboutModal.addEventListener("click", e => {
        if (e.target === aboutModal) closeAboutModal();
      });
    }
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && aboutModal && aboutModal.classList.contains("open")) {
        closeAboutModal();
      }
    });
    // Bind Undo / Redo buttons and Profile Top-Left Back Button
    document.querySelectorAll('[data-history-action="undo"]').forEach(btn => {
      btn.addEventListener("click", undoStateAction);
    });
    document.querySelectorAll('[data-history-action="redo"]').forEach(btn => {
      btn.addEventListener("click", redoStateAction);
    });
    const detailBackBtn = document.getElementById("detailBackBtn");
    if (detailBackBtn) {
      detailBackBtn.addEventListener("click", undoStateAction);
    }



    // =========================================================================
    // V47: SERVER-SHARED FAVORITES ("かるのオススメ") SYNC, MIGRATION & EDIT CONTROLLER
    // =========================================================================
    let favToastTimer = null;
    function showFavSyncToast(message, isWarn = false, durationMs = 3400) {
      const toastEl = document.getElementById("favSyncToast");
      if (!toastEl) return;
      toastEl.textContent = message;
      toastEl.classList.toggle("toast-warn", Boolean(isWarn));
      toastEl.classList.add("show");
      if (favToastTimer) clearTimeout(favToastTimer);
      favToastTimer = setTimeout(() => {
        toastEl.classList.remove("show");
      }, durationMs);
    }

    function computeDiffCounts(baseIds, currentIds) {
      const baseSet = new Set(baseIds || []);
      const curSet = new Set(currentIds || []);
      const added = [];
      const removed = [];
      curSet.forEach(id => {
        if (!baseSet.has(id)) added.push(id);
      });
      baseSet.forEach(id => {
        if (!curSet.has(id)) removed.push(id);
      });
      return { added, removed, hasChanges: added.length > 0 || removed.length > 0 };
    }

    function updateFavEditBannerStatus() {
      const diffBadge = document.getElementById("favQeDiffBadge");
      const discardBtn = document.getElementById("discardFavQuickEditBtn");
      const migrateBtn = document.getElementById("openLegacyMigrateBtn");
      const exitBtn = document.getElementById("exitFavQuickEditBtn");
      const currentIds = getSortedCurrentAids();
      const diff = computeDiffCounts(editSessionBaseIds, currentIds);

      if (diffBadge) {
        if (!diff.hasChanges) {
          diffBadge.textContent = `変更なし (${currentIds.length}名義)`;
          diffBadge.classList.remove("has-changes");
        } else {
          const parts = [];
          if (diff.added.length > 0) parts.push(`+${diff.added.length}`);
          if (diff.removed.length > 0) parts.push(`-${diff.removed.length}`);
          diffBadge.textContent = `未保存の変更: ${parts.join(" / ")} (計${currentIds.length}名義)`;
          diffBadge.classList.add("has-changes");
        }
      }
      if (discardBtn) {
        discardBtn.style.display = diff.hasChanges && !isSavingFavorites ? "inline-flex" : "none";
      }
      if (migrateBtn) {
        const legacyAids = getLegacyLocalStorageAids();
        const migState = localStorage.getItem(FAV_MIGRATION_STATE_KEY);
        migrateBtn.style.display = (legacyAids.length > 0 && migState !== "migrated" && !isSavingFavorites)
          ? "inline-flex"
          : "none";
        if (legacyAids.length > 0) {
          migrateBtn.textContent = `端末の既存ハート(${legacyAids.length}件)を移行`;
        }
      }
      if (exitBtn && !isSavingFavorites) {
        exitBtn.disabled = false;
        exitBtn.textContent = "完了して閉じる";
      }
    }

    function hideFavEditError() {
      const errRow = document.getElementById("favQeErrorRow");
      if (errRow) errRow.style.display = "none";
    }

    function showFavEditError(msg) {
      const errRow = document.getElementById("favQeErrorRow");
      const errMsg = document.getElementById("favQeErrorMsg");
      if (errMsg) errMsg.textContent = msg || "サーバーへの保存に失敗しました。変更内容は端末内に保持されています。";
      if (errRow) errRow.style.display = "flex";
    }

    function updateDraftRestoreBannerUI() {
      const banner = document.getElementById("favDraftRestoreBanner");
      const textEl = document.getElementById("favDraftRestoreText");
      if (!banner) return;
      if (favQuickEditMode) {
        banner.style.display = "none";
        return;
      }
      const draft = loadUnsavedDraft();
      if (draft && !areAidArraysEqual(draft.ids, draft.baseIds)) {
        const diff = computeDiffCounts(draft.baseIds, draft.ids);
        if (textEl) {
          textEl.textContent = `前回の未保存のハート編集内容（+${diff.added.length} / -${diff.removed.length}、計${draft.ids.length}名義）が端末に残っています。`;
        }
        banner.style.display = "flex";
      } else {
        banner.style.display = "none";
      }
    }

    function enterFavQuickEditMode() {
      if (favQuickEditMode) return;
      const existingDraft = loadUnsavedDraft();
      if (existingDraft && !areAidArraysEqual(existingDraft.ids, existingDraft.baseIds)) {
        editSessionBaseIds = existingDraft.baseIds;
        editSessionBaseVersion = existingDraft.baseVersion;
        setRecommendedFromAids(existingDraft.ids);
      } else {
        editSessionBaseIds = hasFetchedServerOnce ? [...serverFavIds] : getSortedCurrentAids();
        editSessionBaseVersion = serverVersion;
      }
      favQuickEditMode = true;
      hideFavEditError();
      document.body.classList.add("fav-quick-edit-mode");
      updateDraftRestoreBannerUI();
      updateFavEditBannerStatus();
      renderStaticStats();
      updateUI(false);
      renderDetailPanel(false);

      // Refresh baseline quietly if no changes have been made yet in this edit session
      fetchServerFavorites({ silent: true, fresh: true });
    }

    function closeFavQuickEditModeCleanly() {
      favQuickEditMode = false;
      isSavingFavorites = false;
      hideFavEditError();
      document.body.classList.remove("fav-quick-edit-mode");
      updateDraftRestoreBannerUI();
      updateFavEditBannerStatus();
    }

    // Save changes to server ONLY when pressing 「完了して閉じる」
    async function saveFavoritesToServer(options = {}) {
      if (isSavingFavorites) return;
      const forceOverwrite = Boolean(options.forceOverwrite);
      const customIds = Array.isArray(options.customIds) ? options.customIds : null;
      const customBaseVersion = typeof options.customBaseVersion === "number" ? options.customBaseVersion : editSessionBaseVersion;

      const targetIds = customIds ? [...customIds].sort() : getSortedCurrentAids();

      // Requirement 1-5: Skip server write if there are no changes
      if (!forceOverwrite && areAidArraysEqual(targetIds, editSessionBaseIds) && (!hasFetchedServerOnce || areAidArraysEqual(targetIds, serverFavIds))) {
        clearUnsavedDraft();
        closeFavQuickEditModeCleanly();
        showFavSyncToast("変更はありませんでした（編集モードを終了しました）");
        return;
      }

      isSavingFavorites = true;
      hideFavEditError();
      const exitBtn = document.getElementById("exitFavQuickEditBtn");
      const discardBtn = document.getElementById("discardFavQuickEditBtn");
      if (exitBtn) {
        exitBtn.disabled = true;
        exitBtn.textContent = "保存中...";
      }
      if (discardBtn) discardBtn.style.display = "none";

      const clientRequestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      try {
        const resp = await fetch(FAV_API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Calpis-Client": "archive-v1",
            "X-Calpis-Edit-Intent": "1"
          },
          body: JSON.stringify({
            action: "save",
            ids: targetIds,
            baseVersion: customBaseVersion,
            forceOverwrite,
            clientRequestId
          }),
          cache: "no-store"
        });

        const data = await resp.json().catch(() => null);

        if (resp.status === 409 && data && data.serverData) {
          // Conflict detected! Do not overwrite silently; open Conflict Resolution Modal
          isSavingFavorites = false;
          updateFavEditBannerStatus();
          openFavConflictModal(data.serverData);
          return;
        }

        if (!resp.ok || !data || !data.ok) {
          const errMsg = (data && data.message)
            ? data.message
            : `サーバー保存エラー (HTTP ${resp.status})。変更内容は維持されています。`;
          throw new Error(errMsg);
        }

        // Success! Update confirmed server baseline and clear local draft
        const savedIds = Array.isArray(data.ids) ? data.ids.map(resolveToAid).filter(Boolean).sort() : targetIds;
        serverFavIds = savedIds;
        serverVersion = typeof data.version === "number" ? data.version : (customBaseVersion + 1);
        hasFetchedServerOnce = true;
        editSessionBaseIds = [...serverFavIds];
        editSessionBaseVersion = serverVersion;

        setRecommendedFromAids(serverFavIds);
        saveFavServerCache(serverFavIds, serverVersion, data.updatedAt);
        clearUnsavedDraft();

        // Once saved to server, mark device migration state so old localStorage never prompts again
        try {
          const rawLegacy = localStorage.getItem(RECOMMENDED_STORAGE_KEY);
          if (rawLegacy && !localStorage.getItem(RECOMMENDED_BACKUP_KEY)) {
            localStorage.setItem(RECOMMENDED_BACKUP_KEY, rawLegacy);
          }
          localStorage.setItem(FAV_MIGRATION_STATE_KEY, "migrated");
        } catch (e) {}

        closeFavQuickEditModeCleanly();
        renderStaticStats();
        updateUI(false);
        renderDetailPanel(false);
        showFavSyncToast(`「かるのオススメ」（${serverFavIds.length}名義）をサーバーに保存しました`);
      } catch (err) {
        // Save failed: keep edit mode open, preserve changes in recommendedAidSet & localStorage draft
        isSavingFavorites = false;
        saveUnsavedDraft();
        updateFavEditBannerStatus();
        const exitBtnRetry = document.getElementById("exitFavQuickEditBtn");
        if (exitBtnRetry) {
          exitBtnRetry.disabled = false;
          exitBtnRetry.textContent = "再試行して保存";
        }
        showFavEditError(err && err.message ? err.message : "通信エラーのため保存できませんでした。変更内容は保持されています。");
      }
    }

    // Fetch shared favorites from server (startup + visibility/periodic check)
    async function fetchServerFavorites(options = {}) {
      const isInitial = Boolean(options.isInitial);
      const silent = Boolean(options.silent);
      const fresh = Boolean(options.fresh);

      lastServerFetchAt = Date.now();
      const url = `${FAV_API_ENDPOINT}?_t=${Date.now()}${fresh ? "&fresh=1" : ""}`;

      try {
        const resp = await fetch(url, {
          method: "GET",
          headers: { "Accept": "application/json" },
          cache: "no-store"
        });
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}`);
        }
        const data = await resp.json();
        if (!data || !data.ok) {
          throw new Error((data && data.message) || "Invalid response");
        }

        const fetchedIds = Array.isArray(data.ids)
          ? data.ids.map(resolveToAid).filter(Boolean).sort()
          : [];
        const fetchedVersion = typeof data.version === "number" ? data.version : 0;
        serverConfigured = data.configured !== false;
        hasFetchedServerOnce = true;

        serverFavIds = fetchedIds;
        serverVersion = fetchedVersion;
        saveFavServerCache(serverFavIds, serverVersion, data.updatedAt);

        const currentIds = getSortedCurrentAids();
        const isEditingWithChanges = favQuickEditMode && !areAidArraysEqual(currentIds, editSessionBaseIds);
        const hasPendingDraft = hasActiveUnsavedDraft();

        if (isEditingWithChanges || hasPendingDraft) {
          // Never overwrite unsaved user edits during background polling!
          // If the user is in edit mode but hasn't changed any hearts yet, keep baseline synced
          if (favQuickEditMode && areAidArraysEqual(currentIds, editSessionBaseIds)) {
            editSessionBaseIds = [...serverFavIds];
            editSessionBaseVersion = serverVersion;
            setRecommendedFromAids(serverFavIds);
            updateFavEditBannerStatus();
            renderStaticStats();
            updateUI(false);
            renderDetailPanel(false);
          } else {
            updateDraftRestoreBannerUI();
          }
          return;
        }

        if (serverVersion > 0) {
          // Server has shared data: treat server as the single source of truth
          editSessionBaseIds = [...serverFavIds];
          editSessionBaseVersion = serverVersion;
          if (!areAidArraysEqual(currentIds, serverFavIds)) {
            setRecommendedFromAids(serverFavIds);
            renderStaticStats();
            updateUI(false);
            renderDetailPanel(false);
          }
        } else {
          // Server version is 0 (not yet initialized on server)
          const legacyAids = getLegacyLocalStorageAids();
          const migState = localStorage.getItem(FAV_MIGRATION_STATE_KEY);
          if (legacyAids.length > 0 && migState !== "skipped" && migState !== "migrated") {
            // Keep showing local legacy hearts on this device and offer explicit 1-time migration
            setRecommendedFromAids(legacyAids);
            renderStaticStats();
            updateUI(false);
            renderDetailPanel(false);
            if (isInitial && serverConfigured) {
              openFavMigrationModal();
            }
          } else {
            setRecommendedFromAids([]);
            renderStaticStats();
            updateUI(false);
            renderDetailPanel(false);
          }
        }
      } catch (err) {
        if (isInitial && !silent) {
          showFavSyncToast("共有データの取得に失敗したため、端末内のデータを表示しています", true, 4200);
        }
      }
    }

    // ==================== Initial localStorage Migration Modal ====================
    const favMigrationModal = document.getElementById("favMigrationModal");
    function openFavMigrationModal() {
      const legacyAids = getLegacyLocalStorageAids();
      if (!favMigrationModal || legacyAids.length === 0) return;
      const countBadge = document.getElementById("favMigrationCountBadge");
      const previewList = document.getElementById("favMigrationPreviewList");
      const errBox = document.getElementById("favMigrationErrorBox");
      if (countBadge) countBadge.textContent = `${legacyAids.length} 名義`;
      if (previewList) {
        const names = legacyAids.map(resolveAidToName).filter(Boolean);
        previewList.textContent = names.join("、");
      }
      if (errBox) errBox.style.display = "none";
      favMigrationModal.classList.add("open");
      favMigrationModal.setAttribute("aria-hidden", "false");
    }

    function closeFavMigrationModal() {
      if (!favMigrationModal) return;
      favMigrationModal.classList.remove("open");
      favMigrationModal.setAttribute("aria-hidden", "true");
    }

    async function executeLegacyMigration(forceOverwrite = false) {
      const legacyAids = getLegacyLocalStorageAids();
      if (legacyAids.length === 0) {
        closeFavMigrationModal();
        return;
      }
      const confirmBtn = document.getElementById("confirmFavMigrationBtn");
      const errBox = document.getElementById("favMigrationErrorBox");
      if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = "サーバーへ移行中...";
      }
      if (errBox) errBox.style.display = "none";

      try {
        const resp = await fetch(FAV_API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Calpis-Client": "archive-v1",
            "X-Calpis-Edit-Intent": "1"
          },
          body: JSON.stringify({
            action: "migrate",
            ids: legacyAids,
            baseVersion: serverVersion,
            forceOverwrite,
            clientRequestId: `mig_${Date.now()}`
          }),
          cache: "no-store"
        });
        const data = await resp.json().catch(() => null);

        if (resp.status === 409 && data && data.serverData) {
          // Server already has data! Ask before overwriting
          serverFavIds = (data.serverData.ids || []).map(resolveToAid).filter(Boolean).sort();
          serverVersion = data.serverData.version || 1;
          if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.textContent = "サーバーの既存データを上書きしてこの端末から移行する";
            confirmBtn.dataset.forceOverwrite = "1";
          }
          if (errBox) {
            errBox.textContent = `サーバーには既に共有データ（${serverFavIds.length}名義・v${serverVersion}）が存在します。この端末のデータ（${legacyAids.length}名義）で上書きする場合はもう一度ボタンを押してください。`;
            errBox.style.display = "block";
          }
          return;
        }

        if (!resp.ok || !data || !data.ok) {
          throw new Error((data && data.message) || `移行エラー (HTTP ${resp.status})`);
        }

        // Migration succeeded! Backup localStorage key without losing data, mark migrated
        try {
          const rawOrig = localStorage.getItem(RECOMMENDED_STORAGE_KEY);
          if (rawOrig) localStorage.setItem(RECOMMENDED_BACKUP_KEY, rawOrig);
          localStorage.setItem(FAV_MIGRATION_STATE_KEY, "migrated");
        } catch (e) {}

        serverFavIds = (data.ids || legacyAids).map(resolveToAid).filter(Boolean).sort();
        serverVersion = typeof data.version === "number" ? data.version : 1;
        hasFetchedServerOnce = true;
        editSessionBaseIds = [...serverFavIds];
        editSessionBaseVersion = serverVersion;

        setRecommendedFromAids(serverFavIds);
        saveFavServerCache(serverFavIds, serverVersion, data.updatedAt);
        clearUnsavedDraft();

        if (confirmBtn) {
          confirmBtn.disabled = false;
          confirmBtn.textContent = "確認してこの端末からサーバーへ移行する";
          delete confirmBtn.dataset.forceOverwrite;
        }
        closeFavMigrationModal();
        updateFavEditBannerStatus();
        renderStaticStats();
        updateUI(false);
        renderDetailPanel(false);
        showFavSyncToast(`既存の「かるのオススメ」（${serverFavIds.length}名義）をサーバーへ移行しました`);
      } catch (err) {
        // Migration failed: preserve existing localStorage untouched!
        if (confirmBtn) {
          confirmBtn.disabled = false;
          confirmBtn.textContent = "再試行：この端末からサーバーへ移行する";
        }
        if (errBox) {
          errBox.textContent = `${err && err.message ? err.message : "通信エラーが発生しました。"}（既存のハート設定は端末内に安全に保持されています）`;
          errBox.style.display = "block";
        }
      }
    }

    // ==================== Conflict Resolution Modal ====================
    const favConflictModal = document.getElementById("favConflictModal");
    let lastConflictServerData = null;

    function openFavConflictModal(serverData) {
      if (!favConflictModal || !serverData) return;
      lastConflictServerData = {
        ids: (serverData.ids || []).map(resolveToAid).filter(Boolean).sort(),
        version: typeof serverData.version === "number" ? serverData.version : 1,
        updatedAt: serverData.updatedAt || null
      };

      const currentIds = getSortedCurrentAids();
      const localDiff = computeDiffCounts(editSessionBaseIds, currentIds);
      const serverDiff = computeDiffCounts(editSessionBaseIds, lastConflictServerData.ids);

      const localSumEl = document.getElementById("favConflictLocalSummary");
      const localDetEl = document.getElementById("favConflictLocalDetail");
      const srvSumEl = document.getElementById("favConflictServerSummary");
      const srvDetEl = document.getElementById("favConflictServerDetail");

      if (localSumEl) localSumEl.textContent = `計 ${currentIds.length} 名義 (+${localDiff.added.length} / -${localDiff.removed.length})`;
      if (localDetEl) {
        const lines = [];
        if (localDiff.added.length > 0) lines.push(`【追加】${localDiff.added.map(resolveAidToName).filter(Boolean).join("、")}`);
        if (localDiff.removed.length > 0) lines.push(`【解除】${localDiff.removed.map(resolveAidToName).filter(Boolean).join("、")}`);
        localDetEl.textContent = lines.length > 0 ? lines.join(" / ") : "変更なし";
      }

      if (srvSumEl) srvSumEl.textContent = `計 ${lastConflictServerData.ids.length} 名義 (v${lastConflictServerData.version})`;
      if (srvDetEl) {
        const sLines = [];
        if (serverDiff.added.length > 0) sLines.push(`【他端末で追加】${serverDiff.added.map(resolveAidToName).filter(Boolean).join("、")}`);
        if (serverDiff.removed.length > 0) sLines.push(`【他端末で解除】${serverDiff.removed.map(resolveAidToName).filter(Boolean).join("、")}`);
        srvDetEl.textContent = sLines.length > 0 ? sLines.join(" / ") : `登録名義: ${lastConflictServerData.ids.slice(0, 15).map(resolveAidToName).filter(Boolean).join("、")}${lastConflictServerData.ids.length > 15 ? " ほか" : ""}`;
      }

      favConflictModal.classList.add("open");
      favConflictModal.setAttribute("aria-hidden", "false");
    }

    function closeFavConflictModal() {
      if (!favConflictModal) return;
      favConflictModal.classList.remove("open");
      favConflictModal.setAttribute("aria-hidden", "true");
    }

    // Secret 5-tap on top-left logo (.brand-disc-icon or .mobile-top-left)
    let secretLogoTapCount = 0;
    let secretLogoTapTimer = null;
    function handleSecretLogoTap() {
      secretLogoTapCount++;
      if (secretLogoTapTimer) clearTimeout(secretLogoTapTimer);
      if (secretLogoTapCount >= 5) {
        secretLogoTapCount = 0;
        if (!favQuickEditMode) {
          enterFavQuickEditMode();
        } else {
          // When already in edit mode, 5-tap triggers the same "完了して閉じる" save flow
          saveFavoritesToServer();
        }
      } else {
        secretLogoTapTimer = setTimeout(() => { secretLogoTapCount = 0; }, 1200);
      }
    }
    const brandIconEl = document.querySelector(".brand-disc-icon");
    if (brandIconEl) brandIconEl.addEventListener("click", handleSecretLogoTap);
    const mobTopLeftEl = document.querySelector(".mobile-top-left");
    if (mobTopLeftEl) mobTopLeftEl.addEventListener("click", handleSecretLogoTap);

    // 「完了して閉じる」 button
    const exitFavQeBtn = document.getElementById("exitFavQuickEditBtn");
    if (exitFavQeBtn) {
      exitFavQeBtn.addEventListener("click", () => {
        saveFavoritesToServer();
      });
    }

    // 「取消」 button in edit banner (discards unsaved changes and reverts to editSessionBaseIds)
    const discardFavQeBtn = document.getElementById("discardFavQuickEditBtn");
    if (discardFavQeBtn) {
      discardFavQeBtn.addEventListener("click", () => {
        if (isSavingFavorites) return;
        setRecommendedFromAids(editSessionBaseIds);
        clearUnsavedDraft();
        closeFavQuickEditModeCleanly();
        renderStaticStats();
        updateUI(false);
        renderDetailPanel(false);
        showFavSyncToast("未保存の変更を取り消しました");
      });
    }

    // Error row buttons ("再試行" & "一時保存して閉じる")
    const retryFavSaveBtn = document.getElementById("retryFavSaveBtn");
    if (retryFavSaveBtn) {
      retryFavSaveBtn.addEventListener("click", () => {
        saveFavoritesToServer();
      });
    }
    const closeKeepDraftBtn = document.getElementById("closeKeepDraftBtn");
    if (closeKeepDraftBtn) {
      closeKeepDraftBtn.addEventListener("click", () => {
        saveUnsavedDraft();
        closeFavQuickEditModeCleanly();
        showFavSyncToast("未保存の編集内容を端末に一時保存しました（次回編集時に復元されます）", true);
      });
    }

    // Unsaved Draft Restore Banner buttons
    const resumeFavDraftBtn = document.getElementById("resumeFavDraftBtn");
    if (resumeFavDraftBtn) {
      resumeFavDraftBtn.addEventListener("click", () => {
        enterFavQuickEditMode();
      });
    }
    const saveFavDraftNowBtn = document.getElementById("saveFavDraftNowBtn");
    if (saveFavDraftNowBtn) {
      saveFavDraftNowBtn.addEventListener("click", () => {
        enterFavQuickEditMode();
        saveFavoritesToServer();
      });
    }
    const discardFavDraftBtn = document.getElementById("discardFavDraftBtn");
    if (discardFavDraftBtn) {
      discardFavDraftBtn.addEventListener("click", () => {
        clearUnsavedDraft();
        setRecommendedFromAids(serverFavIds);
        editSessionBaseIds = [...serverFavIds];
        editSessionBaseVersion = serverVersion;
        updateDraftRestoreBannerUI();
        renderStaticStats();
        updateUI(false);
        renderDetailPanel(false);
        showFavSyncToast("未保存の編集データを破棄し、サーバーの状態に戻しました");
      });
    }

    // Migration Modal buttons
    const openLegacyMigrateBtn = document.getElementById("openLegacyMigrateBtn");
    if (openLegacyMigrateBtn) {
      openLegacyMigrateBtn.addEventListener("click", openFavMigrationModal);
    }
    const closeFavMigrationModalBtn = document.getElementById("closeFavMigrationModalBtn");
    if (closeFavMigrationModalBtn) {
      closeFavMigrationModalBtn.addEventListener("click", closeFavMigrationModal);
    }
    const postponeFavMigrationBtn = document.getElementById("postponeFavMigrationBtn");
    if (postponeFavMigrationBtn) {
      postponeFavMigrationBtn.addEventListener("click", closeFavMigrationModal);
    }
    const skipDeviceFavMigrationBtn = document.getElementById("skipDeviceFavMigrationBtn");
    if (skipDeviceFavMigrationBtn) {
      skipDeviceFavMigrationBtn.addEventListener("click", () => {
        try {
          localStorage.setItem(FAV_MIGRATION_STATE_KEY, "skipped");
        } catch (e) {}
        closeFavMigrationModal();
        if (hasFetchedServerOnce) {
          setRecommendedFromAids(serverFavIds);
          renderStaticStats();
          updateUI(false);
          renderDetailPanel(false);
        }
        showFavSyncToast("この端末からの初回移行をスキップしました");
      });
    }
    const confirmFavMigrationBtn = document.getElementById("confirmFavMigrationBtn");
    if (confirmFavMigrationBtn) {
      confirmFavMigrationBtn.addEventListener("click", () => {
        const force = confirmFavMigrationBtn.dataset.forceOverwrite === "1";
        executeLegacyMigration(force);
      });
    }

    // Conflict Modal buttons
    const closeFavConflictModalBtn = document.getElementById("closeFavConflictModalBtn");
    if (closeFavConflictModalBtn) {
      closeFavConflictModalBtn.addEventListener("click", closeFavConflictModal);
    }
    const conflictMergeSaveBtn = document.getElementById("conflictMergeSaveBtn");
    if (conflictMergeSaveBtn) {
      conflictMergeSaveBtn.addEventListener("click", () => {
        if (!lastConflictServerData) return;
        const currentIds = getSortedCurrentAids();
        const diff = computeDiffCounts(editSessionBaseIds, currentIds);
        const mergedSet = new Set(lastConflictServerData.ids);
        diff.added.forEach(id => mergedSet.add(id));
        diff.removed.forEach(id => mergedSet.delete(id));
        const mergedIds = Array.from(mergedSet).sort();

        serverFavIds = [...lastConflictServerData.ids];
        serverVersion = lastConflictServerData.version;
        editSessionBaseIds = [...lastConflictServerData.ids];
        editSessionBaseVersion = lastConflictServerData.version;
        setRecommendedFromAids(mergedIds);
        saveUnsavedDraft();
        closeFavConflictModal();
        renderStaticStats();
        updateUI(false);
        renderDetailPanel(false);
        saveFavoritesToServer({ customIds: mergedIds, customBaseVersion: lastConflictServerData.version });
      });
    }
    const conflictForceOverwriteBtn = document.getElementById("conflictForceOverwriteBtn");
    if (conflictForceOverwriteBtn) {
      conflictForceOverwriteBtn.addEventListener("click", () => {
        if (!lastConflictServerData) return;
        const currentIds = getSortedCurrentAids();
        editSessionBaseVersion = lastConflictServerData.version;
        closeFavConflictModal();
        saveFavoritesToServer({
          customIds: currentIds,
          customBaseVersion: lastConflictServerData.version,
          forceOverwrite: true
        });
      });
    }
    const conflictLoadServerBtn = document.getElementById("conflictLoadServerBtn");
    if (conflictLoadServerBtn) {
      conflictLoadServerBtn.addEventListener("click", () => {
        if (!lastConflictServerData) return;
        serverFavIds = [...lastConflictServerData.ids];
        serverVersion = lastConflictServerData.version;
        editSessionBaseIds = [...serverFavIds];
        editSessionBaseVersion = serverVersion;
        setRecommendedFromAids(serverFavIds);
        saveFavServerCache(serverFavIds, serverVersion, lastConflictServerData.updatedAt);
        clearUnsavedDraft();
        closeFavConflictModal();
        closeFavQuickEditModeCleanly();
        renderStaticStats();
        updateUI(false);
        renderDetailPanel(false);
        showFavSyncToast("サーバーの最新データを反映しました");
      });
    }

    // Startup non-blocking fetch + visibilitychange & gentle periodic check
    updateDraftRestoreBannerUI();
    fetchServerFavorites({ isInitial: true });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && Date.now() - lastServerFetchAt > 15000) {
        fetchServerFavorites({ silent: true });
      }
    });
    window.addEventListener("focus", () => {
      if (Date.now() - lastServerFetchAt > 15000) {
        fetchServerFavorites({ silent: true });
      }
    });
    setInterval(() => {
      if (document.visibilityState === "visible" && !favQuickEditMode) {
        fetchServerFavorites({ silent: true });
      }
    }, 180000);

    document.getElementById("detailScrollContent").addEventListener("click", e => {
      const openArtistBtn = e.target.closest("[data-open-artist]");
      if (openArtistBtn) {
        const targetName = openArtistBtn.getAttribute("data-open-artist");
        if (targetName && ARTIST_MAP.has(targetName)) {
          selectArtist(targetName, true);
          syncHistoryButtons();
        }
        return;
      }
      const agencyBtn = e.target.closest("[data-filter-agency]");
      if (agencyBtn) {
        const agGroup = agencyBtn.getAttribute("data-filter-agency") || "";
        const matchCount = DATA.filter(a => (a.agencyGroup || a.agency || "") === agGroup).length;
        if (agGroup && matchCount >= 2) {
          pushHistorySnapshot(true);
          if (state.agencyGroup === agGroup) {
            state.agencyGroup = "";
          } else {
            state.agencyGroup = agGroup;
            if (state.view === "search" || state.view === "recommend") {
              state.view = "all";
            }
          }
          updateUI(true);
          syncHistoryButtons();
        }
        return;
      }
      const modeBtn = e.target.closest("[data-detail-mode]");
      if (modeBtn) {
        state.detailMode = modeBtn.getAttribute("data-detail-mode");
        renderDetailPanel(true);
        return;
      }
      const sortBtn = e.target.closest("[data-song-sort]");
      if (sortBtn) {
        state.songSort = sortBtn.getAttribute("data-song-sort");
        renderDetailPanel(false);
      }
    });

    // Backdrop click closes mobile sheets
    document.getElementById("sheetBackdrop").addEventListener("click", () => {
      closeDetailPanel();
      closeMobFilterSheet();
    });

    // Browser Back button closes mobile bottom sheet gracefully
    window.addEventListener("popstate", () => {
      if (state.mobFilterOpen) {
        closeMobFilterSheet();
      } else if (state.selectedArtistName && window.innerWidth <= 900) {
        closeDetailPanel();
      }
    });

    window.addEventListener("resize", () => {
      syncMobileScrollLock();
      applyPcFontScale(state.pcFontScale, false);
    }, { passive: true });

    // Non-interfering touch swipe-down gesture for mobile bottom sheets
    setupBottomSheetSwipe(document.getElementById("rightDetailPanel"), closeDetailPanel);
    setupBottomSheetSwipe(document.getElementById("mobFilterSheet"), closeMobFilterSheet);
  }

  function setupBottomSheetSwipe(sheetEl, onClose) {
    let startY = 0;
    let startX = 0;
    let currentY = 0;
    let isDragging = false;
    let isHeaderStart = false;

    sheetEl.addEventListener("touchstart", e => {
      if (window.innerWidth > 900 || e.touches.length !== 1) return;
      const scrollBox = sheetEl.querySelector(".detail-scroll, .mob-sheet-body");
      isHeaderStart = Boolean(e.target.closest(".detail-top-bar, .sheet-drag-handle, .mob-sheet-header, .detail-hero"));
      if (!isHeaderStart && scrollBox && scrollBox.scrollTop > 0) {
        isDragging = false;
        return;
      }
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
      currentY = startY;
      isDragging = true;
    }, { passive: true });

    sheetEl.addEventListener("touchmove", e => {
      if (!isDragging || e.touches.length !== 1) return;
      const scrollBox = sheetEl.querySelector(".detail-scroll, .mob-sheet-body");
      if (!isHeaderStart && scrollBox && scrollBox.scrollTop > 0) {
        isDragging = false;
        sheetEl.style.transition = "";
        sheetEl.style.transform = "";
        return;
      }
      const y = e.touches[0].clientY;
      const x = e.touches[0].clientX;
      const dy = y - startY;
      const dx = x - startX;

      if (dy <= 0 || Math.abs(dx) > dy) {
        if (!isHeaderStart) {
          isDragging = false;
          sheetEl.style.transition = "";
          sheetEl.style.transform = "";
        }
        return;
      }

      currentY = y;
      if (dy > 6) {
        sheetEl.style.transition = "none";
        sheetEl.style.transform = `translateY(${dy}px)`;
      }
    }, { passive: true });

    sheetEl.addEventListener("touchend", () => {
      if (!isDragging) return;
      const dy = currentY - startY;
      isDragging = false;
      sheetEl.style.transition = "";
      sheetEl.style.transform = "";
      if (dy > 95) {
        onClose();
      }
    });
  }

  // Boot
  loadSavedFontScale();
  applyPcFontScale(state.pcFontScale, false);
  renderStaticStats();
  initEvents();
  // Select the #1 artist by default on desktop so the 3-column layout showcases Representative TOP 5 immediately
  syncSearchTargetUI();
  if (window.innerWidth > 900 && DATA.length > 0) {
    let topArtist = DATA[0];
    for (let i = 1; i < DATA.length; i++) {
      if (DATA[i].count > topArtist.count) topArtist = DATA[i];
    }
    if (topArtist) {
      state.selectedArtistName = topArtist.name;
      state.detailMode = "top5";
    }
  }
  updateUI(true);
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
})();
