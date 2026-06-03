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

const track = document.querySelector(".track");
if (track) {
  const tiles = document.querySelectorAll(".tile");
  const right = document.querySelector(".right");
  const left = document.querySelector(".left");
  const tileWidth = tiles[0].offsetWidth + 16;
  let isAnimating = false;

  right.addEventListener("click", () => {
    if (isAnimating) return;
    isAnimating = true;
    track.style.transition = "transform 0.4s ease";
    track.style.transform = `translateX(-${tileWidth}px)`;
    track.addEventListener(
      "transitionend",
      () => {
        track.appendChild(track.firstElementChild);
        track.style.transition = "none";
        track.style.transform = "translateX(0)";
        isAnimating = false;
      },
      { once: true },
    );
  });

  left.addEventListener("click", () => {
    if (isAnimating) return;
    isAnimating = true;
    track.insertBefore(track.lastElementChild, track.firstElementChild);
    track.style.transition = "none";
    track.style.transform = `translateX(-${tileWidth}px)`;
    track.offsetHeight;
    track.style.transition = "transform 0.4s ease";
    track.style.transform = "translateX(0)";
    track.addEventListener(
      "transitionend",
      () => {
        isAnimating = false;
      },
      { once: true },
    );
  });
}

// ============================================================
// STAPELDIAGRAM – Återvinningsgrad 2024 (canvas id="scb")
// ============================================================

const FÖRPACKNINGAR = [
  { kod: "10", namn: "Glas", color: "#4e9af1" },
  { kod: "25", namn: "Plast (ink. PET-pant)", color: "#e76f51" },
  { kod: "35", namn: "PET-flaskor m. pant", color: "#f4a261" },
  { kod: "40", namn: "Papper/papp/kartong", color: "#2d6a4f" },
  { kod: "45", namn: "Järnbaserad metall (stål)", color: "#5e61a1" },
  { kod: "55", namn: "Aluminium (ink. pantburkar)", color: "#c084fc" },
  { kod: "65", namn: "Pantburkar aluminium", color: "#e9c46a" },
];

const urlSCB =
  "https://api.scb.se/OV0104/v1/doris/sv/ssd/START/MI/MI0307/MI0307T2NN";

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
  10: 90,
  25: 50,
  35: 90,
  40: 85,
  45: 70,
  55: 50,
  65: 90,
};

function buildPieCharts(filtered, values) {
  const labels = filtered.map((d) => {
    const names = {
      10: "Glas",
      25: "Plast inkl. PET",
      35: "PET-flaskor",
      40: "Papper/kartong",
      45: "Järn/stål",
      55: "Aluminium",
      65: "Pantburkar",
    };
    return names[d.key[0]] || d.key[0];
  });

  const färger = filtered.map((d) => {
    const item = FÖRPACKNINGAR.find((f) => f.kod === d.key[0]);
    return item ? item.color : "#000000";
  });

  const pie1 = document.getElementById("pieFordelning");
  if (pie1) {
    const befintligPie1 = Chart.getChart(pie1);
    if (befintligPie1) befintligPie1.destroy();

    new Chart(pie1, {
      type: "pie",
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: färger }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { font: { size: 10 } } },
          title: { display: true, text: "Fördelning återvunnen mängd 2024" },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${ctx.raw.toFixed(1)} %`,
            },
          },
        },
      },
    });
  }

  const pie2 = document.getElementById("pieJamforelse");
  if (pie2) {
    const befintligPie2 = Chart.getChart(pie2);
    if (befintligPie2) befintligPie2.destroy();

    const goalValues = filtered.map((d) => goals[d.key[0]] || 0);
    const overGoal = values.filter((v, i) => v >= goalValues[i]).length;
    const underGoal = values.length - overGoal;

    new Chart(pie2, {
      type: "pie",
      data: {
        labels: ["Uppnått återvinningsmålet", "Uppnått ej målet"],
        datasets: [
          {
            data: [overGoal, underGoal],
            backgroundColor: ["#131138", "rgba(198, 196, 255, 0.4)"],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { font: { size: 10 } } },
          title: { display: true, text: "Uppnått målet 2024" },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${ctx.raw} material`,
            },
          },
        },
      },
    });
  }
}

