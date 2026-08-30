// ---------- 定数・状態 ----------
const CATEGORIES = [
  { id: "food", label: "食費", emoji: "🍚", color: "#f97316" },
  { id: "daily", label: "日用品", emoji: "🧻", color: "#06b6d4" },
  { id: "transport", label: "交通費", emoji: "🚃", color: "#6366f1" },
  { id: "fun", label: "娯楽", emoji: "🎮", color: "#ec4899" },
  { id: "social", label: "交際費", emoji: "🍻", color: "#eab308" },
  { id: "medical", label: "医療", emoji: "💊", color: "#ef4444" },
  { id: "housing", label: "住居", emoji: "🏠", color: "#8b5cf6" },
  { id: "comm", label: "通信", emoji: "📱", color: "#14b8a6" },
  { id: "other", label: "その他", emoji: "🧾", color: "#94a3b8" },
];
const catById = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

// ダイエット向けごはん提案（低カロリー・高たんぱく中心、costTier: low=節約 / mid=普通）
const MEALS = [
  { emoji: "🍗", name: "鶏むね肉の蒸し鶏サラダ", kcal: 350, tip: "高たんぱく低脂質。茹でるだけで作り置きにも◎", costTier: "low" },
  { emoji: "🥣", name: "豆腐と卵の中華スープ", kcal: 250, tip: "低カロリーでも満腹感があるひと皿", costTier: "low" },
  { emoji: "🐟", name: "鮭の塩焼き＋玄米ご飯", kcal: 450, tip: "良質な脂質と食物繊維で腹持ちが良い", costTier: "mid" },
  { emoji: "🥫", name: "サバ缶と野菜の味噌汁", kcal: 300, tip: "缶詰で安く高たんぱく。骨まで食べられる", costTier: "low" },
  { emoji: "🍚", name: "納豆キムチご飯（小盛り）", kcal: 400, tip: "発酵食品で腸活しながら満足感アップ", costTier: "low" },
  { emoji: "🥗", name: "ツナと野菜のポン酢和え", kcal: 200, tip: "油を使わずさっぱり、あと一品にも便利", costTier: "low" },
  { emoji: "🍢", name: "具沢山おでん（練り物控えめ）", kcal: 280, tip: "野菜多めにすると低カロリーで満足度が高い", costTier: "mid" },
  { emoji: "🍶", name: "冷奴とめかぶ", kcal: 180, tip: "調理不要で高たんぱく＆低カロリーな一品", costTier: "low" },
  { emoji: "🍥", name: "ささみと大葉の梅しそ巻き", kcal: 220, tip: "高たんぱく低脂質で作り置きに向く", costTier: "low" },
  { emoji: "🍲", name: "野菜たっぷり豚汁（具だけ多め）", kcal: 320, tip: "汁物で満足感を出しつつ野菜も摂れる", costTier: "mid" },
  { emoji: "🥦", name: "ゆで卵とブロッコリーのサラダ", kcal: 220, tip: "たんぱく質とビタミンを手軽に補給", costTier: "low" },
  { emoji: "🌶️", name: "鶏むね肉のよだれ鶏風", kcal: 380, tip: "満足感のある味付けで高たんぱく低脂質", costTier: "mid" },
  { emoji: "🍠", name: "さつまいもと鶏むねのグリル", kcal: 420, tip: "糖質はしっかり、脂質は控えめに", costTier: "low" },
  { emoji: "🍙", name: "もち麦入り雑穀ご飯＋味噌汁", kcal: 350, tip: "食物繊維が多く腹持ちが良い主食に", costTier: "low" },
  { emoji: "🍱", name: "高野豆腐の煮物", kcal: 260, tip: "植物性たんぱく質が豊富で低脂質", costTier: "low" },
  { emoji: "🐡", name: "鯖の味噌煮（市販パック）", kcal: 380, tip: "手軽に良質な脂質とたんぱく質を摂れる", costTier: "mid" },
  { emoji: "🍌", name: "ヨーグルト＋バナナ（間食）", kcal: 180, tip: "小腹満たしにたんぱく質と食物繊維を", costTier: "low" },
  { emoji: "🥕", name: "野菜スティックと味噌マヨ", kcal: 150, tip: "噛む回数が増えて満足感が出やすい", costTier: "low" },
  { emoji: "🍗", name: "鶏ハムと温野菜", kcal: 340, tip: "作り置きしておくと平日ラクになる", costTier: "low" },
  { emoji: "🥚", name: "卵とわかめのスープ＋おにぎり1個", kcal: 330, tip: "手早く作れて栄養バランスも良い", costTier: "low" },
];

// 日付をもとにした簡易シード付きシャッフル（同じ日は同じ提案、ボタンで変更可）
function seededShuffle(arr, seed) {
  const a = arr.slice();
  let s = seed % 2147483647 || 1;
  const rand = () => {
    s = (s * 48271) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
let mealShuffleOffset = 0;

function renderMealSuggestions() {
  const card = document.getElementById("mealCard");
  if (!state.settings.dietMode) {
    card.hidden = true;
    return;
  }
  card.hidden = false;

  const cycle = getCurrentCycle();
  const budget = state.settings.monthlyBudget || 0;
  const txs = transactionsInCycle(cycle);
  const spent = txs.reduce((s, t) => s + t.amount, 0);
  const advice = buildAdvice(cycle, spent, budget);
  const basePace = budget > 0 ? budget / cycle.totalCycleDays : Infinity;
  const tight = budget > 0 && advice.dailyAllowance < basePace * 0.6;

  const notEl = document.getElementById("mealCardNote");
  if (tight) {
    notEl.hidden = false;
    notEl.textContent = "予算が厳しめなので、節約できるメニューを中心に提案しています";
  } else {
    notEl.hidden = true;
  }

  const lowCostPool = MEALS.filter((m) => m.costTier === "low");
  const pool = tight && lowCostPool.length >= 3 ? lowCostPool : MEALS;

  const now = new Date();
  const seed = now.getFullYear() * 372 + now.getMonth() * 31 + now.getDate() + mealShuffleOffset * 97;
  const picks = seededShuffle(pool, seed).slice(0, 3);

  const list = document.getElementById("mealList");
  list.innerHTML = "";
  picks.forEach((m) => {
    const row = document.createElement("div");
    row.className = "meal-item";
    row.innerHTML = `
      <span class="meal-emoji">${m.emoji}</span>
      <div class="meal-main">
        <div class="meal-name">${m.name}</div>
        <div class="meal-tip">${m.tip}</div>
      </div>
      <div class="meal-badges">
        <span class="meal-kcal">${m.kcal}kcal</span>
        <span class="meal-cost ${m.costTier}">${m.costTier === "low" ? "節約" : "普通"}</span>
      </div>
    `;
    list.appendChild(row);
  });
}
document.getElementById("mealShuffleBtn").addEventListener("click", () => {
  mealShuffleOffset += 1;
  renderMealSuggestions();
});

const STORAGE_TX = "kakeibo_transactions";
const STORAGE_SETTINGS = "kakeibo_settings";
const STORAGE_WEIGHT = "kakeibo_weight_logs";

const state = {
  transactions: loadTransactions(),
  settings: loadSettings(),
  weightLogs: loadWeightLogs(),
  ocrAmountGuess: null,
};

// ---------- ストレージ ----------
function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_TX);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveTransactions() {
  localStorage.setItem(STORAGE_TX, JSON.stringify(state.transactions));
}
function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS);
    return raw ? JSON.parse(raw) : { monthlyBudget: null, paydayDay: 25 };
  } catch {
    return { monthlyBudget: null, paydayDay: 25 };
  }
}
function saveSettings() {
  localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(state.settings));
}
function loadWeightLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_WEIGHT);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveWeightLogs() {
  localStorage.setItem(STORAGE_WEIGHT, JSON.stringify(state.weightLogs));
}

