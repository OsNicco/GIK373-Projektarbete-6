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

// ============================================================================================================================= //

// CHART FÖR DATA SIDAN


// TAB5564 = 2020–2023
const URL_GAMLA = "https://statistikdatabasen.scb.se/api/v2/tables/TAB5564/data?lang=sv&valueCodes[Forpackning]=10,25,35,40,45,55,65,70&valueCodes[ContentsCode]=0000047A,00000479,00000478&valueCodes[Tid]=2020,2021,2022,2023";

// TAB6768 = 2024 (nya ContentsCodes, plus förpackning 99 = Totalt)
const URL_NYA  = "https://statistikdatabasen.scb.se/api/v2/tables/TAB6768/data?lang=sv&valueCodes[Forpackning]=10,25,35,40,45,55,65,70,99&valueCodes[ContentsCode]=000008G6,000008G5,00000881&valueCodes[Tid]=2024";

const ÅR = ["2020","2021","2022","2023","2024"];

const FÖRPACKNINGAR = [
  { kod:"10", namn:"Glas",                       color:"#4e9af1" },
  { kod:"25", namn:"Plast (ink. PET-pant)",       color:"#e76f51" },
  { kod:"35", namn:"PET-flaskor m. pant",         color:"#f4a261" },
  { kod:"40", namn:"Papper/papp/kartong",         color:"#2d6a4f" },
  { kod:"45", namn:"Järnbaserad metall (stål)",   color:"#8b8b8b" },
  { kod:"55", namn:"Aluminium (ink. pantburkar)", color:"#c084fc" },
  { kod:"65", namn:"Pantburkar aluminium",        color:"#e9c46a" },
  { kod:"70", namn:"Trä",                         color:"#a0785a" },
];

// Innehållskoder för 2020–2023 (TAB5564)
const INNEHÅLL_GAMLA = [
  { kod:"0000047A", roll:"tillford" },
  { kod:"00000479", roll:"atervinning_ton" },
  { kod:"00000478", roll:"atervinning_pct" },
];

// Innehållskoder för 2024 (TAB6768) – mappar till samma roller
const INNEHÅLL_NYA = [
  { kod:"000008G6", roll:"tillford" },
  { kod:"000008G5", roll:"atervinning_ton" },
  { kod:"00000881", roll:"atervinning_pct" },
];

// Gemensamma interna koder som används i resten av koden
const KOD_TILLFORD  = "tillford";
const KOD_TON       = "atervinning_ton";
const KOD_PCT       = "atervinning_pct";

// Förpackningsslag som är delmängder – exkluderas ur totalsummor
const DELMÄNGDER = ["35", "65"];

// -------------------------------------------------------
// State
// -------------------------------------------------------
let parsedData  = null;
let activeView  = "ton";
let charts      = [];

// -------------------------------------------------------
// Byt vy (ton / procent / båda)
// -------------------------------------------------------
function setView(v, event) {
  activeView = v;
  document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  if (parsedData) renderAll(parsedData);
}

// -------------------------------------------------------
// Hämta och tolka data från SCB (två tabeller)
// -------------------------------------------------------
async function init() {
  try {
    const [resGamla, resNya] = await Promise.all([
      fetch(URL_GAMLA),
      fetch(URL_NYA),
    ]);
    if (!resGamla.ok) throw new Error(`TAB5564: HTTP ${resGamla.status}`);
    if (!resNya.ok)   throw new Error(`TAB6768: HTTP ${resNya.status}`);

    const [jsonGamla, jsonNya] = await Promise.all([
      resGamla.json(),
      resNya.json(),
    ]);

    const gamla = parseGamla(jsonGamla);   // 2020–2023
    const nya   = parseNya(jsonNya);       // 2024
    parsedData  = merge(gamla, nya);
    renderAll(parsedData);
  } catch (e) {
    document.getElementById('chart-main').innerHTML =
      `<div class="chart-error">⚠ Kunde inte hämta data: ${e.message}</div>`;
  }
}

