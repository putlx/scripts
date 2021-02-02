// ==UserScript==
// @name         bangumi-colorful-tags
// @namespace    https://github.com/putlx/scripts/blob/master/bangumi-colorful-tags.user.js
// @version      0.5.0
// @author       putlx
// @downloadURL  https://github.com/putlx/scripts/raw/master/bangumi-colorful-tags.user.js
// @updateURL    https://github.com/putlx/scripts/raw/master/bangumi-colorful-tags.user.js
// @include      /^https?:\/\/(bgm\.tv|bangumi\.tv|chii\.in)\/subject\/\d+$/
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    "use strict";

    for (let tag of document.querySelectorAll("#subject_detail > div.subject_tag_section > div > a")) {
        let count = tag.querySelector("small");
        let level = Math.min(Math.round(parseInt(count.innerText) / 70), 5);
        count.className = "";
        tag.className += " v" + level;
    }
})();

GM_addStyle(`
html[data-theme] div.subject_tag_section a.v0 {
    color: #f8f9fa;
    background-color: #adb5bd;
    border-color: #adb5bd;
}
html[data-theme] div.subject_tag_section a.v0:hover,
html[data-theme] div.subject_tag_section a.v0:hover small {
    color: #adb5bd;
    background-color: #f8f9fa;
}
html[data-theme] div.subject_tag_section a.v1 {
    color: #e7f5ff;
    background-color: #4dabf7;
    border-color: #4dabf7;
}
html[data-theme] div.subject_tag_section a.v1:hover,
html[data-theme] div.subject_tag_section a.v1:hover small {
    color: #4dabf7;
    background-color: #e7f5ff;
}
html[data-theme] div.subject_tag_section a.v2 {
    color: #ebfbee;
    background-color: #38d9a9;
    border-color: #38d9a9;
}
html[data-theme] div.subject_tag_section a.v2:hover,
html[data-theme] div.subject_tag_section a.v2:hover small {
    color: #38d9a9;
    background-color: #ebfbee;
}
html[data-theme] div.subject_tag_section a.v3 {
    color: #fff4e6;
    background-color: #ffa94d;
    border-color: #ffa94d;
}
html[data-theme] div.subject_tag_section a.v3:hover,
html[data-theme] div.subject_tag_section a.v3:hover small {
    color: #ffa94d;
    background-color: #fff4e6;
}
html[data-theme] div.subject_tag_section a.v4 {
    color: #fff5f5;
    background-color: #ff8787;
    border-color: #ff8787;
}
html[data-theme] div.subject_tag_section a.v4:hover,
html[data-theme] div.subject_tag_section a.v4:hover small {
    color: #ff8787;
    background-color: #fff5f5;
}
html[data-theme] div.subject_tag_section a.v5 {
    color: #f8f0fc;
    background-color: #da77f2;
    border-color: #da77f2;
}
html[data-theme] div.subject_tag_section a.v5:hover,
html[data-theme] div.subject_tag_section a.v5:hover small {
    color: #da77f2;
    background-color: #f8f0fc;
}
`);
