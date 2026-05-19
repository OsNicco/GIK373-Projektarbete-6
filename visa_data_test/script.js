const urlSCB =
  "https://api.scb.se/OV0104/v1/doris/sv/ssd/START/MI/MI0307/MI0307T2N";

const querySCB = {
  query: [
    {
      code: "ContentsCode",
      selection: {
        filter: "item",
        values: ["0000047A", "00000479", "00000478"],
      },
    },
  ],
  response: {
    format: "json",
  },
};

const request = new Request(urlSCB, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(querySCB),
});

fetch(request)
  .then((response) => response.json())
  .then((data) => printSCBChart(data));

function printSCBChart(dataSCB) {
  console.log(dataSCB);

  // labels från key
  const labels = dataSCB.data.map((item) => item.key[0]);

  console.log(labels);

  // värden
  const data = dataSCB.data.map((item) => Number(item.values[0]));

  console.log(data);

  const dataset = [
    {
      label: "Miljöstatistik",
      data,
      borderWidth: 2,
      backgroundColor: [
        "rgba(54, 162, 235, 0.6)",
        "rgba(255, 99, 132, 0.6)",
        "rgba(75, 192, 192, 0.6)",
      ],
    },
  ];

  new Chart(document.getElementById("scb"), {
    type: "bar",
    data: {
      labels,
      datasets: dataset,
    },
  });
}
