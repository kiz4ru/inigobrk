/* ============================================================================
   app.js — Orquestación: contenido, scroll, cámara, animaciones e interacción
   ========================================================================== */
import { CONTENT, LINKS } from "./content.js";

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const MOBILE  = matchMedia("(max-width: 860px)").matches;
const FINE    = matchMedia("(hover: hover) and (pointer: fine)").matches;
const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
const ANIM = !REDUCED && !!gsap && !!ScrollTrigger;

const PROJECT_IMAGES = [
  { src: "assets/img/livinglinkedweb.jpg", w: 1500, h: 845, alt: { es: "Captura de la web de LivingLinked", en: "Screenshot of the LivingLinked website" } },
  { src: "assets/img/homelab.jpg", w: 900, h: 1200, alt: { es: "Panel del clúster Proxmox del homelab", en: "Proxmox cluster dashboard of the homelab" } },
  { src: "assets/img/Trabajoenciberseguridad.jpg", w: 773, h: 417, alt: { es: "Laboratorio de ciberseguridad", en: "Cybersecurity lab" } }
];

let lang = "es";
try { lang = localStorage.getItem("lang") || "es"; } catch (e) { /* almacenamiento bloqueado */ }
if (!CONTENT[lang]) lang = "es";

let world = null, lenis = null, booted = false, anchors = [];
const C = () => CONTENT[lang];
const get = (obj, path) => path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
const pad = (n) => String(n).padStart(2, "0");

/* ============================================================== ICONOS */
const ICON = {
  arrow: `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  ext:   `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>`,
  infra: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/><path d="M7 7h.01M7 17h.01M11 7h2M11 17h2"/></svg>`,
  sec:   `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>`,
  dev:   `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/></svg>`,
  mail:  `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>`
};

/* ============================================================== PLANTILLAS */
const chips = (arr, sm = false) => `<ul class="chips${sm ? " chips--sm" : ""}">${arr.map(x => `<li>${x}</li>`).join("")}</ul>`;

function tplHero(c) {
  const h = c.hero;
  return `
  <div class="wrap hero">
    <div class="hero__top">
      <span class="pill js-hero"><i class="pulse" aria-hidden="true"></i>${h.status}</span>
      <span class="hero__role mono js-hero">${h.role}</span>
    </div>
    <h1 class="hero__name" id="heroTitle" aria-label="${h.first} ${h.last}">
      <span class="hero__line" aria-hidden="true"><span class="js-chars">${h.first}</span></span>
      <span class="hero__line hero__line--2" aria-hidden="true"><span class="js-chars">${h.last}</span><em class="hero__dot">.</em></span>
    </h1>
    <div class="hero__bottom">
      <p class="hero__tagline js-hero">${h.tagline}</p>
      <p class="hero__desc js-hero">${h.desc}</p>
      <div class="hero__cta js-hero">
        <a class="btn btn--primary magnetic" href="#about"><span>${h.cta1}</span>${ICON.arrow}</a>
        <a class="btn btn--ghost magnetic" href="#experience"><span>${h.cta2}</span></a>
        <a class="btn btn--ghost magnetic" href="#contact"><span>${h.cta3}</span></a>
      </div>
    </div>
    <div class="hero__scroll js-hero" aria-hidden="true"><span class="hero__mouse"><i></i></span>${h.scroll}</div>
  </div>`;
}

function tplAbout(c) {
  const a = c.about;
  return `
  <div class="wrap about">
    <p class="kicker js-up">${a.kicker}</p>
    <p class="manifesto js-scrub">${a.manifesto}</p>
    <div class="about__grid">
      <div class="about__text">
        <p class="js-up">${a.p1}</p>
        <p class="js-up">${a.p2}</p>
      </div>
      <dl class="facts">
        ${a.facts.map(f => `<div class="fact js-up"><dt>${f.k}</dt><dd>${f.v}</dd></div>`).join("")}
      </dl>
    </div>
    <ul class="stats">
      ${a.stats.map(s => `<li class="stat js-up"><b>${s.n}</b><span>${s.l}</span></li>`).join("")}
    </ul>
  </div>`;
}

