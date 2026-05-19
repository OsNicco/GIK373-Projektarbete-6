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

// ============================================================================================================================= //

const RecyUrl =
  "https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/dataflow/ESTAT/env_waspacr$defaultview/1.0?references=descendants&detail=referencepartial";

const test = await fetch(RecyUrl).then((response) => response.json());
console.log(test);
