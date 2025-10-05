import type { Metadata } from 'next';
import { UseCaseLayout } from '@/components/use-cases/UseCaseLayout';

export const metadata: Metadata = {
  title: 'Use Case: Multilingual Support Agent (Global)',
  description:
    'Multilingual Support mit AI: Automatische Sprach-Erkennung, Übersetzung, kulturelle Anpassung – mit Firewall-Sicherheit.',
  alternates: { canonical: '/use-cases/multilingual-support' },
  openGraph: {
    title: 'Multilingual Support Agent – SIGMACODE AI',
    description:
      'Globaler und kulturell sensibler Support mit KI-gestützter Sprach-Erkennung und automatischer Übersetzung.',
    url: '/use-cases/multilingual-support',
  },
};

export default function MultilingualSupportUseCase() {
  const kpis = ['+50 Languages', '−60% Translation Costs', '100% Cultural Check'];

  const architectureSteps = [
    'User Query → Automatische Sprach-Erkennung und Kontext-Analyse',
    'Vorfilter (Language Detect) → KI-gestützte Sprach-Identifizierung',
    'SIGMACODE AI (Translate) → Intelligente Übersetzung mit Kontext-Beibehaltung',
    'Nachfilter (Cultural Adapt) → Kulturelle Anpassung und Lokalisierung',
    'Response → Strukturierte Antwort in der Zielsprache',
    'Analytics → Performance-Messung und Qualitätsoptimierung',
  ];

  const securityFeatures = [
    'Verschlüsselte Übersetzungsdatenverarbeitung (End-to-End)',
    'PII-Redaction in allen mehrsprachigen Interaktionen',
    'Role-Based Access Control für globale Support-Teams',
    'Vollständige Audit-Trails für alle Übersetzungsaktivitäten',
    'Compliance-Checks für sprachspezifische Anforderungen',
    'Shadow-Mode für sicheres Testing neuer Sprachen',
  ];

  const integrations = [
    {
      title: 'Workflow-Pipelines',
      href: '/workflows',
      description: 'Automatisierte Sprach-Pipelines und Versionierung',
    },
    {
      title: 'AI Firewall',
      href: '/firewall',
      description: 'Sicherheit für Übersetzungsdaten',
    },
    {
      title: 'Agents',
      href: '/agents',
      description: 'Kulturell angepasste Antworten',
    },
  ];

  const faq = [
    {
      question: 'Welche Sprachen werden unterstützt?',
      answer:
        'Über 50 Sprachen inkl. Dialekte und regionale Varianten – von Europäisch bis Asiatisch und darüber hinaus.',
    },
    {
      question: 'Wie wird kulturelle Anpassung sichergestellt?',
      answer:
        'Durch ML-Modelle und konfigurierbare kulturelle Filter. Automatische Anpassung an lokale Gepflogenheiten und Kommunikationsstile.',
    },
    {
      question: 'Wie funktioniert die Sprach-Erkennung?',
      answer:
        'KI-gestützte Analyse kombiniert mit regelbasierten Erkennungs-Engines für präzise Sprach-Identifizierung.',
    },
    {
      question: 'Sind die Übersetzungen sicher?',
      answer:
        'Ja, alle Übersetzungen werden verschlüsselt verarbeitet, sensible Informationen redigiert und Zugriffe vollständig nachverfolgt.',
    },
  ];

  return (
    <UseCaseLayout
      title="Multilingual Support Agent"
      subtitle="Global & kulturell sensibel"
      description="Biete Support in über 50 Sprachen mit automatischer Erkennung, Übersetzung und kultureller Anpassung."
      slug="multilingual-support"
      kpis={kpis}
      architectureSteps={architectureSteps}
      securityFeatures={securityFeatures}
      integrations={integrations}
      faq={faq}
    >
      <div className="space-y-6">
        <h2>Warum Multilingual Support mit AI?</h2>
        <p>
          Traditioneller multilingualer Support erfordert teure Übersetzer und ist langsam. Unser
          AI-gestützter Ansatz liefert sofortige, präzise Übersetzungen mit kultureller Sensibilität
          – mit integrierter Sicherheit und kontinuierlichem Lernen für globale Märkte.
        </p>

        <h3>Key Benefits</h3>
        <ul>
          <li>
            <strong>Sprachvielfalt:</strong> Unterstützung für über 50 Sprachen und regionale
            Varianten
          </li>
          <li>
            <strong>Kosteneffizienz:</strong> 60% niedrigere Übersetzungskosten durch
            KI-Automatisierung
          </li>
          <li>
            <strong>Kulturelle Intelligenz:</strong> 100% kulturell angepasste Kommunikation
          </li>
          <li>
            <strong>Skalierbarkeit:</strong> Konsistente Qualität auch bei hohem internationalen
            Volumen
          </li>
        </ul>

        <h3>Technische Details</h3>
        <p>
          Die Lösung nutzt Advanced Neural Machine Translation für präzise Übersetzungen, Cultural
          Intelligence für lokale Anpassungen und integrierte Qualitätssicherung. Integration mit
          allen gängigen Support-Plattformen und CRM-Systemen.
        </p>

        <h3>Anwendungsfälle</h3>
        <ul>
          <li>Globaler Customer Support mit lokaler Sprachunterstützung</li>
          <li>Internationale Sales-Unterstützung mit kultureller Anpassung</li>
          <li>Multi-Language Content Creation für globale Märkte</li>
          <li>Cross-Cultural Communication für internationale Teams</li>
        </ul>
      </div>
    </UseCaseLayout>
  );
}
