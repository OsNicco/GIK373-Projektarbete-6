// ============================================================
// BOTTOM BAR
// ============================================================

const bottomBar = document.querySelector(".bottom-bar");
const nav = document.querySelector("nav");

window.addEventListener("scroll", () => {
  const navBottom = nav.getBoundingClientRect().bottom;

  if (navBottom < 0) {
    bottomBar.style.transform = "translateX(-50%) translateY(0)";
  } else {
    bottomBar.style.transform = "translateX(-50%) translateY(100px)";
  }
});

// ============================================================
// SIDE BAR
// ============================================================

const sideBar = document.querySelector(".side-bar");
const statsGridNav = document.querySelector(".stats-grid-nav");

window.addEventListener("scroll", () => {
  const statsBottom = statsGridNav.getBoundingClientRect().bottom;

  if (statsBottom < 0) {
    sideBar.style.transform = "translateY(-50%) translateX(0)";
  } else {
    sideBar.style.transform = "translateY(-50%) translateX(120px)";
  }
});

// ============================================================
// CAROUSEL (bara på index-sidan)
// ============================================================

const track = document.querySelector('.track');
if (track) {
  const tiles = document.querySelectorAll('.tile');
  const right = document.querySelector('.right');
  const left  = document.querySelector('.left');
  const tileWidth = tiles[0].offsetWidth + 16;
  let isAnimating = false;

  right.addEventListener('click', () => {
    if (isAnimating) return;
    isAnimating = true;
    track.style.transition = 'transform 0.4s ease';
    track.style.transform = `translateX(-${tileWidth}px)`;
    track.addEventListener('transitionend', () => {
      track.appendChild(track.firstElementChild);
      track.style.transition = 'none';
      track.style.transform = 'translateX(0)';
      isAnimating = false;
    }, { once: true });
  });

  left.addEventListener('click', () => {
    if (isAnimating) return;
    isAnimating = true;
    track.insertBefore(track.lastElementChild, track.firstElementChild);
    track.style.transition = 'none';
    track.style.transform = `translateX(-${tileWidth}px)`;
    track.offsetHeight;
    track.style.transition = 'transform 0.4s ease';
    track.style.transform = 'translateX(0)';
    track.addEventListener('transitionend', () => {
      isAnimating = false;
    }, { once: true });
  });
}


// ============================================================
// STAPELDIAGRAM – Återvinningsgrad 2024 (canvas id="scb")
// ============================================================

// Döpt till FORPACKNINGAR_STAPEL för att undvika konflikt med
// FÖRPACKNINGAR som används av linjediagrammen längre ned.
const FORPACKNINGAR_STAPEL = [
  { kod: "10", namn: "Glas",                       color: "#4e9af1" },
  { kod: "25", namn: "Plast (ink. PET-pant)",       color: "#e76f51" },
  { kod: "35", namn: "PET-flaskor m. pant",         color: "#f4a261" },
  { kod: "40", namn: "Papper/papp/kartong",         color: "#2d6a4f" },
  { kod: "45", namn: "Järnbaserad metall (stål)",   color: "#8b8b8b" },
  { kod: "55", namn: "Aluminium (ink. pantburkar)", color: "#c084fc" },
  { kod: "65", namn: "Pantburkar aluminium",        color: "#e9c46a" },
  { kod: "70", namn: "Trä",                         color: "#a0785a" },
];

const urlSCB = "https://api.scb.se/OV0104/v1/doris/sv/ssd/START/MI/MI0307/MI0307T2NN";

const querySCB = {
  query: [
    {
      code: "ContentsCode",
      selection: { filter: "item", values: ["00000881"] },
    },
  ],
  response: { format: "JSON" },
};

const goals = {
  10: 90, 25: 50, 35: 90, 40: 85,
  45: 70, 55: 50, 65: 90, 70: 15,
};

const scbCanvas = document.getElementById("scb");
if (scbCanvas) {
  fetch(urlSCB, { method: "POST", body: JSON.stringify(querySCB) })
    .then((r) => r.json())
    .then((data) => {
      const filtered = data.data.filter((d) => d.key[0] !== "99");

      const labels = filtered.map((d) => {
        const names = {
          10: "Glas", 25: "Plast inkl. PET", 35: "PET-flaskor",
          40: "Papper/kartong", 45: "Järn/stål", 55: "Aluminium",
          65: "Pantburkar", 70: "Trä",
        };
        return names[d.key[0]] || d.key[0];
      });

      const values     = filtered.map((d) => parseFloat(d.values[0]));
      const goalValues = filtered.map((d) => goals[d.key[0]] || 0);
      const färger     = filtered.map((d) => {
        const item = FORPACKNINGAR_STAPEL.find((f) => f.kod === d.key[0]);
        return item ? item.color : "#000000";
      });

      new Chart(scbCanvas, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Materialåtervinning 2024 (%)",
              data: values,
              backgroundColor: färger,
            },
            {
              label: "Mål (%)",
              data: goalValues,
              backgroundColor: "rgba(198, 196, 255, 0.4)",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true },
            tooltip: {
              callbacks: { label: (ctx) => `${ctx.raw} %` },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: { callback: (value) => `${value}%` },
            },
          },
        },
      });
    })
    .catch((err) => console.error("SCB-fel:", err));
}


