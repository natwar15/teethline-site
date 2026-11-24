// Teethline cookieless analytics. No cookies, no storage, no personal data.
// Sends: page path, referrer host, UTM tags, device type, and named events.
(function () {
  var E = '/.netlify/functions/track';
  function send(ev, extra) {
    try {
      var q = new URLSearchParams(location.search);
      var d = {
        e: ev,
        p: location.pathname,
        r: document.referrer ? new URL(document.referrer).hostname : '',
        us: q.get('utm_source') || '',
        um: q.get('utm_medium') || '',
        uc: q.get('utm_campaign') || '',
        m: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      };
      for (var k in extra || {}) d[k] = extra[k];
      var b = JSON.stringify(d);
      if (navigator.sendBeacon) navigator.sendBeacon(E, new Blob([b], { type: 'application/json' }));
      else fetch(E, { method: 'POST', body: b, keepalive: true, headers: { 'Content-Type': 'application/json' } });
    } catch (x) {}
  }
  window.tlTrack = function (ev, step) { send(ev, { s: step || '' }); };
  send('view');
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    if (a.dataset.book) send('book', { s: a.dataset.book });
    else if (a.dataset.call) send('call', { s: a.dataset.call });
    else if (a.dataset.cta) send('cta', { s: a.dataset.cta });
  });
})();
