// Mikey's New Tab. Everything here runs in his browser: notes, settings and
// cached forecasts live in this extension's localStorage and go nowhere else.
// The only network calls are the National Weather Service (public, no key),
// the dashboard's public /api/next-openings (the same one the website uses),
// Google's favicon service for the link icons, and the Google Calendar embed.

var TZ = 'America/Los_Angeles';
var BASE = { lat: 47.9129, lng: -122.0982 }; // Snohomish, WA 98290
var NWS_HOURLY = 'https://api.weather.gov/gridpoints/SEW/135,81/forecast/hourly';
var NWS_DAILY = 'https://api.weather.gov/gridpoints/SEW/135,81/forecast';
var OPENINGS = 'https://texting.mikeysdetailingsnohomish.workers.dev/api/next-openings';

var DEFAULT_LINKS = [
  ['Dashboard', 'https://texting.mikeysdetailingsnohomish.workers.dev/'],
  ['Google Business', 'https://business.google.com/'],
  ['Google Ads', 'https://ads.google.com/'],
  ['Search Console', 'https://search.google.com/search-console'],
  ['Analytics', 'https://analytics.google.com/'],
  ['Stripe', 'https://dashboard.stripe.com/'],
  ['Gmail', 'https://mail.google.com/'],
  ['Calendar', 'https://calendar.google.com/'],
  ['Google Photos', 'https://photos.google.com/'],
  ['Make', 'https://www.make.com/'],
  ['My website', 'https://mikeysdetailing.com/'],
  ['GitHub', 'https://github.com/mikeygabmiller'],
  ['Claude', 'https://claude.ai/']
];

// Links he texts people. The Google one is the profile link GROWTH-PLAN.md
// says to text after a job for a review.
var COPIES = [
  ['Quote calculator', 'https://mikeysdetailing.com/#booking'],
  ['Call page', 'https://mikeysdetailing.com/onbored/'],
  ['Google review link', 'https://g.page/r/CRCuKQ982VIZEBE']
];

// ---- sunrise / sunset ------------------------------------------------------
// The standard almanac algorithm (US Naval Observatory, "Almanac for
// Computers", 1990). Zenith 90.833 is sunset; 96 is the end of civil
// twilight, when it's dark enough that you need lights. Good to about a
// minute, checked against sunrise-sunset.org for Snohomish.
function sunEvent(y, m, d, rising, zenith) {
  var rad = Math.PI / 180;
  var N = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / 864e5);
  var lngHour = BASE.lng / 15;
  var t = N + ((rising ? 6 : 18) - lngHour) / 24;
  var M = 0.9856 * t - 3.289;
  var L = M + 1.916 * Math.sin(M * rad) + 0.020 * Math.sin(2 * M * rad) + 282.634;
  L = ((L % 360) + 360) % 360;
  var RA = Math.atan(0.91764 * Math.tan(L * rad)) / rad;
  RA = ((RA % 360) + 360) % 360;
  RA += Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90;
  RA /= 15;
  var sinDec = 0.39782 * Math.sin(L * rad);
  var cosDec = Math.cos(Math.asin(sinDec));
  var cosH = (Math.cos(zenith * rad) - sinDec * Math.sin(BASE.lat * rad)) / (cosDec * Math.cos(BASE.lat * rad));
  if (cosH > 1 || cosH < -1) return null;
  var H = (rising ? 360 - Math.acos(cosH) / rad : Math.acos(cosH) / rad) / 15;
  var T = H + RA - 0.06571 * t - 6.622;
  var UT = (((T - lngHour) % 24) + 24) % 24;
  var ms = Date.UTC(y, m - 1, d) + UT * 36e5;
  // UT wraps past midnight for an evening on the West Coast: keep the answer
  // on the local calendar day that was asked for.
  var want = y + '-' + m + '-' + d;
  for (var k = -1; k <= 1; k++) {
    if (ymd(new Date(ms + k * 864e5)).join('-') === want) return new Date(ms + k * 864e5);
  }
  return new Date(ms);
}
function sunFor(date) {
  var p = ymd(date);
  return {
    sunrise: sunEvent(p[0], p[1], p[2], true, 90.833),
    sunset: sunEvent(p[0], p[1], p[2], false, 90.833),
    dark: sunEvent(p[0], p[1], p[2], false, 96)
  };
}

