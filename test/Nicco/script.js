// -------------------------------------------------------
// Konfiguration
// -------------------------------------------------------
const URL_SCB =
  "https://statistikdatabasen.scb.se/api/v2/tables/TAB5564/data?lang=sv&valueCodes[Forpackning]=10,25,35,40,45,55,65,70&valueCodes[ContentsCode]=0000047A,00000479,00000478&valueCodes[Tid]=2020,2021,2022,2023";

const ÅR = ["2020", "2021", "2022", "2023"];

const FÖRPACKNINGAR = [
  { kod: "10", namn: "Glas", color: "#4e9af1" },
  { kod: "25", namn: "Plast (ink. PET-pant)", color: "#e76f51" },
  { kod: "35", namn: "PET-flaskor m. pant", color: "#f4a261" },
  { kod: "40", namn: "Papper/papp/kartong", color: "#2d6a4f" },
  { kod: "45", namn: "Järnbaserad metall (stål)", color: "#8b8b8b" },
  { kod: "55", namn: "Aluminium (ink. pantburkar)", color: "#c084fc" },
  { kod: "65", namn: "Pantburkar aluminium", color: "#e9c46a" },
  { kod: "70", namn: "Trä", color: "#a0785a" },
];

const INNEHÅLL = [
  { kod: "0000047A", namn: "Tillförd mängd (ton)" },
  { kod: "00000479", namn: "Materialåtervinning (ton)" },
  { kod: "00000478", namn: "Materialåtervinning (%)" },
];

// Förpackningsslag som är delmängder – exkluderas ur totalsummor
const DELMÄNGDER = ["35", "65"];

// -------------------------------------------------------
// State
// -------------------------------------------------------
let parsedData = null;
let activeView = "ton";
let charts = [];

// -------------------------------------------------------
// Byt vy (ton / procent / båda)
// -------------------------------------------------------
function setView(v, event) {
  activeView = v;
  document
    .querySelectorAll(".btn")
    .forEach((b) => b.classList.remove("active"));
  event.target.classList.add("active");
  if (parsedData) renderAll(parsedData);
}

// -------------------------------------------------------
// Hämta och tolka data från SCB
// -------------------------------------------------------
async function init() {
  try {
    const res = await fetch(URL_SCB);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    parsedData = parseData(json);
    renderAll(parsedData);
  } catch (e) {
    document.getElementById("main").innerHTML =
      `<div class="error">⚠ Kunde inte hämta data: ${e.message}</div>`;
  }
}

// Mappar platt value-array → nyckelat objekt { förpackning → innehåll → år → värde }
function parseData(json) {
  const nC = 3,
    nT = 4;
  const data = {};

  FÖRPACKNINGAR.forEach((f, fi) => {
    data[f.kod] = {};
    INNEHÅLL.forEach((c, ci) => {
      data[f.kod][c.kod] = {};
      ÅR.forEach((t, ti) => {
        const idx = fi * (nC * nT) + ci * nT + ti;
        const raw = json.value[idx];
        const saknas = json.status?.[String(idx)] === "..";
        data[f.kod][c.kod][t] = saknas ? null : (raw ?? null);
      });
    });
  });

  return data;
}

// -------------------------------------------------------
// Rendera hela dashboarden
// -------------------------------------------------------
function renderAll(data) {
  // Förstör gamla diagram
  charts.forEach((c) => c.destroy());
  charts = [];

  const main = document.getElementById("main");
  main.innerHTML = "";

  // Nyckeltal
  main.appendChild(makeSummaryGrid(data));

  // Diagramgrid
  const grid = document.createElement("div");
  grid.className = "chart-grid";
  main.appendChild(grid);

  if (activeView === "ton" || activeView === "bada") {
    grid.appendChild(
      makeLineCard(
        data,
        "00000479",
        "Materialåtervinning per förpackningsslag",
        "ton · 2020–2023",
        "ton",
        true,
      ),
    );
    grid.appendChild(
      makeLineCard(
        data,
        "0000047A",
        "Tillförd mängd per förpackningsslag",
        "ton · 2020–2023",
        "ton",
        false,
      ),
    );
  }
  if (activeView === "procent" || activeView === "bada") {
    grid.appendChild(
      makeLineCard(
        data,
        "00000478",
        "Återvinningsgrad per förpackningsslag",
        "procent · 2020–2023",
        "%",
        true,
      ),
    );
  }
}