// ============================================================
// Förpackningsåtervinning – SCB-data 2012–2024
// Källa: TAB4568 (2012–2019), TAB5564 (2020–2023), TAB6768 (2024)
// ============================================================

// ------ API-URL:er ------
const API = {
  tab4568: "https://statistikdatabasen.scb.se/api/v2/tables/TAB4568/data?lang=sv"
    + "&valueCodes[Forpackning]=10,20,30,40,50,60,70"
    + "&valueCodes[ContentsCode]=000000XV,000000V9,000000VA"
    + "&valueCodes[Tid]=2012,2013,2014,2015,2016,2017,2018,2019",

  tab5564: "https://statistikdatabasen.scb.se/api/v2/tables/TAB5564/data?lang=sv"
    + "&valueCodes[Forpackning]=10,25,35,40,45,55,65,70"
    + "&valueCodes[ContentsCode]=0000047A,00000479,00000478"
    + "&valueCodes[Tid]=2020,2021,2022,2023",

  tab6768: "https://statistikdatabasen.scb.se/api/v2/tables/TAB6768/data?lang=sv"
    + "&valueCodes[Forpackning]=10,25,35,40,45,55,65,70,99"
    + "&valueCodes[ContentsCode]=000008G6,000008G5,00000881"
    + "&valueCodes[Tid]=2024",
};

// ------ Alla år i kronologisk ordning ------
const ALLA_ÅR = [
  "2012","2013","2014","2015","2016","2017","2018","2019",
  "2020","2021","2022","2023","2024",
];

// ------ Roller (interna nycklar) ------
const ROLL = {
  TILLFORD: "tillford",
  TON:      "atervinning_ton",
  PCT:      "atervinning_pct",
};

// ------ Innehållskod-till-roll mappning per tabell ------
const INNEHALL = {
  tab4568: [
    { kod: "000000XV", roll: ROLL.TILLFORD },
    { kod: "000000V9", roll: ROLL.TON },
    { kod: "000000VA", roll: ROLL.PCT },
  ],
  tab5564: [
    { kod: "0000047A", roll: ROLL.TILLFORD },
    { kod: "00000479", roll: ROLL.TON },
    { kod: "00000478", roll: ROLL.PCT },
  ],
  tab6768: [
    { kod: "000008G6", roll: ROLL.TILLFORD },
    { kod: "000008G5", roll: ROLL.TON },
    { kod: "00000881", roll: ROLL.PCT },
  ],
};

// ------ Förpackningsdefinitioner ------
const FÖRPACKNINGAR = [
  { kod: "10", legacyKod: "10", namn: "Pappersförpackningar", color: "#4e9af1", delmangd: false },
  { kod: "25", legacyKod: "20", namn: "Plastflaskor",         color: "#c084fc", delmangd: false },
  { kod: "35", legacyKod: "30", namn: "Plastövriga",          color: "#f59e0b", delmangd: true  },
  { kod: "40", legacyKod: "40", namn: "Träförpackningar",     color: "#34d399", delmangd: false },
  { kod: "45", legacyKod: "50", namn: "Metallförpackningar",  color: "#f87171", delmangd: false },
  { kod: "55", legacyKod: "60", namn: "Glasförpackningar",    color: "#60a5fa", delmangd: false },
  { kod: "65", legacyKod: null, namn: "Dryckesförpackningar", color: "#fb923c", delmangd: true  },
  { kod: "70", legacyKod: "70", namn: "Övriga förpackningar", color: "#a78bfa", delmangd: false },
];

const DELMANGDER = new Set(
  FÖRPACKNINGAR.filter(f => f.delmangd).map(f => f.kod)
);

// ------ State ------
let parsedData = null;
let activeView = "ton";
let charts     = [];

// ============================================================
// Vy-byte
// ============================================================
function setView(v, event) {
  activeView = v;
  document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  if (parsedData) renderAll(parsedData);
}

