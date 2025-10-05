export const hero = {
  eyebrow: 'Sicher. Schnell. Auditierbar.',
  title: 'Firewall‑Powered AI Agents',
  sub: 'Sichere AI‑Agenten mit Vor‑/Nachfilter, Routing & Policies. Orchestrierung mit SIGMACODE AI – auditierbar und schnell (\u003c100ms Overhead).',
  bullets: ['Vor-/Nachfilter', 'Kong Gateway', 'SIGMACODE Orchestrierung', 'RBAC · Audit'],
  ctas: [
    { href: '/chat', label: 'Jetzt chatten', primary: true },
    { href: '#how', label: 'Wie es funktioniert', primary: false },
  ],
};

export const caseStudies = {
  id: 'cases',
  title: 'Case Studies',
  items: [
    {
      vertical: 'FINTECH',
      title: 'Compliance‑sichere Research‑Agenten',
      summary:
        'Ein FinTech skaliert Research‑Workflows mit Firewall‑Policies. Shadow‑Mode erlaubte risikofreies Tuning vor dem Enforce‑Cutover.',
      kpis: ['−40% Recherchezeit', '+2.1x Output/Analyst', '0 Policy‑Incidents'],
    },
    {
      vertical: 'E‑COMMERCE',
      title: 'Support‑Copilot mit Guardrails',
      summary:
        'Antwortqualität & CSAT stiegen durch den Nachfilter‑Check und Audit‑Transparenz. Sensitive Inhalte werden zuverlässig geschwärzt.',
      kpis: ['+12% CSAT', '−28% Handle Time', 'PII‑Leak: 0'],
    },
    {
      vertical: 'SAAS',
      title: 'Operative Automationen per Workflows',
      summary:
        'Von Ad‑hoc zu reproduzierbaren Pipelines mit Versionierung, Quoten und Kostenkontrolle pro Team und Agent.',
      kpis: ['−55% manuelle Tasks', 'Budget‑Alerts live', 'Rollbacks in Minuten'],
    },
  ],
};

export const integrations = {
  id: 'integrations',
  title: 'Integrationen',
  items: [
    { name: 'OpenAI', note: 'Modelle & Tools', logo: '/logos/openai.svg' },
    { name: 'Anthropic', note: 'Claude‑Modelle', logo: '/logos/anthropic.svg' },
    { name: 'SIGMACODE AI', note: 'Orchestrierung', logo: '/logos/acme.svg' },
    { name: 'Kong', note: 'API Gateway & Routing', logo: '/logos/acme.svg' },
    { name: 'Supabase', note: 'Auth & DB', logo: '/logos/supabase.svg' },
    {
      name: 'Cloudflare',
      note: 'Edge & Caching',
      logo: '/logos/cloudflare.svg',
    },
    { name: 'Dify', note: 'Chat & Apps', logo: '/logos/dify.svg' },
  ],
};

export const problem = {
  title: 'Warum klassische AI riskant ist',
  points: [
    {
      title: 'Prompt‑Injection',
      desc: 'Unkontrollierte Eingaben manipulieren das Modell und führen zu Datenabfluss.',
    },
    {
      title: 'PII‑Leaks',
      desc: 'Personenbezogene Daten werden versehentlich verarbeitet oder ausgegeben.',
    },
    {
      title: 'Halluzinationen',
      desc: 'Nicht verifizierte Antworten ohne Quelle und Nachvollziehbarkeit.',
    },
    {
      title: 'Fehlende Audits',
      desc: 'Keine revisionssicheren Logs, keine Policies, kein RBAC.',
    },
  ],
};

export const pillars = {
  id: 'how',
  title: 'Wie es funktioniert',
  steps: [
    {
      step: '01',
      title: 'Vorfilter',
      desc: 'Firewall prüft Eingaben (PII, Prompt‑Injection, Richtlinien).',
    },
    {
      step: '02',
      title: 'Orchestrierung',
      desc: 'SIGMACODE AI führt den Workflow aus (Single/Multi‑Agent, Tools).',
    },
    {
      step: '03',
      title: 'Nachfilter',
      desc: 'Firewall prüft Ausgaben (Compliance, Halluzination‑Checks, Redaction).',
    },
  ],
  values: [
    {
      title: 'Sicherheit',
      desc: 'PII‑Filter, Prompt‑Guards, Policy‑Checks vor & nach jedem Agent‑Call.',
    },
    {
      title: 'Orchestrierung',
      desc: 'Multi‑Agent‑Patterns (Planner/Researcher/Executor) mit SIGMACODE AI.',
    },
    {
      title: 'Compliance',
      desc: 'Audit‑Logs, RBAC, API‑Keys, Rate‑Limits und konfigurierbare Policies.',
    },
  ],
  flowNote: 'Alle Schritte werden revisionssicher geloggt.',
};