const scbCanvas = document.getElementById("scb");
if (scbCanvas) {
  fetch(urlSCB, { method: "POST", body: JSON.stringify(querySCB) })
    .then((r) => r.json())
    .then((data) => {
      const filtered = data.data.filter(
        (d) => d.key[0] !== "99" && d.key[0] !== "70",
      );

      const labels = filtered.map((d) => {
        const names = {
          10: "Glas",
          25: "Plast inkl. PET",
          35: "PET-flaskor",
          40: "Papper/kartong",
          45: "Järn/stål",
          55: "Aluminium",
          65: "Pantburkar",
          70: "Trä",
        };
        return names[d.key[0]] || d.key[0];
      });

      const values = filtered.map((d) => parseFloat(d.values[0]));
      const goalValues = filtered.map((d) => goals[d.key[0]] || 0);
      const färger = filtered.map((d) => {
        const item = FÖRPACKNINGAR.find((f) => f.kod === d.key[0]);
        return item ? item.color : "#000000";
      });

      const befintligStapel = Chart.getChart(scbCanvas);
      if (befintligStapel) befintligStapel.destroy();

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
          maintainAspectRatio: false,
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

      buildPieCharts(filtered, values);
    })
    .catch((err) => console.error("SCB-fel:", err));
}

// ============================================================================================================================= //

// ============================================================
// SCB-URLS
// ============================================================
const URL_GAMLA =
  "https://statistikdatabasen.scb.se/api/v2/tables/TAB5564/data?lang=sv&valueCodes[Forpackning]=10,25,35,40,45,55,65,70&valueCodes[ContentsCode]=0000047A,00000479,00000478&valueCodes[Tid]=2020,2021,2022,2023";
const URL_NYA =
  "https://statistikdatabasen.scb.se/api/v2/tables/TAB6768/data?lang=sv&valueCodes[Forpackning]=10,25,35,40,45,55,65,70&valueCodes[ContentsCode]=000008G6,000008G5,00000881&valueCodes[Tid]=2024";

const CONTENTS_TON_GAMLA = "0000047A";
const CONTENTS_TON_NYA = "000008G6";
const CONTENTS_GRAD_GAMLA = "00000478";
const CONTENTS_GRAD_NYA = "00000881";
const CONTENTS_MARK_GAMLA = "00000479";
const CONTENTS_MARK_NYA = "000008G5";

const ALLA_AR = ["2020", "2021", "2022", "2023", "2024"];

const KATEGORIER = [
  { kod: "10", namn: "Glas", color: "#4e9af1" },
  { kod: "25", namn: "Plast (ink. PET-pant)", color: "#e76f51" },
  { kod: "35", namn: "PET-flaskor m. pant", color: "#f4a261" },
  { kod: "40", namn: "Papper/papp/kartong", color: "#2d6a4f" },
  { kod: "45", namn: "Järnbaserad metall (stål)", color: "#5e61a1" },
  { kod: "55", namn: "Aluminium (ink. pantburkar)", color: "#c084fc" },
  { kod: "65", namn: "Pantburkar aluminium", color: "#e9c46a" },
];

// ============================================================
// FETCH & PARSE
// ============================================================
async function fetchSCB(url) {
  const res = await fetch(url);
  return res.json();
}

function toNumber(val) {
  if (val === ".." || val === null || val === undefined) return null;
  return val;
}

