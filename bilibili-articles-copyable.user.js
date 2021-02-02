// ==UserScript==
// @name         bilibili-articles-copyable
// @namespace    https://github.com/putlx/scripts/blob/master/bilibili-articles-copyable.user.js
// @version      0.1.1
// @author       putlx
// @downloadURL  https://github.com/putlx/scripts/raw/master/bilibili-articles-copyable.user.js
// @updateURL    https://github.com/putlx/scripts/raw/master/bilibili-articles-copyable.user.js
// @include      /^https?:\/\/www\.bilibili\.com\/read/
// ==/UserScript==

(function () {
    "use strict";

    window.addEventListener("load", function () {
        let article = document.getElementsByClassName("article-holder unable-reprint");
        if (article.length) {
            article[0].className = "article-holder";
        }
    });
})();
