# CLAUDE.md — Agent Reference for freelance-landing

This file is the canonical reference for any AI agent working on this project.
Read it fully before making any change. Every section explains *where* something
lives and *how* to change it without breaking anything else.

---

## Project Overview

A pure static freelancing landing page — no build step, no framework, no dependencies
beyond Google Fonts. Intended to be hosted on GitHub Pages as-is.

**Owner:** Sudhanshu Shekhar / AMANZIS  
**Stack:** HTML5 + CSS3 (custom properties) + vanilla JS  
**Hosting:** Static — open `index.html` directly in a browser or deploy to GitHub Pages

---

## File Structure

```
freelance-landing/
├── index.html          ← All HTML. Sections are clearly comment-delimited.
├── css/
│   ├── variables.css   ← ALL design tokens. Edit here to retheme the whole site.
│   ├── layout.css      ← Nav, hero, section backgrounds, footer — structural rules.
│   └── components.css  ← Cards, buttons, form, tags, reveal animations.
└── js/
    ├── mesh.js         ← Canvas particle mesh + mouse repulsion. Self-contained.
    ├── animations.js   ← IntersectionObserver scroll-reveal. Self-contained.
    └── main.js         ← Data arrays, render functions, nav, form handler, init.
```

**Load order matters.** `index.html` loads scripts in this order and it must stay:
`mesh.js` → `animations.js` → `main.js`

---

## Design Tokens (`css/variables.css`)

All colours, spacing, radii, and transitions live here as CSS custom properties.
**Never hardcode values that exist as tokens.**

| Token | Value | Use |
|---|---|---|
| `--bg-primary` | `#06060a` | Page + all section base background |
| `--bg-card` | `#0d0d1a` | Card backgrounds |
| `--blue-bright` | `#2563eb` | CTA buttons, primary accents |
| `--blue-glow` | `#3b82f6` | Hover states, icons, labels |
| `--blue-border` | `rgba(59,130,246,0.18)` | Card / nav borders |
| `--blue-border-h` | `rgba(59,130,246,0.45)` | Border hover state |
| `--text-primary` | `#f1f5f9` | Headings |
| `--text-secondary` | `#cbd5e1` | Body text |
| `--text-muted` | `#64748b` | Labels, metadata |
| `--container-px` | `clamp(1.25rem, 5vw, 2.5rem)` | Horizontal page gutter |
| `--max-width` | `1200px` | Container max width |
| `--section-py` | `clamp(4.5rem, 9vw, 7.5rem)` | Section vertical padding |
| `--t-reveal` | `0.65s var(--ease-out)` | Scroll animation duration |

---

## Sections (`index.html`)

Each section follows this pattern — the comment markers are the modular boundary:

```html
<!-- ========================================================
     SECTION: NAME
     Description of what's here and how to edit it.
     ======================================================== -->
<section id="name" class="section">
  <div class="container">
    ...
  </div>
</section>
<!-- END SECTION: NAME -->
```

**To remove a section:** Delete the entire block between the comment markers,
then remove its `<a href="#name">` from:
- Desktop nav (`.nav-links` in `<nav>`)
- Mobile nav (`.nav-mobile` in `<nav>`)
- Footer nav (`.footer-nav` in `<footer>`)

Also remove its background rule in `css/layout.css` (see Section Patterns below).

**To add a section:** Copy an existing block, change `id`, update content,
add nav links in all three places above, add a background pattern rule if desired.

### Current Sections

| Section ID | Content | Data source |
|---|---|---|
| `#hero` | Full-viewport intro — headline, CTA buttons, tech stack chips | Inline HTML |
| `#services` | Numbered list of 4 services (01–04) | Inline HTML |
| `#work` | Project cards in a bento/magazine grid | `PROJECTS` array in `main.js` |
| `#contact` | Contact form + sidebar with phone, email, availability note | Inline HTML + `initContactForm()` in `main.js` |

---

## Section Background Patterns (`css/layout.css`)

All content sections share `background-color: var(--bg-primary)` as a unified base.
Each section's decorative pattern lives on a `::before` pseudo-element so it can
be faded at edges without touching the content:

```css
#services::before,
#work::before,
#contact::before {
  content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none;
  /* mask fades pattern in at 14% and out at 86% — smooth section transitions */
  mask-image: linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%);
  -webkit-mask-image: /* same */;
}
```

Each section then adds its own `background-image` on `::before`. The `z-index: -1`
keeps the pattern behind `.container` content within the section's stacking context
(`position: relative; z-index: 1` on `.section`).

**To add a pattern to a new section:** Add `#newsection::before` with `content`,
`position: absolute`, `inset: 0`, `z-index: -1`, `pointer-events: none`, the
shared `mask-image`, and a `background-image` + `background-size`.

