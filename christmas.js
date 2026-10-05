/* ============================================================
   CHRISTMAS.JS — Friends of Isaac's Food Bank CIC
   Seasonal layer. Load in <head> on every page (NOT deferred).
   Edit CONFIG only.
   ============================================================ */
(function () {
  'use strict';

  /* ----------------------------------------------------------
     CONFIG — the only bit to edit each year
     ---------------------------------------------------------- */
  const CONFIG = {
    start:        '2026-10-05',   // first day shown (inclusive)
    end:          '2026-12-25',   // last day shown (inclusive)
    siteSnowFrom: '2026-12-01',   // full-page snow from this date ('' to disable)

    appealUrl: '/christmas-appeal.html',

    bar: {
      enabled:    true,
      text:       'Our Christmas Toy Appeal is open. Help every child in Redditch feel special this Christmas.',
      textShort:  'Our Christmas Toy Appeal is open.',
      linkText:   'Find out how',
      showSleeps: true
    },

    navLink: {
      enabled: true,
      label:   'Christmas Appeal'
    },


    countdown: {
      to:    '2026-12-11',                          // counts to the END of this day
      label: 'our last drop-off, Friday 11 December'
    },

    sleighometer: {
      collected: 100,
      target:    500,
      updated:   '2026-10-05'     // shown as "Updated 5 October" ('' to hide)
    }

  };

  /* ---------------------------------------------------------- */

  const parseDate = (str) => {
    const p = str.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  };

  const d = new Date();
  const today = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  let active = today >= parseDate(CONFIG.start) && today <= parseDate(CONFIG.end);

  // Preview override: ?season=on / ?season=off
  const override = new URLSearchParams(location.search).get('season');
  if (override === 'on')  active = true;
  if (override === 'off') active = false;

  const siteSnow = active && !!CONFIG.siteSnowFrom && today >= parseDate(CONFIG.siteSnowFrom);

  // Exposed for the appeal page (countdowns etc.)
  window.FOI_SEASON = { config: CONFIG, active, siteSnow };

  if (!active) return;

  document.documentElement.setAttribute('data-season', 'christmas');

  document.addEventListener('DOMContentLoaded', () => {
    buildBar();
    buildNavLink();
    initSnow();
  });


  /* ----------------------------------------------------------
     HELPERS
     ---------------------------------------------------------- */
  function cleanPath(p) {
    return p.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  }

  function isAppealPage() {
    return cleanPath(location.pathname) === cleanPath(CONFIG.appealUrl);
  }

  function sleepsLabel() {
    const xmas = new Date(today.getFullYear(), 11, 25);
    const days = Math.round((xmas - today) / 86400000);
    if (days > 1)  return days + ' sleeps to go';
    if (days === 1) return '1 sleep to go';
    if (days === 0) return 'Merry Christmas!';
    return '';
  }


  /* ----------------------------------------------------------
     ANNOUNCEMENT BAR
     ---------------------------------------------------------- */
  function buildBar() {
    const b = CONFIG.bar;
    if (!b.enabled) return;

    const sleeps = b.showSleeps ? sleepsLabel() : '';
    const link = isAppealPage()
      ? ''
      : ' <a href="' + CONFIG.appealUrl + '" class="xmas-bar-link">' + b.linkText + ' &rsaquo;</a>';

    let bulbs = '';
    for (let i = 0; i < 40; i++) bulbs += '<span class="xmas-bulb"></span>';

    const bar = document.createElement('div');
    bar.className = 'xmas-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Christmas Appeal announcement');
    bar.innerHTML =
      '<div class="container xmas-bar-inner">' +
        (sleeps ? '<span class="xmas-bar-sleeps">' + sleeps + '</span>' : '') +
        '<p class="xmas-bar-text">' +
          '<span class="xmas-bar-long">' + b.text + '</span>' +
          '<span class="xmas-bar-short">' + b.textShort + '</span>' +
          link +
        '</p>' +
      '</div>' +
      '<div class="xmas-lights" aria-hidden="true">' + bulbs + '</div>';

    document.body.insertBefore(bar, document.body.firstChild);
  }


  /* ----------------------------------------------------------
     NAV LINK
     ---------------------------------------------------------- */
  function buildNavLink() {
    const list = document.querySelector('.nav-list');
    if (!CONFIG.navLink.enabled || !list) return;

    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = CONFIG.appealUrl;
    a.className = 'nav-link nav-link--xmas';
    a.textContent = CONFIG.navLink.label;

    if (isAppealPage()) {
      list.querySelectorAll('.nav-link--active').forEach((el) => el.classList.remove('nav-link--active'));
      a.classList.add('nav-link--active');
      a.setAttribute('aria-current', 'page');
    }

    li.appendChild(a);
    list.appendChild(li);
  }


  /* ----------------------------------------------------------
     SNOW
     Any <canvas data-snow> snows inside its parent.
     From siteSnowFrom, one full-page canvas replaces them.
     ---------------------------------------------------------- */
  function initSnow() {
    if (siteSnow) {
      document.querySelectorAll('canvas[data-snow]').forEach((c) => c.remove());
      const page = document.createElement('canvas');
      page.className = 'xmas-snow xmas-snow--page';
      page.setAttribute('data-snow', '');
      page.setAttribute('aria-hidden', 'true');
      document.body.appendChild(page);
    }
    document.querySelectorAll('canvas[data-snow]').forEach(snow);
  }

  function snow(canvas) {
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isPage = canvas.classList.contains('xmas-snow--page');

    let w = 0, h = 0, flakes = [];
    let running = false, visible = true, raf = null;

    function makeFlake(anywhere) {
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : -6,
        r: 1 + Math.random() * 2.5,
        s: 0.3 + Math.random() * 0.8,
        d: Math.random() * Math.PI * 2,
        o: 0.5 + Math.random() * 0.5
      };
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = isPage
        ? { width: window.innerWidth, height: window.innerHeight }
        : canvas.parentElement.getBoundingClientRect();
      const widthChanged = rect.width !== w;

      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Only regenerate on width change (stops mobile address-bar jumps)
      if (widthChanged) {
        const count = Math.min(Math.round((w * h) / (isPage ? 14000 : 9000)), 160);
        flakes = Array.from({ length: count }, () => makeFlake(true));
      }
      draw();
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#FFFFFF';
      for (const f of flakes) {
        ctx.globalAlpha = f.o;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function step() {
      for (const f of flakes) {
        f.y += f.s * (f.r / 2 + 0.5);   // bigger flakes fall faster
        f.d += 0.01;
        f.x += Math.sin(f.d) * 0.4;
        if (f.y > h + 6) Object.assign(f, makeFlake(false));
        if (f.x > w + 6) f.x = -6;
        else if (f.x < -6) f.x = w + 6;
      }
      draw();
      raf = requestAnimationFrame(step);
    }

    function update() {
      const should = !reduce && visible && !document.hidden;
      if (should && !running) { running = true; raf = requestAnimationFrame(step); }
      else if (!should && running) { running = false; cancelAnimationFrame(raf); }
    }

    resize();

    if (isPage) {
      window.addEventListener('resize', resize);
    } else {
      if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas.parentElement);
      if ('IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
          visible = entries[0].isIntersecting;
          update();
        }).observe(canvas);
      }
    }

    document.addEventListener('visibilitychange', update);
    update();
  }

})();