// ---------- 日付ユーティリティ ----------
function todayMidnight() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function paydayDateFor(year, month, day) {
  const d = Math.min(day, daysInMonth(year, month));
  const dt = new Date(year, month, d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}
function addMonths(year, month, delta) {
  const total = month + delta;
  return { year: year + Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
}
function diffDays(a, b) {
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

// 現在の給料日サイクル { cycleStart, nextPayday, daysLeft, totalCycleDays }
function getCurrentCycle() {
  const payDay = state.settings.paydayDay || 25;
  const today = todayMidnight();
  const thisMonthPayday = paydayDateFor(today.getFullYear(), today.getMonth(), payDay);

  let cycleStart, nextPayday;
  if (today >= thisMonthPayday) {
    cycleStart = thisMonthPayday;
    const nm = addMonths(today.getFullYear(), today.getMonth(), 1);
    nextPayday = paydayDateFor(nm.year, nm.month, payDay);
  } else {
    const pm = addMonths(today.getFullYear(), today.getMonth(), -1);
    cycleStart = paydayDateFor(pm.year, pm.month, payDay);
    nextPayday = thisMonthPayday;
  }
  const daysLeft = Math.max(1, diffDays(nextPayday, today));
  const totalCycleDays = Math.max(1, diffDays(nextPayday, cycleStart));
  return { cycleStart, nextPayday, daysLeft, totalCycleDays, today };
}

function txDate(tx) {
  const d = new Date(tx.date + "T00:00:00");
  return d;
}

function transactionsInCycle(cycle) {
  return state.transactions.filter((tx) => {
    const d = txDate(tx);
    return d >= cycle.cycleStart && d < cycle.nextPayday;
  });
}

// ---------- フォーマット ----------
const yen = (n) => "¥" + Math.round(n).toLocaleString("ja-JP");

// ---------- 画面切り替え ----------
const tabButtons = document.querySelectorAll(".tab-btn");
const views = document.querySelectorAll(".view");
const topbarTitle = document.getElementById("topbarTitle");
const titles = { home: "家計簿", add: "レシートを追加", analysis: "分析", weight: "体重管理", budget: "予算とアドバイス" };

function showView(name) {
  views.forEach((v) => v.classList.toggle("active", v.id === `view-${name}`));
  tabButtons.forEach((b) => b.classList.toggle("active", b.dataset.view === name));
  topbarTitle.textContent = titles[name] || "家計簿";
  if (name === "home") renderHome();
  if (name === "budget") renderBudget();
  if (name === "add") resetAddForm();
  if (name === "analysis") renderAnalysis();
  if (name === "weight") renderWeight();
}
tabButtons.forEach((b) => b.addEventListener("click", () => showView(b.dataset.view)));

// ---------- トースト ----------
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 2200);
}

// ---------- アドバイス生成 ----------
function buildAdvice(cycle, spent, budget) {
  const remaining = budget - spent;
  const dailyAllowance = remaining / cycle.daysLeft;
  const basePace = budget / cycle.totalCycleDays;

  if (budget <= 0) {
    return { icon: "❓", text: "まずは今月の予算を設定してください。", dailyAllowance, remaining };
  }
  if (remaining <= 0) {
    return {
      icon: "😣",
      text: `予算を ${yen(-remaining)} 超過しています。給料日まであと${cycle.daysLeft}日、不要不急の出費は控えめにしましょう。`,
      dailyAllowance,
      remaining,
    };
  }
  if (dailyAllowance >= basePace * 1.15) {
    return {
      icon: "😊",
      text: `順調です！給料日まで1日あたり${yen(dailyAllowance)}くらいまでなら安心して使えます。`,
      dailyAllowance,
      remaining,
    };
  }
  if (dailyAllowance >= basePace * 0.6) {
    return {
      icon: "😐",
      text: `ペースはやや押し気味です。給料日まで1日${yen(dailyAllowance)}を目安に、少し引き締めましょう。`,
      dailyAllowance,
      remaining,
    };
  }
  return {
    icon: "😟",
    text: `このままだと予算オーバーの恐れがあります。給料日まで1日${yen(Math.max(0, dailyAllowance))}に抑えるのがおすすめです。外食や娯楽費を見直しましょう。`,
    dailyAllowance,
    remaining,
  };
}

// ---------- ホーム画面 ----------
function renderHome() {
  const cycle = getCurrentCycle();
  const txs = transactionsInCycle(cycle).sort((a, b) => (a.date < b.date ? 1 : -1));
  const spent = txs.reduce((s, t) => s + t.amount, 0);
  const budget = state.settings.monthlyBudget || 0;
  const remaining = budget - spent;

  document.getElementById("homeDaysLeft").textContent = `給料日まで ${cycle.daysLeft} 日`;
  document.getElementById("homeRemaining").textContent = budget > 0 ? yen(remaining) : "予算未設定";
  document.getElementById("homeSpent").textContent = `使った ${yen(spent)}`;
  document.getElementById("homeBudget").textContent = `予算 ${budget > 0 ? yen(budget) : "--"}`;

  const fill = document.getElementById("homeProgressFill");
  const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  fill.style.width = pct + "%";
  fill.classList.toggle("over", budget > 0 && spent > budget);

  const advice = buildAdvice(cycle, spent, budget);
  document.getElementById("homeAdviceIcon").textContent = advice.icon;
  document.getElementById("homeAdviceText").textContent = advice.text;

  renderMealSuggestions();
  renderWeightSnapshot();

  // カテゴリ別
  const byCat = {};
  txs.forEach((t) => {
    byCat[t.category] = (byCat[t.category] || 0) + t.amount;
  });
  const catList = document.getElementById("homeCategoryList");
  const maxCat = Math.max(1, ...Object.values(byCat));
  catList.innerHTML = "";
  Object.entries(byCat)
    .sort((a, b) => b[1] - a[1])
    .forEach(([id, amt]) => {
      const c = catById(id);
      const row = document.createElement("div");
      row.className = "category-row";
      row.innerHTML = `
        <div class="category-row-top">
          <span class="cat-name">${c.emoji} ${c.label}</span>
          <span>${yen(amt)}</span>
        </div>
        <div class="category-bar-track"><div class="category-bar-fill" style="width:${(amt / maxCat) * 100}%"></div></div>
      `;
      catList.appendChild(row);
    });

  // 一覧
  const listEl = document.getElementById("homeTxList");
  const emptyEl = document.getElementById("homeEmptyState");
  document.getElementById("homeTxCount").textContent = `${txs.length}件`;
  listEl.innerHTML = "";
  if (txs.length === 0) {
    emptyEl.hidden = false;
  } else {
    emptyEl.hidden = true;
    txs.slice(0, 30).forEach((t) => {
      const c = catById(t.category);
      const row = document.createElement("div");
      row.className = "tx-row";
      row.innerHTML = `
        <div class="tx-emoji">${c.emoji}</div>
        <div class="tx-main">
          <div class="tx-cat">${c.label}</div>
          <div class="tx-meta">${t.date}${t.memo ? " ・ " + escapeHtml(t.memo) : ""}</div>
        </div>
        <div class="tx-amount">${yen(t.amount)}</div>
        <button class="tx-delete" data-id="${t.id}" aria-label="削除">✕</button>
      `;
      listEl.appendChild(row);
    });
    listEl.querySelectorAll(".tx-delete").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.transactions = state.transactions.filter((t) => t.id !== btn.dataset.id);
        saveTransactions();
        renderHome();
        showToast("削除しました");
      });
    });
  }
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ---------- 分析画面 ----------
const pad2 = (n) => String(n).padStart(2, "0");
const monthKey = (dateStr) => dateStr.slice(0, 7);
const thisMonthKey = () => monthKey(new Date().toISOString().slice(0, 10));