// Tolkar TAB5564 (2020–2023)
// Struktur: förpackning[8] × innehåll[3] × år[4]
function parseGamla(json) {
  const ÅR_GAMLA = ["2020","2021","2022","2023"];
  const nC = 3, nT = 4;
  const data = {};

  FÖRPACKNINGAR.forEach((f, fi) => {
    data[f.kod] = { tillford:{}, atervinning_ton:{}, atervinning_pct:{} };
    INNEHÅLL_GAMLA.forEach((c, ci) => {
      ÅR_GAMLA.forEach((t, ti) => {
        const idx = fi * (nC * nT) + ci * nT + ti;
        const raw    = json.value[idx];
        const saknas = json.status?.[String(idx)] === "..";
        data[f.kod][c.roll][t] = saknas ? null : (raw ?? null);
      });
    });
  });

  return data;
}

// Tolkar TAB6768 (2024)
// Struktur: förpackning[9 ink. 99] × innehåll[3] × år[1]
function parseNya(json) {
  const FPACK_NYA = ["10","25","35","40","45","55","65","70","99"];
  const nC = 3, nT = 1;
  const data = {};

  FPACK_NYA.forEach((kod, fi) => {
    data[kod] = { tillford:{}, atervinning_ton:{}, atervinning_pct:{} };
    INNEHÅLL_NYA.forEach((c, ci) => {
      const idx    = fi * (nC * nT) + ci * nT + 0;
      const raw    = json.value[idx];
      const saknas = json.status?.[String(idx)] === "..";
      data[kod][c.roll]["2024"] = saknas ? null : (raw ?? null);
    });
  });

  return data;
}

// Slår ihop gamla (2020–2023) och nya (2024) till ett objekt
function merge(gamla, nya) {
  const merged = {};

  FÖRPACKNINGAR.forEach(f => {
    merged[f.kod] = {
      tillford:       { ...gamla[f.kod].tillford,       ...(nya[f.kod]?.tillford       ?? {}) },
      atervinning_ton:{ ...gamla[f.kod].atervinning_ton,...(nya[f.kod]?.atervinning_ton ?? {}) },
      atervinning_pct:{ ...gamla[f.kod].atervinning_pct,...(nya[f.kod]?.atervinning_pct ?? {}) },
    };
  });

  return merged;
}

// -------------------------------------------------------
// Rendera hela dashboarden
// -------------------------------------------------------
function renderAll(data) {
  // Förstör gamla diagram
  charts.forEach(c => c.destroy());
  charts = [];

  const main = document.getElementById('chart-main');
  main.innerHTML = '';

  // Nyckeltal
  main.appendChild(makeSummaryGrid(data));

  // Diagramgrid
  const grid = document.createElement('div');
  grid.className = 'chart-grid';
  main.appendChild(grid);

  if (activeView === 'ton' || activeView === 'bada') {
    grid.appendChild(makeLineCard(data, KOD_TON,      "Materialåtervinning per förpackningsslag", "ton · 2020–2024", "ton", true));
    grid.appendChild(makeLineCard(data, KOD_TILLFORD, "Tillförd mängd per förpackningsslag",      "ton · 2020–2024", "ton", false));
  }
  if (activeView === 'procent' || activeView === 'bada') {
    grid.appendChild(makeLineCard(data, KOD_PCT, "Återvinningsgrad per förpackningsslag", "procent · 2020–2024", "%", true));
  }
}

