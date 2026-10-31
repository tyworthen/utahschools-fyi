/* Tooele School Finance — shared layout, formatting, and chart components */
(function () {
  "use strict";
  var D = window.TSF;

  var NAV = [
    ["finances.html", "Finances"],
    ["taxes.html", "Taxes"],
    ["spending.html", "Spending"],
    ["compare.html", "Compare"],
    ["schools.html", "Schools"],
    ["research.html", "Research"],
    ["about.html", "About"]
  ];

  var SEARCH_INDEX = [
    ["index.html", "Home", "Follow the money: overview and key figures"],
    ["finances.html", "Finances", "Revenue, expenditures, funds, budget vs. actual"],
    ["finances.html#revenue", "Where does the money come from?", "Local, state, and federal revenue"],
    ["finances.html#debt", "Debt & Bonds", "Outstanding principal, debt service, bond timeline"],
    ["taxes.html", "Taxes", "How Utah school property taxes work"],
    ["taxes.html#calculator", "Taxpayer calculator", "What does the school district cost me?"],
    ["spending.html", "Where the money goes", "$100 of district spending by category"],
    ["compare.html", "Compare districts", "Tooele, Iron, Cache, and Box Elder"],
    ["schools.html", "Schools", "School-level profiles (planned)"],
    ["research.html", "Research & Investigations", "Questions, investigations, and audit findings"],
    ["research.html#audits", "Audits & reviews", "2025 legislative audit, purchase-card review"],
    ["research.html#template", "How investigations are written", "Investigation page structure"],
    ["data.html", "Data Explorer", "Filter, view, and download datasets"],
    ["methodology.html", "Methodology", "Evidence standards, calculations, inflation"],
    ["methodology.html#labels", "Fact, calculation, interpretation, hypothesis, opinion", "How claims are labeled"],
    ["sources.html", "Sources", "Source registry with evidence tiers"],
    ["about.html", "About", "Mission, independence, neutrality"],
    ["about.html#contact", "Contact & updates", "Get in touch or get updates"]
  ];

  var ICON = {
    search: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    menu: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    question: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4.5"/><circle cx="12" cy="17.5" r=".6" fill="currentColor"/></svg>',
    flag: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4h11l-2 4 2 4H5"/></svg>'
  };

  /* ---------- Formatting ---------- */
  function fmt(v, unit) {
    if (v === null || v === undefined || isNaN(v)) return null;
    switch (unit) {
      case "money":
        if (Math.abs(v) >= 1e9) return "$" + (v / 1e9).toFixed(2) + "B";
        if (Math.abs(v) >= 1e6) return "$" + (v / 1e6).toFixed(1) + "M";
        return "$" + Math.round(v).toLocaleString("en-US");
      case "dollars": return "$" + Math.round(v).toLocaleString("en-US");
      case "percent": return v.toFixed(1) + "%";
      case "ratio": return v.toFixed(1);
      case "rate": return v.toFixed(6);
      default: return Math.round(v).toLocaleString("en-US");
    }
  }
  function pct(a, b) {
    if (a == null || b == null || b === 0) return null;
    var p = (a / b - 1) * 100;
    return (p >= 0 ? "+" : "−") + Math.abs(p).toFixed(1) + "%";
  }
  function source(id) {
    for (var i = 0; i < D.sources.length; i++) if (D.sources[i].id === id) return D.sources[i];
    return null;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function monthYear(iso) {
    var d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }
  function sourceLine(srcId, extra) {
    var s = source(srcId);
    var src = s ? '<a href="' + esc(s.url) + '" rel="noopener">' + esc(s.publisher) + " — " + esc(s.name) + "</a>" : "See sources";
    return '<p class="source-line"><strong>Source:</strong> ' + src + "; analysis by Tooele School Finance. " +
      (extra ? esc(extra) + " " : "") + "Updated " + monthYear(D.updated) + '. <a href="methodology.html">Methodology</a></p>';
  }
  var PENDING = '<span class="dot-pending" aria-hidden="true"></span>Pending';
  function emptyState(title, msg) {
    return '<div class="empty-state" role="note"><strong>' + esc(title) + "</strong><p>" + msg + "</p></div>";
  }

  /* ---------- Layout ---------- */
  function header() {
    var here = location.pathname.split("/").pop() || "index.html";
    var links = NAV.map(function (n) {
      return '<a href="' + n[0] + '"' + (n[0] === here ? ' aria-current="page"' : "") + ">" + n[1] + "</a>";
    }).join("");
    return '<a class="skip" href="#main">Skip to content</a>' +
      '<header class="site-header"><div class="wrap">' +
      '<a class="brand" href="index.html" aria-label="Tooele School Finance home"><img src="assets/logo-light.png" alt="Tooele Schools — Data, Insights, A Stronger Community" width="745" height="251"></a>' +
      '<nav class="nav" id="site-nav" aria-label="Main">' + links + "</nav>" +
      '<div class="header-tools">' +
      '<button class="search-btn" type="button" data-open-search aria-label="Search the site">' + ICON.search + '<span class="label">Search</span></button>' +
      '<a class="btn btn-primary btn-sm btn-updates" href="about.html#contact">Get Updates</a>' +
      '<button class="search-btn menu-btn" type="button" aria-expanded="false" aria-controls="site-nav">' + ICON.menu + '<span class="label">Menu</span></button>' +
      "</div></div></header>";
  }
  function footer() {
    return '<footer class="site-footer"><div class="wrap">' +
      '<div class="top"><div><img src="assets/logo-light.png" alt="" width="745" height="251">' +
      '<p class="fname">Tooele School Finance</p><p>Independent financial research for Tooele County taxpayers.</p>' +
      '<p class="updated" style="color:#94A3B8">Data last updated ' + monthYear(D.updated) + "</p></div>" +
      '<div><h2>Project</h2><ul><li><a href="methodology.html">Methodology</a></li><li><a href="sources.html">Sources</a></li><li><a href="data.html">Data</a></li><li><a href="about.html">About</a></li><li><a href="about.html#contact">Contact</a></li></ul></div>' +
      '<div><h2>Explore</h2><ul><li><a href="finances.html">Finances</a></li><li><a href="taxes.html">Taxes</a></li><li><a href="spending.html">Spending</a></li><li><a href="compare.html">Compare</a></li><li><a href="research.html">Research</a></li></ul></div></div>' +
      '<p class="disclaimer">This project is independent of Tooele County School District and is not affiliated with the district or the Utah State Board of Education. It does not endorse or oppose any candidate, party, ballot measure, tax, or bond.</p>' +
      "</div></footer>";
  }
  function searchDialog() {
    var dlg = document.createElement("dialog");
    dlg.className = "search";
    dlg.setAttribute("aria-label", "Search");
    dlg.innerHTML = '<div class="sbox">' + ICON.search + '<label for="q" class="sr-only">Search the site</label><input id="q" type="search" placeholder="Search topics, datasets, questions…" autocomplete="off"><button class="close" type="button">Esc</button></div><ul role="list"></ul>';
    document.body.appendChild(dlg);
    var input = dlg.querySelector("input"), list = dlg.querySelector("ul");
    function render() {
      var q = input.value.trim().toLowerCase();
      var hits = SEARCH_INDEX.filter(function (r) { return !q || (r[1] + " " + r[2]).toLowerCase().indexOf(q) >= 0; });
      list.innerHTML = hits.length ? hits.map(function (r) {
        return '<li><a href="' + r[0] + '">' + esc(r[1]) + "<small>" + esc(r[2]) + "</small></a></li>";
      }).join("") : '<li class="muted" style="padding:12px">No matches.</li>';
    }
    input.addEventListener("input", render);
    dlg.querySelector(".close").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-open-search]")) { render(); dlg.showModal(); input.focus(); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && !/input|select|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); render(); dlg.showModal(); input.focus(); }
    });
  }

  /* ---------- Components ---------- */
  function qwa(text, meta) {
    return '<aside class="qwa"><div class="qwa-label">' + ICON.question + "Question worth asking</div><p>" + text + "</p>" +
      (meta ? '<div class="qwa-meta">' + meta + "</div>" : "") + "</aside>";
  }

  function renderKPIs(el) {
    el.innerHTML = D.kpis.map(function (k) {
      var v = fmt(k.value, k.format);
      var s = source(k.source);
      return '<div class="kpi"><span class="label">' + esc(k.label) + "</span>" +
        (v ? '<span class="value">' + v + "</span>" : '<span class="value pending" title="Awaiting verified source data">' + PENDING + "</span>") +
        '<span class="note"' + (s ? ' title="Source: ' + esc(s.publisher) + '"' : "") + ">" + esc(k.note) + "</span>" +
        '<a href="' + k.href + '">View history →</a></div>';
    }).join("");
  }

  var CAT_COLORS = ["#FACC15", "#93C5FD", "#5EEAD4", "#C4B5FD", "#FDBA74", "#86EFAC", "#F9A8D4", "#CBD5E1"];

  function renderHundred(el, opts) {
    opts = opts || {};
    var cats = D.spending.categories;
    var total = cats.reduce(function (a, c) { return a + (c.amount || 0); }, 0);
    var complete = cats.every(function (c) { return c.amount != null; });
    var html = "";
    if (complete && total > 0) {
      html += '<div class="hundred" role="img" aria-label="Of every $100 the district spends: ' +
        cats.map(function (c) { return c.label + " $" + (c.amount / total * 100).toFixed(2); }).join(", ") + '">' +
        cats.map(function (c, i) {
          var share = c.amount / total * 100;
          return '<a href="spending.html#' + c.id + '" style="flex:' + share + ";background:" + CAT_COLORS[i] + '" title="' + esc(c.label) + ": $" + share.toFixed(2) + '">' + (share >= 7 ? "$" + share.toFixed(0) : "") + "</a>";
        }).join("") + "</div>";
    } else {
      html += emptyState("FY" + D.spending.fy + " category totals not yet entered",
        "This chart will divide a typical $100 of district spending into the categories below once each total has been taken from the State Auditor’s standardized expenditure data and checked against the district’s audited financial statements.");
    }
    html += '<div class="cat-list">' + cats.map(function (c, i) {
      var share = complete && total ? "$" + (c.amount / total * 100).toFixed(2) : null;
      return '<a class="cat-item" href="spending.html#' + c.id + '"><span class="sw" style="background:' + CAT_COLORS[i] + '"></span><span><span class="nm">' + esc(c.label) + "</span><br>" +
        (share ? '<span class="amt">' + share + '</span><span class="muted" style="font-size:13px"> of $100</span>' : '<span class="amt pending">Pending</span>') + "</span></a>";
    }).join("") + "</div>";
    html += sourceLine(D.spending.source, "Basis: " + D.spending.basis + ", FY" + D.spending.fy + ", nominal dollars.");
    el.innerHTML = html;
  }

  function seriesFor(metricId, district) {
    var m = D.metrics[metricId];
    var vals = (m.values && m.values[district]) || {};
    return D.years.map(function (y) { return vals[y] != null ? vals[y] : null; });
  }
  function latest(metricId, district) {
    var s = seriesFor(metricId, district);
    for (var i = s.length - 1; i >= 0; i--) if (s[i] != null) return { year: D.years[i], value: s[i], index: i };
    return null;
  }
  function earliest(metricId, district) {
    var s = seriesFor(metricId, district);
    for (var i = 0; i < s.length; i++) if (s[i] != null) return { year: D.years[i], value: s[i] };
    return null;
  }

  function renderDistrictCards(el, metricId, year) {
    var m = D.metrics[metricId];
    el.innerHTML = Object.keys(D.districts).map(function (k) {
      var d = D.districts[k];
      var cur = year ? (function () { var v = (m.values[k] || {})[year]; return v != null ? { year: year, value: v } : null; })() : latest(metricId, k);
      var first = earliest(metricId, k);
      var chg = cur && first && first.year !== cur.year ? pct(cur.value, first.value) + " since FY" + first.year : null;
      return '<div class="district-card" style="--c:' + d.color + '"><div class="dname"><h3>' + esc(d.name) + '</h3><span class="role">' + d.role + "</span></div>" +
        (cur ? '<div class="dval">' + fmt(cur.value, m.unit) + '</div><div class="dchg">FY' + cur.year + (chg ? " · " + chg : "") + "</div>"
             : '<div class="dval pending">' + PENDING + '</div><div class="dchg">' + esc(m.label) + (year ? ", FY" + year : "") + "</div>") +
        "</div>";
    }).join("");
  }

  /* Line chart: all four districts, y-axis always starts at zero. */
  function lineChart(el, metricId, opts) {
    opts = opts || {};
    var m = D.metrics[metricId];
    var keys = Object.keys(D.districts);
    var series = keys.map(function (k) { return { k: k, d: D.districts[k], v: seriesFor(metricId, k) }; });
    var all = [];
    series.forEach(function (s) { s.v.forEach(function (x) { if (x != null) all.push(x); }); });
    var title = '<p class="chart-title">' + esc(m.label) + ", FY" + D.years[0] + "–FY" + D.years[D.years.length - 1] + '</p><p class="chart-sub">' + esc(m.basis) + ". Fiscal years end June 30.</p>";
    if (!all.length) {
      el.innerHTML = title + emptyState("No verified values entered yet",
        "When figures are added for Tooele, Iron, Cache, and Box Elder, they will be drawn here on a shared scale that starts at zero. Calculation: " + esc(m.calc)) +
        sourceLine(m.source);
      return;
    }
    var W = 760, H = 380, L = 72, R = 96, T = 20, B = 48;
    var max = Math.max.apply(null, all);
    var step = niceStep(max / 5);
    var yMax = Math.ceil(max / step) * step;
    var x = function (i) { return L + i * (W - L - R) / (D.years.length - 1); };
    var y = function (v) { return T + (H - T - B) * (1 - v / yMax); };
    var svg = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-labelledby="ct-' + metricId + '"><title id="ct-' + metricId + '">' + esc(m.label) + " by district</title>";
    for (var t = 0; t <= yMax + 1e-9; t += step) {
      svg += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(t) + '" y2="' + y(t) + '" stroke="' + (t === 0 ? "#94A3B8" : "#E5E7EB") + '"/>' +
        '<text x="' + (L - 8) + '" y="' + (y(t) + 4) + '" text-anchor="end" font-size="12" fill="#64748B">' + axisFmt(t, m.unit) + "</text>";
    }
    D.years.forEach(function (yr, i) {
      svg += '<text x="' + x(i) + '" y="' + (H - B + 20) + '" text-anchor="middle" font-size="12" fill="#64748B">' + (i % (W < 600 ? 2 : 1) === 0 ? "FY" + String(yr).slice(2) : "") + "</text>";
    });
    svg += '<text x="' + ((L + W - R) / 2) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="12" font-weight="600" fill="#334155">Fiscal year</text>';
    svg += '<text transform="translate(14 ' + ((T + H - B) / 2) + ') rotate(-90)" text-anchor="middle" font-size="12" font-weight="600" fill="#334155">' + esc(unitLabel(m.unit)) + "</text>";
    var labels = [];
    series.forEach(function (s) {
      var d = "", pen = false;
      s.v.forEach(function (v, i) { if (v == null) { pen = false; return; } d += (pen ? "L" : "M") + x(i) + " " + y(v); pen = true; });
      var w = s.k === "tooele" ? 4 : 2.5;
      if (s.k === "tooele") svg += '<path d="' + d + '" fill="none" stroke="#082F49" stroke-width="' + (w + 2) + '" stroke-linejoin="round" opacity=".25"/>';
      svg += '<path d="' + d + '" fill="none" stroke="' + s.d.color + '" stroke-width="' + w + '" stroke-dasharray="' + s.d.dash + '" stroke-linejoin="round" stroke-linecap="round"/>';
      s.v.forEach(function (v, i) { if (v != null) svg += '<circle cx="' + x(i) + '" cy="' + y(v) + '" r="' + (s.k === "tooele" ? 4.5 : 3) + '" fill="' + s.d.color + '" stroke="#fff" stroke-width="1.5"><title>' + s.d.name + " FY" + D.years[i] + ": " + fmt(v, m.unit) + "</title></circle>"; });
      var last = latest(metricId, s.k);
      if (last) labels.push({ x: x(last.index) + 8, y: y(last.value) + 4, name: s.d.name });
    });
    // End-of-line labels: push apart any that would overlap.
    labels.sort(function (a, b) { return a.y - b.y; });
    for (var li = 1; li < labels.length; li++) {
      if (labels[li].y - labels[li - 1].y < 14) labels[li].y = labels[li - 1].y + 14;
    }
    labels.forEach(function (l) { svg += '<text x="' + l.x + '" y="' + l.y + '" font-size="12" font-weight="700" fill="#0F172A">' + esc(l.name) + "</text>"; });
    svg += "</svg>";
    var table = '<details class="mt-1"><summary style="cursor:pointer;font-size:14px;font-weight:600">View as table</summary><div class="table-wrap mt-1"><table><caption class="sr-only">' + esc(m.label) + '</caption><thead><tr><th scope="col">District</th>' +
      D.years.map(function (yy) { return '<th scope="col" class="n">FY' + yy + "</th>"; }).join("") + "</tr></thead><tbody>" +
      series.map(function (s) { return '<tr><th scope="row">' + s.d.name + "</th>" + s.v.map(function (v) { return '<td class="n">' + (v == null ? '<span class="muted">—</span>' : fmt(v, m.unit)) + "</td>"; }).join("") + "</tr>"; }).join("") +
      "</tbody></table></div></details>";
    el.innerHTML = title + '<div class="chart-scroll">' + svg + "</div>" + table + '<p class="source-line" style="border:0;margin-top:4px;padding-top:0"><strong>Calculation:</strong> ' + esc(m.calc) + "</p>" +
      (m.notes ? '<p class="source-line" style="border:0;margin-top:0;padding-top:0"><strong>Data notes:</strong> ' + esc(m.notes) + " Gaps in a line are values not yet verified.</p>" : "") + sourceLine(m.source);
  }
  function niceStep(raw) {
    if (raw <= 0) return 1;
    var p = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / p;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
  }
  function axisFmt(v, unit) {
    if (unit === "dollars" || unit === "money") return v >= 1e6 ? "$" + (v / 1e6) + "M" : v >= 1000 ? "$" + (v / 1000) + "k" : "$" + v;
    if (unit === "percent") return v + "%";
    return v >= 1000 ? (v / 1000) + "k" : String(v);
  }
  function unitLabel(u) { return { dollars: "Dollars", money: "Dollars", percent: "Percent", ratio: "Students per teacher", count: "Students" }[u] || ""; }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    var h = document.getElementById("site-header"); if (h) h.outerHTML = header();
    var f = document.getElementById("site-footer"); if (f) f.outerHTML = footer();
    searchDialog();
    var mb = document.querySelector(".menu-btn"), nav = document.getElementById("site-nav");
    if (mb) mb.addEventListener("click", function () { var o = nav.classList.toggle("open"); mb.setAttribute("aria-expanded", o); });
    document.querySelectorAll("[data-updated]").forEach(function (e) { e.textContent = monthYear(D.updated); });
    document.querySelectorAll("[data-qwa]").forEach(function (e) { e.outerHTML = qwa(e.innerHTML, e.getAttribute("data-meta")); });
    document.querySelectorAll("[data-source]").forEach(function (e) { e.outerHTML = sourceLine(e.getAttribute("data-source"), e.getAttribute("data-extra")); });
  });

  window.TSFui = {
    fmt: fmt, pct: pct, source: source, esc: esc, sourceLine: sourceLine, emptyState: emptyState, PENDING: PENDING, ICON: ICON,
    renderKPIs: renderKPIs, renderHundred: renderHundred, renderDistrictCards: renderDistrictCards, lineChart: lineChart,
    seriesFor: seriesFor, latest: latest, qwa: qwa, CAT_COLORS: CAT_COLORS, monthYear: monthYear
  };
})();
