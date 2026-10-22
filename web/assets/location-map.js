(() => {
  'use strict';
  const frame = document.querySelector('.visit-map iframe[data-src]');
  if (!frame) return;
  function loadMap() {
    if (!frame.dataset.src) return;
    frame.src = frame.dataset.src;
    frame.removeAttribute('data-src');
    frame.hidden = false;
  }
  if (!('IntersectionObserver' in window)) { loadMap(); return; }
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      loadMap();
      observer.disconnect();
    }
  }, {rootMargin:'600px'});
  // Observe the sized container: the deferred iframe itself is initially hidden.
  observer.observe(frame.parentElement);
})();