**To change an existing pattern:** Edit the `background-image` on the relevant
`::before` rule. The three current patterns are: dot grid (`#services`),
cross-grid (`#work`), larger dot grid (`#contact`).

---

## Project Cards (`js/main.js` — `PROJECTS` array)

Cards are rendered dynamically from this array. The first item automatically
gets the featured layout (spans 2 columns on desktop).

```js
const PROJECTS = [
  {
    title: 'Project Name',       // display heading
    description: 'One or two sentences.',
    tags: ['React', 'Node.js'],  // tech stack chips
    link: '#',                   // URL — use '#' as placeholder
    emoji: '📊',                 // thumbnail icon
    year: '2025',                // display year
  },
  // … add more objects here
];
```

**To add a project:** Append an object to the array.  
**To remove a project:** Delete the object.  
**To link a project:** Change `link: '#'` to a real URL — the `renderProjects()`
function automatically adds `target="_blank" rel="noopener"` for non-`#` links.

---

## Contact Details (`index.html`)

The contact sidebar has two placeholder items. To update:

1. **Phone / WhatsApp:** Find the `<a href="https://wa.me/15550000000">` link.
   - Change `href` to `https://wa.me/YOURNUMBER` (digits only, no spaces or `+`).
   - Change the display text `+1 (555) 000-0000` to your real number.

2. **Email:** Find the `<a href="mailto:hello@amanzis.com">` link.
   - Change `href` to `mailto:YOUREMAIL`.
   - Change the display text `hello@amanzis.com` to your real email.

The icons are inline SVGs using `currentColor` — they inherit the blue colour
automatically from `.contact-link-icon`. Do not change the SVG `stroke` attribute.

**To add a third contact item:** Copy one `<a class="contact-link">` block
inside `.contact-links` and follow the same structure.

---

## Contact Form (`js/main.js` — `initContactForm()`)

The form currently simulates a submit (800ms delay, logs to console).
To wire up a real backend, find the comment block marked `SWAP THIS BLOCK`
inside `initContactForm()` and replace the `await new Promise(...)` line with a
`fetch()` call to Formspree, EmailJS, or your own endpoint.

---

## Scroll Reveal Animations (`js/animations.js` + `css/components.css`)

Any element with `data-reveal` animates in when it enters the viewport.

| Attribute value | Effect |
|---|---|
| `data-reveal="up"` | Slides up 36px + fades in |
| `data-reveal="left"` | Slides in from the left |
| `data-reveal="right"` | Slides in from the right |
| `data-reveal="fade"` | Fades in only |

Optional stagger: `data-delay="200"` sets a 200ms `transition-delay`.

Animations fire once and unobserve — they do not replay on scroll-back.

---

## Navigation (`js/main.js` — `initNav()`)

- Scroll past 50px → nav gains `.scrolled` class → blur + border appear (CSS).
- Hamburger toggles `.open` on both itself and `#nav-mobile`.
- Active link is tracked via `IntersectionObserver` on `section[id]` elements.

**When adding/removing sections,** always keep the desktop nav (`.nav-links`),
mobile drawer (`.nav-mobile`), and footer nav (`.footer-nav`) in sync.

---

## Canvas Mesh Background (`js/mesh.js`)

- Fixed, full-screen, `z-index: 0` — sits behind all sections.
- ~90 particles, connected by lines when closer than 140px.
- Mouse repulsion: particles within 160px of cursor are pushed away.
- Initialised via `initMesh('mesh-canvas')` from `main.js`.
- Only the `#hero` section has a transparent background — it's the only place
  where the canvas is visible through the page content.

---

## Responsive Breakpoints

Defined in `css/variables.css` (comments) and used via media queries:

| Breakpoint | Value | Behaviour |
|---|---|---|
| Mobile | `≤ 767px` | Hamburger nav, single-column grids, contact stacks |
| Tablet | `768–1023px` | Two-column project grid |
| Desktop | `≥ 1024px` | Three-column project grid, featured card layout |

---

## What Has Been Intentionally Removed

- **Testimonials section** — removed due to alignment issues; data, render
  function, CSS, and nav links are all gone. To restore, add a section using
  the pattern above and create a `TESTIMONIALS` data array in `main.js`.
- **Social links (GitHub, LinkedIn)** — placeholder URLs removed; add back
  inside `.contact-links` in the contact sidebar when real URLs are available.

---

## GitHub Pages Deployment

1. Push the contents of `freelance-landing/` to the root of a GitHub repo.
2. Go to **Settings → Pages → Source: main branch / root**.
3. No build step required.