function tplStack(c) {
  const s = c.stack;
  return `
  <div class="wrap">
    <header class="sec-head">
      <p class="kicker js-up">${s.kicker}</p>
      <h2 class="sec-title js-split">${s.title}</h2>
      <p class="sec-intro js-up">${s.intro}</p>
    </header>
    <div class="disciplines">
      ${s.groups.map((g, i) => `
        <article class="disc disc--${g.id} js-card js-tilt">
          <div class="disc__spot" aria-hidden="true"></div>
          <div class="disc__top"><span class="disc__glyph">${ICON[g.id]}</span><span class="disc__idx mono">${pad(i + 1)}</span></div>
          <h3>${g.name}</h3>
          <p>${g.desc}</p>
          ${chips(g.items)}
        </article>`).join("")}
    </div>
    <p class="note js-up"><span class="note__tag mono">i</span>${s.compliance}</p>
  </div>`;
}

function tplMarquee(c) {
  const row = c.marquee.map(t => `<span>${t}</span><i aria-hidden="true">✦</i>`).join("");
  return row + row;
}

function tplProjectsHead(c) {
  return `<div class="wrap"><p class="kicker js-up">${c.projects.kicker}</p><h2 class="sec-title js-split">${c.projects.title}</h2></div>`;
}

function tplProjects(c) {
  const P = c.projects, L = P.labels;
  return P.items.map((p, i) => {
    const img = PROJECT_IMAGES[i];
    return `
    <section class="scene project ${i % 2 ? "project--left" : "project--right"}" id="project-${i + 1}" data-scene="${3 + i}" aria-labelledby="pt${i}">
      <div class="wrap">
        <article class="pcard js-pcard">
          <div class="pcard__top">
            <span class="pcard__num mono">${pad(i + 1)}<small>/${pad(P.items.length)}</small></span>
            <span class="pcard__cat mono">${p.cat}</span>
          </div>
          <figure class="pcard__img"><img src="${img.src}" alt="${img.alt[lang]}" width="${img.w}" height="${img.h}" loading="lazy" decoding="async" /></figure>
          <h3 class="pcard__title" id="pt${i}">${p.title}</h3>
          <p class="pcard__summary">${p.summary}</p>
          <div class="pcard__role"><span class="mono">${L.role}</span>${p.role}</div>
          <p class="pcard__label mono">${L.did}</p>
          <ul class="pcard__did">${p.did.map(d => `<li>${d}</li>`).join("")}</ul>
          ${chips(p.stack, true)}
          ${p.note ? `<p class="pcard__note">${p.note}</p>` : ""}
          ${p.links.length ? `<div class="pcard__links">${p.links.map(l =>
            `<a class="btn btn--line magnetic" href="${l.url}" target="_blank" rel="noopener noreferrer"><span>${L[l.k]}</span>${ICON.ext}</a>`).join("")}</div>` : ""}
        </article>
      </div>
    </section>`;
  }).join("");
}

function tplExperience(c) {
  const x = c.experience;
  return `
  <div class="wrap exp">
    <header class="sec-head">
      <p class="kicker js-up">${x.kicker}</p>
      <h2 class="sec-title js-split">${x.title}</h2>
    </header>
    <ol class="xp">
      ${x.items.map((it, i) => `
        <li class="xp__item js-xp">
          <span class="xp__gate mono" aria-hidden="true">${pad(i + 1)}</span>
          <div class="xp__body">
            <p class="xp__period mono">${it.period}</p>
            <h3>${it.title}</h3>
            <p class="xp__place">${it.place}</p>
            <p class="xp__desc">${it.desc}</p>
            ${chips(it.tags, true)}
          </div>
        </li>`).join("")}
    </ol>
  </div>`;
}

