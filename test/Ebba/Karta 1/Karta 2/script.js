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