import lazyframe from "./lazyframe";

function initOnDomReady(){
    lazyframe('.lazyframe', {
        apikey: 'AIzaSyDQxRfx3HQrE0_oTFI2WHzoiGL_CM0JJfQ' // Sorry, will only work on this domain
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
