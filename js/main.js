/* ============================================================
   MAIN
   - Site data (PROJECTS, TESTIMONIALS) — edit these arrays
   - Render functions for dynamic cards
   - Nav: scroll-aware blur + active link + hamburger
   - Contact form: validation + success state
   - Init: wires everything together
   ============================================================ */

/* ===========================================================
   SITE DATA
   To add a project: copy one object and append it to the array.
   To remove: delete the object.
   Fields:
     title       {string}   — display name
     description {string}   — one or two sentences
     tags        {string[]} — tech stack chips
     link        {string}   — URL (use '#' as placeholder)
     emoji       {string}   — thumbnail icon
     year        {string}   — display year
   =========================================================== */
const PROJECTS = [
  {
    title: 'Realtime Analytics Dashboard',
    description:
      'A live dashboard ingesting 50k+ events/sec via Kafka, visualised in React with sub-second end-to-end latency.',
    tags: ['React', 'Kafka', 'Node.js', 'Redis'],
    link: '#',
    emoji: '📊',
    year: '2025',
  },
  {
    title: 'E-Commerce Platform',
    description:
      'Full-stack marketplace with Stripe payments, inventory management, and a headless CMS powering 10k daily users.',
    tags: ['Next.js', 'Stripe', 'PostgreSQL', 'AWS'],
    link: '#',
    emoji: '🛒',
    year: '2024',
  },
  {
    title: 'Fleet Management API',
    description:
      'RESTful + gRPC API for real-time vehicle tracking, geofencing, and driver analytics across 50+ endpoints.',
    tags: ['Go', 'gRPC', 'PostgreSQL', 'Docker'],
    link: '#',
    emoji: '🚛',
    year: '2024',
  },
  {
    title: 'AI Content Pipeline',
    description:
      'Automated content generation and publishing pipeline using Claude API with human-in-the-loop review stages.',
    tags: ['Python', 'Claude API', 'FastAPI', 'Celery'],
    link: '#',
    emoji: '🤖',
    year: '2023',
  },
  {
    title: 'Developer Tooling CLI',
    description:
      'Internal CLI tool that cut release prep time from 2 hours to 8 minutes across a 30-person engineering org.',
    tags: ['Go', 'Cobra', 'GitHub API', 'Bash'],
    link: '#',
    emoji: '⚙️',
    year: '2023',
  },
];

/* ===========================================================
   RENDER: PROJECTS
   =========================================================== */
function renderProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  grid.innerHTML = PROJECTS.map((p, i) => `
    <article class="project-card${i === 0 ? ' project-card--featured' : ''}"
             role="listitem"
             data-reveal="fade"
             ${i > 0 ? `data-delay="${i * 70}"` : ''}>
      <div class="project-card-thumb">
        <div class="project-card-thumb-inner">${p.emoji}</div>
      </div>
      <div class="project-card-body">
        <p class="project-card-year">${p.year}</p>
        <h3 class="project-card-title">${p.title}</h3>
        <p class="project-card-desc">${p.description}</p>
        <div class="project-card-tags">
          ${p.tags.map((t) => `<span class="tag">${t}</span>`).join('')}
        </div>
        <a href="${p.link}" class="project-card-link" ${p.link !== '#' ? 'target="_blank" rel="noopener"' : ''}>
          View project
        </a>
      </div>
    </article>
  `).join('');
}

/* ===========================================================
   NAV — scroll blur + active link tracking
   =========================================================== */
function initNav() {
  const navbar   = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('nav-mobile');
  const navLinks  = document.querySelectorAll('.nav-link');

  /* Scroll-aware blur */
  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Hamburger toggle */
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
    });

    /* Close mobile menu on link click */
    mobileNav.querySelectorAll('.nav-mobile-link').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
      });
    });
  }

  /* Active link via IntersectionObserver on sections */
  const sections = document.querySelectorAll('section[id]');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach((s) => sectionObserver.observe(s));
}

/* ===========================================================
   CONTACT FORM — validation + success state
   To wire up a real backend, replace the submit handler body
   with a fetch() call to Formspree or EmailJS.
   =========================================================== */
function initContactForm() {
  const form      = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const success   = document.getElementById('form-success');
  if (!form) return;

  function showError(fieldId, msg) {
    const el = document.getElementById(`${fieldId}-error`);
    if (el) el.textContent = msg;
  }

  function clearErrors() {
    form.querySelectorAll('.form-error').forEach((el) => (el.textContent = ''));
  }

  function validate(data) {
    let ok = true;
    if (!data.name.trim()) {
      showError('name', 'Please enter your name.');
      ok = false;
    }
    if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      showError('email', 'Please enter a valid email address.');
      ok = false;
    }
    if (!data.message.trim() || data.message.trim().length < 10) {
      showError('message', 'Message must be at least 10 characters.');
      ok = false;
    }
    return ok;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const data = {
      name:    form.name.value,
      email:   form.email.value,
      message: form.message.value,
    };

    if (!validate(data)) return;

    submitBtn.disabled    = true;
    submitBtn.textContent = 'Sending…';

    /* -------------------------------------------------------
       SWAP THIS BLOCK to connect a real form backend.
       Example with Formspree:
         const res = await fetch('https://formspree.io/f/YOUR_ID', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(data),
         });
         if (!res.ok) throw new Error('submission failed');
       ------------------------------------------------------- */
    await new Promise((r) => setTimeout(r, 800)); /* simulated delay */
    console.log('Form submission:', data);

    form.reset();
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Send Message';
    if (success) success.classList.add('visible');
    setTimeout(() => success?.classList.remove('visible'), 6000);
  });
}

/* ===========================================================
   INIT — entry point, called after DOM is ready
   =========================================================== */
function init() {
  renderProjects();

  /* Scroll animations run after all dynamic content is in the DOM */
  initScrollAnimations();

  initNav();
  initContactForm();
  initMesh('mesh-canvas');
}

document.addEventListener('DOMContentLoaded', init);