function availableMonths() {
  const set = new Set(state.transactions.map((t) => monthKey(t.date)));
  set.add(thisMonthKey());
  return Array.from(set).sort().reverse();
}

function populateAnalysisMonths() {
  const sel = document.getElementById("analysisMonth");
  const months = availableMonths();
  const prevValue = sel.value;
  sel.innerHTML = "";
  months.forEach((mk) => {
    const [y, m] = mk.split("-");
    const opt = document.createElement("option");
    opt.value = mk;
    opt.textContent = `${y}年${parseInt(m, 10)}月`;
    sel.appendChild(opt);
  });
  sel.value = months.includes(prevValue) ? prevValue : thisMonthKey();
}

function renderAnalysis() {
  populateAnalysisMonths();
  renderAnalysisBody();
  renderTrend();
}

function renderAnalysisBody() {
  const mk = document.getElementById("analysisMonth").value || thisMonthKey();
  const txs = state.transactions.filter((t) => monthKey(t.date) === mk);
  const total = txs.reduce((s, t) => s + t.amount, 0);

  document.getElementById("analysisTotal").textContent = yen(total);
  document.getElementById("analysisCount").textContent = `${txs.length} 件`;

  const byCat = {};
  txs.forEach((t) => {
    byCat[t.category] = (byCat[t.category] || 0) + t.amount;
  });

  const donutChart = document.getElementById("donutChart");
  const legend = document.getElementById("analysisLegend");
  const emptyEl = document.getElementById("analysisEmpty");
  const centerLabel = document.getElementById("donutCenterLabel");
  legend.innerHTML = "";

  if (total === 0) {
    donutChart.style.background = "var(--surface-2)";
    centerLabel.textContent = "支出なし";
    emptyEl.hidden = false;
    return;
  }
  emptyEl.hidden = true;

  const sorted = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  let acc = 0;
  const segments = sorted.map(([id, amt]) => {
    const c = catById(id);
    const pct = (amt / total) * 100;
    const start = acc;
    acc += pct;
    return `${c.color} ${start}% ${acc}%`;
  });
  donutChart.style.background = `conic-gradient(${segments.join(", ")})`;
  centerLabel.textContent = yen(total);

  sorted.forEach(([id, amt]) => {
    const c = catById(id);
    const pct = Math.round((amt / total) * 1000) / 10;
    const row = document.createElement("div");
    row.className = "legend-row";
    row.innerHTML = `
      <span class="legend-dot" style="background:${c.color}"></span>
      <span class="legend-name">${c.emoji} ${c.label}</span>
      <span class="legend-pct">${pct}%</span>
      <span class="legend-amt">${yen(amt)}</span>
    `;
    legend.appendChild(row);
  });
}
document.getElementById("analysisMonth").addEventListener("change", () => {
  renderAnalysisBody();
  renderTrend();
});

// ---------- 支出の推移（日別・週別・月別） ----------
let trendGranularity = "month";

document.querySelectorAll("#trendGranularityPills .range-pill").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#trendGranularityPills .range-pill").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    trendGranularity = btn.dataset.gran;
    renderTrend();
  });
});

