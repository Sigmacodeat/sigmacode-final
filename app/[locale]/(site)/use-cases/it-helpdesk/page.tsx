import type { Metadata } from 'next';
import { UseCaseLayout } from '@/components/use-cases/UseCaseLayout';

export const metadata: Metadata = {
  title: 'Use Case: IT Helpdesk Troubleshooter (Self-Service)',
  description:
    'IT Helpdesk mit AI: Automatische Ticket-Klassifizierung, Lösungsvorschläge, Self-Service – mit Firewall-Sicherheit und Knowledge Base Integration.',
  alternates: { canonical: '/use-cases/it-helpdesk' },
  openGraph: {
    title: 'IT Helpdesk Troubleshooter – SIGMACODE AI',
    description:
      'Intelligenter und selbstlernender IT Helpdesk mit KI-gestützter Ticket-Klassifizierung und Self-Service-Lösungen.',
    url: '/use-cases/it-helpdesk',
  },
};

export default function ITHelpdeskUseCase() {
  const kpis = ['+60% Self-Service Rate', '−45% Ticket Volume', '24/7 Availability'];

  const architectureSteps = [
    'User Query → Automatische Erfassung und Analyse der Anfrage',
    'Vorfilter (Classification) → KI-gestützte Ticket-Kategorisierung',
    'SIGMACODE AI (Troubleshoot) → Intelligente Problemlösung und Lösungsvorschläge',
    'Nachfilter (Validation) → Qualitätssicherung und Lösungsvalidierung',
    'Knowledge Base Integration → Automatische Aktualisierung der Wissensdatenbank',
    'Resolution → Strukturierte Lösung mit Follow-up-Empfehlungen',
  ];

  const securityFeatures = [
    'PII-Redaction in allen Helpdesk-Interaktionen',
    'Strenge Policy-Controls für IT-Sicherheitsstandards',
    'Vollständige Audit-Logs für alle Support-Aktivitäten',
    'Role-Based Access Control für IT-Teams',
    'Verschlüsselte Datenübertragung (TLS 1.3)',
    'Shadow-Mode für sicheres Testing neuer Support-Workflows',
  ];

  const integrations = [
    {
      title: 'Workflow-Pipelines',
      href: '/workflows',
      description: 'Automatisierte Ticket-Flows und Eskalationsregeln',
    },
    {
      title: 'AI Firewall',
      href: '/firewall',
      description: 'Sicherheit für Daten-Schutz und Compliance',
    },
    {
      title: 'Firewall-Powered Agents',
      href: '/agents',
      description: 'Intelligente Diagnose mit integrierter Sicherheit',
    },
  ];

  const faq = [
    {
      question: 'Wie wird die Knowledge Base aktuell gehalten?',
      answer:
        'Durch automatische Updates und lernende Algorithmen mit Audit-Trails. Jede Lösung wird automatisch in die KB integriert.',
    },
    {
      question: 'Unterstützt ihr verschiedene Ticket-Systeme?',
      answer:
        'Ja, via API-Integrationen mit bestehenden Helpdesk-Tools wie ServiceNow, Jira, Zendesk und anderen.',
    },
    {
      question: 'Wie funktioniert die Ticket-Klassifizierung?',
      answer:
        'KI-gestützte Analyse von Ticket-Inhalten kombiniert mit regelbasierten Klassifizierungs-Engines für präzise Kategorisierung.',
    },
    {
      question: 'Sind die Support-Interaktionen sicher?',
      answer:
        'Ja, alle Interaktionen werden verschlüsselt verarbeitet, sensible Daten redigiert und Zugriffe vollständig nachverfolgt.',
    },
    {
      question: 'Wie werden historische Support-Ticket-Daten behandelt?',
      answer:
        'Immutable Ticket-Logs mit Zeitstempel und Lösungshistorie. Vollständige Nachverfolgung für Trend-Analysen und Optimierung.',
    },
  ];

  return (
    <UseCaseLayout
      title="IT Helpdesk Troubleshooter"
      subtitle="Intelligent & selbstlernend"
      description="Automatisiere Ticket-Klassifizierung, biete Lösungsvorschläge und Self-Service – mit Firewall-gesicherter Knowledge Base."
      slug="it-helpdesk"
      kpis={kpis}
      architectureSteps={architectureSteps}
      securityFeatures={securityFeatures}
      integrations={integrations}
      faq={faq}
    >
      <div className="space-y-6">
        <h2>Warum IT Helpdesk mit AI?</h2>
        <p>
          Traditionelle IT-Helpdesks sind überlastet und langsam. Unser AI-gestützter Ansatz
          automatisiert Ticket-Klassifizierung, liefert sofortige Lösungsvorschläge und fördert
          Self-Service – mit integrierter Sicherheit und kontinuierlichem Lernen.
        </p>

        <h3>Key Benefits</h3>
        <ul>
          <li>
            <strong>Self-Service:</strong> 60% höhere Self-Service-Rate durch intelligente
            Lösungsvorschläge
          </li>
          <li>
            <strong>Effizienz:</strong> 45% weniger Ticket-Volumen durch proaktive Problemlösung
          </li>
          <li>
            <strong>Verfügbarkeit:</strong> 24/7 Support ohne Personalaufwand
          </li>
          <li>
            <strong>Lernen:</strong> Selbstverbessernde Knowledge Base durch kontinuierliche Updates
          </li>
        </ul>

        <h3>Technische Details</h3>
        <p>
          Die Lösung integriert sich in bestehende IT-Service-Management-Systeme und unterstützt
          Multi-Channel-Support (E-Mail, Chat, Portal). Der Shadow-Mode ermöglicht risikofreies
          Testing neuer Support-Workflows vor der produktiven Nutzung.
        </p>

        <h3>Anwendungsfälle</h3>
        <ul>
          <li>Ticket-Klassifizierung mit automatisierten Kategorisierungsmodellen</li>
          <li>Selbstlernende Knowledge Base mit automatischen Updates</li>
          <li>Multi-Channel-Support mit konsistenten Lösungsvorschlägen</li>
          <li>Proaktive Problemlösung durch Pattern-Erkennung</li>
        </ul>
      </div>
    </UseCaseLayout>
  );
}
