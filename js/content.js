/* ============================================================================
   content.js — Contenido editable del sitio
   ----------------------------------------------------------------------------
   TODO lo que quieras cambiar (textos, enlaces, listas) está aquí.
   No necesitas tocar main.js ni index.html para editar copy.
   ========================================================================== */

/* --- Enlaces y datos personales --- */
const LINKS = {
  email:    "inigobrukdev@gmail.com",
  github:   "https://github.com/kiz4ru",
  linkedin: "https://www.linkedin.com/in/inigobruk",
  cv:       "assets/cv-inigo-bruk.pdf"
};

/* --- Diccionario de idiomas --- */
const I18N = {
  es: {
    "nav.about": "Sobre mí",
    "nav.work": "Cómo trabajo",
    "nav.stack": "Stack",
    "nav.projects": "Proyectos",
    "nav.timeline": "Trayectoria",
    "nav.certs": "Certificaciones",
    "nav.cta": "Contacto",

    "hero.eyebrow": "Disponible para remoto",
    "hero.name": "Iñigo Bruk",
    "hero.tagline": "Sistemas y seguridad que aguantan bajo presión.",
    "hero.ctaProjects": "Ver proyectos",
    "hero.ctaContact": "Contacto",
    "hero.scroll": "Desplázate",

    "about.kicker": "01 — Sobre mí",
    "about.title": "Criterio técnico, sin ruido.",
    "about.p1": "Técnico en ciberseguridad y sistemas con experiencia en operación 24×7, redes, soporte y desarrollo. Actualmente Operador de Sistemas en EJIE (Gobierno Vasco) y fundador de mi propia app.",
    "about.p2": "Persona puntual, ordenada y responsable, capaz de trabajar bajo presión, aportar nuevas ideas y colaborar eficazmente en equipo.",
    "about.roleLabel": "Rol", "about.roleValue": "Systems Operator · SOC 24×7",
    "about.eduLabel": "Formación", "about.eduValue": "CFGM SMR · CFGS DAW · Ciberseguridad MSMK",
    "about.langLabel": "Idiomas", "about.langValue": "Español y Euskera (nativo) · Inglés B2",
    "about.locLabel": "Ubicación", "about.locValue": "País Vasco, España · Abierto a remoto",

    "metrics.services": "Servicios en el homelab",
    "metrics.training": "Horas de ethical hacking",
    "metrics.projects": "Proyectos destacados",

    "work.kicker": "02 — Cómo trabajo",
    "work.title": "En qué puedo ayudar.",
    "work.c1Title": "Operación & fiabilidad 24×7",
    "work.c1Desc": "Monitorización, respuesta a incidentes y continuidad de servicio sobre entornos Linux y Windows.",
    "work.c1": ["Monitorización y gestión de alertas", "Respuesta y escalado de incidentes", "Alta disponibilidad y backups", "Hardening y documentación"],
    "work.c2Title": "Seguridad ofensiva",
    "work.c2Desc": "Pentesting de Active Directory y Linux con metodología clara y reporte accionable.",
    "work.c2": ["Pentesting AD & Linux", "Ethical hacking y OSINT", "Revisión de configuración", "Informe técnico y ejecutivo"],
    "work.c3Title": "Desarrollo de producto",
    "work.c3Desc": "De la idea al MVP: front-end con HTML, CSS/SCSS y JavaScript, y back-end con Java, PHP/Laravel y MySQL.",
    "work.c3": ["Front-end con HTML, CSS/SCSS y JavaScript", "Interfaces con React", "Back-end con Java, PHP y Laravel", "Bases de datos con MySQL"],

    "stack.kicker": "03 — Stack & habilidades",
    "stack.title": "Lo que uso a diario.",
    "stack.secTitle": "Ciberseguridad",
    "stack.sec": ["Pentesting (AD & Linux)", "Ethical hacking", "Hardening", "Fundamentos de seguridad de IA"],
    "stack.compTitle": "Cumplimiento & Operación",
    "stack.comp": ["EU AI Act", "NIS2", "Respuesta a incidentes 24×7", "Alta disponibilidad", "Monitorización"],

    "projects.kicker": "04 — Proyectos",
    "projects.title": "Trabajo seleccionado.",
    "proj.roleLabel": "Rol:",
    "proj.linkWeb": "Web", "proj.linkDemo": "Demo", "proj.linkRepo": "Repositorio",

    "proj.p1.tag": "App · Producto",
    "proj.p1.title": "LivingLinked",
    "proj.p1.summary": "App para emparejar compañeros de piso, enfocada en comunidad estudiantil y Erasmus. Lanzamiento inicial en Vitoria-Gasteiz.",
    "proj.p1.role": "Fundador · Producto & Desarrollo",
    "proj.p1.stack": ["Expo / React Native", "Supabase"],
    "proj.p1.bullets": [
      "Definición de producto y alcance del MVP.",
      "Estrategia de contenidos y crecimiento en redes (TikTok / Instagram).",
      "Identidad de marca y sistema visual.",
      "Iteración rápida sobre feedback de usuarios reales."
    ],

    "proj.p2.tag": "Infraestructura",
    "proj.p2.title": "Homelab autogestionado",
    "proj.p2.summary": "Clúster Proxmox de alta disponibilidad con virtualización y contenedores para servicios propios. Diseño, montaje y administración completa.",
    "proj.p2.role": "Diseño · Montaje · Administración",
    "proj.p2.stack": ["Proxmox", "Docker / LXC", "MikroTik (VLANs)", "NAS + backups", "Tailscale / WireGuard", "SAI", "Jellyfin"],
    "proj.p2.bullets": [
      "Segmentación de red y acceso remoto seguro por VPN.",
      "Automatización de despliegue y ciclo de vida de servicios.",
      "Gestión de almacenamiento, snapshots y backups.",
      "Enfoque en privacidad y continuidad del servicio."
    ],

    "proj.p3.tag": "Ciberseguridad",
    "proj.p3.title": "Trabajo en ciberseguridad",
    "proj.p3.summary": "Recurso/cheatsheet web con estilo profesional para la certificación eJPT, más laboratorios de pentesting de AD y Linux.",
    "proj.p3.role": "Investigación · Documentación técnica",
    "proj.p3.stack": ["Pentesting AD", "Linux", "Ethical Hacking (Cisco 70h)", "Metodología eJPT"],
    "proj.p3.bullets": [
      "Metodología de pentesting de principio a fin.",
      "Documentación técnica clara y reutilizable.",
      "Preparación estructurada de certificaciones."
    ],

    "timeline.kicker": "05 — Trayectoria",
    "timeline.title": "Experiencia & formación.",
    "timeline.items": [
      { period: "Ene 2026 — Actualidad", title: "Operador de Sistemas", place: "Versia · EJIE — Gobierno Vasco · Vitoria-Gasteiz", desc: "Monitorización 24×7 de sistemas e infraestructura crítica para garantizar la disponibilidad del servicio. Administración de entornos Linux y Windows por línea de comandos." },
      { period: "2025 — Actualidad", title: "Fundador y desarrollador — LivingLinked", place: "livinglinked.es", desc: "App de búsqueda de compañeros de piso para estudiantes y comunidad Erasmus. Desarrollo de producto y estrategia de marketing y crecimiento en redes." },
      { period: "2023 — 2025", title: "Especialización en Ciberseguridad", place: "MSMK University", desc: "Pentesting de Active Directory y Linux, hardening y cumplimiento (EU AI Act, NIS2)." },
      { period: "Sep 2023 — Ene 2024", title: "Desarrollador de software", place: "SITECO SL", desc: "Programación en Python, Java, Node.js y JavaScript. Resolución y depuración de errores en remoto para empresas." },
      { period: "2021 — 2023", title: "CFGS Desarrollo de Aplicaciones Web (DAW)", place: "Formación Profesional", desc: "Desarrollo front-end y back-end, bases de datos y despliegue." },
      { period: "Mar — Jun 2021", title: "Técnico informático", place: "PCBOX · Informática San Martín", desc: "Soporte técnico, montaje, reparación y mantenimiento de equipos. Atención al cliente." },
      { period: "2019 — 2021", title: "CFGM Sistemas Microinformáticos y Redes (SMR)", place: "Formación Profesional", desc: "Fundamentos de sistemas, redes y administración de infraestructura." }
    ],

    "now.kicker": "06 — Ahora mismo",
    "now.title": "En qué ando.",
    "now.lead": "Este trimestre estoy centrado en consolidar el salto a la seguridad ofensiva.",
    "now.items": [
      "Preparando la certificación <strong>eJPT</strong> con laboratorios de Active Directory y Linux.",
      "Montando una ruta de <strong>seguridad de IA</strong> y cumplimiento (EU AI Act, NIS2).",
      "Ampliando el homelab para practicar detección y respuesta."
    ],

    "certs.kicker": "07 — Certificaciones",
    "certs.title": "Aprendizaje continuo.",
    "certs.items": [
      { name: "Ethical Hacker", org: "Cisco Networking Academy", meta: "70 horas · Completado", status: "done", img: "assets/img/ethical-hacker.png" },
      { name: "Google Cybersecurity", org: "Google", meta: "10 horas · Completado", status: "done", img: "assets/img/googlesec.png" },
      { name: "eJPT — Junior Penetration Tester", org: "INE / eLearnSecurity", meta: "Preparación activa", status: "progress" },
      { name: "CRTO / OSEP", org: "Ruta ofensiva avanzada", meta: "Objetivo en progreso", status: "planned" },
      { name: "Seguridad de IA & cumplimiento", org: "EU AI Act · NIS2", meta: "Ruta de aprendizaje en curso", status: "progress" }
    ],

    "contact.kicker": "08 — Contacto",
    "contact.title": "¿Trabajamos juntos?",
    "contact.lead": "Estoy abierto a oportunidades remotas en sistemas y ciberseguridad.",
    "contact.name": "Nombre", "contact.email": "Email", "contact.message": "Mensaje", "contact.send": "Enviar mensaje",
    "contact.linksLabel": "También me encuentras en",
    "contact.copyEmail": "Copiar mi email",
    "contact.copied": "¡Email copiado!",
    "contact.ghContrib": "contribuciones en el último año",
    "contact.role": "Systems Operator · Ciberseguridad"
  },

  en: {
    "nav.about": "About",
    "nav.work": "How I work",
    "nav.stack": "Stack",
    "nav.projects": "Projects",
    "nav.timeline": "Path",
    "nav.certs": "Certifications",
    "nav.cta": "Contact",

    "hero.eyebrow": "Available for remote",
    "hero.name": "Iñigo Bruk",
    "hero.tagline": "Systems and security that hold up under pressure.",
    "hero.ctaProjects": "View projects",
    "hero.ctaContact": "Contact",
    "hero.scroll": "Scroll",

    "about.kicker": "01 — About",
    "about.title": "Technical judgment, no noise.",
    "about.p1": "Cybersecurity and systems technician with experience in 24×7 operations, networking, support and development. Currently a Systems Operator at EJIE (Basque Government) and founder of my own app.",
    "about.p2": "Punctual, organised and reliable; able to work under pressure, bring new ideas and collaborate effectively in a team.",
    "about.roleLabel": "Role", "about.roleValue": "Systems Operator · 24×7 SOC",
    "about.eduLabel": "Education", "about.eduValue": "Web Dev diploma (DAW) · IT Systems & Networks (SMR) · Cybersecurity (ongoing)",
    "about.langLabel": "Languages", "about.langValue": "Spanish & Basque (native) · English B2",
    "about.locLabel": "Location", "about.locValue": "Basque Country, Spain · Open to remote",

    "metrics.services": "Services in the homelab",
    "metrics.training": "Hours of ethical hacking",
    "metrics.projects": "Featured projects",

    "work.kicker": "02 — How I work",
    "work.title": "Where I can help.",
    "work.c1Title": "24×7 operations & reliability",
    "work.c1Desc": "Monitoring, incident response and service continuity across Linux and Windows environments.",
    "work.c1": ["Monitoring and alert handling", "Incident response and escalation", "High availability and backups", "Hardening and documentation"],
    "work.c2Title": "Offensive security",
    "work.c2Desc": "Active Directory and Linux pentesting with a clear methodology and actionable reporting.",
    "work.c2": ["AD & Linux pentesting", "Ethical hacking and OSINT", "Configuration review", "Technical and executive reports"],
    "work.c3Title": "Product development",
    "work.c3Desc": "From idea to MVP: front-end with HTML, CSS/SCSS and JavaScript, back-end with Java, PHP/Laravel and MySQL.",
    "work.c3": ["Front-end with HTML, CSS/SCSS and JavaScript", "Interfaces with React", "Back-end with Java, PHP and Laravel", "Databases with MySQL"],

    "stack.kicker": "03 — Stack & skills",
    "stack.title": "What I use every day.",
    "stack.secTitle": "Cybersecurity",
    "stack.sec": ["Pentesting (AD & Linux)", "Ethical hacking", "Hardening", "AI security fundamentals"],
    "stack.compTitle": "Compliance & Operations",
    "stack.comp": ["EU AI Act", "NIS2", "24×7 incident response", "High availability", "Monitoring"],

    "projects.kicker": "04 — Projects",
    "projects.title": "Selected work.",
    "proj.roleLabel": "Role:",
    "proj.linkWeb": "Website", "proj.linkDemo": "Demo", "proj.linkRepo": "Repository",

    "proj.p1.tag": "App · Product",
    "proj.p1.title": "LivingLinked",
    "proj.p1.summary": "A flatmate-matching app focused on the student and Erasmus community. Initial launch in Vitoria-Gasteiz.",
    "proj.p1.role": "Founder · Product & Development",
    "proj.p1.stack": ["Expo / React Native", "Supabase"],
    "proj.p1.bullets": [
      "Product definition and MVP scope.",
      "Content and growth strategy on social (TikTok / Instagram).",
      "Brand identity and visual system.",
      "Fast iteration on real user feedback."
    ],

    "proj.p2.tag": "Infrastructure",
    "proj.p2.title": "Self-hosted homelab",
    "proj.p2.summary": "High-availability Proxmox cluster with virtualisation and containers for self-hosted services. Design, build and full administration.",
    "proj.p2.role": "Design · Build · Administration",
    "proj.p2.stack": ["Proxmox", "Docker / LXC", "MikroTik (VLANs)", "NAS + backups", "Tailscale / WireGuard", "UPS", "Jellyfin"],
    "proj.p2.bullets": [
      "Network segmentation and secure remote access over VPN.",
      "Automated deployment and service lifecycle.",
      "Storage, snapshots and backup management.",
      "Privacy-first and service-continuity focus."
    ],

    "proj.p3.tag": "Cybersecurity",
    "proj.p3.title": "Cybersecurity work",
    "proj.p3.summary": "A professionally designed web cheatsheet for the eJPT certification, plus AD and Linux pentesting labs.",
    "proj.p3.role": "Research · Technical writing",
    "proj.p3.stack": ["AD pentesting", "Linux", "Ethical Hacking (Cisco 70h)", "eJPT methodology"],
    "proj.p3.bullets": [
      "End-to-end pentesting methodology.",
      "Clear, reusable technical documentation.",
      "Structured certification preparation."
    ],

    "timeline.kicker": "05 — Path",
    "timeline.title": "Experience & education.",
    "timeline.items": [
      { period: "Jan 2026 — Present", title: "Systems Operator", place: "Versia · EJIE — Basque Government · Vitoria-Gasteiz", desc: "24×7 monitoring of critical systems and infrastructure to guarantee service availability. Command-line administration of Linux and Windows environments." },
      { period: "2025 — Present", title: "Founder & developer — LivingLinked", place: "livinglinked.es", desc: "Flatmate-matching app for students and the Erasmus community. Product development plus marketing and social growth strategy." },
      { period: "2023 — 2025", title: "Cybersecurity specialisation", place: "MSMK University", desc: "Active Directory and Linux pentesting, hardening and compliance (EU AI Act, NIS2)." },
      { period: "Sep 2023 — Jan 2024", title: "Software developer", place: "SITECO SL", desc: "Programming in Python, Java, Node.js and JavaScript. Remote debugging and bug fixing for client companies." },
      { period: "2021 — 2023", title: "Web Application Development diploma (DAW)", place: "Vocational education", desc: "Front-end and back-end development, databases and deployment." },
      { period: "Mar — Jun 2021", title: "IT technician", place: "PCBOX · Informática San Martín", desc: "Technical support, hardware assembly, repair and maintenance. Customer service." },
      { period: "2019 — 2021", title: "IT Systems & Networks diploma (SMR)", place: "Vocational education", desc: "Systems, networking and infrastructure administration fundamentals." }
    ],

    "now.kicker": "06 — Right now",
    "now.title": "What I'm on.",
    "now.lead": "This quarter I'm focused on consolidating the move into offensive security.",
    "now.items": [
      "Preparing the <strong>eJPT</strong> certification with Active Directory and Linux labs.",
      "Building an <strong>AI security</strong> and compliance learning path (EU AI Act, NIS2).",
      "Expanding the homelab to practise detection and response."
    ],

    "certs.kicker": "07 — Certifications",
    "certs.title": "Continuous learning.",
    "certs.items": [
      { name: "Ethical Hacker", org: "Cisco Networking Academy", meta: "70 hours · Completed", status: "done", img: "assets/img/ethical-hacker.png" },
      { name: "Google Cybersecurity", org: "Google", meta: "10 hours · Completed", status: "done", img: "assets/img/googlesec.png" },
      { name: "eJPT — Junior Penetration Tester", org: "INE / eLearnSecurity", meta: "Actively preparing", status: "progress" },
      { name: "CRTO / OSEP", org: "Advanced offensive path", meta: "Goal in progress", status: "planned" },
      { name: "AI security & compliance", org: "EU AI Act · NIS2", meta: "Learning path in progress", status: "progress" }
    ],

    "contact.kicker": "08 — Contact",
    "contact.title": "Shall we work together?",
    "contact.lead": "I'm open to remote opportunities in systems and cybersecurity.",
    "contact.name": "Name", "contact.email": "Email", "contact.message": "Message", "contact.send": "Send message",
    "contact.linksLabel": "Also find me on",
    "contact.copyEmail": "Copy my email",
    "contact.copied": "Email copied!",
    "contact.ghContrib": "contributions in the last year",
    "contact.role": "Systems Operator · Cybersecurity"
  }
};
