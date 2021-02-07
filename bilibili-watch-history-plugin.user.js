// ==UserScript==
// @name         bilibili-watch-history-plugin
// @namespace    https://github.com/putlx/scripts/blob/master/bilibili-watch-history-plugin.user.js
// @version      0.4.1
// @author       putlx
// @downloadURL  https://github.com/putlx/scripts/raw/master/bilibili-watch-history-plugin.user.js
// @updateURL    https://github.com/putlx/scripts/raw/master/bilibili-watch-history-plugin.user.js
// @include      /^https?:\/\/www\.bilibili\.com\/account\/history/
// @require      https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.4.0/dist/worker.sql-wasm.min.js
// @require      https://cdn.jsdelivr.net/npm/echarts@5.0.2/dist/echarts.min.js
// ==/UserScript==

(function () {
    "use strict";

    let panel = document.querySelector("#app > div > div.newlist_info > div")
        .appendChild(document.createElement("div"));
    panel.className = "history-btn";
    panel.style.width = "350px";
    let input = panel.appendChild(document.createElement("a"));
    input.href = "#";
    input.className = "btn";
    input.style.padding = "2px";
    input.innerHTML = '<input type="file" accept=".db">';
    input = input.querySelector("input");
    input.style.width = "150px";
    input.style.fontSize = "inherit";
    input.style.outline = "none";
    let analyze = panel.appendChild(document.createElement("a"));
    analyze.href = "#";
    analyze.className = "btn";
    analyze.innerHTML = "分析记录";
    analyze.setAttribute("style", "color: gray; background-color: white; cursor: not-allowed;");
    let download = panel.appendChild(document.createElement("a"));
    download.href = "#";
    download.className = "btn";
    download.innerHTML = "下载记录";
    let charts = document.querySelector("#app > div").insertBefore(
        document.createElement("div"),
        document.querySelector("#app > div > div.list-contain")
    );
    charts.style.width = "100%";
    charts.style.marginTop = "20px";
    charts.style.display = "none";
    let db;

    initSqlJs({
        locateFile: file => "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.4.0/dist/" + file
    }).then(SQL => {
        input.onchange = function () {
            if (input.files.length) {
                let reader = new FileReader();
                reader.onload = function () {
                    if (db)
                        db.close();
                    db = new SQL.Database(new Uint8Array(reader.result));
                }
                reader.readAsArrayBuffer(input.files[0]);
                analyze.removeAttribute("style");
                download.innerHTML = "更新记录";
            } else {
                download.innerHTML = "下载记录";
            }
        };

        download.onclick = function () {
            let onclick = download.onclick;
            download.onclick = undefined;
            download.setAttribute("style", "color: gray; background-color: white; cursor: wait;");

            let lastTime = 0;
            if (db) {
                lastTime = db.exec("SELECT MAX(t) FROM download")[0].values[0][0];
            } else {
                db = new SQL.Database();
                db.run(`CREATE TABLE types (
                            tid INTEGER PRIMARY KEY,
                            tname TEXT);
                        CREATE TABLE users (
                            mid INTEGER PRIMARY KEY,
                            mname TEXT);
                        CREATE TABLE history (
                            aid INTEGER PRIMARY KEY,
                            mid INTEGER REFERENCES users(mid),
                            tid INTEGER REFERENCES types(tid),
                            progress INTEGER,
                            view_at INTEGER,
                            device INTEGER);
                        CREATE TABLE download (
                            t INTEGER,
                            c INTEGER);`);
                download.innerHTML = "更新记录";
            }

            let failbit = false;
            let count = 0;
            let startTime = parseInt(Date.now() / 1000);

            (function request(i) {
                let xhr = new XMLHttpRequest();
                xhr.open("GET", "https://api.bilibili.com/x/v2/history?pn=" + i + "&ps=20&jsonp=jsonp");
                xhr.withCredentials = true;
                xhr.onload = function () {
                    if (failbit = this.status !== 200) {
                        console.log(xhr);
                        request(i + 1);
                        return;
                    }
                    let response = JSON.parse(this.responseText);
                    let finished = !response.data.length;
                    for (let h of response.data) {
                        if (finished = h.view_at < lastTime)
                            break;
                        db.run("INSERT OR REPLACE INTO types VALUES (?, ?)", [h.tid, h.tname]);
                        db.run("INSERT OR REPLACE INTO users VALUES (?, ?)", [h.owner.mid, h.owner.name]);
                        db.run("INSERT OR REPLACE INTO history VALUES (?, ?, ?, ?, ?, ?)",
                            [h.aid, h.owner.mid, h.tid, h.progress === -1 ? h.duration : h.progress, h.view_at, h.device]
                        );
                        count++;
                    }
                    if (!finished)
                        return request(i + 1);

                    db.run("INSERT INTO download VALUES (?, ?)", [startTime, count]);
                    if (failbit)
                        alert("Fail to fetch some records. See console for details.");

                    let objectURL = window.URL.createObjectURL(new Blob([db.export()]));
                    let a = document.createElement("a");
                    a.href = objectURL;
                    a.download = document.cookie.match(/DedeUserID=(\d+)/)[1] + "-" + startTime + ".db";
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(objectURL);
                    download.onclick = onclick;
                    download.removeAttribute("style");
                    analyze.removeAttribute("style");
                }
                xhr.send();
            })(1);
        };

        analyze.onclick = function () {
            if (!db)
                return;
            let label = document.querySelector("#app > div > div.list-contain > div.label-contain");
            if (label)
                label.remove();
            charts.style.display = "block";
            charts.innerHTML = '<div style="width: 100%; height: 440px;"></div>'.repeat(6);
            const devices = {
                1: "Mobile", 2: "PC",
                3: "Mobile", 4: "Pad",
                5: "Mobile", 6: "Pad",
                7: "Mobile", 33: "TV"
            };
            db.create_function("device_name", device => devices[device] || "Others");
            db.create_function("round", x => parseFloat(x.toFixed(2)));

            let option = {
                title: { left: "center" },
                legend: { data: ["观看时长", "观看视频数量"], top: "6%" },
                tooltip: { trigger: "axis", axisPointer: { type: "cross" } },
                dataset: { dimensions: [null, { name: "观看时长", type: "float" }, { name: "观看视频数量", type: "int" }] },
                xAxis: {
                    type: "category", axisPointer: { type: "shadow" }, axisLabel: {
                        interval: 0, formatter: name => {
                            let lines = [];
                            const maxWidth = 10;
                            function width(s) {
                                let w = 0;
                                for (let i = 0; i < s.length; i++)
                                    w += 1 + (s.codePointAt(i) >= 128);
                                return w;
                            }
                            function addline(s) {
                                if (width(s) >= maxWidth)
                                    for (let c of s)
                                        addline(c);
                                else if (lines.length && width(lines[lines.length - 1]) + width(s) <= maxWidth)
                                    lines[lines.length - 1] += s;
                                else
                                    lines.push(s);
                            }
                            function type(c) {
                                if ((c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122))
                                    return 0;
                                else if (c < 128)
                                    return 1;
                                return 2;
                            }
                            let i = 0;
                            for (let j = 1; j < name.length; j++) {
                                if (type(name.codePointAt(j - 1)) !== type(name.codePointAt(j))) {
                                    addline(name.slice(i, j));
                                    i = j;
                                }
                            }
                            addline(name.slice(i));
                            return lines.join("\n");
                        }
                    }
                },
                yAxis: [{ name: "观看时长", min: 0, axisLabel: { formatter: "{value} h" } }, { name: "观看视频数量", min: 0 }],
                series: [{ type: "bar", barWidth: 20 }, { type: "bar", barWidth: 20, yAxisIndex: 1 }]
            };
            let dataset;
            function create_dataset(sql) {
                dataset = db.exec(sql)[0].values;
                const grid = 8;
                option.yAxis[0].max = Math.max.apply(null, dataset.map(row => row[1]));
                option.yAxis[1].max = Math.max.apply(null, dataset.map(row => row[2]));
                option.yAxis[0].interval = Math.ceil(option.yAxis[0].max / grid);
                option.yAxis[1].interval = Math.ceil(option.yAxis[1].max / grid);
                option.yAxis[0].max = option.yAxis[0].interval * (grid + 1);
                option.yAxis[1].max = option.yAxis[1].interval * (grid + 1);
                return dataset;
            }
            let lastDay = db.exec("SELECT DATE(MAX(t), 'unixepoch', 'localtime') FROM download")[0].values[0][0];

            option.title.text = "视频类型";
            option.dataset.source = create_dataset(
                `SELECT tname, round(CAST(SUM(progress) AS REAL) / 3600) AS t, COUNT(tname)
                FROM history INNER JOIN types ON history.tid = types.tid
                GROUP BY tname ORDER BY t DESC LIMIT 12`);
            let chart = echarts.init(charts.childNodes[0], { renderer: "svg" });
            chart.setOption(option);

            option.title.text = "视频投稿者";
            option.xAxis.triggerEvent = true;
            option.dataset.source = create_dataset(
                `SELECT mname, round(CAST(SUM(progress) AS REAL) / 3600) AS t, COUNT(mname), history.mid
                FROM history INNER JOIN users ON history.mid = users.mid
                GROUP BY history.mid ORDER BY t DESC LIMIT 12`);
            chart = echarts.init(charts.childNodes[1], { renderer: "svg" });
            chart.setOption(option);
            chart.on("click", "series", evt => setUserView(evt.data[3], evt.data[0]));
            chart.on("click", "xAxis", evt => {
                let a = document.createElement("a");
                a.href = "https://space.bilibili.com/" + dataset[parseInt(evt.event.topTarget.anid.split("_")[1])][3];
                a.target = "_blank";
                document.body.appendChild(a);
                a.click();
                a.remove();
            });
            delete option.xAxis.triggerEvent;

            option.title.text = "观看时间";
            delete option.legend;
            delete option.xAxis.axisLabel.formatter;
            delete option.xAxis.axisLabel.interval;
            option.yAxis = option.yAxis[0];
            delete option.yAxis.max;
            delete option.yAxis.interval;
            option.series = option.series[0];
            option.series.barWidth = 17;
            option.dataset.source = db.exec(
                `SELECT STRFTIME('%H:00', view_at, 'unixepoch', 'localtime') AS t,
                round(CAST(SUM(progress) AS REAL) / 3600)
                FROM history GROUP BY t ORDER BY t`)[0].values;
            chart = echarts.init(charts.childNodes[4], { renderer: "svg" });
            chart.setOption(option);

            option = {
                tooltip: { trigger: "axis", axisPointer: { type: "cross" } },
                title: { left: "center" },
                dataset: {},
                xAxis: [{ type: "time" }],
                yAxis: [{ name: "观看时长", axisLabel: { formatter: "{value} h" } }],
                series: [{ type: "bar" }]
            };
            let userView = echarts.init(charts.childNodes[2], { renderer: "svg" });
            function setUserView(mid, manme) {
                option.title.text = manme + " 的视频的观看时长";
                option.title.subtext = "点击上方统计表的柱条来切换投稿者";
                option.dataset.source = db.exec(
                    `SELECT DATE(view_at, 'unixepoch', 'localtime') AS t,
                    round(CAST(SUM(progress) AS REAL) / 3600)
                    FROM history WHERE mid = '${mid}' GROUP BY t`)[0].values;
                if (!option.dataset.source.some(data => data[0] === lastDay))
                    option.dataset.source.push([lastDay, 0]);
                userView.setOption(option);
                delete option.title.subtext;
            }
            setUserView(dataset[0][3], dataset[0][0]);

            chart = echarts.init(charts.childNodes[3], { renderer: "svg" });
            chart.setOption({
                title: { text: "观看设备", left: "center" },
                tooltip: {
                    trigger: "item", formatter: para => `观看时长<br>${para.name} : ${para.value[1]} h (${para.percent}%)`
                },
                dataset: {
                    source: db.exec(
                        `SELECT device_name(device) AS h,
                        round(CAST(SUM(progress) AS REAL) / 3600) AS t
                        FROM history GROUP BY h ORDER BY t`)[0].values
                },
                series: [{ name: "观看时长", type: "pie", roseType: "radius" }]
            });

            option.title.text = "观看日期";
            option.dataset.source = db.exec(
                `SELECT DATE(view_at, 'unixepoch', 'localtime') AS t,
                round(CAST(SUM(progress) AS REAL) / 3600)
                FROM history GROUP BY t`)[0].values;
            if (!option.dataset.source.some(data => data[0] === lastDay))
                option.dataset.source.push([lastDay, 0]);
            chart = echarts.init(charts.childNodes[5], { renderer: "svg" });
            chart.setOption(option);
        };
    });
})();