function parseData(json, contentsCode) {
  const dims = json.dimension;
  const values = json.value;

  const forpackningKoder = Object.keys(dims["Forpackning"].category.index);
  const contentsKoder = Object.keys(dims["ContentsCode"].category.index);
  const tider = Object.keys(dims["Tid"].category.index);

  const nContents = contentsKoder.length;
  const nTid = tider.length;
  const ciIdx = contentsKoder.indexOf(contentsCode);

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

// ============================================================
// KORTEN
// ============================================================
function buildCards(tonGamla, tonNya, gradGamla, gradNya) {
  const totalt2024 = KATEGORIER.reduce((sum, { kod }) => {
    const v = tonNya[kod]?.["2024"];
    return sum + (v ?? 0);
  }, 0);

  let toppKat = null,
    toppGrad = -Infinity;
  KATEGORIER.forEach(({ kod, namn }) => {
    const g = gradNya[kod]?.["2024"] ?? gradGamla[kod]?.["2023"];
    if (g !== null && g > toppGrad) {
      toppGrad = g;
      toppKat = namn;
    }
  });

  const grader = KATEGORIER.map(
    ({ kod }) => gradNya[kod]?.["2024"] ?? gradGamla[kod]?.["2023"],
  ).filter((v) => v !== null);
  const snittGrad = grader.length
    ? (grader.reduce((a, b) => a + b, 0) / grader.length).toFixed(1)
    : "–";

  const kortData = [
    {
      ikon: "bi-trophy",
      label: "Högst återvinningsgrad",
      värde: toppKat ?? "–",
      sub: toppGrad > 0 ? `${toppGrad.toFixed(1)} %` : "",
    },
    {
      ikon: "bi-recycle",
      label: "Totalt återvunnet 2024",
      värde: Math.round(totalt2024).toLocaleString("sv-SE") + " ton",
      sub: "alla förpackningsslag",
    },

    {
      ikon: "bi-percent",
      label: "Snitt återvinningsgrad",
      värde: snittGrad + " %",
      sub: "genomsnitt alla material",
    },
  ];

  const kortContainer = document.querySelector(".stat-cards");
  if (!kortContainer) return;

  kortContainer.innerHTML = kortData
    .map(
      ({ ikon, label, värde, sub }) => `
    <div class="card">
      <i class="bi ${ikon} card-icon"></i>
      <p class="card-label">${label}</p>
      <p class="card-value">${värde}</p>
      ${sub ? `<p class="card-sub">${sub}</p>` : ""}
    </div>
  `,
    )
    .join("");
}

// ============================================================
// GRAFER – sektion 1
// ============================================================
function buildChart(canvasId, gamla, nya) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const befintlig = Chart.getChart(canvas);
  if (befintlig) befintlig.destroy();

  const datasets = KATEGORIER.map(({ kod, namn, color }) => ({
    label: namn,
    data: ALLA_AR.map((ar) =>
      ar === "2024" ? (nya[kod]?.[ar] ?? null) : (gamla[kod]?.[ar] ?? null),
    ),
    borderColor: color,
    backgroundColor: color + "22",
    tension: 0.3,
    pointRadius: 4,
    spanGaps: true,
  }));

  new Chart(canvas.getContext("2d"), {
    type: "line",
    data: { labels: ALLA_AR, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
        title: {
          display: true,
          text: "Materialåtervinning per förpackningsslag (ton)",
        },
      },
      scales: {
        y: {
          type: "logarithmic",
          title: { display: true, text: "Ton" },
          ticks: {
            callback(value) {
              const steg = [
                10000, 20000, 30000, 50000, 100000, 200000, 300000, 500000,
                700000,
              ];
              return steg.includes(value)
                ? value.toLocaleString("sv-SE")
                : null;
            },
          },
        },
        x: { title: { display: true, text: "År" } },
      },
    },
  });
}

function buildMarketChart(canvasId, gamla, nya) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const befintlig = Chart.getChart(canvas);
  if (befintlig) befintlig.destroy();

  const datasets = KATEGORIER.map(({ kod, namn, color }) => ({
    label: namn,
    data: ALLA_AR.map((ar) =>
      ar === "2024" ? (nya[kod]?.[ar] ?? null) : (gamla[kod]?.[ar] ?? null),
    ),
    borderColor: color,
    backgroundColor: color + "22",
    tension: 0.3,
    pointRadius: 4,
    spanGaps: true,
  }));

  new Chart(canvas.getContext("2d"), {
    type: "line",
    data: { labels: ALLA_AR, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
        title: {
          display: true,
          text: "Förpackningar på marknaden per förpackningsslag (ton)",
        },
      },
      scales: {
        y: {
          type: "logarithmic",
          title: { display: true, text: "Ton" },
          ticks: {
            callback(value) {
              const steg = [
                10000, 20000, 50000, 100000, 200000, 500000, 1000000,
              ];
              return steg.includes(value)
                ? value.toLocaleString("sv-SE")
                : null;
            },
          },
        },
        x: { title: { display: true, text: "År" } },
      },
    },
  });
}