// ============================================================
// Hämta och tolka data
// ============================================================
async function init() {
  try {
    const [res4568, res5564, res6768] = await Promise.all([
      fetch(API.tab4568),
      fetch(API.tab5564),
      fetch(API.tab6768),
    ]);

    if (!res4568.ok) throw new Error(`TAB4568: HTTP ${res4568.status}`);
    if (!res5564.ok) throw new Error(`TAB5564: HTTP ${res5564.status}`);
    if (!res6768.ok) throw new Error(`TAB6768: HTTP ${res6768.status}`);

    const [json4568, json5564, json6768] = await Promise.all([
      res4568.json(),
      res5564.json(),
      res6768.json(),
    ]);

    const data4568 = parseTabell4568(json4568);
    const data5564 = parseTabell5564(json5564);
    const data6768 = parseTabell6768(json6768);

    parsedData = slaSamman(data4568, data5564, data6768);
    renderAll(parsedData);

  } catch (err) {
    const el = document.getElementById('chart-main');
    if (el) {
      el.innerHTML = `<div class="chart-error">⚠ Kunde inte hämta data: ${err.message}</div>`;
    }
  }
}

// ============================================================
// Parser-hjälpfunktion
// ============================================================
function extrahera(json, index) {
  const raw    = json.value[index];
  const saknas = json.status?.[String(index)] === "..";
  return saknas ? null : (raw ?? null);
}

// ============================================================
// Tolkar TAB4568 (2012–2019)
// ============================================================
function parseTabell4568(json) {
  const FPACK = ["10","20","30","40","50","60","70"];
  const AR    = ["2012","2013","2014","2015","2016","2017","2018","2019"];
  const nC = INNEHALL.tab4568.length;
  const nT = AR.length;

  const data = {};
  FPACK.forEach(kod => {
    data[kod] = { [ROLL.TILLFORD]: {}, [ROLL.TON]: {}, [ROLL.PCT]: {} };
  });

  FPACK.forEach((kod, fi) => {
    INNEHALL.tab4568.forEach((innehall, ci) => {
      AR.forEach((ar, ti) => {
        const idx = fi * (nC * nT) + ci * nT + ti;
        data[kod][innehall.roll][ar] = extrahera(json, idx);
      });
    });
  });

  return data;
}

// ============================================================
// Tolkar TAB5564 (2020–2023)
// ============================================================
function parseTabell5564(json) {
  const FPACK = ["10","25","35","40","45","55","65","70"];
  const AR    = ["2020","2021","2022","2023"];
  const nC = INNEHALL.tab5564.length;
  const nT = AR.length;

  const data = {};
  FPACK.forEach(kod => {
    data[kod] = { [ROLL.TILLFORD]: {}, [ROLL.TON]: {}, [ROLL.PCT]: {} };
  });

  FPACK.forEach((kod, fi) => {
    INNEHALL.tab5564.forEach((innehall, ci) => {
      AR.forEach((ar, ti) => {
        const idx = fi * (nC * nT) + ci * nT + ti;
        data[kod][innehall.roll][ar] = extrahera(json, idx);
      });
    });
  });

  return data;
}

// ============================================================
// Tolkar TAB6768 (2024)
// ============================================================
function parseTabell6768(json) {
  const FPACK = ["10","25","35","40","45","55","65","70","99"];
  const nC = INNEHALL.tab6768.length;
  const nT = 1;

  const data = {};
  FPACK.forEach(kod => {
    data[kod] = { [ROLL.TILLFORD]: {}, [ROLL.TON]: {}, [ROLL.PCT]: {} };
  });

  FPACK.forEach((kod, fi) => {
    INNEHALL.tab6768.forEach((innehall, ci) => {
      const idx = fi * (nC * nT) + ci * nT + 0;
      data[kod][innehall.roll]["2024"] = extrahera(json, idx);
    });
  });

  return data;
}

// ============================================================
// Slår samman de tre datakällorna
// ============================================================
function slaSamman(data4568, data5564, data6768) {
  const merged = {};

  FÖRPACKNINGAR.forEach(f => {
    const legacy = f.legacyKod ? data4568[f.legacyKod] : null;

    merged[f.kod] = {
      [ROLL.TILLFORD]: {
        ...(legacy?.tillford              ?? {}),
        ...(data5564[f.kod]?.tillford     ?? {}),
        ...(data6768[f.kod]?.tillford     ?? {}),
      },
      [ROLL.TON]: {
        ...(legacy?.atervinning_ton              ?? {}),
        ...(data5564[f.kod]?.atervinning_ton     ?? {}),
        ...(data6768[f.kod]?.atervinning_ton     ?? {}),
      },
      [ROLL.PCT]: {
        ...(legacy?.atervinning_pct              ?? {}),
        ...(data5564[f.kod]?.atervinning_pct     ?? {}),
        ...(data6768[f.kod]?.atervinning_pct     ?? {}),
      },
    };
  });

  return merged;
}

