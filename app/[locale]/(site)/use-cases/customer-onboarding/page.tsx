import type { Metadata } from 'next';
import { UseCaseLayout } from '@/components/use-cases/UseCaseLayout';

export const metadata: Metadata = {
  title: 'Use Case: Customer Onboarding Automatisierung (Shadow/Enforce)',
  description:
    'Onboarding-Automatisierung mit AI: Willkommenssequenzen, Dokumentation, Compliance-Checks – sicher durch Firewall-Filter und Audit-Logs.',
  alternates: { canonical: '/use-cases/customer-onboarding' },
  openGraph: {
    title: 'Customer Onboarding Automatisierung – SIGMACODE AI',
    description:
      'Sicherer und personalisierter Customer Onboarding mit KI-gestützten Sequenzen und vollständiger Compliance.',
    url: '/use-cases/customer-onboarding',
  },
};

export default function CustomerOnboardingUseCase() {
  const kpis = ['+35% Onboarding-Speed', '−60% manuelle Schritte', '100% Compliance-Checks'];

  const architectureSteps = [
    'Trigger → Automatische Erkennung neuer Kunden oder Mitarbeiter',
    'Vorfilter (Datenvalidierung) → PII-Überprüfung und Daten-Sanitization',
    'SIGMACODE AI (Sequenz) → Personalisierte Willkommenssequenzen und Inhalte',
    'Nachfilter (Compliance) → Policy-Checks und Compliance-Durchsetzung',
    'Integration (CRM/HR) → Nahtlose Einbindung in bestehende Systeme',
    'Audit-Log → Vollständige Nachverfolgung aller Onboarding-Schritte',
  ];

  const securityFeatures = [
    'PII-Redaction im Vor-/Nachfilter für sensible Kundendaten',
    'Strenge Policy-Controls für Compliance-Anforderungen',
    'Vollständige Audit-Logs für alle Onboarding-Aktivitäten',
    'Role-Based Access Control für Onboarding-Teams',
    'Verschlüsselte Datenübertragung (TLS 1.3)',
    'Shadow-Mode für risikofreies Testing neuer Sequenzen',
  ];

  const integrations = [
    {
      title: 'Workflow-Pipelines',
      href: '/workflows',
      description: 'Automatisierte Sequenz-Management und Versionierung',
    },
    {
      title: 'AI Firewall',
      href: '/firewall',
      description: 'Sicherheit für Daten-Schutz und Compliance',
    },
    {
      title: 'Firewall-Powered Agents',
      href: '/agents',
      description: 'Personalisierte Inhalte mit integrierter Sicherheit',
    },
  ];

  const faq = [
    {
      question: 'Wie werden sensible Kundendaten geschützt?',
      answer:
        'Durch PII-Redaction im Vor-/Nachfilter und strenge Policy-Controls sowie vollständige Audit-Logs. Alle Daten werden verschlüsselt verarbeitet.',
    },
    {
      question: 'Kann ich bestehende CRM-Systeme einbinden?',
      answer:
        'Ja, via Webhooks und autorisierte API-Calls mit RBAC. Unterstützung für alle gängigen CRM- und HR-Systeme.',
    },
    {
      question: 'Wie funktioniert die Personalisierung?',
      answer:
        'KI-gestützte Analyse von Kundenprofilen kombiniert mit regelbasierten Personalisierungs-Engines für optimale Ergebnisse.',
    },
    {
      question: 'Sind die Onboarding-Sequenzen compliance-konform?',
      answer:
        'Ja, integrierte Compliance-Checks stellen sicher, dass alle Sequenzen regulatorische Anforderungen erfüllen.',
    },
    {
      question: 'Wie werden historische Onboarding-Daten behandelt?',
      answer:
        'Immutable Onboarding-Logs mit Zeitstempel und Erfolgsmetriken. Vollständige Historie für Trend-Analysen und Optimierung.',
    },
  ];

  return (
    <UseCaseLayout
      title="Customer Onboarding Automatisierung"
      subtitle="Sicher & personalisiert"
      description="Automatisiere Onboarding-Sequenzen mit AI-Agenten: Willkommensnachrichten, Dokumentation, Compliance-Prüfungen – mit Vor-/Nachfilter und vollständigen Audit-Trails."
      slug="customer-onboarding"
      kpis={kpis}
      architectureSteps={architectureSteps}
      securityFeatures={securityFeatures}
      integrations={integrations}
      faq={faq}
    >
      <div className="space-y-6">
        <h2>Warum Customer Onboarding mit AI?</h2>
        <p>
          Traditionelles Onboarding ist zeitaufwändig und fehleranfällig. Unser AI-gestützter Ansatz
          automatisiert den gesamten Prozess von der Willkommenssequenz bis zur vollständigen
          Integration – mit integrierter Sicherheit und Compliance.
        </p>

        <h3>Key Benefits</h3>
        <ul>
          <li>
            <strong>Geschwindigkeit:</strong> 35% schnellere Onboarding-Prozesse durch
            Automatisierung
          </li>
          <li>
            <strong>Effizienz:</strong> 60% weniger manuelle Schritte für HR- und Sales-Teams
          </li>
          <li>
            <strong>Compliance:</strong> 100% Einhaltung regulatorischer Anforderungen
          </li>
          <li>
            <strong>Personalisierung:</strong> KI-gestützte, individuelle Customer Journeys
          </li>
        </ul>

        <h3>Technische Details</h3>
        <p>
          Die Lösung integriert sich nahtlos in bestehende CRM- und HR-Systeme und unterstützt
          Multi-Channel-Onboarding (E-Mail, App, Web). Der Shadow-Mode ermöglicht risikofreies
          Testing neuer Onboarding-Sequenzen vor der produktiven Nutzung.
        </p>

        <h3>Anwendungsfälle</h3>
        <ul>
          <li>Customer Onboarding mit personalisierten Willkommenssequenzen</li>
          <li>Mitarbeiter-Onboarding mit automatisierten Schulungsplänen</li>
          <li>Partner-Onboarding mit strukturierten Integrationsprozessen</li>
          <li>Event-basierte Onboarding-Kampagnen mit Trigger-Automatisierung</li>
        </ul>
      </div>
    </UseCaseLayout>
  );
}