function tplEducation(c) {
  const e = c.education;
  return `
  <div class="wrap edu">
    <header class="sec-head">
      <p class="kicker js-up">${e.kicker}</p>
      <h2 class="sec-title js-split">${e.title}</h2>
    </header>
    <div class="edu__grid">
      <div class="edu__col glass js-up">
        <h3 class="edu__h mono">${e.groups.academic}</h3>
        <ol class="edu__list">
          ${e.academic.map(a => `
            <li>
              <span class="mono">${a.period}</span>
              <h4>${a.title}</h4>
              <p class="edu__place">${a.place}</p>
              <p>${a.desc}</p>
            </li>`).join("")}
        </ol>
      </div>
      <div class="edu__col glass js-up">
        <h3 class="edu__h mono">${e.groups.certs}</h3>
        <ul class="certs">
          ${e.certs.map(ct => `
            <li class="cert cert--${ct.status}">
              ${ct.img
                ? `<img class="cert__logo" src="${ct.img}" alt="" width="40" height="40" loading="lazy" />`
                : `<span class="cert__hex" aria-hidden="true"></span>`}
              <div class="cert__body"><h4>${ct.name}</h4><p>${ct.org} · ${ct.meta}</p></div>
              <span class="cert__status mono"><i aria-hidden="true"></i>${e.status[ct.status]}</span>
            </li>`).join("")}
        </ul>
        <h3 class="edu__h mono edu__h--now">${e.groups.now}</h3>
        <ul class="now">${e.now.map(n => `<li>${n}</li>`).join("")}</ul>
      </div>
    </div>
  </div>`;
}

function tplContact(c) {
  const k = c.contact;
  return `
  <div class="wrap contact">
    <p class="kicker js-up">${k.kicker}</p>
    <h2 class="contact__title js-split">${k.title}</h2>
    <p class="contact__lead js-up">${k.lead}</p>
    <div class="contact__actions js-up">
      <a class="btn btn--primary btn--xl magnetic" href="mailto:${LINKS.email}">
        ${ICON.mail}<span>${k.email}</span><small class="btn__sub mono">${LINKS.email}</small>
      </a>
      <button class="btn btn--ghost magnetic" id="copyEmail" type="button">
        <span class="copy__label">${k.copy}</span><span class="copy__done" aria-live="polite"></span>
      </button>
    </div>
    <ul class="contact__links js-up">
      <li><a class="link-row" href="${LINKS.linkedin}" target="_blank" rel="noopener noreferrer"><span>${k.linkedin}</span><span class="mono">/in/inigobruk</span>${ICON.ext}</a></li>
      <li><a class="link-row" href="${LINKS.github}" target="_blank" rel="noopener noreferrer"><span>${k.github}</span><span class="mono">@kiz4ru</span>${ICON.ext}</a></li>
      <li><a class="link-row" href="mailto:${LINKS.email}"><span>Email</span><span class="mono">${LINKS.email}</span>${ICON.ext}</a></li>
    </ul>
  </div>`;
}

function tplFooter(c) {
  return `
  <div class="wrap footer__inner">
    <a href="#hero" class="nav__logo" aria-label="Iñigo Bruk — inicio">brk<span>.</span></a>
    <p>${c.footer.built}</p>
    <p>© ${new Date().getFullYear()} Iñigo Bruk</p>
    <a href="#hero" class="footer__top">${c.footer.top} <span aria-hidden="true">↑</span></a>
  </div>`;
}