// ============================================================
// INIT – sektion 1
// ============================================================
async function init(canvasId) {
  const [gamlaJson, nyaJson] = await Promise.all([
    fetchSCB(URL_GAMLA),
    fetchSCB(URL_NYA),
  ]);

  const tonGamla = parseData(gamlaJson, CONTENTS_TON_GAMLA);
  const tonNya = parseData(nyaJson, CONTENTS_TON_NYA);
  const gradGamla = parseData(gamlaJson, CONTENTS_GRAD_GAMLA);
  const gradNya = parseData(nyaJson, CONTENTS_GRAD_NYA);
  const markGamla = parseData(gamlaJson, CONTENTS_MARK_GAMLA);
  const markNya = parseData(nyaJson, CONTENTS_MARK_NYA);

  buildCards(tonGamla, tonNya, gradGamla, gradNya);
  buildChart(canvasId, tonGamla, tonNya);
  buildMarketChart("marketChart", markGamla, markNya);
}

init("myChart");

// ============================================================================================================================= //

// ============================================================
// KORRELATIONSGRAF
// ============================================================

const URL_GAMMAL =
  "https://statistikdatabasen.scb.se/api/v2/tables/TAB4568/data?" +
  "lang=sv" +
  "&valueCodes[Forpackning]=10,20,30,40,50,60,70" +
  "&valueCodes[ContentsCode]=000000XV" +
  "&valueCodes[Tid]=2012,2013,2014,2015,2016,2017,2018,2019";

const URL_INKOMST =
  "https://statistikdatabasen.scb.se/api/v2/tables/TAB1492/data?" +
  "lang=sv" +
  "&valueCodes[Region]=00" +
  "&valueCodes[Hushallstyp]=E90" +
  "&valueCodes[Alder]=18%2B" +
  "&valueCodes[ContentsCode]=000006SW" +
  "&valueCodes[Tid]=2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024" +
  "&codelist[Region]=vs_RegionRiket99";

const ALLA_UTOKADE_AR = [
  "2012",
  "2013",
  "2014",
  "2015",
  "2016",
  "2017",
  "2018",
  "2019",
  "2020",
  "2021",
  "2022",
  "2023",
  "2024",
];

function parseGammalData(json) {
  const dims = json.dimension;
  const values = json.value;

  const forpackKoder = Object.keys(dims["Forpackning"].category.index);
  const tider = Object.keys(dims["Tid"].category.index);
  const nTid = tider.length;

  const totaltPerAr = {};
  tider.forEach((ar) => (totaltPerAr[ar] = 0));

  forpackKoder.forEach((kod, fi) => {
    tider.forEach((ar, ti) => {
      const idx = fi * nTid + ti;
      const v = values[idx];
      if (v != null) totaltPerAr[ar] += Number(v);
    });
  });

  return totaltPerAr;
}

function parseInkomst(json) {
  const dims = json.dimension;
  const values = json.value;

  const tidKey = Object.keys(dims).find(
    (k) => k.toLowerCase().includes("tid") || k.toLowerCase().includes("time"),
  );

  if (!tidKey) {
    console.error("Hittade inte tid-dimensionen:", Object.keys(dims));
    return {};
  }

  const tider = Object.keys(dims[tidKey].category.index);
  const result = {};
  tider.forEach((ar, i) => {
    result[ar] = values[i] != null ? Number(values[i]) : null;
  });
  return result;
}

function linearRegression(points) {
  const n = points.length;
  const sx = points.reduce((a, p) => a + p.x, 0);
  const sy = points.reduce((a, p) => a + p.y, 0);
  const sx2 = points.reduce((a, p) => a + p.x * p.x, 0);
  const sxy = points.reduce((a, p) => a + p.x * p.y, 0);

  const slope = (n * sxy - sx * sy) / (n * sx2 - sx * sx);
  const intercept = (sy - slope * sx) / n;

  const yMean = sy / n;
  const ssTot = points.reduce((a, p) => a + (p.y - yMean) ** 2, 0);
  const ssRes = points.reduce(
    (a, p) => a + (p.y - (slope * p.x + intercept)) ** 2,
    0,
  );
  const r2 = 1 - ssRes / ssTot;

  return { slope, intercept, r2 };
}

