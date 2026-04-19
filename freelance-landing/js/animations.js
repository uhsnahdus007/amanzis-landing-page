/* ============================================================
   SCROLL ANIMATIONS
   Uses IntersectionObserver to reveal elements as they enter
   the viewport. Mark elements with data-reveal="up|down|left|right|fade"
   Optional: data-delay="200" (milliseconds) for stagger.
   ============================================================ */

function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-reveal]');
  if (!elements.length) return;

  /* Apply custom delay from data-delay attribute */
  elements.forEach((el) => {
    const delay = el.dataset.delay;
    if (delay) {
      el.style.transitionDelay = `${delay}ms`;
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          /* Unobserve after reveal — animation fires once */
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach((el) => observer.observe(el));
}
