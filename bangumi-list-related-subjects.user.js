// ==UserScript==
// @name         bangumi-list-related-subjects
// @namespace    https://github.com/putlx/scripts/blob/master/bangumi-list-related-subjects.user.js
// @version      0.1.4
// @author       putlx
// @downloadURL  https://github.com/putlx/scripts/raw/master/bangumi-list-related-subjects.user.js
// @updateURL    https://github.com/putlx/scripts/raw/master/bangumi-list-related-subjects.user.js
// @include      /^https?:\/\/(bgm\.tv|bangumi\.tv|chii\.in)\/subject\/\d+$/
// ==/UserScript==

(function () {
    "use strict";

    let relatedSubjects;
    for (let section of document.querySelectorAll("#columnSubjectHomeB > div"))
        if (relatedSubjects = section.querySelector("div.content_inner > ul"))
            break;
    if (!relatedSubjects)
        return;

    relatedSubjects.className = "line_list line_list_music";
    let preview = document.createElement("div");
    preview.style.display = "none";
    preview.style.position = "absolute";
    document.body.appendChild(preview);

    for (let i = 0, c = 0; i < relatedSubjects.children.length; ++i, ++c) {
        let subject = relatedSubjects.children[i];
        let prefix = subject.querySelector(".sub");
        if (subject.className === "sep") {
            c = 1;
            let type = document.createElement("li");
            type.innerText = prefix.innerText;
            type.className = "cat";
            relatedSubjects.insertBefore(type, subject);
            ++i;
        }
        subject.className = c % 2 ? "line_odd" : "line_even";
        prefix.innerText = c;
        prefix.style.color = "#666666";

        subject.querySelector(".avatar").style.display = "none";
        let title = subject.querySelector(".title");
        title.addEventListener("mouseover", evt => {
            preview.style.display = "block";
            preview.innerHTML = evt.target.parentElement.querySelector(".avatar").innerHTML;
            preview.style.left = evt.target.offsetWidth + evt.target.offsetLeft + 5 + "px";
            preview.style.top = evt.target.offsetTop + evt.target.offsetHeight - 75 + "px";
        });
        title.addEventListener("mouseout", () => {
            preview.style.display = "none";
        });
    }
})();