// ============================================================
// Rendera hela dashboarden
// ============================================================
function renderAll(data) {
  charts.forEach(c => c.destroy());
  charts = [];

  const main = document.getElementById('chart-main');
  if (!main) return;
  main.innerHTML = '';

  main.appendChild(skapaNyckeltal(data));

  const grid = document.createElement('div');
  grid.className = 'chart-grid';
  main.appendChild(grid);

  if (activeView === 'ton' || activeView === 'bada') {
    grid.appendChild(skapaLinjekort(
      data, ROLL.TON,
      "Materialåtervinning per förpackningsslag",
      "ton · 2012–2024", "ton", true
    ));
    grid.appendChild(skapaLinjekort(
      data, ROLL.TILLFORD,
      "Tillförd mängd per förpackningsslag",
      "ton · 2012–2024", "ton", false
    ));
  }

  if (activeView === 'procent' || activeView === 'bada') {
    grid.appendChild(skapaLinjekort(
      data, ROLL.PCT,
      "Återvinningsgrad per förpackningsslag",
      "procent · 2012–2024", "%", true
    ));
  }
}

// ============================================================
// Nyckeltalsgrid
// ============================================================
function skapaNyckeltal(data) {
  const el = document.createElement('div');
  el.className = 'chart-summary-grid';

  const huvudkoder = FÖRPACKNINGAR
    .filter(f => !DELMANGDER.has(f.kod))
    .map(f => f.kod);

  const tot2024 = summera(data, huvudkoder, ROLL.TON, "2024");
  const tot2023 = summera(data, huvudkoder, ROLL.TON, "2023");
  const tot2012 = summera(data, huvudkoder, ROLL.TON, "2012");

  const diffAr  = tot2024 - tot2023;
  const diffTot = tot2024 - tot2012;
  const sign    = v => v >= 0 ? "+" : "";

  const snittPct = raknaSnittPct(data, huvudkoder, "2024");

  const stats = [
    {
      label: "Total återvunnet 2024",
      value: (tot2024 / 1000).toFixed(0) + " kt",
      sub:   "kiloton materialåtervinning",
      color: "#2d6a4f",
    },
    {
      label: "Förändring vs 2023",
      value: sign(diffAr) + (diffAr / 1000).toFixed(1) + " kt",
      sub:   diffAr < 0 ? "minskning" : "ökning",
      color: diffAr < 0 ? "#e76f51" : "#2d6a4f",
    },
    {
      label: "Trend sedan 2012",
      value: sign(diffTot) + (diffTot / 1000).toFixed(0) + " kt",
      sub:   diffTot < 0 ? "minskning totalt" : "ökning totalt",
      color: diffTot < 0 ? "#e76f51" : "#4e9af1",
    },
    {
      label: "Snitt återvinningsgrad",
      value: snittPct.toFixed(0) + "%",
      sub:   "2024 · 6 huvudslag",
      color: "#c084fc",
    },
    {
      label: "Bäst 2024",
      value: bastForpackning(data),
      sub:   "högst återvinningsgrad",
      color: "#34d399",
    },
  ];

  stats.forEach(s => {
    el.innerHTML += `
      <div class="chart-stat-card" style="--card-accent:${s.color}">
        <div class="cs-label">${s.label}</div>
        <div class="cs-value">${s.value}</div>
        <div class="cs-sub">${s.sub}</div>
      </div>`;
  });

  return el;
}

function summera(data, koder, roll, ar) {
  return koder.reduce((s, k) => {
    const v = data[k][roll][ar];
    return v !== null ? s + v : s;
  }, 0);
}

function raknaSnittPct(data, koder, ar) {
  const harData = koder.filter(k => data[k][ROLL.PCT][ar] !== null);
  if (harData.length === 0) return 0;
  return harData.reduce((s, k) => s + data[k][ROLL.PCT][ar], 0) / harData.length;
}

function bastForpackning(data) {
  let bast = "";
  let bVal = -1;
  FÖRPACKNINGAR.forEach(f => {
    const v = data[f.kod][ROLL.PCT]["2024"];
    if (v !== null && v > bVal) { bVal = v; bast = f.namn.split(" ")[0]; }
  });
  return bast;
}