async function buildKorrelationChart(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  try {
    const [gammalJson, gamlaJson, nyaJson, inkomstJson] = await Promise.all([
      fetchSCB(URL_GAMMAL),
      fetchSCB(URL_GAMLA),
      fetchSCB(URL_NYA),
      fetchSCB(URL_INKOMST),
    ]);

    const gammalTon = parseGammalData(gammalJson);
    const tonGamla = parseData(gamlaJson, CONTENTS_TON_GAMLA);
    const tonNya = parseData(nyaJson, CONTENTS_TON_NYA);

    const nyTon = {};
    ["2020", "2021", "2022", "2023"].forEach((ar) => {
      nyTon[ar] = KATEGORIER.reduce((acc, { kod }) => {
        return acc + (tonGamla[kod]?.[ar] ?? 0);
      }, 0);
    });
    nyTon["2024"] = KATEGORIER.reduce((acc, { kod }) => {
      return acc + (tonNya[kod]?.["2024"] ?? 0);
    }, 0);

    const inkomst = parseInkomst(inkomstJson);

    const punkter = ALLA_UTOKADE_AR.filter((ar) => {
      const ton = ar <= "2019" ? gammalTon[ar] : nyTon[ar];
      return ton > 0 && inkomst[ar] != null;
    }).map((ar) => ({
      x: inkomst[ar],
      y: Math.round(ar <= "2019" ? gammalTon[ar] : nyTon[ar]),
      ar,
    }));

    if (punkter.length === 0) {
      canvas.parentElement.innerHTML =
        '<p class="chart-error">Ingen data tillgänglig.</p>';
      return;
    }

    const reg = linearRegression(punkter);
    const xMin = Math.min(...punkter.map((p) => p.x));
    const xMax = Math.max(...punkter.map((p) => p.x));
    const regressionLine = [
      { x: xMin, y: reg.slope * xMin + reg.intercept },
      { x: xMax, y: reg.slope * xMax + reg.intercept },
    ];

    const färgSkala = {
  2012: "#d7d7f5",
  2013: "#c2c2ee",
  2014: "#adade7",
  2015: "#9898e0",
  2016: "#8383d9",
  2017: "#6e6ed2",
  2018: "#5959cb",
  2019: "#4444c4",
  2020: "#3030ad",
  2021: "#25258a",
  2022: "#1d1d69",
  2023: "#17174f",
  2024: "#131138",
};

    const befintligKorr = Chart.getChart(canvas);
    if (befintligKorr) befintligKorr.destroy();

    new Chart(canvas.getContext("2d"), {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "År (2012–2024)",
            data: punkter,
            backgroundColor: punkter.map((p) => färgSkala[p.ar] ?? "#007353"),
            pointRadius: 10,
            pointHoverRadius: 13,
          },
          {
            label: `Regressionslinje (r² = ${reg.r2.toFixed(2)})`,
            data: regressionLine,
            type: "line",
            borderColor: "rgba(19, 17, 56, 0.5)",
            borderDash: [6, 4],
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" },
          title: {
            display: true,
            text: "Korrelation: Disponibel inkomst (18+) vs Återvinning (ton), 2012–2024",
          },
          tooltip: {
            callbacks: {
              label(ctx) {
                const p = ctx.raw;
                if (!p.ar) return "";
                return [
                  `År: ${p.ar}`,
                  `Inkomst: ${Math.round(p.x).toLocaleString("sv-SE")} kr`,
                  `Återvinning: ${p.y.toLocaleString("sv-SE")} ton`,
                ];
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Disponibel inkomst (kr/år, 18+ år)",
            },
            ticks: { callback: (v) => v.toLocaleString("sv-SE") + " kr" },
          },
          y: {
            title: { display: true, text: "Totalt återvunnet (ton)" },
            ticks: { callback: (v) => v.toLocaleString("sv-SE") },
          },
        },
      },
      plugins: [
        {
          afterDatasetsDraw(chart) {
            const ctx2 = chart.ctx;
            const dataset = chart.data.datasets[0];
            const meta = chart.getDatasetMeta(0);
            ctx2.save();
            ctx2.font = "bold 11px Poppins, sans-serif";
            ctx2.fillStyle = "rgba(19,17,56,0.8)";
            ctx2.textAlign = "center";
            meta.data.forEach((point, i) => {
              const p = dataset.data[i];
              if (p.ar) ctx2.fillText(p.ar, point.x, point.y - 14);
            });
            ctx2.restore();
          },
        },
      ],
    });
  } catch (err) {
    console.error("Korrelationsfel:", err);
    canvas.parentElement.innerHTML =
      '<p class="chart-error">Kunde inte ladda korrelationsdata.</p>';
  }
}

