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

// TAB5564 = 2020–2023
const URL_GAMLA = "https://statistikdatabasen.scb.se/api/v2/tables/TAB5564/data?lang=sv&valueCodes[Forpackning]=10,25,35,40,45,55,65,70&valueCodes[ContentsCode]=0000047A,00000479,00000478&valueCodes[Tid]=2020,2021,2022,2023";

// TAB6768 = 2024
const URL_NYA = "https://statistikdatabasen.scb.se/api/v2/tables/TAB6768/data?lang=sv&valueCodes[Forpackning]=10,25,35,40,45,55,65,70&valueCodes[ContentsCode]=000008G6,000008G5,00000881&valueCodes[Tid]=2024";

const CONTENTS_GAMLA = "0000047A";
const CONTENTS_NYA   = "000008G6";

const KATEGORIER = [
  { kod: "10", namn: "Glas",                         color: "#4e9af1" },
  { kod: "25", namn: "Plast (ink. PET-pant)",         color: "#e76f51" },
  { kod: "35", namn: "PET-flaskor m. pant",           color: "#f4a261" },
  { kod: "40", namn: "Papper/papp/kartong",           color: "#2d6a4f" },
  { kod: "45", namn: "Järnbaserad metall (stål)",     color: "#8b8b8b" },
  { kod: "55", namn: "Aluminium (ink. pantburkar)",   color: "#c084fc" },
  { kod: "65", namn: "Pantburkar aluminium",          color: "#e9c46a" },
  { kod: "70", namn: "Trä",                           color: "#a0785a" },
];

const ALLA_AR = ["2020", "2021", "2022", "2023", "2024"];

async function fetchSCB(url) {
  const res = await fetch(url);
  return res.json();
}

// SCB returnerar ".." för saknade värden — konvertera till null
function toNumber(val) {
  if (val === ".." || val === null || val === undefined) return null;
  return val;
}

// Returnerar { kod: { år: värde | null, ... }, ... }
function parseData(json, contentsCode) {
  const dims   = json.dimension;
  const values = json.value;

  const forpackningKoder = Object.keys(dims["Forpackning"].category.index);
  const contentsKoder    = Object.keys(dims["ContentsCode"].category.index);
  const tider            = Object.keys(dims["Tid"].category.index);

  const nContents = contentsKoder.length;
  const nTid      = tider.length;
  const ciIdx     = contentsKoder.indexOf(contentsCode);

  const result = {};

  forpackningKoder.forEach((kod, fi) => {
    result[kod] = {};
    tider.forEach((ar, ti) => {
      const idx = fi * (nContents * nTid) + ciIdx * nTid + ti;
      result[kod][ar] = toNumber(values[idx]);
    });
  });

  return result;
}

function buildChart(canvasId, gamla, nya) {
  const datasets = KATEGORIER.map(({ kod, namn, color }) => {
    const data = ALLA_AR.map(ar => {
      if (ar === "2024") return nya[kod]?.[ar] ?? null;
      return gamla[kod]?.[ar] ?? null;
    });

    return {
      label: namn,
      data,
      borderColor: color,
      backgroundColor: color + "22",
      tension: 0.3,
      pointRadius: 4,
      spanGaps: true,   // rita över glapp om SCB saknar data för ett år
    };
  });

  const ctx = document.getElementById(canvasId).getContext("2d");

  new Chart(ctx, {
    type: "line",
    data: { labels: ALLA_AR, datasets },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
        title: {
          display: true,
          text: "Materialåtervinning per förpackningsslag (ton)",
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          title: { display: true, text: "Ton" },
        },
        x: {
          title: { display: true, text: "År" },
        },
      },
    },
  });
}

async function init(canvasId) {
  const [gamlaJson, nyaJson] = await Promise.all([
    fetchSCB(URL_GAMLA),
    fetchSCB(URL_NYA),
  ]);

  const gamla = parseData(gamlaJson, CONTENTS_GAMLA);
  const nya   = parseData(nyaJson,   CONTENTS_NYA);

  buildChart(canvasId, gamla, nya);
}

// Byt ut "myChart" mot id:t på din canvas
init("myChart");


