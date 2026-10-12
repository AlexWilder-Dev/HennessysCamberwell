/* Hennessy's, Camberwell. All data on this page is static; nothing is sent anywhere. */
(function () {
  'use strict';
  window.hennessys = true;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LAT = 51.4745;   // 225 Camberwell New Road, roughly
  var LNG = -0.0985;
  var OPEN_HOUR = 12;  // 12pm to midnight, seven days

  /* ---------- London time ---------- */

  var londonFmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
  });

  function london(date) {
    var p = {};
    londonFmt.formatToParts(date || new Date()).forEach(function (part) { p[part.type] = +part.value; });
    var dow = new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay();
    return { y: p.year, m: p.month, d: p.day, h: p.hour % 24, min: p.minute, dow: dow };
  }

  function isoDay(t) {
    return t.y + '-' + String(t.m).padStart(2, '0') + '-' + String(t.d).padStart(2, '0');
  }

  var timeFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: 'numeric', minute: '2-digit', hour12: true });
  function clock(date) {
    return timeFmt.format(date).replace(/\s/g, '').replace(/^0/, '').toLowerCase();
  }

  /* ---------- Open now ---------- */

  function updateStatus() {
    var now = london();
    var open = now.h >= OPEN_HOUR;
    var text = open ? 'Open now · until midnight' : 'Opens today at 12pm';
    document.querySelectorAll('[data-status]').forEach(function (el) {
      el.classList.toggle('is-open', open);
      var t = el.querySelector('.status__text');
      if (t && t.textContent !== text) t.textContent = text;
    });
    document.querySelectorAll('[data-hours] li').forEach(function (li, i) {
      // List runs Monday to Sunday
      li.classList.toggle('is-today', (i + 1) % 7 === now.dow);
    });
  }

  /* ---------- Settling in ---------- */

  var settleObserver = null;
  if ('IntersectionObserver' in window) {
    settleObserver = new IntersectionObserver(function (entries) {
      var arriving = entries.filter(function (e) { return e.isIntersecting; }).map(function (e) { return e.target; });
      arriving.sort(function (a, b) { return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1; });
      arriving.forEach(function (el, i) {
        // Things arriving together come in one after another, unhurried
        if (!el.style.getPropertyValue('--delay')) el.style.setProperty('--delay', (i * 0.16).toFixed(2) + 's');
        el.classList.add('is-settled');
        settleObserver.unobserve(el);
        if (el.hasAttribute('data-menu')) staggerChildren(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  }

  function staggerChildren(list) {
    Array.prototype.forEach.call(list.children, function (child, i) {
      child.style.setProperty('--delay', (0.15 + i * 0.12).toFixed(2) + 's');
    });
  }

  function settle(el) {
    if (settleObserver && !reduceMotion) settleObserver.observe(el);
    else el.classList.add('is-settled');
  }

  /* ---------- Header and navigation ---------- */

  function initBar() {
    var bar = document.querySelector('[data-bar]');
    var name = document.querySelector('.hero__name');
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-nav]');
    if (!bar) return;

    if (name && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        bar.classList.toggle('is-solid', !entries[0].isIntersecting);
      }, { rootMargin: '-56px 0px 0px 0px', threshold: 0 }).observe(name);
    } else {
      bar.classList.add('is-solid');
    }

    if (!toggle || !nav) return;
    var desktop = window.matchMedia('(min-width: 60em)');

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      document.documentElement.classList.toggle('nav-open', open);
    }
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
    desktop.addEventListener('change', function () { setOpen(false); });
  }

  /* ---------- Photos ---------- */
  // A photo that fails to load is removed, so the page never shows an empty frame.

  function initPhotos() {
    document.querySelectorAll('img[data-optional]').forEach(function (img) {
      var show = function () { img.classList.add('is-loaded'); };
      if (img.complete && img.naturalWidth) show();
      else if (img.complete) img.remove();
      else {
        img.addEventListener('load', show);
        img.addEventListener('error', function () { img.remove(); });
      }
    });
    document.querySelectorAll('[data-photo] img').forEach(function (img) {
      var fig = img.closest('[data-photo]');
      var drop = function () { fig.remove(); };
      if (img.complete && !img.naturalWidth && img.currentSrc) drop();
      else img.addEventListener('error', drop);
    });
  }

  /* ---------- What's on ---------- */
  // Quiz night is on Mondays, live music on Fridays. The Friday line-up is in the HTML.

  function initWhatsOn() {
    var t = london();
    var today = isoDay(t);
    var acts = {};

    var lineup = document.querySelector('[data-lineup]');
    if (lineup) {
      var left = 0;
      lineup.querySelectorAll('[data-date]').forEach(function (li) {
        var date = li.getAttribute('data-date');
        var spans = li.querySelectorAll('span');
        if (spans.length > 1) acts[date] = spans[1].textContent.trim();
        var past = date < today;
        li.hidden = past;
        if (!past) left++;
      });
      lineup.hidden = left === 0;
    }

    var item = document.querySelector('.bill__item[data-day="' + t.dow + '"]');
    var note = document.querySelector('[data-tonight]');
    if (!item) return;
    item.classList.add('is-tonight');
    if (!note) return;
    if (t.dow === 1) note.textContent = 'Tonight: quiz night from 7pm';
    if (t.dow === 5) note.textContent = 'Tonight: live music from 7:30pm' + (acts[today] ? ' with ' + acts[today] : '');
    note.hidden = !note.textContent;
  }

  /* ---------- Outside: today's sunset over Camberwell ---------- */
  // Sunset from the standard solar position formulas (accurate to a minute or two).

  function sunset(dateUtcNoon, lat, lng) {
    var rad = Math.PI / 180, dayMs = 86400000, J1970 = 2440588, J2000 = 2451545;
    var e = rad * 23.4397;
    var d = dateUtcNoon.valueOf() / dayMs - 0.5 + J1970 - J2000;
    var lw = rad * -lng, phi = rad * lat;
    var n = Math.round(d - 0.0009 - lw / (2 * Math.PI));
    var ds = 0.0009 + lw / (2 * Math.PI) + n;
    var M = rad * (357.5291 + 0.98560028 * ds);
    var C = rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
    var L = M + C + rad * 102.9372 + Math.PI;
    var dec = Math.asin(Math.sin(e) * Math.sin(L));
    var w = Math.acos((Math.sin(rad * -0.833) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec)));
    var a = 0.0009 + (w + lw) / (2 * Math.PI) + n;
    var Jset = J2000 + a + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
    return new Date((Jset + 0.5 - J1970) * dayMs);
  }

  function initSunset() {
    var el = document.querySelector('[data-sunset]');
    if (!el) return;
    var now = new Date();
    var t = london(now);
    var set = sunset(new Date(Date.UTC(t.y, t.m - 1, t.d, 12)), LAT, LNG);
    if (now < set) {
      el.textContent = 'Sun’s up until ' + clock(set) + ' today';
    } else {
      var next = sunset(new Date(Date.UTC(t.y, t.m - 1, t.d + 1, 12)), LAT, LNG);
      el.textContent = 'Sunset tomorrow at ' + clock(next);
    }
    el.hidden = false;
  }

  /* ---------- Food: sample menu ---------- */
  // PLACEHOLDER: data/menu.json holds five sample pub classics, not the pub's real menu.

  function initMenu() {
    var list = document.querySelector('[data-menu]');
    if (!list) return;
    fetch('data/menu.json')
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        (data.items || []).forEach(function (item) {
          var li = document.createElement('li');
          li.className = 'dish';
          var name = document.createElement('p');
          name.className = 'dish__name';
          name.textContent = item.name;
          var desc = document.createElement('p');
          desc.className = 'dish__desc';
          desc.textContent = item.description;
          li.appendChild(name);
          li.appendChild(desc);
          list.appendChild(li);
        });
        settle(list);
      })
      .catch(function () { list.remove(); });
  }

  /* ---------- History: the line pours down the timeline ---------- */

  function initTimeline() {
    var tl = document.querySelector('[data-timeline]');
    if (!tl) return;
    var eras = Array.prototype.slice.call(tl.querySelectorAll('.era'));

    if (reduceMotion) {
      tl.style.setProperty('--pour', 1);
      eras.forEach(function (e) { e.classList.add('is-poured'); });
      return;
    }

    var target = 0, current = 0, raf = null;
    function measure() {
      var r = tl.getBoundingClientRect();
      var reach = window.innerHeight * 0.62 - r.top;
      target = Math.min(1, Math.max(0, reach / r.height));
    }
    function tick() {
      // Ease towards the scroll position rather than tracking it exactly
      current += (target - current) * 0.045;
      if (Math.abs(target - current) < 0.0008) current = target;
      tl.style.setProperty('--pour', current.toFixed(4));
      var depth = current * tl.offsetHeight;
      eras.forEach(function (e) {
        if (e.offsetTop + 12 <= depth) e.classList.add('is-poured');
      });
      raf = current === target ? null : requestAnimationFrame(tick);
    }
    function onScroll() {
      measure();
      if (!raf) raf = requestAnimationFrame(tick);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  /* ---------- The pint: a slow cascade ---------- */
  // Fine bubbles drift down, as they do in a fresh stout, quick at first and then settling.

  function initCascade() {
    var canvas = document.querySelector('[data-cascade]');
    if (!canvas || reduceMotion || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var w = 0, h = 0, parts = [], running = false, started = null, last = 0;

    function make(anywhere) {
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : -4 - Math.random() * 40,
        r: 0.5 + Math.random() * 1.2,
        v: 7 + Math.random() * 17,
        a: 0.06 + Math.random() * 0.22,
        sway: (Math.random() - 0.5) * 6,
        ph: Math.random() * Math.PI * 2
      };
    }
    function resize() {
      var r = canvas.getBoundingClientRect();
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.max(40, Math.min(170, Math.round(w * h / 7000)));
      parts = [];
      for (var i = 0; i < count; i++) parts.push(make(true));
    }
    function frame(ts) {
      if (!running) return;
      if (started === null) { started = ts; last = ts; }
      var dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;
      var age = (ts - started) / 1000;
      var surge = 1 + 2.4 * Math.exp(-age / 2.8);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#efe5cf';
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.y += p.v * surge * dt;
        p.x += Math.sin(ts / 1700 + p.ph) * p.sway * dt;
        if (p.y > h + 4) parts[i] = p = make(false);
        ctx.globalAlpha = p.a * (1 - 0.65 * (p.y / h));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }

    resize();
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    });
    if (!('IntersectionObserver' in window)) { running = true; requestAnimationFrame(frame); return; }
    new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      if (visible && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
      if (!visible) running = false;
    }).observe(canvas);
  }

  /* ---------- Copy address ---------- */

  var toastTimer;
  function toast(message) {
    var el = document.querySelector('[data-toast]');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-shown'); }, 2600);
  }

  function fallbackCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(area);
    return ok;
  }

  function initCopy() {
    document.querySelectorAll('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var text = btn.getAttribute('data-copy');
        var done = function () { toast('Address copied'); };
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(done, function () { if (fallbackCopy(text)) done(); });
        } else if (fallbackCopy(text)) {
          done();
        }
      });
    });
  }

  /* ---------- Start ---------- */

  function start() {
    updateStatus();
    setInterval(updateStatus, 30000);
    initBar();
    initPhotos();
    initWhatsOn();
    initSunset();
    initMenu();
    initTimeline();
    initCascade();
    initCopy();
    document.querySelectorAll('[data-settle]').forEach(settle);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
