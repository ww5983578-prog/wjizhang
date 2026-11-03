/* ------------------------------------------------------------------
   w记账 · app logic
   A deliberately dependency-free, local-first ledger for resale deals.
------------------------------------------------------------------- */
(() => {
  "use strict";

  const STORAGE_KEY = "niuzhangben.ledger.v1"; // legacy key: keep existing local data
  const ASSISTANT_PREF_KEY = "wjizhang.assistant.hidden.v1";
  const APP_VERSION = "1.1.2";
  const MAX_AMOUNT = 99999999;
  const MAX_QTY = 999;
  const ROUTES = ["home", "ledger", "stats", "settings"];
  const CATEGORY_NAMES = ["票务", "球鞋", "数码", "潮玩", "其他"];
  const CATEGORY_META = Object.freeze({
    票务: { char: "票", className: "cat-ticket", color: "#e9825b" },
    球鞋: { char: "鞋", className: "cat-sneaker", color: "#5b84e0" },
    数码: { char: "数", className: "cat-tech", color: "#9a7ae0" },
    潮玩: { char: "玩", className: "cat-toy", color: "#df6da4" },
    其他: { char: "其", className: "cat-other", color: "#8b8d80" },
  });

  const ICONS = {
    plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`,
    minus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>`,
    arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>`,
    arrowUpRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>`,
    chevronLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg>`,
    chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m10 6 6 6-6 6"/></svg>`,
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.7"/><path d="m20 20-3.8-3.8"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>`,
    trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4.8h6V7M6.8 7l.9 13h8.6l.9-13M10 11v5M14 11v5"/></svg>`,
    box: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21 7.8-9-4.8-9 4.8v8.4l9 4.8 9-4.8V7.8Z"/><path d="m3.4 7.5 8.6 4.7 8.6-4.7M12 21.2v-9"/></svg>`,
    download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M8 11l4 4 4-4M4.5 18v2.5h15V18"/></svg>`,
    upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3M8 7l4-4 4 4M4.5 18v2.5h15V18"/></svg>`,
    file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>`,
    table: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.2" y="4" width="17.6" height="16" rx="2.2"/><path d="M3.2 9.5h17.6M9.5 4v16"/></svg>`,
    shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 4.6 6v5.2c0 4.5 3.1 7.9 7.4 9.8 4.3-1.9 7.4-5.3 7.4-9.8V6L12 3Z"/><path d="m9 12 2 2 4-4"/></svg>`,
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.7h.01"/></svg>`,
    install: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v11M8 10l4 4 4-4"/><path d="M5 16v4h14v-4"/></svg>`,
    trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 4h8v4.2a4 4 0 0 1-8 0V4Z"/><path d="M8 6H4v1.7a4 4 0 0 0 4 4M16 6h4v1.7a4 4 0 0 1-4 4M12 12.2V17M8 21h8M9.5 17h5"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4.2 4L19 6.5"/></svg>`,
    chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>`,
    alert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5 21 20H3l9-16.5Z"/><path d="M12 9v5M12 17.2h.01"/></svg>`,
    send: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21 3-7.4 18-3.2-7.4L3 10.4 21 3Z"/><path d="m10.4 13.6 4.1-4.1"/></svg>`,
    refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.2 5.5"/><path d="M20 4v7h-7"/></svg>`,
  };

  const main = document.getElementById("main");
  const appShell = document.getElementById("appShell");
  const sheetLayer = document.getElementById("sheetLayer");
  const sheet = document.getElementById("sheet");
  const assistantLayer = document.getElementById("assistantLayer");
  const assistantSheet = document.getElementById("assistantSheet");
  const modalLayer = document.getElementById("modalLayer");
  const modal = document.getElementById("modal");
  const toastEl = document.getElementById("toast");
  const toastText = document.getElementById("toastText");
  const toastIcon = document.getElementById("toastIcon");
  const importFile = document.getElementById("importFile");
  const offlineNote = document.getElementById("offlineNote");

  let records = [];
  let deferredInstallPrompt = null;
  let toastTimer = null;
  let sheetState = null;
  let sheetCloseTimer = null;
  let modalState = null;
  let lastSheetFocus = null;
  let bootStorageError = false;
  let assistantDismissed = false;
  const assistant = {
    messages: [],
    typing: false,
    closeTimer: null,
    replyTimer: null,
    lastFocus: null,
    seq: 0,
  };

  const state = {
    route: "home",
    ledgerFilter: "all",
    search: "",
    statsMonth: currentMonthKey(),
  };

  /* ----------------------------- utils ----------------------------- */

  const ESCAPES = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ESCAPES[char]);
  }

  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function $$(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function roundMoney(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return 0;
    return Math.round((number + Number.EPSILON) * 100) / 100;
  }

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function todayISO() {
    const now = new Date();
    return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
  }

  function currentMonthKey() {
    const now = new Date();
    return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;
  }

  function isValidISODate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return false;
    const [year, month, day] = String(value).split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  function dayNumber(iso) {
    const [year, month, day] = String(iso).split("-").map(Number);
    return Date.UTC(year, month - 1, day) / 86400000;
  }

  function formatAmount(value) {
    const abs = Math.abs(roundMoney(value));
    const hasCents = Math.round(abs * 100) % 100 !== 0;
    return new Intl.NumberFormat("zh-CN", {
      minimumFractionDigits: hasCents ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(abs);
  }

  function formatMoney(value, options = {}) {
    const number = roundMoney(value);
    const sign = options.sign && number > 0 ? "+" : number < 0 ? "−" : "";
    return `${sign}¥${formatAmount(number)}`;
  }

  function formatPct(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "—";
    const rounded = Math.round(number * 10) / 10;
    return `${rounded < 0 ? "−" : ""}${Math.abs(rounded)
      .toFixed(1)
      .replace(/\.0$/, "")}%`;
  }

  function parseAmount(raw) {
    const text = String(raw ?? "")
      .replace(/[\s,，¥￥]/g, "")
      .trim();
    if (!text) return null;
    if (!/^(?:\d+\.?\d*|\.\d+)$/.test(text)) return null;
    const number = Number(text);
    if (!Number.isFinite(number) || number < 0 || number > MAX_AMOUNT) {
      return null;
    }
    return roundMoney(number);
  }

  function inputValue(value, blankZero = false) {
    const number = roundMoney(value);
    if (blankZero && number === 0) return "";
    if (!Number.isFinite(number)) return "";
    return Number.isInteger(number) ? String(number) : number.toFixed(2);
  }

  function clampQty(value) {
    const number = Math.round(Number(value));
    if (!Number.isFinite(number)) return 1;
    return Math.min(MAX_QTY, Math.max(1, number));
  }

  function uid() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function getCategory(name) {
    return CATEGORY_META[name] || CATEGORY_META["其他"];
  }

  function profitOf(record) {
    if (!record || record.status !== "sold") return 0;
    return roundMoney(
      (Number(record.revenue) || 0) -
        (Number(record.cost) || 0) -
        (Number(record.fees) || 0),
    );
  }

  function recordOrder(a, b) {
    const dateOrder = String(b.date).localeCompare(String(a.date));
    if (dateOrder !== 0) return dateOrder;
    return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
  }

  function shiftMonthKey(monthKey, delta) {
    const [year, month] = String(monthKey).split("-").map(Number);
    const shifted = new Date(year, month - 1 + delta, 1);
    return `${shifted.getFullYear()}-${pad2(shifted.getMonth() + 1)}`;
  }

  function formatMonthTitle(monthKey) {
    const [year, month] = String(monthKey).split("-").map(Number);
    return `${year}年${month}月`;
  }

  function formatShortDate(iso) {
    if (!isValidISODate(iso)) return "";
    const [, month, day] = iso.split("-").map(Number);
    return `${month}.${pad2(day)}`;
  }

  function formatHomeDate() {
    const now = new Date();
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    return `${now.getMonth() + 1}月${now.getDate()}日 · 周${weekdays[now.getDay()]}`;
  }

  function greeting() {
    const hour = new Date().getHours();
    if (hour < 5) return "夜深了";
    if (hour < 11) return "早上好";
    if (hour < 14) return "中午好";
    if (hour < 18) return "下午好";
    return "晚上好";
  }

  function stockDaysText(iso) {
    if (!isValidISODate(iso)) return "今天入库";
    const days = Math.max(0, dayNumber(todayISO()) - dayNumber(iso));
    if (days === 0) return "今天入库";
    if (days === 1) return "入库 1 天";
    return `入库 ${days} 天`;
  }

  function formatBytes(bytes) {
    const number = Number(bytes);
    if (!Number.isFinite(number) || number <= 0) return "0 KB";
    if (number < 1024) return `${number} B`;
    if (number < 1024 * 1024) return `${(number / 1024).toFixed(1)} KB`;
    return `${(number / 1024 / 1024).toFixed(1)} MB`;
  }

  function isStandalone() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  }

  /* -------------------------- persistence -------------------------- */

  function normalizeRecord(raw) {
    if (!raw || typeof raw !== "object") return null;
    const name = String(raw.name || raw.item || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 60);
    if (!name) return null;

    const status = raw.status === "stock" ? "stock" : "sold";
    const category = CATEGORY_META[raw.category] ? raw.category : "其他";
    const date = isValidISODate(raw.date) ? raw.date : todayISO();
    const createdAt = isValidISODate(String(raw.createdAt || "").slice(0, 10))
      ? raw.createdAt
      : new Date().toISOString();
    const updatedAt = isValidISODate(String(raw.updatedAt || "").slice(0, 10))
      ? raw.updatedAt
      : createdAt;
    const cost = parseAmount(raw.cost) ?? 0;
    const fees = parseAmount(raw.fees) ?? 0;
    const revenue = status === "sold" ? parseAmount(raw.revenue) ?? 0 : 0;

    return {
      id: typeof raw.id === "string" && raw.id ? raw.id.slice(0, 100) : uid(),
      name,
      category,
      status,
      qty: clampQty(raw.qty),
      cost,
      revenue,
      fees,
      date,
      note: String(raw.note || "").slice(0, 200),
      createdAt,
      updatedAt,
    };
  }

  function readStore() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { records: [], error: false };
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed) ? parsed : parsed && parsed.records;
      if (!Array.isArray(list)) return { records: [], error: true };
      return {
        records: list.map(normalizeRecord).filter(Boolean),
        error: false,
      };
    } catch (error) {
      console.warn("Could not read local ledger", error);
      return { records: [], error: true };
    }
  }

  function saveRecords() {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          schema: 1,
          app: "w记账",
          updatedAt: new Date().toISOString(),
          records,
        }),
      );
      return true;
    } catch (error) {
      console.warn("Could not save local ledger", error);
      showToast("保存失败，请检查浏览器的存储权限", "error");
      return false;
    }
  }

  function getRecord(id) {
    return records.find((record) => record.id === id) || null;
  }

  /* --------------------------- calculations ------------------------ */

  function summarize(recordsInRange) {
    const sold = recordsInRange.filter((record) => record.status === "sold");
    let revenue = 0;
    let cost = 0;
    let fees = 0;
    let units = 0;
    let totalProfit = 0;
    let best = null;
    let bestProfit = -Infinity;

    sold.forEach((record) => {
      const profit = profitOf(record);
      revenue += Number(record.revenue) || 0;
      cost += Number(record.cost) || 0;
      fees += Number(record.fees) || 0;
      units += Number(record.qty) || 0;
      totalProfit += profit;
      if (profit > bestProfit) {
        bestProfit = profit;
        best = record;
      }
    });

    revenue = roundMoney(revenue);
    cost = roundMoney(cost);
    fees = roundMoney(fees);
    totalProfit = roundMoney(totalProfit);

    return {
      sold,
      count: sold.length,
      revenue,
      cost,
      fees,
      units,
      profit: totalProfit,
      margin: revenue > 0 ? (totalProfit / revenue) * 100 : null,
      average: sold.length ? roundMoney(totalProfit / sold.length) : 0,
      best,
      bestProfit: best ? bestProfit : 0,
    };
  }

  function monthSummary(monthKey) {
    return summarize(
      records.filter(
        (record) =>
          record.status === "sold" && String(record.date).startsWith(monthKey),
      ),
    );
  }

  function allTimeSummary() {
    return summarize(records);
  }

  function stockSummary() {
    const items = records
      .filter((record) => record.status === "stock")
      .slice()
      .sort(recordOrder);
    return {
      items,
      count: items.length,
      units: items.reduce((total, item) => total + item.qty, 0),
      cost: roundMoney(
        items.reduce((total, item) => total + Number(item.cost || 0), 0),
      ),
    };
  }

  function getWeeklyData(monthKey) {
    const [year, month] = monthKey.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const buckets = [];
    for (let start = 1; start <= daysInMonth; start += 7) {
      const end = Math.min(daysInMonth, start + 6);
      buckets.push({ start, end, profit: 0, count: 0 });
    }
    records
      .filter(
        (record) =>
          record.status === "sold" && String(record.date).startsWith(monthKey),
      )
      .forEach((record) => {
        const day = Number(record.date.slice(8, 10));
        const bucket =
          buckets[Math.min(buckets.length - 1, Math.floor((day - 1) / 7))];
        if (!bucket) return;
        bucket.profit = roundMoney(bucket.profit + profitOf(record));
        bucket.count += 1;
      });
    return buckets;
  }

  function getCategoryBreakdown(monthKey) {
    const sold = records.filter(
      (record) =>
        record.status === "sold" && String(record.date).startsWith(monthKey),
    );
    const totalRevenue = roundMoney(
      sold.reduce((total, record) => total + (Number(record.revenue) || 0), 0),
    );
    const groups = new Map();
    sold.forEach((record) => {
      const category = CATEGORY_META[record.category] ? record.category : "其他";
      const current = groups.get(category) || {
        category,
        revenue: 0,
        count: 0,
      };
      current.revenue = roundMoney(
        current.revenue + (Number(record.revenue) || 0),
      );
      current.count += 1;
      groups.set(category, current);
    });
    return {
      totalRevenue,
      groups: Array.from(groups.values())
        .filter((group) => group.revenue > 0)
        .sort((a, b) => b.revenue - a.revenue),
    };
  }

  function getLedgerRecords() {
    const query = state.search.trim().toLowerCase();
    return records
      .filter((record) => {
        if (
          state.ledgerFilter !== "all" &&
          record.status !== state.ledgerFilter
        ) {
          return false;
        }
        if (!query) return true;
        return [record.name, record.category, record.note].some((field) =>
          String(field || "").toLowerCase().includes(query),
        );
      })
      .slice()
      .sort(recordOrder);
  }

  /* ----------------------------- toast ----------------------------- */

  function showToast(message, type = "success") {
    window.clearTimeout(toastTimer);
    toastText.textContent = message;
    toastIcon.textContent = type === "error" ? "!" : "✓";
    toastEl.classList.toggle("is-error", type === "error");
    toastEl.classList.add("is-visible");
    toastTimer = window.setTimeout(() => {
      toastEl.classList.remove("is-visible");
    }, 2800);
  }

  function haptic() {
    if (navigator.vibrate) {
      try {
        navigator.vibrate(12);
      } catch (error) {
        /* optional */
      }
    }
  }

  /* ----------------------------- markup ---------------------------- */

  function profitAmountMarkup(value, className, label) {
    const number = roundMoney(value);
    const stateClass =
      number < 0 ? "is-negative" : number === 0 ? "is-zero" : "";
    const sign = number > 0 ? "+" : number < 0 ? "−" : "";
    return `<div class="${className} ${stateClass}" aria-label="${esc(label)}">
      ${sign ? `<span class="profit-sign">${sign}</span>` : ""}
      <span class="currency">¥</span>
      <span>${formatAmount(number)}</span>
    </div>`;
  }

  function emptyArt() {
    return `<svg class="empty-art" viewBox="0 0 120 96" aria-hidden="true">
      <circle cx="58" cy="48" r="38" fill="#F0EDE2"/>
      <circle cx="94" cy="22" r="7" fill="#D7FA5A"/>
      <circle cx="22" cy="71" r="4" fill="#D7FA5A"/>
      <rect x="37" y="14" width="44" height="59" rx="8" fill="#141913" transform="rotate(-6 59 43.5)"/>
      <path d="M46 31h27M46 39h19M46 47h24" stroke="#D7FA5A" stroke-width="2.8" stroke-linecap="round" opacity=".9"/>
      <path d="M46 55h11" stroke="#D7FA5A" stroke-width="2.8" stroke-linecap="round" opacity=".45"/>
      <circle cx="83" cy="66" r="16" fill="#D7FA5A" stroke="#FFFDF6" stroke-width="4"/>
      <text x="83" y="72" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="800" fill="#141913">¥</text>
      <path d="M96 48c4 0 7 3 7 7M96 53c1 0 2 1 2 2" stroke="#141913" stroke-width="1.6" stroke-linecap="round" opacity=".22"/>
    </svg>`;
  }

  function emptyOnboarding(options = {}) {
    const title = options.title || "账本还是空的";
    const desc =
      options.desc ||
      "第一次用，就从手边这一单开始。把成本和卖价填进去，赚多少马上知道。";
    return `<section class="empty-onboarding">
      ${emptyArt()}
      <h2 class="empty-title">${esc(title)}</h2>
      <p class="empty-desc">${esc(desc)}</p>
      <div class="empty-steps">
        <div class="empty-step"><b>1</b><span>记下拿货成本，库存先放着</span></div>
        <div class="empty-step"><b>2</b><span>卖出后补上收入，利润自动算</span></div>
        <div class="empty-step"><b>3</b><span>每月看一眼，知道到底赚了多少</span></div>
      </div>
      <button class="empty-action" type="button" data-action="new">＋ 记第一单</button>
    </section>`;
  }

  function recordRow(record) {
    const category = getCategory(record.category);
    const sold = record.status === "sold";
    const profit = profitOf(record);
    const qtyNote =
      sold && record.qty > 1
        ? `<span class="meta-dot"></span><span>${record.qty} 件</span>`
        : "";
    return `<button class="record-row" type="button" data-action="edit" data-id="${esc(record.id)}" aria-label="编辑 ${esc(record.name)}">
      <span class="record-glyph ${category.className}" aria-hidden="true">${category.char}</span>
      <span class="record-main">
        <span class="record-name">${esc(record.name)}</span>
        <span class="record-meta">
          <span>${formatShortDate(record.date)}</span>
          <span class="meta-dot"></span>
          <span>成本 ${formatMoney(record.cost)}</span>
          ${qtyNote}
          ${sold ? "" : `<span class="meta-dot"></span><span class="stock-pill">在售</span>`}
        </span>
      </span>
      <span class="record-side">
        ${
          sold
            ? `<span class="record-value ${profit < 0 ? "is-negative" : ""}">${formatMoney(profit, { sign: true })}</span>
               <span class="record-sub">卖价 ${formatMoney(record.revenue)}</span>`
            : `<span class="record-value is-stock">${formatMoney(record.cost)}</span>
               <span class="record-sub">占用成本</span>`
        }
      </span>
    </button>`;
  }

  function stockCard(record) {
    const category = getCategory(record.category);
    return `<article class="stock-card">
      <button class="stock-card-main" type="button" data-action="edit" data-id="${esc(record.id)}" aria-label="查看 ${esc(record.name)}">
        <div class="stock-card-top">
          <span class="record-glyph ${category.className}" aria-hidden="true">${category.char}</span>
          <span class="stock-days">${stockDaysText(record.date)}</span>
        </div>
        <h3 class="stock-name">${esc(record.name)}</h3>
        <p class="stock-cost">${record.qty} 件 · 成本 <b>${formatMoney(record.cost)}</b></p>
      </button>
      <div class="stock-card-bottom">
        <span class="stock-status">在售中</span>
        <button class="sell-btn" type="button" data-action="sell" data-id="${esc(record.id)}">
          卖出 ${ICONS.arrowUpRight}
        </button>
      </div>
    </article>`;
  }

  function renderHome() {
    const month = currentMonthKey();
    const summary = monthSummary(month);
    const stock = stockSummary();
    const recent = records.slice().sort(recordOrder).slice(0, 4);
    const monthNumber = Number(month.slice(5, 7));
    const margin =
      summary.margin === null
        ? ""
        : `<span class="margin-pill ${summary.margin < 0 ? "is-negative" : ""}">毛利率 ${formatPct(summary.margin)}</span>`;
    const caption =
      summary.count > 0
        ? `<span>${summary.count} 单成交</span>${margin}`
        : `<span>记下成本和卖价，利润自动出现</span>`;

    const stockSection = stock.count
      ? `<section class="section">
          <div class="section-head">
            <h2 class="section-title">在售库存 <span class="section-count">${stock.units} 件</span></h2>
            <span class="section-side">压货 ${formatMoney(stock.cost)}</span>
          </div>
          <div class="stock-scroll" aria-label="在售库存列表">
            ${stock.items.map(stockCard).join("")}
          </div>
        </section>`
      : "";

    const recentSection = records.length
      ? `<section class="section">
          <div class="section-head">
            <h2 class="section-title">最近账目</h2>
            <button class="section-link" type="button" data-action="view-all">
              全部账目 ${ICONS.arrowRight}
            </button>
          </div>
          <div class="record-panel">
            ${recent.map(recordRow).join("")}
            ${records.length > recent.length ? `<div class="record-panel-note">只显示最近 ${recent.length} 笔 · 共 ${records.length} 笔</div>` : ""}
          </div>
        </section>`
      : emptyOnboarding();

    return `<section class="home-intro">
      <div class="intro-row">
        <p class="greeting">${greeting()}，老板</p>
        <span class="mini-date">${formatHomeDate()}</span>
      </div>
      <h1 class="home-title">今天的账，记了吗？</h1>
    </section>

    <section class="profit-card" aria-label="本月利润概览">
      <div class="profit-head">
        <span class="profit-label"><span class="profit-label-dot"></span>本月净赚</span>
        <span class="month-tag">${monthNumber}月 · 本月</span>
      </div>
      ${profitAmountMarkup(summary.profit, "profit-amount", `本月净赚 ${formatMoney(summary.profit)}`)}
      <p class="profit-caption">${caption}</p>
      <div class="profit-stats">
        <div class="profit-stat"><span>营收</span><b>${formatMoney(summary.revenue)}</b></div>
        <div class="profit-stat"><span>成本</span><b>${formatMoney(summary.cost)}</b></div>
        <div class="profit-stat"><span>费用</span><b>${formatMoney(summary.fees)}</b></div>
      </div>
    </section>

    <div class="quick-actions">
      <button class="quick-action quick-action-primary" type="button" data-action="new">
        <span class="quick-icon" aria-hidden="true">${ICONS.plus}</span>
        <span class="quick-copy"><b>记一单</b><small>成本 + 卖价，自动算</small></span>
      </button>
      <button class="quick-action quick-action-secondary" type="button" data-action="new-stock">
        <span class="quick-icon" aria-hidden="true">${ICONS.box}</span>
        <span class="quick-copy"><b>先入库</b><small>只记成本</small></span>
      </button>
    </div>

    ${stockSection}
    ${recentSection}`;
  }

  function renderLedger() {
    if (!records.length) {
      return `<section class="page-head">
        <div>
          <p class="page-kicker">LEDGER</p>
          <h1 class="page-title">账本</h1>
          <p class="page-sub">成本、卖价和利润，一笔不落。</p>
        </div>
        <div class="page-head-badge"><b>0</b>笔</div>
      </section>
      ${emptyOnboarding({ title: "还没有账目", desc: "记下第一笔成本，或者直接把已经卖掉的单子补进来。" })}`;
    }

    const filtered = getLedgerRecords();
    const counts = {
      all: records.length,
      sold: records.filter((record) => record.status === "sold").length,
      stock: records.filter((record) => record.status === "stock").length,
    };
    const filterLabels = [
      ["all", "全部"],
      ["sold", "已售"],
      ["stock", "在售"],
    ];

    return `<section class="page-head">
      <div>
        <p class="page-kicker">LEDGER</p>
        <h1 class="page-title">账本</h1>
        <p class="page-sub">成本、卖价和利润，一笔不落。</p>
      </div>
      <div class="page-head-badge"><b>${records.length}</b>笔</div>
    </section>

    <div class="search-box">
      ${ICONS.search}
      <input id="ledgerSearch" type="search" inputmode="search" autocomplete="off" placeholder="搜商品、分类或备注" value="${esc(state.search)}" aria-label="搜索账目">
      <button class="search-clear" id="ledgerSearchClear" type="button" data-action="clear-search" aria-label="清空搜索" ${state.search ? "" : "hidden"}>
        ${ICONS.close}
      </button>
    </div>

    <div class="filter-row" role="group" aria-label="筛选账目">
      ${filterLabels
        .map(
          ([key, label]) => `<button class="filter-chip ${state.ledgerFilter === key ? "is-active" : ""}" type="button" data-filter="${key}" aria-pressed="${state.ledgerFilter === key}">
            ${label}<span class="filter-count">${counts[key]}</span>
          </button>`,
        )
        .join("")}
    </div>

    <div class="ledger-summary" id="ledgerSummary">${ledgerSummaryMarkup(filtered)}</div>
    <div id="ledgerList">${ledgerListMarkup(filtered)}</div>`;
  }

  function ledgerSummaryMarkup(filtered) {
    if (!filtered.length) {
      return `<span>没有符合条件的账目</span><span></span>`;
    }
    const sold = filtered.filter((record) => record.status === "sold");
    const stockCost = roundMoney(
      filtered
        .filter((record) => record.status === "stock")
        .reduce((total, record) => total + record.cost, 0),
    );
    if (sold.length) {
      const profit = roundMoney(
        sold.reduce((total, record) => total + profitOf(record), 0),
      );
      return `<span>筛选出 <strong>${filtered.length}</strong> 笔 · 已售 ${sold.length}</span>
        <span>已实现净赚 <strong class="${profit < 0 ? "is-loss" : "is-profit"}">${formatMoney(profit, { sign: true })}</strong></span>`;
    }
    return `<span>筛选出 <strong>${filtered.length}</strong> 笔</span>
      <span>在售占用 <strong>${formatMoney(stockCost)}</strong></span>`;
  }

  function ledgerListMarkup(filtered) {
    if (!filtered.length) {
      const searching = Boolean(state.search.trim());
      const stockOnly = state.ledgerFilter === "stock";
      const title = searching
        ? "没搜到这笔"
        : stockOnly
          ? "没有在售的货"
          : "没有这类账目";
      const desc = searching
        ? "换个商品名、分类或备注再试试。"
        : stockOnly
          ? "先入库的货会出现在这里；卖出后会自动转为已售。"
          : "把成本记下来，卖出后利润会自动归位。";
      return `<div class="empty-card ledger-empty">
        <div class="empty-symbol">${ICONS.search}</div>
        <h3>${title}</h3>
        <p>${desc}</p>
        <button class="empty-action" type="button" data-action="reset-ledger">清空筛选</button>
      </div>`;
    }

    const groups = new Map();
    filtered.forEach((record) => {
      const month = record.date.slice(0, 7);
      if (!groups.has(month)) groups.set(month, []);
      groups.get(month).push(record);
    });

    return Array.from(groups.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([month, items]) => {
        const sold = items.filter((record) => record.status === "sold");
        const profit = roundMoney(
          sold.reduce((total, record) => total + profitOf(record), 0),
        );
        const stockCost = roundMoney(
          items
            .filter((record) => record.status === "stock")
            .reduce((total, record) => total + record.cost, 0),
        );
        const meta = sold.length
          ? `${sold.length} 笔已售 · ${profit < 0 ? "亏损" : "净赚"} ${formatMoney(Math.abs(profit))}`
          : `${items.length} 笔在售 · 占用 ${formatMoney(stockCost)}`;
        return `<section class="month-block">
          <div class="month-block-head">
            <h3>${formatMonthTitle(month)}</h3>
            <span>${meta}</span>
          </div>
          <div class="record-panel">${items.map(recordRow).join("")}</div>
        </section>`;
      })
      .join("");
  }

  function renderStats() {
    const month = state.statsMonth || currentMonthKey();
    const summary = monthSummary(month);
    const current = currentMonthKey();
    const atCurrent = month >= current;
    const stock = stockSummary();
    const weekly = getWeeklyData(month);
    const categories = getCategoryBreakdown(month);
    const margin =
      summary.margin === null
        ? ""
        : `<span class="stats-meta-pill">毛利率 ${formatPct(summary.margin)}</span>`;

    let body = "";
    if (summary.count === 0) {
      const stockCopy = stock.count
        ? `，手上还有 ${stock.units} 件在售，占用 ${formatMoney(stock.cost)}`
        : "";
      body = `<div class="stats-empty">
        <b>这个月还没有卖出的账目</b>
        <p>已卖出的账目才算进当月利润${stockCopy}。先记一单，数据就活了。</p>
        <button class="empty-action" type="button" data-action="new">＋ 记一单</button>
      </div>
      <p class="formula-note">${ICONS.info}<span>利润 = 卖出收入 − 拿货成本 − 其他费用。在售库存只占成本，不计入当月利润。</span></p>`;
    } else {
      const maxWeek = Math.max(
        1,
        ...weekly.map((bucket) => Math.abs(bucket.profit)),
      );
      const weekRows = weekly
        .map((bucket) => {
          const width = Math.min(
            100,
            (Math.abs(bucket.profit) / maxWeek) * 100,
          );
          const negative = bucket.profit < 0;
          const zero = bucket.profit === 0;
          return `<div class="week-row">
            <span class="week-label">${bucket.start}–${bucket.end}</span>
            <span class="week-track" aria-hidden="true">
              <span class="week-fill ${negative ? "is-negative" : ""}" data-width="${width.toFixed(1)}" style="width:0%"></span>
            </span>
            <span class="week-amount ${negative ? "is-negative" : ""} ${zero ? "is-zero" : ""}">${formatMoney(bucket.profit, { sign: true })}</span>
          </div>`;
        })
        .join("");

      const categoryRows = categories.groups
        .map((group) => {
          const meta = getCategory(group.category);
          const share =
            categories.totalRevenue > 0
              ? (group.revenue / categories.totalRevenue) * 100
              : 0;
          return `<div class="cat-item">
            <div class="cat-item-top">
              <span class="cat-label"><span class="cat-dot" style="background:${meta.color}"></span>${group.category}<small>${group.count} 单 · ${formatPct(share)}</small></span>
              <span class="cat-amount">${formatMoney(group.revenue)}</span>
            </div>
            <div class="cat-track" aria-hidden="true">
              <span class="cat-fill" data-width="${share.toFixed(1)}" style="width:0%;background:${meta.color}"></span>
            </div>
          </div>`;
        })
        .join("");

      const best = summary.best;
      const bestCategory = best ? getCategory(best.category) : null;

      body = `<div class="metric-grid">
        <div class="metric-card"><span>成交单数</span><b>${summary.count}<small>单</small></b></div>
        <div class="metric-card"><span>卖出件数</span><b>${summary.units}<small>件</small></b></div>
        <div class="metric-card"><span>平均每单</span><b class="${summary.average < 0 ? "text-red" : ""}">${formatMoney(summary.average, { sign: true })}</b></div>
        <div class="metric-card"><span>最高单笔</span><b class="${summary.bestProfit < 0 ? "text-red" : ""}">${formatMoney(summary.bestProfit, { sign: true })}</b></div>
      </div>

      <section class="panel">
        <div class="panel-head">
          <h3 class="panel-title">每周净赚</h3>
          <span class="panel-sub">按成交日 · ${weekly.length} 周</span>
        </div>
        ${weekRows}
      </section>

      ${
        categories.groups.length
          ? `<section class="panel">
              <div class="panel-head">
                <h3 class="panel-title">收入构成</h3>
                <span class="panel-sub">按品类</span>
              </div>
              ${categoryRows}
            </section>`
          : ""
      }

      ${
        best && summary.bestProfit > 0
          ? `<section class="panel">
              <div class="panel-head">
                <h3 class="panel-title">本月最赚</h3>
                <span class="panel-sub">单笔</span>
              </div>
              <div class="best-deal">
                <span class="best-icon" aria-hidden="true">${ICONS.trophy}</span>
                <span class="best-copy">
                  <b>${esc(best.name)}</b>
                  <span>${bestCategory.char} ${best.category} · ${formatShortDate(best.date)} · 卖价 ${formatMoney(best.revenue)}</span>
                </span>
                <span class="best-amount">${formatMoney(summary.bestProfit, { sign: true })}</span>
              </div>
            </section>`
          : ""
      }

      <p class="formula-note">${ICONS.info}<span>只统计已卖出账目。利润 = 卖出收入 − 拿货成本 − 其他费用；在售库存不计入利润。</span></p>`;
    }

    return `<section class="page-head">
      <div>
        <p class="page-kicker">INSIGHTS</p>
        <h1 class="page-title">统计</h1>
        <p class="page-sub">把每一单的赚头，看得更清楚。</p>
      </div>
      <div class="page-head-badge"><b>${summary.count}</b>单</div>
    </section>

    <div class="month-switcher">
      <button class="month-arrow" type="button" data-action="stats-prev" aria-label="上个月">${ICONS.chevronLeft}</button>
      <div class="month-label">
        <b>${formatMonthTitle(month)}</b>
        <small>${month === current ? "本月" : "历史账期"}</small>
      </div>
      <button class="month-arrow" type="button" data-action="stats-next" aria-label="下个月" ${atCurrent ? "disabled" : ""}>${ICONS.chevronRight}</button>
    </div>

    <section class="stats-hero" aria-label="${esc(formatMonthTitle(month))}利润">
      <div class="stats-eyebrow"><span class="stats-eyebrow-dot"></span>当月净赚</div>
      ${profitAmountMarkup(summary.profit, "stats-amount", `${formatMonthTitle(month)}净赚 ${formatMoney(summary.profit)}`)}
      <div class="stats-meta">
        <span>${summary.count ? `${summary.count} 单成交 · ${summary.units} 件` : "还没有成交"}</span>
        ${margin}
      </div>
    </section>

    ${body}`;
  }

  function renderSettings() {
    const totals = allTimeSummary();
    const stock = stockSummary();
    let storageBytes = 0;
    try {
      storageBytes = new Blob([
        window.localStorage.getItem(STORAGE_KEY) || "",
      ]).size;
    } catch (error) {
      storageBytes = 0;
    }
    const installCard = isStandalone()
      ? ""
      : `<button class="install-card" type="button" data-action="install">
          <span class="install-icon" aria-hidden="true">${ICONS.install}</span>
          <span class="install-copy"><b>把 w记账 放到桌面</b><span>像 App 一样打开，不用每次找网址</span></span>
          ${ICONS.chevronRight}
        </button>`;

    return `<section class="page-head">
      <div>
        <p class="page-kicker">PROFILE</p>
        <h1 class="page-title">我的</h1>
        <p class="page-sub">账在自己的手机里，心里才踏实。</p>
      </div>
    </section>

    <section class="identity-card">
      <div class="identity-top">
        <span class="identity-mark" aria-hidden="true">w</span>
        <div class="identity-copy">
          <b>w记账</b>
          <span>LOCAL LEDGER · 所有数据只在本机</span>
        </div>
        <span class="identity-privacy">${ICONS.shield} 不上传</span>
      </div>
      <div class="identity-stats">
        <div class="identity-stat"><span>累计净赚</span><b>${formatMoney(totals.profit, { sign: true })}</b></div>
        <div class="identity-stat"><span>账目笔数</span><b>${records.length}</b></div>
        <div class="identity-stat"><span>在售件数</span><b>${stock.units}</b></div>
      </div>
    </section>

    ${installCard}

    <p class="settings-group-label">小助手</p>
    <div class="settings-group">
      <button class="settings-item" type="button" role="switch" aria-checked="${!assistantDismissed}" data-action="toggle-assistant">
        <span class="settings-icon assistant-setting-icon" aria-hidden="true"><img src="./icons/naiba-avatar-idle.png" alt=""></span>
        <span class="settings-copy"><b>奶娃助手</b><span>${assistantDismissed ? "已收起，点此重新显示" : "已开启，点此收起"}</span></span>
        <span class="settings-toggle ${assistantDismissed ? "" : "is-on"}" aria-hidden="true"></span>
      </button>
    </div>

    <p class="settings-group-label">数据与备份</p>
    <div class="settings-group">
      <button class="settings-item" type="button" data-action="export-json">
        <span class="settings-icon">${ICONS.file}</span>
        <span class="settings-copy"><b>导出 JSON 备份</b><span>完整账目 · 换手机或换浏览器时用</span></span>
        <span class="settings-arrow">${ICONS.arrowRight}</span>
      </button>
      <button class="settings-item" type="button" data-action="export-csv">
        <span class="settings-icon">${ICONS.table}</span>
        <span class="settings-copy"><b>导出表格 CSV</b><span>Excel、微信表格都能打开</span></span>
        <span class="settings-arrow">${ICONS.arrowRight}</span>
      </button>
      <button class="settings-item" type="button" data-action="import-json">
        <span class="settings-icon">${ICONS.upload}</span>
        <span class="settings-copy"><b>从备份恢复</b><span>导入 JSON 文件，替换当前账目</span></span>
        <span class="settings-arrow">${ICONS.arrowRight}</span>
      </button>
    </div>

    <p class="settings-group-label">应用</p>
    <div class="settings-group">
      <button class="settings-item" type="button" data-action="help">
        <span class="settings-icon">${ICONS.info}</span>
        <span class="settings-copy"><b>怎么用 / 利润怎么算</b><span>一分钟看懂记账规则</span></span>
        <span class="settings-arrow">${ICONS.arrowRight}</span>
      </button>
      <button class="settings-item is-danger" type="button" data-action="clear-data">
        <span class="settings-icon is-danger">${ICONS.trash}</span>
        <span class="settings-copy"><b>清空全部账目</b><span>删除本机记录，操作无法撤销</span></span>
        <span class="settings-arrow">${ICONS.arrowRight}</span>
      </button>
    </div>

    <div class="data-note">${ICONS.shield}<span>账目只保存在当前浏览器，不经过服务器。换手机、清理浏览器数据前，记得先导出 JSON 备份。当前占用 ${formatBytes(storageBytes)}。</span></div>
    <p class="about-line">w记账 v${APP_VERSION} · 本机账本 · 离线可用</p>`;
  }

  /* ---------------------------- navigation ------------------------- */

  function renderView() {
    if (state.route === "home") return renderHome();
    if (state.route === "ledger") return renderLedger();
    if (state.route === "stats") return renderStats();
    return renderSettings();
  }

  function renderApp(options = {}) {
    const animate = options.animate === true;
    main.innerHTML = renderView();
    if (animate) {
      main.classList.remove("view-enter");
      void main.offsetWidth;
      main.classList.add("view-enter");
    }
    updateTabbar();
    bindPage();
    document.title =
      state.route === "home"
        ? "w记账 · 顺手记，明白赚"
        : `${state.route === "ledger" ? "账本" : state.route === "stats" ? "统计" : "我的"} · w记账`;
    if (state.route === "stats") animateBars();
  }

  function updateTabbar() {
    $$(".tab[data-tab]").forEach((tab) => {
      const active = tab.dataset.tab === state.route;
      tab.classList.toggle("is-active", active);
      if (active) tab.setAttribute("aria-current", "page");
      else tab.removeAttribute("aria-current");
    });
  }

  function bindPage() {
    if (state.route !== "ledger") return;
    const input = $("#ledgerSearch");
    if (input) {
      input.addEventListener("input", () => {
        state.search = input.value;
        refreshLedger();
      });
    }
    $$(".filter-chip").forEach((button) => {
      button.addEventListener("click", () => {
        state.ledgerFilter = button.dataset.filter || "all";
        refreshLedger();
      });
    });
  }

  function refreshLedger() {
    if (state.route !== "ledger") return;
    const filtered = getLedgerRecords();
    const list = $("#ledgerList");
    const summary = $("#ledgerSummary");
    const clear = $("#ledgerSearchClear");
    if (list) list.innerHTML = ledgerListMarkup(filtered);
    if (summary) summary.innerHTML = ledgerSummaryMarkup(filtered);
    if (clear) clear.hidden = !state.search;
    $$(".filter-chip").forEach((button) => {
      const active = button.dataset.filter === state.ledgerFilter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function animateBars() {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        $$(".week-fill, .cat-fill").forEach((bar) => {
          bar.style.width = `${bar.dataset.width || 0}%`;
        });
      });
    });
  }

  function getRouteFromHash() {
    const route = window.location.hash.replace(/^#\/?/, "");
    return ROUTES.includes(route) ? route : "home";
  }

  function navigate(route) {
    if (!ROUTES.includes(route)) return;
    if (state.route === route) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (window.location.hash === `#${route}`) {
      state.route = route;
      renderApp({ animate: true });
      window.scrollTo(0, 0);
    } else {
      window.location.hash = route;
    }
  }

  /* --------------------------- entry sheet ------------------------- */

  function entryCategoryChips(selected) {
    return CATEGORY_NAMES.map((name) => {
      const meta = getCategory(name);
      const active = selected === name;
      return `<button class="category-chip ${active ? "is-active" : ""}" type="button" data-cat="${esc(name)}" aria-pressed="${active}">
        <span class="cat-mini ${meta.className}">${meta.char}</span>${name}
      </button>`;
    }).join("");
  }

  function entrySheetTemplate(mode, record, status) {
    const isNew = mode === "new";
    const isSell = mode === "sell";
    const isStock = status === "stock";
    const category = record ? record.category : "票务";
    const qty = record ? record.qty : 1;
    const cost = record ? inputValue(record.cost) : "";
    const revenue =
      record && !isSell
        ? record.status === "sold"
          ? inputValue(record.revenue)
          : ""
        : "";
    const fees = record ? inputValue(record.fees, true) : "";
    const date = isSell ? todayISO() : record ? record.date : todayISO();
    const note = record ? record.note : "";
    const kicker = isSell
      ? "补记收入"
      : isNew
        ? isStock
          ? "在售库存"
          : "新账目"
        : isStock
          ? "在售库存"
          : "已卖出";
    const title = isSell
      ? "卖出这一单"
      : isNew
        ? isStock
          ? "记一笔库存"
          : "记一单"
        : "编辑账目";
    const saveLabel = isSell
      ? "确认卖出"
      : isNew
        ? isStock
          ? "存入在售"
          : "保存账目"
        : "保存修改";
    const statusToggle = isNew
      ? `<div class="status-segment" role="group" aria-label="账目状态">
          <button class="status-option ${isStock ? "" : "is-active"}" type="button" data-sheet-status="sold" aria-pressed="${!isStock}">
            ${ICONS.check} 已卖出
          </button>
          <button class="status-option ${isStock ? "is-active" : ""}" type="button" data-sheet-status="stock" aria-pressed="${isStock}">
            ${ICONS.box} 在售库存
          </button>
        </div>
        <p class="status-hint" id="entryStatusHint">${isStock ? "先记成本，卖出时再补收入；库存不计入当月利润。" : "填好卖价，保存后自动算利润。"}</p>`
      : "";
    const deleteButton =
      !isNew && record
        ? `<button class="sheet-icon-btn is-danger" type="button" data-action="delete-record" data-id="${esc(record.id)}" aria-label="删除这笔账">${ICONS.trash}</button>`
        : "";

    return `<div class="sheet-grabber" aria-hidden="true"></div>
      <div class="sheet-head">
        <div class="sheet-heading">
          <div class="sheet-kicker"><span class="kicker-dot ${isStock ? "is-stock" : ""}"></span>${kicker}</div>
          <h2 class="sheet-title" id="sheetTitle">${title}</h2>
        </div>
        <div class="sheet-head-actions">
          ${deleteButton}
          <button class="sheet-icon-btn" id="sheetClose" type="button" data-action="close-sheet" aria-label="关闭">${ICONS.close}</button>
        </div>
      </div>

      <form class="entry-form" id="entryForm" novalidate>
        <div class="sheet-body">
          ${statusToggle}

          <div class="form-section">
            <label class="field-label" for="entryName">卖出什么 <span>必填</span></label>
            <input class="field-input name-input" id="entryName" name="name" type="text" maxlength="60" autocomplete="off" placeholder="例如：演唱会内场票 2 连座" value="${esc(record ? record.name : "")}" aria-describedby="entryNameError">
            <div class="field-error" id="entryNameError">先填一下卖了什么</div>
            <div class="category-row" role="group" aria-label="选择分类">
              ${entryCategoryChips(category)}
            </div>
          </div>

          <div class="form-section">
            <div class="money-grid ${isStock ? "is-single" : ""}" id="moneyFields">
              <div class="field">
                <label class="field-label" for="entryCost">拿货成本 <span>总成本</span></label>
                <div class="money-input-wrap">
                  <span class="currency-prefix" aria-hidden="true">¥</span>
                  <input class="field-input money-input" id="entryCost" name="cost" type="text" inputmode="decimal" autocomplete="off" placeholder="0" value="${esc(cost)}" aria-describedby="entryCostError">
                </div>
                <div class="field-error" id="entryCostError">成本要填一个大于等于 0 的数字</div>
              </div>
              <div class="field" id="revenueField" ${isStock ? "hidden" : ""}>
                <label class="field-label" for="entryRevenue">卖出收入 <span>总卖价</span></label>
                <div class="money-input-wrap">
                  <span class="currency-prefix" aria-hidden="true">¥</span>
                  <input class="field-input money-input" id="entryRevenue" name="revenue" type="text" inputmode="decimal" autocomplete="off" placeholder="0" value="${esc(revenue)}" aria-describedby="entryRevenueError">
                </div>
                <div class="field-error" id="entryRevenueError">卖掉的话，把卖价填上</div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="inline-grid">
              <div class="field">
                <label class="field-label" for="entryQtyValue">数量 <span>件</span></label>
                <div class="qty-stepper">
                  <button class="qty-btn" type="button" data-qty-step="-1" aria-label="减少数量" ${qty <= 1 ? "disabled" : ""}>${ICONS.minus}</button>
                  <span class="qty-value" id="entryQtyValue" aria-live="polite">${qty}</span>
                  <button class="qty-btn" type="button" data-qty-step="1" aria-label="增加数量" ${qty >= MAX_QTY ? "disabled" : ""}>${ICONS.plus}</button>
                </div>
              </div>
              <div class="field">
                <label class="field-label" for="entryFees">其他费用 <span>可选</span></label>
                <div class="money-input-wrap">
                  <span class="currency-prefix" aria-hidden="true">¥</span>
                  <input class="field-input money-input money-soft" id="entryFees" name="fees" type="text" inputmode="decimal" autocomplete="off" placeholder="手续费、运费" value="${esc(fees)}" aria-describedby="entryFeesError">
                </div>
                <div class="field-error" id="entryFeesError">费用要填数字，没有就留空</div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <label class="field-label" for="entryDate" id="dateLabelText">${isStock ? "入库日期" : isSell ? "卖出日期" : "成交日期"}</label>
            <input class="field-input date-input" id="entryDate" name="date" type="date" value="${esc(date)}" max="${todayISO()}">
            <div class="field-error" id="entryDateError">选一个有效日期</div>
          </div>

          <div class="form-section">
            <label class="field-label" for="entryNote">备注 <span>可选</span></label>
            <textarea class="field-input field-textarea" id="entryNote" name="note" maxlength="200" placeholder="买家、渠道、取货方式…">${esc(note)}</textarea>
          </div>

          <div class="entry-hint" id="entryHint">${ICONS.info}<span>${isStock ? "先记成本，卖出时在首页点「卖出」补收入，再自动结算利润。" : "利润 = 卖出收入 − 拿货成本 − 其他费用。"}</span></div>
        </div>

        <div class="sheet-footer">
          <div class="live-total">
            <div class="live-total-label" id="liveLabel">${isStock ? "占用成本" : isSell ? "卖出净赚" : "这单净赚"}</div>
            <div class="live-total-value" id="liveTotal" aria-live="polite">—</div>
          </div>
          <button class="save-btn" id="sheetSave" type="submit">${saveLabel}</button>
        </div>
      </form>`;
  }

  function openEntry(options = {}) {
    const mode = options.mode || "new";
    const record = options.id ? getRecord(options.id) : null;
    if ((mode === "edit" || mode === "sell") && !record) return;
    if (!sheetLayer.hidden) return;

    toastEl.classList.remove("is-visible");
    const status =
      mode === "new"
        ? options.status === "stock"
          ? "stock"
          : "sold"
        : mode === "sell"
          ? "sold"
          : record.status;
    const prefill =
      mode === "new" && options.prefill && typeof options.prefill === "object"
        ? options.prefill
        : null;
    const seed =
      record ||
      (prefill
        ? {
            name: String(prefill.name || "").slice(0, 60),
            category: CATEGORY_META[prefill.category]
              ? prefill.category
              : "票务",
            status,
            qty: clampQty(prefill.qty || 1),
            cost: prefill.cost != null ? prefill.cost : "",
            revenue: prefill.revenue != null ? prefill.revenue : "",
            fees: prefill.fees != null ? prefill.fees : "",
            date: todayISO(),
            note: String(prefill.note || "").slice(0, 200),
          }
        : null);

    sheetState = {
      mode,
      id: record ? record.id : null,
      status,
      category: seed ? seed.category : "票务",
      qty: seed ? seed.qty : 1,
      submitting: false,
    };
    lastSheetFocus = document.activeElement;
    window.clearTimeout(sheetCloseTimer);
    sheet.innerHTML = entrySheetTemplate(mode, seed, status);
    sheetLayer.hidden = false;
    updateInteractionLock();
    bindEntryForm();
    window.requestAnimationFrame(() => sheetLayer.classList.add("is-open"));
    sheet.focus({ preventScroll: true });
    if (window.matchMedia("(pointer: fine)").matches) {
      window.setTimeout(() => {
        if (!sheetState) return;
        if (mode === "sell") $("#entryRevenue")?.focus();
        else $("#entryName")?.focus();
      }, 280);
    }
    updateLivePreview();
  }

  function bindEntryForm() {
    const form = $("#entryForm");
    if (!form || !sheetState) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitEntry();
    });
    form.addEventListener("input", (event) => {
      if (
        event.target.matches &&
        event.target.matches(".field-input, .field-textarea")
      ) {
        clearFieldError(event.target);
        updateLivePreview();
      }
    });

    $$(".category-chip", form).forEach((button) => {
      button.addEventListener("click", () => {
        if (!sheetState) return;
        sheetState.category = button.dataset.cat || "票务";
        $$(".category-chip", form).forEach((chip) => {
          const active = chip === button;
          chip.classList.toggle("is-active", active);
          chip.setAttribute("aria-pressed", String(active));
        });
      });
    });

    $$("[data-qty-step]", form).forEach((button) => {
      button.addEventListener("click", () => {
        if (!sheetState) return;
        setQty(sheetState.qty + Number(button.dataset.qtyStep));
      });
    });

    $$("[data-sheet-status]", form).forEach((button) => {
      button.addEventListener("click", () => {
        setEntryStatus(button.dataset.sheetStatus);
      });
    });
  }

  function setQty(value) {
    if (!sheetState) return;
    sheetState.qty = clampQty(value);
    const valueEl = $("#entryQtyValue");
    if (valueEl) valueEl.textContent = String(sheetState.qty);
    const decrement = $('[data-qty-step="-1"]');
    const increment = $('[data-qty-step="1"]');
    if (decrement) decrement.disabled = sheetState.qty <= 1;
    if (increment) increment.disabled = sheetState.qty >= MAX_QTY;
  }

  function setEntryStatus(status) {
    if (!sheetState) return;
    const next = status === "stock" ? "stock" : "sold";
    sheetState.status = next;
    const isStock = next === "stock";
    $$("[data-sheet-status]").forEach((button) => {
      const active = button.dataset.sheetStatus === next;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    const revenueField = $("#revenueField");
    const moneyFields = $("#moneyFields");
    const dateLabel = $("#dateLabelText");
    const save = $("#sheetSave");
    const hint = $("#entryStatusHint");
    const entryHint = $("#entryHint");
    const liveLabel = $("#liveLabel");
    if (revenueField) revenueField.hidden = isStock;
    if (moneyFields) moneyFields.classList.toggle("is-single", isStock);
    if (dateLabel) dateLabel.textContent = isStock ? "入库日期" : "成交日期";
    if (save) save.textContent = isStock ? "存入在售" : "保存账目";
    if (hint)
      hint.textContent = isStock
        ? "先记成本，卖出时再补收入；库存不计入当月利润。"
        : "填好卖价，保存后自动算利润。";
    if (entryHint)
      entryHint.innerHTML = `${ICONS.info}<span>${isStock ? "先记成本，卖出时在首页点「卖出」补收入，再自动结算利润。" : "利润 = 卖出收入 − 拿货成本 − 其他费用。"}</span>`;
    if (liveLabel) liveLabel.textContent = isStock ? "占用成本" : "这单净赚";
    updateLivePreview();
  }

  function clearFieldError(input) {
    input.classList.remove("is-invalid");
    const errorId = input.getAttribute("aria-describedby");
    if (errorId) {
      const error = document.getElementById(errorId);
      if (error) error.classList.remove("is-shown");
    }
  }

  function showFieldError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (input) {
      input.classList.add("is-invalid");
    }
    if (error) {
      error.textContent = message;
      error.classList.add("is-shown");
    }
    return input;
  }

  function clearAllEntryErrors() {
    $$(".field-input.is-invalid, .field-textarea.is-invalid").forEach((input) =>
      input.classList.remove("is-invalid"),
    );
    $$(".field-error.is-shown").forEach((error) =>
      error.classList.remove("is-shown"),
    );
  }

  function setLiveValue(text, tone) {
    const liveTotal = $("#liveTotal");
    if (!liveTotal) return;
    liveTotal.textContent = text;
    liveTotal.classList.toggle("is-negative", tone === "negative");
    liveTotal.classList.toggle("is-muted", tone === "muted");
    liveTotal.classList.toggle("is-neutral", tone === "neutral");
  }

  function updateLivePreview() {
    if (!sheetState) return;
    const costInput = $("#entryCost");
    const revenueInput = $("#entryRevenue");
    const feesInput = $("#entryFees");
    if (!costInput || !feesInput) return;

    const feesRaw = feesInput.value.trim();
    const fees = feesRaw === "" ? 0 : parseAmount(feesRaw);
    const cost = parseAmount(costInput.value);
    const isStock = sheetState.status === "stock";

    if (fees === null) {
      setLiveValue("费用有误", "muted");
      return;
    }

    if (isStock) {
      if (cost === null) {
        setLiveValue("待填成本", "muted");
      } else {
        setLiveValue(formatMoney(cost), "neutral");
      }
      return;
    }

    const revenue = revenueInput ? parseAmount(revenueInput.value) : null;
    if (cost === null && revenue === null) {
      setLiveValue("待填金额", "muted");
      return;
    }
    if (cost === null) {
      setLiveValue("待填成本", "muted");
      return;
    }
    if (revenue === null) {
      setLiveValue("待填卖价", "muted");
      return;
    }
    const profit = roundMoney(revenue - cost - fees);
    setLiveValue(
      formatMoney(profit, { sign: true }),
      profit < 0 ? "negative" : profit === 0 ? "neutral" : "positive",
    );
  }

  function submitEntry() {
    if (!sheetState || sheetState.submitting) return;
    const costInput = $("#entryCost");
    const revenueInput = $("#entryRevenue");
    const feesInput = $("#entryFees");
    const nameInput = $("#entryName");
    const dateInput = $("#entryDate");
    const noteInput = $("#entryNote");
    if (
      !costInput ||
      !feesInput ||
      !nameInput ||
      !dateInput ||
      !noteInput ||
      !revenueInput
    ) {
      return;
    }

    clearAllEntryErrors();
    let firstInvalid = null;
    const fail = (input) => {
      if (!firstInvalid) firstInvalid = input;
    };

    const name = nameInput.value.replace(/\s+/g, " ").trim();
    if (!name) fail(showFieldError("entryName", "entryNameError", "先填一下卖了什么"));

    const cost = parseAmount(costInput.value);
    if (cost === null) {
      fail(
        showFieldError(
          "entryCost",
          "entryCostError",
          costInput.value.trim()
            ? "成本要填一个有效数字"
            : "把拿货成本填上，0 也可以",
        ),
      );
    }

    const feesRaw = feesInput.value.trim();
    const fees = feesRaw === "" ? 0 : parseAmount(feesRaw);
    if (fees === null) {
      fail(
        showFieldError(
          "entryFees",
          "entryFeesError",
          "费用要填数字，没有就留空",
        ),
      );
    }

    const isStock = sheetState.status === "stock";
    let revenue = 0;
    if (!isStock) {
      const parsed = parseAmount(revenueInput.value);
      if (parsed === null) {
        fail(
          showFieldError(
            "entryRevenue",
            "entryRevenueError",
            revenueInput.value.trim()
              ? "卖出收入要填一个有效数字"
              : "卖掉的话，把卖价填上",
          ),
        );
      } else {
        revenue = parsed;
      }
    }

    const date = dateInput.value;
    if (!date || !isValidISODate(date) || date > todayISO()) {
      fail(showFieldError("entryDate", "entryDateError", "选一个今天或更早的日期"));
    }

    if (firstInvalid) {
      firstInvalid.focus({ preventScroll: true });
      firstInvalid.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    if (cost === null || fees === null) return;

    const existing = sheetState.id ? getRecord(sheetState.id) : null;
    if ((sheetState.mode === "edit" || sheetState.mode === "sell") && !existing) {
      showToast("这笔账已经不存在了", "error");
      closeSheet();
      return;
    }

    const now = new Date().toISOString();
    const values = {
      name,
      category: CATEGORY_META[sheetState.category]
        ? sheetState.category
        : "其他",
      status: isStock ? "stock" : "sold",
      qty: sheetState.qty,
      cost,
      revenue: isStock ? 0 : revenue,
      fees,
      date,
      note: noteInput.value.trim().slice(0, 200),
      updatedAt: now,
    };
    const previousRecords = records.slice();
    const mode = sheetState.mode;
    let savedRecord;

    if (mode === "new") {
      savedRecord = {
        ...values,
        id: uid(),
        createdAt: now,
      };
      records = [savedRecord, ...records];
    } else {
      const index = records.findIndex((record) => record.id === existing.id);
      savedRecord = { ...existing, ...values };
      records = records.slice();
      records[index] = savedRecord;
    }

    if (!saveRecords()) {
      records = previousRecords;
      return;
    }

    sheetState.submitting = true;
    const saveButton = $("#sheetSave");
    if (saveButton) saveButton.disabled = true;
    haptic();
    const profit = profitOf(savedRecord);
    const toastMessage = isStock
      ? `已存入在售 · 占用 ${formatMoney(savedRecord.cost)}`
      : mode === "sell"
        ? profit >= 0
          ? `卖出成功 · 净赚 ${formatMoney(profit, { sign: true })}`
          : `已卖出 · 这单亏 ${formatMoney(Math.abs(profit))}`
        : mode === "edit"
          ? `账目已更新${profit >= 0 ? ` · 净赚 ${formatMoney(profit, { sign: true })}` : ` · 亏 ${formatMoney(Math.abs(profit))}`}`
          : `已入账 · ${profit >= 0 ? "净赚" : "亏"} ${formatMoney(Math.abs(profit))}`;

    closeSheet();
    renderApp();
    window.setTimeout(() => showToast(toastMessage), 250);
  }

  function closeSheet() {
    if (sheetLayer.hidden || sheetCloseTimer) return;
    sheetLayer.classList.remove("is-open");
    sheetCloseTimer = window.setTimeout(() => {
      sheetLayer.hidden = true;
      sheetCloseTimer = null;
      sheetState = null;
      updateInteractionLock();
      if (lastSheetFocus && lastSheetFocus.isConnected) {
        try {
          lastSheetFocus.focus({ preventScroll: true });
        } catch (error) {
          /* noop */
        }
      }
    }, 300);
  }

  /* ---------------------------- 奶娃助手 --------------------------- */

  function readAssistantPreference() {
    try {
      return window.localStorage.getItem(ASSISTANT_PREF_KEY) === "1";
    } catch (error) {
      return false;
    }
  }

  function applyAssistantDockVisibility() {
    const dock = $("#assistantDock");
    if (dock) dock.hidden = assistantDismissed;
  }

  function setAssistantDismissed(hidden) {
    assistantDismissed = Boolean(hidden);
    try {
      window.localStorage.setItem(
        ASSISTANT_PREF_KEY,
        assistantDismissed ? "1" : "0",
      );
    } catch (error) {
      console.warn("Could not save assistant preference", error);
    }
    applyAssistantDockVisibility();
    if (assistantDismissed && !assistantLayer.hidden) {
      closeAssistant();
    }
    if (state.route === "settings") {
      renderApp();
    }
    showToast(
      assistantDismissed
        ? "奶娃已收起，可在「我的」重新打开"
        : "奶娃已回到右下角",
    );
  }

  function assistantWelcomeText() {
    const current = monthSummary(currentMonthKey());
    const stock = stockSummary();
    const hello = `${greeting()}，老板。`;
    if (!records.length) {
      return `${hello}我是奶娃，住在这本账里。账本还空着，先记一单，我来帮你算利润。`;
    }
    if (!current.count) {
      return `${hello}这个月还没有成交${stock.count ? `，手上有 ${stock.units} 件在售、压着 ${formatMoney(stock.cost)}` : ""}。可以问我上个月赚了多少，或者先记一单。`;
    }
    const profitLine =
      current.profit < 0
        ? `本月净亏 ${formatMoney(Math.abs(current.profit))}`
        : `本月已净赚 ${formatMoney(current.profit)}`;
    return `${hello}${profitLine}${stock.count ? `，还有 ${stock.units} 件在售、压着 ${formatMoney(stock.cost)}` : "，目前没有在售库存"}。想记一笔，还是先查查账？`;
  }

  function assistantMessageMarkup(message, isLatest = false) {
    if (message.role === "user") {
      return `<div class="assistant-msg is-user">
        <div class="assistant-bubble-wrap">
          <div class="assistant-bubble">${esc(message.text)}</div>
        </div>
      </div>`;
    }
    const actions =
      isLatest && Array.isArray(message.actions) ? message.actions : [];
    const actionMarkup = actions.length
      ? `<div class="assistant-actions">${actions
          .map(
            (action, index) =>
              `<button class="assistant-action" type="button" data-assistant-message="${esc(message.id)}" data-assistant-action-index="${index}">${esc(action.label)} ${ICONS.arrowUpRight}</button>`,
          )
          .join("")}</div>`
      : "";
    return `<div class="assistant-msg">
      <span class="assistant-mini-avatar" aria-hidden="true">
        <img src="./icons/naiba-avatar-idle.png" alt="">
      </span>
      <div class="assistant-bubble-wrap">
        <div class="assistant-bubble">${esc(message.text)}</div>
        ${actionMarkup}
      </div>
    </div>`;
  }

  function assistantSheetTemplate() {
    return `<div class="sheet-grabber" aria-hidden="true"></div>
      <div class="assistant-head">
        <div class="naiba-profile">
          <span class="naiba-avatar" aria-hidden="true">
            <img class="is-idle" src="./icons/naiba-avatar-idle.png" alt="">
            <img class="is-glance" src="./icons/naiba-avatar-glance.png" alt="">
          </span>
          <div class="assistant-title-block">
            <div class="assistant-name" id="assistantTitle">奶娃 <span class="local-pill">本地</span></div>
            <div class="assistant-status"><span class="assistant-status-dot"></span>看账 · 算账 · 只在本机</div>
          </div>
        </div>
        <div class="assistant-head-actions">
          <button class="sheet-icon-btn" type="button" data-assistant-reset aria-label="重新开始对话" title="重新开始">${ICONS.refresh}</button>
          <button class="sheet-icon-btn" type="button" data-assistant-close aria-label="关闭奶娃助手">${ICONS.close}</button>
        </div>
      </div>

      <div class="assistant-chat" id="assistantChat">
        <div class="naiba-welcome" id="assistantWelcome">
          <div class="naiba-portrait" aria-hidden="true">
            <img class="naiba-full is-idle" src="./icons/naiba-idle.png" alt="">
            <img class="naiba-full is-glance" src="./icons/naiba-glance.png" alt="">
          </div>
          <div class="naiba-welcome-copy">
            <div class="naiba-kicker">你的本地记账搭子</div>
            <h3>奶娃在。</h3>
            <p>${esc(assistantWelcomeText())}</p>
          </div>
        </div>
        <div class="assistant-messages" id="assistantMessages" role="log" aria-live="polite" aria-label="奶娃的回复"></div>
      </div>

      <div class="assistant-footer">
        <div class="assistant-suggestions" aria-label="快捷问题">
          <button class="assistant-suggestion" type="button" data-assistant-prompt="本月赚了多少">本月赚多少</button>
          <button class="assistant-suggestion" type="button" data-assistant-prompt="在售库存">在售库存</button>
          <button class="assistant-suggestion is-action" type="button" data-assistant-command="entry">记一单</button>
          <button class="assistant-suggestion" type="button" data-assistant-prompt="利润怎么算">利润怎么算</button>
          <button class="assistant-suggestion" type="button" data-assistant-prompt="怎么备份">怎么备份</button>
        </div>
        <form class="assistant-composer" id="assistantForm" novalidate>
          <input id="assistantInput" type="text" maxlength="200" autocomplete="off" enterkeyhint="send" placeholder="问奶娃：本月赚了多少？" aria-label="对奶娃说">
          <button class="assistant-send" id="assistantSend" type="submit" aria-label="发送">${ICONS.send}</button>
        </form>
      </div>`;
  }

  function openAssistant() {
    if (!assistantLayer.hidden || !sheetLayer.hidden || !modalLayer.hidden) return;
    toastEl.classList.remove("is-visible");
    assistant.lastFocus = document.activeElement;
    window.clearTimeout(assistant.closeTimer);
    assistant.closeTimer = null;
    assistantSheet.innerHTML = assistantSheetTemplate();
    assistantLayer.hidden = false;
    updateInteractionLock();
    window.requestAnimationFrame(() => assistantLayer.classList.add("is-open"));
    renderAssistantMessages();
    assistantSheet.focus({ preventScroll: true });
    if (window.matchMedia("(pointer: fine)").matches) {
      window.setTimeout(() => {
        $("#assistantInput")?.focus({ preventScroll: true });
      }, 280);
    }
  }

  function closeAssistant() {
    if (assistantLayer.hidden || assistant.closeTimer) return;
    assistantLayer.classList.remove("is-open");
    assistant.closeTimer = window.setTimeout(() => {
      assistantLayer.hidden = true;
      assistant.closeTimer = null;
      updateInteractionLock();
      const target =
        assistant.lastFocus &&
        assistant.lastFocus !== document.body &&
        assistant.lastFocus.isConnected
          ? assistant.lastFocus
          : $(".assistant-fab");
      if (target) {
        try {
          target.focus({ preventScroll: true });
        } catch (error) {
          /* noop */
        }
      }
    }, 300);
  }

  function resetAssistant() {
    window.clearTimeout(assistant.replyTimer);
    assistant.replyTimer = null;
    assistant.typing = false;
    assistant.messages = [];
    assistant.seq = 0;
    renderAssistantMessages();
    const chat = $("#assistantChat");
    if (chat) chat.scrollTop = 0;
    const input = $("#assistantInput");
    if (input) input.value = "";
  }

  function syncAssistantWelcomeVisibility() {
    const welcome = $("#assistantWelcome");
    if (welcome) welcome.hidden = assistant.messages.length > 0 || assistant.typing;
  }

  function renderAssistantMessages() {
    const container = $("#assistantMessages");
    if (!container) return;
    const typingMarkup = assistant.typing
      ? `<div class="assistant-msg">
          <span class="assistant-mini-avatar" aria-hidden="true"><img src="./icons/naiba-avatar-idle.png" alt=""></span>
          <div class="assistant-bubble-wrap">
            <div class="assistant-bubble"><span class="assistant-typing" aria-label="奶娃正在想"><i></i><i></i><i></i></span></div>
          </div>
        </div>`
      : "";
    container.innerHTML =
      assistant.messages
        .map((message, index) =>
          assistantMessageMarkup(
            message,
            index === assistant.messages.length - 1,
          ),
        )
        .join("") + typingMarkup;
    syncAssistantWelcomeVisibility();
    const send = $("#assistantSend");
    if (send) send.disabled = assistant.typing;
    const chat = $("#assistantChat");
    if (chat) {
      window.requestAnimationFrame(() => {
        chat.scrollTop = chat.scrollHeight;
      });
    }
  }

  function sendAssistantText(raw) {
    if (assistantLayer.hidden || assistant.typing) return;
    const text = String(raw || "").trim().slice(0, 200);
    if (!text) return;
    assistant.messages.push({
      id: `a${++assistant.seq}`,
      role: "user",
      text,
    });
    assistant.typing = true;
    const input = $("#assistantInput");
    if (input) input.value = "";
    renderAssistantMessages();

    let reply;
    try {
      reply = buildAssistantReply(text);
    } catch (error) {
      console.warn("Assistant reply failed", error);
      reply = {
        text: "我刚刚算账时卡了一下，再问我一次？",
        actions: [],
      };
    }
    window.clearTimeout(assistant.replyTimer);
    assistant.replyTimer = window.setTimeout(() => {
      assistant.replyTimer = null;
      assistant.typing = false;
      assistant.messages.push({
        id: `a${++assistant.seq}`,
        role: "assistant",
        text: reply.text,
        actions: reply.actions || [],
      });
      if (!assistantLayer.hidden) renderAssistantMessages();
    }, 520);
  }

  function assistantRangeFromText(text) {
    const compact = String(text).replace(/\s+/g, "");
    if (/今天|今日/.test(compact)) {
      return { type: "day", date: todayISO(), label: "今天" };
    }
    if (/昨天|昨日/.test(compact)) {
      const previous = new Date();
      previous.setDate(previous.getDate() - 1);
      const iso = `${previous.getFullYear()}-${pad2(previous.getMonth() + 1)}-${pad2(previous.getDate())}`;
      return { type: "day", date: iso, label: "昨天" };
    }
    if (/上个月|上月/.test(compact)) {
      return {
        type: "month",
        key: shiftMonthKey(currentMonthKey(), -1),
        label: "上个月",
      };
    }
    if (/累计|总共|一共|所有|全部/.test(compact)) {
      return { type: "all", label: "累计" };
    }
    return { type: "month", key: currentMonthKey(), label: "本月" };
  }

  function assistantSoldForRange(range) {
    if (range.type === "all") {
      return records.filter((record) => record.status === "sold");
    }
    if (range.type === "day") {
      return records.filter(
        (record) =>
          record.status === "sold" && record.date === range.date,
      );
    }
    return records.filter(
      (record) =>
        record.status === "sold" &&
        String(record.date).startsWith(range.key),
    );
  }

  function assistantSummaryReply(range) {
    const summary = summarize(assistantSoldForRange(range));
    const stock = stockSummary();
    if (!summary.count) {
      return {
        text: `${range.label}还没有已卖出的账目。${
          stock.count
            ? `现在有 ${stock.units} 件在售，占用 ${formatMoney(stock.cost)}。`
            : ""
        }${records.length ? "账本里有记录，我可以继续帮你查。" : "先记一单，我就能帮你看利润。"}`,
        actions: [{ label: "记一单", type: "entry", status: "sold", prefill: {} }],
      };
    }
    const isLoss = summary.profit < 0;
    const lines = [
      `${range.label}成交 ${summary.count} 单，${isLoss ? "净亏" : "净赚"} ${formatMoney(Math.abs(summary.profit))}。`,
      `营收 ${formatMoney(summary.revenue)} · 成本 ${formatMoney(summary.cost)} · 费用 ${formatMoney(summary.fees)}${
        summary.margin !== null ? ` · 毛利率 ${formatPct(summary.margin)}` : ""
      }。`,
    ];
    if (range.type === "month" && range.key === currentMonthKey() && stock.count) {
      lines.push(`还有 ${stock.units} 件在售，压着 ${formatMoney(stock.cost)}。`);
    }
    if (range.type === "all") {
      lines.push(`账本里共有 ${records.length} 笔记录。`);
    }
    return {
      text: lines.join("\n"),
      actions: [{ label: "打开统计", type: "navigate", route: "stats" }],
    };
  }

  function assistantStockReply() {
    const stock = stockSummary();
    if (!stock.count) {
      return {
        text: "现在没有在售库存，之前的货都出完了。要补货就先点「先入库」，或者跟我说“记库存 成本1000”。",
        actions: [{ label: "先记库存", type: "entry", status: "stock", prefill: {} }],
      };
    }
    const names = stock.items
      .slice(0, 4)
      .map((item) => `「${item.name}」×${item.qty}`)
      .join("、");
    return {
      text: `现在有 ${stock.count} 笔在售，共 ${stock.units} 件，占用成本 ${formatMoney(stock.cost)}。\n手上是：${names}${stock.items.length > 4 ? " 等" : ""}。\n卖出时在首页库存卡点「卖出」，补上收入就能结算。`,
      actions: [],
    };
  }

  function assistantLossReply(range) {
    const sold = assistantSoldForRange(range);
    const losses = sold.filter((record) => profitOf(record) < 0);
    if (!losses.length) {
      return {
        text: `${range.label}没有亏损单。${sold.length ? "每单都保住了利润，稳。" : "还没有已卖出的账目。"}`,
        actions: [],
      };
    }
    const total = roundMoney(
      losses.reduce((sum, record) => sum + profitOf(record), 0),
    );
    const names = losses
      .slice(0, 3)
      .map(
        (record) =>
          `「${record.name}」${formatMoney(Math.abs(profitOf(record)))}`,
      )
      .join("、");
    return {
      text: `${range.label}有 ${losses.length} 单亏损，合计 ${formatMoney(Math.abs(total))}。\n${names}${losses.length > 3 ? " 等" : ""}。\n点下面的「打开统计」可以看更细。`,
      actions: [{ label: "打开统计", type: "navigate", route: "stats" }],
    };
  }

  function assistantBestReply(range) {
    const sold = assistantSoldForRange(range);
    const summary = summarize(sold);
    if (!summary.count) {
      return {
        text: `${range.label}还没有已卖出的账目，暂时评不出“最赚”。`,
        actions: [],
      };
    }
    if (!summary.best || summary.bestProfit <= 0) {
      return {
        text: `${range.label}还没有正利润的单子，最高的一单也只是 ${formatMoney(summary.bestProfit, { sign: true })}。先别急着冲，盘一盘成本。`,
        actions: [],
      };
    }
    const best = summary.best;
    return {
      text: `${range.label}最赚的是「${best.name}」：卖价 ${formatMoney(best.revenue)}，成本 ${formatMoney(best.cost)}，费用 ${formatMoney(best.fees)}，净赚 ${formatMoney(summary.bestProfit, { sign: true })}。`,
      actions: [{ label: "打开统计", type: "navigate", route: "stats" }],
    };
  }

  function assistantFormulaReply() {
    const sold = records
      .filter((record) => record.status === "sold")
      .sort(recordOrder);
    const sample = sold[0];
    let example = "";
    if (sample) {
      example = `\n拿最近一单「${sample.name}」举例：${formatMoney(sample.revenue)} − ${formatMoney(sample.cost)}${sample.fees ? ` − ${formatMoney(sample.fees)}` : ""} = ${formatMoney(profitOf(sample), { sign: true })}。`;
    }
    return {
      text: `利润 = 卖出收入 − 拿货成本 − 其他费用。${example}\n在售库存只算占用成本，不算利润；统计按卖出日期归到当月。`,
      actions: [],
    };
  }

  function assistantBackupReply() {
    return {
      text: "账目只存在这台手机的浏览器里，不上云。\n在「我的 → 导出 JSON 备份」保存一份；换手机时用「从备份恢复」导入。\nCSV 也能导出，适合发给别人看。",
      actions: [{ label: "打开设置", type: "navigate", route: "settings" }],
    };
  }

  function assistantSharingReply() {
    return {
      text: "现在是一本“单机账”：别人打开链接，用的是他自己的本地账本，看不到你的账，也不能和你一起改。\n要合伙共用同一本账，需要加云端共享版；目前可以先导出 JSON 或 CSV 给对方看。",
      actions: [{ label: "打开设置", type: "navigate", route: "settings" }],
    };
  }

  function assistantInstallReply() {
    return {
      text: "这是手机网页 App。用 HTTPS 打开后：\niPhone：Safari 分享 → 添加到主屏幕；\nAndroid：Chrome 右上角 ⋮ → 安装应用。\n装好之后，打开过一次就能离线记账。",
      actions: [],
    };
  }

  function assistantHelpReply() {
    return {
      text: "记一单：点底部＋，或对我说“记一单 成本1000 卖1500”。\n先入库：首页「先入库」，卖出时补收入。\n查账：问我“本月赚多少”“在售库存”“最赚的一单”。\n数据：只存本机，设置里可以导出备份。",
      actions: [],
    };
  }

  function inferEntryCategory(text) {
    if (/演唱会|音乐节|门票|票务|看台|内场|连座|入场|演出|巡演|站|live/i.test(text)) {
      return "票务";
    }
    if (/球鞋|鞋|aj|dunk|yeezy|码/i.test(text)) return "球鞋";
    if (/iphone|苹果|手机|相机|电脑|switch|ps5|显卡|耳机|数码/i.test(text)) {
      return "数码";
    }
    if (/labubu|拉布布|盲盒|molly|手办|潮玩|娃娃/i.test(text)) return "潮玩";
    return "其他";
  }

  function parseAssistantEntry(text) {
    const result = {};
    const patterns = {
      cost: /(?:拿货成本|拿货价?|成本|进价|收价|收来|买入|本钱|本金)\s*(?:是|为|[:：])?\s*[¥￥]?\s*(\d[\d,]*(?:\.\d{1,2})?)/,
      revenue:
        /(?:卖出收入|卖价|售价|卖出价|卖出|卖了|卖|收入|成交价|出手价|回款)\s*(?:是|为|[:：])?\s*[¥￥]?\s*(\d[\d,]*(?:\.\d{1,2})?)/,
      fees: /(?:其他费用|费用|手续费|平台费|运费|路费|邮费)\s*(?:是|为|[:：])?\s*[¥￥]?\s*(\d[\d,]*(?:\.\d{1,2})?)/,
      qty: /(?:(?:数量|共|一共|买了|收了)\s*(?:是|为|[:：])?\s*(\d{1,3})\s*(?:件|张|个|双|台|套|份)?|(\d{1,3})\s*(?:件|张|个|双|台|套|份))/,
    };
    const matched = [];
    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = pattern.exec(text);
      if (!match) return;
      matched.push(match[0]);
      if (key === "qty") {
        const qty = Number(match[1] || match[2]);
        if (Number.isFinite(qty) && qty > 0) result.qty = clampQty(qty);
      } else {
        const amount = parseAmount(match[1]);
        if (amount !== null) result[key] = amount;
      }
    });

    let rest = text;
    matched.forEach((fragment) => {
      rest = rest.split(fragment).join(" ");
    });
    rest = rest
      .replace(/^(?:帮我|请|麻烦|给我|顺便|再)\s*/, "")
      .replace(
        /^(?:记一单|记一笔|记账|开一单|录一单|记个账|记一下账|入库|记库存|记个库存|收个货|收货)\s*/,
        "",
      )
      .replace(/(?:商品名|商品名称|名称|品名|叫)\s*[:：]?\s*/g, "")
      .replace(
        /(?:拿货成本|成本|进价|收价|本钱|本金|卖出收入|卖价|售价|收入|成交价|费用|手续费|平台费|运费|路费|邮费)\s*[:：]?/g,
        " ",
      )
      .replace(/[元块]/g, " ")
      .replace(/^(?:一单|一笔|一下|吧)\s*/, "")
      .replace(/[，,。.!！?？；;：:、\s]+/g, " ")
      .trim();
    if (rest.length > 60) rest = rest.slice(0, 60);
    if (rest && !/^(?:一单|一笔|的|吧|吗|呢|了)$/.test(rest)) {
      result.name = rest;
    }
    result.category = inferEntryCategory(`${result.name || ""} ${text}`);
    return result;
  }

  function assistantRecordReply(text, stockIntent) {
    const prefill = parseAssistantEntry(text);
    const parts = [];
    if (prefill.name) parts.push(`「${prefill.name}」`);
    if (prefill.cost != null) parts.push(`成本 ${formatMoney(prefill.cost)}`);
    if (!stockIntent && prefill.revenue != null) {
      parts.push(`卖价 ${formatMoney(prefill.revenue)}`);
    }
    if (prefill.qty && prefill.qty > 1) parts.push(`数量 ${prefill.qty}`);
    if (prefill.fees) parts.push(`费用 ${formatMoney(prefill.fees)}`);
    let replyText;
    if (parts.length) {
      replyText = `我先帮你把${stockIntent ? "库存单" : "单子"}填上：${parts.join("，")}。核对一下分类和日期，保存就入账。`;
      if (!stockIntent && prefill.cost != null && prefill.revenue != null) {
        const profit = roundMoney(
          prefill.revenue - prefill.cost - (prefill.fees || 0),
        );
        replyText += `\n按这几个数算，这单净赚 ${formatMoney(profit, { sign: true })}。`;
      }
    } else if (stockIntent) {
      replyText =
        "好，先入库。点下面的「打开库存单」，把名称和成本填上就行。";
    } else {
      replyText =
        "好，记一单。点下面的「打开单子」，或者直接告诉我“成本1000，卖1500”。";
    }
    return {
      text: replyText,
      actions: [
        {
          label: stockIntent ? "打开库存单" : "打开单子",
          type: "entry",
          status: stockIntent ? "stock" : "sold",
          prefill,
        },
      ],
    };
  }

  function buildAssistantReply(text) {
    const compact = String(text).replace(/\s+/g, "").toLowerCase();
    const range = assistantRangeFromText(text);
    const stockIntent = /记库存|入库|先入库|收货|压货/.test(compact);
    const recordIntent =
      /记一单|记一笔|记账|开一单|录一单|帮我记|记个账/.test(compact) ||
      stockIntent;

    if (/怎么用|怎么记|怎么操作|如何用|如何记|使用说明|教我|不会用/.test(compact)) {
      return assistantHelpReply();
    }
    if (/备份|导出|导入|换手机|数据丢|数据在哪|安全吗/.test(compact)) {
      return assistantBackupReply();
    }
    if (/别人|一起用|共享|多人|合伙|团队|共同|几个人|共用|登录|账号/.test(compact)) {
      return assistantSharingReply();
    }
    if (/安装|加到桌面|添加到桌面|离线用/.test(compact)) {
      return assistantInstallReply();
    }
    if (/利润怎么算|怎么算利润|怎么计算|计算公式|公式/.test(compact)) {
      return assistantFormulaReply();
    }
    if (recordIntent) {
      return assistantRecordReply(text, stockIntent);
    }
    if (/库存|在售|压货/.test(compact)) {
      return assistantStockReply();
    }
    if (/亏|亏损|赔/.test(compact)) {
      return assistantLossReply(range);
    }
    if (/最赚|最挣|最高|利润最高|赚最多/.test(compact)) {
      return assistantBestReply(range);
    }
    if (/打开统计|看统计|统计页|图表|报表|分析/.test(compact)) {
      return {
        text: "统计页在这，点下面带你过去。",
        actions: [{ label: "打开统计", type: "navigate", route: "stats" }],
      };
    }
    if (/打开账本|看账本|明细|流水|记录列表/.test(compact)) {
      return {
        text: "账本在这，点下面带你过去。",
        actions: [{ label: "打开账本", type: "navigate", route: "ledger" }],
      };
    }
    if (/打开设置|设置页|备份设置/.test(compact)) {
      return {
        text: "设置在这。",
        actions: [{ label: "打开设置", type: "navigate", route: "settings" }],
      };
    }
    if (/你是谁|你叫什么|介绍一下|奶娃是|会什么|能干嘛|能做什么|能干什么|会干什么/.test(compact)) {
      return {
        text: "我是奶娃，w记账里的本地小账助。\n会看你的账、帮你算利润、把一句话变成单子；账目只在本机，不会飞到云端。",
        actions: [],
      };
    }
    if (/你好|嗨|hi|hello|在吗|哈喽/.test(compact) && compact.length <= 14 && !/赚|利润|库存|备份|记一单|统计|账本|设置/.test(compact)) {
      const current = monthSummary(currentMonthKey());
      const stock = stockSummary();
      const profitLine =
        current.profit < 0
          ? `本月净亏 ${formatMoney(Math.abs(current.profit))}。`
          : current.count
            ? `本月净赚 ${formatMoney(current.profit)}。`
            : "本月还没开张。";
      return {
        text: `${greeting()}，老板。我是奶娃。${profitLine}${stock.count ? `还有 ${stock.units} 件在售。` : "库存是空的。"}想记一单还是查账？`,
        actions: [],
      };
    }
    if (/谢谢|多谢|感谢/.test(compact)) {
      return {
        text: "不客气，老板。账本我帮你盯着，记得偶尔导一份备份。",
        actions: [],
      };
    }
    if (
      /赚|盈利|利润|营收|收入|成本|费用|毛利|卖了多少钱|成交|查账|看账/.test(compact)
    ) {
      return assistantSummaryReply(range);
    }
    if (/清空|删除/.test(compact)) {
      return {
        text: "删账要你自己确认，我不代手。\n去「我的 → 清空全部账目」；删之前最好先导出 JSON 备份。",
        actions: [{ label: "打开设置", type: "navigate", route: "settings" }],
      };
    }
    const possibleEntry = parseAssistantEntry(text);
    if (
      possibleEntry.cost != null ||
      possibleEntry.revenue != null ||
      possibleEntry.fees != null
    ) {
      return {
        text: "这像是在报一单的成本和卖价。要我帮你填进单子吗？",
        actions: [
          {
            label: "打开单子",
            type: "entry",
            status: "sold",
            prefill: possibleEntry,
          },
        ],
      };
    }
    return {
      text: "这句我还没学会。\n可以问我：本月赚多少、在售压了多少货、最赚的一单、怎么备份；也可以点下面的快捷按钮。",
      actions: [],
    };
  }

  function performAssistantAction(action) {
    if (!action) return;
    const closeDelay = assistantLayer.hidden ? 30 : 320;
    closeAssistant();
    window.setTimeout(() => {
      if (action.type === "entry") {
        openEntry({
          mode: "new",
          status: action.status === "stock" ? "stock" : "sold",
          prefill: action.prefill || {},
        });
      } else if (action.type === "navigate") {
        navigate(action.route || "home");
      }
    }, closeDelay);
  }

  function bindAssistantEvents() {
    assistantLayer.addEventListener("click", (event) => {
      if (event.target.closest("[data-assistant-close]")) {
        event.preventDefault();
        closeAssistant();
        return;
      }
      if (event.target.closest("[data-assistant-reset]")) {
        event.preventDefault();
        resetAssistant();
        return;
      }
      const promptButton = event.target.closest("[data-assistant-prompt]");
      if (promptButton) {
        event.preventDefault();
        sendAssistantText(promptButton.dataset.assistantPrompt);
        return;
      }
      const commandButton = event.target.closest("[data-assistant-command]");
      if (commandButton) {
        event.preventDefault();
        if (assistant.typing) return;
        if (commandButton.dataset.assistantCommand === "entry") {
          performAssistantAction({ type: "entry", status: "sold", prefill: {} });
        }
        return;
      }
      const actionButton = event.target.closest("[data-assistant-action-index]");
      if (actionButton) {
        event.preventDefault();
        const message = assistant.messages.find(
          (item) => String(item.id) === actionButton.dataset.assistantMessage,
        );
        const action =
          message && message.actions
            ? message.actions[Number(actionButton.dataset.assistantActionIndex)]
            : null;
        if (action) performAssistantAction(action);
      }
    });

    assistantLayer.addEventListener("submit", (event) => {
      if (event.target.id !== "assistantForm") return;
      event.preventDefault();
      sendAssistantText($("#assistantInput")?.value || "");
    });
  }

  /* ------------------------------ modal ---------------------------- */

  function openModal(options) {
    if (modalState || !modalLayer.hidden) return Promise.resolve(false);
    toastEl.classList.remove("is-visible");
    const danger = options.danger === true;
    const single = options.single === true;
    const icon = options.icon || (danger ? "trash" : "info");
    const cancelLabel = options.cancelText || "取消";
    const confirmLabel = options.confirmText || "确定";
    const lastFocus = document.activeElement;

    modal.innerHTML = `<div class="modal-symbol ${danger ? "is-danger" : ""}" aria-hidden="true">
        ${ICONS[icon] || ICONS.info}
      </div>
      <h3 id="modalTitle">${esc(options.title || "确认操作")}</h3>
      <p id="modalMessage">${esc(options.message || "")}</p>
      ${options.extraHtml ? `<div class="modal-extra">${options.extraHtml}</div>` : ""}
      <div class="modal-actions ${single ? "is-single" : ""}">
        ${single ? "" : `<button class="modal-btn modal-btn-ghost" type="button" data-modal-cancel>${esc(cancelLabel)}</button>`}
        <button class="modal-btn ${danger ? "modal-btn-danger" : "modal-btn-primary"}" type="button" data-modal-confirm>${esc(confirmLabel)}</button>
      </div>`;
    modalLayer.hidden = false;
    updateInteractionLock();
    window.requestAnimationFrame(() => modalLayer.classList.add("is-open"));

    return new Promise((resolve) => {
      modalState = {
        resolve,
        lastFocus,
      };
      window.setTimeout(() => {
        const target = danger
          ? $("[data-modal-cancel]", modal)
          : $("[data-modal-confirm]", modal);
        (target || $("[data-modal-confirm]", modal))?.focus({
          preventScroll: true,
        });
      }, 80);
    });
  }

  function closeModal(result) {
    if (!modalState) return;
    const current = modalState;
    modalState = null;
    modalLayer.classList.remove("is-open");
    window.setTimeout(() => {
      modalLayer.hidden = true;
      updateInteractionLock();
      if (current.lastFocus && current.lastFocus.isConnected) {
        try {
          current.lastFocus.focus({ preventScroll: true });
        } catch (error) {
          /* noop */
        }
      }
      current.resolve(result);
    }, 220);
  }

  function updateInteractionLock() {
    const sheetOpen = !sheetLayer.hidden;
    const assistantOpen = !assistantLayer.hidden;
    const modalOpen = !modalLayer.hidden;
    const anyOverlay = sheetOpen || assistantOpen || modalOpen;
    document.body.classList.toggle("no-scroll", anyOverlay);
    appShell.inert = anyOverlay;
    sheetLayer.inert = modalOpen || assistantOpen;
    assistantLayer.inert = modalOpen || sheetOpen;
  }

  function trapFocus(event, container) {
    const focusable = $$(
      'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      container,
    ).filter((element) => element.offsetParent !== null);
    if (!focusable.length) {
      event.preventDefault();
      container.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey) {
      if (document.activeElement === first || !container.contains(document.activeElement)) {
        event.preventDefault();
        last.focus();
      }
    } else if (document.activeElement === last || !container.contains(document.activeElement)) {
      event.preventDefault();
      first.focus();
    }
  }

  /* ---------------------------- actions ---------------------------- */

  async function handleAction(action, element) {
    switch (action) {
      case "new":
        openEntry({ mode: "new", status: "sold" });
        break;
      case "new-stock":
        openEntry({ mode: "new", status: "stock" });
        break;
      case "edit":
        if (element.dataset.id) openEntry({ mode: "edit", id: element.dataset.id });
        break;
      case "sell":
        if (element.dataset.id) openEntry({ mode: "sell", id: element.dataset.id });
        break;
      case "close-sheet":
        closeSheet();
        break;
      case "view-all":
        state.ledgerFilter = "all";
        state.search = "";
        navigate("ledger");
        break;
      case "clear-search": {
        state.search = "";
        const input = $("#ledgerSearch");
        if (input) {
          input.value = "";
          input.focus({ preventScroll: true });
        }
        refreshLedger();
        break;
      }
      case "reset-ledger":
        state.search = "";
        state.ledgerFilter = "all";
        renderApp();
        break;
      case "stats-prev":
        state.statsMonth = shiftMonthKey(state.statsMonth, -1);
        renderApp();
        break;
      case "stats-next": {
        const next = shiftMonthKey(state.statsMonth, 1);
        if (next <= currentMonthKey()) {
          state.statsMonth = next;
          renderApp();
        }
        break;
      }
      case "delete-record":
        await requestDelete(element.dataset.id);
        break;
      case "export-json":
        exportJson();
        break;
      case "export-csv":
        exportCsv();
        break;
      case "import-json":
        importFile.click();
        break;
      case "clear-data":
        await requestClearAll();
        break;
      case "install":
        await installApp();
        break;
      case "assistant-open":
        openAssistant();
        break;
      case "assistant-dismiss":
        setAssistantDismissed(true);
        break;
      case "toggle-assistant":
        setAssistantDismissed(!assistantDismissed);
        break;
      case "help":
        showHelp();
        break;
      default:
        break;
    }
  }

  async function requestDelete(id) {
    const record = getRecord(id);
    if (!record) return;
    const confirmed = await openModal({
      title: "删除这笔账？",
      message: `“${record.name}”会从账本里移除，删除后无法恢复。`,
      confirmText: "删除",
      danger: true,
      icon: "trash",
    });
    if (!confirmed) return;
    const previous = records;
    records = records.filter((item) => item.id !== id);
    if (!saveRecords()) {
      records = previous;
      return;
    }
    closeSheet();
    renderApp();
    window.setTimeout(() => showToast("这笔账已删除"), 250);
  }

  async function requestClearAll() {
    if (!records.length) {
      showToast("账本已经是空的");
      return;
    }
    const confirmed = await openModal({
      title: "清空全部账目？",
      message: `本机上的 ${records.length} 笔账目都会被删除，操作无法撤销。`,
      extraHtml: "建议先回到设置，导出一份 JSON 备份。",
      confirmText: "全部清空",
      danger: true,
      icon: "alert",
    });
    if (!confirmed) return;
    const previous = records;
    records = [];
    if (!saveRecords()) {
      records = previous;
      return;
    }
    renderApp();
    showToast("账本已清空");
  }

  function showHelp() {
    openModal({
      title: "w记账怎么用",
      message: "一分钟看懂，之后照着记就行。",
      extraHtml: `<b>记一单</b><br>已卖出：填拿货成本和卖出收入，利润自动算。<br><br><b>先入库</b><br>只记成本；卖出时在首页库存卡上点“卖出”，补上收入即可。<br><br><b>统计规则</b><br>只算已卖出的账目：利润 = 卖出收入 − 成本 − 其他费用。在售库存只算占用成本，不计利润。<br><br><b>数据在哪</b><br>全部存在本机浏览器，不上传。换手机或清理浏览器前，先导出 JSON 备份。`,
      confirmText: "知道了",
      single: true,
      icon: "info",
    });
  }

  function showInstallHelp() {
    const ua = navigator.userAgent || "";
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const steps = isIOS
      ? `<b>iPhone / iPad</b><br>1. 用 Safari 打开本页<br>2. 点底部的“分享”<br>3. 选择“添加到主屏幕”`
      : `<b>Android</b><br>1. 用 Chrome 或系统浏览器打开本页<br>2. 点右上角菜单（⋮）<br>3. 选择“添加到主屏幕”或“安装应用”`;
    const note = window.isSecureContext
      ? ""
      : `<br><br>提示：当前是局域网地址，浏览器可能不显示“安装”选项。直接打开网页也能正常记账，数据一样保存在本机。`;
    openModal({
      title: "放到手机桌面",
      message: "添加后从桌面一键打开，和 App 一样顺手。",
      extraHtml: steps + note,
      confirmText: "知道了",
      single: true,
      icon: "install",
    });
  }

  async function installApp() {
    if (deferredInstallPrompt) {
      const prompt = deferredInstallPrompt;
      deferredInstallPrompt = null;
      await prompt.prompt();
      try {
        const choice = await prompt.userChoice;
        if (choice.outcome === "accepted") {
          showToast("已添加到桌面");
        } else {
          showToast("没关系，随时可以再添加");
        }
      } catch (error) {
        showToast("安装没有完成，可以直接用浏览器记账");
      }
      return;
    }
    showInstallHelp();
  }

  /* ----------------------------- export ---------------------------- */

  function downloadBlob(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
  }

  function exportJson() {
    if (!records.length) {
      showToast("还没有账目可以导出", "error");
      return;
    }
    const payload = {
      app: "w记账",
      schema: 1,
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      records,
    };
    downloadBlob(
      JSON.stringify(payload, null, 2),
      `w记账备份-${todayISO()}.json`,
      "application/json;charset=utf-8",
    );
    showToast("JSON 备份已导出");
  }

  function csvCell(value, numeric = false) {
    let text = String(value ?? "");
    if (!numeric && /^[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  }

  function exportCsv() {
    if (!records.length) {
      showToast("还没有账目可以导出", "error");
      return;
    }
    const header = [
      "状态",
      "商品",
      "分类",
      "数量",
      "拿货成本",
      "卖出收入",
      "其他费用",
      "利润",
      "日期",
      "备注",
    ];
    const rows = records
      .slice()
      .sort(recordOrder)
      .map((record) => {
        const sold = record.status === "sold";
        const cells = [
          csvCell(sold ? "已售" : "在售"),
          csvCell(record.name),
          csvCell(record.category),
          csvCell(record.qty, true),
          csvCell(record.cost.toFixed(2), true),
          csvCell(sold ? record.revenue.toFixed(2) : "", true),
          csvCell(record.fees.toFixed(2), true),
          csvCell(sold ? profitOf(record).toFixed(2) : "", true),
          csvCell(record.date),
          csvCell(record.note),
        ];
        return cells.join(",");
      });
    downloadBlob(
      `\uFEFF${header.map((cell) => csvCell(cell)).join(",")}\r\n${rows.join("\r\n")}`,
      `w记账账目-${todayISO()}.csv`,
      "text/csv;charset=utf-8",
    );
    showToast("CSV 表格已导出");
  }

  async function importBackup(file) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast("备份文件太大了，可能不是w记账备份", "error");
      return;
    }
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const rawList = Array.isArray(parsed)
        ? parsed
        : parsed && Array.isArray(parsed.records)
          ? parsed.records
          : null;
      if (!rawList) throw new Error("invalid backup");
      const imported = rawList.map(normalizeRecord).filter(Boolean);
      if (!imported.length && rawList.length) throw new Error("empty backup");
      const unique = [];
      const seen = new Set();
      imported.forEach((record) => {
        if (seen.has(record.id)) record.id = uid();
        seen.add(record.id);
        unique.push(record);
      });
      const confirmed = await openModal({
        title: "导入这份备份？",
        message: `将用 ${unique.length} 笔账目替换当前 ${records.length} 笔账目。导入后无法撤销。`,
        confirmText: "导入并替换",
        danger: records.length > 0,
        icon: "upload",
      });
      if (!confirmed) return;
      const previous = records;
      records = unique;
      if (!saveRecords()) {
        records = previous;
        return;
      }
      state.search = "";
      state.ledgerFilter = "all";
      renderApp();
      showToast(`已导入 ${unique.length} 笔账目`);
    } catch (error) {
      console.warn("Import failed", error);
      showToast("这个文件不是有效的w记账备份", "error");
    }
  }

  /* ---------------------------- install ---------------------------- */

  function updateOnlineState() {
    offlineNote.hidden = navigator.onLine !== false;
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator) || !window.isSecureContext) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch((error) => {
        console.warn("Service worker registration failed", error);
      });
    });
  }

  /* ------------------------------ boot ----------------------------- */

  function bindGlobalEvents() {
    document.addEventListener("click", (event) => {
      const routeTarget = event.target.closest("[data-route]");
      if (routeTarget) {
        event.preventDefault();
        navigate(routeTarget.dataset.route);
        return;
      }
      const actionTarget = event.target.closest("[data-action]");
      if (!actionTarget || actionTarget.disabled) return;
      event.preventDefault();
      handleAction(actionTarget.dataset.action, actionTarget).catch((error) => {
        console.error(error);
        showToast("操作没有完成，请再试一次", "error");
      });
    });

    modalLayer.addEventListener("click", (event) => {
      if (event.target.closest("[data-modal-cancel]")) {
        event.preventDefault();
        closeModal(false);
      } else if (event.target.closest("[data-modal-confirm]")) {
        event.preventDefault();
        closeModal(true);
      }
    });

    bindAssistantEvents();

    document.addEventListener("keydown", (event) => {
      if (!modalLayer.hidden) {
        if (event.key === "Escape") {
          event.preventDefault();
          closeModal(false);
        } else if (event.key === "Tab") {
          trapFocus(event, modal);
        }
        return;
      }
      if (!assistantLayer.hidden) {
        if (event.key === "Escape") {
          event.preventDefault();
          closeAssistant();
        } else if (event.key === "Tab") {
          trapFocus(event, assistantSheet);
        }
        return;
      }
      if (!sheetLayer.hidden) {
        if (event.key === "Escape") {
          event.preventDefault();
          closeSheet();
        } else if (event.key === "Tab") {
          trapFocus(event, sheet);
        }
      }
    });

    window.addEventListener("hashchange", () => {
      const next = getRouteFromHash();
      if (next === state.route) return;
      state.route = next;
      renderApp({ animate: true });
      window.scrollTo(0, 0);
    });

    window.addEventListener("online", updateOnlineState);
    window.addEventListener("offline", updateOnlineState);

    window.addEventListener("storage", (event) => {
      if (event.key !== STORAGE_KEY) return;
      if (!sheetLayer.hidden || !modalLayer.hidden || !assistantLayer.hidden) {
        return;
      }
      records = readStore().records;
      renderApp();
      showToast("账本已在另一个页面更新");
    });

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredInstallPrompt = event;
    });

    window.addEventListener("appinstalled", () => {
      deferredInstallPrompt = null;
      if (state.route === "settings") renderApp();
      showToast("w记账已安装到桌面");
    });

    importFile.addEventListener("change", async () => {
      const file = importFile.files && importFile.files[0];
      importFile.value = "";
      if (file) await importBackup(file);
    });
  }

  function init() {
    const boot = readStore();
    records = boot.records;
    bootStorageError = boot.error || false;
    assistantDismissed = readAssistantPreference();
    applyAssistantDockVisibility();
    state.route = getRouteFromHash();
    state.statsMonth = currentMonthKey();
    bindGlobalEvents();
    updateOnlineState();
    renderApp({ animate: true });
    registerServiceWorker();

    if (bootStorageError) {
      window.setTimeout(() => {
        showToast("账本读取失败，已从空白页开始", "error");
      }, 500);
    }

    const params = new URLSearchParams(window.location.search);
    const shortcut = params.get("action");
    if (shortcut === "new" || shortcut === "stock" || shortcut === "assistant") {
      window.setTimeout(() => {
        if (shortcut === "assistant") {
          openAssistant();
        } else {
          openEntry({
            mode: "new",
            status: shortcut === "stock" ? "stock" : "sold",
          });
        }
      }, 380);
      params.delete("action");
      const query = params.toString();
      const cleanUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
      window.history.replaceState(null, "", cleanUrl);
    }
  }

  init();
})();
