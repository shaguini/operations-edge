/* =============================================================
   Page-level animations: stats counter + bento mouse-follow.
   Layered on top of site.js (which handles scroll-reveal).
   ============================================================= */
(function () {
  'use strict';

  if (typeof window.__opsSpeed !== 'number') window.__opsSpeed = 1;

  // ---------- STATS COUNTER ----------
  var statEls = document.querySelectorAll('.stat-num[data-count-to], .stat-num[data-count-text]');
  if (!statEls.length) return;

  function animateCount(el, to, suffix) {
    var duration = 1600 / (window.__opsSpeed || 1);
    var start = performance.now();
    function step(now) {
      var t = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      var val = Math.round(to * eased);
      el.textContent = val + (suffix || '');
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = to + (suffix || '');
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.dataset.countTo !== undefined) {
          var to = parseFloat(el.dataset.countTo);
          var suf = el.dataset.countSuffix || '';
          if (to === 0) {
            el.textContent = '0' + suf;
            el.animate([
              { transform: 'scale(1)' },
              { transform: 'scale(1.12)', offset: .3 },
              { transform: 'scale(1)' }
            ], { duration: 900 / (window.__opsSpeed || 1), easing: 'cubic-bezier(.22,1,.36,1)' });
          } else {
            animateCount(el, to, suf);
          }
        } else if (el.dataset.countText) {
          var text = el.dataset.countText;
          el.textContent = '';
          text.split('').forEach(function (ch, i) {
            var span = document.createElement('span');
            span.textContent = ch;
            span.style.display = 'inline-block';
            span.style.opacity = 0;
            span.style.transform = 'translateY(12px)';
            span.style.transition = 'opacity .45s cubic-bezier(.22,1,.36,1), transform .45s cubic-bezier(.22,1,.36,1)';
            span.style.transitionDelay = (i * 80 / (window.__opsSpeed || 1)) + 'ms';
            el.appendChild(span);
            requestAnimationFrame(function () {
              span.style.opacity = 1;
              span.style.transform = 'translateY(0)';
            });
          });
        }
        io.unobserve(el);
      });
    }, { threshold: 0.4 });
    statEls.forEach(function (el) { io.observe(el); });
  } else {
    statEls.forEach(function (el) {
      if (el.dataset.countTo !== undefined) {
        el.textContent = el.dataset.countTo + (el.dataset.countSuffix || '');
      } else if (el.dataset.countText) {
        el.textContent = el.dataset.countText;
      }
    });
  }

  // ---------- BENTO MOUSE-FOLLOW GRID ----------
  document.querySelectorAll('.bento-tile').forEach(function (tile) {
    tile.addEventListener('mousemove', function (e) {
      var rect = tile.getBoundingClientRect();
      var mx = ((e.clientX - rect.left) / rect.width) * 100;
      var my = ((e.clientY - rect.top) / rect.height) * 100;
      tile.style.setProperty('--mx', mx + '%');
      tile.style.setProperty('--my', my + '%');
    });
  });
}());
