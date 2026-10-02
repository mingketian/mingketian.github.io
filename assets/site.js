/* Site-wide behavior. Everything here is optional polish: the site works without it. */
(function () {
  /* Navigation bar: a soft shadow appears once the page is scrolled */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 4); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Content fades in gently as it scrolls into view.
     Skipped when the visitor prefers reduced motion or the browser lacks support. */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;

  var targets = document.querySelectorAll(
    '.section-title, .entry, .timeline .item, .card, .home-intro, .home-news li, .doing-grid li'
  );
  if (!targets.length) return;
  document.documentElement.classList.add('reveal-on');

  var finish = function (el) {
    el.classList.remove('reveal', 'in');   /* hand the element back to its normal styles (hover etc.) */
    el.style.transitionDelay = '';
  };

  var io = new IntersectionObserver(function (entries) {
    var batch = 0;
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      el.style.transitionDelay = Math.min(batch++ * 70, 280) + 'ms';   /* small stagger within a batch */
      el.classList.add('in');
      el.addEventListener('transitionend', function handler(ev) {
        if (ev.propertyName !== 'opacity') return;
        el.removeEventListener('transitionend', handler);
        finish(el);
      });
      setTimeout(function () { finish(el); }, 1400);                   /* safety net */
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

  targets.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
})();
