/* =============================================
   OperationsEdge — site.js
   Shared behaviour across all pages.
   No dependencies. Deferred, so DOM is ready.
   ============================================= */
(function () {
  'use strict';

  /* --------------------------------------------------
     1. NAV TOGGLE — add ARIA + keyboard / outside-click
     The inline onclick on .nav-toggle already toggles
     .open on .site-nav; we layer ARIA and UX on top.
  -------------------------------------------------- */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav    = document.querySelector('.site-nav');
    if (!toggle || !nav) return;

    toggle.setAttribute('aria-expanded', 'false');
    nav.id = nav.id || 'site-nav';
    toggle.setAttribute('aria-controls', nav.id);

    // Sync aria-expanded after the inline onclick fires
    toggle.addEventListener('click', function () {
      setTimeout(function () {
        var open = nav.classList.contains('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      }, 0);
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') &&
          !toggle.contains(e.target) && !nav.contains(e.target)) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* --------------------------------------------------
     2. NEWSLETTER FORMS — Netlify AJAX submission
     Form must have data-netlify="true" and a hidden
     form-name input. Shows success message in-place.
  -------------------------------------------------- */
  function initNewsletterForms() {
    document.querySelectorAll('form.newsletter-form').forEach(function (form) {
      var success = form.nextElementSibling;
      if (!success || !success.classList.contains('newsletter-success')) {
        success = null;
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var btn = form.querySelector('[type="submit"]');
        if (btn) { btn.disabled = true; btn.textContent = 'Subscribing…'; }

        fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(new FormData(form)).toString()
        })
          .then(function () {
            form.style.display = 'none';
            if (success) { success.style.display = 'block'; }
          })
          .catch(function () {
            if (btn) { btn.disabled = false; btn.textContent = 'Try again'; }
          });
      });
    });
  }

  /* --------------------------------------------------
     3. REVIEW CATEGORY FILTERS
     Reads ?cat= from URL, shows matching cards, and
     updates pill active states. Cards need data-cat="".
     Pills need data-filter-cat="" on the <a> element.
  -------------------------------------------------- */
  function initReviewFilters() {
    var grid = document.getElementById('reviews-grid');
    if (!grid) return;

    var params = new URLSearchParams(window.location.search);
    var active = params.get('cat') || '';

    // Update pill styles
    document.querySelectorAll('[data-filter-cat]').forEach(function (pill) {
      var match = pill.dataset.filterCat === active ||
                  (pill.dataset.filterCat === '' && active === '');
      pill.classList.toggle('btn-brand',   match);
      pill.classList.toggle('btn-outline', !match);
    });

    // Show/hide cards
    if (active) {
      grid.querySelectorAll('[data-cat]').forEach(function (card) {
        card.style.display = card.dataset.cat === active ? '' : 'none';
      });
    }
  }

  /* --------------------------------------------------
     4. FOCUS VISIBLE POLYFILL
     Adds .focus-visible class for keyboard focus only,
     so we can show outlines for keyboard users without
     showing them on mouse clicks.
  -------------------------------------------------- */
  function initFocusVisible() {
    var usingKeyboard = false;
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') { usingKeyboard = true; document.body.classList.add('keyboard-nav'); }
    });
    document.addEventListener('mousedown', function () {
      usingKeyboard = false; document.body.classList.remove('keyboard-nav');
    });
  }

  /* ---- Init ---- */
  initNav();
  initNewsletterForms();
  initReviewFilters();
  initFocusVisible();

}());
