// count-up on scroll — respects window.__opsSpeed
(function () {
  'use strict';
  var els = document.querySelectorAll('[data-count]');
  if (!els.length) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target; if (el._counted) return; el._counted = true;
      var target = parseFloat(el.getAttribute('data-count')) || 0;
      var speed = window.__opsSpeed || 1;
      var duration = 1200 / speed;
      var start = performance.now();
      function tick(now) {
        var t = Math.min(1, (now - start) / duration);
        var eased = 1 - Math.pow(1 - t, 3);
        var v = target * eased;
        el.textContent = Number.isInteger(target) ? Math.round(v) : v.toFixed(1);
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: .5 });
  els.forEach(function (el) { io.observe(el); });
}());
