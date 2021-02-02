// ==UserScript==
// @name         bangumi-subject-title-remove-hyperlink
// @namespace    https://github.com/putlx/scripts/blob/master/bangumi-subject-title-remove-hyperlink.user.js
// @version      0.2.1
// @author       putlx
// @downloadURL  https://github.com/putlx/scripts/raw/master/bangumi-subject-title-remove-hyperlink.user.js
// @updateURL    https://github.com/putlx/scripts/raw/master/bangumi-subject-title-remove-hyperlink.user.js
// @include      /^https?:\/\/(bgm\.tv|bangumi\.tv|chii\.in)\/(subject|ep)\/\d+/
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    "use strict";

    document.querySelector("#headerSubject > h1 > a").removeAttribute("href");
})();

GM_addStyle(`
html[data-theme="light"] #headerSubject h1 a,
html[data-theme="light"] #headerSubject h1 a:hover {
    color: #444
}
html[data-theme="dark"] #headerSubject h1 a,
html[data-theme="dark"] #headerSubject h1 a:hover {
    color: #FFF
}
`);
