/* ===========================================================
   1. MOCK DATASET
   In a real project this array would come from an API call.
   Here we generate it client-side so the demo is self-contained.
=========================================================== */

const SOURCES = ["Organic", "Paid", "Social", "Referral", "Direct"];
const PAGES = ["/home", "/pricing", "/blog/intro", "/docs", "/signup", "/features", "/about", "/contact"];
const DAYS = 45;

function generateDataset() {
  const rows = [];
  const today = new Date();

  for (let d = DAYS; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().slice(0, 10);

    // 3-6 page entries per day
    const entriesToday = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < entriesToday; i++) {
      const traffic = Math.floor(80 + Math.random() * 900);
      const clicks = Math.floor(traffic * (0.1 + Math.random() * 0.35));
      const engagement = +( (clicks / traffic) * 100 ).toFixed(1);

      rows.push({
        date: dateStr,
        page: PAGES[Math.floor(Math.random() * PAGES.length)],
        source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
        traffic,
        clicks,
        engagement,
        sessionSec: Math.floor(30 + Math.random() * 240)
      });
    }
  }
  return rows;
}

let rawData = generateDataset();

/* ===========================================================
   2. STATE
=========================================================== */

const state = {
  range: "30",
  source: "all",
  search: "",
  sortKey: "date",
  sortDir: "desc"
};

/* ===========================================================
   3. FILTERING (client-side)
=========================================================== */

function applyFilters(data) {
  let out = data;

  if (state.range !== "all") {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(state.range, 10));
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    out = out.filter(r => r.date >= cutoffStr);
  }

  if (state.source !== "all") {
    out = out.filter(r => r.source === state.source);
  }

  if (state.search.trim() !== "") {
    const q = state.search.trim().toLowerCase();
    out = out.filter(r => r.page.toLowerCase().includes(q));
  }

  return out;
}

/* ===========================================================
   4. SORTING (client-side)
=========================================================== */

function applySort(data) {
  const { sortKey, sortDir } = state;
  const dir = sortDir === "asc" ? 1 : -1;

  return [...data].sort((a, b) => {
    const va = a[sortKey];
    const vb = b[sortKey];
    if (typeof va === "number") return (va - vb) * dir;
    return String(va).localeCompare(String(vb)) * dir;
  });
}

/* ===========================================================
   5. AGGREGATION (client-side)
   Rolls the filtered rows up into KPIs and chart-ready series.
=========================================================== */

function aggregate(data) {
  const totals = data.reduce((acc, r) => {
    acc.traffic += r.traffic;
    acc.clicks += r.clicks;
    acc.session += r.sessionSec;
    return acc;
  }, { traffic: 0, clicks: 0, session: 0 });

  const engagementRate = totals.traffic > 0
    ? +((totals.clicks / totals.traffic) * 100).toFixed(1)
    : 0;

  const avgSessionSec = data.length > 0
    ? Math.round(totals.session / data.length)
    : 0;

  // Group by date for the trend chart
  const byDate = {};
  data.forEach(r => {
    if (!byDate[r.date]) byDate[r.date] = { traffic: 0, clicks: 0 };
    byDate[r.date].traffic += r.traffic;
    byDate[r.date].clicks += r.clicks;
  });
  const dates = Object.keys(byDate).sort();

  // Group by source for the pie/doughnut chart
  const bySource = {};
  data.forEach(r => {
    bySource[r.source] = (bySource[r.source] || 0) + r.clicks;
  });

  return {
    totals,
    engagementRate,
    avgSessionSec,
    trend: {
      labels: dates,
      traffic: dates.map(d => byDate[d].traffic),
      clicks: dates.map(d => byDate[d].clicks)
    },
    bySource
  };
}

/* ===========================================================
   6. RENDERING
=========================================================== */

let trendChart, sourceChart;

