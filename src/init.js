import lazyframe from "./lazyframe.js";

function initOnDomReady() {
  lazyframe('.lazyframe');
}

if (
  document.readyState === "complete" ||
  (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
  initOnDomReady();
} else {
  document.addEventListener("DOMContentLoaded", initOnDomReady);
}
