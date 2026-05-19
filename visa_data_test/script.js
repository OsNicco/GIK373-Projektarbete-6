const urlSCB =
  "https://api.scb.se/OV0104/v1/doris/sv/ssd/START/BE/BE0101/BE0101A/BefolkningNy";

const querySCB = {
  query: [
    {
      code: "Region",
      selection: {
        filter: "vs:RegionKommun07",
        values: [
          "0120",
          "2021",
          "2023",
          "2026",
          "2029",
          "2031",
          "2034",
          "2039",
          "2061",
          "2062",
          "2080",
          "2081",
          "2082",
          "2083",
          "2084",
          "2085",
        ],
      },
    },
    {
      code: "ContentsCode",
      selection: {
        filter: "item",
        values: ["BE0101N1"],
      },
    },
    {
      code: "Tid",
      selection: {
        filter: "item",
        values: [
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
        ],
      },
    },
  ],
  response: {
    format: "json",
  },
};

const request = new Request(urlSCB, {
  method: "POST",
  body: JSON.stringify(querySCB),
});

fetch(request)
  .then((response) => response.json())
  .then((data) => printSCBChart(data));

function printSCBChart(dataSCB) {
  // lägg in all data i ett diagram
  console.log(dataSCB);

  const years = dataSCB.data.splice(0, 10);
  console.log(years);

  const labels = years.map((year) => year.key[1]);
  console.log(labels);

  const data = years.map((year) => year.values[0]);
  console.log(data);

  const dataset = [
    {
      label: "Befolkning per år i Vansbro",
      data,
      borderWidth: 2,
      borderColor: "hsla(250, 100%, 30%, 1)",
      hoverBorderWidth: 4,
    },
  ];

  new Chart(document.getElementById("scb"), {
    type: "bar",
    data: { labels, datasets: dataset },
  });
}

const urlUN =
  "https://unstats.un.org/SDGAPI/v1/sdg/DataAvailability/GetIndicatorsAllCountries";

const requestUN = new Request(urlUN, {
  method: "POST",
  body: "dataPointType=1&countryId=0&natureOfData=all",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
});

fetch(requestUN)
  .then((response) => response.json())
  .then((data) => printUNChart(data));

function printUNChart(dataUN) {
  console.log(dataUN);
  const indicators = dataUN[6].indicators;
  console.log(indicators);

  const labels = indicators.map((indicator) => indicator.code);
  console.log(labels);

  const data = indicators.map((indicator) => indicator.percentage);
  console.log(data);

  const datasets = [{ label: "Uppfyllnad per indikator för mål 7 (%)", data }];

  new Chart(document.getElementById("un"), {
    type: "bar",
    data: { labels, datasets },
  });
}
