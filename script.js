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




// ============================================================================================================================= //

// ============================================================
// STAPELDIAGRAM – Återvinningsgrad 2024 (canvas id="scb")
// ============================================================

const FÖRPACKNINGAR = [
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
        const item = FÖRPACKNINGAR.find((f) => f.kod === d.key[0]);
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










// ============================================================================================================================= //


// CHART FÖR DATA SIDAN

// TAB5564 = 2020–2023
const URL_GAMLA = "https://statistikdatabasen.scb.se/api/v2/tables/TAB5564/data?lang=sv&valueCodes[Forpackning]=10,25,35,40,45,55,65,70&valueCodes[ContentsCode]=0000047A,00000479,00000478&valueCodes[Tid]=2020,2021,2022,2023";

// TAB6768 = 2024 (nya ContentsCodes, plus förpackning 99 = Totalt)
const URL_NYA   = "https://statistikdatabasen.scb.se/api/v2/tables/TAB6768/data?lang=sv&valueCodes[Forpackning]=10,25,35,40,45,55,65,70,99&valueCodes[ContentsCode]=000008G6,000008G5,00000881&valueCodes[Tid]=2024";

const ÅR = ["2020", "2021", "2022", "2023", "2024"];

// Innehållskoder för 2020–2023 (TAB5564)
const INNEHÅLL_GAMLA = [
  { kod: "0000047A", roll: "tillford" },
  { kod: "00000479", roll: "atervinning_ton" },
  { kod: "00000478", roll: "atervinning_pct" },
];

// Innehållskoder för 2024 (TAB6768) – mappar till samma roller
const INNEHÅLL_NYA = [
  { kod: "000008G6", roll: "tillford" },
  { kod: "000008G5", roll: "atervinning_ton" },
  { kod: "00000881", roll: "atervinning_pct" },
];

// Gemensamma interna koder som används i resten av koden
const KOD_TILLFORD = "tillford";
const KOD_TON      = "atervinning_ton";
const KOD_PCT      = "atervinning_pct";

// Förpackningsslag som är delmängder – exkluderas ur totalsummor
const DELMÄNGDER   = ["35", "65"];

// -------------------------------------------------------
// State
// -------------------------------------------------------
let parsedData = null;
let activeView = "ton";
let charts     = [];

// -------------------------------------------------------
// Byt vy (ton / procent / båda)
// -------------------------------------------------------
function setView(v, event) {
  activeView = v;
  document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
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

    const gamla = parseGamla(jsonGamla); // 2020–2023
    const nya   = parseNya(jsonNya);     // 2024

    parsedData  = merge(gamla, nya);

    renderAll(parsedData);

  } catch (e) {
    const el = document.getElementById('chart-main');

    if (el) {
      el.innerHTML =
        `<div class="chart-error">⚠ Kunde inte hämta data: ${e.message}</div>`;
    }
  }
}

// -------------------------------------------------------
// Tolkar TAB5564 (2020–2023)
// Struktur: förpackning[8] × innehåll[3] × år[4]
// -------------------------------------------------------
function parseGamla(json) {
  const ÅR_GAMLA = ["2020", "2021", "2022", "2023"];
  const nC = 3, nT = 4;

  const data = {};

  FÖRPACKNINGAR.forEach((f, fi) => {
    data[f.kod] = {
      tillford: {},
      atervinning_ton: {},
      atervinning_pct: {},
    };

    INNEHÅLL_GAMLA.forEach((c, ci) => {
      ÅR_GAMLA.forEach((t, ti) => {

        const idx    = fi * (nC * nT) + ci * nT + ti;
        const raw    = json.value[idx];
        const saknas = json.status?.[String(idx)] === "..";

        data[f.kod][c.roll][t] =
          saknas ? null : (raw ?? null);
      });
    });
  });

  return data;
}

