/*
 * ARC prototype: public site behaviour.
 * Pages are complete without JavaScript; this file only enhances them.
 * No inline handlers are used, so it runs under script-src 'self'.
 */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  root.classList.add('js');

  var EXIT_URL = 'https://www.google.com/search?q=weather';
  var STORE_KEY = 'arc_demo_overrides';
  var NOTICE_KEY = 'arc_notice_dismissed';
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  /* ---------- helpers ---------- */

  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function ph(v) { return /^\[.*\]$/.test(String(v)) ? '<span class="placeholder">' + esc(v) + '</span>' : esc(v); }
  function toTel(n) {
    var d = String(n || '').replace(/[^\d+]/g, '');
    if (d.charAt(0) === '0' && d.length === 10) { d = '+263' + d.slice(1); }
    return d;
  }
  function fmtDate(iso) {
    var p = String(iso || '').split('-');
    if (p.length < 3) { return esc(iso); }
    return parseInt(p[2], 10) + ' ' + MONTHS[parseInt(p[1], 10) - 1] + ' ' + p[0];
  }
  function mapsUrl(a) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(a); }

  var ICONS = {
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    whatsapp: '<path d="M3.5 20.5l1.4-4.2a8.5 8.5 0 1 1 3.3 3z"/><path d="M9 8.5c0 3.6 2.9 6.5 6.5 6.5l.8-1.6-2.1-1-1 .9a4 4 0 0 1-2-2l.9-1-1-2.1z"/>',
    map: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>'
  };
  function icon(n) { return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + ICONS[n] + '</svg>'; }

  var toastTimer;
  function toast(msg) {
    var t = doc.getElementById('toast');
    if (!t) { return; }
    t.textContent = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.textContent = ''; }, 5000);
  }

  /* ---------- data: defaults merged with demo CMS overrides ---------- */

  function readOverrides() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      var o = raw ? JSON.parse(raw) : {};
      return o && typeof o === 'object' ? o : {};
    } catch (e) { return {}; }
  }

  function getData() {
    var base = window.ARC_DATA;
    if (!base) { return null; }
    var o = readOverrides();
    var out = {};
    Object.keys(base).forEach(function (k) { out[k] = base[k]; });
    ['hotlines', 'locations', 'stats', 'posts'].forEach(function (k) {
      if (Array.isArray(o[k]) && o[k].length) { out[k] = o[k]; }
    });
    return out;
  }

  function isLive(p) {
    if (p.status !== 'published') { return false; }
    if (p.publishAt) {
      var t = Date.parse(p.publishAt);
      if (!isNaN(t) && t > Date.now()) { return false; }
    }
    return true;
  }

  /* ---------- Quick exit ---------- */

  function quickExit() {
    if (doc.body) { doc.body.classList.add('is-exiting'); }
    // replace() swaps this page out of history, so Back does not return to it.
    window.location.replace(EXIT_URL);
  }

  $all('.quick-exit').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      quickExit();
    });
  });

  var lastEsc = 0;
  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' && e.key !== 'Esc') { return; }
    var now = Date.now();
    if (now - lastEsc < 1000) { lastEsc = 0; quickExit(); return; }
    lastEsc = now;
    // Single Esc dismisses the Quick exit hint (WCAG 1.4.13).
    $all('.quick-exit-wrap').forEach(function (w) { w.classList.add('hint-dismissed'); });
  });
  $all('.quick-exit-wrap').forEach(function (w) {
    w.addEventListener('mouseleave', function () { w.classList.remove('hint-dismissed'); });
    w.addEventListener('focusout', function () { w.classList.remove('hint-dismissed'); });
  });

  /* ---------- Mobile navigation ---------- */

  var toggle = doc.querySelector('.nav-toggle');
  var nav = doc.getElementById('site-nav');
  var wide = window.matchMedia ? window.matchMedia('(min-width: 1200px)') : null;

  function menuItems() { return [toggle].concat($all('a', nav)); }
  function isOpen() { return toggle && toggle.getAttribute('aria-expanded') === 'true'; }

  function openMenu() {
    toggle.setAttribute('aria-expanded', 'true');
    nav.classList.add('is-open');
    var first = nav.querySelector('a');
    if (first) { first.focus(); }
  }
  function closeMenu(returnFocus) {
    toggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    if (returnFocus) { toggle.focus(); }
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () { if (isOpen()) { closeMenu(true); } else { openMenu(); } });
    doc.addEventListener('keydown', function (e) {
      if (!isOpen()) { return; }
      if (e.key === 'Escape' || e.key === 'Esc') { closeMenu(true); return; }
      if (e.key !== 'Tab') { return; }
      // Trap focus within the toggle and the open menu.
      var items = menuItems();
      var i = items.indexOf(doc.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
      else if (i === -1) { e.preventDefault(); items[0].focus(); }
    });
    doc.addEventListener('click', function (e) {
      if (isOpen() && !nav.contains(e.target) && !toggle.contains(e.target)) { closeMenu(false); }
    });
    if (wide) {
      var onWide = function () { if (wide.matches && isOpen()) { closeMenu(false); } };
      if (wide.addEventListener) { wide.addEventListener('change', onWide); } else if (wide.addListener) { wide.addListener(onWide); }
    }
  }

  /* ---------- Prototype notice ---------- */

  var notice = doc.querySelector('.proto-notice');
  if (notice) {
    var dismissed = false;
    try { dismissed = window.localStorage.getItem(NOTICE_KEY) === '1'; } catch (e) { dismissed = false; }
    if (dismissed) {
      notice.hidden = true;
    } else {
      var btn = notice.querySelector('.proto-dismiss');
      if (btn) {
        btn.hidden = false;
        btn.addEventListener('click', function () {
          try { window.localStorage.setItem(NOTICE_KEY, '1'); } catch (e) { /* storage unavailable: hide for this page only */ }
          notice.hidden = true;
          var main = doc.getElementById('main');
          if (main) { main.focus(); }
        });
      }
    }
  }

  /* ---------- Footer year ---------- */

  $all('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  /* ---------- Placeholder links ---------- */

  $all('[data-placeholder-link]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); toast('Prototype: this link will be added once confirmed with ARC.'); });
  });
  $all('[data-placeholder-download]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); toast('Prototype: the file is not available yet. Read the summary on this page.'); });
  });

  /* ---------- Data-driven content ---------- */

  var D = getData();
  if (D) { render(D); }

  function hotlineFor(id) {
    var list = D.hotlines || [];
    if (id === 'primary') {
      for (var i = 0; i < list.length; i++) { if (list[i].primary) { return list[i]; } }
      return list[0];
    }
    for (var j = 0; j < list.length; j++) { if (list[j].id === id) { return list[j]; } }
    return null;
  }
  function waLink() {
    var h = (D.hotlines || []).filter(function (x) { return x.whatsapp; })[0];
    return h ? 'https://wa.me/' + String(h.tel || h.number).replace(/\D/g, '') : null;
  }

  function render() {
    // "Update once, change everywhere": hotline numbers and links.
    $all('[data-hl]').forEach(function (el) {
      var h = hotlineFor(el.getAttribute('data-hl'));
      if (h && h.number) { el.textContent = h.number; }
    });
    $all('[data-hl-tel]').forEach(function (el) {
      var h = hotlineFor(el.getAttribute('data-hl-tel'));
      if (h) { el.setAttribute('href', 'tel:' + (h.tel || toTel(h.number))); }
    });
    var wa = waLink();
    if (wa) { $all('[data-wa]').forEach(function (el) { el.setAttribute('href', wa); }); }

    $all('[data-render="hotlines"]').forEach(function (ul) {
      ul.innerHTML = (D.hotlines || []).map(function (h) {
        var href = h.whatsapp && wa ? wa : 'tel:' + (h.tel || toTel(h.number));
        return '<li><span class="hl-label">' + esc(h.label) + '</span><a href="' + esc(href) + '">' +
          (h.whatsapp ? icon('whatsapp') + '&nbsp;' : '') + esc(h.number) + '</a>' +
          (h.note ? ' <span class="hl-note">' + esc(h.note) + '</span>' : '') + '</li>';
      }).join('');
    });

    $all('[data-render="locations-compact"]').forEach(function (ul) {
      ul.innerHTML = (D.locations || []).map(function (l) {
        return '<li><strong>' + esc(l.name) + '</strong><span>' + esc(l.address) + '</span><a href="tel:' + esc(toTel(l.phone)) + '">' +
          icon('phone') + '<span class="visually-hidden">Call ' + esc(l.name) + ' on </span>' + esc(l.phone) + '</a></li>';
      }).join('');
    });

    $all('[data-render="locations"]').forEach(function (ul) {
      ul.innerHTML = (D.locations || []).map(locCard).join('');
      setupMaps(ul);
    });
    setupFilters();

    $all('[data-render="stats"]').forEach(function (ul) {
      ul.innerHTML = (D.stats || []).map(function (s) {
        return '<li><span class="stat-value">' + ph(s.value) + '</span><span class="stat-label">' + esc(s.label) + '</span></li>';
      }).join('');
    });

    $all('[data-render="news"]').forEach(function (ul) {
      var h = ul.getAttribute('data-heading') || 'h3';
      var limit = parseInt(ul.getAttribute('data-limit'), 10) || 0;
      var posts = (D.posts || []).filter(isLive).sort(function (a, b) { return a.date < b.date ? 1 : -1; });
      if (limit) { posts = posts.slice(0, limit); }
      ul.innerHTML = posts.length ? posts.map(function (p) { return newsCard(p, h); }).join('') :
        '<li><p>No news has been published yet.</p></li>';
    });

    renderArticle();
  }

  function locCard(l) {
    var name = esc(l.name);
    return '<li id="loc-' + esc(l.id) + '" data-city="' + esc(l.city) + '"><article class="card loc-card">' +
      '<h2>' + name + '</h2>' +
      '<p class="loc-line">' + icon('map') + '<span><span class="visually-hidden">Address: </span>' + esc(l.address) + '</span></p>' +
      '<p class="loc-line">' + icon('clock') + '<span><span class="visually-hidden">Opening hours: </span>' + ph(l.hours) + '</span></p>' +
      '<p class="loc-line">' + icon('phone') + '<span><span class="visually-hidden">Phone: </span>' + esc(l.phone) + '</span></p>' +
      '<div class="loc-actions">' +
      '<a class="btn btn--sm" href="tel:' + esc(toTel(l.phone)) + '">' + icon('phone') + 'Call<span class="visually-hidden"> ' + name + '</span></a>' +
      '<a class="btn btn--sm btn--ghost" href="' + esc(mapsUrl(l.address)) + '" rel="noreferrer">' + icon('map') + 'Get directions<span class="visually-hidden"> to ' + name + ' (Google Maps)</span></a>' +
      '<button type="button" class="link-button js-map-toggle" aria-expanded="false" aria-controls="map-' + esc(l.id) + '" data-address="' + esc(l.address) + '" data-name="' + name + '" hidden>Show map<span class="visually-hidden"> for ' + name + '</span></button>' +
      '</div><div class="loc-map" id="map-' + esc(l.id) + '" hidden></div></article></li>';
  }

  function newsCard(p, h) {
    return '<li><article class="card"><div class="card-top"><p class="meta"><time datetime="' + esc(p.date) + '">' + fmtDate(p.date) + '</time></p>' +
      (p.sample ? '<span class="badge badge--sample">Sample content</span>' : '') + '</div>' +
      '<' + h + '>' + esc(p.title) + '</' + h + '><p>' + esc(p.excerpt) + '</p>' +
      '<p class="card-foot"><a class="card-link" href="news-article.html?id=' + encodeURIComponent(p.id) + '">Read article<span class="visually-hidden">: ' +
      esc(p.title) + '</span>' + icon('arrow') + '</a></p></article></li>';
  }

  function bodyHtml(body) {
    return String(body || '').split(/\n{2,}/).map(function (b) {
      b = b.trim();
      if (!b) { return ''; }
      return b.indexOf('## ') === 0 ? '<h2>' + esc(b.slice(3)) + '</h2>' : '<p>' + esc(b) + '</p>';
    }).join('');
  }

  function renderArticle() {
    var wrap = doc.querySelector('[data-render="article"]');
    if (!wrap) { return; }
    var m = /[?&]id=([^&#]+)/.exec(window.location.search);
    var id = m ? decodeURIComponent(m[1]) : null;
    var posts = (D.posts || []).filter(isLive).sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    var post = id ? (D.posts || []).filter(function (p) { return p.id === id; })[0] : posts[0];
    var title = wrap.querySelector('[data-article="title"]');
    var body = wrap.querySelector('[data-article="body"]');
    var meta = wrap.querySelector('[data-article="meta"]');
    var crumb = wrap.querySelector('[data-article="crumb"]');
    if (!post || !isLive(post)) {
      title.textContent = 'This article is not available';
      crumb.textContent = 'Article not available';
      meta.textContent = '';
      body.innerHTML = '<p>It may not be published yet, or it may have been removed. <a href="news.html">See all news</a>.</p>';
      doc.title = 'Article not available | Adult Rape Clinic';
      return;
    }
    title.textContent = post.title;
    crumb.textContent = post.title;
    meta.innerHTML = '<time datetime="' + esc(post.date) + '">' + fmtDate(post.date) + '</time>, ' + esc(post.author);
    body.innerHTML = bodyHtml(post.body);
    doc.title = post.title + ' | Adult Rape Clinic';
    var url = window.location.href;
    var t = encodeURIComponent(post.title);
    var u = encodeURIComponent(url);
    var share = {
      whatsapp: 'https://wa.me/?text=' + t + '%20' + u,
      facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + u,
      x: 'https://twitter.com/intent/tweet?text=' + t + '&url=' + u,
      email: 'mailto:?subject=' + t + '&body=' + u
    };
    $all('[data-share]').forEach(function (a) { a.setAttribute('href', share[a.getAttribute('data-share')]); });
  }

  /* ---------- Locations: map toggle and city filter ---------- */

  function setupMaps(ctx) {
    $all('.js-map-toggle', ctx).forEach(function (btn) {
      btn.hidden = false;
      btn.addEventListener('click', function () {
        var panel = doc.getElementById(btn.getAttribute('aria-controls'));
        var open = btn.getAttribute('aria-expanded') === 'true';
        if (!open && !panel.innerHTML) {
          // Only now create the map link, so no map data is used until asked for.
          panel.innerHTML = '<p>Opening a map uses mobile data.</p><a href="https://www.openstreetmap.org/search?query=' +
            encodeURIComponent(btn.getAttribute('data-address')) + '" rel="noreferrer">Open map of ' +
            esc(btn.getAttribute('data-name')) + ' (OpenStreetMap)</a>';
        }
        panel.hidden = open;
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        btn.firstChild.nodeValue = open ? 'Show map' : 'Hide map';
      });
    });
  }

  function setupFilters() {
    var group = doc.querySelector('[data-filter]');
    var list = doc.querySelector('[data-render="locations"]');
    if (!group || !list) { return; }
    group.hidden = false;
    var status = doc.getElementById('filter-status');
    $all('.filter-btn', group).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var city = btn.getAttribute('data-city');
        $all('.filter-btn', group).forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
        var shown = 0;
        $all('[data-city]', list).forEach(function (li) {
          var match = city === 'all' || li.getAttribute('data-city') === city;
          li.hidden = !match;
          if (match) { shown++; }
        });
        if (status) { status.textContent = 'Showing ' + shown + (shown === 1 ? ' clinic' : ' clinics') + '.'; }
      });
    });
  }

  /* ---------- Contact form (demo: sends nothing) ---------- */

  var form = doc.getElementById('contact-form');
  if (form) {
    $all('[data-enable]', form).forEach(function (b) { b.disabled = false; });
    var contact = doc.getElementById('cf-contact');
    var message = doc.getElementById('cf-message');
    var statusEl = doc.getElementById('cf-status');

    var setError = function (input, msg) {
      var err = doc.getElementById(input.id + '-err');
      err.textContent = msg ? 'Error: ' + msg : '';
      if (msg) { input.setAttribute('aria-invalid', 'true'); } else { input.removeAttribute('aria-invalid'); }
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      statusEl.innerHTML = '';
      var c = contact.value.trim();
      var okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c);
      var okPhone = /^\+?[\d\s()-]{7,}$/.test(c);
      var first = null;
      if (!c) { setError(contact, 'Enter an email address or phone number so we can reply.'); first = contact; }
      else if (!okEmail && !okPhone) { setError(contact, 'Enter a valid email address (like name@example.com) or a phone number (like 0771 234 567).'); first = contact; }
      else { setError(contact, ''); }
      if (!message.value.trim()) { setError(message, 'Enter your message.'); first = first || message; }
      else { setError(message, ''); }
      if (first) { first.focus(); return; }
      form.reset();
      statusEl.innerHTML = '<p>Prototype only: this message was not sent.</p>';
    });
  }
})();