/* ============================================================== RENDER */
function render() {
  const c = C();
  document.documentElement.lang = lang;

  $$("[data-t]").forEach(el => {
    const v = get(c, el.dataset.t);
    if (typeof v === "string") el.textContent = v;
  });

  $("#hero").innerHTML = tplHero(c);
  $("#about").innerHTML = tplAbout(c);
  $("#stack").innerHTML = tplStack(c);
  $("#marquee").innerHTML = tplMarquee(c);
  $("#projectsHead").innerHTML = tplProjectsHead(c);
  $("#projectList").innerHTML = tplProjects(c);
  $("#experience").innerHTML = tplExperience(c);
  $("#education").innerHTML = tplEducation(c);
  $("#contact").innerHTML = tplContact(c);
  $("#footer").innerHTML = tplFooter(c);

  $("#hudSectors").innerHTML = c.hud.sectors.map((s, i) => `<li data-i="${i}"><span>${pad(i)}</span>${s}</li>`).join("");
  const bootLines = $("#bootLines");   // el arranque se elimina del DOM tras la intro
  if (bootLines) bootLines.innerHTML = c.boot.map((l, i) => `<li style="--i:${i}">${l}</li>`).join("");

  const toggle = $("#langToggle");
  toggle.setAttribute("aria-label", c.meta.lang);
  $$("[data-lang]", toggle).forEach(s => s.classList.toggle("is-active", s.dataset.lang === lang));
  $("#burger").setAttribute("aria-label", document.body.classList.contains("nav-open") ? c.meta.close : c.meta.menu);

  splitChars();
  splitWords();
  bindCopy();
  bindAnchors();
  if (FINE && !REDUCED) { bindMagnetic(); bindTilt(); bindCursorTargets(); }
}

/* ---------------------------------------------------- utilidades de texto */
function splitChars() {
  $$(".js-chars").forEach(el => {
    el.innerHTML = [...el.textContent].map(ch => `<span class="ch">${ch === " " ? "&nbsp;" : ch}</span>`).join("");
  });
}
function splitWords() {
  $$(".js-split").forEach(el => {
    el.innerHTML = el.textContent.trim().split(/\s+/)
      .map(w => `<span class="w"><span class="wi">${w}</span></span>`).join(" ");
  });
  const HL = /^(funcionan|construyen|administran|protegen|work|built|run|protected)[,.:]?$/i;
  $$(".js-scrub").forEach(el => {
    el.innerHTML = el.textContent.trim().split(/\s+/)
      .map(w => `<span class="sw${HL.test(w) ? " sw--hl" : ""}">${w}</span>`).join(" ");
  });
}

/* ============================================================== ESCENA ↔ SCROLL */
function computeAnchors() {
  anchors = $$("[data-scene]")
    .sort((a, b) => a.dataset.scene - b.dataset.scene)
    .map(el => el.getBoundingClientRect().top + window.scrollY);
  if (anchors.length) anchors[0] = 0;
  updateScene();
}

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function sceneProgress(scrollY) {
  if (!anchors.length) return 0;
  const y = scrollY + window.innerHeight * 0.3;
  const n = anchors.length;
  if (y >= anchors[n - 1]) return n - 1;
  let i = 0;
  while (i < n - 1 && y >= anchors[i + 1]) i++;
  const local = (y - anchors[i]) / Math.max(1, anchors[i + 1] - anchors[i]);
  // Mantiene la cámara quieta al principio de la sección (lectura) y luego vuela
  return i + smooth(0.22, 0.96, local);
}

let lastSector = -1;
function updateScene() {
  const sy = window.scrollY;
  const t = sceneProgress(sy);
  world?.setProgress(t);
  // El HUD aparece cuando empieza el viaje (en el hero estorbaría al titular)
  document.body.classList.toggle("at-hero", sy < window.innerHeight * 0.45);

  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pct = max > 0 ? sy / max : 0;
  const fill = $("#hudFill");
  if (fill) fill.style.transform = `scaleY(${pct})`;
  const pctEl = $("#hudPct");
  if (pctEl) pctEl.textContent = String(Math.round(pct * 100)).padStart(3, "0") + "%";

  const sector = Math.min(C().hud.sectors.length - 1, Math.round(t));
  if (sector !== lastSector) {
    lastSector = sector;
    $("#hudSectorNum").textContent = pad(sector);
    $("#hudSectorName").textContent = C().hud.sectors[sector];
    $$("#hudSectors li").forEach(li => li.classList.toggle("is-active", +li.dataset.i === sector));
  }
}