// -------------------------------------------------------
// Nyckeltalskort
// -------------------------------------------------------
function makeSummaryGrid(data) {
  const el = document.createElement('div');
  el.className = 'chart-summary-grid';

  const huvud = FÖRPACKNINGAR.filter(f => !DELMÄNGDER.includes(f.kod)).map(f => f.kod);

  const tot2024 = summa(data, huvud, KOD_TON, "2024");
  const tot2023 = summa(data, huvud, KOD_TON, "2023");
  const diff    = tot2024 - tot2023;
  const sign    = diff >= 0 ? "+" : "";

  const antalPct = huvud.filter(k => data[k][KOD_PCT]["2024"] !== null).length;
  const snittPct = huvud.reduce((s, k) => {
    const v = data[k][KOD_PCT]["2024"];
    return v !== null ? s + v : s;
  }, 0) / antalPct;

  const stats = [
    { label:"Total återvunnet 2024",  value:(tot2024/1000).toFixed(0)+" kt", sub:"kiloton materialåtervinning",        color:"#2d6a4f" },
    { label:"Förändring vs 2023",      value:sign+(diff/1000).toFixed(1)+" kt", sub:diff < 0 ? "minskning" : "ökning", color: diff < 0 ? "#e76f51" : "#2d6a4f" },
    { label:"Snitt återvinningsgrad",  value:snittPct.toFixed(0)+"%",          sub:"2024 (6 huvudslag)",                color:"#4e9af1" },
    { label:"Bäst 2024",               value:getBäst(data),                    sub:"högst återvinningsgrad",            color:"#c084fc" },
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

function summa(data, koder, innehållKod, år) {
  return koder.reduce((s, k) => {
    const v = data[k][innehållKod][år];
    return v !== null ? s + v : s;
  }, 0);
}

function getBäst(data) {
  let bäst = "", bVal = -1;
  FÖRPACKNINGAR.forEach(f => {
    const v = data[f.kod][KOD_PCT]["2024"];
    if (v !== null && v > bVal) { bVal = v; bäst = f.namn.split(" ")[0]; }
  });
  return bäst;
}

// -------------------------------------------------------
// Linjediagramkort
// -------------------------------------------------------
function makeLineCard(data, innehållKod, title, sub, unit, full) {
  const card = document.createElement('div');
  card.className = full ? 'chart-card full' : 'chart-card';
  card.innerHTML = `
    <div class="chart-card-title">${title}</div>
    <div class="chart-card-sub">${sub}</div>
    <div class="chart-wrap"><canvas></canvas></div>`;

  const datasets = FÖRPACKNINGAR.map(f => ({
    label:           f.namn,
    data:            ÅR.map(t => data[f.kod][innehållKod][t]),
    borderColor:     f.color,
    backgroundColor: f.color + "22",
    borderWidth:     2,
    pointRadius:     4,
    pointHoverRadius:6,
    tension:         0.3,
    spanGaps:        false,
  }));

  const chart = new Chart(card.querySelector('canvas'), {
    type: 'line',
    data: { labels: ÅR, datasets },
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
          }
        },
        tooltip: {
          backgroundColor: 'rgba(19,17,56,0.95)',
          titleFont: { family: "'Poppins', sans-serif", size: 11 },
          bodyFont:  { family: "'Poppins', sans-serif", size: 12 },
          padding: 12,
          callbacks: {
            label: ctx => {
              const v = ctx.parsed.y;
              if (v === null) return ` ${ctx.dataset.label}: –`;
              return unit === 'ton'
                ? ` ${ctx.dataset.label}: ${v.toLocaleString('sv')} ton`
                : ` ${ctx.dataset.label}: ${v}%`;
            }
          }
        }
      },
      scales: {
        x: {
          grid:  { color: 'rgba(19,17,56,0.07)' },
          ticks: { font: { family: "'Poppins', sans-serif", size: 11 }, color: 'rgba(19,17,56,0.5)' }
        },
        y: {
          grid:  { color: 'rgba(19,17,56,0.07)' },
          ticks: {
            font: { family: "'Poppins', sans-serif", size: 11 }, color: 'rgba(19,17,56,0.5)',
            callback: v => unit === 'ton' ? v.toLocaleString('sv') : v + '%'
          }
        }
      }
    }
  });

  charts.push(chart);
  return card;
}

// -------------------------------------------------------
// Sidfot & start
// -------------------------------------------------------
const footerEl = document.getElementById('footer');
if (footerEl) {
  footerEl.querySelector('p:last-child').textContent =
    "Data: Naturvårdsverket via SCB · TAB5564 (2020–2023) + TAB6768 (2024) · PxWebApi 2.0";
}

init();