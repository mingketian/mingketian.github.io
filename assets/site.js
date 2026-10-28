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
    '.section-title, .entry, .timeline .item, .card, .home-intro, .home-news li, .doing-grid > li, .proj-tile'
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

/* Photo galleries (Leadership page): arrows, thumbnails, and left/right keys switch the large photo. */
(function () {
  document.querySelectorAll('[data-gallery]').forEach(function (g) {
    var img = g.querySelector('.gv-img'), link = g.querySelector('.gv-link'), count = g.querySelector('.gv-count');
    var thumbs = [].slice.call(g.querySelectorAll('.gv-thumb')), i = 0;
    function go(k) {
      i = (k + thumbs.length) % thumbs.length;
      var t = thumbs[i];
      img.classList.add('fading');
      setTimeout(function () {
        img.src = t.dataset.src; img.alt = t.dataset.alt; link.href = t.dataset.src;
        img.classList.remove('fading');
      }, 180);
      thumbs.forEach(function (b, n) { if (n === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
      if (count) count.textContent = (i + 1) + ' / ' + thumbs.length;
    }
    thumbs.forEach(function (b, n) { b.addEventListener('click', function () { go(n); }); });
    g.querySelector('.gv-nav.prev').addEventListener('click', function () { go(i - 1); });
    g.querySelector('.gv-nav.next').addEventListener('click', function () { go(i + 1); });
    g.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
    });
  });
})();

/* Copy buttons (paper pages): copy the citation text */
(function () {
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var el = document.querySelector(btn.getAttribute('data-copy'));
      if (!el || !navigator.clipboard) return;
      navigator.clipboard.writeText(el.textContent).then(function () {
        btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy'; }, 1600);
      });
    });
  });
})();

/* Learn more pages: reading-progress bar, outline that follows the section in view, and numbers that count up once */
(function () {
  var page = document.querySelector('.pp-v2');
  if (!page) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var bar = document.querySelector('.pp-progress span');
  if (bar) {
    var tick = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ')';
    };
    tick();
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
  }

  var links = [].slice.call(page.querySelectorAll('.pp-toc a[href^="#"]'));
  var secs = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  if (links.length) {
    var spy = function () {
      var y = window.scrollY + 140, k = 0;
      secs.forEach(function (s, n) { if (s && s.offsetTop <= y) k = n; });
      links.forEach(function (a, n) { a.classList.toggle('active', n === k); });
    };
    spy();
    window.addEventListener('scroll', spy, { passive: true });
  }

  var nums = [].slice.call(page.querySelectorAll('[data-count]'));
  if (reduce || !nums.length || !('IntersectionObserver' in window)) return;
  var show = function (el, v) {
    var d = +(el.dataset.decimals || 0);
    el.textContent = (el.dataset.prefix || '') + v.toFixed(d) + (el.dataset.suffix || '');
  };
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target, end = +el.dataset.count, t0 = null;
      io.unobserve(el);
      var step = function (t) {
        if (t0 === null) t0 = t;
        var p = Math.min(1, (t - t0) / 900), eased = 1 - Math.pow(1 - p, 3);
        show(el, end * eased);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  nums.forEach(function (el) { io.observe(el); });   /* the final value stays in place until the number scrolls into view */
})();