// ============================================================
// Linjediagramkort
// ============================================================
function skapaLinjekort(data, roll, titel, undertitel, enhet, full) {
  const card = document.createElement('div');
  card.className = full ? 'chart-card full' : 'chart-card';
  card.innerHTML = `
    <div class="chart-card-title">${titel}</div>
    <div class="chart-card-sub">${undertitel}</div>
    <div class="chart-wrap"><canvas></canvas></div>`;

  const datasets = FÖRPACKNINGAR.map(f => ({
    label:            f.namn,
    data:             ALLA_ÅR.map(ar => data[f.kod][roll][ar] ?? null),
    borderColor:      f.color,
    backgroundColor:  f.color + "22",
    borderWidth:      2,
    pointRadius:      3,
    pointHoverRadius: 5,
    tension:          0.3,
    spanGaps:         false,
  }));

  const chart = new Chart(card.querySelector('canvas'), {
    type: 'line',
    data: { labels: ALLA_ÅR, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { family: "'Poppins', sans-serif", size: 11 },
            boxWidth: 12, boxHeight: 12, padding: 12,
            color: 'rgba(19,17,56,0.8)',
          },
        },
        tooltip: {
          backgroundColor: 'rgba(19,17,56,0.95)',
          titleFont: { family: "'Poppins', sans-serif", size: 11 },
          bodyFont:  { family: "'Poppins', sans-serif", size: 12 },
          padding: 12,
          callbacks: {
            label: ctx => {
              const v = ctx.parsed.y;
              if (v === null || v === undefined) return ` ${ctx.dataset.label}: –`;
              return enhet === 'ton'
                ? ` ${ctx.dataset.label}: ${v.toLocaleString('sv')} ton`
                : ` ${ctx.dataset.label}: ${v}%`;
            },
          },
        },
      },
      scales: {
        x: {
          grid:  { color: 'rgba(19,17,56,0.07)' },
          ticks: {
            font:        { family: "'Poppins', sans-serif", size: 10 },
            color:       'rgba(19,17,56,0.5)',
            maxRotation: 45,
          },
        },
        y: {
          grid:  { color: 'rgba(19,17,56,0.07)' },
          ticks: {
            font:     { family: "'Poppins', sans-serif", size: 11 },
            color:    'rgba(19,17,56,0.5)',
            callback: v => enhet === 'ton' ? v.toLocaleString('sv') : v + '%',
          },
        },
      },
    },
  });

  charts.push(chart);
  return card;
}

// ============================================================
// Sidfot & start
// ============================================================
const footerEl = document.getElementById('footer');
if (footerEl) {
  const p = footerEl.querySelector('p:last-child');
  if (p) {
    p.textContent =
      "Data: Naturvårdsverket via SCB · TAB4568 (2012–2019) · TAB5564 (2020–2023) · TAB6768 (2024) · PxWebApi 2.0";
  }
}

init();

//=================================================korrelationChart===============================================================//


// ============================================================
// KORRELATIONSGRAF – Återvinning vs Disponibel inkomst
// ============================================================

