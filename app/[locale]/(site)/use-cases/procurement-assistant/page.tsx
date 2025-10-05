import type { Metadata } from 'next';
import { UseCaseLayout } from '@/components/use-cases/UseCaseLayout';

export const metadata: Metadata = {
  title: 'Use Case: Procurement Assistent (Supplier Management)',
  description:
    'Procurement mit AI: Supplier Evaluation, Contract Management, Cost Optimization – mit Firewall-Sicherheit und vollständigen Audit-Trails.',
  alternates: { canonical: '/use-cases/procurement-assistant' },
  openGraph: {
    title: 'Procurement Assistent – SIGMACODE AI',
    description:
      'Strategisches Procurement Management mit KI-gestützter Supplier-Bewertung und automatisierter Kostenoptimierung.',
    url: '/use-cases/procurement-assistant',
  },
};

export default function ProcurementAssistantUseCase() {
  const kpis = ['+40% Cost Savings', '−30% Procurement Time', '100% Compliance'];

  const architectureSteps = [
    'Requirements Analysis → Automatische Anforderungs-Klassifizierung mit ML',
    'Market Intelligence → KI-gestützte Marktpreis-Analyse und Benchmarking',
    'Supplier Matching → Intelligente Lieferanten-Vorauswahl basierend auf Kriterien',
    'Risk Assessment → Automatische Risiko-Bewertung und Compliance-Checks',
    'Contract Analytics → KI-gestützte Vertragsanalyse und Optimierung',
    'Performance Tracking → Kontinuierliche Supplier-Performance-Messung',
  ];

  const securityFeatures = [
    'Verschlüsselte Supplier-Datenübertragung (TLS 1.3)',
    'PII-Redaction in allen Procurement-Dokumenten',
    'Role-Based Access Control für sensible Vertragsdaten',
    'Audit-Trails für alle Beschaffungsentscheidungen',
    'Compliance-Checks für regulatorische Anforderungen',
    'Shadow-Mode für risikofreies Testing neuer Strategien',
  ];

  const integrations = [
    {
      title: 'Workflow Automation',
      href: '/workflows',
      description: 'End-to-End Procurement-Workflows mit Versionierung',
    },
    {
      title: 'AI Firewall',
      href: '/firewall',
      description: 'Sicherheit für alle Datenströme',
    },
    {
      title: 'Contract Management',
      href: '/agents',
      description: 'Intelligente Vertragsanalyse und -optimierung',
    },
  ];

  const faq = [
    {
      question: 'Wie werden Supplier-Kriterien bewertet?',
      answer:
        'Durch konfigurierbare Scoring-Modelle mit ML-Optimierung und automatische Gewichtung basierend auf historischen Daten.',
    },
    {
      question: 'Unterstützt ihr verschiedene Procurement-Kategorien?',
      answer:
        'Ja, von IT-Services über Rohstoffe bis zu komplexen Dienstleistungen – mit spezifischen Modellen pro Kategorie.',
    },
    {
      question: 'Wie funktioniert die Kostenoptimierung?',
      answer:
        'Durch Marktpreis-Analyse, Supplier-Benchmarking und KI-gestützte Verhandlungsvorbereitung.',
    },
    {
      question: 'Sind die Daten sicher?',
      answer:
        'Ja, alle Daten werden verschlüsselt, sensible Informationen redigiert und nur autorisierte Personen haben Zugriff.',
    },
    {
      question: 'Wie werden historische Supplier-Performance-Daten behandelt?',
      answer:
        'Immutable Performance-Logs mit Zeitstempel und KPI-Tracking. Vollständige Historie für Trend-Analysen und Entscheidungsfindung.',
    },
  ];

  return (
    <UseCaseLayout
      title="Procurement Assistent"
      subtitle="Strategisch & datengetrieben"
      description="Optimiere Supplier-Auswahl, verwalte Contracts und analysiere Kosten – mit Firewall-gesicherten Procurement-Daten und vollständigen Audit-Trails."
      slug="procurement-assistant"
      kpis={kpis}
      architectureSteps={architectureSteps}
      securityFeatures={securityFeatures}
      integrations={integrations}
      faq={faq}
    >
      <div className="space-y-6">
        <h2>Warum Procurement mit AI?</h2>
        <p>
          Traditionelles Procurement ist zeitaufwändig und fehleranfällig. Unser AI-gestützter
          Ansatz automatisiert den gesamten Prozess von der Anforderungsanalyse bis zur
          Vertragsverwaltung – mit integrierter Sicherheit und Compliance.
        </p>

        <h3>Key Benefits</h3>
        <ul>
          <li>
            <strong>Kostenoptimierung:</strong> Automatische Marktpreis-Analyse und
            Savings-Identifizierung
          </li>
          <li>
            <strong>Supplier Management:</strong> Intelligente Bewertung und kontinuierliche
            Performance-Messung
          </li>
          <li>
            <strong>Risikominimierung:</strong> Automatische Compliance-Checks und
            Risiko-Assessments
          </li>
          <li>
            <strong>Effizienzsteigerung:</strong> Vollständige Workflow-Automatisierung
          </li>
        </ul>

        <h3>Technische Details</h3>
        <p>
          Die Lösung integriert sich nahtlos in bestehende ERP-Systeme und unterstützt alle gängigen
          Procurement-Standards. Der Shadow-Mode ermöglicht risikofreies Testing vor der produktiven
          Nutzung.
        </p>
      </div>
    </UseCaseLayout>
  );
}