function trendItemsByMonth() {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`, label: `${d.getMonth() + 1}月` });
  }
  const curKey = thisMonthKey();
  return months.map((m) => ({
    label: m.label,
    amt: state.transactions.filter((t) => monthKey(t.date) === m.key).reduce((s, t) => s + t.amount, 0),
    current: m.key === curKey,
  }));
}

function trendItemsByDay(mk) {
  const [y, m] = mk.split("-").map(Number);
  const days = daysInMonth(y, m - 1);
  const monthTx = state.transactions.filter((t) => monthKey(t.date) === mk);
  const todayStr = new Date().toISOString().slice(0, 10);
  const items = [];
  for (let d = 1; d <= days; d++) {
    const dateStr = `${y}-${pad2(m)}-${pad2(d)}`;
    const amt = monthTx.filter((t) => t.date === dateStr).reduce((s, t) => s + t.amount, 0);
    items.push({ label: `${d}`, amt, current: dateStr === todayStr });
  }
  return items;
}

function trendItemsByWeek(mk) {
  const [y, m] = mk.split("-").map(Number);
  const days = daysInMonth(y, m - 1);
  const monthTx = state.transactions.filter((t) => monthKey(t.date) === mk);
  const todayStr = new Date().toISOString().slice(0, 10);
  const items = [];
  for (let start = 1; start <= days; start += 7) {
    const end = Math.min(start + 6, days);
    const amt = monthTx
      .filter((t) => {
        const d = parseInt(t.date.slice(8, 10), 10);
        return d >= start && d <= end;
      })
      .reduce((s, t) => s + t.amount, 0);
    const startStr = `${y}-${pad2(m)}-${pad2(start)}`;
    const endStr = `${y}-${pad2(m)}-${pad2(end)}`;
    items.push({ label: `${start}〜${end}日`, amt, current: todayStr >= startStr && todayStr <= endStr });
  }
  return items;
}

function renderBarColumns(wrap, items, sparse) {
  wrap.innerHTML = "";
  const max = Math.max(1, ...items.map((it) => it.amt));
  items.forEach((it, i) => {
    const col = document.createElement("div");
    col.className = "trend-col" + (it.current ? " current" : "");
    const h = Math.round((it.amt / max) * 100);
    const showLabel = !sparse || i === 0 || i === items.length - 1 || (i + 1) % 5 === 0;
    col.innerHTML = `
      <span class="trend-amt">${it.amt > 0 && !sparse ? Math.round(it.amt / 1000) + "k" : ""}</span>
      <div class="trend-bar-track"><div class="trend-bar-fill" style="height:${h}%"></div></div>
      <span class="trend-label">${showLabel ? it.label : ""}</span>
    `;
    wrap.appendChild(col);
  });
}

function renderTrend() {
  const wrap = document.getElementById("trendChart");
  const subtitleEl = document.getElementById("trendSubtitle");
  const mk = document.getElementById("analysisMonth").value || thisMonthKey();

  if (trendGranularity === "day") {
    subtitleEl.textContent = `${monthLabel(mk)}の日ごとの支出`;
    renderBarColumns(wrap, trendItemsByDay(mk), true);
  } else if (trendGranularity === "week") {
    subtitleEl.textContent = `${monthLabel(mk)}の週ごとの支出`;
    renderBarColumns(wrap, trendItemsByWeek(mk), false);
  } else {
    subtitleEl.textContent = "直近6か月の合計支出";
    renderBarColumns(wrap, trendItemsByMonth(), false);
  }
}

// ---------- 体重管理 ----------
function sortedWeightLogs(order) {
  const withIndex = state.weightLogs.map((w, i) => ({ ...w, _i: i }));
  withIndex.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    const ah = a.hour ?? -1;
    const bh = b.hour ?? -1;
    if (ah !== bh) return ah - bh;
    return a._i - b._i;
  });
  return order === "desc" ? withIndex.reverse() : withIndex;
}

function fmtFat(v) {
  return v !== null && v !== undefined && v !== "" ? `${v}%` : null;
}

function fmtHour(h) {
  return h !== null && h !== undefined && h !== "" ? `${h}時` : "";
}

// 記録(date+hour)をタイムスタンプに変換。時刻未入力は0時扱い
const pointTs = (p) => new Date(`${p.date}T${pad2(p.hour || 0)}:00:00`).getTime();

const weightHourSelect = document.getElementById("weightHour");
for (let h = 0; h <= 23; h++) {
  const opt = document.createElement("option");
  opt.value = h;
  opt.textContent = `${h}時`;
  weightHourSelect.appendChild(opt);
}

function makeScale(values, padFrac, top, bottom) {
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const pad = (max - min) * padFrac;
  min -= pad;
  max += pad;
  return (v) => bottom - ((v - min) / (max - min)) * (bottom - top);
}

// weightPoints: [{date, weight}] 昇順, fatPoints: [{date, bodyFat}] 昇順(体脂肪が入っている記録のみ), target: 目標体重 or null
function buildWeightSvg(weightPoints, fatPoints, target) {
  if (weightPoints.length === 0) return "";
  const w = 340,
    chartTop = 12,
    chartH = 150,
    padX = 14,
    labelY = 175,
    totalH = 192;

  const allTs = weightPoints.map((p) => pointTs(p));
  const minTs = Math.min(...allTs);
  const maxTs = Math.max(...allTs);
  const xOf = (p) => {
    if (minTs === maxTs) return padX + (w - padX * 2) / 2;
    return padX + ((pointTs(p) - minTs) / (maxTs - minTs)) * (w - padX * 2);
  };

  const weightValues = weightPoints.map((p) => p.weight).concat(target ? [target] : []);
  const weightScale = makeScale(weightValues, 0.15, chartTop, chartH);

  const wCoords = weightPoints.map((p) => [xOf(p), weightScale(p.weight)]);
  const wLinePath = wCoords.map((c, i) => (i === 0 ? "M" : "L") + c[0].toFixed(1) + "," + c[1].toFixed(1)).join(" ");
  const wAreaPath = `${wLinePath} L${wCoords[wCoords.length - 1][0].toFixed(1)},${chartH} L${wCoords[0][0].toFixed(1)},${chartH} Z`;
  const lastIdx = wCoords.length - 1;
  const wDots = wCoords
    .slice(0, lastIdx)
    .map((c) => `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="2.5" fill="var(--primary)" />`)
    .join("");

  // 最新の記録は目立たせる（パルスアニメーション＋強調リング＋数値ラベル）
  const [lastX, lastY] = wCoords[lastIdx];
  const lastNearTop = lastY < chartTop + 16;
  const lastLabelY = lastNearTop ? lastY + 16 : lastY - 10;
  const lastLabelText = `${weightPoints[lastIdx].weight}kg`;
  const lastLabelW = lastLabelText.length * 7 + 8;
  const lastDotCluster = `
    <circle class="weight-current-pulse" cx="${lastX.toFixed(1)}" cy="${lastY.toFixed(1)}" r="4.5" fill="var(--primary)" />
    <circle cx="${lastX.toFixed(1)}" cy="${lastY.toFixed(1)}" r="4.5" fill="var(--primary)" stroke="var(--surface)" stroke-width="2" />
    <rect x="${(lastX - lastLabelW / 2).toFixed(1)}" y="${(lastLabelY - 11).toFixed(1)}" width="${lastLabelW}" height="15" fill="var(--surface)" opacity="0.9" rx="3" />
    <text x="${lastX.toFixed(1)}" y="${lastLabelY.toFixed(1)}" font-size="11.5" fill="var(--primary-dark)" text-anchor="middle" font-weight="800">${lastLabelText}</text>
  `;

  // 一番古い記録の数値も薄く表示して、変化量を実感しやすくする
  const [firstX, firstY] = wCoords[0];
  const firstNearTop = firstY < chartTop + 16;
  const firstLabelY = firstNearTop ? firstY + 16 : firstY - 10;
  const firstLabelText = `${weightPoints[0].weight}kg`;
  const firstDotLabel =
    wCoords.length > 1
      ? `<text x="${firstX.toFixed(1)}" y="${firstLabelY.toFixed(1)}" font-size="10.5" fill="var(--text-muted)" text-anchor="middle" font-weight="700">${firstLabelText}</text>`
      : "";

  let fatLine = "";
  let fatDots = "";
  if (fatPoints.length > 0) {
    const fatScale = makeScale(
      fatPoints.map((p) => p.bodyFat),
      0.25,
      chartTop,
      chartH
    );
    const fCoords = fatPoints.map((p) => [xOf(p), fatScale(p.bodyFat)]);
    if (fCoords.length > 1) {
      const fLinePath = fCoords.map((c, i) => (i === 0 ? "M" : "L") + c[0].toFixed(1) + "," + c[1].toFixed(1)).join(" ");
      fatLine = `<path d="${fLinePath}" fill="none" stroke="#f59e0b" stroke-width="2.25" stroke-dasharray="5 4" stroke-linejoin="round" stroke-linecap="round" />`;
    }
    fatDots = fCoords.map((c, i) => `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${i === fCoords.length - 1 ? 3.5 : 2.2}" fill="#f59e0b" />`).join("");
  }

  let targetLine = "";
  if (target) {
    const ty = Number(weightScale(target).toFixed(1));
    const labelText = `目標 ${target}kg`;
    const labelW = labelText.length * 8 + 8;
    const onTop = ty < chartTop + 16;
    const labelY2 = onTop ? ty + 14 : ty - 5;
    targetLine = `
      <line x1="${padX}" y1="${ty}" x2="${w - padX}" y2="${ty}" stroke="#6366f1" stroke-width="1.75" stroke-dasharray="5 4" />
      <rect x="${w - padX - labelW}" y="${labelY2 - 11}" width="${labelW}" height="15" fill="var(--surface)" opacity="0.88" rx="3" />
      <text x="${w - padX}" y="${labelY2}" font-size="10.5" fill="#6366f1" text-anchor="end" font-weight="700">${labelText}</text>
    `;
  }

  const firstLabel = weightPoints[0].date.slice(5).replace("-", "/");
  const lastLabel = weightPoints[weightPoints.length - 1].date.slice(5).replace("-", "/");
  return `
    <svg viewBox="0 0 ${w} ${totalH}" style="width:100%; height:auto; display:block; overflow:visible;">
      <path d="${wAreaPath}" fill="var(--primary-tint)" stroke="none" />
      ${targetLine}
      <path d="${wLinePath}" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
      ${fatLine}
      ${wDots}
      ${fatDots}
      ${firstDotLabel}
      ${lastDotCluster}
      <text x="${padX}" y="${labelY}" font-size="11" fill="var(--text-muted)">${firstLabel}</text>
      <text x="${w - padX}" y="${labelY}" font-size="11" fill="var(--text-muted)" text-anchor="end">${lastLabel}</text>
    </svg>
  `;
}