export const faq = {
  title: 'Häufige Fragen',
  items: [
    {
      q: 'Was sind Firewall‑Powered Agents?',
      a: 'AI‑Agenten, deren Ein‑ und Ausgaben durch eine Superagent‑Firewall vor‑ und nachgeprüft werden: Policy‑Checks, PII‑Filter, Rate‑Limits und Audit‑Logs.',
    },
    {
      q: 'Unterstützt ihr Multi‑Agent‑Workflows (MAS)?',
      a: 'Ja, Orchestrierung mit SIGMACODE AI ermöglicht Rollen (Planner/Researcher/Executor) und Tool‑Aufrufe. Die Firewall bleibt als Wächter aktiv.',
    },
    {
      q: 'Wie integriere ich das in meine App?',
      a: 'Per einfacher HTTP‑API. Wir stellen einen /api/agents/[agentId]/invoke‑Proxy bereit, inklusive Feature‑Flags (enforce/shadow). Netzwerk‑seitig schützt das Kong API Gateway (TLS, Routing, Rate‑Limits).',
    },
    {
      q: 'Welche LLMs werden unterstützt?',
      a: 'OpenAI, Anthropic u. a. über standardisierte Provider‑Adapter. Eigene Modelle via API/Proxy einbindbar.',
    },
    {
      q: 'Wie funktioniert der Shadow‑/Enforce‑Modus?',
      a: 'Shadow prüft und protokolliert ohne zu blockieren; Enforce setzt Policies durch und blockiert Verstöße.',
    },
  ],
};

export const finalCta = {
  id: 'try',
  title: 'Starte mit Firewall‑gesicherten Agenten',
  sub: 'Aktiviere die Firewall im Shadow‑ oder Enforce‑Modus – ohne Code‑Änderungen an deinen Prompts.',
  primary: { href: '#how', label: 'Mehr erfahren' },
  secondary: { href: '/contact', label: 'Kontakt' },
};

export const chatbot = {
  id: 'chatbot',
  title: 'AI Agent Chatbot',
  sub: 'Rollenbasierter Chat mit Tools & RAG – sicher durch Vor-/Nachfilter.',
  points: [
    {
      title: 'RAG + Tools',
      desc: 'Dokumente, Wissensbasen und APIs sicher einbinden.',
    },
    {
      title: 'Memory',
      desc: 'Kontextbehaftete Sessions mit Ablauf- und Löschregeln.',
    },
    {
      title: 'Guardrails',
      desc: 'PII/Toxicity‑Filter, Policy‑Checks, Rate‑Limits.',
    },
  ],
};

export const workflow = {
  id: 'workflow',
  title: 'AI Agent Workflow Pipeline',
  sub: 'Wiederholbare Pipelines mit Versionierung, Scheduling & Webhooks.',
  steps: [
    {
      title: 'Bausteine',
      desc: 'Prompts, Tools, Policies, Branching als Kacheln.',
    },
    { title: 'Scheduling', desc: 'Cron/Trigger, Dead‑Letter‑Queues, Retries.' },
    { title: 'Observability', desc: 'Metriken, Traces, Audit‑Logs pro Run.' },
  ],
};

export const mas = {
  id: 'mas',
  title: 'AI MAS – Multi Agenten Systeme',
  sub: 'Planner/Researcher/Executor koordiniert – mit überprüften Übergaben.',
  roles: [
    {
      title: 'Planner',
      desc: 'Zerlegt Aufgaben, plant Schritte & Policies pro Schritt.',
    },
    {
      title: 'Researcher',
      desc: 'Sammelt Wissen, validiert Quellen, markiert Risiken.',
    },
    {
      title: 'Executor',
      desc: 'Führt Aktionen aus – nur wenn Policies freigeben.',
    },
  ],
};

