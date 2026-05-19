const plasticRecycling2023 = {
  dimension: {
    Geo: {
      category: {
        index: {
          "Belgien": 0,
          "Lettland": 1,
          "Slovakien": 2,
          "Tjeckien": 3,
          "Tyskland": 4,
          "Slovenien": 5,
          "Nederländerna": 6,
          "Italien": 7,
          "Polen": 8,
          "Spanien": 9,
          "Litauen": 10,
          "Estland": 11,
          "Portugal": 12,
          "Luxemburg": 13,
          "Malta": 14,
          "Grekland": 15,
          "Irland": 16,
          "Finland": 17,
          "Sverige": 18,
          "Kroatien": 19,
          "Danmark": 20,
          "Österrike": 21,
          "Frankrike": 22,
          "Ungern": 23
        }
      }
    }
  },
  value: [
    59.5, 59.2, 54.1, 52.4, 52.2, 51.5,
    49.1, 49.0, 46.3, 46.2, 42.9, 42.4,
    39.5, 38.8, 35.6, 32.7, 29.6, 29.3,
    28.6, 28.2, 27.8, 26.9, 25.7, 23.0
  ]
};

const population2023 = {
  value: [
    11742696, 1883008, 5428792, 10827529,
    84358845, 2116972, 17811291, 58997201,
    36753736, 48085361, 2857279, 1365884,
    10467366, 660809, 542051, 10413982,
    5060004, 5563970, 10521556, 3871833,
    5932654, 9104772, 68042591, 9599744
  ]
};

const iso3 = {
  "Belgien": "BEL",
  "Lettland": "LVA",
  "Slovakien": "SVK",
  "Tjeckien": "CZE",
  "Tyskland": "DEU",
  "Slovenien": "SVN",
  "Nederländerna": "NLD",
  "Italien": "ITA",
  "Polen": "POL",
  "Spanien": "ESP",
  "Litauen": "LTU",
  "Estland": "EST",
  "Portugal": "PRT",
  "Luxemburg": "LUX",
  "Malta": "MLT",
  "Grekland": "GRC",
  "Irland": "IRL",
  "Finland": "FIN",
  "Sverige": "SWE",
  "Kroatien": "HRV",
  "Danmark": "DNK",
  "Österrike": "AUT",
  "Frankrike": "FRA",
  "Ungern": "HUN"
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
  SWE: [62.0, 15.0],
  HRV: [45.1, 15.2],
  DNK: [56.0, 9.5],
  AUT: [47.5, 14.6],
  FRA: [46.2, 2.2],
  HUN: [47.1, 19.5]
};

const countries = Object.keys(plasticRecycling2023.dimension.Geo.category.index);

const locations = countries.map(c => iso3[c]);
const values = plasticRecycling2023.value;
const pops = population2023.value;

const lat = locations.map(code => coords[code][0]);
const lon = locations.map(code => coords[code][1]);

// 1. Choropleth (färg)
const choropleth = {
  type: "choropleth",
  locationmode: "ISO-3",
  locations,
  z: values,
  text: countries,
  colorscale: "Blues",
  colorbar: {
    title: "Återvinningsgrad (%)"
  }
};

// 2. Bubblor (population)
const bubbles = {
  type: "scattergeo",
  lat,
  lon,
  text: countries.map((c, i) =>
    `${c}<br>Återvinning: ${values[i]}%<br>Population: ${pops[i].toLocaleString()}`
  ),
  mode: "markers",
  marker: {
    size: pops.map(p => Math.sqrt(p) / 500), // skala ner annars blir det kaos
    color: "rgba(0,0,255,0.4)",
    line: { width: 1 }
  }
};

const layout = {
  title: "Europa: Plaståtervinning (färg) + Population (bubblor) 2023",
  geo: {
    scope: "europe",
    projection: { type: "natural earth" }
  }
};

Plotly.newPlot("plot", [choropleth, bubbles], layout);