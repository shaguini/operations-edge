/* =============================================================
   Hero SVG — builds the "Floor Intelligence" scene in motion,
   then runs a quiet ambient loop (scan line, data pulses,
   bar wobble, halo pulses on major nodes).

   Phases of build-in:
     1. Fine grid fades up
     2. Bay grid rectangles cascade in (rows L→R)
     3. Constellation dots + corner notation appear
     4. Diagonal flow path sweeps; nodes pop sequentially
     5. Bay labels + y-axis labels fade in
     6. Bars grow from baseline; overlay trace draws
     7. Ambient loop starts
   ============================================================= */
(function () {
  'use strict';

  var svg = document.getElementById('heroSvg');
  if (!svg) return;

  // Speed multiplier — kept as a global hook for future toggles.
  if (typeof window.__opsSpeed !== 'number') window.__opsSpeed = 1;

  var SVGNS = 'http://www.w3.org/2000/svg';
  var W = 1920, H = 1080;
  var BRAND = '#1B609D';
  var BRAND_LIGHT = '#4A9BD4';
  var BRAND_GLOW = '#9FC9EE';

  function el(name, attrs) {
    var n = document.createElementNS(SVGNS, name);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  // ---------- 1. FINE GRID ----------
  var fineGrid = document.getElementById('fineGrid');
  var gLines = el('g', { stroke: BRAND, 'stroke-width': '0.5', opacity: '0.14' });
  for (var x = 0; x <= W; x += 40) {
    gLines.appendChild(el('line', { x1: x, y1: 0, x2: x, y2: H }));
  }
  for (var y = 0; y <= H; y += 40) {
    gLines.appendChild(el('line', { x1: 0, y1: y, x2: W, y2: y }));
  }
  fineGrid.appendChild(gLines);

  // ---------- 2. BAY GRID ----------
  var bayGrid = document.getElementById('bayGrid');
  var COLS = 4, ROWS = 7;
  var CELL_W = 150, CELL_H = 125, GAP = 16;
  var filled = { '0,1':true, '1,2':true, '2,4':true, '1,5':true, '0,6':true };

  var bayCells = [];
  for (var r = 0; r < ROWS; r++) {
    for (var c = 0; c < COLS; c++) {
      var isFilled = filled[c + ',' + r] || false;
      var rect = el('rect', {
        x: c * (CELL_W + GAP),
        y: r * (CELL_H + GAP),
        width: CELL_W,
        height: CELL_H,
        rx: 2,
        fill: BRAND,
        'fill-opacity': isFilled ? '0.14' : '0.04',
        stroke: BRAND,
        'stroke-opacity': '0.42',
        'stroke-width': '1',
        opacity: '0'
      });
      rect.dataset.row = r;
      rect.dataset.col = c;
      bayGrid.appendChild(rect);
      bayCells.push(rect);

      if ((r === 2 && c === 2) || (r === 4 && c === 1)) {
        var label = el('text', {
          x: c * (CELL_W + GAP) + 8,
          y: r * (CELL_H + GAP) + CELL_H - 8,
          fill: BRAND_LIGHT,
          'font-family': 'JetBrains Mono, monospace',
          'font-size': '9',
          'letter-spacing': '1.5',
          opacity: '0'
        });
        label.textContent = 'B-0' + (r * COLS + c);
        label.classList.add('bay-label');
        bayGrid.appendChild(label);
      }
    }
  }

  // ---------- 3. FLOW PATH ----------
  var flowPath = document.getElementById('flowPath');
  var pathPoints = [
    { x: 75,   y: 990 },
    { x: 230,  y: 870 },
    { x: 360,  y: 735 },
    { x: 520,  y: 570 },
    { x: 720,  y: 415 },
    { x: 950,  y: 280 },
    { x: 1180, y: 180 },
    { x: 1420, y: 120 },
    { x: 1680, y: 90  },
    { x: 1820, y: 75  }
  ];
  function toSmoothPath(pts) {
    var d = 'M' + pts[0].x + ',' + pts[0].y;
    for (var i = 1; i < pts.length; i++) {
      var prev = pts[i - 1], cur = pts[i];
      var cx = (prev.x + cur.x) / 2;
      d += ' Q' + cx + ',' + prev.y + ' ' + cx + ',' + ((prev.y + cur.y) / 2);
      d += ' T' + cur.x + ',' + cur.y;
    }
    return d;
  }
  var flowD = toSmoothPath(pathPoints);

  flowPath.appendChild(el('path', {
    d: flowD, fill: 'none', stroke: BRAND_LIGHT,
    'stroke-width': '6', 'stroke-linecap': 'round',
    opacity: '0.25', filter: 'url(#softGlow)'
  }));

  var flowLine = el('path', {
    id: 'flowLine', d: flowD, fill: 'none',
    stroke: 'url(#flowGrad)', 'stroke-width': '2', 'stroke-linecap': 'round'
  });
  flowPath.appendChild(flowLine);
  var flowLength = flowLine.getTotalLength();
  flowLine.style.strokeDasharray = flowLength;
  flowLine.style.strokeDashoffset = flowLength;

  var nodes = pathPoints.map(function (p, i) {
    var isMajor = (i === 0 || i === 3 || i === 5 || i === 7 || i === 9);
    var g = el('g', {
      transform: 'translate(' + p.x + ',' + p.y + ')',
      opacity: '0'
    });
    if (isMajor) {
      g.appendChild(el('circle', { r: 16, fill: 'url(#nodeGlow)', opacity: '0.6' }));
      g.appendChild(el('circle', { r: 7,  fill: '#0B1C2C', stroke: BRAND_GLOW, 'stroke-width': '1.5' }));
      g.appendChild(el('circle', { r: 2.5, fill: BRAND_GLOW }));
    } else {
      g.appendChild(el('circle', { r: 4, fill: BRAND, 'fill-opacity': '0.55' }));
    }
    flowPath.appendChild(g);
    return { g: g, major: isMajor, x: p.x, y: p.y };
  });

  // Constellation texture under the flow path
  (function () {
    var seeded = 1;
    function rand() { seeded = (seeded * 9301 + 49297) % 233280; return seeded / 233280; }
    var g = el('g', { opacity: '0' });
    g.id = 'constellationDots';
    for (var i = 0; i < 45; i++) {
      var cx = 400 + rand() * 1100;
      var cy = 120 + rand() * 860;
      g.appendChild(el('circle', { cx: cx, cy: cy, r: 1.5, fill: BRAND_LIGHT, 'fill-opacity': 0.2 + rand() * 0.3 }));
    }
    flowPath.appendChild(g);
  })();

  // ---------- 4. BAR CHART ----------
  var barChart = document.getElementById('barChart');
  var BAR_COUNT = 9;
  var BAR_ZONE_W = 680;
  var BAR_W = 58;
  var BAR_GAP = (BAR_ZONE_W - BAR_COUNT * BAR_W) / (BAR_COUNT - 1);
  var BAR_BASE = 820;
  var barHeights = [260, 280, 250, 290, 240, 310, 360, 350, 380];

  var bars = [];
  for (var i = 0; i < BAR_COUNT; i++) {
    var bx = i * (BAR_W + BAR_GAP);
    var bh = barHeights[i];
    var bar = el('rect', {
      x: bx, y: BAR_BASE, width: BAR_W, height: 0,
      fill: 'url(#barGrad)',
      stroke: BRAND_LIGHT, 'stroke-opacity': '0.3', 'stroke-width': '0.5'
    });
    bar.dataset.target = bh;
    barChart.appendChild(bar);
    bars.push(bar);

    var cap = el('rect', {
      x: bx, y: BAR_BASE, width: BAR_W, height: 2,
      fill: BRAND_GLOW, opacity: '0'
    });
    cap.dataset.target = bh;
    cap.classList.add('bar-cap');
    barChart.appendChild(cap);
  }

  var overlayPts = bars.map(function (b, i) {
    var target = parseFloat(b.dataset.target);
    return { x: i * (BAR_W + BAR_GAP) + BAR_W / 2, y: BAR_BASE - target - 8 };
  });
  var overlay = el('path', {
    d: toSmoothPath(overlayPts), fill: 'none',
    stroke: BRAND_GLOW, 'stroke-width': '1.5',
    'stroke-linecap': 'round', opacity: '0.8'
  });
  barChart.appendChild(overlay);
  var overlayLen = overlay.getTotalLength();
  overlay.style.strokeDasharray = overlayLen;
  overlay.style.strokeDashoffset = overlayLen;

  var overlayNodes = overlayPts.map(function (p) {
    var g = el('g', { transform: 'translate(' + p.x + ',' + p.y + ')', opacity: '0' });
    g.appendChild(el('circle', { r: 3, fill: BRAND_GLOW }));
    barChart.appendChild(g);
    return g;
  });

  barChart.appendChild(el('line', {
    x1: 0, y1: BAR_BASE, x2: BAR_ZONE_W, y2: BAR_BASE,
    stroke: BRAND, 'stroke-opacity': '0.35', 'stroke-width': '1'
  }));

  var yLabels = [{v:'400',y:420},{v:'300',y:520},{v:'200',y:620},{v:'100',y:720}];
  yLabels.forEach(function (lab) {
    var t = el('text', {
      x: -14, y: lab.y + 4,
      fill: BRAND_LIGHT, 'fill-opacity': '0.45',
      'font-family': 'JetBrains Mono, monospace',
      'font-size': '10', 'text-anchor': 'end', opacity: '0'
    });
    t.textContent = lab.v;
    t.classList.add('y-label');
    barChart.appendChild(t);
  });

  var notationGroup = document.getElementById('notation');

  // ---------- TIMELINE ----------
  function tween(duration, from, to, easing, onUpdate, onComplete) {
    var start = performance.now();
    var dur = duration / (window.__opsSpeed || 1);
    function step(now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = easing ? easing(t) : t;
      var v = {};
      for (var k in from) v[k] = from[k] + (to[k] - from[k]) * eased;
      onUpdate(v, t);
      if (t < 1) requestAnimationFrame(step);
      else if (onComplete) onComplete();
    }
    requestAnimationFrame(step);
  }
  var easeOutCubic = function (t) { return 1 - Math.pow(1 - t, 3); };
  var easeOutQuart = function (t) { return 1 - Math.pow(1 - t, 4); };
  var easeOutBack  = function (t) { var c=1.6; return 1 + c * Math.pow(t-1,3) + (c-1) * Math.pow(t-1, 2); };

  function wait(ms) {
    return new Promise(function (res) {
      setTimeout(res, ms / (window.__opsSpeed || 1));
    });
  }

  async function playBuildIn() {
    stopAmbient();

    // Reset
    fineGrid.style.opacity = 0;
    bayCells.forEach(function (c) { c.style.opacity = 0; });
    document.querySelectorAll('.bay-label').forEach(function (l) { l.style.opacity = 0; });
    nodes.forEach(function (n) { n.g.style.opacity = 0; });
    bars.forEach(function (b) { b.setAttribute('height', 0); b.setAttribute('y', BAR_BASE); });
    document.querySelectorAll('.bar-cap').forEach(function (c) { c.setAttribute('y', BAR_BASE); c.style.opacity = 0; });
    overlay.style.strokeDashoffset = overlayLen;
    overlayNodes.forEach(function (n) { n.style.opacity = 0; });
    document.querySelectorAll('.y-label').forEach(function (l) { l.style.opacity = 0; });
    flowLine.style.strokeDashoffset = flowLength;
    notationGroup.style.opacity = 0;
    document.getElementById('constellationDots').style.opacity = 0;

    // Phase 1: fine grid
    tween(280, { o: 0 }, { o: 1 }, easeOutQuart, function (v) {
      fineGrid.style.opacity = v.o;
    });
    await wait(80);

    // Phase 2: bay grid cascade
    bayCells.forEach(function (rect) {
      var r = parseInt(rect.dataset.row, 10);
      var c = parseInt(rect.dataset.col, 10);
      var delay = r * 55 + c * 22;
      setTimeout(function () {
        tween(380, { o: 0, dy: 8 }, { o: 1, dy: 0 }, easeOutCubic, function (v) {
          rect.style.opacity = v.o;
          rect.setAttribute('transform', 'translate(0,' + v.dy + ')');
        });
      }, delay / (window.__opsSpeed || 1));
    });

    await wait(650);

    // Phase 3: constellation + notation
    tween(420, { o: 0 }, { o: 1 }, easeOutQuart, function (v) {
      document.getElementById('constellationDots').style.opacity = v.o;
      notationGroup.style.opacity = v.o;
    });

    // Phase 4: flow line + nodes
    tween(950, { o: flowLength }, { o: 0 }, easeOutCubic, function (v) {
      flowLine.style.strokeDashoffset = v.o;
    });

    nodes.forEach(function (n, i) {
      var delay = 100 + i * 85;
      setTimeout(function () {
        tween(380, { o: 0, s: 0.2 }, { o: 1, s: 1 }, easeOutBack, function (v) {
          n.g.style.opacity = v.o;
          n.g.setAttribute('transform',
            'translate(' + n.x + ',' + n.y + ') scale(' + v.s + ')');
        });
      }, delay / (window.__opsSpeed || 1));
    });

    await wait(400);

    document.querySelectorAll('.bay-label').forEach(function (l, i) {
      setTimeout(function () {
        tween(300, { o: 0 }, { o: 1 }, easeOutQuart, function (v) {
          l.style.opacity = v.o * 0.7;
        });
      }, i * 90 / (window.__opsSpeed || 1));
    });

    document.querySelectorAll('.y-label').forEach(function (l, i) {
      setTimeout(function () {
        tween(280, { o: 0 }, { o: 1 }, easeOutQuart, function (v) {
          l.style.opacity = v.o;
        });
      }, i * 60 / (window.__opsSpeed || 1));
    });

    await wait(500);

    // Phase 5: bars
    bars.forEach(function (bar, i) {
      var target = parseFloat(bar.dataset.target);
      setTimeout(function () {
        tween(620, { h: 0 }, { h: target }, easeOutCubic, function (v) {
          bar.setAttribute('height', v.h);
          bar.setAttribute('y', BAR_BASE - v.h);
          var cap = document.querySelectorAll('.bar-cap')[i];
          if (cap) {
            cap.setAttribute('y', BAR_BASE - v.h);
            cap.style.opacity = Math.min(1, v.h / 40);
          }
        });
      }, i * 50 / (window.__opsSpeed || 1));
    });

    await wait(400);

    tween(800, { o: overlayLen }, { o: 0 }, easeOutCubic, function (v) {
      overlay.style.strokeDashoffset = v.o;
    });

    overlayNodes.forEach(function (n, i) {
      setTimeout(function () {
        tween(260, { o: 0, s: 0.3 }, { o: 1, s: 1 }, easeOutBack, function (v) {
          n.style.opacity = v.o;
          var cx = overlayPts[i].x, cy = overlayPts[i].y;
          n.setAttribute('transform', 'translate(' + cx + ',' + cy + ') scale(' + v.s + ')');
        });
      }, 100 + i * 70 / (window.__opsSpeed || 1));
    });

    await wait(900);

    startAmbient();
  }

  // ---------- AMBIENT LOOP ----------
  var ambientTimers = [];
  var ambientRAF = null;
  var ambientRunning = false;

  function stopAmbient() {
    ambientRunning = false;
    if (ambientRAF) { cancelAnimationFrame(ambientRAF); ambientRAF = null; }
    ambientTimers.forEach(function (h) { clearTimeout(h); });
    ambientTimers = [];
    var scanLine = document.getElementById('scanLine');
    if (scanLine) scanLine.style.opacity = 0;
    var pulseContainer = document.getElementById('flowPulses');
    if (pulseContainer) pulseContainer.innerHTML = '';
  }

  function startAmbient() {
    stopAmbient();
    ambientRunning = true;

    // 1. Scan line
    var scanLine = document.getElementById('scanLine');
    var scanRect = document.getElementById('scanLineRect');
    scanLine.style.opacity = 1;
    var scanStart = performance.now();
    var scanDur = 6500;
    function scanFrame(now) {
      if (!ambientRunning) return;
      var speed = window.__opsSpeed || 1;
      var t = ((now - scanStart) * speed / scanDur) % 1;
      if (t < 0.5) {
        scanRect.setAttribute('y', ((t / 0.5) * H).toFixed(1));
        scanRect.setAttribute('opacity', '0.35');
      } else {
        scanRect.setAttribute('opacity', '0');
      }
      ambientRAF = requestAnimationFrame(scanFrame);
    }
    ambientRAF = requestAnimationFrame(scanFrame);

    // 2. Data pulses along the flow path
    var pulseContainer = document.getElementById('flowPulses');
    function spawnPulse() {
      if (!ambientRunning) return;
      var dot = el('circle', { r: 4, fill: BRAND_GLOW, opacity: '0.95' });
      var glow = el('circle', { r: 10, fill: 'url(#nodeGlow)', opacity: '0.7' });
      var g = el('g');
      g.appendChild(glow); g.appendChild(dot);
      pulseContainer.appendChild(g);

      var start = performance.now();
      var dur = 2600;
      function frame(now) {
        var sp = window.__opsSpeed || 1;
        var t = (now - start) * sp / dur;
        if (t >= 1 || !ambientRunning) { g.remove(); return; }
        var eased = easeOutQuart(t);
        var pt = flowLine.getPointAtLength(flowLength * eased);
        g.setAttribute('transform', 'translate(' + pt.x + ',' + pt.y + ')');
        var op = t < 0.08 ? t / 0.08 : (t > 0.9 ? (1 - t) / 0.1 : 1);
        g.setAttribute('opacity', op);
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
    spawnPulse();
    function pulseTimer() {
      if (!ambientRunning) return;
      spawnPulse();
      ambientTimers.push(setTimeout(pulseTimer, 1900 / (window.__opsSpeed || 1)));
    }
    ambientTimers.push(setTimeout(pulseTimer, 1900 / (window.__opsSpeed || 1)));

    // 3. Bar wobble
    function barWobble() {
      if (!ambientRunning) return;
      bars.forEach(function (bar, i) {
        if (Math.random() < 0.5) return;
        var target = parseFloat(bar.dataset.target);
        var delta = (Math.random() - 0.5) * 30;
        var newH = Math.max(120, Math.min(430, target + delta));
        tween(900, { h: target }, { h: newH }, easeOutCubic, function (v) {
          bar.setAttribute('height', v.h);
          bar.setAttribute('y', BAR_BASE - v.h);
          var cap = document.querySelectorAll('.bar-cap')[i];
          if (cap) cap.setAttribute('y', BAR_BASE - v.h);
        }, function () {
          tween(1200, { h: newH }, { h: target }, easeOutCubic, function (v) {
            bar.setAttribute('height', v.h);
            bar.setAttribute('y', BAR_BASE - v.h);
            var cap = document.querySelectorAll('.bar-cap')[i];
            if (cap) cap.setAttribute('y', BAR_BASE - v.h);
          });
        });
      });
      ambientTimers.push(setTimeout(barWobble, (4200 + Math.random() * 2400) / (window.__opsSpeed || 1)));
    }
    ambientTimers.push(setTimeout(barWobble, 3500 / (window.__opsSpeed || 1)));

    // 4. Major-node halo pulse
    function haloPulse() {
      if (!ambientRunning) return;
      nodes.filter(function (n) { return n.major; }).forEach(function (n) {
        var halo = n.g.querySelector('circle');
        if (!halo) return;
        tween(1800, { r: 16, o: 0.6 }, { r: 28, o: 0 }, easeOutQuart, function (v) {
          halo.setAttribute('r', v.r);
          halo.setAttribute('opacity', v.o);
        }, function () {
          halo.setAttribute('r', 16);
          halo.setAttribute('opacity', 0.6);
        });
      });
      ambientTimers.push(setTimeout(haloPulse, 5200 / (window.__opsSpeed || 1)));
    }
    ambientTimers.push(setTimeout(haloPulse, 3000 / (window.__opsSpeed || 1)));
  }

  // Pause ambient when hero scrolls out of view
  if ('IntersectionObserver' in window) {
    var hero = document.querySelector('.hero');
    if (hero) {
      var paused = false;
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (paused) { startAmbient(); paused = false; }
          } else if (ambientRunning) {
            stopAmbient(); paused = true;
          }
        });
      }, { threshold: 0 }).observe(hero);
    }
  }

  // Pause when tab hidden
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopAmbient();
    else if (!ambientRunning) startAmbient();
  });

  window.__opsHeroReplay = function () { playBuildIn(); };

  if (document.readyState === 'complete') {
    setTimeout(playBuildIn, 150);
  } else {
    window.addEventListener('load', function () { setTimeout(playBuildIn, 150); });
  }
}());