// ---- dates in Pacific time ---------------------------------------------------
function ymd(date) {
  var s = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: 'numeric', day: 'numeric' }).format(date);
  return s.split('-').map(Number);
}
function hourOf(date) {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', hourCycle: 'h23' }).format(date));
}
function fmtTime(date) {
  return new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' }).format(date);
}
function fmtHour(date) {
  return new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric' }).format(date).replace(' ', '').toLowerCase();
}
function offsetOf(date) {
  return new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'shortOffset' })
    .formatToParts(date).filter(function (p) { return p.type === 'timeZoneName'; })[0].value;
}

if (typeof module !== 'undefined') {
  module.exports = { sunFor: sunFor, fmtTime: fmtTime };
} else {
  start();
}

function start() {
  var $ = function (id) { return document.getElementById(id); };

  function load(key, fallback) {
    try { var v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  // Cached fetch: draw what we had last time straight away, then refresh it
  // in the background when it's older than maxAge.
  function cached(key, url, maxAgeMin, draw, fail) {
    var c = load(key, null);
    if (c) draw(c.data);
    if (c && Date.now() - c.at < maxAgeMin * 6e4) return;
    fetch(url, { headers: { Accept: 'application/geo+json, application/json' } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) { save(key, { at: Date.now(), data: data }); draw(data); })
      .catch(function () { if (!c) fail(); });
  }

  // ---- clock ---------------------------------------------------------------
  function tick() {
    var now = new Date();
    $('clock').textContent = fmtTime(now);
    $('today').textContent = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'long', month: 'long', day: 'numeric' }).format(now);
  }
  tick();
  setInterval(tick, 15e3);

  // ---- sun -----------------------------------------------------------------
  function drawSun() {
    var now = new Date();
    var today = sunFor(now);
    var tomorrow = sunFor(new Date(now.getTime() + 864e5));
    var box = $('sun');
    box.textContent = '';
    function item(label, value) {
      var d = el('div');
      d.appendChild(el('span', 'lbl', label));
      d.appendChild(el('b', null, value));
      box.appendChild(d);
    }
    item('Sunset today', fmtTime(today.sunset));
    item('Dark', fmtTime(today.dark));
    var left = (today.dark - now) / 36e5;
    item('Light left', left <= 0 ? 'none' : (left >= 1 ? Math.floor(left) + ' h ' : '') + Math.round((left % 1) * 60) + ' min');
    item('Sunset tomorrow', fmtTime(tomorrow.sunset));

    // Warn the week before the clocks change: sunset jumps an hour.
    for (var k = 1; k <= 7; k++) {
      var later = new Date(now.getTime() + k * 864e5);
      if (offsetOf(later) !== offsetOf(now)) {
        // GMT-7 to GMT-8 is the fall change.
        var back = parseFloat(offsetOf(later).slice(3)) < parseFloat(offsetOf(now).slice(3)) ? 'go back' : 'go forward';
        var day = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short', month: 'short', day: 'numeric' }).format(later);
        var s = sunFor(later);
        box.appendChild(el('div', 'note', 'Clocks ' + back + ' by ' + day + '. Sunset that day: ' + fmtTime(s.sunset) + ', dark by ' + fmtTime(s.dark) + '.'));
        break;
      }
    }
  }
  drawSun();
  setInterval(drawSun, 6e4);

  // ---- hourly rain -----------------------------------------------------------
  // Before 5 PM: the next 13 hours from now. After: tomorrow 7 AM to 7 PM, the
  // hours his jobs run in.
  function drawHourly(data) {
    var periods = (data && data.properties && data.properties.periods) || [];
    var now = new Date();
    var list;
    if (hourOf(now) < 17) {
      list = periods.slice(0, 13);
    } else {
      var tmr = ymd(new Date(now.getTime() + 864e5)).join('-');
      list = periods.filter(function (p) {
        var d = new Date(p.startTime);
        return ymd(d).join('-') === tmr && hourOf(d) >= 7 && hourOf(d) <= 19;
      });
    }
    var box = $('hourly');
    box.textContent = '';
    if (!list.length) { box.appendChild(el('p', 'muted', 'No hourly forecast right now.')); return; }
    var lbl = el('div', 'muted small', hourOf(now) < 17 ? 'Next 13 hours, chance of rain' : 'Tomorrow 7 AM to 7 PM, chance of rain');
    lbl.style.gridColumn = '1 / -1';
    box.appendChild(lbl);
    list.forEach(function (p) {
      var d = new Date(p.startTime);
      var pop = (p.probabilityOfPrecipitation && p.probabilityOfPrecipitation.value) || 0;
      var s = sunFor(d);
      var col = el('div', 'hr' + (d >= s.dark || d < s.sunrise ? ' dark' : ''));
      col.title = p.shortForecast + ', ' + p.windSpeed + ' ' + p.windDirection;
      col.appendChild(el('div', 'pct', pop + '%'));
      var wrap = el('div', 'bar-wrap');
      var bar = el('div', 'bar');
      bar.style.height = Math.max(2, pop) + '%';
      wrap.appendChild(bar);
      col.appendChild(wrap);
      col.appendChild(el('div', 't' + (p.temperature <= 32 ? ' cold' : ''), p.temperature + '°'));
      col.appendChild(el('div', 'h', fmtHour(d)));
      box.appendChild(col);
    });
  }
  cached('nwsHourly', NWS_HOURLY, 15, drawHourly, function () {
    $('hourly').textContent = '';
    $('hourly').appendChild(el('p', 'muted', "Couldn't reach the weather service. Try the NWS link above."));
  });

  // ---- next days -------------------------------------------------------------
  function drawDays(data) {
    var periods = (data && data.properties && data.properties.periods) || [];
    var today = ymd(new Date()).join('-');
    var days = periods.filter(function (p) {
      return p.isDaytime && ymd(new Date(p.startTime)).join('-') !== today;
    }).slice(0, 4);
    var box = $('days');
    box.textContent = '';
    days.forEach(function (p) {
      var d = el('div', 'day');
      d.title = p.detailedForecast;
      d.appendChild(el('div', 'n', p.name));
      var pop = (p.probabilityOfPrecipitation && p.probabilityOfPrecipitation.value) || 0;
      var line = el('div');
      line.appendChild(el('span', 'p', pop + '% rain'));
      line.appendChild(document.createTextNode(' · ' + p.temperature + '°'));
      d.appendChild(line);
      d.appendChild(el('div', 'f', p.shortForecast));
      box.appendChild(d);
    });
  }
  cached('nwsDaily', NWS_DAILY, 30, drawDays, function () {});

  // ---- openings --------------------------------------------------------------
  // The same question the website asks, one per service. Size is SUV, as on
  // the homepage's "Next opening" line.
  var SERVICES = [['exterior', 'Exterior'], ['interior', 'Interior'], ['full', 'Full Detail']];
  var openBox = $('openings');
  openBox.textContent = '';
  SERVICES.forEach(function (svc) {
    var col = el('div', 'open-col');
    col.appendChild(el('h4', null, svc[1]));
    var ul = el('ul');
    col.appendChild(ul);
    openBox.appendChild(col);
    cached('open_' + svc[0], OPENINGS + '?service=' + svc[0] + '&size=suv&n=4', 5, function (j) {
      ul.textContent = '';
      var list = (j && j.ok && j.openings) || [];
      if (!list.length) { ul.appendChild(el('li', 'none', 'Nothing open')); return; }
      list.forEach(function (o) {
        var li = el('li');
        li.appendChild(el('span', 'd', o.label));
        li.appendChild(el('span', 'tm', o.time));
        ul.appendChild(li);
      });
    }, function () {
      ul.textContent = '';
      ul.appendChild(el('li', 'none', "Couldn't reach the calendar"));
    });
  });

  // ---- calendar --------------------------------------------------------------
  function drawCal() {
    var box = $('cal');
    box.textContent = '';
    var ids = String(load('calId', '')).split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    if (!ids.length) {
      box.appendChild(el('p', 'setup', 'Add your Google Calendar to see your bookings here.'));
      var b = el('button', 'primary', 'Set it up');
      b.type = 'button';
      b.onclick = openSettings;
      box.appendChild(b);
      return;
    }
    var url = 'https://calendar.google.com/calendar/embed?mode=AGENDA&ctz=' + encodeURIComponent(TZ) +
      '&showTitle=0&showPrint=0&showTabs=0&showCalendars=0&showTz=0&showNav=1&showDate=0' +
      ids.map(function (id) { return '&src=' + encodeURIComponent(id); }).join('');
    var f = document.createElement('iframe');
    f.src = url;
    f.title = 'Google Calendar';
    box.appendChild(f);
  }
  drawCal();

  // ---- links -----------------------------------------------------------------
  function getLinks() { return load('links', DEFAULT_LINKS); }
  function drawLinks() {
    var box = $('links');
    box.textContent = '';
    getLinks().forEach(function (l) {
      var a = el('a');
      a.href = l[1];
      var host = '';
      try { host = new URL(l[1]).hostname; } catch (e) {}
      if (host) {
        var img = el('img');
        img.alt = '';
        img.src = 'https://www.google.com/s2/favicons?sz=32&domain=' + encodeURIComponent(host);
        a.appendChild(img);
      }
      a.appendChild(document.createTextNode(l[0]));
      box.appendChild(a);
    });
  }
  drawLinks();

  var copyBox = $('copies');
  COPIES.forEach(function (c) {
    var b = el('button', null, c[0]);
    b.type = 'button';
    b.title = c[1];
    b.onclick = function () {
      navigator.clipboard.writeText(c[1]).then(function () {
        b.textContent = 'Copied';
        b.classList.add('copied');
        setTimeout(function () { b.textContent = c[0]; b.classList.remove('copied'); }, 1500);
      });
    };
    copyBox.appendChild(b);
  });

  // ---- notes -----------------------------------------------------------------
  var notes = $('notes');
  notes.value = load('notes', '');
  var timer;
  notes.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      save('notes', notes.value);
      $('saved').textContent = 'Saved';
      setTimeout(function () { $('saved').textContent = ''; }, 1200);
    }, 400);
  });

  // ---- settings --------------------------------------------------------------
  function linksToText(list) { return list.map(function (l) { return l[0] + ' | ' + l[1]; }).join('\n'); }
  function textToLinks(text) {
    return text.split('\n').map(function (line) {
      var i = line.lastIndexOf('|');
      if (i < 0) return null;
      var name = line.slice(0, i).trim();
      var url = line.slice(i + 1).trim();
      if (!name || !/^https?:\/\//i.test(url)) return null;
      return [name, url];
    }).filter(Boolean);
  }
  function openSettings() {
    $('calId').value = load('calId', '');
    $('linkText').value = linksToText(getLinks());
    $('settings').showModal();
  }
  $('gear').onclick = openSettings;
  $('resetLinks').onclick = function () { $('linkText').value = linksToText(DEFAULT_LINKS); };
  $('saveSettings').onclick = function () {
    save('calId', $('calId').value.trim());
    var parsed = textToLinks($('linkText').value);
    save('links', parsed.length ? parsed : DEFAULT_LINKS);
    drawCal();
    drawLinks();
  };
}
