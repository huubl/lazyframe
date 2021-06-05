import lazyframe from "./lazyframe";

function initOnDomReady(){
  lazyframe('.lazyframe', {
        apikey: 'AIzaSyBGhYjnaop5mqT-IO_q3--OCrUhgopW_XQ' // Sorry, will only work on this domain
    });
}

if (
    document.readyState === "complete" ||
    (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
    initOnDomReady();
} else {
    document.addEventListener("DOMContentLoaded", initOnDomReady);
}
