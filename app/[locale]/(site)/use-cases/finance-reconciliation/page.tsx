import type { Metadata } from 'next';
import { UseCaseLayout } from '@/components/use-cases/UseCaseLayout';

export const metadata: Metadata = {
  title: 'Use Case: Finance Reconciliation Bot (Audit-fähig)',
  description:
    'Finance Reconciliation mit AI: Automatische Abstimmung, Fraud Detection, Report-Generation – mit Firewall-Sicherheit und vollständigen Audit-Trails.',
  alternates: { canonical: '/use-cases/finance-reconciliation' },
  openGraph: {
    title: 'Finance Reconciliation Bot – SIGMACODE AI',
    description:
      'Präzise und auditierbare Finanzabstimmung mit KI-gestützter Fraud Detection und automatisierter Report-Generierung.',
    url: '/use-cases/finance-reconciliation',
  },
};

export default function FinanceReconciliationUseCase() {
  const kpis = ['+80% Reconciliation Speed', '−50% Manual Reviews', '100% Audit Trail'];

  const architectureSteps = [
    'Transaction Data → Automatische Erfassung aus verschiedenen Quellen',
    'Vorfilter (PII/Validation) → Datenvalidierung und PII-Redaction',
    'SIGMACODE AI (Reconcile) → KI-gestützte Abstimmung und Matching',
    'Nachfilter (Compliance) → Policy-Checks und Compliance-Durchsetzung',
    'ERP Integration → Nahtlose Einbindung in Finanzsysteme',
    'Report → Automatische Generierung von Audit-Reports',
  ];

  const securityFeatures = [
    'PII-Redaction in allen Finanztransaktionen',
    'Strenge Policy-Controls für Finanz-Compliance',
    'Vollständige Audit-Logs für alle Reconciliation-Aktivitäten',
    'Role-Based Access Control für Finance-Teams',
    'Verschlüsselte Datenübertragung (TLS 1.3)',
    'Shadow-Mode für sicheres Testing neuer Reconciliation-Regeln',
  ];

  const integrations = [
    {
      title: 'Workflow-Automation',
      href: '/workflows',
      description: 'Automatisierte Reconciliation-Prozesse und Versionierung',
    },
    {
      title: 'AI Firewall',
      href: '/firewall',
      description: 'Sicherheit für Finanzdaten und Compliance',
    },
    {
      title: 'Firewall-Powered Agents',
      href: '/agents',
      description: 'Intelligente Finanzanalyse mit integrierter Sicherheit',
    },
  ];

  const faq = [
    {
      question: 'Wie werden finanzielle Daten geschützt?',
      answer:
        'Durch strenge PII-Redaction und verschlüsselte Verarbeitung. Alle Daten werden nach Bankenstandards gesichert.',
    },
    {
      question: 'Unterstützt ihr verschiedene ERP-Systeme?',
      answer:
        'Ja, via standardisierte API-Connectors mit RBAC. Unterstützung für SAP, Oracle, Microsoft Dynamics und andere.',
    },
    {
      question: 'Wie funktioniert die Fraud Detection?',
      answer:
        'KI-gestützte Anomalie-Erkennung kombiniert mit regelbasierten Systemen für präzise Fraud-Identifizierung.',
    },
    {
      question: 'Sind die Reconciliation-Reports audit-fähig?',
      answer:
        'Ja, alle Reports enthalten vollständige Audit-Trails mit Zeitstempeln und Änderungshistorie für Compliance-Anforderungen.',
    },
    {
      question: 'Wie werden historische Finanztransaktionsdaten behandelt?',
      answer:
        'Immutable Transaction-Logs mit Zeitstempel und vollständiger Historie. Vollständige Nachverfolgung für Audit-Zwecke.',
    },
  ];

  return (
    <UseCaseLayout
      title="Finance Reconciliation Bot"
      subtitle="Präzise & auditierbar"
      description="Automatisiere Bankabstimmungen, Fraud Detection und Report-Generation – mit Firewall-gesicherten Daten und vollständigen Audit-Logs."
      slug="finance-reconciliation"
      kpis={kpis}
      architectureSteps={architectureSteps}
      securityFeatures={securityFeatures}
      integrations={integrations}
      faq={faq}
    >
      <div className="space-y-6">
        <h2>Warum Finance Reconciliation mit AI?</h2>
        <p>
          Traditionelle Finanzabstimmung ist fehleranfällig und zeitaufwändig. Unser AI-gestützter
          Ansatz automatisiert den gesamten Prozess von der Datenaggregation bis zur
          Report-Generierung – mit integrierter Sicherheit und vollständiger Auditierbarkeit.
        </p>

        <h3>Key Benefits</h3>
        <ul>
          <li>
            <strong>Geschwindigkeit:</strong> 80% schnellere Reconciliation-Prozesse durch
            Automatisierung
          </li>
          <li>
            <strong>Genauigkeit:</strong> 50% weniger manuelle Reviews durch KI-optimierte
            Abstimmung
          </li>
          <li>
            <strong>Auditierbarkeit:</strong> 100% vollständige Audit-Trails für alle Transaktionen
          </li>
          <li>
            <strong>Compliance:</strong> Automatische Einhaltung regulatorischer Anforderungen
          </li>
        </ul>

        <h3>Technische Details</h3>
        <p>
          Die Lösung unterstützt alle gängigen Finanzformate (MT940, CAMT, CSV) und integriert sich
          in bestehende ERP-Systeme. Der Shadow-Mode ermöglicht risikofreies Testing neuer
          Reconciliation-Regeln vor der produktiven Nutzung.
        </p>

        <h3>Anwendungsfälle</h3>
        <ul>
          <li>Bank Reconciliation mit automatisierten Matching-Algorithmen</li>
          <li>Fraud Detection mit ML-gestützter Anomalie-Erkennung</li>
          <li>SOX-konforme Dokumentation und Reporting</li>
          <li>Multi-Entity Reconciliation für komplexe Organisationsstrukturen</li>
        </ul>
      </div>
    </UseCaseLayout>
  );
}
