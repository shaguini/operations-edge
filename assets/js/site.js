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

  /* --------------------------------------------------
     5. SCROLL REVEAL
     Elements with [data-reveal] start hidden via CSS
     (opacity:0, translateY). IntersectionObserver adds
     .visible once they enter the viewport.
  -------------------------------------------------- */
  function initScrollReveal() {
    var els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;

    // If user prefers reduced motion, make everything visible immediately
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { io.observe(el); });
  }

  /* --------------------------------------------------
     6. READING PROGRESS BAR
     Injected on article pages only (.article-layout).
     Thin brand-coloured line at top of viewport.
  -------------------------------------------------- */
  function initReadingProgress() {
    if (!document.querySelector('.article-layout, .article-content')) return;

    var bar = document.createElement('div');
    bar.className = 'reading-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(bar, document.body.firstChild);

    function update() {
      var scrolled = window.scrollY;
      var total = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
  }

  /* --------------------------------------------------
     7. TOC ACTIVE SECTION HIGHLIGHT
     Uses IntersectionObserver to track which heading
     is currently in view and highlights its TOC link.
  -------------------------------------------------- */
  function initTocHighlight() {
    var toc = document.querySelector('.toc-list');
    if (!toc) return;

    var headings = document.querySelectorAll('.article-content h2[id], .article-content h3[id]');
    if (!headings.length) return;

    var linkMap = {};
    toc.querySelectorAll('a[href^="#"]').forEach(function (a) {
      linkMap[a.getAttribute('href').slice(1)] = a;
    });

    var activeLink = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (activeLink) activeLink.classList.remove('toc-active');
          activeLink = linkMap[entry.target.id] || null;
          if (activeLink) activeLink.classList.add('toc-active');
        }
      });
    }, { rootMargin: '-5% 0% -70% 0%' });

    headings.forEach(function (h) { io.observe(h); });
  }

  /* --------------------------------------------------
     8. SCROLL-AWARE HEADER
     Adds .scrolled to the header when page is scrolled
     > 80px, letting CSS deepen the shadow so the frosted
     glass separates from lighter page sections.
  -------------------------------------------------- */
  function initScrollHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    function tick() {
      header.classList.toggle('scrolled', window.scrollY > 80);
    }
    window.addEventListener('scroll', tick, { passive: true });
    tick();
  }

  /* --------------------------------------------------
     9. HERO PARALLAX
     Subtle background-position shift as the user scrolls
     away from the hero — adds depth to the cinematic image.
     Only runs on pages with a .hero section and respects
     prefers-reduced-motion.
  -------------------------------------------------- */
  function initHeroParallax() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var heroH = hero.offsetHeight;
    function tick() {
      if (window.scrollY < heroH) {
        var offset = (window.scrollY * 0.28).toFixed(1);
        hero.style.backgroundPositionY = 'calc(center + ' + offset + 'px)';
      }
    }
    window.addEventListener('scroll', tick, { passive: true });
  }

  /* ---- Init ---- */
  initNav();
  initNewsletterForms();
  initReviewFilters();
  initFocusVisible();
  initScrollReveal();
  initReadingProgress();
  initTocHighlight();
  initScrollHeader();
  initHeroParallax();

  /* Developer note — for anyone curious enough to look */
  if (window.console && window.console.log) {
    console.log(
      '\n%cOperationsEdge\n',
      'color:#1B609D;font-size:20px;font-weight:800;font-family:sans-serif;'
    );
    console.log('Built by a warehouse manager, for warehouse managers.');
    console.log('No shortcuts, no pay-to-play rankings, no fluff.');
    console.log('Spotted something off? → hello@operationsedge.co.uk\n');
  }

}());
