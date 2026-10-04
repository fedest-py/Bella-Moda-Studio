(() => {
  'use strict';
  const hours = document.querySelector('#hours');
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const today = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'long' }).format(new Date());
  function highlightToday() {
    hours.querySelectorAll('.hours-row').forEach(row => row.classList.toggle('is-today', row.firstElementChild.textContent === today));
  }
  highlightToday();

  function safeGoogleURL(value) {
    try { const url = new URL(value); return url.protocol === 'https:' && ['google.com','www.google.com','maps.google.com','maps.app.goo.gl','share.google'].includes(url.hostname) ? url.href : null; }
    catch { return null; }
  }
  function renderHours(rows) {
    if (!Array.isArray(rows) || rows.length !== 7 || rows.some(row => !dayNames.includes(row.days) || typeof row.time !== 'string')) return false;
    hours.replaceChildren();
    rows.forEach(({days,time}) => {
      const row = document.createElement('div'); row.className = 'hours-row';
      const day = document.createElement('span'); day.textContent = days;
      const value = document.createElement('span'); value.textContent = time;
      row.append(day,value); hours.append(row);
    });
    highlightToday();
    const uniform = rows.every(row => row.time === rows[0].time) && !/closed/i.test(rows[0].time);
    document.querySelector('.hero-footnote').textContent = uniform ? `OPEN DAILY · ${rows[0].time}` : 'SEE THIS WEEK’S STORE HOURS BELOW';
    document.querySelector('#hours-source-label').textContent = 'This week’s hours from';
    return true;
  }
  function renderAttributions(attributions) {
    document.querySelectorAll('[data-google-attributions]').forEach(container => {
      container.replaceChildren();
      if (!Array.isArray(attributions)) return;
      attributions.forEach(item => {
        if (!item.provider) return;
        const node = document.createElement('span');
        node.textContent = item.provider; container.append(node);
        if (item.providerUri) {
          try { const url = new URL(item.providerUri); if (url.protocol !== 'https:') return;
            const link = document.createElement('a'); link.href = url.href; link.textContent = 'Source'; link.target = '_blank'; link.rel = 'noopener noreferrer'; container.append(link);
          } catch { /* Provider name remains visible if its URL is invalid. */ }
        }
      });
      container.hidden = !container.childNodes.length;
    });
  }
  async function refresh() {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 6500);
    try {
      const response = await fetch('/api/google-profile', { signal:controller.signal, cache:'no-store', credentials:'same-origin' });
      if (!response.ok) return;
      const data = await response.json();
      if (!data.connected) return; // Keep the explicitly dated, user-confirmed fallback.
      renderHours(data.hours);
      if (Number.isFinite(data.rating) && data.rating >= 1 && data.rating <= 5) {
        document.querySelector('.rating-value').textContent = data.rating.toFixed(1);
        document.querySelector('.stars-filled').style.width = `${data.rating / 5 * 100}%`;
        document.querySelector('.rating-summary').setAttribute('aria-label', `Google rating: ${data.rating.toFixed(1)} out of 5`);
        document.querySelector('#rating-date').textContent = 'Current Google rating';
      } else {
        // Never keep showing an old number if Google no longer supplies a rating.
        document.querySelector('.rating-summary').hidden = true;
        document.querySelector('#rating-date').hidden = true;
      }
      const url = safeGoogleURL(data.googleMapsUri);
      if (url) document.querySelectorAll('.review-link,.google-hours-link').forEach(link => { link.href = url; });
      renderAttributions(data.attributions);
      // Avoid leaving obsolete regular hours in metadata after a live refresh.
      const schema = document.querySelector('script[type="application/ld+json"]');
      if (schema) { const metadata = JSON.parse(schema.textContent); delete metadata.openingHours; schema.textContent = JSON.stringify(metadata); }
    } catch { /* The page remains usable with the confirmed hours and dated rating. */ }
    finally { window.clearTimeout(timeout); }
  }
  // One live request per page visit; no scheduled polling or persistent Google-data cache.
  if ('requestIdleCallback' in window) window.requestIdleCallback(refresh, {timeout:1500});
  else window.setTimeout(refresh, 200);
})();