async function initKorrelation() {
  const korrelCanvas = document.getElementById("korrelation");
  if (!korrelCanvas) return;

  try {
    // --- Hämta återvinningsdata (återanvänd parsedData om redo, annars hämta igen) ---
    const [res4568, res5564, res6768, resInkomst] = await Promise.all([
      fetch(API.tab4568),
      fetch(API.tab5564),
      fetch(API.tab6768),
      fetch(
        "https://statistikdatabasen.scb.se/api/v2/tables/TAB1492/data?lang=sv" +
        "&valueCodes[Region]=00" +
        "&valueCodes[Hushallstyp]=E90" +
        "&valueCodes[Alder]=18-29,30-49,50-64" +   // 18–65 år
        "&valueCodes[ContentsCode]=000006SW" +       // Disponibel inkomst
        "&valueCodes[Tid]=2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024" +
        "&codelist[Region]=vs_RegionRiket99"
      ),
    ]);

    if (!res4568.ok || !res5564.ok || !res6768.ok || !resInkomst.ok)
      throw new Error("Nätverksfel vid hämtning");

    const [j4568, j5564, j6768, jInkomst] = await Promise.all([
      res4568.json(), res5564.json(), res6768.json(), resInkomst.json(),
    ]);

    // --- Bygg återvinningsdata ---
    const åv = slaSamman(parseTabell4568(j4568), parseTabell5564(j5564), parseTabell6768(j6768));

    const huvudkoder = FÖRPACKNINGAR
      .filter(f => !DELMANGDER.has(f.kod))
      .map(f => f.kod);

    // --- Tolka inkomstdata (PxWebApi 2.0) ---
    // Dimensioner: Alder (3 grupper) × Tid (13 år) = 39 värden
    const åLDERGRUPPER = ["18-29", "30-49", "50-64"];
    const ÅR_IK = ["2012","2013","2014","2015","2016","2017","2018","2019",
                    "2020","2021","2022","2023","2024"];
    const nAlder = åLDERGRUPPER.length;
    const nTid   = ÅR_IK.length;

    // Extrahera värden – platt array, ordnat: Alder yttre loop, Tid inre
    const ikVärden = Array.isArray(jInkomst.value)
      ? jInkomst.value
      : Object.values(jInkomst.value);

    // Beräkna snitt disponibel inkomst per år (snittar över de 3 åldersgrupperna)
    const inkomstPerÅr = {};
    ÅR_IK.forEach((år, ti) => {
      let sum = 0, count = 0;
      åLDERGRUPPER.forEach((_, ai) => {
        const idx = ai * nTid + ti;
        const v = ikVärden[idx];
        if (v !== null && v !== undefined) { sum += v; count++; }
      });
      inkomstPerÅr[år] = count > 0 ? sum / count : null;
    });

    // --- Bygg punkter: ett år = en punkt ---
    const punkter = [];
    ALLA_ÅR.forEach(år => {
      const totÅv = summera(åv, huvudkoder, ROLL.TON, år);
      const ink   = inkomstPerÅr[år] ?? null;
      if (totÅv > 0 && ink !== null) {
        punkter.push({ x: totÅv / 1000, y: ink, år });
      }
    });

    // --- Enkel linjär regression ---
    const n  = punkter.length;
    const mx = punkter.reduce((s, p) => s + p.x, 0) / n;
    const my = punkter.reduce((s, p) => s + p.y, 0) / n;
    const täljare   = punkter.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0);
    const nämnareX  = punkter.reduce((s, p) => s + (p.x - mx) ** 2, 0);
    const nämnareY  = punkter.reduce((s, p) => s + (p.y - my) ** 2, 0);
    const k = täljare / nämnareX;
    const m = my - k * mx;
    const r = täljare / Math.sqrt(nämnareX * nämnareY);

    const xMin = Math.min(...punkter.map(p => p.x));
    const xMax = Math.max(...punkter.map(p => p.x));
    const trendlinje = [
      { x: xMin, y: k * xMin + m },
      { x: xMax, y: k * xMax + m },
    ];

    // --- Rita Chart.js scatter ---
    new Chart(korrelCanvas, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "År (återvinning vs inkomst)",
            data: punkter.map(p => ({ x: p.x, y: p.y, år: p.år })),
            backgroundColor: punkter.map(p => {
              const t = (parseInt(p.år) - 2012) / (2024 - 2012);
              const r = Math.round(78 + t * (77 - 78));
              const g = Math.round(154 + t * (30 - 154));
              const b = Math.round(241 + t * (90 - 241));
              return `rgba(${r},${g},${b},0.9)`;
            }),
            pointRadius: 7,
            pointHoverRadius: 10,
          },
          {
            label: `Trendlinje (r = ${r.toFixed(2)})`,
            data: trendlinje,
            type: "line",
            borderColor: "rgba(231,111,81,0.8)",
            borderWidth: 2,
            borderDash: [6, 4],
            pointRadius: 0,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          tooltip: {
            callbacks: {
              label: ctx => {
                if (ctx.dataset.type === "line") return null;
                const p = ctx.raw;
                return [
                  `År: ${p.år}`,
                  `Återvinning: ${p.x.toFixed(1)} kt`,
                  `Disponibel inkomst: ${Math.round(p.y).toLocaleString("sv")} tkr`,
                ];
              },
            },
          },
          // Etikett för varje punkt (år)
          datalabels: false,  // om du inte har chartjs-plugin-datalabels installerat
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Total materialåtervinning (kiloton)",
              font: { family: "'Poppins', sans-serif", size: 12 },
            },
            ticks: { callback: v => v + " kt" },
          },
          y: {
            title: {
              display: true,
              text: "Disponibel inkomst (tkr, snitt 18–64 år)",
              font: { family: "'Poppins', sans-serif", size: 12 },
            },
            ticks: { callback: v => v.toLocaleString("sv") },
          },
        },
      },
      plugins: [
        {
          // Rita årstext bredvid varje punkt
          afterDatasetsDraw(chart) {
            const ctx2 = chart.ctx;
            const ds = chart.data.datasets[0];
            const meta = chart.getDatasetMeta(0);
            ctx2.save();
            ctx2.font = "10px 'Poppins', sans-serif";
            ctx2.fillStyle = "rgba(19,17,56,0.65)";
            ctx2.textAlign = "center";
            meta.data.forEach((el, i) => {
              const år = ds.data[i].år;
              ctx2.fillText(år, el.x, el.y - 10);
            });
            ctx2.restore();
          },
        },
      ],
    });

  } catch (err) {
    const el = document.getElementById("korrelation");
    if (el) el.insertAdjacentHTML("afterend",
      `<div class="chart-error">⚠ Korrelationsgrafen: ${err.message}</div>`);
    console.error("Korrelationsfel:", err);
  }
}