buildKorrelationChart("korrelation");

// ============================================================================================================================= //

// ============================================================
// FETCH EUROSTAT
// ============================================================

async function fetchEurostat(dataset) {
  const url = `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${dataset}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("API error: " + res.status);
  return await res.json();
}


function parseEurostatJSONStat(json) {
  const geo = json.dimension.geo.category.index;
  const time = json.dimension.time.category.index;

  const countries = Object.keys(geo);
  const years = Object.keys(time);
  const values = json.value;
  const valueArray = Array.isArray(values) ? values : Object.values(values);

  const result = {};
  countries.forEach((c) => {
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

async function loadData() {
  try {
    const plasticRaw = await fetchEurostat("env_waspacr");
    const plasticParsed = parseEurostatJSONStat(plasticRaw);

    const countries = plasticParsed.countries;
    const years = plasticParsed.years;
    const rows = [];

    for (const c of countries) {
      for (let i = 0; i < years.length; i++) {
        rows.push({
          country: iso3[c] || c,
          year: years[i],
          recycling: plasticParsed.result[c][i],
        });
      }
    }

    function getYearData(year) {
      return rows.filter((r) => r.year === year);
    }

    const initialYear = years[0];
    const initial = getYearData(initialYear);

    const customGreens = [
      [0, "#e6f4ef"],
      [0.2, "#b7e0d3"],
      [0.4, "#7fc7b0"],
      [0.6, "#3aa486"],
      [0.8, "#0b6f58"],
      [1, "#007353"],
    ];

    const trace = {
      type: "choropleth",
      locationmode: "ISO-3",
      locations: initial.map((r) => r.country),
      z: initial.map((r) => r.recycling),
      colorscale: customGreens,
      zmin: 0,
      zmax: 100,
      colorbar: { title: "Återvinning %" },
    };

    const frames = years.map((y) => {
      const d = getYearData(y);
      return {
        name: y,
        data: [
          { locations: d.map((r) => r.country), z: d.map((r) => r.recycling) },
        ],
      };
    });

    const layout = {
      autosize: true,
      height: 600,  
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      geo: { scope: "europe", bgcolor: "rgba(0,0,0,0)" },
      sliders: [
        {
          steps: years.map((y) => ({
            label: y,
            method: "animate",
            args: [
              [y],
              {
                mode: "immediate",
                frame: { duration: 1000 },
                transition: { duration: 700 },
              },
            ],
          })),
        },
      ],
      updatemenus: [
        {
          type: "buttons",
          buttons: [
            {
              label: "Play",
              method: "animate",
              args: [
                null,
                {
                  fromcurrent: true,
                  frame: { duration: 800 },
                  transition: { duration: 700 },
                },
              ],
            },
            {
              label: "Pause",
              method: "animate",
              args: [[null], { mode: "immediate" }],
            },
          ],
        },
      ],
    };

    await Plotly.newPlot("plot2", [trace], layout, { responsive: true });
    Plotly.addFrames("plot2", frames);
  } catch (err) {
    console.error("Error loading data:", err);
  }
}

loadData();

// ============================================================
// PLOT 1 – Plaståtervinning + befolkning Europa 2023
// ============================================================

const plasticRecycling2023 = {
  dimension: {
    Geo: {
      category: {
        index: {
          Belgien: 0,
          Lettland: 1,
          Slovakien: 2,
          Tjeckien: 3,
          Tyskland: 4,
          Slovenien: 5,
          Nederländerna: 6,
          Italien: 7,
          Polen: 8,
          Spanien: 9,
          Litauen: 10,
          Estland: 11,
          Portugal: 12,
          Luxemburg: 13,
          Malta: 14,
          Grekland: 15,
          Irland: 16,
          Finland: 17,
          Sverige: 18,
          Kroatien: 19,
          Danmark: 20,
          Österrike: 21,
          Frankrike: 22,
          Ungern: 23,
          Norge: 24,
        },
      },
    },
  },
  value: [
    59.5, 59.2, 54.1, 52.4, 52.2, 51.5, 49.1, 49.0, 46.3, 46.2, 42.9, 42.4,
    39.5, 38.8, 35.6, 32.7, 29.6, 29.3, 28.6, 28.2, 27.8, 26.9, 25.7, 23.0,
    30.2,
  ],
};

const population2023 = {
  value: [
    11742696, 1883008, 5428792, 10827529, 84358845, 2116972, 17811291, 58997201,
    36753736, 48085361, 2857279, 1365884, 10467366, 660809, 542051, 10413982,
    5060004, 5563970, 10521556, 3871833, 5932654, 9104772, 68042591, 9599744,
    5488984,
  ],
};

const iso3Names = {
  Belgien: "BEL",
  Lettland: "LVA",
  Slovakien: "SVK",
  Tjeckien: "CZE",
  Tyskland: "DEU",
  Slovenien: "SVN",
  Nederländerna: "NLD",
  Italien: "ITA",
  Polen: "POL",
  Spanien: "ESP",
  Litauen: "LTU",
  Estland: "EST",
  Portugal: "PRT",
  Luxemburg: "LUX",
  Malta: "MLT",
  Grekland: "GRC",
  Irland: "IRL",
  Finland: "FIN",
  Sverige: "SWE",
  Kroatien: "HRV",
  Danmark: "DNK",
  Österrike: "AUT",
  Frankrike: "FRA",
  Ungern: "HUN",
  Norge: "NOR",
};

const coords = {
  BEL: [50.5, 4.5],
  LVA: [56.9, 24.6],
  SVK: [48.7, 19.7],
  CZE: [49.8, 15.5],
  DEU: [51.1, 10.4],
  SVN: [46.1, 14.8],
  NLD: [52.1, 5.3],
  ITA: [42.8, 12.5],
  POL: [52.1, 19.4],
  ESP: [40.4, -3.7],
  LTU: [55.2, 23.9],
  EST: [58.6, 25.0],
  PRT: [39.4, -8.2],
  LUX: [49.8, 6.1],
  MLT: [35.9, 14.4],
  GRC: [39.1, 22.9],
  IRL: [53.3, -8.2],
  FIN: [64.5, 26.0],
  SWE: [62, 15],
  HRV: [45.1, 15.2],
  DNK: [56, 9.5],
  AUT: [47.5, 14.6],
  FRA: [46.2, 2.2],
  HUN: [47.1, 19.5],
  NOR: [60.5, 8.5],
};

const countries = Object.keys(
  plasticRecycling2023.dimension.Geo.category.index,
);
const locations = countries.map((c) => iso3Names[c]);
const values = plasticRecycling2023.value;
const pops = population2023.value;
const lat = locations.map((code) => coords[code][0]);
const lon = locations.map((code) => coords[code][1]);

const customBlues = [
  [0, "#ececf7"],
  [0.2, "#c7c7e6"],
  [0.4, "#8f8fc7"],
  [0.6, "#565699"],
  [0.8, "#2c2c63"],
  [1, "#131138"],
];

const choropleth = {
  type: "choropleth",
  locationmode: "ISO-3",
  locations,
  z: values,
  text: countries,
  colorscale: customBlues,
  hovertemplate: "%{z}%<extra></extra>",
  colorbar: { title: "Återvinningsgrad (%)" },
};

const bubbles = {
  type: "scattergeo",
  lat,
  lon,
  text: countries.map(
    (c, i) =>
      `${c}<br>Återvinning: ${values[i]}%<br>Population: ${pops[i].toLocaleString()}`,
  ),
  mode: "markers",
  hovertemplate: "%{text}<extra></extra>",
  marker: {
    size: pops.map((p) => Math.sqrt(p) / 300),
    color: "rgba(0,0,255,0.4)",
    line: { width: 1 },
  },
};

const layout2 = {
  autosize: true,
  height: 700,
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  geo: {
    scope: "europe",
    projection: { type: "natural earth" },
    bgcolor: "rgba(0,0,0,0)",
  },
};

Plotly.newPlot("plot", [choropleth, bubbles], layout2, { responsive: true });
