/* ============================================================================
   contact-cards.js — Botón de copiar email + iconos GitHub/LinkedIn con
   tarjeta emergente (adaptación en vanilla JS de un componente React).
   ----------------------------------------------------------------------------
   - Copiar email: Clipboard API → execCommand → muestra la dirección a mano.
   - GitHub: gráfico de contribuciones real, obtenido de una API pública
     (github-contributions-api.jogruber.de), en el color de acento del sitio.
   - Al pasar de un icono a otro, la tarjeta anterior sale deslizándose en la
     dirección del movimiento mientras la nueva entra, y el contenedor cambia
     de tamaño/posición con un morph — se lee como un solo objeto, no popups.
   - Respeta prefers-reduced-motion (las transiciones se anulan por CSS).
   ========================================================================== */
(() => {
  "use strict";

  const cards = document.getElementById("contactCards");
  if (!cards) return;

  const $ = (s, c = document) => c.querySelector(s);

  /* ------------------------------------------------ Botón de copiar email --- */
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch { /* sigue con el fallback */ }
    try {
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.cssText = "position:fixed;top:0;left:0;opacity:0";
      document.body.append(field);
      field.select();
      const ok = document.execCommand("copy");
      field.remove();
      return ok;
    } catch {
      return false;
    }
  }

  function setupCopyButton() {
    const btn = $("#ccCopyBtn");
    const doneEl = btn?.querySelector(".cc-copy__done");
    if (!btn || !doneEl) return;
    const email = (typeof LINKS !== "undefined" && LINKS.email) || "";
    let timer = null;

    btn.addEventListener("click", async () => {
      const ok = await copyText(email);
      doneEl.textContent = ok ? (t("contact.copied") || "¡Email copiado!") : email;
      btn.classList.add("is-flipped");
      clearTimeout(timer);
      timer = setTimeout(() => btn.classList.remove("is-flipped"), ok ? 3000 : 8000);
    });
  }

  // Usa el mismo diccionario I18N de content.js (variable global de script,
  // no de window) para que el idioma coincida con el resto del sitio.
  function t(key) {
    try {
      const lang = localStorage.getItem("lang") || "es";
      return typeof I18N !== "undefined" ? I18N[lang]?.[key] : undefined;
    } catch { return undefined; }
  }

  /* ------------------------------------------------------- Enlaces + hrefs --- */
  const wrap = $("#ccLinks");
  const popup = $("#ccPopup");
  const inner = $("#ccPopupInner");
  const bridge = wrap?.querySelector(".cc-bridge");

  function wireHrefs() {
    if (typeof LINKS === "undefined") return;
    const gh = $("#ccGithub");
    const li = $("#ccLinkedin");
    if (gh) gh.href = LINKS.github;
    if (li) li.href = LINKS.linkedin;
  }

  /* ------------------------------------------------------- Tarjeta GitHub --- */
  const API = "https://github-contributions-api.jogruber.de/v4";
  let ghCache = null; // evita repetir el fetch en cada hover

  function levelOf(count) {
    return count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 9 ? 3 : 4;
  }

  function usernameFromUrl(url) {
    try { return new URL(url).pathname.replace(/\//g, "") || "brk"; }
    catch { return "brk"; }
  }

  function buildGraph(container, days) {
    container.innerHTML = "";
    if (!days.length) return;

    const weeks = [];
    let week = new Array(new Date(`${days[0].date}T00:00:00Z`).getUTCDay()).fill(null);
    for (const day of days) {
      week.push(day);
      if (week.length === 7) { weeks.push(week); week = []; }
    }
    if (week.length) weeks.push([...week, ...new Array(7 - week.length).fill(null)]);

    container.style.gridTemplateColumns = `repeat(${weeks.length}, minmax(0, 1fr))`;

    const tooltip = document.createElement("div");
    tooltip.className = "cc-tooltip";
    const formatter = new Intl.DateTimeFormat("es", { day: "numeric", month: "long", timeZone: "UTC" });

    weeks.forEach(week => week.forEach(day => {
      const cell = document.createElement("div");
      cell.className = "cc-day";
      if (day) {
        cell.dataset.level = String(levelOf(day.count));
        cell.dataset.date = day.date;
        cell.dataset.count = String(day.count);
      }
      container.appendChild(cell);
    }));

    container.appendChild(tooltip);

    const show = (cell) => {
      const { date, count } = cell.dataset;
      if (!date) return hide();
      tooltip.textContent = `${count} contribución${count === "1" ? "" : "es"} · ${formatter.format(new Date(`${date}T00:00:00Z`))}`;
      tooltip.style.left = (cell.offsetLeft + cell.offsetWidth / 2) + "px";
      tooltip.style.top = cell.offsetTop + "px";
      tooltip.classList.add("is-visible");
    };
    const hide = () => tooltip.classList.remove("is-visible");

    container.addEventListener("pointerover", e => {
      if (e.target.classList.contains("cc-day")) show(e.target);
    });
    container.addEventListener("pointerleave", hide);
  }

  function buildGithubCard(el) {
    el.classList.add("cc-card--gh");
    const username = usernameFromUrl(LINKS.github);
    el.innerHTML = `
      <div class="cc-gh__head">
        <span class="cc-gh__avatar" aria-hidden="true">${username.slice(0, 2).toUpperCase()}</span>
        <div class="cc-gh__meta">
          <span class="cc-gh__name">${username}</span>
          <span class="cc-gh__total">…</span>
        </div>
      </div>
      <div class="cc-graph" aria-hidden="true"></div>`;
    const totalEl = el.querySelector(".cc-gh__total");
    const graphEl = el.querySelector(".cc-graph");
    const label = t("contact.ghContrib") || "contribuciones en el último año";

    const render = (days) => {
      const total = days.reduce((sum, d) => sum + d.count, 0);
      totalEl.textContent = `${total.toLocaleString("es")} ${label}`;
      buildGraph(graphEl, days);
    };

    if (ghCache) { render(ghCache); return; }
    totalEl.textContent = "Cargando…";
    fetch(`${API}/${username}?y=last`)
      .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(data => { ghCache = data.contributions || []; render(ghCache); })
      .catch(() => render([])); // el gráfico es decorativo: vacío > roto
  }

  function buildLinkedinCard(el) {
    el.classList.add("cc-card--linkedin");
    el.innerHTML = `
      <div class="cc-li__head"></div>
      <div class="cc-li__body">
        <span class="cc-li__avatar" aria-hidden="true">IB</span>
        <span class="cc-li__name">Iñigo Bruk</span>
        <span class="cc-li__role">${t("contact.role") || "Systems Operator · Ciberseguridad"}</span>
      </div>`;
  }

  const CARD_BUILDERS = { github: buildGithubCard, linkedin: buildLinkedinCard };

  /* --------------------------------------------------- Morph entre tarjetas --- */
  function setupPopover() {
    if (!wrap || !popup || !inner) return;
    const links = [...wrap.querySelectorAll(".cc-link[data-card]")];
    if (!links.length) return;

    let open = false;
    let index = -1;
    let morphing = false;

    function clampLeft() {
      const contW = wrap.clientWidth || 1;
      const w = popup.offsetWidth;
      const left = parseFloat(popup.style.left) || 0;
      popup.style.left = Math.min(Math.max(left, w / 2), Math.max(w / 2, contW - w / 2)) + "px";
    }

    function position(linkEl) {
      const current = inner.querySelector(".cc-card.is-current");
      if (!current) return;
      popup.style.width = current.offsetWidth + "px";
      popup.style.height = current.offsetHeight + "px";
      popup.style.left = (linkEl.offsetLeft + linkEl.offsetWidth / 2) + "px";
      clampLeft();
    }

    function show(cardKey, linkEl, i) {
      if (open && i === index) return;
      const direction = open ? Math.sign(i - index) || 1 : 1;

      const current = inner.querySelector(".cc-card.is-current");
      if (open && current) {
        current.classList.remove("is-current");
        current.style.setProperty("--cc-dir", direction);
        current.classList.add("cc-card--out");
        const drop = () => current.remove();
        current.addEventListener("animationend", drop, { once: true });
        setTimeout(drop, 400); // red de seguridad (pestaña oculta / reduced-motion)
      }

      morphing = open;
      index = i;
      open = true;
      popup.classList.toggle("is-morphing", morphing);
      popup.classList.add("is-open");
      popup.setAttribute("aria-hidden", "false");

      const el = document.createElement("div");
      el.className = "cc-card is-current" + (morphing ? " cc-card--in" : "");
      el.style.setProperty("--cc-dir", direction);
      const build = CARD_BUILDERS[cardKey];
      if (build) build(el);
      inner.appendChild(el);

      requestAnimationFrame(() => position(linkEl));
    }

    function hideAll() {
      open = false;
      index = -1;
      morphing = false;
      popup.classList.remove("is-open", "is-morphing");
      popup.setAttribute("aria-hidden", "true");
    }

    links.forEach((a, i) => {
      const key = a.dataset.card;
      if (!CARD_BUILDERS[key]) return;
      const enter = () => show(key, a, i);
      a.addEventListener("mouseenter", enter);
      a.addEventListener("focus", enter);
    });

    wrap.addEventListener("mouseleave", hideAll);
    wrap.addEventListener("focusout", (e) => {
      if (!wrap.contains(e.relatedTarget)) hideAll();
    });
    bridge?.addEventListener("mouseenter", () => { /* mantiene abierto: sin acción */ });
  }

  wireHrefs();
  setupCopyButton();
  setupPopover();
})();
