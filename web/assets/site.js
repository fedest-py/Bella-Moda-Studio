(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const slides = [...document.querySelectorAll('.slide')];
  const dots = [...document.querySelectorAll('[data-go-slide]')];
  const slideshow = document.querySelector('.slideshow');
  const toggle = document.querySelector('.play-toggle');
  const label = document.querySelector('#slide-label');
  const labels = ['A first look inside', 'Color in the details', 'The joy of the find'];
  const dialog = document.querySelector('.photo-dialog');
  let currentSlide = 0;
  let userPaused = reducedMotion.matches;
  let inView = true;
  let hovered = false;
  let focused = false;
  let timer;

  function syncPlayback() {
    window.clearInterval(timer);
    const playing = !userPaused && !document.hidden && inView && !hovered && !focused && !dialog.open;
    slideshow.classList.toggle('is-playing', playing);
    toggle.textContent = userPaused ? 'Play' : 'Pause';
    toggle.setAttribute('aria-label', userPaused ? 'Play slideshow' : 'Pause slideshow');
    if (playing) timer = window.setInterval(() => showSlide((currentSlide + 1) % slides.length), 7000);
  }

  function showSlide(index) {
    currentSlide = index;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === index);
      slide.setAttribute('aria-hidden', String(i !== index));
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
      dot.setAttribute('aria-pressed', String(i === index));
    });
    label.textContent = labels[index];
  }

  dots.forEach(dot => dot.addEventListener('click', () => { showSlide(Number(dot.dataset.goSlide)); syncPlayback(); }));
  toggle.addEventListener('click', () => { userPaused = !userPaused; syncPlayback(); });
  slideshow.addEventListener('mouseenter', () => { hovered = true; syncPlayback(); });
  slideshow.addEventListener('mouseleave', () => { hovered = false; syncPlayback(); });
  slideshow.addEventListener('focusin', () => { focused = true; syncPlayback(); });
  slideshow.addEventListener('focusout', event => { if (!slideshow.contains(event.relatedTarget)) { focused = false; syncPlayback(); } });
  document.addEventListener('visibilitychange', syncPlayback);
  reducedMotion.addEventListener('change', () => { userPaused = reducedMotion.matches; syncPlayback(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { inView = entries[0].isIntersecting; syncPlayback(); }, {threshold: 0.15}).observe(slideshow);
  }
  syncPlayback();

  const photos = [
    {name:'entrance', caption:'A first look inside', alt:'The entrance to Bella Moda Studio, with clothing racks and floral accents'},
    {name:'handbags', caption:'Color in the details', alt:'Colorful handbags on yellow and black display plinths'},
    {name:'collection', caption:'The joy of the find', alt:'Clothing racks and chandeliers inside Bella Moda Studio'},
    {name:'mirror', caption:'Be classy, Be chic.', alt:'A gold mirror and fuchsia mannequin against a deep blue wall'},
    {name:'outerwear', caption:'Layers to love', alt:'A selection of coats and outerwear in the store'},
    {name:'accessories', caption:'Make it a statement.', alt:'Handbags, jewelry, and accessories in a glass display cabinet'},
    {name:'storefront', caption:'Meet us on Ditmars', alt:'Bella Moda Studio at 29-09 Ditmars Boulevard in Astoria'},
    {name:'storefront-portrait', caption:'Your neighborhood find', alt:'A view of the blue Bella storefront and its window display from the sidewalk'}
  ];
  let currentPhoto = 0;
  let touchStart = null;
  const lightboxImage = document.querySelector('#lightbox-image');
  function displayPhoto(index) {
    currentPhoto = (index + photos.length) % photos.length;
    const photo = photos[currentPhoto];
    lightboxImage.src = `assets/${photo.name}-1280.webp`;
    lightboxImage.alt = photo.alt;
    document.querySelector('#lightbox-caption').textContent = photo.caption;
    document.querySelector('#lightbox-count').textContent = `${currentPhoto + 1} / ${photos.length}`;
  }
  function openPhoto(index) {
    displayPhoto(index);
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
      document.body.classList.add('dialog-open');
      syncPlayback();
    } else { window.open(lightboxImage.src, '_blank', 'noopener'); }
  }
  document.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click', () => openPhoto(Number(button.dataset.photo))));
  document.querySelector('[data-open-current]').addEventListener('click', () => openPhoto(currentSlide));
  document.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  document.querySelector('.lightbox-previous').addEventListener('click', () => displayPhoto(currentPhoto - 1));
  document.querySelector('.lightbox-next').addEventListener('click', () => displayPhoto(currentPhoto + 1));
  dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); syncPlayback(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); displayPhoto(currentPhoto + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); displayPhoto(currentPhoto - 1); }
  });
  lightboxImage.addEventListener('touchstart', event => { touchStart = event.changedTouches[0].clientX; }, {passive:true});
  lightboxImage.addEventListener('touchend', event => {
    if (touchStart === null) return;
    const distance = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(distance) > 60) displayPhoto(currentPhoto + (distance < 0 ? 1 : -1));
    touchStart = null;
  }, {passive:true});

  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-motion');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), {threshold:0.06, rootMargin:'0px 0px -20px 0px'});
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  }

  const details = window.BELLA_STORE || {};
  const safeURL = (value, host) => {
    try { const url = new URL(value); return url.protocol === 'https:' && (url.hostname === host || url.hostname === `www.${host}`) ? url.href : null; }
    catch { return null; }
  };
  const onlineLinks = document.querySelector('.online-links');
  [['poshmark','poshmark.com','Shop our Poshmark closet'],['instagram','instagram.com','Follow Bella on Instagram']].forEach(([key,host,title]) => {
    const url = safeURL(details[key], host);
    if (!url) return;
    const anchor = document.createElement('a');
    anchor.href = url; anchor.target = '_blank'; anchor.rel = 'noopener noreferrer'; anchor.className = 'text-link'; anchor.textContent = title;
    onlineLinks.append(anchor); document.querySelector('#online').hidden = false;
  });
  if (Array.isArray(details.hours) && details.hours.length) {
    const hours = document.querySelector('#hours'); hours.replaceChildren();
    details.hours.forEach(({days,time}) => {
      const row = document.createElement('div'); row.className = 'hours-row';
      const day = document.createElement('span'); day.textContent = days;
      const times = document.createElement('span'); times.textContent = time;
      row.append(day,times); hours.append(row);
    });
  }
  const contacts = document.querySelector('.contact-links');
  if (details.phone || details.email) contacts.replaceChildren();
  if (details.phone && /^[+\d\s().-]+$/.test(details.phone)) {
    const anchor = document.createElement('a'); anchor.href = `tel:${details.phone.replace(/[^+\d]/g,'')}`; anchor.textContent = details.phone; anchor.className = 'light-link'; contacts.append(anchor);
  }
  if (details.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) {
    const anchor = document.createElement('a'); anchor.href = `mailto:${details.email}`; anchor.textContent = details.email; anchor.className = 'light-link'; contacts.append(anchor);
  }
  if (contacts.children.length) document.querySelector('#contact').hidden = false;
  document.querySelector('#year').textContent = new Date().getFullYear();
})();