function formatSession(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

function renderKPIs(agg, prevAgg) {
  document.getElementById("kpiTraffic").textContent = agg.totals.traffic.toLocaleString();
  document.getElementById("kpiClicks").textContent = agg.totals.clicks.toLocaleString();
  document.getElementById("kpiEngagement").textContent = agg.engagementRate + "%";
  document.getElementById("kpiSession").textContent = formatSession(agg.avgSessionSec);

  setDelta("kpiTrafficDelta", prevAgg?.totals.traffic, agg.totals.traffic);
  setDelta("kpiClicksDelta", prevAgg?.totals.clicks, agg.totals.clicks);
  setDelta("kpiEngagementDelta", prevAgg?.engagementRate, agg.engagementRate);
  setDelta("kpiSessionDelta", prevAgg?.avgSessionSec, agg.avgSessionSec);
}

function setDelta(id, prevVal, newVal) {
  const el = document.getElementById(id);
  if (prevVal === undefined || prevVal === null || prevVal === 0) {
    el.textContent = "—";
    return;
  }
  const change = ((newVal - prevVal) / prevVal) * 100;
  const sign = change >= 0 ? "+" : "";
  el.textContent = `${sign}${change.toFixed(1)}%`;
  el.classList.toggle("negative", change < 0);
}

function renderCharts(agg) {
  const trendCtx = document.getElementById("trendChart");
  const sourceCtx = document.getElementById("sourceChart");

  const trendData = {
    labels: agg.trend.labels,
    datasets: [
      {
        label: "Traffic",
        data: agg.trend.traffic,
        borderColor: "#22D3C5",
        backgroundColor: "rgba(34,211,197,0.12)",
        tension: 0.35,
        fill: true,
        pointRadius: 0
      },
      {
        label: "Clicks",
        data: agg.trend.clicks,
        borderColor: "#F5A623",
        backgroundColor: "rgba(245,166,35,0.08)",
        tension: 0.35,
        fill: true,
        pointRadius: 0
      }
    ]
  };

  const sourceLabels = Object.keys(agg.bySource);
  const sourceValues = Object.values(agg.bySource);

  if (trendChart) {
    trendChart.data = trendData;
    trendChart.update();
  } else {
    trendChart = new Chart(trendCtx, {
      type: "line",
      data: trendData,
      options: chartBaseOptions(true)
    });
  }

  if (sourceChart) {
    sourceChart.data.labels = sourceLabels;
    sourceChart.data.datasets[0].data = sourceValues;
    sourceChart.update();
  } else {
    sourceChart = new Chart(sourceCtx, {
      type: "doughnut",
      data: {
        labels: sourceLabels,
        datasets: [{
          data: sourceValues,
          backgroundColor: ["#22D3C5", "#F5A623", "#7C9CFF", "#F87171", "#34D399"],
          borderColor: "#121B2E",
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#8A96AC", font: { family: "Inter", size: 11 }, padding: 12 }
          }
        }
      }
    });
  }
}

function chartBaseOptions(withLegend) {
  return {
    responsive: true,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        display: withLegend,
        position: "top",
        align: "end",
        labels: { color: "#8A96AC", font: { family: "Inter", size: 11 }, boxWidth: 10 }
      }
    },
    scales: {
      x: { grid: { color: "#1F2C45" }, ticks: { color: "#8A96AC", font: { size: 10 }, maxTicksLimit: 8 } },
      y: { grid: { color: "#1F2C45" }, ticks: { color: "#8A96AC", font: { size: 10 } } }
    }
  };
}

function renderTable(data) {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = data.map(r => `
    <tr>
      <td>${r.date}</td>
      <td>${r.page}</td>
      <td><span class="source-tag">${r.source}</span></td>
      <td>${r.traffic.toLocaleString()}</td>
      <td>${r.clicks.toLocaleString()}</td>
      <td>${r.engagement}%</td>
    </tr>
  `).join("");

  document.getElementById("rowCount").textContent = `${data.length} rows`;

  document.querySelectorAll("thead th").forEach(th => {
    const arrow = th.querySelector(".sort-arrow");
    if (th.dataset.key === state.sortKey) {
      arrow.textContent = state.sortDir === "asc" ? "▲" : "▼";
    } else {
      arrow.textContent = "";
    }
  });
}

let lastAgg = null;

function renderAll() {
  const filtered = applyFilters(rawData);
  const sorted = applySort(filtered);
  const agg = aggregate(filtered);

  renderKPIs(agg, lastAgg);
  renderCharts(agg);
  renderTable(sorted);

  lastAgg = agg;
}

/* ===========================================================
   7. EVENT WIRING
=========================================================== */

document.getElementById("rangeFilter").addEventListener("change", e => {
  state.range = e.target.value;
  renderAll();
});

document.getElementById("sourceFilter").addEventListener("change", e => {
  state.source = e.target.value;
  renderAll();
});

document.getElementById("searchFilter").addEventListener("input", e => {
  state.search = e.target.value;
  renderAll();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  state.range = "30";
  state.source = "all";
  state.search = "";
  document.getElementById("rangeFilter").value = "30";
  document.getElementById("sourceFilter").value = "all";
  document.getElementById("searchFilter").value = "";
  renderAll();
});

document.querySelectorAll("thead th").forEach(th => {
  th.addEventListener("click", () => {
    const key = th.dataset.key;
    if (state.sortKey === key) {
      state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
    } else {
      state.sortKey = key;
      state.sortDir = "asc";
    }
    renderAll();
  });
});

/* ===========================================================
   8. "REAL-TIME" SIMULATION
   Periodically appends a fresh row and nudges existing rows,
   mimicking a live feed without needing a backend.
=========================================================== */

function pushLiveRow() {
  const today = new Date().toISOString().slice(0, 10);
  const traffic = Math.floor(80 + Math.random() * 900);
  const clicks = Math.floor(traffic * (0.1 + Math.random() * 0.35));
  const engagement = +((clicks / traffic) * 100).toFixed(1);

  rawData.push({
    date: today,
    page: PAGES[Math.floor(Math.random() * PAGES.length)],
    source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
    traffic,
    clicks,
    engagement,
    sessionSec: Math.floor(30 + Math.random() * 240)
  });

  renderAll();
}

function tickClock() {
  document.getElementById("clock").textContent = new Date().toLocaleTimeString();
}

setInterval(tickClock, 1000);
setInterval(pushLiveRow, 6000);

/* ===========================================================
   INIT
=========================================================== */
tickClock();
renderAll();