function renderWeightSnapshot() {
  const card = document.getElementById("weightSnapshot");
  const desc = sortedWeightLogs("desc");
  if (desc.length === 0) {
    card.hidden = true;
    return;
  }
  card.hidden = false;
  const latest = desc[0];
  const prev = desc[1];
  document.getElementById("weightSnapshotValue").textContent = `${latest.weight}kg`;

  const deltaEl = document.getElementById("weightSnapshotDelta");
  if (prev) {
    const diff = Math.round((latest.weight - prev.weight) * 10) / 10;
    const sign = diff > 0 ? "+" : "";
    deltaEl.textContent = `前回比 ${sign}${diff.toFixed(1)}kg`;
    deltaEl.className = "weight-snapshot-delta" + (diff < 0 ? " down" : diff > 0 ? " up" : "");
  } else {
    deltaEl.textContent = "";
    deltaEl.className = "weight-snapshot-delta";
  }

  const fatEl = document.getElementById("weightSnapshotFat");
  const fat = fmtFat(latest.bodyFat);
  fatEl.textContent = fat ? `体脂肪 ${fat}` : "";
}

function renderWeightLogList() {
  const listEl = document.getElementById("weightLogList");
  listEl.innerHTML = "";
  const all = sortedWeightLogs("desc");
  document.getElementById("weightLogCount").textContent = `${all.length}件`;
  const desc = all.slice(0, 30);
  desc.forEach((w) => {
    const fat = fmtFat(w.bodyFat);
    const row = document.createElement("div");
    row.className = "tx-row";
    row.innerHTML = `
      <div class="tx-emoji">⚖️</div>
      <div class="tx-main">
        <div class="tx-cat">${w.weight}kg${fat ? " ・ 体脂肪 " + fat : ""}</div>
        <div class="tx-meta">${w.date}${fmtHour(w.hour) ? " " + fmtHour(w.hour) : ""}${w.memo ? " ・ " + escapeHtml(w.memo) : ""}</div>
      </div>
      <button class="tx-delete" data-id="${w.id}" aria-label="削除">✕</button>
    `;
    listEl.appendChild(row);
  });
  listEl.querySelectorAll(".tx-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.weightLogs = state.weightLogs.filter((w) => w.id !== btn.dataset.id);
      saveWeightLogs();
      renderWeight();
      renderWeightSnapshot();
      showToast("削除しました");
    });
  });
}

// グラフの横軸レンジ（1週間/1ヶ月/3ヶ月/月を選択/すべて）
let weightChartRange = "30d";
let weightSelectedMonth = null;
const RANGE_DAYS = { "7d": 7, "30d": 30, "90d": 90 };
const RANGE_LABEL = { "7d": "直近1週間", "30d": "直近1ヶ月", "90d": "直近3ヶ月", all: null, month: null };

const monthLabel = (mk) => {
  const [y, m] = mk.split("-");
  return `${y}年${parseInt(m, 10)}月`;
};

function availableWeightMonths() {
  const set = new Set(state.weightLogs.map((w) => monthKey(w.date)));
  set.add(thisMonthKey());
  return Array.from(set).sort().reverse();
}

function populateWeightMonthSelect() {
  const sel = document.getElementById("weightMonthSelect");
  const months = availableWeightMonths();
  const prevValue = weightSelectedMonth || sel.value;
  sel.innerHTML = "";
  months.forEach((mk) => {
    const opt = document.createElement("option");
    opt.value = mk;
    opt.textContent = monthLabel(mk);
    sel.appendChild(opt);
  });
  sel.value = months.includes(prevValue) ? prevValue : months[0];
  weightSelectedMonth = sel.value;
}

function filterByRange(asc, range) {
  if (range === "month") {
    return asc.filter((p) => monthKey(p.date) === weightSelectedMonth);
  }
  if (range === "all" || !RANGE_DAYS[range]) return asc;
  const cutoff = todayMidnight();
  cutoff.setDate(cutoff.getDate() - (RANGE_DAYS[range] - 1));
  return asc.filter((p) => txDate(p) >= cutoff);
}