export const business = {
  id: 'business',
  title: 'Business AI – Ready for Production',
  sub: 'RBAC, Audit‑Logs, DLP/Secrets, Kostenkontrolle, SLAs. Enterprise‑Features ohne Komplexität.',
  features: [
    {
      title: 'RBAC & Keys',
      desc: 'Rollen, API‑Keys, Quoten, Mandantenfähigkeit.',
    },
    {
      title: 'Audit & DLP',
      desc: 'Unveränderliche Logs, PII‑Redaction, Data Egress Policies.',
    },
    {
      title: 'FinOps',
      desc: 'Token‑Budget, Kostenalarme, Nutzung pro Team/Agent, Kostenvorschau pro Run.',
    },
  ],
};

export const trust = {
  id: 'trust',
  title: 'Vertrauen & Wirkung',
  kpis: [
    { label: 'Overhead', value: '<100ms', desc: 'zusätzliche Latenz' },
    { label: 'Uptime', value: '99.99%', desc: 'Ziel, multi‑region' },
    { label: 'Policy Hits', value: 'Live', desc: 'Allow/Block‑Rate' },
  ],
  quotes: [
    {
      name: 'Head of Security',
      text: 'Endlich Guardrails, die ohne Friktion funktionieren.',
    },
  ],
};

export const pricing = {
  id: 'pricing',
  title: 'Pläne & Preise',
  billing: {
    monthlyLabel: 'Monatlich',
    yearlyLabel: 'Jährlich (−20%)',
    yearlyDiscount: 0.2,
  },
  plans: [
    {
      id: 'free',
      name: 'Free',
      badge: 'Kostenlos',
      description: 'Playground & erste Experimente',
      monthly: 0,
      yearly: 0,
      unit: '/Monat',
      bullets: ['Playground', '1 Agent', 'Shadow Firewall', 'Community Support'],
      cta: { label: 'Jetzt starten', href: '/register' },
    },
    {
      id: 'starter',
      name: 'Starter',
      badge: 'Neu',
      description: 'Ideal für PoCs und kleine Teams',
      monthly: 29,
      yearly: 29 * 12 * (1 - 0.2),
      unit: '/Monat',
      bullets: [
        'Bis 3 Agents',
        'Workflow Builder (Basic)',
        'PII‑Redaction (Shadow)',
        'Audit‑Logs (30 Tage)',
      ],
      cta: { label: 'Starter wählen', href: '/pricing' },
    },
    {
      id: 'pro',
      name: 'Professional',
      badge: 'Beliebt',
      description: 'Für wachsende Teams und produktive Nutzung',
      monthly: 99,
      yearly: 99 * 12 * (1 - 0.2),
      unit: '/Monat',
      bullets: [
        'Workflows (Versionen, Scheduler)',
        'Firewall Enforce‑Mode',
        'RBAC & API‑Keys',
        'Audit‑Logs (90 Tage)',
        'Priorisierter Support',
      ],
      cta: { label: 'Pro testen', href: '/pricing' },
      mostPopular: true,
    },
    {
      id: 'business',
      name: 'Business',
      badge: 'Team',
      description: 'Für Unternehmen mit hohen Compliance‑Anforderungen',
      monthly: 299,
      yearly: 299 * 12 * (1 - 0.2),
      unit: '/Monat',
      bullets: ['MAS (Multi‑Agent Systeme)', 'SSO/SAML', 'Private VPC', 'SLAs & Support'],
      cta: { label: 'Business anfragen', href: '/contact' },
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      badge: 'Custom',
      description: 'Maßgeschneidert für regulierte Branchen',
      monthly: null,
      yearly: null,
      unit: '',
      bullets: [
        'Unlimited Requests',
        'On‑Premise / Private Cloud',
        'SOC2, GDPR, HIPAA',
        'Dedizierter TAM & 24/7 Support',
      ],
      cta: { label: 'Kontakt aufnehmen', href: '/contact' },
    },
  ],
  featureMatrix: {
    headers: ['Feature', 'Free', 'Starter', 'Pro', 'Business', 'Enterprise'],
    rows: [
      { label: 'Firewall Shadow', values: [true, true, true, true, true] },
      { label: 'Firewall Enforce', values: [false, false, true, true, true] },
      { label: 'Workflow Builder', values: [false, true, true, true, true] },
      { label: 'Workflow Scheduler', values: [false, false, true, true, true] },
      { label: 'Multi‑Agent (MAS)', values: [false, false, false, true, true] },
      { label: 'RBAC & API‑Keys', values: [false, false, true, true, true] },
      { label: 'SSO/SAML', values: [false, false, false, true, true] },
      {
        label: 'Audit‑Logs Aufbewahrung',
        values: ['7 Tage', '30 Tage', '90 Tage', '180 Tage', 'Custom'],
      },
      { label: 'Support', values: ['Community', 'Standard', 'Priorisiert', 'SLA', '24/7'] },
    ],
  },
  addOns: {
    title: 'Add‑ons & Usage',
    headers: ['Add‑on', 'Preis'],
    items: [
      { label: 'Zusätzliche Workflow‑Runs', price: 'ab 0,009 € pro Run' },
      { label: 'Chat‑Tokens (LLM Nutzung)', price: 'gemäß Provider‑Preisliste' },
      { label: 'Zusätzlicher Speicher', price: '0,20 € pro GB pro Monat' },
      { label: 'Extra Seats (über Planlimit)', price: 'ab 9 € pro Sitz pro Monat' },
      { label: 'Premium Support Upgrade', price: 'ab 99 € pro Monat' },
    ],
    note: 'Staffelpreise verfügbar; Preise können je Region/Provider variieren. Alle Preise zzgl. USt.',
  },
};

