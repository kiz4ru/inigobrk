/* ============================================================================
   main.js — Render de contenido, i18n, tema y animaciones de scroll
   ========================================================================== */
(() => {
  "use strict";

  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------------------------------------------------------------- i18n --- */
  let lang = localStorage.getItem("lang") || "es";

  function t(key) {
    return (I18N[lang] && I18N[lang][key]) ?? key;
  }

  function applyI18n() {
    document.documentElement.lang = lang;

    // Nodos de texto simple
    $$("[data-i18n]").forEach(el => {
      const val = t(el.dataset.i18n);
      if (typeof val === "string") el.textContent = val;
    });

    // Listas (<ul> con <li>)
    $$("[data-i18n-list]").forEach(ul => {
      const arr = t(ul.dataset.i18nList);
      if (!Array.isArray(arr)) return;
      ul.innerHTML = arr.map(x => `<li>${x}</li>`).join("");
    });

    renderTimeline();
    renderCerts();
    renderContactLinks();

    // Estado visual del switch de idioma
    $$("#langToggle [data-lang]").forEach(s =>
      s.classList.toggle("is-active", s.dataset.lang === lang));

    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }

  function setLang(next) {
    lang = next;
    localStorage.setItem("lang", lang);
    applyI18n();
  }

  function toggleLang() { setLang(lang === "es" ? "en" : "es"); }

  $("#langToggle")?.addEventListener("click", toggleLang);
  $("#langToggleFooter")?.addEventListener("click", toggleLang);

  /* --------------------------------------------------- render dinámico --- */
  function renderTimeline() {
    const list = $("#timelineList");
    if (!list) return;
    const items = t("timeline.items");
    if (!Array.isArray(items)) return;
    list.innerHTML = items.map(i => `
      <li class="timeline__item reveal">
        <span class="timeline__period">${i.period}</span>
        <div class="timeline__body">
          <h3>${i.title}</h3>
          <p class="timeline__place">${i.place}</p>
          <p>${i.desc}</p>
        </div>
      </li>`).join("");
  }

  function renderCerts() {
    const grid = $("#certsGrid");
    if (!grid) return;
    const items = t("certs.items");
    if (!Array.isArray(items)) return;
    const label = { done: "✓", progress: "◐", planned: "○" };
    grid.innerHTML = items.map(c => `
      <article class="cert reveal cert--${c.status}${c.img ? " cert--logo" : ""}">
        ${c.img
          ? `<img class="cert__logo" src="${c.img}" alt="${c.name}" loading="lazy" width="48" height="48" />`
          : `<span class="cert__mark" aria-hidden="true">${label[c.status] || "○"}</span>`}
        <h3>${c.name}</h3>
        <p class="cert__org">${c.org}</p>
        <p class="cert__meta">${c.meta}</p>
      </article>`).join("");
  }

  // Los enlaces de contacto (GitHub/LinkedIn) y el botón de copiar email
  // viven en js/contact-cards.js, que rellena sus href desde LINKS.
  function renderContactLinks() {}

  // Enlace de CV desde LINKS
  $$('a[href="assets/cv-inigo-bruk.pdf"]').forEach(a => { a.href = LINKS.cv; });

  /* ---------------------------------------------------------------- tema --- */
  const THEME_KEY = "theme";
  function setTheme(mode) {
    document.documentElement.dataset.theme = mode;
    localStorage.setItem(THEME_KEY, mode);
  }
  setTheme(localStorage.getItem(THEME_KEY) ||
    (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));

  $("#themeToggle")?.addEventListener("click", () => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });

  /* ------------------------------------------------------- menú móvil --- */
  const burger = $("#burger");
  const navLinks = $(".nav__links");
  burger?.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    burger.setAttribute("aria-expanded", String(open));
  });
  $$(".nav__links a").forEach(a => a.addEventListener("click", () => {
    document.body.classList.remove("nav-open");
    burger?.setAttribute("aria-expanded", "false");
  }));

  /* --------------------------------------------- barra de progreso --- */
  const bar = $("#scrollBar");
  const toTop = $("#toTop");
  function onScroll() {
    const h = document.documentElement;
    const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
    if (bar) bar.style.transform = `scaleX(${p})`;
    if (toTop) toTop.hidden = h.scrollTop < 600;
    $("#nav")?.classList.toggle("is-scrolled", h.scrollTop > 10);
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop?.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" }));

  /* ----------------------------------------------- primera pintura --- */
  document.documentElement.classList.add("js");
  applyI18n();

  /* --------------------------------------- Hero: mask reveal por líneas --- */
  let heroRevealed = false;
  function revealHero() {
    if (heroRevealed) return;
    heroRevealed = true;
    const blocks = $$(".hero .reveal-mask");
    if (!blocks.length) return;
    if (REDUCED) {
      blocks.forEach(b => b.classList.add("is-in", "unclip"));
      return;
    }
    blocks.forEach((b, i) => {
      const inner = b.querySelector(".mask__inner");
      inner?.addEventListener("transitionend", () => b.classList.add("unclip"), { once: true });
      setTimeout(() => b.classList.add("is-in"), 120 + i * 90);
    });
  }
  // El hero se revela justo cuando el preloader empieza a retirarse
  // (evento disparado en el <script> inline del preloader, en index.html),
  // para que se sienta un solo movimiento continuo. Si por lo que sea el
  // preloader no llega a avisar, una red de seguridad lo dispara igual.
  window.addEventListener("preloader:done", revealHero, { once: true });
  setTimeout(revealHero, 2600);

  /* ========================================================================
     ANIMACIONES
     ==================================================================== */

  // Red de seguridad: nada con .reveal debe quedarse invisible.
  function revealVisible() {
    const vh = window.innerHeight || 800;
    $$(".reveal:not(.is-in)").forEach(el => {
      if (el.getBoundingClientRect().top < vh * 0.92) el.classList.add("is-in");
    });
  }

  /* --------------------------------------- Nube de logos: onda periódica --- */
  function setupTechCloud() {
    const cloud = document.getElementById("techcloud");
    if (!cloud) return;
    const items = [...cloud.querySelectorAll(".techcloud__item")];
    if (!items.length) return;

    // Índice por logo para el escalonado (--i) + limpieza al terminar
    items.forEach((el, i) => {
      el.style.setProperty("--i", i);
      el.addEventListener("animationend", () => el.classList.remove("wave"));
    });

    if (REDUCED) return; // sin onda

    const fire = () => items.forEach(el => {
      el.classList.remove("wave");
      void el.offsetWidth;      // reinicia la animación aunque se repita
      el.classList.add("wave");
    });

    // Solo corre cuando la sección está en el viewport
    let timer = null;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && timer === null) {
          fire();
          timer = setInterval(fire, 3200);
        } else if (!entry.isIntersecting && timer !== null) {
          clearInterval(timer);
          timer = null;
          items.forEach(el => el.classList.remove("wave"));
        }
      });
    }, { threshold: 0.25 });
    io.observe(cloud);
  }

  function initAnimations() {

    /* Smooth scroll (Lenis) — desactivado con reduced-motion */
    let lenis = null;
    if (!REDUCED && window.Lenis) {
      lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }

    // Anclas: usa Lenis si está disponible
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener("click", e => {
        const id = a.getAttribute("href");
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: -70 });
        else target.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });
      });
    });

    /* --- Nube de logos (independiente de GSAP) --- */
    setupTechCloud();

    /* --- Sin animaciones (o sin GSAP): mostrar todo y salir --- */
    if (REDUCED || !window.gsap) {
      $$(".reveal, .line").forEach(el => el.classList.add("is-in"));
      animateCounters(true);
      setupScrollSpy();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    if (lenis) lenis.on("scroll", ScrollTrigger.update);

    /* --- Hero: el mask reveal ya se disparó al cargar (revealHero) --- */

    /* --- Parallax en fondo del hero --- */
    $$("[data-parallax]").forEach(el => {
      gsap.to(el, {
        yPercent: parseFloat(el.dataset.parallax) * 100,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });
    });

    /* --- Reveal on scroll con stagger por grupos --- */
    $$(".reveal").forEach(el => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => el.classList.add("is-in")
      });
    });
    // Stagger dentro de grids
    [".work__grid", ".skills", ".metrics", ".certs__grid"].forEach(sel => {
      const wrap = $(sel);
      if (!wrap) return;
      const kids = $$(".reveal", wrap);
      ScrollTrigger.create({
        trigger: wrap, start: "top 80%", once: true,
        onEnter: () => kids.forEach((k, i) =>
          setTimeout(() => k.classList.add("is-in"), i * 90))
      });
    });

    /* --- Contadores count-up --- */
    animateCounters(false);

    /* --- Proyectos: sección pinned con cambio de panel --- */
    setupPinnedProjects();

    /* --- Scroll-spy --- */
    setupScrollSpy();

    ScrollTrigger.refresh();
    revealVisible();

    /* --- Recalcular cuando el layout se asiente (fuentes, imágenes) --- */
    if (document.fonts && document.fonts.ready)
      document.fonts.ready.then(() => { ScrollTrigger.refresh(); revealVisible(); });
    window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });

    /* --- Último recurso: a los 2,6 s nada queda oculto --- */
    setTimeout(() => $$(".reveal:not(.is-in)").forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-in");
    }), 2600);
  }

  /* Arranca en cuanto el DOM está listo (GSAP/Lenis ya cargados en este punto),
     no en window.load: así no espera a fuentes, CDN ni imágenes. */
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", initAnimations, { once: true });
  else
    initAnimations();

  /* ---------------------------------------------------- count-up --- */
  function animateCounters(instant) {
    $$("[data-count]").forEach(el => {
      const end = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      if (instant) { el.textContent = end + suffix; return; }
      ScrollTrigger.create({
        trigger: el, start: "top 90%", once: true,
        onEnter: () => {
          const obj = { v: 0 };
          gsap.to(obj, {
            v: end, duration: 1.4, ease: "power2.out",
            onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; }
          });
        }
      });
    });
  }

  /* -------------------------------------------- pinned projects --- */
  function setupPinnedProjects() {
    const pin = $("#projectsPin");
    const panels = $$(".panel");
    const navItems = $$(".projects__nav li");
    if (!pin || panels.length === 0) return;

    const setActive = (idx) => {
      panels.forEach((p, i) => p.classList.toggle("is-active", i === idx));
      navItems.forEach((n, i) => n.classList.toggle("is-active", i === idx));
    };
    setActive(0);

    // En móvil: sin pin, cada panel se revela normal
    if (window.matchMedia("(max-width: 860px)").matches) {
      pin.classList.add("no-pin");
      panels.forEach(p => {
        ScrollTrigger.create({ trigger: p, start: "top 80%", once: true,
          onEnter: () => p.classList.add("is-active") });
      });
      return;
    }

    ScrollTrigger.create({
      trigger: pin,
      start: "top top",
      end: () => "+=" + (panels.length * window.innerHeight),
      pin: true,
      scrub: true,
      snap: 1 / (panels.length - 1),
      onUpdate: (self) => {
        const idx = Math.min(panels.length - 1,
          Math.floor(self.progress * panels.length));
        setActive(idx);
      }
    });
  }

  /* -------------------------------------------------- scroll-spy --- */
  function setupScrollSpy() {
    const links = $$(".nav__links a");
    const map = new Map();
    links.forEach(l => {
      const sec = document.querySelector(l.getAttribute("href"));
      if (sec) map.set(sec, l);
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          links.forEach(l => l.classList.remove("is-active"));
          map.get(en.target)?.classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    map.forEach((_, sec) => io.observe(sec));
  }

})();