document.querySelectorAll("#weightRangePills .range-pill").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#weightRangePills .range-pill").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    weightChartRange = btn.dataset.range;
    const monthSelect = document.getElementById("weightMonthSelect");
    if (weightChartRange === "month") {
      populateWeightMonthSelect();
      monthSelect.hidden = false;
    } else {
      monthSelect.hidden = true;
    }
    renderWeight();
  });
});

document.getElementById("weightMonthSelect").addEventListener("change", (e) => {
  weightSelectedMonth = e.target.value;
  renderWeight();
});

function renderWeight() {
  document.getElementById("targetWeight").value = state.settings.targetWeight ?? "";
  const dateInput = document.getElementById("weightDate");
  dateInput.value = dateInput.value || new Date().toISOString().slice(0, 10);
  const hourInput = document.getElementById("weightHour");
  if (!hourInput.value) hourInput.value = new Date().getHours();

  const asc = sortedWeightLogs("asc");
  const desc = sortedWeightLogs("desc");
  const latest = desc[0];

  document.getElementById("weightStatCurrent").textContent = latest ? `${latest.weight}kg` : "--kg";
  document.getElementById("weightStatFat").textContent = latest ? fmtFat(latest.bodyFat) || "--%" : "--%";

  const target = state.settings.targetWeight;
  const toGoalEl = document.getElementById("weightStatToGoal");
  if (target && latest) {
    const diff = Math.round((latest.weight - target) * 10) / 10;
    toGoalEl.textContent = Math.abs(diff) < 0.05 ? "達成 🎉" : `${diff > 0 ? "-" : "+"}${Math.abs(diff).toFixed(1)}kg`;
  } else {
    toGoalEl.textContent = target ? "記録なし" : "未設定";
  }

  document.getElementById("weightRangePills").hidden = asc.length === 0;

  const chartWrap = document.getElementById("weightChartWrap");
  const chartEmpty = document.getElementById("weightChartEmpty");
  if (asc.length === 0) {
    chartWrap.hidden = true;
    chartEmpty.hidden = false;
  } else {
    chartWrap.hidden = false;
    chartEmpty.hidden = true;
    const filtered = filterByRange(asc, weightChartRange);
    const rangeEmptyEl = document.getElementById("weightRangeEmpty");

    if (filtered.length === 0) {
      rangeEmptyEl.hidden = false;
      document.getElementById("weightChart").innerHTML = "";
      document.getElementById("fatLegendItem").hidden = true;
      document.getElementById("targetLegendItem").hidden = true;
      document.getElementById("weightProgressBadge").hidden = true;
    } else {
      rangeEmptyEl.hidden = true;
      const fatsInRange = filtered.filter((p) => p.bodyFat !== null && p.bodyFat !== undefined && p.bodyFat !== "");
      document.getElementById("fatLegendItem").hidden = fatsInRange.length === 0;
      document.getElementById("targetLegendItem").hidden = !target;
      document.getElementById("weightChart").innerHTML = buildWeightSvg(filtered, fatsInRange, target || null);
      renderWeightProgressBadge(filtered, weightChartRange);
    }
  }

  renderWeightLogList();
}

// 選択中の期間での変化量を「頑張りが伝わる」形で表示するバッジ
function renderWeightProgressBadge(points, range) {
  const badge = document.getElementById("weightProgressBadge");
  const icon = document.getElementById("weightProgressIcon");
  const textEl = document.getElementById("weightProgressText");
  if (points.length < 2) {
    badge.hidden = true;
    return;
  }
  const first = points[0];
  const last = points[points.length - 1];
  const diff = Math.round((last.weight - first.weight) * 10) / 10;
  const days = Math.max(1, diffDays(txDate(last), txDate(first)));
  const fromLabel = first.date.slice(5).replace("-", "/");
  const periodPhrase =
    range === "month" && weightSelectedMonth
      ? `${monthLabel(weightSelectedMonth)}で`
      : RANGE_LABEL[range]
      ? `${RANGE_LABEL[range]}で`
      : `${fromLabel}の記録開始から ${days}日間で`;

  badge.hidden = false;
  if (diff < 0) {
    badge.className = "weight-progress-badge";
    icon.textContent = "📉";
    textEl.textContent = `${periodPhrase} -${Math.abs(diff).toFixed(1)}kg！この調子です`;
  } else if (diff > 0) {
    badge.className = "weight-progress-badge up";
    icon.textContent = "📈";
    textEl.textContent = `${periodPhrase} +${diff.toFixed(1)}kg。焦らず続けていきましょう`;
  } else {
    badge.className = "weight-progress-badge flat";
    icon.textContent = "➡️";
    textEl.textContent = `${periodPhrase}変化なし。記録を続けていきましょう`;
  }
}

document.getElementById("targetWeightForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const raw = document.getElementById("targetWeight").value;
  state.settings.targetWeight = raw === "" ? null : parseFloat(raw);
  saveSettings();
  renderWeight();
  showToast("目標体重を保存しました");
});

document.getElementById("weightForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const weight = parseFloat(document.getElementById("weightInput").value);
  if (isNaN(weight) || weight <= 0) return;
  const fatRaw = document.getElementById("bodyFatInput").value;
  const bodyFat = fatRaw === "" ? null : parseFloat(fatRaw);
  const hourRaw = document.getElementById("weightHour").value;
  const entry = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    weight,
    bodyFat,
    date: document.getElementById("weightDate").value,
    hour: hourRaw === "" ? null : parseInt(hourRaw, 10),
    memo: document.getElementById("weightMemo").value.trim(),
  };
  state.weightLogs.push(entry);
  saveWeightLogs();
  document.getElementById("weightForm").reset();
  renderWeight();
  renderWeightSnapshot();
  showToast("記録しました");
});

// ---------- 予算画面 ----------
const paydaySelect = document.getElementById("paydayDay");
for (let d = 1; d <= 31; d++) {
  const opt = document.createElement("option");
  opt.value = d;
  opt.textContent = `${d}日`;
  paydaySelect.appendChild(opt);
}

