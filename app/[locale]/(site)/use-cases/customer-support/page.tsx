import type { Metadata } from 'next';
import { UseCaseLayout } from '@/components/use-cases/UseCaseLayout';

export const metadata: Metadata = {
  title: 'Use Case: Customer Support Copilot (PII‑sicher, auditierbar)',
  description:
    'Customer Support mit AI‑Copilot: Qualität steigern, Handle‑Time senken. Nachfilter gegen Halluzinationen, PII‑Redaction, Audit‑Logs, Shadow→Enforce.',
  alternates: { canonical: '/use-cases/customer-support' },
  openGraph: {
    title: 'Customer Support Copilot – SIGMACODE AI',
    description:
      'Sicherer und auditierbarer Customer Support mit KI-gestützter Assistenz und vollständiger Compliance.',
    url: '/use-cases/customer-support',
  },
};

export default function CustomerSupportUseCase() {
  const kpis = ['+12% CSAT', '−28% Handle Time', '0 PII‑Leaks'];

  const architectureSteps = [
    'Client Request → Automatische Erfassung und Analyse der Support-Anfrage',
    'Vorfilter (PII, Prompt‑Injection) → Datenvalidierung und Sicherheitschecks',
    'SIGMACODE AI Agent → KI-gestützte Problemlösung und Antwortgenerierung',
    'Nachfilter (Halluzination, Redaction) → Qualitätssicherung und Compliance-Checks',
    'Response → Strukturierte Antwort mit Follow-up-Empfehlungen',
    'Audit-Logging → Vollständige Nachverfolgung aller Support-Interaktionen',
  ];

  const securityFeatures = [
    'PII-Redaction in allen Support-Interaktionen',
    'Halluzinationsschutz durch Nachfilter-Mechanismen',
    'Vollständige Audit-Logs für alle Support-Aktivitäten',
    'Role-Based Access Control für Support-Teams',
    'Verschlüsselte Datenübertragung (TLS 1.3)',
    'Shadow-Mode für risikofreies Testing neuer Support-Policies',
  ];

  const integrations = [
    {
      title: 'Workflow-Automation',
      href: '/workflows',
      description: 'Automatisierte Support-Flows und Eskalationsregeln',
    },
    {
      title: 'AI Firewall',
      href: '/firewall',
      description: 'Sicherheit für Kundendaten und Compliance',
    },
    {
      title: 'Agents',
      href: '/agents',
      description: 'Intelligente Support-Unterstützung',
    },
  ];

  const faq = [
    {
      question: 'Wie starte ich risikofrei?',
      answer:
        'Mit Shadow-Mode: Policies werten aus, blockieren jedoch nicht. Danach Enforce für vollständige Sicherheit.',
    },
    {
      question: 'Unterstützte Kanäle?',
      answer:
        'Web, Chat, E-Mail – angebunden via Webhooks und Tools. Multi-Channel-Support mit konsistenten Lösungen.',
    },
    {
      question: 'Wie funktioniert der Halluzinationsschutz?',
      answer:
        'KI-gestützte Validierung kombiniert mit regelbasierten Nachfiltern für präzise und reliable Antworten.',
    },
    {
      question: 'Sind die Support-Daten sicher?',
      answer:
        'Ja, alle Kundendaten werden verschlüsselt verarbeitet, sensible Informationen redigiert und Zugriffe vollständig nachverfolgt.',
    },
  ];

  return (
    <UseCaseLayout
      title="Customer Support Copilot"
      subtitle="Sicher & auditierbar"
      description="Verbessere Antwortqualität und senke Bearbeitungszeiten – mit Vor‑/Nachfilter‑Firewall (PII‑Redaction, Halluzination‑Check), Audit‑Transparenz und RBAC."
      slug="customer-support"
      kpis={kpis}
      architectureSteps={architectureSteps}
      securityFeatures={securityFeatures}
      integrations={integrations}
      faq={faq}
    >
      <div className="space-y-6">
        <h2>Warum Customer Support mit AI?</h2>
        <p>
          Traditioneller Customer Support ist langsam und inkonsistent. Unser AI-gestützter Ansatz
          liefert sofortige, präzise Antworten mit integrierter Sicherheit und vollständiger
          Auditierbarkeit – für bessere Kundenzufriedenheit und Compliance.
        </p>

        <h3>Key Benefits</h3>
        <ul>
          <li>
            <strong>Kundenzufriedenheit:</strong> 12% höhere CSAT-Scores durch präzise Antworten
          </li>
          <li>
            <strong>Effizienz:</strong> 28% kürzere Bearbeitungszeiten durch KI-Unterstützung
          </li>
          <li>
            <strong>Sicherheit:</strong> 0 PII-Leaks durch integrierte Datenschutzmechanismen
          </li>
          <li>
            <strong>Skalierbarkeit:</strong> Konsistente Support-Qualität auch bei hohem Volumen
          </li>
        </ul>

        <h3>Technische Details</h3>
        <p>
          Die Lösung integriert sich in bestehende Helpdesk-Systeme und unterstützt
          Multi-Channel-Support (E-Mail, Chat, Phone). Der Shadow-Mode ermöglicht risikofreies
          Testing neuer Support-Policies vor der produktiven Nutzung.
        </p>

        <h3>Anwendungsfälle</h3>
        <ul>
          <li>Support-Ticket-Klassifizierung mit automatisierten Antworten</li>
          <li>Knowledge-Base-gestützte Problemlösung</li>
          <li>Multi-Language-Support mit Übersetzung</li>
          <li>Proaktive Support-Benachrichtigungen</li>
        </ul>
      </div>
    </UseCaseLayout>
  );
}
