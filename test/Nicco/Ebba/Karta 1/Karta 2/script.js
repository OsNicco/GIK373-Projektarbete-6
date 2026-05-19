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
  const valueArray = Array.isArray(values) ? values : Object.values(values);

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
  BE: "BEL", LV: "LVA", SK: "SVK", CZ: "CZE",
  DE: "DEU", SI: "SVN", NL: "NLD", IT: "ITA",
  PL: "POL", ES: "ESP", LT: "LTU", EE: "EST",
  PT: "PRT", LU: "LUX", MT: "MLT", EL: "GRC",
  IE: "IRL", FI: "FIN", SE: "SWE", HR: "HRV",
  DK: "DNK", AT: "AUT", FR: "FRA", HU: "HUN"
};

// =========================
// MAIN
// =========================
async function loadData() {
  try {
    // =========================
    // FETCH DATA (endast återvinning)
    // =========================
    const plasticRaw = await fetchEurostat("env_waspacr");
    const plasticParsed = parseEurostatJSONStat(plasticRaw);

    const countries = plasticParsed.countries;
    const years = plasticParsed.years;

    // =========================
    // BUILD ROWS
    // =========================
    const rows = [];

    for (const c of countries) {
      for (let i = 0; i < years.length; i++) {
        rows.push({
          country: iso3[c] || c,
          year: years[i],
          recycling: plasticParsed.result[c][i]
        });
      }
    }

    function getYearData(year) {
      return rows.filter(r => r.year === year);
    }

    // =========================
    // INITIAL YEAR
    // =========================
    const initialYear = years[0];
    const initial = getYearData(initialYear);

    const customGreens = [
  [0, "#e6f4ef"],   // mycket ljus mint/grön
  [0.2, "#b7e0d3"],
  [0.4, "#7fc7b0"],
  [0.6, "#3aa486"],
  [0.8, "#0b6f58"],
  [1, "#007353"]    // din huvudfärg
];

    const trace = {
      type: "choropleth",
      locationmode: "ISO-3",
      locations: initial.map(r => r.country),
      z: initial.map(r => r.recycling),
      colorscale: customGreens,
      zmin: 0,
      zmax: 80,
      colorbar: { title: "Återvinning %" }
    };

    // =========================
    // FRAMES
    // =========================
    const frames = years.map(y => {
      const d = getYearData(y);

      return {
        name: y,
        data: [{
          locations: d.map(r => r.country),
          z: d.map(r => r.recycling)
        }]
      };
    });

    // =========================
    // LAYOUT
    // =========================
    const layout = {
      title: "Förpackningsavfall i Europa 1997–2023",
      geo: { scope: "europe" },

      sliders: [{
        steps: years.map(y => ({
          label: y,
          method: "animate",
          args: [[y], {
            mode: "immediate",
            frame: { duration: 1000 },
            transition: { duration: 700 }
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
              frame: { duration: 1000 },
              transition: { duration: 700 }
            }]
          },
          {
            label: "Pause",
            method: "animate",
            args: [[null], { mode: "immediate" }]
          }
        ]
      }]
    };

    // =========================
    // RENDER
    // =========================
    await Plotly.newPlot("plot", [trace], layout);
    Plotly.addFrames("plot", frames);

  } catch (err) {
    console.error("Error loading data:", err);
  }
}

// START
loadData();


