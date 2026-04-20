/* =============================================================
   Page Hero Animation — interior pages (shorter hero band).
   Auto-mounts into any .page-hero element.
   Reads data-hero-variant: "flow" | "grid" | "bars" | "constellation"
   Each variant renders a condensed Floor Intelligence motif.
   ============================================================= */
(function () {
  'use strict';

  var heroHosts = document.querySelectorAll('.page-hero');
  if (!heroHosts.length) return;

  if (typeof window.__opsSpeed !== 'number') window.__opsSpeed = 1;

  var SVGNS = 'http://www.w3.org/2000/svg';
  var BRAND = '#1B609D';
  var BRAND_LIGHT = '#4A9BD4';
  var BRAND_GLOW = '#9FC9EE';

  function el(name, attrs) {
    var n = document.createElementNS(SVGNS, name);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

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

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  function tween(duration, from, to, easing, onUpdate, onComplete) {
    var start = performance.now();
    function step(now) {
      var speed = (window.__opsSpeed || 1);
      var t = Math.min(1, (now - start) * speed / duration);
      var eased = easing ? easing(t) : t;
      var v = {};
      for (var k in from) v[k] = from[k] + (to[k] - from[k]) * eased;
      onUpdate(v, t);
      if (t < 1) requestAnimationFrame(step);
      else if (onComplete) onComplete();
    }
    requestAnimationFrame(step);
  }

  heroHosts.forEach(function (host) {
    host.style.backgroundImage = 'none';
    host.style.background = 'var(--dark-deep, #050E18)';
    host.style.overflow = 'hidden';
    host.style.position = 'relative';

    var variant = host.dataset.heroVariant || 'flow';

    // Stage
    var stage = document.createElement('div');
    stage.setAttribute('aria-hidden', 'true');
    stage.style.cssText = 'position:absolute;inset:0;z-index:0;pointer-events:none;';

    var W = 1920, H = 560;
    var svg = el('svg', {
      viewBox: '0 0 ' + W + ' ' + H,
      preserveAspectRatio: 'xMidYMid slice',
      width: '100%', height: '100%'
    });
    svg.style.cssText = 'display:block;width:100%;height:100%;';

    var defs = el('defs');
    defs.innerHTML =
      '<linearGradient id="phFlow" x1="0%" y1="100%" x2="100%" y2="0%">' +
        '<stop offset="0%" stop-color="#1B609D" stop-opacity="0.45"/>' +
        '<stop offset="55%" stop-color="#4A9BD4" stop-opacity="1"/>' +
        '<stop offset="100%" stop-color="#9FC9EE" stop-opacity="1"/>' +
      '</linearGradient>' +
      '<linearGradient id="phBar" x1="0%" y1="100%" x2="0%" y2="0%">' +
        '<stop offset="0%" stop-color="#1B609D" stop-opacity="0.8"/>' +
        '<stop offset="100%" stop-color="#4A9BD4" stop-opacity="0.95"/>' +
      '</linearGradient>' +
      '<radialGradient id="phGlow" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0%" stop-color="#9FC9EE" stop-opacity="0.9"/>' +
        '<stop offset="40%" stop-color="#4A9BD4" stop-opacity="0.4"/>' +
        '<stop offset="100%" stop-color="#1B609D" stop-opacity="0"/>' +
      '</radialGradient>';
    svg.appendChild(defs);

    svg.appendChild(el('rect', { width: W, height: H, fill: '#050E18' }));

    var grid = el('g', { stroke: BRAND, 'stroke-width': '0.5', opacity: '0.12' });
    for (var x = 0; x <= W; x += 40) grid.appendChild(el('line', { x1: x, y1: 0, x2: x, y2: H }));
    for (var y = 0; y <= H; y += 40) grid.appendChild(el('line', { x1: 0, y1: y, x2: W, y2: y }));
    svg.appendChild(grid);

    var ambientFns = [];
    var stopFns = [];
    if (variant === 'flow')          { var r = renderFlow(svg, W, H);          ambientFns = r.start; stopFns = r.stop || []; }
    else if (variant === 'grid')     { var r = renderGrid(svg, W, H);          ambientFns = r.start; stopFns = r.stop || []; }
    else if (variant === 'bars')     { var r = renderBars(svg, W, H);          ambientFns = r.start; stopFns = r.stop || []; }
    else if (variant === 'constellation') { var r = renderConstellation(svg, W, H); ambientFns = r.start; stopFns = r.stop || []; }
    else                             { var r = renderFlow(svg, W, H);          ambientFns = r.start; stopFns = r.stop || []; }

    stage.appendChild(svg);
    host.insertBefore(stage, host.firstChild);

    // Vignette
    var vign = document.createElement('div');
    vign.setAttribute('aria-hidden', 'true');
    vign.style.cssText =
      'position:absolute;inset:0;z-index:1;pointer-events:none;' +
      'background:linear-gradient(180deg, rgba(5,14,24,.25) 0%, rgba(5,14,24,.75) 100%),' +
      'radial-gradient(ellipse 70% 90% at 20% 60%, rgba(5,14,24,.6) 0%, transparent 65%);';
    host.insertBefore(vign, stage.nextSibling);

    var container = host.querySelector('.container');
    if (container) { container.style.position = 'relative'; container.style.zIndex = '2'; }

    var ambientRunning = false;
    var ambientHandles = [];

    function startAmbient() {
      if (ambientRunning) return;
      ambientRunning = true;
      ambientFns.forEach(function (fn) { if (typeof fn === 'function') fn(); });
    }

    function stopAmbient() {
      ambientRunning = false;
      ambientHandles.forEach(function (h) { clearInterval(h); clearTimeout(h); cancelAnimationFrame(h); });
      ambientHandles = [];
      stopFns.forEach(function (fn) { if (typeof fn === 'function') fn(); });
    }

    // Start ambient after build-in
    setTimeout(startAmbient, 500);

    // Pause when hero scrolls out of view
    if ('IntersectionObserver' in window) {
      var paused = false;
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (paused) { startAmbient(); paused = false; }
          } else if (ambientRunning) {
            stopAmbient(); paused = true;
          }
        });
      }, { threshold: 0 }).observe(host);
    }

    // Pause when tab hidden
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopAmbient();
      else if (!ambientRunning) startAmbient();
    });
  });

  // ----------------------------------------------------------------
  // FLOW — diagonal path + nodes + data pulses
  // ----------------------------------------------------------------
  function renderFlow(svg, W, H) {
    var pts = [
      { x: 80,   y: H - 40  },
      { x: 280,  y: H - 140 },
      { x: 520,  y: H - 220 },
      { x: 780,  y: H - 300 },
      { x: 1060, y: H - 360 },
      { x: 1340, y: H - 400 },
      { x: 1620, y: H - 420 },
      { x: 1860, y: H - 430 }
    ];
    var d = toSmoothPath(pts);

    svg.appendChild(el('path', { d: d, fill: 'none', stroke: BRAND_LIGHT,
      'stroke-width': '5', 'stroke-linecap': 'round', opacity: '0.22' }));

    var line = el('path', { d: d, fill: 'none', stroke: 'url(#phFlow)', 'stroke-width': '2' });
    svg.appendChild(line);
    var len = line.getTotalLength();
    line.style.strokeDasharray = len;
    line.style.strokeDashoffset = len;
    tween(1100, { o: len }, { o: 0 }, easeOutCubic, function (v) { line.style.strokeDashoffset = v.o; });

    var nodes = pts.map(function (p, i) {
      var major = (i % 2 === 1);
      var g = el('g', { transform: 'translate(' + p.x + ',' + p.y + ')', opacity: '0' });
      if (major) {
        g.appendChild(el('circle', { r: 14, fill: 'url(#phGlow)', opacity: '0.55' }));
        g.appendChild(el('circle', { r: 6, fill: '#0B1C2C', stroke: BRAND_GLOW, 'stroke-width': '1.5' }));
        g.appendChild(el('circle', { r: 2.2, fill: BRAND_GLOW }));
      } else {
        g.appendChild(el('circle', { r: 3.5, fill: BRAND, 'fill-opacity': '0.55' }));
      }
      svg.appendChild(g);
      setTimeout(function () {
        tween(380, { o: 0 }, { o: 1 }, easeOutQuart, function (v) { g.style.opacity = v.o; });
      }, 400 + i * 80);
      return { g: g, major: major };
    });

    var seeded = 7;
    function rand() { seeded = (seeded * 9301 + 49297) % 233280; return seeded / 233280; }
    var dots = el('g', { opacity: '0' });
    for (var i = 0; i < 30; i++) {
      dots.appendChild(el('circle', { cx: 200 + rand() * 1500, cy: 60 + rand() * (H - 120),
        r: 1.2, fill: BRAND_LIGHT, 'fill-opacity': 0.15 + rand() * 0.25 }));
    }
    svg.appendChild(dots);
    tween(800, { o: 0 }, { o: 1 }, easeOutQuart, function (v) { dots.style.opacity = v.o; });

    var intervals = [];
    return {
      start: [function () {
        function spawnPulse() {
          var dot = el('circle', { r: 3.5, fill: BRAND_GLOW, opacity: '0.95' });
          var glow = el('circle', { r: 9, fill: 'url(#phGlow)', opacity: '0.7' });
          var g = el('g'); g.appendChild(glow); g.appendChild(dot);
          svg.appendChild(g);
          var start = performance.now();
          function frame(now) {
            var t = (now - start) * (window.__opsSpeed || 1) / 2800;
            if (t >= 1) { g.remove(); return; }
            var pt = line.getPointAtLength(len * easeOutQuart(t));
            g.setAttribute('transform', 'translate(' + pt.x + ',' + pt.y + ')');
            g.setAttribute('opacity', t < 0.08 ? t / 0.08 : (t > 0.9 ? (1 - t) / 0.1 : 1));
            requestAnimationFrame(frame);
          }
          requestAnimationFrame(frame);
        }
        spawnPulse();
        intervals.push(setInterval(spawnPulse, 1800));
        intervals.push(setInterval(function () {
          nodes.filter(function (n) { return n.major; }).forEach(function (n) {
            var halo = n.g.querySelector('circle');
            if (!halo) return;
            tween(1800, { r: 14, o: 0.55 }, { r: 24, o: 0 }, easeOutQuart, function (v) {
              halo.setAttribute('r', v.r); halo.setAttribute('opacity', v.o);
            }, function () { halo.setAttribute('r', 14); halo.setAttribute('opacity', 0.55); });
          });
        }, 5200));
      }],
      stop: [function () { intervals.forEach(clearInterval); intervals = []; }]
    };
  }

  // ----------------------------------------------------------------
  // GRID — orthographic bay grid + scan line
  // ----------------------------------------------------------------
  function renderGrid(svg, W, H) {
    var COLS = 12, ROWS = 4, CELL_W = 140, CELL_H = 110, GAP = 14;
    var totalW = COLS * (CELL_W + GAP) - GAP;
    var startX = (W - totalW) / 2;
    var startY = (H - (ROWS * (CELL_H + GAP) - GAP)) / 2;
    var filled = { '2,0':1,'4,0':1,'7,1':1,'9,1':1,'3,2':1,'6,2':1,'8,2':1,'1,3':1,'5,3':1,'10,3':1 };
    var cells = [];
    var g = el('g');
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var rect = el('rect', {
          x: startX + c * (CELL_W + GAP), y: startY + r * (CELL_H + GAP),
          width: CELL_W, height: CELL_H, rx: 2, fill: BRAND,
          'fill-opacity': filled[c + ',' + r] ? '0.14' : '0.04',
          stroke: BRAND, 'stroke-opacity': '0.42', 'stroke-width': '1', opacity: '0'
        });
        g.appendChild(rect);
        var orig = filled[c + ',' + r] ? '0.14' : '0.04';
        cells.push({ rect: rect, orig: orig });
        setTimeout((function (rc) { return function () {
          tween(400, { o: 0 }, { o: 1 }, easeOutCubic, function (v) { rc.style.opacity = v.o; });
        }; })(rect), r * 55 + c * 18);
      }
    }
    svg.appendChild(g);

    var scanRect = el('rect', { x: 0, y: 0, width: W, height: 2, fill: 'url(#phFlow)', opacity: '0' });
    svg.appendChild(scanRect);

    var rafHandle = null;
    var intervals = [];
    return {
      start: [function () {
        var start = performance.now();
        function frame(now) {
          var t = ((now - start) * (window.__opsSpeed || 1) / 6500) % 1;
          if (t < 0.5) {
            scanRect.setAttribute('y', ((t / 0.5) * H).toFixed(1));
            scanRect.setAttribute('opacity', '0.4');
          } else {
            scanRect.setAttribute('opacity', '0');
          }
          rafHandle = requestAnimationFrame(frame);
        }
        rafHandle = requestAnimationFrame(frame);
        intervals.push(setInterval(function () {
          var c = cells[Math.floor(Math.random() * cells.length)];
          var orig = parseFloat(c.orig);
          tween(300, { o: orig }, { o: 0.35 }, easeOutCubic, function (v) {
            c.rect.setAttribute('fill-opacity', v.o);
          }, function () {
            tween(900, { o: 0.35 }, { o: orig }, easeOutCubic, function (v) {
              c.rect.setAttribute('fill-opacity', v.o);
            });
          });
        }, 2200));
      }],
      stop: [function () {
        if (rafHandle) cancelAnimationFrame(rafHandle);
        intervals.forEach(clearInterval); intervals = [];
      }]
    };
  }

  // ----------------------------------------------------------------
  // BARS — performance bar chart with overlay trace
  // ----------------------------------------------------------------
  function renderBars(svg, W, H) {
    var BAR_COUNT = 18, BAR_W = 50, BAR_GAP = 18;
    var totalW = BAR_COUNT * BAR_W + (BAR_COUNT - 1) * BAR_GAP;
    var startX = (W - totalW) / 2;
    var BAR_BASE = H - 60;
    var seeded = 11;
    function rand() { seeded = (seeded * 9301 + 49297) % 233280; return seeded / 233280; }
    var bars = [];
    for (var i = 0; i < BAR_COUNT; i++) {
      var bh = 120 + rand() * 260;
      var bx = startX + i * (BAR_W + BAR_GAP);
      var bar = el('rect', { x: bx, y: BAR_BASE, width: BAR_W, height: 0,
        fill: 'url(#phBar)', stroke: BRAND_LIGHT, 'stroke-opacity': '0.3', 'stroke-width': '0.5' });
      svg.appendChild(bar);
      bars.push({ bar: bar, target: bh, x: bx + BAR_W / 2 });
      setTimeout((function (b) { return function () {
        tween(600, { h: 0 }, { h: b.target }, easeOutCubic, function (v) {
          b.bar.setAttribute('height', v.h); b.bar.setAttribute('y', BAR_BASE - v.h);
        });
      }; })(bars[bars.length - 1]), 400 + i * 45);
    }
    var overlayPts = bars.map(function (b) { return { x: b.x, y: BAR_BASE - b.target - 8 }; });
    var overlay = el('path', { d: toSmoothPath(overlayPts), fill: 'none',
      stroke: BRAND_GLOW, 'stroke-width': '1.5', opacity: '0.8' });
    svg.appendChild(overlay);
    var olen = overlay.getTotalLength();
    overlay.style.strokeDasharray = olen;
    overlay.style.strokeDashoffset = olen;
    setTimeout(function () {
      tween(900, { o: olen }, { o: 0 }, easeOutCubic, function (v) { overlay.style.strokeDashoffset = v.o; });
    }, 400 + BAR_COUNT * 45);
    svg.appendChild(el('line', { x1: startX - 20, y1: BAR_BASE, x2: startX + totalW + 20, y2: BAR_BASE,
      stroke: BRAND, 'stroke-opacity': '0.4', 'stroke-width': '1' }));

    var intervals = [];
    return {
      start: [function () {
        intervals.push(setInterval(function () {
          bars.forEach(function (b) {
            if (Math.random() < 0.4) return;
            var delta = (Math.random() - 0.5) * 40;
            var newH = Math.max(90, Math.min(400, b.target + delta));
            tween(900, { h: b.target }, { h: newH }, easeOutCubic, function (v) {
              b.bar.setAttribute('height', v.h); b.bar.setAttribute('y', BAR_BASE - v.h);
            }, function () {
              tween(1200, { h: newH }, { h: b.target }, easeOutCubic, function (v) {
                b.bar.setAttribute('height', v.h); b.bar.setAttribute('y', BAR_BASE - v.h);
              });
            });
          });
        }, 4200));
      }],
      stop: [function () { intervals.forEach(clearInterval); intervals = []; }]
    };
  }

  // ----------------------------------------------------------------
  // CONSTELLATION — scatter plot + connecting lines + twinkle
  // ----------------------------------------------------------------
  function renderConstellation(svg, W, H) {
    var seeded = 3;
    function rand() { seeded = (seeded * 9301 + 49297) % 233280; return seeded / 233280; }
    var nodes = [];
    for (var i = 0; i < 28; i++) {
      nodes.push({ x: 100 + rand() * (W - 200), y: 80 + rand() * (H - 160), r: 2 + rand() * 4 });
    }

    var lines = el('g', { stroke: BRAND, 'stroke-opacity': '0.35', 'stroke-width': '0.6' });
    nodes.forEach(function (n, i) {
      nodes.forEach(function (m, j) {
        if (j <= i) return;
        var dist = Math.hypot(n.x - m.x, n.y - m.y);
        if (dist < 280) {
          var line = el('line', { x1: n.x, y1: n.y, x2: m.x, y2: m.y, opacity: '0' });
          lines.appendChild(line);
          setTimeout(function () {
            tween(700, { o: 0 }, { o: 1 - (dist / 280) * 0.7 }, easeOutQuart,
              function (v) { line.setAttribute('opacity', v.o); });
          }, 400 + i * 20);
        }
      });
    });
    svg.appendChild(lines);

    var nodeEls = nodes.map(function (n, i) {
      var g = el('g', { transform: 'translate(' + n.x + ',' + n.y + ')', opacity: '0' });
      g.appendChild(el('circle', { r: n.r + 4, fill: 'url(#phGlow)', opacity: '0.4' }));
      g.appendChild(el('circle', { r: n.r, fill: BRAND_LIGHT }));
      svg.appendChild(g);
      setTimeout(function () {
        tween(400, { o: 0 }, { o: 1 }, easeOutQuart, function (v) { g.style.opacity = v.o; });
      }, 200 + i * 50);
      return g;
    });

    var intervals = [];
    return {
      start: [function () {
        intervals.push(setInterval(function () {
          var g = nodeEls[Math.floor(Math.random() * nodeEls.length)];
          var halo = g.querySelector('circle');
          if (!halo) return;
          var baseR = parseFloat(halo.getAttribute('r'));
          tween(1200, { r: baseR, o: 0.4 }, { r: baseR + 8, o: 0 }, easeOutQuart,
            function (v) { halo.setAttribute('r', v.r); halo.setAttribute('opacity', v.o); },
            function () { halo.setAttribute('r', baseR); halo.setAttribute('opacity', 0.4); });
        }, 900));
      }],
      stop: [function () { intervals.forEach(clearInterval); intervals = []; }]
    };
  }
}());
