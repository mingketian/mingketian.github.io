/* Track-record dashboard (Interests page). Reads window.PM_DATA; draws the indexed cumulative result,
   daily contributions, and indicators for the whole account or one asset. No dollar amounts are shown. */
(function () {
  var D = window.PM_DATA, root = document.querySelector('[data-tr]');
  if (!D || !root) return;
  var NS = 'http://www.w3.org/2000/svg';
  var ASSETS = (window.PM_DATA && window.PM_DATA.assets)
    || Object.keys((window.PM_DATA || {}).daily || {}).filter(function (k) { return k !== 'all'; });
  var SERIES = { all: 'All markets' };
  ASSETS.forEach(function (a) { SERIES[a] = a.toUpperCase(); });
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var key = 'all', hoverIdx = null;
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function fmtDate(s, long) {
    var p = s.split('-'), m = MONTHS[+p[1] - 1], d = +p[2];
    return long ? m + ' ' + d + ', ' + p[0] : m + ' ' + d;
  }
  function cumulative(arr) { var s = 0; return arr.map(function (v) { s += v; return s; }); }
  function pct(v, dp) { return (v > 0 ? '+' : v < 0 ? '\u2212' : '') + Math.abs(v).toFixed(dp == null ? 1 : dp) + '%'; }

  /* indicators */
  function setKpis() {
    var k = D.kpis[key];
    var map = {
      days: [k.profitableShare.toFixed(0) + '%', k.profitableDays + ' of ' + k.activeDays + ' trading days'],
      sharpe: [stats(key).sharpe.toFixed(1), 'daily results, annualized'],
      payoff: [k.payoff.toFixed(1) + '\u00d7', 'average win \u00f7 average loss'],
      win: [k.winRate.toFixed(0) + '%', 'of ' + k.markets.toLocaleString('en-US') + ' markets settled in profit'],
      pull: [k.pullback.toFixed(1) + '%', 'deepest dip below the running peak'],
      streak: [k.streak + ' days', 'longest run of profitable days']
    };
    Object.keys(map).forEach(function (id) {
      var box = root.querySelector('[data-kpi="' + id + '"]');
      if (!box) return;
      box.querySelector('dd').textContent = map[id][0];
      box.querySelector('small').textContent = map[id][1];
    });
    var scope = root.querySelector('[data-tr-scope]');
    if (scope) scope.textContent = key === 'all'
      ? 'All markets \u00b7 ' + D.kpis.all.fills.toLocaleString('en-US') + ' fills'
      : SERIES[key] + ' \u00b7 ' + k.share.toFixed(1) + '% of the total result \u00b7 ' + k.fills.toLocaleString('en-US') + ' fills';
  }

  /* daily results on trading days, drawdown, and risk-adjusted ratios */
  function stats(k) {
    var v = D.daily[k].filter(function (_, i) { return D.active[k][i]; });
    var m = v.reduce(function (a, b) { return a + b; }, 0) / v.length;
    var sd = Math.sqrt(v.reduce(function (a, b) { return a + (b - m) * (b - m); }, 0) / (v.length - 1));
    var c = 0, pk = 0, dd = D.daily[k].map(function (x) { c += x; pk = Math.max(pk, c); return c - pk; });
    var wins = v.filter(function (x) { return x > 0; }), losses = v.filter(function (x) { return x < 0; });
    return { v: v, dd: dd, sharpe: sd ? m / sd * Math.sqrt(365) : 0, best: Math.max.apply(null, v), worst: Math.min.apply(null, v),
      avgWin: wins.length ? wins.reduce(function (a, b) { return a + b; }, 0) / wins.length : 0,
      avgLoss: losses.length ? losses.reduce(function (a, b) { return a + b; }, 0) / losses.length : 0 };
  }

  function analytics() {
    var S = stats(key), k = D.kpis[key], n = D.dates.length;
    var ddBox = root.querySelector('[data-tr-dd]'), hBox = root.querySelector('[data-tr-hist]'), list = root.querySelector('[data-tr-stats]');
    if (!ddBox || !hBox) return;
    [ddBox, hBox].forEach(function (b) { b.innerHTML = ''; });
    var w = Math.max(260, ddBox.clientWidth), h = 190, m = { l: 40, r: 10, t: 10, b: 24 };

    /* drawdown: distance below the running peak of the cumulative result */
    var s1 = el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, class: 'tr-svg', 'aria-hidden': 'true' }, ddBox);
    var lo = Math.min.apply(null, S.dd), lo2 = lo < -0.5 ? lo * 1.1 : -1;
    var xs = function (i) { return m.l + (w - m.l - m.r) * i / (n - 1); }, ys = function (v) { return m.t + (h - m.t - m.b) * v / lo2; };
    var step = Math.abs(lo2) > 8 ? 4 : Math.abs(lo2) > 3 ? 2 : Math.abs(lo2) > 1.5 ? 1 : 0.5;
    for (var t = 0; t >= lo2 - 1e-9; t -= step) {
      el('line', { x1: m.l, x2: w - m.r, y1: ys(t), y2: ys(t), class: t === 0 ? 'tr-zero' : 'tr-grid-l' }, s1);
      var tx = el('text', { x: m.l - 6, y: ys(t) + 4, 'text-anchor': 'end', class: 'tr-axis' }, s1); tx.textContent = (t === 0 ? '0' : '\u2212' + Math.abs(t)) + '%';
    }
    var d = S.dd.map(function (v, i) { return (i ? 'L' : 'M') + xs(i).toFixed(1) + ' ' + ys(v).toFixed(1); }).join(' ');
    el('path', { d: d + ' L' + xs(n - 1).toFixed(1) + ' ' + ys(0) + ' L' + xs(0) + ' ' + ys(0) + ' Z', class: 'tr-dd-area' }, s1);
    el('path', { d: d, class: 'tr-dd-line' }, s1);
    [0, n - 1].forEach(function (i) { var tl = el('text', { x: xs(i), y: h - 6, 'text-anchor': i ? 'end' : 'start', class: 'tr-axis' }, s1); tl.textContent = fmtDate(D.dates[i]); });

    /* histogram of daily results (share of the period total, trading days only) */
    var s2 = el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, class: 'tr-svg', 'aria-hidden': 'true' }, hBox);
    var bw = key === 'all' || key === 'btc' ? 1 : 0.25, a = Math.floor(S.worst / bw) * bw, b = Math.ceil(S.best / bw) * bw;
    if (b <= a) b = a + bw;
    var nb = Math.round((b - a) / bw), cnt = []; for (var q = 0; q < nb; q++) cnt.push(0);
    S.v.forEach(function (x) { cnt[Math.min(nb - 1, Math.floor((x - a) / bw))]++; });
    var cmax = Math.max.apply(null, cnt), hx = function (x) { return m.l + (w - m.l - m.r) * (x - a) / (b - a); }, hy = function (c) { return h - m.b - (h - m.t - m.b) * c / cmax; };
    var cs = cmax > 20 ? 10 : cmax > 8 ? 4 : 2;
    for (var c = 0; c <= cmax; c += cs) {
      el('line', { x1: m.l, x2: w - m.r, y1: hy(c), y2: hy(c), class: c ? 'tr-grid-l' : 'tr-zero' }, s2);
      var cl = el('text', { x: m.l - 6, y: hy(c) + 4, 'text-anchor': 'end', class: 'tr-axis' }, s2); cl.textContent = c;
    }
    cnt.forEach(function (c, q) {
      if (!c) return;
      var x0 = a + q * bw;
      el('rect', { x: hx(x0) + 1, width: Math.max(1, hx(x0 + bw) - hx(x0) - 2), y: hy(c), height: hy(0) - hy(c), rx: 1.5, class: x0 + bw <= 0 ? 'tr-h-down' : 'tr-h-up' }, s2);
    });
    var z = el('line', { x1: hx(0), x2: hx(0), y1: m.t, y2: h - m.b, class: 'tr-cross' }, s2);
    [a, 0, b].forEach(function (x, i) { var tl = el('text', { x: hx(x), y: h - 6, 'text-anchor': i === 0 ? 'start' : i === 2 ? 'end' : 'middle', class: 'tr-axis' }, s2); tl.textContent = (x > 0 ? '+' : x < 0 ? '\u2212' : '') + Math.abs(x) + '%'; });

    if (list) list.innerHTML = [
      ['Sharpe ratio', S.sharpe.toFixed(1), 'mean \u00f7 standard deviation of daily results, \u00d7 \u221a365'],
      ['Profit factor', k.profitFactor.toFixed(2), 'total gains \u00f7 total losses; above 1 means profitable'],
      ['Max drawdown', pct(Math.min.apply(null, S.dd)), 'largest fall below a previous high'],
      ['Best day', pct(S.best, 2), 'single largest daily gain'],
      ['Worst day', pct(S.worst, 2), 'single largest daily loss'],
      ['Average up / down day', pct(S.avgWin, 2) + ' / ' + pct(S.avgLoss, 2), 'mean result on profitable and losing days']
    ].map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd><small>' + r[2] + '</small></div>'; }).join('');
  }

  /* chart */
  var box = root.querySelector('.tr-chart'), svg, W, H, M = { l: 44, r: 14, t: 14, b: 30 }, split;
  function draw(animate) {
    box.querySelectorAll('svg').forEach(function (s) { s.remove(); });
    W = Math.max(300, box.clientWidth); H = Math.round(Math.min(420, Math.max(300, W * 0.48)));
    var narrow = W < 560;
    M.l = narrow ? 34 : 44;
    svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, class: 'tr-svg', 'aria-hidden': 'true' }, null);
    box.insertBefore(svg, box.firstChild);
    var n = D.dates.length, cw = (W - M.l - M.r) / n;
    var x = function (i) { return M.l + cw * (i + 0.5); };
    split = Math.round((H - M.t - M.b) * 0.70);
    var top = M.t, mainH = split - 18, barTop = M.t + split + 6, barH = H - M.b - barTop;

    var series = key === 'all' ? ['all'].concat(ASSETS) : [key];
    var cums = {}; series.forEach(function (s) { cums[s] = cumulative(D.daily[s]); });
    var hi = Math.max.apply(null, series.map(function (s) { return Math.max.apply(null, cums[s]); }));
    var lo = Math.min(0, Math.min.apply(null, series.map(function (s) { return Math.min.apply(null, cums[s]); })));
    var tick = hi > 60 ? 25 : hi > 24 ? 10 : 5;
    var top100 = Math.ceil(hi / tick) * tick;
    var maxY = Math.max(hi * 1.04, top100 === Math.ceil(hi) ? top100 * 1.02 : hi * 1.04), minY = lo < 0 ? lo * 1.15 : 0;
    var y = function (v) { return top + mainH - (v - minY) / (maxY - minY) * mainH; };

    /* grid: round ticks only (headroom above the top tick is left unlabeled) */
    var g = el('g', { class: 'tr-grid' }, svg);
    var ticks = [];
    for (var tv = Math.ceil(minY / tick) * tick; tv <= maxY + 1e-9; tv += tick) ticks.push(tv);
    for (var i = 0; i < ticks.length; i++) {
      var v = ticks[i], yy = y(v);
      el('line', { x1: M.l, x2: W - M.r, y1: yy, y2: yy }, g);
      var t = el('text', { x: M.l - 8, y: yy + 4, 'text-anchor': 'end', class: 'tr-axis' }, g); t.textContent = Math.round(v) + '%';
    }
    /* month ticks */
    D.dates.forEach(function (d, i) {
      var day = +d.slice(8, 10);
      if (day === 1 || i === 0) {
        var t = el('text', { x: x(i), y: H - 8, 'text-anchor': i === 0 ? 'start' : 'middle', class: 'tr-axis' }, svg);
        t.textContent = MONTHS[+d.slice(5, 7) - 1] + (i === 0 && !narrow ? ' ' + day : '');
        if (i) el('line', { x1: x(i) - cw / 2, x2: x(i) - cw / 2, y1: top, y2: H - M.b, class: 'tr-month' }, svg);
      }
    });
    var tEnd = el('text', { x: W - M.r, y: H - 8, 'text-anchor': 'end', class: 'tr-axis' }, svg); tEnd.textContent = fmtDate(D.dates[n - 1]);

    /* area + lines */
    var defs = el('defs', {}, svg), grad = el('linearGradient', { id: 'trFill', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el('stop', { offset: '0%', 'stop-color': 'var(--tr-main)', 'stop-opacity': 0.22 }, grad);
    el('stop', { offset: '100%', 'stop-color': 'var(--tr-main)', 'stop-opacity': 0 }, grad);
    var mainKey = series[0], mc = cums[mainKey];
    var path = mc.map(function (v, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); }).join(' ');
    el('path', { d: path + ' L' + x(n - 1).toFixed(1) + ' ' + y(Math.max(minY, 0)).toFixed(1) + ' L' + x(0).toFixed(1) + ' ' + y(Math.max(minY, 0)).toFixed(1) + ' Z', fill: 'url(#trFill)', class: 'tr-area tr-' + mainKey }, svg);
    var lines = [];
    series.slice(1).forEach(function (s) {
      var p = cums[s].map(function (v, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); }).join(' ');
      lines.push(el('path', { d: p, class: 'tr-line tr-sub tr-' + s }, svg));
    });
    lines.push(el('path', { d: path, class: 'tr-line tr-main tr-' + mainKey }, svg));
    var end = el('circle', { cx: x(n - 1), cy: y(mc[n - 1]), r: 4.5, class: 'tr-end tr-' + mainKey }, svg);

    /* daily bars: share of the period total */
    var dmax = Math.max.apply(null, D.daily[mainKey].map(Math.abs)) || 1;
    var bZero = barTop + barH * (Math.max.apply(null, D.daily[mainKey]) / (Math.max.apply(null, D.daily[mainKey]) + Math.max(0, -Math.min.apply(null, D.daily[mainKey]))) || 0.8);
    var bScale = (barH - 2) / (Math.max.apply(null, D.daily[mainKey]) + Math.max(0, -Math.min.apply(null, D.daily[mainKey])));
    el('line', { x1: M.l, x2: W - M.r, y1: bZero, y2: bZero, class: 'tr-zero' }, svg);
    var bl = el('text', { x: M.l - 8, y: barTop + 9, 'text-anchor': 'end', class: 'tr-axis tr-axis-sm' }, svg); bl.textContent = 'daily';
    var bars = el('g', { class: 'tr-bars' }, svg);
    D.daily[mainKey].forEach(function (v, i) {
      if (!D.active[mainKey][i] || v === 0) return;
      var h = Math.max(1.5, Math.abs(v) * bScale);
      el('rect', { x: x(i) - Math.max(1, cw * 0.32), width: Math.max(2, cw * 0.64), y: v > 0 ? bZero - h : bZero, height: h, rx: 1.5, class: v > 0 ? 'up' : 'down' }, bars);
    });

    /* hover */
    var cross = el('line', { y1: top, y2: H - M.b, class: 'tr-cross', visibility: 'hidden' }, svg);
    var dot = el('circle', { r: 5, class: 'tr-dot tr-' + mainKey, visibility: 'hidden' }, svg);
    var tip = root.querySelector('.tr-tip');
    function show(i) {
      hoverIdx = i;
      if (i == null) { cross.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); tip.hidden = true; return; }
      cross.setAttribute('x1', x(i)); cross.setAttribute('x2', x(i)); cross.setAttribute('visibility', 'visible');
      dot.setAttribute('cx', x(i)); dot.setAttribute('cy', y(mc[i])); dot.setAttribute('visibility', 'visible');
      var rows = '<b>' + fmtDate(D.dates[i], true) + '</b>' +
        '<span><i class="sw tr-' + mainKey + '"></i>Cumulative<em>' + mc[i].toFixed(1) + '%</em></span>' +
        '<span><i class="sw sw-day"></i>That day<em>' + (D.active[mainKey][i] ? pct(D.daily[mainKey][i], 2) : 'no trades') + '</em></span>';
      if (key === 'all') ASSETS.forEach(function (s) { rows += '<span class="sub"><i class="sw tr-' + s + '"></i>' + SERIES[s] + '<em>' + cums[s][i].toFixed(1) + '%</em></span>'; });
      tip.innerHTML = rows; tip.hidden = false;
      var bw = box.clientWidth, tx = x(i) / W * bw, tw = tip.offsetWidth;
      tip.style.left = Math.min(bw - tw - 4, Math.max(4, tx + (tx > bw * 0.6 ? -tw - 14 : 14))) + 'px';
      tip.style.top = '8px';
    }
    function idxFrom(evt) {
      var r = svg.getBoundingClientRect(), px = (evt.touches ? evt.touches[0].clientX : evt.clientX) - r.left;
      var i = Math.round((px / r.width * W - M.l) / cw - 0.5);
      return Math.max(0, Math.min(n - 1, i));
    }
    svg.addEventListener('mousemove', function (e) { show(idxFrom(e)); });
    svg.addEventListener('touchstart', function (e) { show(idxFrom(e)); }, { passive: true });
    svg.addEventListener('touchmove', function (e) { show(idxFrom(e)); }, { passive: true });
    svg.addEventListener('mouseleave', function () { show(null); });
    box.onkeydown = function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      show(Math.max(0, Math.min(n - 1, (hoverIdx == null ? n : hoverIdx) + (e.key === 'ArrowRight' ? 1 : -1))));
    };
    box.onblur = function () { show(null); };

    /* draw-in */
    if (animate && !reduce) {
      lines.forEach(function (p) {
        var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
        p.getBoundingClientRect(); p.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.2,.7,.2,1)'; p.style.strokeDashoffset = 0;
      });
      end.style.opacity = 0; setTimeout(function () { end.style.transition = 'opacity .3s'; end.style.opacity = 1; }, 1300);
    }
    var sum = root.querySelector('[data-tr-summary]');
    if (sum) sum.textContent = SERIES[key] + ': cumulative result indexed to 100% at the end of the period, from ' + fmtDate(D.dates[0], true) + ' to ' + fmtDate(D.dates[n - 1], true) + '. ' +
      D.kpis[key].profitableShare.toFixed(0) + '% of trading days were profitable; Sharpe ratio ' + stats(key).sharpe.toFixed(1) + '.';
  }

  /* asset share bar */
  function shares() {
    var bar = root.querySelector('[data-tr-share]');
    if (!bar) return;
    bar.innerHTML = ASSETS.filter(function (s) { return D.kpis[s] && D.kpis[s].share > 0; })
      .sort(function (a, b) { return D.kpis[b].share - D.kpis[a].share; })
      .map(function (s) {
      var sh = D.kpis[s].share;
      var label = sh >= 6 ? '<b>' + SERIES[s] + '</b>' + sh.toFixed(1) + '%' : '';
      return '<span class="seg tr-' + s + '" style="flex-basis:' + sh + '%" title="' + SERIES[s] + ' ' + sh.toFixed(1) + '%">' + label + '</span>';
    }).join('');
  }

  /* controls */
  root.querySelectorAll('[data-series]').forEach(function (b) {
    b.addEventListener('click', function () {
      key = b.getAttribute('data-series');
      root.querySelectorAll('[data-series]').forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      root.setAttribute('data-active', key);
      setKpis(); draw(true); analytics();
    });
  });

  setKpis(); shares(); analytics();
  var started = false;
  function start() { if (started) return; started = true; draw(true); }
  if ('IntersectionObserver' in window) {
    draw(false);
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { draw(true); io.disconnect(); } }); }, { threshold: 0.35 });
    io.observe(box);
  } else start();
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { draw(false); analytics(); }, 120); });
})();
