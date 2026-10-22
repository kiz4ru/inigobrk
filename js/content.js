/* ============================================================================
   content.js — Todo el texto del portfolio (ES / EN)
   ----------------------------------------------------------------------------
   Edita aquí textos, enlaces, proyectos, experiencia y formación.
   Solo información real: nada de métricas, clientes o certificados inventados.
   ========================================================================== */

export const LINKS = {
  email:        "inigobrukdev@gmail.com",
  github:       "https://github.com/kiz4ru",
  linkedin:     "https://www.linkedin.com/in/inigobruk",
  livinglinked: "https://livinglinked.es"
};

const TECH = [
  "Linux", "Proxmox", "Docker", "LXC", "MikroTik", "Tailscale", "WireGuard",
  "Active Directory", "Python", "JavaScript", "React", "React Native", "Java",
  "PHP", "Laravel", "MySQL", "Supabase", "Node.js", "Git"
];

export const CONTENT = {
  /* ======================================================================= ES */
  es: {
    meta: { skip: "Saltar al contenido", menu: "Menú", close: "Cerrar", lang: "Cambiar a inglés" },
    nav: {
      about: "Perfil", stack: "Stack", projects: "Proyectos",
      experience: "Experiencia", education: "Formación", contact: "Contacto"
    },
    hud: {
      sectors: ["Núcleo", "Perfil", "Stack", "LivingLinked", "Homelab", "Ciberseguridad", "Experiencia", "Formación", "Contacto"],
      sector: "Sector", scroll: "Scroll para explorar", online: "Sistema en línea"
    },
    boot: [
      "brk.sys — iniciando entorno",
      "montando infraestructura ......... ok",
      "asegurando perímetro ............. ok",
      "compilando portfolio ............. ok",
      "acceso concedido"
    ],
    hero: {
      status: "Disponible para remoto",
      role: "Systems Engineering · Cybersecurity · Software",
      first: "Iñigo", last: "Bruk",
      tagline: "Construyo, protejo y mantengo sistemas reales.",
      desc: "Systems Operator en un entorno de monitorización 24×7. Trabajo entre infraestructura, ciberseguridad y desarrollo de software: entiendo cómo funcionan los sistemas, cómo se construyen, cómo se administran y cómo se protegen.",
      cta1: "Explorar el mundo", cta2: "Ver experiencia", cta3: "Contactar",
      scroll: "Desplázate para entrar"
    },
    about: {
      kicker: "01 · Perfil",
      manifesto: "Entiendo los sistemas desde cuatro ángulos: cómo funcionan, cómo se construyen, cómo se administran y cómo se protegen.",
      p1: "Técnico en ciberseguridad y sistemas con experiencia en operación 24×7, redes, soporte y desarrollo. Actualmente Operador de Sistemas en EJIE (Gobierno Vasco) y fundador de mi propia app, LivingLinked.",
      p2: "Aprendo construyendo: mi homelab es donde practico redes, virtualización y hardening reales. Persona puntual, ordenada y responsable, acostumbrada a trabajar bajo presión y en equipo.",
      facts: [
        { k: "Rol actual",  v: "Systems Operator · SOC 24×7" },
        { k: "Formación",   v: "CFGS DAW · CFGM SMR · Especialización en Ciberseguridad (MSMK)" },
        { k: "Idiomas",     v: "Español y euskera (nativo) · Inglés B2" },
        { k: "Ubicación",   v: "País Vasco, España · Abierto a remoto" }
      ],
      stats: [
        { n: "24×7", l: "Monitorización de sistemas críticos" },
        { n: "15+",  l: "Servicios autogestionados en el homelab" },
        { n: "70h",  l: "Formación en ethical hacking (Cisco)" }
      ]
    },
    stack: {
      kicker: "02 · Stack",
      title: "Tres disciplinas, un mismo sistema.",
      intro: "No separo la infraestructura del código ni de la seguridad: cada decisión en una capa afecta a las otras.",
      groups: [
        { id: "infra", name: "Sistemas e infraestructura", desc: "Administración, virtualización y redes. Lo que mantiene el servicio en pie.",
          items: ["Linux", "Windows (CLI)", "Proxmox", "Docker / LXC", "Redes y VLANs · MikroTik", "Tailscale · WireGuard", "Backups y snapshots", "Monitorización 24×7"] },
        { id: "sec", name: "Ciberseguridad", desc: "Operación de seguridad y práctica ofensiva en laboratorio.",
          items: ["Operaciones SOC 24×7", "Gestión y escalado de incidentes", "Pentesting AD & Linux (labs)", "Ethical hacking · OSINT", "Hardening", "Metodología eJPT"] },
        { id: "dev", name: "Desarrollo de software", desc: "De la idea al producto: front-end, back-end y datos.",
          items: ["HTML · CSS / SCSS", "JavaScript", "React · React Native (Expo)", "Python", "Java", "PHP · Laravel", "Node.js", "MySQL · Supabase", "Git"] }
      ],
      compliance: "Seguridad de IA, NIS2 y EU AI Act: ruta de aprendizaje en curso, trabajada en mi especialización — no experiencia profesional aplicada."
    },
    marquee: TECH,
    projects: {
      kicker: "03 · Proyectos",
      title: "Trabajo real, verificable.",
      labels: { role: "Mi rol", did: "Qué hice", stack: "Tecnología", visit: "Visitar web", github: "Ver GitHub" },
      items: [
        {
          cat: "Product Engineering", title: "LivingLinked",
          summary: "App para encontrar compañeros de piso, enfocada en la comunidad estudiantil y Erasmus. Lanzamiento inicial en Vitoria-Gasteiz.",
          role: "Fundador · Producto y desarrollo",
          did: ["Definición de producto y alcance del MVP.", "Identidad de marca y sistema visual.", "Estrategia de contenidos y crecimiento en TikTok e Instagram.", "Iteración rápida a partir del feedback de usuarios reales."],
          stack: ["Expo", "React Native", "Supabase"],
          links: [{ k: "visit", url: "https://livinglinked.es" }]
        },
        {
          cat: "Infrastructure Engineering", title: "Homelab autogestionado",
          summary: "Clúster Proxmox con virtualización y contenedores para servicios propios. Diseño, montaje y administración completa.",
          role: "Diseño · Montaje · Administración",
          did: ["Segmentación de red con VLANs y acceso remoto seguro por VPN.", "Automatización del despliegue y del ciclo de vida de servicios.", "Gestión de almacenamiento, snapshots y backups.", "Enfoque en privacidad y continuidad del servicio."],
          stack: ["Proxmox", "Docker / LXC", "MikroTik", "NAS", "Tailscale", "WireGuard", "SAI", "Jellyfin"],
          links: []
        },
        {
          cat: "Security Research & Labs", title: "Laboratorios de ciberseguridad",
          summary: "Recurso web tipo cheatsheet para la certificación eJPT y laboratorios de pentesting de Active Directory y Linux.",
          role: "Investigación · Documentación técnica",
          did: ["Metodología de pentesting de principio a fin.", "Documentación técnica clara y reutilizable.", "Preparación estructurada de certificaciones."],
          stack: ["Active Directory", "Linux", "Metodología eJPT", "Ethical Hacking"],
          note: "Entornos de laboratorio educativos — no evaluaciones sobre sistemas de terceros.",
          links: [{ k: "github", url: "https://github.com/kiz4ru" }]
        }
      ]
    },
    experience: {
      kicker: "04 · Experiencia",
      title: "Cada etapa, una puerta.",
      items: [
        { period: "Ene 2026 — Actualidad", title: "Operador de Sistemas", place: "Versia · EJIE — Gobierno Vasco · Vitoria-Gasteiz",
          desc: "Monitorización 24×7 de sistemas e infraestructura crítica para garantizar la disponibilidad del servicio. Administración de entornos Linux y Windows por línea de comandos.",
          tags: ["SOC 24×7", "Linux", "Windows"] },
        { period: "2025 — Actualidad", title: "Fundador y desarrollador", place: "LivingLinked · livinglinked.es",
          desc: "App de búsqueda de compañeros de piso para estudiantes y comunidad Erasmus. Desarrollo de producto y estrategia de marketing y crecimiento en redes.",
          tags: ["Producto", "React Native", "Supabase"] },
        { period: "Sep 2023 — Ene 2024", title: "Desarrollador de software", place: "SITECO SL",
          desc: "Programación en Python, Java, Node.js y JavaScript. Resolución y depuración de errores en remoto para empresas.",
          tags: ["Python", "Java", "Node.js"] },
        { period: "Mar — Jun 2021", title: "Técnico informático", place: "PCBOX · Informática San Martín",
          desc: "Soporte técnico, montaje, reparación y mantenimiento de equipos. Atención al cliente.",
          tags: ["Soporte", "Hardware"] }
      ]
    },
    education: {
      kicker: "05 · Formación",
      title: "Aprendizaje continuo.",
      groups: { academic: "Formación académica", certs: "Certificaciones y cursos", now: "Ahora mismo" },
      status: { done: "Completado", progress: "En curso", planned: "Objetivo" },
      academic: [
        { period: "2023 — 2025", title: "Especialización en Ciberseguridad", place: "MSMK University", desc: "Pentesting de Active Directory y Linux, hardening y cumplimiento (EU AI Act, NIS2)." },
        { period: "2021 — 2023", title: "CFGS Desarrollo de Aplicaciones Web (DAW)", place: "Formación Profesional", desc: "Desarrollo front-end y back-end, bases de datos y despliegue." },
        { period: "2019 — 2021", title: "CFGM Sistemas Microinformáticos y Redes (SMR)", place: "Formación Profesional", desc: "Fundamentos de sistemas, redes y administración de infraestructura." }
      ],
      certs: [
        { name: "Ethical Hacker", org: "Cisco Networking Academy", meta: "Curso · 70 horas", status: "done", img: "assets/img/ethical-hacker.png" },
        { name: "Google Cybersecurity", org: "Google", meta: "Curso · 10 horas", status: "done", img: "assets/img/googlesec.png" },
        { name: "eJPT — Junior Penetration Tester", org: "INE Security", meta: "En preparación activa", status: "progress" },
        { name: "Seguridad de IA y cumplimiento", org: "EU AI Act · NIS2", meta: "Ruta de aprendizaje", status: "progress" },
        { name: "CRTO / OSEP", org: "Ruta ofensiva avanzada", meta: "Objetivo a futuro", status: "planned" }
      ],
      now: [
        "Preparando la certificación eJPT con laboratorios de Active Directory y Linux.",
        "Construyendo una ruta de seguridad de IA y cumplimiento (EU AI Act, NIS2).",
        "Ampliando el homelab para practicar detección y respuesta."
      ]
    },
    contact: {
      kicker: "06 · Contacto",
      title: "¿Buscas a alguien que entienda sistemas, seguridad y desarrollo?",
      lead: "Estoy abierto a conversar sobre oportunidades profesionales, proyectos tecnológicos y colaboraciones — en remoto o en el País Vasco.",
      email: "Escríbeme", copy: "Copiar email", copied: "Email copiado",
      linkedin: "LinkedIn", github: "GitHub"
    },
    footer: {
      built: "Diseñado y desarrollado por Iñigo Bruk · Three.js · GSAP",
      top: "Volver al núcleo"
    }
  },

  /* ======================================================================= EN */
  en: {
    meta: { skip: "Skip to content", menu: "Menu", close: "Close", lang: "Switch to Spanish" },
    nav: {
      about: "Profile", stack: "Stack", projects: "Projects",
      experience: "Experience", education: "Education", contact: "Contact"
    },
    hud: {
      sectors: ["Core", "Profile", "Stack", "LivingLinked", "Homelab", "Cybersecurity", "Experience", "Education", "Contact"],
      sector: "Sector", scroll: "Scroll to explore", online: "System online"
    },
    boot: [
      "brk.sys — booting environment",
      "mounting infrastructure .......... ok",
      "securing perimeter ............... ok",
      "compiling portfolio .............. ok",
      "access granted"
    ],
    hero: {
      status: "Available for remote",
      role: "Systems Engineering · Cybersecurity · Software",
      first: "Iñigo", last: "Bruk",
      tagline: "I build, secure and maintain real systems.",
      desc: "Systems Operator in a 24×7 monitoring environment. I work across infrastructure, cybersecurity and software development: I understand how systems work, how they're built, how they're run and how they're protected.",
      cta1: "Explore the world", cta2: "View experience", cta3: "Get in touch",
      scroll: "Scroll to enter"
    },
    about: {
      kicker: "01 · Profile",
      manifesto: "I understand systems from four angles: how they work, how they're built, how they're run and how they're protected.",
      p1: "Cybersecurity and systems technician with experience in 24×7 operations, networking, support and development. Currently a Systems Operator at EJIE (Basque Government) and founder of my own app, LivingLinked.",
      p2: "I learn by building: my homelab is where I practise real networking, virtualisation and hardening. Punctual, organised and reliable, used to working under pressure and as part of a team.",
      facts: [
        { k: "Current role", v: "Systems Operator · 24×7 SOC" },
        { k: "Education",    v: "Web App Development (DAW) · IT Systems & Networks (SMR) · Cybersecurity specialisation (MSMK)" },
        { k: "Languages",    v: "Spanish & Basque (native) · English B2" },
        { k: "Location",     v: "Basque Country, Spain · Open to remote" }
      ],
      stats: [
        { n: "24×7", l: "Monitoring of critical systems" },
        { n: "15+",  l: "Self-hosted services in the homelab" },
        { n: "70h",  l: "Ethical hacking training (Cisco)" }
      ]
    },
    stack: {
      kicker: "02 · Stack",
      title: "Three disciplines, one system.",
      intro: "I don't separate infrastructure from code or from security: every decision in one layer affects the others.",
      groups: [
        { id: "infra", name: "Systems & infrastructure", desc: "Administration, virtualisation and networking. What keeps the service up.",
          items: ["Linux", "Windows (CLI)", "Proxmox", "Docker / LXC", "Networks & VLANs · MikroTik", "Tailscale · WireGuard", "Backups & snapshots", "24×7 monitoring"] },
        { id: "sec", name: "Cybersecurity", desc: "Security operations and offensive practice in the lab.",
          items: ["24×7 SOC operations", "Incident handling & escalation", "AD & Linux pentesting (labs)", "Ethical hacking · OSINT", "Hardening", "eJPT methodology"] },
        { id: "dev", name: "Software development", desc: "From idea to product: front-end, back-end and data.",
          items: ["HTML · CSS / SCSS", "JavaScript", "React · React Native (Expo)", "Python", "Java", "PHP · Laravel", "Node.js", "MySQL · Supabase", "Git"] }
      ],
      compliance: "AI security, NIS2 and EU AI Act: an ongoing learning path from my specialisation — not applied professional experience."
    },
    marquee: TECH,
    projects: {
      kicker: "03 · Projects",
      title: "Real, verifiable work.",
      labels: { role: "My role", did: "What I did", stack: "Technology", visit: "Visit website", github: "View GitHub" },
      items: [
        {
          cat: "Product Engineering", title: "LivingLinked",
          summary: "A flatmate-finding app focused on the student and Erasmus community. Initial launch in Vitoria-Gasteiz.",
          role: "Founder · Product & development",
          did: ["Product definition and MVP scope.", "Brand identity and visual system.", "Content and growth strategy on TikTok and Instagram.", "Fast iteration on feedback from real users."],
          stack: ["Expo", "React Native", "Supabase"],
          links: [{ k: "visit", url: "https://livinglinked.es" }]
        },
        {
          cat: "Infrastructure Engineering", title: "Self-hosted homelab",
          summary: "A Proxmox cluster with virtualisation and containers for self-hosted services. Designed, built and fully administered by me.",
          role: "Design · Build · Administration",
          did: ["Network segmentation with VLANs and secure remote access over VPN.", "Automated deployment and service lifecycle.", "Storage, snapshot and backup management.", "Privacy-first, service-continuity focus."],
          stack: ["Proxmox", "Docker / LXC", "MikroTik", "NAS", "Tailscale", "WireGuard", "UPS", "Jellyfin"],
          links: []
        },
        {
          cat: "Security Research & Labs", title: "Cybersecurity labs",
          summary: "A cheatsheet-style web resource for the eJPT certification, plus Active Directory and Linux pentesting labs.",
          role: "Research · Technical writing",
          did: ["End-to-end pentesting methodology.", "Clear, reusable technical documentation.", "Structured certification preparation."],
          stack: ["Active Directory", "Linux", "eJPT methodology", "Ethical Hacking"],
          note: "Educational lab environments — not assessments of third-party systems.",
          links: [{ k: "github", url: "https://github.com/kiz4ru" }]
        }
      ]
    },
    experience: {
      kicker: "04 · Experience",
      title: "Every stage, a gateway.",
      items: [
        { period: "Jan 2026 — Present", title: "Systems Operator", place: "Versia · EJIE — Basque Government · Vitoria-Gasteiz",
          desc: "24×7 monitoring of critical systems and infrastructure to guarantee service availability. Command-line administration of Linux and Windows environments.",
          tags: ["24×7 SOC", "Linux", "Windows"] },
        { period: "2025 — Present", title: "Founder & developer", place: "LivingLinked · livinglinked.es",
          desc: "Flatmate-finding app for students and the Erasmus community. Product development plus marketing and social growth strategy.",
          tags: ["Product", "React Native", "Supabase"] },
        { period: "Sep 2023 — Jan 2024", title: "Software developer", place: "SITECO SL",
          desc: "Programming in Python, Java, Node.js and JavaScript. Remote debugging and bug fixing for client companies.",
          tags: ["Python", "Java", "Node.js"] },
        { period: "Mar — Jun 2021", title: "IT technician", place: "PCBOX · Informática San Martín",
          desc: "Technical support, hardware assembly, repair and maintenance. Customer service.",
          tags: ["Support", "Hardware"] }
      ]
    },
    education: {
      kicker: "05 · Education",
      title: "Continuous learning.",
      groups: { academic: "Formal education", certs: "Certifications & courses", now: "Right now" },
      status: { done: "Completed", progress: "In progress", planned: "Goal" },
      academic: [
        { period: "2023 — 2025", title: "Cybersecurity specialisation", place: "MSMK University", desc: "Active Directory and Linux pentesting, hardening and compliance (EU AI Act, NIS2)." },
        { period: "2021 — 2023", title: "Web Application Development diploma (DAW)", place: "Vocational education", desc: "Front-end and back-end development, databases and deployment." },
        { period: "2019 — 2021", title: "IT Systems & Networks diploma (SMR)", place: "Vocational education", desc: "Systems, networking and infrastructure administration fundamentals." }
      ],
      certs: [
        { name: "Ethical Hacker", org: "Cisco Networking Academy", meta: "Course · 70 hours", status: "done", img: "assets/img/ethical-hacker.png" },
        { name: "Google Cybersecurity", org: "Google", meta: "Course · 10 hours", status: "done", img: "assets/img/googlesec.png" },
        { name: "eJPT — Junior Penetration Tester", org: "INE Security", meta: "Actively preparing", status: "progress" },
        { name: "AI security & compliance", org: "EU AI Act · NIS2", meta: "Learning path", status: "progress" },
        { name: "CRTO / OSEP", org: "Advanced offensive path", meta: "Future goal", status: "planned" }
      ],
      now: [
        "Preparing the eJPT certification with Active Directory and Linux labs.",
        "Building an AI security and compliance learning path (EU AI Act, NIS2).",
        "Expanding the homelab to practise detection and response."
      ]
    },
    contact: {
      kicker: "06 · Contact",
      title: "Looking for someone who understands systems, security and software?",
      lead: "I'm open to conversations about professional opportunities, tech projects and collaborations — remote or in the Basque Country.",
      email: "Email me", copy: "Copy email", copied: "Email copied",
      linkedin: "LinkedIn", github: "GitHub"
    },
    footer: {
      built: "Designed & built by Iñigo Bruk · Three.js · GSAP",
      top: "Back to the core"
    }
  }
};
