/* Hennessy's, Camberwell. All data on this page is static; nothing is sent anywhere. */
(function () {
  'use strict';
  window.hennessys = true;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LAT = 51.4745;   // 225 Camberwell New Road, roughly
  var LNG = -0.0985;
  var OPEN_HOUR = 12;  // 12pm to midnight, seven days

  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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

  // The instant at which it is hh:00 on a given London calendar day.
  function londonInstant(y, m, d, hh) {
    var guess = Date.UTC(y, m - 1, d, hh);
    var offset = london(new Date(guess)).h - hh;
    if (offset > 12) offset -= 24;
    if (offset < -12) offset += 24;
    return new Date(guess - offset * 3600000);
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
        if (el.hasAttribute('data-week') || el.hasAttribute('data-menu')) staggerChildren(el);
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
    var hero = document.querySelector('.fascia');
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-nav]');
    if (!bar) return;

    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        bar.classList.toggle('is-solid', !entries[0].isIntersecting);
      }, { rootMargin: '-56px 0px 0px 0px', threshold: 0 }).observe(hero.querySelector('.fascia__name') || hero);
    } else {
      bar.classList.add('is-solid');
    }

    if (!toggle || !nav) return;
    var desktop = window.matchMedia('(min-width: 60em)');

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      document.documentElement.classList.toggle('nav-open', open);
      bar.classList.toggle('is-menu', open);
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

  /* ---------- Photo slots ---------- */
  // Each slot names a file in photos/. If the file is there it fades in; if not, the labelled slot stays.

  function initPhotos() {
    var slots = document.querySelectorAll('[data-photo]');
    function load(fig) {
      var img = fig.querySelector('img');
      var src = fig.getAttribute('data-photo');
      if (!img || !src) return;
      var probe = new Image();
      probe.onload = function () {
        img.src = src;
        var show = function () { fig.classList.add('has-photo'); };
        if (img.decode) img.decode().then(show, show); else show();
      };
      probe.src = src;
    }
    if (!('IntersectionObserver' in window)) { slots.forEach(load); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { load(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: '600px 0px' });
    slots.forEach(function (fig) {
      if (fig.hasAttribute('data-photo-eager')) load(fig); else io.observe(fig);
    });
  }

  /* ---------- What's on: a rolling week from today ---------- */

  var SHORT_MONTHS = MONTHS.map(function (m) { return m.slice(0, 3); });

  function icon(id) {
    return '<svg aria-hidden="true"><use href="#' + id + '"/></svg>';
  }

  function initWeek() {
    var list = document.querySelector('[data-week]');
    var next = document.querySelector('[data-next-music]');
    if (!list) return;
    var today = london();
    var base = Date.UTC(today.y, today.m - 1, today.d, 12);
    var html = '';
    var nextSat = null;

    for (var i = 0; i < 7; i++) {
      var day = new Date(base + i * 86400000);
      var dow = day.getUTCDay();
      var isSat = dow === 6;
      if (isSat && nextSat === null) nextSat = { offset: i, date: day };
      var rel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : DAYS[dow];
      var date = DAYS[dow].slice(0, 3) + ' ' + day.getUTCDate() + ' ' + SHORT_MONTHS[day.getUTCMonth()];
      var spoken = (isSat ? 'Live music, ' : '') + 'sport on TV, darts and pool';

      html += '<li class="day' + (isSat ? ' day--music' : '') + (i === 0 ? ' is-today' : '') + '">' +
        '<p class="day__when"><span class="day__rel">' + rel + '</span><span class="day__date">' + date + '</span></p>' +
        '<p class="day__on">' +
          (isSat ? '<span class="day__feature">' + icon('i-music') + 'Live music</span>' : '') +
          '<span class="day__icons" aria-hidden="true">' + icon('i-tv') + icon('i-darts') + icon('i-pool') + '</span>' +
          '<span class="visually-hidden">' + spoken + '</span>' +
        '</p>' +
      '</li>';
    }
    list.innerHTML = html;

    if (next && nextSat) {
      var when;
      if (nextSat.offset === 0) when = 'today';
      else if (nextSat.offset === 1) when = 'tomorrow';
      else when = 'Saturday ' + nextSat.date.getUTCDate() + ' ' + MONTHS[nextSat.date.getUTCMonth()];
      next.innerHTML = 'Next live music: <strong>' + when + '</strong>';
    }
  }

  /* ---------- Outside: today's sunset over Camberwell ---------- */
  // Sunrise and sunset from the standard solar position formulas (accurate to a minute or two).

  function sunTimes(dateUtcNoon, lat, lng) {
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
    var Jnoon = J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
    var w = Math.acos((Math.sin(rad * -0.833) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec)));
    var a = 0.0009 + (w + lw) / (2 * Math.PI) + n;
    var Jset = J2000 + a + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
    var Jrise = Jnoon - (Jset - Jnoon);
    var toDate = function (j) { return new Date((j + 0.5 - J1970) * dayMs); };
    return { rise: toDate(Jrise), set: toDate(Jset) };
  }

  function duration(ms) {
    var mins = Math.max(0, Math.round(ms / 60000));
    var h = Math.floor(mins / 60), m = mins % 60;
    var parts = [];
    if (h) parts.push(h + (h === 1 ? ' hour' : ' hours'));
    if (m || !h) parts.push(m + (m === 1 ? ' minute' : ' minutes'));
    return parts.join(' ');
  }

  function initSun() {
    var box = document.querySelector('[data-sun]');
    if (!box) return;
    var svg = box.querySelector('[data-sun-arc]');
    var setEl = box.querySelector('[data-sun-set]');
    var noteEl = box.querySelector('[data-sun-note]');

    var now = new Date();
    var t = london(now);
    var sun = sunTimes(new Date(Date.UTC(t.y, t.m - 1, t.d, 12)), LAT, LNG);
    var doors = londonInstant(t.y, t.m, t.d, OPEN_HOUR);
    var tomorrow = sunTimes(new Date(Date.UTC(t.y, t.m - 1, t.d + 1, 12)), LAT, LNG);

    setEl.textContent = clock(sun.set);
    if (now < doors) {
      noteEl.textContent = 'Doors open at 12pm, with ' + duration(sun.set - doors) + ' of daylight to follow.';
    } else if (now < sun.set) {
      noteEl.textContent = 'Daylight for another ' + duration(sun.set - now) + '. Time for one outside.';
    } else {
      noteEl.textContent = 'The sun’s down for today. Tomorrow it sets at ' + clock(tomorrow.set) + '.';
    }

    // Draw the day as an arc: sunrise on the left, sunset on the right
    var X0 = 24, X1 = 296, HORIZON = 118, PEAK = 26;
    var span = sun.set - sun.rise;
    function pt(f) {
      return [X0 + f * (X1 - X0), HORIZON - (HORIZON - PEAK) * Math.sin(Math.PI * f)];
    }
    function arc(f0, f1) {
      var d = '';
      for (var i = 0; i <= 48; i++) {
        var p = pt(f0 + (f1 - f0) * i / 48);
        d += (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1);
      }
      return d;
    }
    var fDoors = Math.min(1, Math.max(0, (doors - sun.rise) / span));
    var fNow = (now - sun.rise) / span;
    var doorsPt = pt(fDoors);
    var ns = 'http://www.w3.org/2000/svg';
    function el(name, attrs, text) {
      var node = document.createElementNS(ns, name);
      for (var k in attrs) node.setAttribute(k, attrs[k]);
      if (text) node.textContent = text;
      svg.appendChild(node);
      return node;
    }

    el('line', { class: 'horizon', x1: 0, x2: 320, y1: HORIZON, y2: HORIZON });
    el('path', { class: 'path', d: arc(0, 1) });
    var open = el('path', { class: 'open', d: arc(fDoors, 1) });
    el('line', { class: 'tick', x1: doorsPt[0], x2: doorsPt[0], y1: doorsPt[1] + 6, y2: HORIZON });
    el('text', { x: X0, y: HORIZON + 20, 'text-anchor': 'middle' }, clock(sun.rise));
    el('text', { x: X1, y: HORIZON + 20, 'text-anchor': 'middle' }, clock(sun.set));
    el('text', { x: doorsPt[0], y: HORIZON + 20, 'text-anchor': 'middle', class: 'label-open' }, 'Doors 12pm');
    el('text', { x: X0, y: HORIZON + 34, 'text-anchor': 'middle' }, 'sunrise');
    el('text', { x: X1, y: HORIZON + 34, 'text-anchor': 'middle' }, 'sunset');

    var up = fNow > 0 && fNow < 1;
    if (!up) return;
    var halo = el('circle', { class: 'halo', r: 15, cx: pt(0)[0], cy: pt(0)[1] });
    var disc = el('circle', { class: 'disc', r: 6.5, cx: pt(0)[0], cy: pt(0)[1] });

    function place(f) {
      var p = pt(f);
      disc.setAttribute('cx', p[0].toFixed(1)); disc.setAttribute('cy', p[1].toFixed(1));
      halo.setAttribute('cx', p[0].toFixed(1)); halo.setAttribute('cy', p[1].toFixed(1));
    }

    // The sun drifts up to where it is now, slowly, once the panel is in view
    var len = open.getTotalLength ? open.getTotalLength() : 0;
    if (reduceMotion || !('IntersectionObserver' in window)) { place(fNow); return; }
    place(0);
    if (len) { open.style.strokeDasharray = len; open.style.strokeDashoffset = len; }
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      var start = null, DURATION = 4200;
      function step(ts) {
        if (start === null) start = ts;
        var k = Math.min(1, (ts - start) / DURATION);
        var eased = 1 - Math.pow(1 - k, 3);
        place(fNow * eased);
        if (len) open.style.strokeDashoffset = (len * (1 - eased)).toFixed(1);
        if (k < 1) requestAnimationFrame(step);
      }
      setTimeout(function () { requestAnimationFrame(step); }, 600);
    }, { threshold: 0.4 });
    io.observe(svg);
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
      .catch(function () {
        var li = document.createElement('li');
        li.className = 'menu__error';
        li.textContent = 'The menu couldn’t be loaded. Ask at the bar.';
        list.appendChild(li);
        list.classList.add('is-settled');
      });
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

  function initCopy() {
    document.querySelectorAll('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var text = btn.getAttribute('data-copy');
        var done = function () { toast('Address copied'); };
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text) && done(); });
        } else if (fallbackCopy(text)) {
          done();
        }
      });
    });
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

  /* ---------- Start ---------- */

  function start() {
    updateStatus();
    setInterval(updateStatus, 30000);
    initBar();
    initPhotos();
    initWeek();
    initSun();
    initMenu();
    initTimeline();
    initCascade();
    initCopy();
    document.querySelectorAll('[data-settle], [data-week]').forEach(settle);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
