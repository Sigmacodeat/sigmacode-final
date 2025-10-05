/**
 * Use Case Theme System
 * Zentrale Definition von Farben und Styling für alle Use Cases
 */

export type UseCaseTheme =
  | 'healthcare'
  | 'finance'
  | 'government'
  | 'infrastructure'
  | 'pharma'
  | 'security'
  | 'compliance'
  | 'workflow';

export interface UseCaseThemeConfig {
  id: UseCaseTheme;
  name: string;
  primaryColor: string;
  lightColor: string;
  glowColor: string;
  gradient: string;
  icon: string;
  cardClassName: string;
  badgeClassName: string;
  buttonClassName: string;
}

export const USE_CASE_THEMES: Record<UseCaseTheme, UseCaseThemeConfig> = {
  healthcare: {
    id: 'healthcare',
    name: 'Healthcare & Medical',
    primaryColor: 'var(--uc-healthcare-primary)',
    lightColor: 'var(--uc-healthcare-light)',
    glowColor: 'var(--uc-healthcare-glow)',
    gradient: 'from-uc-healthcare via-uc-healthcare-light to-teal-400',
    icon: '🏥',
    cardClassName:
      'border-uc-healthcare/20 bg-uc-healthcare/5 hover:shadow-[0_0_24px_var(--uc-healthcare-glow)]',
    badgeClassName: 'bg-uc-healthcare/10 text-uc-healthcare border-uc-healthcare/30',
    buttonClassName: 'bg-uc-healthcare hover:bg-uc-healthcare-light text-white',
  },
  finance: {
    id: 'finance',
    name: 'Finance & Trading',
    primaryColor: 'var(--uc-finance-primary)',
    lightColor: 'var(--uc-finance-light)',
    glowColor: 'var(--uc-finance-glow)',
    gradient: 'from-uc-finance via-uc-finance-light to-amber-400',
    icon: '💰',
    cardClassName:
      'border-uc-finance/20 bg-uc-finance/5 hover:shadow-[0_0_24px_var(--uc-finance-glow)]',
    badgeClassName: 'bg-uc-finance/10 text-uc-finance border-uc-finance/30',
    buttonClassName: 'bg-uc-finance hover:bg-uc-finance-light text-white',
  },
  government: {
    id: 'government',
    name: 'Government & Public',
    primaryColor: 'var(--uc-government-primary)',
    lightColor: 'var(--uc-government-light)',
    glowColor: 'var(--uc-government-glow)',
    gradient: 'from-uc-government via-uc-government-light to-blue-400',
    icon: '🏛️',
    cardClassName:
      'border-uc-government/20 bg-uc-government/5 hover:shadow-[0_0_24px_var(--uc-government-glow)]',
    badgeClassName: 'bg-uc-government/10 text-uc-government border-uc-government/30',
    buttonClassName: 'bg-uc-government hover:bg-uc-government-light text-white',
  },
  infrastructure: {
    id: 'infrastructure',
    name: 'Critical Infrastructure',
    primaryColor: 'var(--uc-infrastructure-primary)',
    lightColor: 'var(--uc-infrastructure-light)',
    glowColor: 'var(--uc-infrastructure-glow)',
    gradient: 'from-uc-infrastructure via-uc-infrastructure-light to-orange-400',
    icon: '⚡',
    cardClassName:
      'border-uc-infrastructure/20 bg-uc-infrastructure/5 hover:shadow-[0_0_24px_var(--uc-infrastructure-glow)]',
    badgeClassName: 'bg-uc-infrastructure/10 text-uc-infrastructure border-uc-infrastructure/30',
    buttonClassName: 'bg-uc-infrastructure hover:bg-uc-infrastructure-light text-white',
  },
  pharma: {
    id: 'pharma',
    name: 'Pharmaceutical R&D',
    primaryColor: 'var(--uc-pharma-primary)',
    lightColor: 'var(--uc-pharma-light)',
    glowColor: 'var(--uc-pharma-glow)',
    gradient: 'from-uc-pharma via-uc-pharma-light to-purple-400',
    icon: '🧬',
    cardClassName:
      'border-uc-pharma/20 bg-uc-pharma/5 hover:shadow-[0_0_24px_var(--uc-pharma-glow)]',
    badgeClassName: 'bg-uc-pharma/10 text-uc-pharma border-uc-pharma/30',
    buttonClassName: 'bg-uc-pharma hover:bg-uc-pharma-light text-white',
  },
  security: {
    id: 'security',
    name: 'Security & PII Redaction',
    primaryColor: 'var(--uc-security-primary)',
    lightColor: 'var(--uc-security-light)',
    glowColor: 'var(--uc-security-glow)',
    gradient: 'from-uc-security via-uc-security-light to-red-400',
    icon: '🔒',
    cardClassName:
      'border-uc-security/20 bg-uc-security/5 hover:shadow-[0_0_24px_var(--uc-security-glow)]',
    badgeClassName: 'bg-uc-security/10 text-uc-security border-uc-security/30',
    buttonClassName: 'bg-uc-security hover:bg-uc-security-light text-white',
  },
  compliance: {
    id: 'compliance',
    name: 'Compliance & SOC2',
    primaryColor: 'var(--uc-compliance-primary)',
    lightColor: 'var(--uc-compliance-light)',
    glowColor: 'var(--uc-compliance-glow)',
    gradient: 'from-uc-compliance via-uc-compliance-light to-green-400',
    icon: '📋',
    cardClassName:
      'border-uc-compliance/20 bg-uc-compliance/5 hover:shadow-[0_0_24px_var(--uc-compliance-glow)]',
    badgeClassName: 'bg-uc-compliance/10 text-uc-compliance border-uc-compliance/30',
    buttonClassName: 'bg-uc-compliance hover:bg-uc-compliance-light text-white',
  },
  workflow: {
    id: 'workflow',
    name: 'Workflow Automation & MAS',
    primaryColor: 'var(--uc-workflow-primary)',
    lightColor: 'var(--uc-workflow-light)',
    glowColor: 'var(--uc-workflow-glow)',
    gradient: 'from-uc-workflow via-uc-workflow-light to-indigo-400',
    icon: '🎯',
    cardClassName:
      'border-uc-workflow/20 bg-uc-workflow/5 hover:shadow-[0_0_24px_var(--uc-workflow-glow)]',
    badgeClassName: 'bg-uc-workflow/10 text-uc-workflow border-uc-workflow/30',
    buttonClassName: 'bg-uc-workflow hover:bg-uc-workflow-light text-white',
  },
};

export function getUseCaseTheme(themeId: UseCaseTheme): UseCaseThemeConfig {
  return USE_CASE_THEMES[themeId];
}

export function getUseCaseBySlug(slug: string): UseCaseTheme | null {
  const mapping: Record<string, UseCaseTheme> = {
    'healthcare-medical': 'healthcare',
    'financial-trading': 'finance',
    'government-public': 'government',
    'critical-infrastructure': 'infrastructure',
    'pharmaceutical-rnd': 'pharma',
    'pii-redaction-firewall': 'security',
    'soc2-evidence-collector': 'compliance',
    'workflow-automation': 'workflow',
  };
  return mapping[slug] || null;
}
