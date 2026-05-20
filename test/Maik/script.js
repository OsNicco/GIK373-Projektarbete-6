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
  70: 15,
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

    const färger = filtered.map((d) => {
      const item = FÖRPACKNINGAR.find((f) => f.kod === d.key[0]);
      return item ? item.color : "#000000";
    });

    new Chart(document.getElementById("scb"), {
      type: "bar",
      data: {
        labels: labels,
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
            callbacks: {
              label: (ctx) => `${ctx.raw} %`,
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