async function init(canvasId) {
  const [gamlaJson, nyaJson] = await Promise.all([
    fetchSCB(URL_GAMLA),
    fetchSCB(URL_NYA),
  ]);

  // DEBUG — ta bort när problemet är löst
  console.log("Gamla values:", gamlaJson.value);
  console.log("Gamla Forpackning index:", gamlaJson.dimension.Forpackning.category.index);
  console.log("Gamla ContentsCode index:", gamlaJson.dimension.ContentsCode.category.index);
  console.log("Gamla Tid index:", gamlaJson.dimension.Tid.category.index);

  const gamla = parseData(gamlaJson, CONTENTS_GAMLA);
  const nya   = parseData(nyaJson,   CONTENTS_NYA);

  console.log("Parsad gamla:", gamla);
  console.log("Parsad nya:", nya);

  buildChart(canvasId, gamla, nya);
}


//=================================================korrelationChart===============================================================//

// ============================================================
// KORRELATIONSGRAF – Återvinning vs Disponibel inkomst
// Återvinning: URL_GAMLA (TAB5564 2020–2023) + URL_NYA (TAB6768 2024)
// Ekonomi:     TAB1492 – disponibel inkomst, snitt 18–64 år
// ============================================================

async function initKorrelation() {
  const korrelCanvas = document.getElementById("korrelation");
  if (!korrelCanvas) return;

  const URL_INKOMST =
    "https://statistikdatabasen.scb.se/api/v2/tables/TAB1492/data?lang=sv" +
    "&valueCodes[Region]=00" +
    "&valueCodes[Hushallstyp]=E90" +
    "&valueCodes[Alder]=18-29,30-49,50-64" +
    "&valueCodes[ContentsCode]=000006SW" +
    "&valueCodes[Tid]=2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024" +
    "&codelist[Region]=vs_RegionRiket99";

  try {
    const [resGamla, resNya, resInkomst] = await Promise.all([
      fetch(URL_GAMLA),
      fetch(URL_NYA),
      fetch(URL_INKOMST),
    ]);

    if (!resGamla.ok)   throw new Error(`TAB5564: HTTP ${resGamla.status}`);
    if (!resNya.ok)     throw new Error(`TAB6768: HTTP ${resNya.status}`);
    if (!resInkomst.ok) throw new Error(`TAB1492: HTTP ${resInkomst.status}`);

    const [jGamla, jNya, jInkomst] = await Promise.all([
      resGamla.json(), resNya.json(), resInkomst.json(),
    ]);

    // Återanvänd befintliga parsers och merge
    const åvData = merge(parseGamla(jGamla), parseNya(jNya));

    // Huvudförpackningar (exkl. delmängder 35 och 65)
    const huvud = FÖRPACKNINGAR
      .filter(f => !DELMÄNGDER.includes(f.kod))
      .map(f => f.kod);

    // Total återvinning i ton per år (2020–2024)
    const ÅR_ÅV = ["2020", "2021", "2022", "2023", "2024"];
    const totTon = {};
    ÅR_ÅV.forEach(år => {
      totTon[år] = huvud.reduce((s, k) => {
        const v = åvData[k]?.[KOD_TON]?.[år] ?? null;
        return v !== null ? s + v : s;
      }, 0);
    });

    // --- Tolka TAB1492 (PxWebApi 2.0) ---
    // Dimensionsordning: Ålder (3) × Tid (13)
    const ÅR_IK  = ["2012","2013","2014","2015","2016","2017","2018","2019",
                     "2020","2021","2022","2023","2024"];
    const nAlder = 3;   // 18-29, 30-49, 50-64
    const nTid   = ÅR_IK.length;

    const ikVärden = Array.isArray(jInkomst.value)
      ? jInkomst.value
      : Object.values(jInkomst.value);

    // Snitt disponibel inkomst per år över de tre åldersgrupperna
    const inkomstPerÅr = {};
    ÅR_IK.forEach((år, ti) => {
      let sum = 0, count = 0;
      for (let ai = 0; ai < nAlder; ai++) {
        const v = ikVärden[ai * nTid + ti];
        if (v !== null && v !== undefined) { sum += v; count++; }
      }
      inkomstPerÅr[år] = count > 0 ? sum / count : null;
    });

    // --- Bygg punkter: bara år där båda värdena finns (överlapp 2020–2024) ---
    const punkter = [];
    ÅR_ÅV.forEach(år => {
      const ton = totTon[år];
      const ink = inkomstPerÅr[år] ?? null;
      if (ton > 0 && ink !== null) {
        punkter.push({ x: ton / 1000, y: ink, år });
      }
    });

    if (punkter.length < 2) {
      korrelCanvas.insertAdjacentHTML("afterend",
        `<p class="chart-error">⚠ För få datapunkter för korrelation.</p>`);
      return;
    }

    // --- Linjär regression & Pearson r ---
    const n  = punkter.length;
    const mx = punkter.reduce((s, p) => s + p.x, 0) / n;
    const my = punkter.reduce((s, p) => s + p.y, 0) / n;
    const täljare  = punkter.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0);
    const nämnareX = punkter.reduce((s, p) => s + (p.x - mx) ** 2, 0);
    const nämnareY = punkter.reduce((s, p) => s + (p.y - my) ** 2, 0);
    const k = täljare / nämnareX;
    const m = my - k * mx;
    const r = täljare / Math.sqrt(nämnareX * nämnareY);

    const xMin = Math.min(...punkter.map(p => p.x));
    const xMax = Math.max(...punkter.map(p => p.x));
    const trendlinje = [
      { x: xMin, y: k * xMin + m },
      { x: xMax, y: k * xMax + m },
    ];

    // --- Rita Chart.js – dubbel linje med år på x-axeln ---
    const labels = punkter.map(p => p.år);

    new Chart(korrelCanvas, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Total materialåtervinning (kt)",
            data: punkter.map(p => p.x),
            yAxisID: "yÅv",
            borderColor: "#4e9af1",
            backgroundColor: "#4e9af122",
            borderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.3,
          },
          {
            label: "Disponibel inkomst (tkr, snitt 18–64 år)",
            data: punkter.map(p => p.y),
            yAxisID: "yInk",
            borderColor: "#c084fc",
            backgroundColor: "#c084fc22",
            borderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            labels: {
              font:     { family: "'Poppins', sans-serif", size: 11 },
              color:    "rgba(19,17,56,0.8)",
              boxWidth: 12,
            },
          },
          tooltip: {
            backgroundColor: "rgba(19,17,56,0.95)",
            titleFont: { family: "'Poppins', sans-serif", size: 11 },
            bodyFont:  { family: "'Poppins', sans-serif", size: 12 },
            padding: 10,
            callbacks: {
              label: ctx => {
                if (ctx.datasetIndex === 0)
                  return ` Återvinning: ${ctx.parsed.y.toFixed(1)} kt`;
                return ` Inkomst: ${Math.round(ctx.parsed.y).toLocaleString("sv")} tkr`;
              },
              afterBody: () => [`Pearson r = ${r.toFixed(2)}`],
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text:    "År",
              font:    { family: "'Poppins', sans-serif", size: 11 },
              color:   "rgba(19,17,56,0.5)",
            },
            grid:  { color: "rgba(19,17,56,0.07)" },
            ticks: {
              font:  { family: "'Poppins', sans-serif", size: 11 },
              color: "rgba(19,17,56,0.5)",
            },
          },
          yÅv: {
            position: "left",
            title: {
              display: true,
              text:    "Återvinning (kt)",
              font:    { family: "'Poppins', sans-serif", size: 11 },
              color:   "#4e9af1",
            },
            grid:  { color: "rgba(19,17,56,0.07)" },
            ticks: {
              font:     { family: "'Poppins', sans-serif", size: 10 },
              color:    "#4e9af1",
              callback: v => v + " kt",
            },
          },
          yInk: {
            position: "right",
            title: {
              display: true,
              text:    "Inkomst (tkr)",
              font:    { family: "'Poppins', sans-serif", size: 11 },
              color:   "#c084fc",
            },
            grid:  { drawOnChartArea: false },
            ticks: {
              font:     { family: "'Poppins', sans-serif", size: 10 },
              color:    "#c084fc",
              callback: v => v.toLocaleString("sv"),
            },
          },
        },
      },
    });

  } catch (err) {
    korrelCanvas.insertAdjacentHTML("afterend",
      `<div class="chart-error">⚠ Korrelationsgrafen: ${err.message}</div>`);
    console.error("Korrelationsfel:", err);
  }
}

initKorrelation();

//================================================================================================================================//

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