// Neue Use‑Cases mit Links zu Detailseiten
export const useCases = {
  id: 'use-cases',
  title: 'Use Cases',
  items: [
    {
      title: 'Firewall‑Powered Agents',
      desc: 'Sichere Agenten mit Vor‑/Nachfilter und Audit‑Transparenz.',
      href: '/agents',
    },
    {
      title: 'Agent Firewall',
      desc: 'Guardrails, PII‑Filter, Policies – erklärbar und auditierbar.',
      href: '/firewall',
    },
    {
      title: 'Workflows',
      desc: 'Versionierte Pipelines, Traces & Kostenkontrolle.',
      href: '/workflows',
    },
    {
      title: 'MAS – Multi Agent Systeme',
      desc: 'Planner/Researcher/Executor orchestriert – robust und schnell.',
      href: '/mas',
    },
  ],
};

export const testimonials = {
  id: 'testimonials',
  title: 'Stimmen unserer Pilotkunden',
  items: [
    {
      name: 'Leiter IT‑Security',
      company: 'FinTech',
      quote:
        'Die Firewall hat uns erlaubt, AI‑Workflows produktiv zu bringen – ohne schlaflose Nächte.',
    },
    {
      name: 'Head of Ops',
      company: 'E‑Commerce',
      quote:
        'Policy‑Transparenz und Audit‑Logs sind Gold wert. Wir sehen endlich, was wirklich passiert.',
    },
    {
      name: 'VP Engineering',
      company: 'SaaS',
      quote: 'Von PoC zu Produktion in Wochen statt Monaten. Shadow → Enforce war ein No‑Brainer.',
    },
  ],
};

export const featureComparison = {
  id: 'features',
  title: 'Feature‑Vergleich',
  // Für Legacy-Nutzung belassen – Hauptquelle ist pricing.featureMatrix
  headers: ['Feature', 'Free', 'Starter', 'Pro', 'Business', 'Enterprise'],
  rows: [
    ['Playground', '✔︎', '✔︎', '✔︎', '✔︎', '✔︎'],
    ['Firewall Shadow', '✔︎', '✔︎', '✔︎', '✔︎', '✔︎'],
    ['Firewall Enforce', '—', '—', '✔︎', '✔︎', '✔︎'],
    ['Workflows', '—', '✔︎', '✔︎', '✔︎', '✔︎'],
    ['MAS (Multi‑Agent)', '—', '—', '—', '✔︎', '✔︎'],
    ['RBAC & API Keys', '—', '—', '✔︎', '✔︎', '✔︎'],
    ['SSO/SAML', '—', '—', '—', '✔︎', '✔︎'],
    ['SLAs & VPC', '—', '—', '—', '✔︎', '✔︎'],
  ],
};
