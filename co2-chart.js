// Urban CO₂ emissions chart, 2005–2026 (Global North vs Global South section).
// Data from city_co2_emissions_dashboard_2005_2026.html.
(function () {
  if (typeof Chart === 'undefined') return;
  var root = document.getElementById('co2-viz');
  if (!root) return;

  var YEARS = ['2005', '2010', '2015', '2020', '2026'];
  // Order is fixed: it sets each city's color slot (series-1…7).
  var CITIES = [
    { id: 'nyc', name: 'New York City', short: 'NYC', region: 'north', top4: true,
      daily: [169800, 156200, 148500, 131500, 139450], pc: [7.6, 6.9, 6.4, 5.6, 6.1],
      dailyPct: [0, -8.0, -12.5, -22.6, -17.9], pcPct: [0, -9.2, -15.8, -26.3, -19.7] },
    { id: 'cairo', name: 'Cairo', short: 'Cairo', region: 'south', top4: true,
      daily: [82400, 102800, 116500, 121400, 134760], pc: [1.98, 2.22, 2.28, 2.13, 2.09],
      dailyPct: [0, 24.8, 41.4, 47.3, 63.5], pcPct: [0, 12.1, 15.2, 7.6, 5.6] },
    { id: 'johannesburg', name: 'Johannesburg', short: 'Joburg', region: 'south', top4: true,
      daily: [88100, 108400, 116200, 114800, 127760], pc: [9.15, 9.35, 8.45, 7.25, 7.11],
      dailyPct: [0, 23.0, 31.9, 30.3, 45.0], pcPct: [0, 2.2, -7.7, -20.8, -22.3] },
    { id: 'london', name: 'London', short: 'London', region: 'north', top4: true,
      daily: [123300, 116400, 94500, 74200, 75070], pc: [5.9, 5.2, 4.0, 3.1, 3.0],
      dailyPct: [0, -5.6, -23.4, -39.8, -39.1], pcPct: [0, -11.9, -32.2, -47.5, -49.2] },
    { id: 'lagos', name: 'Lagos', short: 'Lagos', region: 'south', top4: false, small: true,
      daily: [17800, 17200, 21800, 22900, 24460], pc: [0.74, 0.60, 0.65, 0.58, 0.60],
      dailyPct: [0, -3.4, 22.5, 28.7, 37.4], pcPct: [0, -18.9, -12.2, -21.6, -18.9] },
    { id: 'nairobi', name: 'Nairobi', short: 'Nairobi', region: 'south', top4: false, small: true,
      daily: [2300, 2950, 4100, 4750, 6140], pc: [0.25, 0.30, 0.35, 0.36, 0.40],
      dailyPct: [0, 28.3, 78.3, 106.5, 167.0], pcPct: [0, 20.0, 40.0, 44.0, 60.0] },
    { id: 'kinshasa', name: 'Kinshasa', short: 'Kinshasa', region: 'south', top4: false, small: true,
      daily: [840, 1040, 1280, 1580, 2030], pc: [0.04, 0.04, 0.04, 0.04, 0.04],
      dailyPct: [0, 23.8, 52.4, 88.1, 141.7], pcPct: [0, 0, 0, 0, 0] }
  ];
  CITIES.forEach(function (c, i) { c.slot = i + 1; });

  var state = { mode: 'pct', sub: 'daily', zoom: false, visible: new Set(CITIES.map(function (c) { return c.id; })) };
  var chart = null;

  // ---------- formatting ----------
  function minus(s) { return s.replace('-', '−'); }
  function fmtPct(v) { return v === 0 ? '0.0%' : minus((v > 0 ? '+' : '') + v.toFixed(1) + '%'); }
  function fmtDaily(v) { return v.toLocaleString('en-US') + ' t/day'; }
  function fmtPc(v) { return v.toFixed(2) + ' t/yr'; }
  function series(c) {
    if (state.mode === 'pct') return state.sub === 'daily' ? c.dailyPct : c.pcPct;
    return state.mode === 'daily' ? c.daily : c.pc;
  }
  function fmtShort(v) {
    if (state.mode === 'pct') return fmtPct(v);
    if (state.mode === 'daily') return v >= 10000 ? (v / 1000).toFixed(1) + 'k' : v.toLocaleString('en-US');
    return v.toFixed(2) + 't';
  }
  function fmtFull(v) {
    if (state.mode === 'pct') return fmtPct(v);
    return state.mode === 'daily' ? fmtDaily(v) : fmtPc(v);
  }

  // ---------- theme ----------
  function tokens() {
    var r = getComputedStyle(document.documentElement);
    var v = getComputedStyle(root);
    var t = {
      fg: r.getPropertyValue('--fg').trim(),
      muted: r.getPropertyValue('--fg-muted').trim(),
      line: r.getPropertyValue('--line').trim(),
      surface: r.getPropertyValue('--surface').trim(),
      series: {}
    };
    CITIES.forEach(function (c) { t.series[c.id] = v.getPropertyValue('--series-' + c.slot).trim(); });
    return t;
  }
  var MONO = '"IBM Plex Mono", ui-monospace, Menlo, monospace';
  var BODY = '"Source Sans 3", "Segoe UI", Roboto, Arial, sans-serif';

  // ---------- plugins ----------
  var baseline = {
    id: 'ccBaseline',
    beforeDatasetsDraw: function (ch) {
      if (state.mode !== 'pct') return;
      var a = ch.chartArea, y = ch.scales.y.getPixelForValue(0), t = ch.$tok;
      if (y < a.top || y > a.bottom) return;
      var ctx = ch.ctx;
      ctx.save();
      ctx.strokeStyle = t.muted; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(a.left, y); ctx.lineTo(a.right, y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '500 10px ' + MONO; ctx.fillStyle = t.muted; ctx.textBaseline = 'bottom';
      ctx.fillText('2005 BASELINE', a.left + 16, y - 5);
      ctx.restore();
    }
  };
  var endLabels = {
    id: 'ccEndLabels',
    afterDatasetsDraw: function (ch) {
      var a = ch.chartArea, t = ch.$tok, ctx = ch.ctx, pts = [];
      ch.data.datasets.forEach(function (ds, i) {
        var m = ch.getDatasetMeta(i);
        if (m.hidden || !m.data.length) return;
        var p = m.data[m.data.length - 1];
        if (p.y < a.top - 2) return;
        pts.push({ x: p.x, y: p.y, raw: p.y, color: ds.borderColor, name: ds.cc.short, val: fmtShort(ds.data[ds.data.length - 1]) });
      });
      pts.sort(function (p, q) { return p.y - q.y; });
      var gap = 15;
      for (var i = 1; i < pts.length; i++) if (pts[i].y - pts[i - 1].y < gap) pts[i].y = pts[i - 1].y + gap;
      for (var j = pts.length - 1; j >= 0; j--) {
        if (pts[j].y > a.bottom) pts[j].y = a.bottom;
        if (j > 0 && pts[j].y - pts[j - 1].y < gap) pts[j - 1].y = pts[j].y - gap;
      }
      ctx.save();
      ctx.textBaseline = 'middle';
      pts.forEach(function (p) {
        var x = p.x + 12;
        ctx.strokeStyle = t.line; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(p.x + 5, p.raw); ctx.lineTo(x - 3, p.y); ctx.stroke();
        ctx.fillStyle = p.color; ctx.fillRect(x, p.y - 3, 6, 6);
        ctx.font = '600 11px ' + BODY; ctx.fillStyle = t.fg;
        ctx.fillText(p.name, x + 10, p.y);
        var w = ctx.measureText(p.name + ' ').width;
        if (!ch.$narrow) {
          ctx.font = '500 10.5px ' + MONO; ctx.fillStyle = t.muted;
          ctx.fillText(p.val, x + 10 + w, p.y);
        }
      });
      ctx.restore();
    }
  };

  // ---------- chart ----------
  function datasets(t) {
    return CITIES.filter(function (c) { return state.visible.has(c.id); }).map(function (c) {
      var col = t.series[c.id];
      return {
        label: c.name, cc: c, data: series(c),
        borderColor: col, backgroundColor: col,
        borderWidth: 2, borderDash: c.region === 'north' ? [6, 4] : [],
        tension: 0.25,
        pointRadius: 4, pointHoverRadius: 6, pointBorderWidth: 2,
        pointBackgroundColor: t.surface, pointBorderColor: col,
        pointHoverBackgroundColor: col, pointHoverBorderColor: t.surface
      };
    });
  }
  function yBounds(ds) {
    var b = {};
    var all = [];
    ds.forEach(function (d) { all.push.apply(all, d.data); });
    if (state.mode === 'pct') {
      all.push(0);
      b.suggestedMax = Math.ceil((Math.max.apply(null, all) + 10) / 20) * 20;
      b.suggestedMin = Math.floor((Math.min.apply(null, all) - 10) / 20) * 20;
    } else if (state.mode === 'daily') {
      b.min = 0;
      if (state.zoom) b.max = 28000;
      else b.suggestedMax = Math.ceil(Math.max.apply(null, all.concat([30000])) * 1.08 / 20000) * 20000;
    } else {
      b.min = 0;
      b.suggestedMax = Math.ceil(Math.max.apply(null, all.concat([1])) * 1.1);
    }
    return b;
  }
  function yTick(v) {
    if (state.mode === 'pct') return v === 0 ? '0%' : minus((v > 0 ? '+' : '') + v + '%');
    if (state.mode === 'daily') return v === 0 ? '0' : (v >= 1000 ? (v / 1000) + 'k' : v);
    return v + ' t';
  }
  function render() {
    var t = tokens();
    var ds = datasets(t);
    var b = yBounds(ds);
    if (chart) chart.destroy();
    var narrow = root.clientWidth < 560;
    chart = new Chart(document.getElementById('co2-chart'), {
      type: 'line',
      data: { labels: YEARS, datasets: ds },
      options: {
        responsive: true, maintainAspectRatio: false, animation: { duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 300 },
        layout: { padding: { right: narrow ? 74 : 124, top: 8, left: 0, bottom: 0 } },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: t.surface, borderColor: t.line, borderWidth: 1,
            titleColor: t.fg, bodyColor: t.fg, padding: 10, cornerRadius: 4, boxPadding: 4,
            usePointStyle: true,
            titleFont: { family: BODY, size: 13, weight: '700' },
            bodyFont: { family: BODY, size: 12 },
            itemSort: function (a, c) { return c.raw - a.raw; },
            callbacks: {
              title: function (items) { return items[0].label === '2005' ? '2005 (baseline)' : items[0].label; },
              label: function (ctx) {
                var c = ctx.dataset.cc, i = ctx.dataIndex;
                return ' ' + c.name + ': ' + fmtFull(ctx.raw) +
                  (state.mode === 'pct' ? '  (' + (state.sub === 'daily' ? fmtDaily(c.daily[i]) : fmtPc(c.pc[i])) + ')' : (i ? '  (' + fmtPct(state.mode === 'daily' ? c.dailyPct[i] : c.pcPct[i]) + ')' : ''));
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false }, border: { color: t.line }, ticks: { color: t.muted, font: { family: MONO, size: 11 } } },
          y: Object.assign({
            border: { display: false },
            grid: { color: t.line },
            ticks: { color: t.muted, font: { family: MONO, size: 11 }, padding: 6, callback: yTick, maxTicksLimit: 7 }
          }, b)
        }
      },
      plugins: [baseline, endLabels]
    });
    chart.$tok = t;
    chart.$narrow = narrow;
    chart.update('none');
  }

  // ---------- controls ----------
  var TITLES = {
    pctdaily: ['2005 = 0%', 'Change in total CO₂ emissions since 2005', 'Relative change in total daily territorial CO₂ emissions compared with 2005.'],
    pctperCapita: ['2005 = 0%', 'Change in CO₂ emissions per person since 2005', 'Relative change in annual CO₂ emissions per resident compared with 2005.'],
    daily: ['Tonnes per day', 'Total daily CO₂ emissions, 2005–2026', 'Estimated daily territorial CO₂ emissions, in metric tonnes per day.'],
    dailyzoom: ['Zoomed: 0–28k t/day', 'Total daily CO₂ emissions, 2005–2026', 'Zoomed to show growth in Lagos, Nairobi and Kinshasa. Larger cities run off the top of the chart.'],
    perCapita: ['Tonnes per person per year', 'CO₂ emissions per person, 2005–2026', 'Annual CO₂ emissions per resident, in metric tonnes per person per year.']
  };
  function syncHeader() {
    var key = state.mode === 'pct' ? 'pct' + state.sub : (state.mode === 'daily' && state.zoom ? 'dailyzoom' : state.mode);
    var tt = TITLES[key];
    document.getElementById('co2-badge').textContent = tt[0];
    document.getElementById('co2-title').textContent = tt[1];
    document.getElementById('co2-sub').textContent = tt[2];
    root.querySelectorAll('[data-mode]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.mode === state.mode)); });
    root.querySelectorAll('[data-sub]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.sub === state.sub)); });
    document.getElementById('co2-pct-sub').hidden = state.mode !== 'pct';
    document.getElementById('co2-zoom-wrap').hidden = state.mode !== 'daily';
  }
  function renderPills() {
    var wrap = document.getElementById('co2-pills');
    wrap.innerHTML = '';
    [['north', 'Global North'], ['south', 'Global South']].forEach(function (g) {
      var group = document.createElement('div');
      group.className = 'viz-group';
      group.innerHTML = '<span class="viz-group-label">' + g[1] + '</span>';
      CITIES.filter(function (c) { return c.region === g[0]; }).forEach(function (c) {
        var s = series(c);
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'pill';
        b.setAttribute('aria-pressed', String(state.visible.has(c.id)));
        b.innerHTML = '<span class="pill-swatch' + (c.region === 'north' ? ' pill-swatch--dashed' : '') +
          '" style="color:var(--series-' + c.slot + ')" aria-hidden="true"></span>' + c.name +
          ' <span class="pill-val">' + fmtShort(s[s.length - 1]) + '</span>';
        b.addEventListener('click', function () {
          if (state.visible.has(c.id)) { if (state.visible.size > 1) state.visible.delete(c.id); }
          else state.visible.add(c.id);
          update();
        });
        group.appendChild(b);
      });
      wrap.appendChild(group);
    });
  }
  function renderTable() {
    var rows = CITIES.filter(function (c) { return state.visible.has(c.id); });
    var h = '<thead><tr><th scope="col">City</th><th scope="col">Region</th>' +
      YEARS.map(function (y) { return '<th scope="col">' + y + '</th>'; }).join('') + '</tr></thead><tbody>';
    rows.forEach(function (c) {
      h += '<tr><th scope="row">' + c.name + '</th><td>' + (c.region === 'north' ? 'Global North' : 'Global South') + '</td>' +
        series(c).map(function (v) { return '<td>' + fmtFull(v) + '</td>'; }).join('') + '</tr>';
    });
    document.getElementById('co2-table').innerHTML = h + '</tbody>';
  }
  function update() { syncHeader(); renderPills(); renderTable(); render(); }

  root.querySelectorAll('[data-mode]').forEach(function (b) {
    b.addEventListener('click', function () { state.mode = b.dataset.mode; update(); });
  });
  root.querySelectorAll('[data-sub]').forEach(function (b) {
    b.addEventListener('click', function () { state.sub = b.dataset.sub; update(); });
  });
  document.getElementById('co2-zoom').addEventListener('change', function (e) {
    state.zoom = e.target.checked;
    if (state.zoom) CITIES.forEach(function (c) { if (c.small) state.visible.add(c.id); });
    update();
  });
  root.querySelectorAll('[data-preset]').forEach(function (b) {
    b.addEventListener('click', function () {
      var p = b.dataset.preset;
      state.visible = new Set(CITIES.filter(function (c) {
        return p === 'all' || (p === 'top4' ? c.top4 : c.region === p);
      }).map(function (c) { return c.id; }));
      if (p === 'top4' && state.zoom) { state.zoom = false; document.getElementById('co2-zoom').checked = false; }
      update();
    });
  });

  // Re-render when the theme or the width class changes.
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(render);
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  var lastNarrow = null;
  window.addEventListener('resize', function () {
    var n = root.clientWidth < 560;
    if (n !== lastNarrow) { lastNarrow = n; render(); }
  });

  update();
  lastNarrow = root.clientWidth < 560;
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(render);
})();
