/*
 * ARC prototype: demo CMS (Advanced CMS Package).
 * No login and no server. Edits are saved to localStorage in this browser
 * ("arc_demo_overrides") and picked up by main.js on the public pages.
 */
(function () {
  'use strict';

  var doc = document;
  var STORE_KEY = 'arc_demo_overrides';
  var LOG_KEY = 'arc_demo_activity';
  var USER = 'Demo Editor';
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var BASE = window.ARC_DATA || { hotlines: [], locations: [], stats: [], posts: [], site: {} };

  /* ---------- helpers ---------- */

  function $(id) { return doc.getElementById(id); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function fmtDate(iso) {
    var p = String(iso || '').split('-');
    return p.length < 3 ? esc(iso) : parseInt(p[2], 10) + ' ' + MONTHS[parseInt(p[1], 10) - 1] + ' ' + p[0];
  }
  function fmtTime(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function toTel(n) {
    var d = String(n || '').replace(/[^\d+]/g, '');
    if (d.charAt(0) === '0' && d.length === 10) { d = '+263' + d.slice(1); }
    return d;
  }

  var toastTimer;
  function toast(msg) {
    var t = $('toast');
    if (!t) { return; }
    t.textContent = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.textContent = ''; }, 6000);
  }

  /* ---------- storage ---------- */

  function readJSON(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function writeJSON(key, val) {
    try { window.localStorage.setItem(key, JSON.stringify(val)); return true; } catch (e) { return false; }
  }

  function getData() {
    var o = readJSON(STORE_KEY, {}) || {};
    var out = clone(BASE);
    ['hotlines', 'locations', 'stats', 'posts'].forEach(function (k) {
      if (Array.isArray(o[k]) && o[k].length) { out[k] = o[k]; }
    });
    return out;
  }
  function saveSection(key, value) {
    var o = readJSON(STORE_KEY, {}) || {};
    o[key] = value;
    var ok = writeJSON(STORE_KEY, o);
    if (!ok) { toast('Could not save: browser storage is unavailable (for example in a private window).'); }
    return ok;
  }

  function log(text) {
    var list = readJSON(LOG_KEY, []) || [];
    list.unshift({ time: new Date().toISOString(), text: text, user: USER });
    writeJSON(LOG_KEY, list.slice(0, 200));
  }

  /* ---------- posts: status and accessibility checker ---------- */

  function displayStatus(p) {
    if (p.status === 'published' && p.publishAt) {
      var t = Date.parse(p.publishAt);
      if (!isNaN(t) && t > Date.now()) { return 'scheduled'; }
    }
    return p.status;
  }
  var STATUS_LABEL = { draft: 'Draft', review: 'In review', published: 'Published', scheduled: 'Scheduled' };

  function isAllCaps(s) {
    var letters = String(s).replace(/[^A-Za-z]/g, '');
    return letters.length > 3 && letters === letters.toUpperCase();
  }

  // Returns [{ severity: 'error'|'warning', message }]. Errors block submission.
  function checkPost(p) {
    var issues = [];
    if (!String(p.title || '').trim()) {
      issues.push({ severity: 'error', message: 'The title is empty. Add a clear, descriptive title.' });
    } else if (isAllCaps(p.title)) {
      issues.push({ severity: 'warning', message: 'The title is in ALL CAPITALS. Use sentence case: capitals are harder to read and some screen readers spell them out.' });
    }
    if (p.image && !String(p.alt || '').trim()) {
      issues.push({ severity: 'error', message: 'The image "' + p.image + '" has no alt text. Describe what the image shows, or remove the image.' });
    }
    var text = (p.body || '') + '\n' + (p.excerpt || '');
    var vague = text.match(/\b(click here|read more)\b/gi);
    if (vague) {
      issues.push({ severity: 'warning', message: 'Vague link text found ("' + vague[0] + '"). Describe where the link goes, for example "Read the 2025 annual report".' });
    }
    String(p.body || '').split('\n').forEach(function (line) {
      if (/^##\s+/.test(line) && isAllCaps(line.replace(/^##\s+/, ''))) {
        issues.push({ severity: 'warning', message: 'The heading "' + line.replace(/^##\s+/, '') + '" is in ALL CAPITALS. Use sentence case.' });
      }
    });
    return issues;
  }

  function renderIssues(box, issues) {
    var errors = issues.filter(function (i) { return i.severity === 'error'; }).length;
    var warnings = issues.length - errors;
    box.hidden = false;
    box.className = 'panel checker' + (errors ? ' has-errors' : warnings ? ' has-warnings' : '');
    var summary = errors ? errors + (errors === 1 ? ' problem must' : ' problems must') + ' be fixed before this post can be submitted.' :
      warnings ? 'No blocking problems. ' + warnings + (warnings === 1 ? ' warning' : ' warnings') + ' to review.' :
      'No accessibility problems found.';
    box.innerHTML = '<h2 id="checker-title">Accessibility check</h2><p>' + esc(summary) + '</p>' +
      (issues.length ? '<ul>' + issues.map(function (i) {
        return '<li><span class="sev sev--' + i.severity + '">' + (i.severity === 'error' ? 'Must fix:' : 'Warning:') + '</span> ' + esc(i.message) + '</li>';
      }).join('') + '</ul>' : '');
    box.focus();
    return errors === 0;
  }

  /* ---------- page: dashboard ---------- */

  function initDashboard() {
    var d = getData();
    var review = d.posts.filter(function (p) { return p.status === 'review'; }).length;
    var warnings = 0;
    d.posts.forEach(function (p) { warnings += checkPost(p).length; });
    var entries = readJSON(LOG_KEY, []) || [];
    $('tile-review').textContent = String(review);
    $('tile-a11y').textContent = String(warnings);
    if (entries.length) {
      var t = new Date(entries[0].time);
      $('tile-updated').textContent = fmtTime(t);
      $('tile-updated-note').textContent = fmtDate(entries[0].time.slice(0, 10)) + ': ' + entries[0].text;
    }
    var recent = $('recent');
    recent.innerHTML = entries.length ? entries.slice(0, 5).map(logItem).join('') : '<li>No changes yet. Try editing a hotline on the Content page.</li>';
  }

  /* ---------- page: content forms ---------- */

  var SECTIONS = {
    hotlines: {
      title: 'Hotlines',
      fields: [['label', 'Label'], ['number', 'Phone number'], ['note', 'Note (optional)']],
      legend: function (h) { return h.label + (h.primary ? ' (shown in the emergency bar on every page)' : ''); },
      required: ['label', 'number'],
      after: function (item) { if (!item.whatsapp) { item.tel = toTel(item.number); } else { item.tel = '+' + String(item.number).replace(/\D/g, ''); } }
    },
    locations: {
      title: 'Locations',
      fields: [['name', 'Clinic name'], ['address', 'Address'], ['hours', 'Opening hours'], ['phone', 'Phone number']],
      legend: function (l) { return l.name; },
      required: ['name', 'address', 'phone']
    },
    stats: {
      title: 'Statistics',
      fields: [['label', 'Label'], ['value', 'Value']],
      legend: function (s) { return s.label; },
      required: ['label', 'value']
    }
  };

  function renderSectionForm(key) {
    var cfg = SECTIONS[key];
    var items = getData()[key];
    var form = $('form-' + key);
    form.innerHTML = items.map(function (item, idx) {
      return '<fieldset><legend>' + esc(cfg.legend(item)) + '</legend><div class="field-grid">' +
        cfg.fields.map(function (f) {
          var id = key + '-' + idx + '-' + f[0];
          var req = cfg.required.indexOf(f[0]) !== -1;
          return '<div class="field"><label for="' + id + '">' + esc(f[1]) + (req ? ' (required)' : '') + '</label>' +
            '<input id="' + id + '" name="' + f[0] + '" data-idx="' + idx + '" value="' + esc(item[f[0]]) + '"' +
            (req ? ' required aria-describedby="' + id + '-err"' : '') + '>' +
            (req ? '<p class="field-error" id="' + id + '-err"></p>' : '') + '</div>';
        }).join('') + '</div></fieldset>';
    }).join('') + '<div class="btn-row"><button class="btn" type="submit">Save ' + esc(cfg.title.toLowerCase()) + '</button></div>';
  }

  function saveSectionForm(key) {
    var cfg = SECTIONS[key];
    var items = clone(getData()[key]);
    var form = $('form-' + key);
    var firstBad = null;
    var changed = [];
    $all('input', form).forEach(function (input) {
      var idx = parseInt(input.getAttribute('data-idx'), 10);
      var name = input.name;
      var val = input.value.trim();
      var err = $(input.id + '-err');
      if (cfg.required.indexOf(name) !== -1 && !val) {
        input.setAttribute('aria-invalid', 'true');
        if (err) { err.textContent = 'Error: this field is required.'; }
        firstBad = firstBad || input;
        return;
      }
      input.removeAttribute('aria-invalid');
      if (err) { err.textContent = ''; }
      if (String(items[idx][name]) !== val) {
        items[idx][name] = val;
        if (changed.indexOf(idx) === -1) { changed.push(idx); }
      }
    });
    if (firstBad) { firstBad.focus(); toast('Please fix the highlighted fields.'); return; }
    if (!changed.length) { toast('No changes to save.'); return; }
    if (cfg.after) { items.forEach(cfg.after); }
    if (!saveSection(key, items)) { return; }
    changed.forEach(function (idx) {
      var label = items[idx].label || items[idx].name;
      var noun = key === 'hotlines' ? 'Hotline' : key === 'locations' ? 'Location' : 'Statistic';
      log(noun + ' updated: ' + label);
    });
    renderSectionForm(key);
    toast('Saved. Updated on ' + (BASE.site.pageCount || 15) + ' pages.');
  }

  function initContent() {
    Object.keys(SECTIONS).forEach(function (key) {
      renderSectionForm(key);
      $('form-' + key).addEventListener('submit', function (e) { e.preventDefault(); saveSectionForm(key); });
    });

    // Accessible tabs: arrow keys, Home and End move between tabs.
    var tabs = $all('[role="tab"]');
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        $(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) { tab.focus(); }
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') { next = tabs[(i + 1) % tabs.length]; }
        else if (e.key === 'ArrowLeft') { next = tabs[(i - 1 + tabs.length) % tabs.length]; }
        else if (e.key === 'Home') { next = tabs[0]; }
        else if (e.key === 'End') { next = tabs[tabs.length - 1]; }
        if (next) { e.preventDefault(); select(next, true); }
      });
    });

    $('reset-demo').addEventListener('click', function () {
      if (!window.confirm('Reset all demo content to the original defaults? This clears changes saved in this browser.')) { return; }
      try { window.localStorage.removeItem(STORE_KEY); } catch (e) { /* nothing stored */ }
      log('Demo data reset to defaults');
      Object.keys(SECTIONS).forEach(renderSectionForm);
      toast('Demo data reset. The public site now shows the original content.');
    });
  }

  /* ---------- page: posts and editorial workflow ---------- */

  var editingId = null;
  var pendingImage = '';

  function posts() { return getData().posts; }
  function savePosts(list) { return saveSection('posts', list); }

  function renderTable() {
    var body = $('posts-body');
    var list = posts().slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    body.innerHTML = list.map(function (p) {
      var st = displayStatus(p);
      var t = esc(p.title || '(untitled)');
      var actions = ['<button type="button" class="btn btn--sm btn--ghost" data-act="edit" data-id="' + esc(p.id) + '">Edit<span class="visually-hidden"> ' + t + '</span></button>'];
      if (p.status === 'draft') {
        actions.push('<button type="button" class="btn btn--sm" data-act="submit" data-id="' + esc(p.id) + '">Submit for review<span class="visually-hidden">: ' + t + '</span></button>');
      } else if (p.status === 'review') {
        actions.push('<button type="button" class="btn btn--sm" data-act="approve" data-id="' + esc(p.id) + '">Approve &amp; publish<span class="visually-hidden">: ' + t + '</span></button>');
        actions.push('<button type="button" class="btn btn--sm btn--ghost" data-act="draft" data-id="' + esc(p.id) + '">Return to draft<span class="visually-hidden">: ' + t + '</span></button>');
      } else {
        actions.push('<button type="button" class="btn btn--sm btn--ghost" data-act="draft" data-id="' + esc(p.id) + '">Unpublish<span class="visually-hidden">: ' + t + '</span></button>');
        if (st === 'published') {
          actions.push('<a class="btn btn--sm btn--ghost" href="../news-article.html?id=' + encodeURIComponent(p.id) + '">View on site<span class="visually-hidden">: ' + t + '</span></a>');
        }
      }
      return '<tr><td><strong>' + t + '</strong><br><span class="muted">' + esc(p.author || USER) + '</span></td>' +
        '<td><span class="status status--' + st + '">' + STATUS_LABEL[st] + '</span>' +
        (st === 'scheduled' ? '<br><span class="muted">' + esc(p.publishAt.replace('T', ' ')) + '</span>' : '') + '</td>' +
        '<td>' + fmtDate(p.date) + '</td><td><div class="btn-row">' + actions.join('') + '</div></td></tr>';
    }).join('');
    var review = list.filter(function (p) { return p.status === 'review'; }).length;
    $('review-count').textContent = review ? review + (review === 1 ? ' post is' : ' posts are') + ' waiting for review.' : 'No posts are waiting for review.';
  }

  function setStatus(id, status) {
    var list = posts();
    var p = list.filter(function (x) { return x.id === id; })[0];
    if (!p) { return; }
    if (status !== 'draft') {
      var ok = renderIssues($('checker'), checkPost(p));
      if (!ok) { openEditor(p, true); return; }
    }
    p.status = status;
    if (status === 'published') { p.date = p.publishAt ? p.publishAt.slice(0, 10) : today(); }
    if (!savePosts(list)) { return; }
    var verb = status === 'review' ? 'submitted for review' : status === 'published' ? (displayStatus(p) === 'scheduled' ? 'approved and scheduled' : 'approved and published') : 'returned to draft';
    log('Post ' + verb + ': ' + p.title);
    renderTable();
    toast('"' + p.title + '" ' + verb + '.');
  }

  function openEditor(p, keepChecker) {
    editingId = p ? p.id : null;
    pendingImage = p ? (p.image || '') : '';
    $('editor-title').textContent = p ? 'Edit post' : 'New post';
    $('pe-title').value = p ? p.title : '';
    $('pe-excerpt').value = p ? p.excerpt : '';
    $('pe-body').value = p ? p.body : '';
    $('pe-alt').value = p ? (p.alt || '') : '';
    $('pe-publish').value = p ? (p.publishAt || '') : '';
    $('pe-image').value = '';
    updateImageNote();
    $('editor').hidden = false;
    if (!keepChecker) { $('checker').hidden = true; }
    $('editor').scrollIntoView();
    if (!keepChecker) { $('pe-title').focus(); }
  }

  function updateImageNote() {
    $('pe-image-current').textContent = pendingImage ? 'Current image: ' + pendingImage : 'No image selected.';
    $('pe-image-remove').hidden = !pendingImage;
  }

  function readEditor() {
    return {
      title: $('pe-title').value.trim(),
      excerpt: $('pe-excerpt').value.trim(),
      body: $('pe-body').value.replace(/\r/g, ''),
      image: pendingImage,
      alt: $('pe-alt').value.trim(),
      publishAt: $('pe-publish').value
    };
  }

  function saveEditor(targetStatus) {
    var v = readEditor();
    if (targetStatus === 'review') {
      if (!renderIssues($('checker'), checkPost(v))) { return; }
    } else if (!v.title) {
      renderIssues($('checker'), checkPost(v));
      return;
    }
    var list = posts();
    var p = editingId ? list.filter(function (x) { return x.id === editingId; })[0] : null;
    if (!p) {
      p = { id: 'p' + Date.now(), date: today(), author: USER, status: 'draft', sample: false };
      list.push(p);
    }
    ['title', 'excerpt', 'body', 'image', 'alt', 'publishAt'].forEach(function (k) { p[k] = v[k]; });
    p.status = targetStatus;
    if (!savePosts(list)) { return; }
    log((editingId ? 'Post edited' : 'Post created') + (targetStatus === 'review' ? ' and submitted for review: ' : ' (draft): ') + p.title);
    editingId = p.id;
    renderTable();
    $('editor').hidden = true;
    toast(targetStatus === 'review' ? 'Submitted for review. An approver can now publish it.' : 'Draft saved.');
    $('new-post').focus();
  }

  function initPosts() {
    renderTable();
    $('posts-body').addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('button[data-act]') : null;
      if (!btn) { return; }
      var id = btn.getAttribute('data-id');
      var act = btn.getAttribute('data-act');
      if (act === 'edit') { openEditor(posts().filter(function (p) { return p.id === id; })[0], false); }
      else if (act === 'submit') { setStatus(id, 'review'); }
      else if (act === 'approve') { setStatus(id, 'published'); }
      else if (act === 'draft') { setStatus(id, 'draft'); }
    });
    $('new-post').addEventListener('click', function () { openEditor(null, false); });
    $('pe-image').addEventListener('change', function () {
      // Mock upload: only the file name is kept; the file is never read.
      var f = this.files && this.files[0];
      if (f) { pendingImage = f.name; updateImageNote(); }
    });
    $('pe-image-remove').addEventListener('click', function () { pendingImage = ''; $('pe-image').value = ''; updateImageNote(); $('pe-image').focus(); });
    $('post-form').addEventListener('submit', function (e) { e.preventDefault(); saveEditor('review'); });
    $('save-draft').addEventListener('click', function () { saveEditor('draft'); });
    $('run-check').addEventListener('click', function () { renderIssues($('checker'), checkPost(readEditor())); });
    $('cancel-edit').addEventListener('click', function () { $('editor').hidden = true; $('checker').hidden = true; $('new-post').focus(); });
  }

  /* ---------- page: activity log ---------- */

  function logItem(e) {
    var d = new Date(e.time);
    return '<li>' + esc(e.text) + ' by ' + esc(e.user) + ', ' + fmtTime(d) +
      '<time datetime="' + esc(e.time) + '">' + fmtDate(e.time.slice(0, 10)) + '</time></li>';
  }

  function initActivity() {
    function draw() {
      var entries = readJSON(LOG_KEY, []) || [];
      $('log').innerHTML = entries.length ? entries.map(logItem).join('') : '<li>No activity yet. Changes made in this demo will appear here.</li>';
    }
    draw();
    $('clear-log').addEventListener('click', function () {
      try { window.localStorage.removeItem(LOG_KEY); } catch (e) { /* nothing stored */ }
      draw();
      toast('Activity log cleared.');
    });
  }

  /* ---------- boot ---------- */

  var pageName = doc.body.getAttribute('data-page');
  if (pageName === 'dashboard') { initDashboard(); }
  else if (pageName === 'content') { initContent(); }
  else if (pageName === 'posts') { initPosts(); }
  else if (pageName === 'activity') { initActivity(); }
})();
