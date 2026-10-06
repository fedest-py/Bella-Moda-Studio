(() => {
  'use strict';
  const eventNames = new Set(['directions_click', 'google_listing_click']);

  function trackLink(event) {
    if (event.type === 'auxclick' && event.button !== 1) return;
    const link = event.target.closest?.('a[href]');
    if (!link || typeof window.gtag !== 'function') return;
    const name = link.getAttribute('href').startsWith('tel:')
      ? 'phone_click'
      : link.dataset.analyticsEvent;
    if (name !== 'phone_click' && !eventNames.has(name)) return;

    // Observe clicks without delaying or changing navigation. Delegation also
    // covers phone links replaced by store-data.js and updated Google URLs.
    window.gtag('event', name, {
      send_to: 'G-NRLQQ6BB38',
      link_location: link.dataset.analyticsLocation || 'contact'
    });
  }

  document.addEventListener('click', trackLink, {capture: true, passive: true});
  document.addEventListener('auxclick', trackLink, {capture: true, passive: true});
})();
