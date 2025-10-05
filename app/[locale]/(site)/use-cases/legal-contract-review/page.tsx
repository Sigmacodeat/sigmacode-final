import type { Metadata } from 'next';
import { UseCaseLayout } from '@/components/use-cases/UseCaseLayout';

export const metadata: Metadata = {
  title: 'Use Case: Legal Contract Review (Evidence & Redaction)',
  description:
    'Legal Contract Review mit AI: Automatische Analyse, Risk Assessment, Evidence-Generierung – mit Firewall-Sicherheit und vollständigen Audit-Trails.',
  alternates: { canonical: '/use-cases/legal-contract-review' },
  openGraph: {
    title: 'Legal Contract Review – SIGMACODE AI',
    description:
      'Präzise und evidence-basierte Vertragsanalyse mit KI-gestützter Risikobewertung und automatisierter Evidence-Generierung.',
    url: '/use-cases/legal-contract-review',
  },
};

export default function LegalContractReviewUseCase() {
  const kpis = ['+65% Review Speed', '−35% Legal Risks', '100% Evidence Trail'];

  const architectureSteps = [
    'Contract Upload → Automatische Erfassung und Strukturierung',
    'Vorfilter (Classification) → KI-gestützte Klausel-Identifizierung',
    'SIGMACODE AI (Analysis) → Intelligente Vertragsanalyse und Risikobewertung',
    'Nachfilter (Risk Check) → Policy-basierte Risiko-Durchsetzung',
    'Legal System Integration → Nahtlose Einbindung in Legal-Tech-Stacks',
    'Evidence Generation → Automatische Erstellung von Review-Berichten',
  ];

  const securityFeatures = [
    'PII-Redaction in allen Vertragsdokumenten',
    'Strenge Policy-Controls für Legal-Compliance',
    'Vollständige Audit-Logs für alle Review-Aktivitäten',
    'Role-Based Access Control für Legal-Teams',
    'Verschlüsselte Dokumentenverarbeitung (End-to-End)',
    'Shadow-Mode für sicheres Testing neuer Review-Regeln',
  ];

  const integrations = [
    {
      title: 'Workflow-Automation',
      href: '/workflows',
      description: 'Automatisierte Review-Prozesse und Versionierung',
    },
    {
      title: 'AI Firewall',
      href: '/firewall',
      description: 'Sicherheit für sensible Vertragsdaten',
    },
    {
      title: 'Firewall-Powered Agents',
      href: '/agents',
      description: 'Intelligente Analyse mit integrierter Sicherheit',
    },
  ];

  const faq = [
    {
      question: 'Wie werden rechtliche Risiken bewertet?',
      answer:
        'Durch ML-Modelle und Policy-basierte Risk-Frameworks. Automatische CVSS-ähnliche Bewertung für Vertragsrisiken.',
    },
    {
      question: 'Unterstützt ihr verschiedene Vertragsarten?',
      answer:
        'Ja, von NDAs bis zu komplexen Service Agreements – mit spezifischen Modellen für jede Vertragsart.',
    },
    {
      question: 'Wie funktioniert die Evidence-Generierung?',
      answer:
        'KI-gestützte Analyse mit verifizierten Quellen kombiniert mit regelbasierten Evidence-Engines für rechtssichere Dokumentation.',
    },
    {
      question: 'Sind die Vertragsdaten sicher?',
      answer:
        'Ja, alle Dokumente werden verschlüsselt verarbeitet, sensible Informationen redigiert und Zugriffe vollständig nachverfolgt.',
    },
    {
      question: 'Wie werden historische Vertragsreview-Daten behandelt?',
      answer:
        'Immutable Review-Logs mit Zeitstempel und vollständiger Historie. Vollständige Nachverfolgung für Audit-Zwecke und Trend-Analysen.',
    },
  ];

  return (
    <UseCaseLayout
      title="Legal Contract Review"
      subtitle="Präzise & evidence-basiert"
      description="Analysiere Verträge automatisch, bewerte Risiken und generiere Evidence – mit Firewall-gesicherten Legal-Daten."
      slug="legal-contract-review"
      kpis={kpis}
      architectureSteps={architectureSteps}
      securityFeatures={securityFeatures}
      integrations={integrations}
      faq={faq}
    >
      <div className="space-y-6">
        <h2>Warum Legal Contract Review mit AI?</h2>
        <p>
          Traditionelle Vertragsprüfung ist langsam und ressourcenintensiv. Unser AI-gestützter
          Ansatz automatisiert die gesamte Analyse von der Klausel-Identifizierung bis zur
          Evidence-Generierung – mit integrierter Sicherheit und vollständiger Auditierbarkeit.
        </p>

        <h3>Key Benefits</h3>
        <ul>
          <li>
            <strong>Geschwindigkeit:</strong> 65% schnellere Review-Prozesse durch Automatisierung
          </li>
          <li>
            <strong>Risikominimierung:</strong> 35% weniger rechtliche Risiken durch systematische
            Analyse
          </li>
          <li>
            <strong>Evidence-basierend:</strong> 100% verifizierbare Evidence-Trails für alle
            Bewertungen
          </li>
          <li>
            <strong>Konsistenz:</strong> Einheitliche Review-Standards über alle Verträge hinweg
          </li>
        </ul>

        <h3>Technische Details</h3>
        <p>
          Die Lösung unterstützt alle gängigen Vertragsformate (PDF, DOC, DOCX) und integriert sich
          in bestehende Legal-Tech-Stacks. Der Shadow-Mode ermöglicht risikofreies Testing neuer
          Review-Regeln vor der produktiven Nutzung.
        </p>

        <h3>Anwendungsfälle</h3>
        <ul>
          <li>Vertragsanalyse mit automatisierten Klausel-Identifizierungen</li>
          <li>Risikobewertung mit ML-gestützten Scoring-Modellen</li>
          <li>Evidence-Generierung mit verifizierten Quellen</li>
          <li>Compliance-Checks für regulatorische Anforderungen</li>
        </ul>
      </div>
    </UseCaseLayout>
  );
}
