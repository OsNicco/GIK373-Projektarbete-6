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
  10: 90, // Glas
  25: 50, // Plast
  35: 90, // PET-flaskor med pant
  40: 85, // Papper
  45: 70, // Järn
  55: 50, // Aluminium
  65: 90, // Pantburkar
  70: 15, // Trä
};

fetch(urlSCB, { method: "POST", body: JSON.stringify(querySCB) })
  .then((r) => r.json())
  .then((data) => {
    const filtered = data.data.filter((d) => d.key[0] !== "99");
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

    new Chart(document.getElementById("scb"), {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Materialåtervinning 2024 (%)",
            data: values,
            backgroundColor: "rgba(0, 115, 83, 0.6)",
            borderColor: "rgba(0, 115, 83, 1)",
            borderWidth: 2,
          },
          {
            label: "Mål (%)",
            data: goalValues,
            backgroundColor: "rgba(198, 196, 255, 0.4)",
            borderColor: "rgba(177, 169, 255, 0.8)",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.raw.toLocaleString()} %`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: (value) => `${value}%`,
            },
          },
        },
      },
    });
  });
