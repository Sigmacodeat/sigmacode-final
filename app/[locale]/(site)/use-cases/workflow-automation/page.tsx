import type { Metadata } from 'next';
import { UseCaseLayout } from '@/components/use-cases/UseCaseLayout';

export const metadata: Metadata = {
  title: 'Use Case: Workflow‑Automation (Pipelines, Scheduling, Traces)',
  description:
    'Versionierte AI‑Workflows mit Scheduling, Webhooks, Traces und Kostenkontrolle. Shadow→Enforce, Audit‑fähig, Enterprise‑ready.',
  alternates: { canonical: '/use-cases/workflow-automation' },
  openGraph: {
    title: 'Workflow‑Automation – SIGMACODE AI',
    description:
      'Reproduzierbare, beobachtbare und sichere AI-Workflows mit Scheduling, Traces und integrierter Kostenkontrolle.',
    url: '/use-cases/workflow-automation',
  },
};

export default function WorkflowAutomationUseCase() {
  const kpis = ['−55% manuelle Tasks', 'Rollbacks in Minuten', 'Budget‑Alerts'];

  const architectureSteps = [
    'Ingest → Automatische Erfassung und Validierung von Workflow-Definitionen',
    'Validate (Vorfilter) → KI-gestützte Workflow-Validierung und Optimierung',
    'Execute (SIGMACODE AI) → Intelligente Workflow-Ausführung mit KI-Agenten',
    'Validate (Nachfilter) → Policy-basierte Validierung und Qualitätssicherung',
    'Persist → Strukturierte Speicherung von Workflow-Ergebnissen',
    'Notify → Automatische Benachrichtigungen und Follow-ups',
  ];

  const securityFeatures = [
    'Verschlüsselte Workflow-Datenverarbeitung (End-to-End)',
    'PII-Redaction in allen Workflow-Inputs und Outputs',
    'Role-Based Access Control für Workflow-Teams',
    'Vollständige Audit-Trails für alle Workflow-Aktivitäten',
    'Compliance-Checks für Workflow-Standards',
    'Shadow-Mode für sicheres Testing neuer Workflows',
  ];

  const integrations = [
    {
      title: 'Workflows',
      href: '/workflows',
      description: 'Versionierte Pipelines und Observability im Produkt',
    },
    {
      title: 'AI Firewall',
      href: '/firewall',
      description: 'Vor-/Nachfilter für sichere Workflow-Ausführung',
    },
    {
      title: 'SIGMACODE AI Agents',
      href: '/agents',
      description: 'Bausteine der Pipeline für komplexe Tasks',
    },
  ];

  const faq = [
    {
      question: 'Kann ich externe Systeme triggern?',
      answer:
        'Ja, via Webhooks/Events – sowohl als Input (Trigger) als auch als Output (Actions) für vollständige Integration.',
    },
    {
      question: 'Wie werden Kosten kontrolliert?',
      answer:
        'Budget-Limits, Quoten, Token-Previews und Alerts pro Team/Run. Vollständige Transparenz und Kostenkontrolle.',
    },
    {
      question: 'Wie funktioniert die Versionierung?',
      answer:
        'Automatische Versionierung aller Workflow-Definitionen mit vollständiger Änderungshistorie und Rollback-Fähigkeiten.',
    },
    {
      question: 'Sind die Workflow-Daten sicher?',
      answer:
        'Ja, alle Daten werden verschlüsselt verarbeitet, sensible Informationen redigiert und Zugriffe vollständig nachverfolgt.',
    },
  ];

  return (
    <UseCaseLayout
      title="Workflow‑Automation"
      subtitle="Reproduzierbar, beobachtbar, sicher"
      description="Baue Pipelines aus Prompts, Tools und Policies. Versionierung, Scheduling, Webhooks, Traces und Kostenkontrolle inklusive – mit Firewall‑Guardrails."
      slug="workflow-automation"
      kpis={kpis}
      architectureSteps={architectureSteps}
      securityFeatures={securityFeatures}
      integrations={integrations}
      faq={faq}
    >
      <div className="space-y-6">
        <h2>Warum Workflow Automation mit AI?</h2>
        <p>
          Traditionelle Workflow-Automatisierung ist starr und wartungsintensiv. Unser AI-gestützter
          Ansatz ermöglicht flexible, intelligente Pipelines mit integrierter Sicherheit und
          vollständiger Observability – für maximale Effizienz und Compliance.
        </p>

        <h3>Key Benefits</h3>
        <ul>
          <li>
            <strong>Effizienz:</strong> 55% weniger manuelle Tasks durch intelligente
            Automatisierung
          </li>
          <li>
            <strong>Reliabilität:</strong> Rollbacks in Minuten durch vollständige Versionierung
          </li>
          <li>
            <strong>Kostenkontrolle:</strong> Proaktive Budget-Alerts und transparente
            Kostenübersicht
          </li>
          <li>
            <strong>Skalierbarkeit:</strong> Konsistente Performance auch bei komplexen Workflows
          </li>
        </ul>

        <h3>Technische Details</h3>
        <p>
          Die Lösung unterstützt Scheduling (Cron/Trigger), Retries, Dead-Letter-Queues und
          integriert sich in bestehende CI/CD-Pipelines. Der Shadow-Mode ermöglicht risikofreies
          Testing neuer Workflows vor der produktiven Nutzung.
        </p>

        <h3>Anwendungsfälle</h3>
        <ul>
          <li>ETL-Pipelines mit KI-gestützter Datenverarbeitung</li>
          <li>Content-Generation-Workflows mit automatisierten Reviews</li>
          <li>Approval-Workflows mit intelligenten Routing-Entscheidungen</li>
          <li>Data-Processing-Pipelines mit Quality Gates</li>
        </ul>
      </div>
    </UseCaseLayout>
  );
}