/* ============================================================== ANIMACIONES */
function initAnimations() {
  if (!ANIM) {
    $$(".js-up, .js-hero, .js-card, .js-pcard, .js-xp").forEach(el => { el.style.opacity = 1; });
    return;
  }

  // Titulares: palabras que suben desde una máscara
  $$(".js-split").forEach(el => {
    gsap.from($$(".wi", el), {
      yPercent: 118, rotate: 5, duration: 1.15, ease: "expo.out", stagger: 0.04,
      scrollTrigger: { trigger: el, start: "top 86%" }
    });
  });

  // Manifiesto: las palabras se encienden con el scroll
  $$(".js-scrub").forEach(el => {
    gsap.fromTo($$(".sw", el), { opacity: 0.12 }, {
      opacity: 1, stagger: 0.1, ease: "none",
      scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 42%", scrub: 0.6 }
    });
  });

  // Aparición escalonada genérica
  gsap.set(".js-up", { opacity: 0, y: 42 });
  ScrollTrigger.batch(".js-up", {
    start: "top 90%",
    onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.08, overwrite: true })
  });

  // Disciplinas: entran en perspectiva
  const discs = $$(".js-card");
  if (discs.length) {
    gsap.from(discs, {
      y: 110, rotateX: -18, opacity: 0, transformOrigin: "50% 100%",
      duration: 1.3, ease: "expo.out", stagger: 0.14,
      scrollTrigger: { trigger: ".disciplines", start: "top 82%" }
    });
  }

  // Proyectos: tarjeta que se despliega + contenido escalonado
  $$(".js-pcard").forEach(card => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: "top 78%" } });
    tl.fromTo(card, { clipPath: "inset(0% 0% 100% 0% round 22px)", y: 70 },
                    { clipPath: "inset(0% 0% 0% 0% round 22px)", y: 0, duration: 1.3, ease: "expo.out" })
      .from(card.children, { y: 26, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.06 }, 0.25);
    gsap.to($(".pcard__num", card), {
      yPercent: -60, ease: "none",
      scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  // Experiencia: cada etapa entra cuando "cruzas" su portal
  $$(".js-xp").forEach(item => {
    gsap.from(item, {
      x: MOBILE ? 0 : -70, y: MOBILE ? 50 : 0, opacity: 0, duration: 1.1, ease: "expo.out",
      scrollTrigger: { trigger: item, start: "top 82%" }
    });
    ScrollTrigger.create({ trigger: item, start: "top 60%", end: "bottom 30%", toggleClass: "is-on" });
  });

  // El hero se aleja y se desvanece al empezar el viaje
  gsap.to(".hero", {
    yPercent: -22, opacity: 0, ease: "none",
    scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom 15%", scrub: true }
  });

  // Marquee infinito que acelera y se inclina con la velocidad de scroll
  const track = $("#marquee");
  const loop = gsap.to(track, { xPercent: -50, duration: 38, ease: "none", repeat: -1 });
  const skew = gsap.quickTo(track, "skewX", { duration: 0.5, ease: "power3.out" });
  ScrollTrigger.create({
    onUpdate: self => {
      const v = self.getVelocity();
      loop.timeScale(1 + Math.min(Math.abs(v) / 260, 5));
      skew(Math.max(-10, Math.min(10, v / -180)));
    }
  });

  // Navegación activa
  ["about", "stack", "projects", "experience", "education", "contact"].forEach(id => {
    ScrollTrigger.create({
      trigger: "#" + id, start: "top 50%", end: "bottom 50%",
      onToggle: self => { if (self.isActive) setActiveNav(id); }
    });
  });
}

function setActiveNav(id) {
  $$("#navLinks a").forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === "#" + id));
}