// -------------------------------------------------------
// Tolkar TAB6768 (2024)
// Struktur: förpackning[9 ink. 99] × innehåll[3] × år[1]
// -------------------------------------------------------
function parseNya(json) {
  const FPACK_NYA = ["10","25","35","40","45","55","65","70","99"];
  const nC = 3, nT = 1;

  const data = {};

  FPACK_NYA.forEach((kod, fi) => {
    data[kod] = {
      tillford: {},
      atervinning_ton: {},
      atervinning_pct: {},
    };

    INNEHÅLL_NYA.forEach((c, ci) => {

      const idx    = fi * (nC * nT) + ci * nT + 0;
      const raw    = json.value[idx];
      const saknas = json.status?.[String(idx)] === "..";

      data[kod][c.roll]["2024"] =
        saknas ? null : (raw ?? null);
    });
  });

  return data;
}

// -------------------------------------------------------
// Slår ihop gamla (2020–2023)
// och nya (2024) till ett objekt
// -------------------------------------------------------
function merge(gamla, nya) {
  const merged = {};

  FÖRPACKNINGAR.forEach(f => {
    merged[f.kod] = {
      tillford: {
        ...gamla[f.kod].tillford,
        ...(nya[f.kod]?.tillford ?? {})
      },

      atervinning_ton: {
        ...gamla[f.kod].atervinning_ton,
        ...(nya[f.kod]?.atervinning_ton ?? {})
      },

      atervinning_pct: {
        ...gamla[f.kod].atervinning_pct,
        ...(nya[f.kod]?.atervinning_pct ?? {})
      },
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

  if (!main) return;

  main.innerHTML = '';

  // Nyckeltal
  main.appendChild(makeSummaryGrid(data));

  // Diagramgrid
  const grid = document.createElement('div');
  grid.className = 'chart-grid';

  main.appendChild(grid);

  // Ton-vyer
  if (activeView === 'ton' || activeView === 'bada') {

    grid.appendChild(
      makeLineCard(
        data,
        KOD_TON,
        "Materialåtervinning per förpackningsslag",
        "ton · 2020–2024",
        "ton",
        true
      )
    );

    grid.appendChild(
      makeLineCard(
        data,
        KOD_TILLFORD,
        "Tillförd mängd per förpackningsslag",
        "ton · 2020–2024",
        "ton",
        false
      )
    );
  }

  // Procent-vy
  if (activeView === 'procent' || activeView === 'bada') {

    grid.appendChild(
      makeLineCard(
        data,
        KOD_PCT,
        "Återvinningsgrad per förpackningsslag",
        "procent · 2020–2024",
        "%",
        true
      )
    );
  }
}

// -------------------------------------------------------
// Nyckeltalskort
// -------------------------------------------------------
function makeSummaryGrid(data) {

  const el = document.createElement('div');
  el.className = 'chart-summary-grid';

  // Exkluderar delmängder från totalsummor
  const huvud = FÖRPACKNINGAR
    .filter(f => !DELMÄNGDER.includes(f.kod))
    .map(f => f.kod);

  const tot2024 = summa(data, huvud, KOD_TON, "2024");
  const tot2023 = summa(data, huvud, KOD_TON, "2023");

  const diff = tot2024 - tot2023;
  const sign = diff >= 0 ? "+" : "";

  // Snitt återvinningsgrad
  const antalPct = huvud.filter(
    k => data[k][KOD_PCT]["2024"] !== null
  ).length;

  const snittPct = huvud.reduce((s, k) => {
    const v = data[k][KOD_PCT]["2024"];
    return v !== null ? s + v : s;
  }, 0) / antalPct;

  const stats = [
    {
      label: "Total återvunnet 2024",
      value: (tot2024 / 1000).toFixed(0) + " kt",
      sub: "kiloton materialåtervinning",
      color: "#2d6a4f"
    },

    {
      label: "Förändring vs 2023",
      value: sign + (diff / 1000).toFixed(1) + " kt",
      sub: diff < 0 ? "minskning" : "ökning",
      color: diff < 0 ? "#e76f51" : "#2d6a4f"
    },

    {
      label: "Snitt återvinningsgrad",
      value: snittPct.toFixed(0) + "%",
      sub: "2024 (6 huvudslag)",
      color: "#4e9af1"
    },

    {
      label: "Bäst 2024",
      value: getBäst(data),
      sub: "högst återvinningsgrad",
      color: "#c084fc"
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

// -------------------------------------------------------
// Summerar värden för valda förpackningar
// -------------------------------------------------------
function summa(data, koder, innehållKod, år) {
  return koder.reduce((s, k) => {

    const v = data[k][innehållKod][år];

    return v !== null ? s + v : s;

  }, 0);
}

// -------------------------------------------------------
// Hämtar förpackningsslag med högst
// återvinningsgrad för 2024
// -------------------------------------------------------
function getBäst(data) {

  let bäst = "";
  let bVal = -1;

  FÖRPACKNINGAR.forEach(f => {

    const v = data[f.kod][KOD_PCT]["2024"];

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

  const card = document.createElement('div');

  card.className =
    full ? 'chart-card full' : 'chart-card';

  card.innerHTML = `
    <div class="chart-card-title">${title}</div>
    <div class="chart-card-sub">${sub}</div>
    <div class="chart-wrap"><canvas></canvas></div>`;

  // Dataset för varje förpackningsslag
  const datasets = FÖRPACKNINGAR.map(f => ({
    label:            f.namn,
    data:             ÅR.map(t => data[f.kod][innehållKod][t]),
    borderColor:      f.color,
    backgroundColor:  f.color + "22",
    borderWidth:      2,
    pointRadius:      4,
    pointHoverRadius: 6,
    tension:          0.3,
    spanGaps:         false,
  }));

  // Skapa Chart.js-diagram
  const chart = new Chart(card.querySelector('canvas'), {
    type: 'line',

    data: {
      labels: ÅR,
      datasets
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      interaction: {
        mode: 'index',
        intersect: false
      },

      plugins: {

        legend: {
          position: 'bottom',

          labels: {
            font: {
              family: "'Poppins', sans-serif",
              size: 11
            },

            boxWidth: 12,
            boxHeight: 12,
            padding: 12,

            color: 'rgba(19,17,56,0.8)',
          },
        },

        tooltip: {
          backgroundColor: 'rgba(19,17,56,0.95)',

          titleFont: {
            family: "'Poppins', sans-serif",
            size: 11
          },

          bodyFont: {
            family: "'Poppins', sans-serif",
            size: 12
          },

          padding: 12,

          callbacks: {
            label: ctx => {

              const v = ctx.parsed.y;

              if (v === null) {
                return ` ${ctx.dataset.label}: –`;
              }

              return unit === 'ton'
                ? ` ${ctx.dataset.label}: ${v.toLocaleString('sv')} ton`
                : ` ${ctx.dataset.label}: ${v}%`;
            },
          },
        },
      },

      scales: {

        x: {
          grid: {
            color: 'rgba(19,17,56,0.07)'
          },

          ticks: {
            font: {
              family: "'Poppins', sans-serif",
              size: 11
            },

            color: 'rgba(19,17,56,0.5)'
          },
        },

        y: {
          grid: {
            color: 'rgba(19,17,56,0.07)'
          },

          ticks: {
            font: {
              family: "'Poppins', sans-serif",
              size: 11
            },

            color: 'rgba(19,17,56,0.5)',

            callback: v =>
              unit === 'ton'
                ? v.toLocaleString('sv')
                : v + '%',
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
const footerEl = document.getElementById('footer');

if (footerEl) {
  footerEl.querySelector('p:last-child').textContent =
    "Data: Naturvårdsverket via SCB · TAB5564 (2020–2023) + TAB6768 (2024) · PxWebApi 2.0";
}

// Startar applikationen
init();


// ===========================================================KARTA============================================================= //

// =========================
// FETCH EUROSTAT
// =========================

async function fetchEurostat(dataset) {
  const url = `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${dataset}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("API error: " + res.status);
  }

  return await res.json();
}

// =========================
// JSON-stat PARSER (KORREKT)
// =========================

function parseEurostatJSONStat(json) {

  const geo = json.dimension.geo.category.index;
  const time = json.dimension.time.category.index;

  const countries = Object.keys(geo);
  const years = Object.keys(time);

  const values = json.value;
  const valueArray = Array.isArray(values)
    ? values
    : Object.values(values);

  const result = {};

  countries.forEach(c => {
    result[c] = Array(years.length).fill(null);
  });

  let i = 0;

  for (const c of countries) {
    for (let t = 0; t < years.length; t++) {
      result[c][t] = valueArray[i] ?? null;
      i++;
    }
  }

  return { result, countries, years };
}

// =========================
// ISO3 mapping
// =========================

const iso3 = {

  BE: "BEL",
  LV: "LVA",
  SK: "SVK",
  CZ: "CZE",
  DE: "DEU",
  SI: "SVN",
  NL: "NLD",
  IT: "ITA",
  PL: "POL",
  ES: "ESP",
  LT: "LTU",
  EE: "EST",
  PT: "PRT",
  LU: "LUX",
  MT: "MLT",
  EL: "GRC",
  IE: "IRL",
  FI: "FIN",
  SE: "SWE",
  HR: "HRV",
  DK: "DNK",
  AT: "AUT",
  FR: "FRA",
  HU: "HUN",
  NO: "NOR",

};

// =========================
// MAIN
// =========================

async function loadData() {

  try {

    const plasticRaw =
      await fetchEurostat("env_waspacr");

    const plasticParsed =
      parseEurostatJSONStat(plasticRaw);

    const countries =
      plasticParsed.countries;

    const years =
      plasticParsed.years;

    const rows = [];

    for (const c of countries) {

      for (let i = 0; i < years.length; i++) {

        rows.push({

          country: iso3[c] || c,
          year: years[i],
          recycling:
            plasticParsed.result[c][i]

        });

      }
    }

    function getYearData(year) {
      return rows.filter(
        r => r.year === year
      );
    }

    const initialYear = years[0];
    const initial =
      getYearData(initialYear);

    const customGreens = [

      

      [0, "#e6f4ef"],
      [0.2, "#b7e0d3"],
      [0.4, "#7fc7b0"],
      [0.6, "#3aa486"],
      
      [0.8, "#0b6f58"],

      [1, "#007353"]

    ];

    const trace = {

      type: "choropleth",

      locationmode: "ISO-3",

      locations:
        initial.map(r => r.country),

      z:
        initial.map(r => r.recycling),

      colorscale: customGreens,

      zmin: 0,
      zmax: 100,

      colorbar: {
        title: "Återvinning %"
      }

    };

    const frames = years.map(y => {

      const d = getYearData(y);

      return {

        name: y,

        data: [{

          locations:
            d.map(r => r.country),

          z:
            d.map(r => r.recycling)

        }]
      };
    });

    const layout = {

      title:
        "Förpackningsavfall (%) i Europa 1997–2023",

      geo: {
        scope: "europe"
      },

      sliders: [{

        steps: years.map(y => ({

          label: y,

          method: "animate",

          args: [[y], {

            mode: "immediate",

            frame: {
              duration: 1000
            },

            transition: {
              duration: 700
            }

          }]
        }))
      }],

      updatemenus: [{

        type: "buttons",

        buttons: [

          {

            label: "Play",

            method: "animate",

            args: [null, {

              fromcurrent: true,

              frame: {
                duration: 1000
              },

              transition: {
                duration: 700
              }

            }]
          },

          {

            label: "Pause",

            method: "animate",

            args: [[null], {

              mode: "immediate"

            }]
          }

        ]
      }]
    };

    await Plotly.newPlot(
      "plot2",
      [trace],
      layout
    );

    Plotly.addFrames(
      "plot2",
      frames
    );

  }

  catch (err) {

    console.error(
      "Error loading data:",
      err
    );

  }
}

loadData();

const plasticRecycling2023 = {

  dimension: {

    Geo: {

      category: {

        index: {

          "Belgien":0,
          "Lettland":1,
          "Slovakien":2,
          "Tjeckien":3,
          "Tyskland":4,
          "Slovenien":5,
          "Nederländerna":6,
          "Italien":7,
          "Polen":8,
          "Spanien":9,
          "Litauen":10,
          "Estland":11,
          "Portugal":12,
          "Luxemburg":13,
          "Malta":14,
          "Grekland":15,
          "Irland":16,
          "Finland":17,
          "Sverige":18,
          "Kroatien":19,
          "Danmark":20,
          "Österrike":21,
          "Frankrike":22,
          "Ungern":23,
          "Norge":24

        }
      }
    }
  },

  value: [

    59.5,59.2,54.1,52.4,
    52.2,51.5,49.1,49.0,
    46.3,46.2,42.9,42.4,
    39.5,38.8,35.6,32.7,
    29.6,29.3,28.6,28.2,
    27.8,26.9,25.7,23.0, 30.2

  ]
};

const population2023 = {

  value: [

    11742696,1883008,5428792,10827529,
    84358845,2116972,17811291,58997201,
    36753736,48085361,2857279,1365884,
    10467366,660809,542051,10413982,
    5060004,5563970,10521556,3871833,
    5932654,9104772,68042591,9599744, 5488984

  ]
};

// ENDAST NAMNBYTE HÄR
const iso3Names = {

  "Belgien":"BEL",
  "Lettland":"LVA",
  "Slovakien":"SVK",
  "Tjeckien":"CZE",
  "Tyskland":"DEU",
  "Slovenien":"SVN",
  "Nederländerna":"NLD",
  "Italien":"ITA",
  "Polen":"POL",
  "Spanien":"ESP",
  "Litauen":"LTU",
  "Estland":"EST",
  "Portugal":"PRT",
  "Luxemburg":"LUX",
  "Malta":"MLT",
  "Grekland":"GRC",
  "Irland":"IRL",
  "Finland":"FIN",
  "Sverige":"SWE",
  "Kroatien":"HRV",
  "Danmark":"DNK",
  "Österrike":"AUT",
  "Frankrike":"FRA",
  "Ungern":"HUN",
  "Norge":"NOR"

};

const coords = {

  BEL:[50.5,4.5],
  LVA:[56.9,24.6],
  SVK:[48.7,19.7],
  CZE:[49.8,15.5],
  DEU:[51.1,10.4],
  SVN:[46.1,14.8],
  NLD:[52.1,5.3],
  ITA:[42.8,12.5],
  POL:[52.1,19.4],
  ESP:[40.4,-3.7],
  LTU:[55.2,23.9],
  EST:[58.6,25.0],
  PRT:[39.4,-8.2],
  LUX:[49.8,6.1],
  MLT:[35.9,14.4],
  GRC:[39.1,22.9],
  IRL:[53.3,-8.2],
  FIN:[64.5,26.0],
  SWE:[62,15],
  HRV:[45.1,15.2],
  DNK:[56,9.5],
  AUT:[47.5,14.6],
  FRA:[46.2,2.2],
  HUN:[47.1,19.5],
  NOR:[60.5,8.5]

};

const countries =
  Object.keys(
    plasticRecycling2023
      .dimension
      .Geo
      .category
      .index
  );

const locations =
  countries.map(
    c => iso3Names[c]
  );

const values =
  plasticRecycling2023.value;

const pops =
  population2023.value;

const lat =
  locations.map(
    code => coords[code][0]
  );

const lon =
  locations.map(
    code => coords[code][1]
  );

const customBlues = [

  [0,   "#ececf7"],   // mycket ljus blå/lila
  [0.2, "#c7c7e6"],
  [0.4, "#8f8fc7"],
  [0.6, "#565699"],
  [0.8, "#2c2c63"],
  [1,   "#131138"]    // din huvudfärg

];

const choropleth = {

  type:"choropleth",

  locationmode:"ISO-3",

  locations,

  z: values,

  text: countries,

  colorscale: customBlues,
   hovertemplate:
    
    "%{z}%<extra></extra>",

  colorbar:{
    title:
      "Återvinningsgrad (%)"
  }



};

const bubbles = {

  type:"scattergeo",

  lat,
  lon,

  text: countries.map(
    (c,i) =>
      `${c}<br>Återvinning: ${values[i]}%<br>Population: ${pops[i].toLocaleString()}`
  ),

  mode:"markers",
    hovertemplate:
    "%{text}<extra></extra>",

  marker:{

    size:
      pops.map(
        p => Math.sqrt(p)/500
      ),

    color:
      "rgba(0,0,255,0.4)",
    

    line:{
      width:1
    }

  }
};

// ENDAST NAMNBYTE HÄR
const layout2 = {

  title:
    "Europa: Plaståtervinning (färg) + Population (bubblor) 2023",

  geo: {

    scope: "europe",

    projection: {
      type: "natural earth"
    }

  }
};

Plotly.newPlot(
  "plot",
  [choropleth,bubbles],
  layout2
);