function renderBudget() {
  document.getElementById("monthlyBudget").value = state.settings.monthlyBudget || "";
  paydaySelect.value = state.settings.paydayDay || 25;
  document.getElementById("dietModeToggle").checked = !!state.settings.dietMode;

  const budget = state.settings.monthlyBudget || 0;
  const emptyEl = document.getElementById("budgetAdviceEmpty");
  const bodyEl = document.getElementById("budgetAdviceBody");

  if (!budget) {
    emptyEl.hidden = false;
    bodyEl.hidden = true;
    return;
  }
  emptyEl.hidden = true;
  bodyEl.hidden = false;

  const cycle = getCurrentCycle();
  const txs = transactionsInCycle(cycle);
  const spent = txs.reduce((s, t) => s + t.amount, 0);
  const advice = buildAdvice(cycle, spent, budget);

  document.getElementById("adviceDays").textContent = `${cycle.daysLeft} 日`;
  document.getElementById("adviceRemaining").textContent = yen(advice.remaining);
  document.getElementById("adviceDaily").textContent = yen(Math.max(0, advice.dailyAllowance));
  document.getElementById("budgetAdviceIcon").textContent = advice.icon;
  document.getElementById("budgetAdviceText").textContent = advice.text;
}

document.getElementById("budgetForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const budget = parseInt(document.getElementById("monthlyBudget").value, 10);
  const payday = parseInt(paydaySelect.value, 10);
  if (isNaN(budget) || budget < 0) return;
  state.settings.monthlyBudget = budget;
  state.settings.paydayDay = payday;
  state.settings.dietMode = document.getElementById("dietModeToggle").checked;
  saveSettings();
  renderBudget();
  showToast("予算を保存しました");
});

// ---------- データの引っ越し・バックアップ ----------
document.getElementById("exportDataBtn").addEventListener("click", () => {
  const payload = JSON.stringify({
    transactions: state.transactions,
    settings: state.settings,
    weightLogs: state.weightLogs,
    exportedAt: new Date().toISOString(),
  });
  const box = document.getElementById("exportBox");
  const textarea = document.getElementById("exportTextarea");
  textarea.value = payload;
  box.hidden = false;
  textarea.focus();
  textarea.select();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(payload).then(
      () => showToast("クリップボードにコピーしました"),
      () => showToast("下の欄を手動でコピーしてください")
    );
  } else {
    showToast("下の欄を手動でコピーしてください");
  }
});

document.getElementById("showImportBtn").addEventListener("click", () => {
  const box = document.getElementById("importBox");
  box.hidden = !box.hidden;
});

document.getElementById("importDataBtn").addEventListener("click", () => {
  const raw = document.getElementById("importTextarea").value.trim();
  if (!raw) return;
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    alert("データの形式が正しくありません。コピーした内容をそのまま貼り付けてください。");
    return;
  }
  if (!confirm("現在このページにあるデータを、貼り付けた内容で上書きします。よろしいですか？")) return;

  state.transactions = Array.isArray(data.transactions) ? data.transactions : [];
  state.settings = data.settings && typeof data.settings === "object" ? data.settings : { monthlyBudget: null, paydayDay: 25 };
  state.weightLogs = Array.isArray(data.weightLogs) ? data.weightLogs : [];
  saveTransactions();
  saveSettings();
  saveWeightLogs();
  document.getElementById("importTextarea").value = "";
  document.getElementById("importBox").hidden = true;
  showToast("読み込みました");
  showView("home");
});

document.getElementById("resetDataBtn").addEventListener("click", () => {
  if (confirm("すべての記録と設定を削除します。よろしいですか？")) {
    state.transactions = [];
    state.settings = { monthlyBudget: null, paydayDay: 25 };
    state.weightLogs = [];
    saveTransactions();
    saveSettings();
    saveWeightLogs();
    renderBudget();
    showToast("データを削除しました");
  }
});

// ---------- 追加画面 ----------
const categorySelect = document.getElementById("txCategory");
CATEGORIES.forEach((c) => {
  const opt = document.createElement("option");
  opt.value = c.id;
  opt.textContent = `${c.emoji} ${c.label}`;
  categorySelect.appendChild(opt);
});

const photoInput = document.getElementById("photoInput");
const receiptPreview = document.getElementById("receiptPreview");
const ocrStatus = document.getElementById("ocrStatus");
const ocrStatusText = document.getElementById("ocrStatusText");
const txForm = document.getElementById("txForm");

function resetAddForm() {
  photoInput.value = "";
  receiptPreview.hidden = true;
  receiptPreview.src = "";
  ocrStatus.hidden = true;
  txForm.hidden = true;
  document.getElementById("ocrRawWrap").hidden = true;
  document.getElementById("ocrRawText").textContent = "";
  document.getElementById("amountCandidates").hidden = true;
  document.getElementById("amountCandidates").innerHTML = "";
  txForm.reset();
}

document.getElementById("manualAddBtn").addEventListener("click", () => {
  openFormForEntry({ amount: "", date: null, rawText: "", candidates: [] });
});

photoInput.addEventListener("change", async () => {
  const file = photoInput.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  receiptPreview.src = url;
  receiptPreview.hidden = false;
  txForm.hidden = true;
  ocrStatus.hidden = false;
  ocrStatusText.textContent = "文字を読み取っています...";

  try {
    const text = await runOcr(file, (progress) => {
      ocrStatusText.textContent = `文字を読み取っています... ${progress}%`;
    });
    const candidates = getAmountCandidates(text);
    const amount = candidates.length ? candidates[0].num : null;
    const date = extractDate(text);
    ocrStatus.hidden = true;
    openFormForEntry({ amount: amount || "", date, rawText: text, candidates });
    if (amount && date) {
      showToast(`${yen(amount)} ・ ${date} を読み取りました`);
    } else {
      showToast(`${amount ? "" : "金額"}${!amount && !date ? "・" : ""}${date ? "" : "日付"}を自動検出できませんでした`);
    }
  } catch (err) {
    console.error(err);
    ocrStatus.hidden = true;
    openFormForEntry({ amount: "", date: null, rawText: "", candidates: [] });
    showToast("読み取りに失敗しました。手入力してください");
  }
});

function openFormForEntry({ amount, date, rawText, candidates }) {
  txForm.hidden = false;
  document.getElementById("txAmount").value = amount;
  document.getElementById("txDate").value = date || new Date().toISOString().slice(0, 10);
  document.getElementById("txCategory").value = "food";
  document.getElementById("txMemo").value = "";
  const rawWrap = document.getElementById("ocrRawWrap");
  if (rawText) {
    rawWrap.hidden = false;
    document.getElementById("ocrRawText").textContent = rawText;
  } else {
    rawWrap.hidden = true;
  }

  const chipRow = document.getElementById("amountCandidates");
  chipRow.innerHTML = "";
  const otherCandidates = (candidates || []).filter((c) => c.num !== amount).slice(0, 5);
  if (otherCandidates.length > 0) {
    chipRow.hidden = false;
    const label = document.createElement("span");
    label.className = "chip-row-label";
    label.textContent = "他の候補:";
    chipRow.appendChild(label);
    otherCandidates.forEach((c) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.textContent = yen(c.num);
      chip.addEventListener("click", () => {
        document.getElementById("txAmount").value = c.num;
      });
      chipRow.appendChild(chip);
    });
  } else {
    chipRow.hidden = true;
  }

  document.getElementById("txAmount").focus();
}