function heroIntro() {
  if (!ANIM) return;
  gsap.timeline({ defaults: { ease: "expo.out" } })
    .from(".hero .ch", { yPercent: 120, rotateX: -90, opacity: 0, duration: 1.4, stagger: 0.05 }, 0.15)
    .from(".hero__dot", { scale: 0, opacity: 0, duration: 0.9, ease: "back.out(3)" }, 0.75)
    .from(".js-hero", { y: 30, opacity: 0, duration: 1.1, stagger: 0.09 }, 0.45);
}

/* ============================================================== INTERACCIÓN */
function bindAnchors() {
  $$('a[href^="#"]').forEach(a => {
    if (a.dataset.bound) return;
    a.dataset.bound = "1";
    a.addEventListener("click", e => {
      const id = a.getAttribute("href");
      const target = id.length > 1 && document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(target, { duration: 2.2, easing: t => 1 - Math.pow(1 - t, 4) });
      else target.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });
}

function bindCopy() {
  const btn = $("#copyEmail");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(LINKS.email); }
    catch (e) {
      const ta = Object.assign(document.createElement("textarea"), { value: LINKS.email });
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
    }
    $(".copy__done", btn).textContent = C().contact.copied;
    btn.classList.add("is-done");
    setTimeout(() => { btn.classList.remove("is-done"); $(".copy__done", btn).textContent = ""; }, 1900);
  });
}

function bindMagnetic() {
  $$(".magnetic").forEach(el => {
    if (el.dataset.mag) return;
    el.dataset.mag = "1";
    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.28);
      yTo((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
  });
}

function bindTilt() {
  $$(".js-tilt").forEach(el => {
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--mx", px * 100 + "%");
      el.style.setProperty("--my", py * 100 + "%");
      gsap.to(el, { rotateY: (px - 0.5) * 10, rotateX: (0.5 - py) * 10, duration: 0.6, ease: "power3.out", transformPerspective: 900 });
    });
    el.addEventListener("pointerleave", () => gsap.to(el, { rotateY: 0, rotateX: 0, duration: 0.9, ease: "elastic.out(1, 0.5)" }));
  });
}

/* --------------------------------------------------------------- cursor */
const cursor = $(".cursor");
function initCursor() {
  if (!FINE || REDUCED || !gsap) return;
  document.body.classList.add("has-cursor");
  const dot = $(".cursor__dot"), ring = $(".cursor__ring");
  const dx = gsap.quickTo(dot, "x", { duration: 0.08 }), dy = gsap.quickTo(dot, "y", { duration: 0.08 });
  const rx = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" }), ry = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });
  window.addEventListener("pointermove", e => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); cursor.classList.add("is-visible"); }, { passive: true });
  document.addEventListener("pointerleave", () => cursor.classList.remove("is-visible"));
  window.addEventListener("pointerdown", () => cursor.classList.add("is-down"));
  window.addEventListener("pointerup", () => cursor.classList.remove("is-down"));
}
function bindCursorTargets() {
  $$("a, button, .js-tilt").forEach(el => {
    if (el.dataset.cur) return;
    el.dataset.cur = "1";
    el.addEventListener("pointerenter", () => cursor.classList.add("is-hover"));
    el.addEventListener("pointerleave", () => cursor.classList.remove("is-hover"));
  });
}

/* --------------------------------------------------------------- menú */
function closeMenu() {
  document.body.classList.remove("nav-open");
  const b = $("#burger");
  b.setAttribute("aria-expanded", "false");
  b.setAttribute("aria-label", C().meta.menu);
  if (booted) lenis?.start();
}
$("#burger").addEventListener("click", () => {
  const open = document.body.classList.toggle("nav-open");
  const b = $("#burger");
  b.setAttribute("aria-expanded", String(open));
  b.setAttribute("aria-label", open ? C().meta.close : C().meta.menu);
  if (open) lenis?.stop(); else lenis?.start();
});
document.addEventListener("keydown", e => { if (e.key === "Escape" && document.body.classList.contains("nav-open")) closeMenu(); });

