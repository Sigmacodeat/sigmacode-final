import type { Metadata } from 'next';
import { UseCaseLayout } from '@/components/use-cases/UseCaseLayout';

export const metadata: Metadata = {
  title: 'Use Case: Data Extraction & RAG Pipeline (Secure)',
  description:
    'Data Extraction mit AI: Automatische Dokumenten-Verarbeitung, RAG-Pipelines – mit Firewall-Sicherheit und vollständigen Audit-Trails.',
  alternates: { canonical: '/use-cases/data-extraction-rag' },
  openGraph: {
    title: 'Data Extraction & RAG Pipeline – SIGMACODE AI',
    description:
      'Sicherer und skalierbarer Data Extraction mit KI-gestützter RAG-Verarbeitung und automatisierter Dokumentenanalyse.',
    url: '/use-cases/data-extraction-rag',
  },
};

export default function DataExtractionRAGUseCase() {
  const kpis = ['+90% Extraction Speed', '−50% Manual Review', '100% Data Security'];

  const architectureSteps = [
    'Document Upload → Automatische Erfassung und Strukturierung',
    'Vorfilter (PII Scan) → Datenvalidierung und PII-Redaction',
    'SIGMACODE AI (Extraction) → KI-gestützte Data Extraction und Processing',
    'Nachfilter (Validation) → Qualitätssicherung und Datenvalidierung',
    'RAG Index → Automatische Indexierung für Retrieval',
    'Query Response → Strukturierte Ausgabe mit Evidence-Trails',
  ];

  const securityFeatures = [
    'PII-Redaction in allen extrahierten Daten',
    'Strenge Policy-Controls für Data-Compliance',
    'Vollständige Audit-Logs für alle Extraction-Aktivitäten',
    'Role-Based Access Control für Data-Teams',
    'Verschlüsselte Dokumentenverarbeitung (End-to-End)',
    'Shadow-Mode für sicheres Testing neuer Extraction-Regeln',
  ];

  const integrations = [
    {
      title: 'Workflow-Automation',
      href: '/workflows',
      description: 'Automatisierte Pipeline-Orchestrierung und Versionierung',
    },
    {
      title: 'AI Firewall',
      href: '/firewall',
      description: 'Sicherheit für Datenverarbeitung und Compliance',
    },
    {
      title: 'Firewall-Powered Agents',
      href: '/agents',
      description: 'Intelligente Queries mit integrierter Sicherheit',
    },
  ];

  const faq = [
    {
      question: 'Welche Dokumenttypen werden unterstützt?',
      answer:
        'PDF, DOC, XLS, Images, E-Mails und strukturierte Daten – mit spezifischen Modellen für jeden Typ.',
    },
    {
      question: 'Wie wird die Datenqualität sichergestellt?',
      answer:
        'Durch Nachfilter-Validation und kontinuierliche Monitoring. Automatische Qualitätsbewertung vor der Indexierung.',
    },
    {
      question: 'Wie funktioniert die RAG-Integration?',
      answer:
        'KI-gestützte Data Extraction kombiniert mit regelbasierten RAG-Pipelines für optimale Retrieval-Performance.',
    },
    {
      question: 'Sind die extrahierten Daten sicher?',
      answer:
        'Ja, alle Daten werden verschlüsselt verarbeitet, sensible Informationen redigiert und Zugriffe vollständig nachverfolgt.',
    },
    {
      question: 'Wie werden historische Extraction-Performance-Daten behandelt?',
      answer:
        'Immutable Performance-Logs mit Zeitstempel und Genauigkeitsmetriken. Vollständige Historie für Trend-Analysen und Optimierung.',
    },
  ];

  return (
    <UseCaseLayout
      title="Data Extraction & RAG Pipeline"
      subtitle="Sicher & skalierbar"
      description="Extrahiere Daten aus Dokumenten und baue RAG-Pipelines – mit Firewall-gesicherter Verarbeitung."
      slug="data-extraction-rag"
      kpis={kpis}
      architectureSteps={architectureSteps}
      securityFeatures={securityFeatures}
      integrations={integrations}
      faq={faq}
    >
      <div className="space-y-6">
        <h2>Warum Data Extraction & RAG mit AI?</h2>
        <p>
          Traditionelle Data Extraction ist langsam und ungenau. Unser AI-gestützter Ansatz
          automatisiert die gesamte Verarbeitung von der Dokumentenanalyse bis zur RAG-Indexierung –
          mit integrierter Sicherheit und Qualitätssicherung.
        </p>

        <h3>Key Benefits</h3>
        <ul>
          <li>
            <strong>Geschwindigkeit:</strong> 90% schnellere Extraction-Prozesse durch
            Automatisierung
          </li>
          <li>
            <strong>Genauigkeit:</strong> 50% weniger manuelle Reviews durch KI-optimierte
            Verarbeitung
          </li>
          <li>
            <strong>Sicherheit:</strong> 100% Datenintegrität durch integrierte Firewall-Mechanismen
          </li>
          <li>
            <strong>Skalierbarkeit:</strong> Konsistente Performance auch bei hohen Datenvolumina
          </li>
        </ul>

        <h3>Technische Details</h3>
        <p>
          Die Lösung unterstützt alle gängigen Dokumentenformate und integriert sich in bestehende
          Data-Pipelines. Der Shadow-Mode ermöglicht risikofreies Testing neuer Extraction-Regeln
          vor der produktiven Nutzung.
        </p>

        <h3>Anwendungsfälle</h3>
        <ul>
          <li>Dokumentenverarbeitung mit automatisierten Extraction-Modellen</li>
          <li>RAG-Pipelines mit KI-gestützter Indexierung</li>
          <li>Strukturierte Data Processing für Analytics</li>
          <li>Multi-Format Content Analysis mit einheitlichen Ergebnissen</li>
        </ul>
      </div>
    </UseCaseLayout>
  );
}
