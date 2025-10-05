import type { Metadata } from 'next';
import { UseCaseLayout } from '@/components/use-cases/UseCaseLayout';

export const metadata: Metadata = {
  title: 'Use Case: Sales Enablement Assistent (Deal Acceleration)',
  description:
    'Sales Enablement mit AI: Lead-Qualifizierung, Proposal-Generation, Deal-Analytics – mit Firewall-Sicherheit und vollständigen Audit-Trails.',
  alternates: { canonical: '/use-cases/sales-enablement' },
  openGraph: {
    title: 'Sales Enablement Assistent – SIGMACODE AI',
    description:
      'Intelligentes Sales Enablement mit KI-gestützter Lead-Qualifizierung und automatisierter Proposal-Generation.',
    url: '/use-cases/sales-enablement',
  },
};

export default function SalesEnablementUseCase() {
  const kpis = ['+25% Deal Speed', '−40% Admin Time', '0 Data Leaks'];

  const architectureSteps = [
    'Lead Capture → Automatische Lead-Erfassung aus verschiedenen Quellen',
    'Vorfilter (PII-Check) → Datenvalidierung und PII-Redaction',
    'SIGMACODE AI (Qualify/Proposal) → KI-gestützte Lead-Qualifizierung und Proposal-Generierung',
    'Nachfilter (Compliance) → Policy-Checks und Compliance-Durchsetzung',
    'CRM Integration → Nahtlose Einbindung in Sales-Tools',
    'Analytics → Real-time Deal-Insights und Performance-Metriken',
  ];

  const securityFeatures = [
    'PII-Redaction in allen Lead- und Kundendaten',
    'Strenge Policy-Controls für Sales-Compliance',
    'Vollständige Audit-Logs für alle Sales-Aktivitäten',
    'Role-Based Access Control für Sales-Teams',
    'Verschlüsselte Datenübertragung (TLS 1.3)',
    'Shadow-Mode für sicheres Testing neuer Sales-Strategien',
  ];

  const integrations = [
    {
      title: 'Workflow-Automation',
      href: '/workflows',
      description: 'Automatisierte Sales-Sequenzen und Follow-ups',
    },
    {
      title: 'AI Firewall',
      href: '/firewall',
      description: 'Sicherheit für Kundendaten und Compliance',
    },
    {
      title: 'Firewall-Powered Agents',
      href: '/agents',
      description: 'Intelligente Sales-Unterstützung mit integrierter Sicherheit',
    },
  ];

  const faq = [
    {
      question: 'Wie werden Lead-Daten validiert?',
      answer:
        'Durch Vorfilter mit PII-Erkennung und Daten-Sanitization. Automatische Qualitätsbewertung vor der Weiterverarbeitung.',
    },
    {
      question: 'Unterstützt ihr verschiedene CRM-Systeme?',
      answer:
        'Ja, via API-Integrationen mit RBAC und Audit-Trails. Unterstützung für Salesforce, HubSpot, Pipedrive und andere.',
    },
    {
      question: 'Wie funktioniert die Proposal-Generation?',
      answer:
        'KI-gestützte Analyse von Kundenanforderungen kombiniert mit regelbasierten Proposal-Templates für optimale Ergebnisse.',
    },
    {
      question: 'Sind die Sales-Daten sicher?',
      answer:
        'Ja, alle Kundendaten werden verschlüsselt verarbeitet, sensible Informationen redigiert und Zugriffe vollständig nachverfolgt.',
    },
    {
      question: 'Wie werden historische Sales-Performance-Daten behandelt?',
      answer:
        'Immutable Performance-Logs mit Zeitstempel und KPI-Tracking. Vollständige Historie für Trend-Analysen und Verkaufsoptimierung.',
    },
  ];

  return (
    <UseCaseLayout
      title="Sales Enablement Assistent"
      subtitle="Deals schneller abschließen"
      description="Automatisiere Lead-Qualifizierung, Proposal-Generation und Deal-Analytics – mit Firewall-Filtern für Daten-Schutz und vollständigen Audit-Logs."
      slug="sales-enablement"
      kpis={kpis}
      architectureSteps={architectureSteps}
      securityFeatures={securityFeatures}
      integrations={integrations}
      faq={faq}
    >
      <div className="space-y-6">
        <h2>Warum Sales Enablement mit AI?</h2>
        <p>
          Traditionelles Sales Enablement ist ressourcenintensiv und langsam. Unser AI-gestützter
          Ansatz automatisiert Lead-Qualifizierung, beschleunigt Proposal-Generierung und liefert
          Echtzeit-Insights – mit integrierter Sicherheit und Compliance.
        </p>

        <h3>Key Benefits</h3>
        <ul>
          <li>
            <strong>Geschwindigkeit:</strong> 25% schnellere Deal-Abschlüsse durch automatisierte
            Prozesse
          </li>
          <li>
            <strong>Effizienz:</strong> 40% weniger Administrative Zeit für Sales-Teams
          </li>
          <li>
            <strong>Sicherheit:</strong> 0 Datenlecks durch integrierte Firewall-Mechanismen
          </li>
          <li>
            <strong>Personalisierung:</strong> KI-gestützte, kundenindividuelle Proposals
          </li>
        </ul>

        <h3>Technische Details</h3>
        <p>
          Die Lösung integriert sich nahtlos in bestehende CRM-Systeme und unterstützt
          Multi-Channel-Sales (E-Mail, Phone, Social). Der Shadow-Mode ermöglicht risikofreies
          Testing neuer Sales-Strategien vor der produktiven Nutzung.
        </p>

        <h3>Anwendungsfälle</h3>
        <ul>
          <li>Lead-Qualifizierung mit automatisierten Scoring-Modellen</li>
          <li>Proposal-Generation mit kundenspezifischen Templates</li>
          <li>Deal-Analytics mit Echtzeit-Performance-Insights</li>
          <li>Sales-Coaching mit KI-gestützten Empfehlungen</li>
        </ul>
      </div>
    </UseCaseLayout>
  );
}