document.getElementById("txCancelBtn").addEventListener("click", () => {
  resetAddForm();
});

txForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const amount = parseInt(document.getElementById("txAmount").value, 10);
  if (isNaN(amount) || amount <= 0) return;
  const tx = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    amount,
    category: document.getElementById("txCategory").value,
    date: document.getElementById("txDate").value,
    memo: document.getElementById("txMemo").value.trim(),
  };
  state.transactions.push(tx);
  saveTransactions();
  resetAddForm();
  showToast("記録しました");
  showView("home");
});

// ---------- OCR (Tesseract.js) ----------
let tesseractLoadPromise = null;
function loadTesseract() {
  if (window.Tesseract) return Promise.resolve();
  if (tesseractLoadPromise) return tesseractLoadPromise;
  tesseractLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Tesseract の読み込みに失敗しました"));
    document.head.appendChild(script);
  });
  return tesseractLoadPromise;
}

// 撮影/選択した画像をOCRしやすいように加工する（拡大・グレースケール・コントラスト強調）
function preprocessReceiptImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const longSide = Math.max(img.width, img.height);
      let scale = 1;
      if (longSide < 1500) scale = Math.min(2.2, 1500 / longSide);
      else if (longSide > 2400) scale = 2400 / longSide;
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);

      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;
      const gray = new Uint8ClampedArray(w * h);
      let min = 255,
        max = 0;
      for (let i = 0, p = 0; i < d.length; i += 4, p++) {
        const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        gray[p] = g;
        if (g < min) min = g;
        if (g > max) max = g;
      }
      const range = Math.max(1, max - min);
      for (let i = 0, p = 0; i < d.length; i += 4, p++) {
        let v = ((gray[p] - min) / range) * 255;
        v = Math.min(255, Math.max(0, (v - 128) * 1.35 + 128));
        d[i] = d[i + 1] = d[i + 2] = v;
      }
      ctx.putImageData(imgData, 0, 0);
      resolve(canvas);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("画像の読み込みに失敗しました"));
    };
    img.src = url;
  });
}

async function runOcr(file, onProgress) {
  await loadTesseract();
  const canvas = await preprocessReceiptImage(file);
  const result = await window.Tesseract.recognize(canvas, "jpn+eng", {
    tessedit_pageseg_mode: "6",
    preserve_interword_spaces: "1",
    logger: (m) => {
      if (m.status === "recognizing text" && onProgress) {
        onProgress(Math.round((m.progress || 0) * 100));
      }
    },
  });
  return result.data.text || "";
}

// レシートの文字列から金額候補を抽出（合計行を優先、金額が大きい順）
function getAmountCandidates(text) {
  const totalKeywords = ["合計", "ご合計", "御合計", "お会計", "会計", "総合計", "total", "Total", "TOTAL"];
  const lines = text.split(/\r?\n/);
  const candidates = [];

  lines.forEach((line) => {
    const isTotalLine = totalKeywords.some((k) => line.includes(k));
    const matches = line.match(/\d{1,3}(?:[,，]\d{3})+|\d{2,}/g);
    if (!matches) return;
    matches.forEach((raw) => {
      const num = parseInt(raw.replace(/[,，]/g, ""), 10);
      if (!isNaN(num) && num > 0 && num < 10000000) {
        candidates.push({ num, priority: isTotalLine ? 2 : 1 });
      }
    });
  });

  const best = new Map();
  candidates.forEach((c) => {
    if (!best.has(c.num) || best.get(c.num) < c.priority) best.set(c.num, c.priority);
  });
  return Array.from(best.entries())
    .map(([num, priority]) => ({ num, priority }))
    .sort((a, b) => b.priority - a.priority || b.num - a.num);
}

function extractAmount(text) {
  const candidates = getAmountCandidates(text);
  return candidates.length ? candidates[0].num : null;
}

// レシートの文字列から日付を読み取り、"YYYY-MM-DD" 形式で返す（見つからなければ null）
function extractDate(text) {
  const pad2 = (n) => String(n).padStart(2, "0");
  const isValid = (y, m, d) => y >= 2015 && y <= 2099 && m >= 1 && m <= 12 && d >= 1 && d <= 31;
  const toIso = (y, m, d) => `${y}-${pad2(m)}-${pad2(d)}`;

  // 1) 令和などの和暦（令和6年8月21日）
  let m = text.match(/令和\s*(\d{1,2})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
  if (m) {
    const y = 2018 + parseInt(m[1], 10);
    const mo = parseInt(m[2], 10);
    const d = parseInt(m[3], 10);
    if (isValid(y, mo, d)) return toIso(y, mo, d);
  }

  // 2) 和暦の略記（R6.8.21 / R6-08-21）
  m = text.match(/[RrＲ]\s?(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
  if (m) {
    const y = 2018 + parseInt(m[1], 10);
    const mo = parseInt(m[2], 10);
    const d = parseInt(m[3], 10);
    if (isValid(y, mo, d)) return toIso(y, mo, d);
  }

  // 3) 西暦4桁（2026年8月21日 / 2026/08/21 / 2026-08-21 / 2026.08.21）
  m = text.match(/(20\d{2})\s*[年./\-]\s*(\d{1,2})\s*[月./\-]\s*(\d{1,2})\s*日?/);
  if (m) {
    const y = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10);
    const d = parseInt(m[3], 10);
    if (isValid(y, mo, d)) return toIso(y, mo, d);
  }

  // 4) 西暦下2桁（26/08/21 など）
  m = text.match(/(\d{2})[./\-](\d{1,2})[./\-](\d{1,2})/);
  if (m) {
    const y = 2000 + parseInt(m[1], 10);
    const mo = parseInt(m[2], 10);
    const d = parseInt(m[3], 10);
    if (isValid(y, mo, d)) return toIso(y, mo, d);
  }

  // 5) 年なし（08月21日 / 08/21）… 今日を基準に年を補完
  m = text.match(/(\d{1,2})\s*[月./\-]\s*(\d{1,2})\s*日?(?!\s*[:：]\s*\d)/);
  if (m) {
    const mo = parseInt(m[1], 10);
    const d = parseInt(m[2], 10);
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) {
      const now = new Date();
      let y = now.getFullYear();
      const candidate = new Date(y, mo - 1, d);
      // レシートは未来日にならないはず。今日より30日以上先なら前年とみなす
      if (candidate - now > 30 * 86400000) y -= 1;
      return toIso(y, mo, d);
    }
  }

  return null;
}

// ---------- 初期化 ----------
showView("home");
