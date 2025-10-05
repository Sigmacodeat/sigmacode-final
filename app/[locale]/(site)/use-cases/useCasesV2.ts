import type { LucideIcon } from 'lucide-react';
import {
  Shield,
  Activity,
  Building2,
  Zap,
  Pill,
  CheckCircle,
  Bot,
  Headphones,
  Workflow as WorkflowIcon,
  Search,
} from 'lucide-react';

export type UseCase = {
  slug: string;
  href: string;
  title: string;
  excerpt: string;
  kpis?: string[];
  badges?: string[];
  category:
    | 'workflow'
    | 'security'
    | 'compliance'
    | 'support'
    | 'ops'
    | 'finance'
    | 'sales'
    | 'hr'
    | 'legal'
    | 'marketing'
    | 'it'
    | 'research'
    | 'gov'
    | 'healthcare'
    | 'infrastructure'
    | 'pharma'
    | 'multi-agent';
  icon?: LucideIcon;
};

// Zentrale, deduplizierte Liste. Kuratierte Reihenfolge für Workflows: Security/Compliance/Infra zuerst
export const USE_CASES: UseCase[] = [
  {
    slug: 'pii-redaction-firewall',
    href: '/use-cases/pii-redaction-firewall',
    title: 'PII-Redaction Firewall',
    excerpt:
      'Automatische PII-Erkennung und -Redaktion in Echtzeit – Vor-/Nachfilter für alle Agenten.',
    kpis: ['99.9% Accuracy'],
    badges: ['Security', 'Privacy'],
    category: 'security',
    icon: Shield,
  },
  {
    slug: 'soc2-evidence-collector',
    href: '/use-cases/soc2-evidence-collector',
    title: 'SOC2 Evidence Collector',
    excerpt: 'Automatische SOC2-Compliance und Evidence-Sammlung mit lückenlosen Audit-Trails.',
    kpis: ['100% SOC2-ready'],
    badges: ['Compliance', 'Audit'],
    category: 'compliance',
    icon: CheckCircle,
  },
  {
    slug: 'critical-infrastructure',
    href: '/use-cases/critical-infrastructure',
    title: 'Critical Infrastructure',
    excerpt:
      'Zero-Downtime KI für Energie & Transport mit OT/IT-Sicherheit – Shadow → Enforce ohne Risiko.',
    kpis: ['Zero-Downtime'],
    badges: ['Infra', 'Safety'],
    category: 'infrastructure',
    icon: Zap,
  },
  {
    slug: 'workflow-automation',
    href: '/use-cases/workflow-automation',
    title: 'Workflow-Automation (Pipelines)',
    excerpt:
      'Versionierte Pipelines mit Scheduling, Webhooks, Traces & Kostenkontrolle – Shadow → Enforce ohne Risiko.',
    kpis: ['−55% manuelle Tasks', 'Rollbacks in Minuten'],
    badges: ['Workflow'],
    category: 'workflow',
    icon: WorkflowIcon,
  },
  {
    slug: 'healthcare-medical',
    href: '/use-cases/healthcare-medical',
    title: 'Healthcare AI',
    excerpt:
      'HIPAA-konforme Diagnose-Unterstützung mit Patientendaten-Schutz. Vor-/Nachfilter verhindern PII-Leaks.',
    kpis: ['100% HIPAA-konform'],
    badges: ['Healthcare', 'PII-Redaction'],
    category: 'healthcare',
    icon: Activity,
  },
  {
    slug: 'financial-trading',
    href: '/use-cases/financial-trading',
    title: 'Financial Trading',
    excerpt:
      'MiFID II-konformes Algorithmic Trading mit Echtzeit-Compliance und <100ms Firewall-Overhead.',
    kpis: ['Sub-100ms Latenz'],
    badges: ['Trading', 'Compliance'],
    category: 'finance',
    icon: Building2,
  },
  {
    slug: 'government-public',
    href: '/use-cases/government-public',
    title: 'Government AI',
    excerpt: 'DSGVO-konforme Verwaltungs-KI mit Bürgerdaten-Schutz, Audit-Logs und RBAC.',
    kpis: ['100% DSGVO-konform'],
    badges: ['Public Sector', 'Audit'],
    category: 'gov',
    icon: Building2,
  },
  {
    slug: 'pharmaceutical-rnd',
    href: '/use-cases/pharmaceutical-rnd',
    title: 'Pharmaceutical R&D',
    excerpt:
      'FDA 21 CFR Part 11-konforme Pharma-Forschung mit IP-Schutz und nachvollziehbaren Ergebnissen.',
    kpis: ['100% FDA-konform'],
    badges: ['Pharma', 'Compliance'],
    category: 'pharma',
    icon: Pill,
  },
  {
    slug: 'multi-agent-systems',
    href: '/mas',
    title: 'Multi-Agent Systems',
    excerpt:
      'Orchestrierte Agenten für komplexe Workflows – mit Auto-Scaling und Policy-Durchsetzung.',
    kpis: ['Auto-Scaling'],
    badges: ['MAS', 'Orchestration'],
    category: 'multi-agent',
    icon: Bot,
  },
  {
    slug: 'customer-support',
    href: '/use-cases/customer-support',
    title: 'Customer Support Copilot',
    excerpt:
      'Antwortqualität steigern, Handle-Time senken – mit Nachfilter, PII-Redaction und Audit-Transparenz.',
    kpis: ['+12% CSAT', '−28% Handle Time', '0 PII-Leaks'],
    badges: ['Support'],
    category: 'support',
    icon: Headphones,
  },
  {
    slug: 'research-compliance',
    href: '/use-cases/research-compliance',
    title: 'Research mit Compliance-Guardrails',
    excerpt:
      'Research-Workflows mit verifizierten Quellen, Policy-Checks und revisionssicheren Logs.',
    kpis: ['−40% Recherchezeit', '+2.1x Output/Analyst'],
    badges: ['Research', 'Compliance'],
    category: 'research',
    icon: Search,
  },
];

export function getUseCases(filter?: Partial<Pick<UseCase, 'category'>>) {
  if (!filter || !filter.category) return USE_CASES;
  return USE_CASES.filter((c) => c.category === filter.category);
}
