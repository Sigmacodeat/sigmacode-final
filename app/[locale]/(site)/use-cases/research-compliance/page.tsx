import type { Metadata } from 'next';
import { UseCaseLayout } from '@/components/use-cases/UseCaseLayout';

export const metadata: Metadata = {
  title: 'Use Case: Research mit Compliance‑Guardrails (Audit & Quellen)',
  description:
    'Research‑Workflows mit verifizierten Quellen, Policy‑Checks und revisionssicheren Logs. Shadow→Enforce, RBAC, Kong API Gateway.',
  alternates: { canonical: '/use-cases/research-compliance' },
  openGraph: {
    title: 'Research mit Compliance‑Guardrails – SIGMACODE AI',
    description:
      'Sichere und nachvollziehbare Research-Workflows mit AI-Firewall, Quellen-Verifizierung und vollständigen Audit-Trails.',
    url: '/use-cases/research-compliance',
  },
};

export default function ResearchComplianceUseCase() {
  const kpis = ['−40% Recherchezeit', '+2.1x Output/Analyst', '0 Policy‑Incidents'];

  const architectureSteps = [
    'Client Request → Vorfilter (Prompt‑Injection, PII‑Redaction)',
    'SIGMACODE AI → RAG mit autorisierten Quellen + Tools',
    'Nachfilter → Compliance‑Checks, Evidence‑Validierung',
    'Response → strukturierte Ausgabe mit Quellenangaben',
    'Audit‑Logging → vollständige Nachverfolgung aller Schritte',
  ];

  const securityFeatures = [
    'Evidence‑Erzwingung – alle Antworten mit verifizierten Quellen',
    'Revisionssichere Audit‑Logs für jeden Research‑Schritt',
    'Role‑Based Access Control für Daten und Tools',
    'PII‑Redaction in allen Ein‑ und Ausgaben',
    'API‑Quotas und Rate‑Limiting via Kong Gateway',
    'Shadow‑Mode für risikofreies Testing neuer Policies',
  ];

  const integrations = [
    {
      title: 'Firewall‑Powered Agents',
      href: '/agents',
      description: 'Orchestrierte Agenten mit RAG und autorisierten Tools',
    },
    {
      title: 'AI Firewall',
      href: '/firewall',
      description: 'Vor‑/Nachfilter für sichere Research‑Operationen',
    },
    {
      title: 'Workflow Automation',
      href: '/workflows',
      description: 'Versionierte Research‑Pipelines mit Traces',
    },
    {
      title: 'Multi‑Agent Systems',
      href: '/mas',
      description: 'Koordinierte Research‑Agenten für komplexe Aufgaben',
    },
  ];

  const faq = [
    {
      question: 'Wie werden Quellen verifiziert?',
      answer:
        'Durch Nachfilter‑Regeln und Validierungsschritte, die Evidenz verlangen. Jede Antwort muss Quellenangaben enthalten.',
    },
    {
      question: 'Kann ich interne Wissensbasen einbinden?',
      answer:
        'Ja, via RAG und autorisierte Tools mit RBAC & Audit‑Pfaden. Vollständige Nachverfolgung aller Datenquellen.',
    },
    {
      question: 'Wie funktioniert die Evidence‑Erzwingung?',
      answer:
        'Das System validiert automatisch, dass jede Antwort auf verifizierten Quellen basiert und lehnt ungesicherte Aussagen ab.',
    },
    {
      question: 'Sind die Audit‑Logs revisionssicher?',
      answer:
        'Ja, alle Logs sind kryptografisch gesichert, zeitgestempelt und manipulationssicher für Compliance‑Anforderungen.',
    },
    {
      question: 'Unterstützt ihr Custom Research‑Tools?',
      answer:
        'Ja, autorisierte Custom‑Tools können integriert werden mit vollständiger Nachverfolgung und Security‑Validierung.',
    },
  ];

  return (
    <UseCaseLayout
      title="Research mit Compliance‑Guardrails"
      subtitle="Nachvollziehbar & sicher"
      description="Prüfe Quellen, verhindere Datenabfluss und erhalte vollständige Nachweise – mit Vor‑/Nachfilter, Audit‑Logs und Rollen."
      slug="research-compliance"
      kpis={kpis}
      architectureSteps={architectureSteps}
      securityFeatures={securityFeatures}
      integrations={integrations}
      faq={faq}
    >
      <div className="space-y-6">
        <h2>Warum Research mit Compliance‑Guardrails?</h2>
        <p>
          Traditionelle Research‑Tools bieten keine Garantie für Quellenqualität oder Compliance.
          Unser System erzwingt Evidence‑basierte Antworten, verhindert Datenabfluss und liefert
          vollständige Audit‑Trails – ideal für regulierte Branchen.
        </p>

        <h3>Key Benefits</h3>
        <ul>
          <li>
            <strong>Verifizierte Quellen:</strong> Automatische Validierung aller
            Informationsquellen
          </li>
          <li>
            <strong>Compliance‑First:</strong> Integrierte Policy‑Checks und Audit‑Anforderungen
          </li>
          <li>
            <strong>Effizienzsteigerung:</strong> KI‑optimierte Recherche mit menschlicher Qualität
          </li>
          <li>
            <strong>Skalierbarkeit:</strong> Konsistente Ergebnisse auch bei hohem Recherchevolumen
          </li>
          <li>
            <strong>Integration:</strong> Nahtlose Einbindung in bestehende
            Knowledge‑Management‑Systeme
          </li>
        </ul>

        <h3>Technische Highlights</h3>
        <p>
          Die Lösung nutzt Advanced RAG mit autorisierten Datenquellen, KI‑basierte
          Evidence‑Validierung und Echtzeit‑Compliance‑Checks. Der Shadow‑Mode ermöglicht
          risikofreies Testing neuer Research‑Policies vor der produktiven Nutzung.
        </p>

        <h3>Anwendungsfälle</h3>
        <ul>
          <li>Legal Research mit verifizierten Quellen und Compliance‑Dokumentation</li>
          <li>Market Intelligence mit automatisierten Quellen‑Checks</li>
          <li>Technical Documentation mit Evidence‑basierten Updates</li>
          <li>Policy Research mit vollständiger Nachverfolgung und Validierung</li>
        </ul>
      </div>
    </UseCaseLayout>
  );
}