initKorrelation();


//================================================================================================================================//

// ============================================================
// FETCH EUROSTAT
// ============================================================

async function fetchEurostat(dataset) {
  const url = `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${dataset}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("API error: " + res.status);
  return await res.json();
}

// ============================================================
// JSON-stat PARSER
// ============================================================

function parseEurostatJSONStat(json) {
  const geo  = json.dimension.geo.category.index;
  const time = json.dimension.time.category.index;

  const countries  = Object.keys(geo);
  const years      = Object.keys(time);
  const valueArray = Array.isArray(json.value)
    ? json.value
    : Object.values(json.value);

  const result = {};
  countries.forEach(c => { result[c] = Array(years.length).fill(null); });

  let i = 0;
  for (const c of countries) {
    for (let t = 0; t < years.length; t++) {
      result[c][t] = valueArray[i] ?? null;
      i++;
    }
  }

  return { result, countries, years };
}

// ============================================================
// ISO3 mapping
// ============================================================

const iso3 = {
  BE:"BEL", LV:"LVA", SK:"SVK", CZ:"CZE", DE:"DEU",
  SI:"SVN", NL:"NLD", IT:"ITA", PL:"POL", ES:"ESP",
  LT:"LTU", EE:"EST", PT:"PRT", LU:"LUX", MT:"MLT",
  EL:"GRC", IE:"IRL", FI:"FIN", SE:"SWE", HR:"HRV",
  DK:"DNK", AT:"AUT", FR:"FRA", HU:"HUN", NO:"NOR",
};

// ============================================================
// EUROSTAT – animerat choropleth-diagram
// ============================================================

async function loadData() {
  try {
    const plasticRaw    = await fetchEurostat("env_waspacr");
    const plasticParsed = parseEurostatJSONStat(plasticRaw);

    const { countries, years } = plasticParsed;

    const rows = [];
    for (const c of countries) {
      for (let i = 0; i < years.length; i++) {
        rows.push({
          country:   iso3[c] || c,
          year:      years[i],
          recycling: plasticParsed.result[c][i],
        });
      }
    }

    function getYearData(year) {
      return rows.filter(r => r.year === year);
    }

    const initialYear = years[0];
    const initial     = getYearData(initialYear);

    const customGreens = [
      [0,   "#e6f4ef"],
      [0.2, "#b7e0d3"],
      [0.4, "#7fc7b0"],
      [0.6, "#3aa486"],
      [0.8, "#0b6f58"],
      [1,   "#007353"],
    ];

    const trace = {
      type:         "choropleth",
      locationmode: "ISO-3",
      locations:    initial.map(r => r.country),
      z:            initial.map(r => r.recycling),
      colorscale:   customGreens,
      zmin: 0,
      zmax: 100,
      colorbar: { title: "Återvinning %" },
    };

    const frames = years.map(y => {
      const d = getYearData(y);
      return {
        name: y,
        data: [{ locations: d.map(r => r.country), z: d.map(r => r.recycling) }],
      };
    });

    const layout = {
      title: "Förpackningsavfall (%) i Europa 1997–2023",
      geo:   { scope: "europe" },
      sliders: [{
        steps: years.map(y => ({
          label:  y,
          method: "animate",
          args:   [[y], { mode: "immediate", frame: { duration: 1000 }, transition: { duration: 700 } }],
        })),
      }],
      updatemenus: [{
        type: "buttons",
        buttons: [
          {
            label:  "Play",
            method: "animate",
            args:   [null, { fromcurrent: true, frame: { duration: 1000 }, transition: { duration: 700 } }],
          },
          {
            label:  "Pause",
            method: "animate",
            args:   [[null], { mode: "immediate" }],
          },
        ],
      }],
    };

    await Plotly.newPlot("plot2", [trace], layout);
    Plotly.addFrames("plot2", frames);

  } catch (err) {
    console.error("Error loading data:", err);
  }
}

loadData();

// ============================================================
// STATISK KARTA – Plaståtervinning + Population 2023
// ============================================================

const plasticRecycling2023 = {
  dimension: {
    Geo: {
      category: {
        index: {
          "Belgien":0, "Lettland":1, "Slovakien":2, "Tjeckien":3,
          "Tyskland":4, "Slovenien":5, "Nederländerna":6, "Italien":7,
          "Polen":8, "Spanien":9, "Litauen":10, "Estland":11,
          "Portugal":12, "Luxemburg":13, "Malta":14, "Grekland":15,
          "Irland":16, "Finland":17, "Sverige":18, "Kroatien":19,
          "Danmark":20, "Österrike":21, "Frankrike":22, "Ungern":23,
          "Norge":24,
        },
      },
    },
  },
  value: [
    59.5,59.2,54.1,52.4,52.2,51.5,49.1,49.0,
    46.3,46.2,42.9,42.4,39.5,38.8,35.6,32.7,
    29.6,29.3,28.6,28.2,27.8,26.9,25.7,23.0,30.2,
  ],
};

const population2023 = {
  value: [
    11742696,1883008,5428792,10827529,84358845,2116972,17811291,58997201,
    36753736,48085361,2857279,1365884,10467366,660809,542051,10413982,
    5060004,5563970,10521556,3871833,5932654,9104772,68042591,9599744,5488984,
  ],
};

const iso3Names = {
  "Belgien":"BEL", "Lettland":"LVA", "Slovakien":"SVK", "Tjeckien":"CZE",
  "Tyskland":"DEU", "Slovenien":"SVN", "Nederländerna":"NLD", "Italien":"ITA",
  "Polen":"POL", "Spanien":"ESP", "Litauen":"LTU", "Estland":"EST",
  "Portugal":"PRT", "Luxemburg":"LUX", "Malta":"MLT", "Grekland":"GRC",
  "Irland":"IRL", "Finland":"FIN", "Sverige":"SWE", "Kroatien":"HRV",
  "Danmark":"DNK", "Österrike":"AUT", "Frankrike":"FRA", "Ungern":"HUN",
  "Norge":"NOR",
};

const coords = {
  BEL:[50.5,4.5], LVA:[56.9,24.6], SVK:[48.7,19.7], CZE:[49.8,15.5],
  DEU:[51.1,10.4], SVN:[46.1,14.8], NLD:[52.1,5.3], ITA:[42.8,12.5],
  POL:[52.1,19.4], ESP:[40.4,-3.7], LTU:[55.2,23.9], EST:[58.6,25.0],
  PRT:[39.4,-8.2], LUX:[49.8,6.1], MLT:[35.9,14.4], GRC:[39.1,22.9],
  IRL:[53.3,-8.2], FIN:[64.5,26.0], SWE:[62,15], HRV:[45.1,15.2],
  DNK:[56,9.5], AUT:[47.5,14.6], FRA:[46.2,2.2], HUN:[47.1,19.5],
  NOR:[60.5,8.5],
};

const staticCountries = Object.keys(plasticRecycling2023.dimension.Geo.category.index);
const locations       = staticCountries.map(c => iso3Names[c]);
const values          = plasticRecycling2023.value;
const pops            = population2023.value;
const lat             = locations.map(code => coords[code][0]);
const lon             = locations.map(code => coords[code][1]);

const customBlues = [
  [0,   "#ececf7"],
  [0.2, "#c7c7e6"],
  [0.4, "#8f8fc7"],
  [0.6, "#565699"],
  [0.8, "#2c2c63"],
  [1,   "#131138"],
];

const choropleth = {
  type:         "choropleth",
  locationmode: "ISO-3",
  locations,
  z:            values,
  text:         staticCountries,
  colorscale:   customBlues,
  hovertemplate: "%{z}%<extra></extra>",
  colorbar: { title: "Återvinningsgrad (%)" },
};

const bubbles = {
  type: "scattergeo",
  lat,
  lon,
  text: staticCountries.map(
    (c, i) => `${c}<br>Återvinning: ${values[i]}%<br>Population: ${pops[i].toLocaleString()}`
  ),
  mode: "markers",
  hovertemplate: "%{text}<extra></extra>",
  marker: {
    size:  pops.map(p => Math.sqrt(p) / 500),
    color: "rgba(0,0,255,0.4)",
    line:  { width: 1 },
  },
};

const layout2 = {
  title: "Europa: Plaståtervinning (färg) + Population (bubblor) 2023",
  geo: {
    scope:      "europe",
    projection: { type: "natural earth" },
  },
};

Plotly.newPlot("plot", [choropleth, bubbles], layout2);