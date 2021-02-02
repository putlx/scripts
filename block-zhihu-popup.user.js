// ==UserScript==
// @name         block-zhihu-popup
// @namespace    https://github.com/putlx/scripts/blob/master/block-zhihu-popup.user.js
// @version      0.1.2
// @author       putlx
// @downloadURL  https://github.com/putlx/scripts/raw/master/block-zhihu-popup.user.js
// @updateURL    https://github.com/putlx/scripts/raw/master/block-zhihu-popup.user.js
// @include      /^https?:\/\/www\.zhihu\.com/
// ==/UserScript==

(function () {
    "use strict";

    document.body.addEventListener("DOMNodeInserted", function () {
        let close = document.getElementsByClassName('Modal-wrapper undefined Modal-enter-done');
        if (close.length) {
            close[0].remove();
            document.body.parentElement.style.overflow = "auto";
        }
    });

    let adblockBanner = document.getElementsByClassName("AdblockBanner");
    if (adblockBanner.length) {
        adblockBanner[0].remove();
    }
})();