/* --------------------------------------------------------------- idioma */
$("#langToggle").addEventListener("click", () => {
  lang = lang === "es" ? "en" : "es";
  try { localStorage.setItem("lang", lang); } catch (e) { /* noop */ }
  if (ANIM) ScrollTrigger.getAll().forEach(t => t.kill());
  render();
  initAnimations();
  if (ANIM) {
    gsap.set(".js-up", { opacity: 1, y: 0 });    // lo ya visto no vuelve a ocultarse
    ScrollTrigger.refresh();
  }
  computeAnchors();
});

/* ============================================================== ARRANQUE */
const wait = ms => new Promise(r => setTimeout(r, ms));

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch (e) { return false; }
}

// ?lite → versión ligera sin 3D (equipos modestos o conexiones lentas)
const LITE = new URLSearchParams(location.search).has("lite");

function loadWorld() {
  if (REDUCED || LITE || !hasWebGL()) return Promise.reject(new Error("no-world"));
  return import("./world.js").then(m => {
    world = m.createWorld($("#world"), { mobile: MOBILE, images: PROJECT_IMAGES.map(p => p.src) });
    world.start();
    document.body.classList.add("has-world");
    window.addEventListener("pointermove", e => {
      world.setPointer(e.clientX / window.innerWidth * 2 - 1, e.clientY / window.innerHeight * 2 - 1);
    }, { passive: true });
    updateScene();
    return world;
  });
}

function finishBoot() {
  if (booted) return;
  booted = true;
  const boot = $("#boot");
  boot.classList.add("is-done");
  setTimeout(() => boot.remove(), 1200);
  document.body.classList.remove("is-booting");
  // Si el navegador restauró un scroll previo, el viaje empieza igualmente en el núcleo
  if (!location.hash && window.scrollY > 0) {
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
  }
  lenis?.start();
  world?.intro();
  heroIntro();
}

function startBoot(worldReady) {
  if (REDUCED) { finishBoot(); return; }
  const skip = () => finishBoot();
  window.addEventListener("keydown", skip, { once: true });
  $("#boot").addEventListener("click", skip, { once: true });
  Promise.race([
    Promise.all([wait(1900), worldReady.catch(() => null)]),
    wait(4500)
  ]).then(finishBoot);
}

/* ============================================================== INIT */
// El viaje siempre empieza en el núcleo (sin restaurar el scroll previo)
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
if (!location.hash) window.scrollTo(0, 0);

render();

if (ANIM) {
  gsap.registerPlugin(ScrollTrigger);
  if (window.Lenis) {
    lenis = new window.Lenis({ duration: 1.25, smoothWheel: true, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
}

initAnimations();
initCursor();

// La nav se esconde al bajar y reaparece al subir
let lastY = 0;
function onScroll() {
  const y = window.scrollY;
  updateScene();
  const nav = $("#nav");
  nav.classList.toggle("is-scrolled", y > 40);
  nav.classList.toggle("is-hidden", y > 400 && y > lastY && !document.body.classList.contains("nav-open"));
  lastY = y;
}
window.addEventListener("scroll", onScroll, { passive: true });

if (ANIM) {
  ScrollTrigger.addEventListener("refresh", computeAnchors);
  // Coordenadas de cámara en el HUD
  let f = 0;
  const coords = $("#hudCoords");
  gsap.ticker.add(() => {
    if (!world || ++f % 4) return;
    const p = world.getCamera();
    const n = v => (v < 0 ? "-" : "+") + Math.abs(v).toFixed(1).padStart(5, "0");
    coords.textContent = `X ${n(p.x)} · Y ${n(p.y)} · Z ${n(p.z)}`;
  });
}

const worldReady = loadWorld().catch(() => {
  document.body.classList.add("no-world");
  return null;
});

window.addEventListener("load", () => { if (ANIM) ScrollTrigger.refresh(); else computeAnchors(); });
computeAnchors();
startBoot(worldReady);