// -------------------------------------------------------
// Nyckeltalskort
// -------------------------------------------------------
function makeSummaryGrid(data) {
  const el = document.createElement("div");
  el.className = "summary-grid";

  const huvud = FÖRPACKNINGAR.filter((f) => !DELMÄNGDER.includes(f.kod)).map(
    (f) => f.kod,
  );

  const tot2023 = summa(data, huvud, "00000479", "2023");
  const tot2022 = summa(data, huvud, "00000479", "2022");
  const diff = tot2023 - tot2022;
  const sign = diff >= 0 ? "+" : "";

  const antalPct = huvud.filter(
    (k) => data[k]["00000478"]["2023"] !== null,
  ).length;
  const snittPct =
    huvud.reduce((s, k) => {
      const v = data[k]["00000478"]["2023"];
      return v !== null ? s + v : s;
    }, 0) / antalPct;

  const stats = [
    {
      label: "Total återvunnet 2023",
      value: (tot2023 / 1000).toFixed(0) + " kt",
      sub: "kiloton materialåtervinning",
      color: "#2d6a4f",
    },
    {
      label: "Förändring vs 2022",
      value: sign + (diff / 1000).toFixed(1) + " kt",
      sub: diff < 0 ? "minskning" : "ökning",
      color: diff < 0 ? "#e76f51" : "#2d6a4f",
    },
    {
      label: "Snitt återvinningsgrad",
      value: snittPct.toFixed(0) + "%",
      sub: "2023 (6 huvudslag)",
      color: "#4e9af1",
    },
    {
      label: "Bäst 2023",
      value: getBäst(data),
      sub: "högst återvinningsgrad",
      color: "#c084fc",
    },
  ];

  stats.forEach((s) => {
    el.innerHTML += `
      <div class="stat-card" style="--accent-color:${s.color}">
        <div class="label">${s.label}</div>
        <div class="value">${s.value}</div>
        <div class="sub">${s.sub}</div>
      </div>`;
  });

  return el;
}

function summa(data, koder, innehållKod, år) {
  return koder.reduce((s, k) => {
    const v = data[k][innehållKod][år];
    return v !== null ? s + v : s;
  }, 0);
}

function getBäst(data) {
  let bäst = "",
    bVal = -1;
  FÖRPACKNINGAR.forEach((f) => {
    const v = data[f.kod]["00000478"]["2023"];
    if (v !== null && v > bVal) {
      bVal = v;
      bäst = f.namn.split(" ")[0];
    }
  });
  return bäst;
}

// -------------------------------------------------------
// Linjediagramkort
// -------------------------------------------------------
function makeLineCard(data, innehållKod, title, sub, unit, full) {
  const card = document.createElement("div");
  card.className = full ? "chart-card full" : "chart-card";
  card.innerHTML = `
    <div class="chart-title">${title}</div>
    <div class="chart-sub">${sub}</div>
    <div class="chart-wrap"><canvas></canvas></div>`;

  const datasets = FÖRPACKNINGAR.map((f) => ({
    label: f.namn,
    data: ÅR.map((t) => data[f.kod][innehållKod][t]),
    borderColor: f.color,
    backgroundColor: f.color + "22",
    borderWidth: 2,
    pointRadius: 4,
    pointHoverRadius: 6,
    tension: 0.3,
    spanGaps: false,
  }));

  const chart = new Chart(card.querySelector("canvas"), {
    type: "line",
    data: { labels: ÅR, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: { family: "'DM Sans', sans-serif", size: 11 },
            boxWidth: 12,
            boxHeight: 12,
            padding: 12,
            color: "#1a1a18",
          },
        },
        tooltip: {
          backgroundColor: "#1a1a18",
          titleFont: { family: "'DM Mono', monospace", size: 11 },
          bodyFont: { family: "'DM Sans', sans-serif", size: 12 },
          padding: 12,
          callbacks: {
            label: (ctx) => {
              const v = ctx.parsed.y;
              if (v === null) return ` ${ctx.dataset.label}: –`;
              return unit === "ton"
                ? ` ${ctx.dataset.label}: ${v.toLocaleString("sv")} ton`
                : ` ${ctx.dataset.label}: ${v}%`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: "#e8e4db" },
          ticks: {
            font: { family: "'DM Mono', monospace", size: 11 },
            color: "#6b6b60",
          },
        },
        y: {
          grid: { color: "#e8e4db" },
          ticks: {
            font: { family: "'DM Mono', monospace", size: 11 },
            color: "#6b6b60",
            callback: (v) =>
              unit === "ton" ? v.toLocaleString("sv") : v + "%",
          },
        },
      },
    },
  });

  charts.push(chart);
  return card;
}

// -------------------------------------------------------
// Sidfot & start
// -------------------------------------------------------
document.getElementById("footer").textContent =
  "Data: Naturvårdsverket, bearbetning SCB · Tabell TAB5564 · PxWebApi 2.0 · " +
  "OBS: PET-flaskor m. pant (35) och Pantburkar av aluminium (65) är delmängder och ingår ej i totalsummorna.";

init();
