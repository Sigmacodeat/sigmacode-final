import type { Metadata } from 'next';
import { UseCaseLayout } from '@/components/use-cases/UseCaseLayout';

export const metadata: Metadata = {
  title: 'Use Case: HR Recruiting Screening (Bias-Free)',
  description:
    'HR Recruiting mit AI: CV-Screening, Interview-Fragen, Bias-Detection – mit Firewall-Sicherheit und vollständigen Audit-Trails.',
  alternates: { canonical: '/use-cases/hr-recruiting' },
  openGraph: {
    title: 'HR Recruiting Screening – SIGMACODE AI',
    description:
      'Fair und effizientes Recruiting mit KI-gestütztem CV-Screening, Bias-Detection und automatisierten Interview-Fragen.',
    url: '/use-cases/hr-recruiting',
  },
};

export default function HRRecruitingUseCase() {
  const kpis = ['+70% Screening Speed', '−40% Bias Incidents', '100% Audit Compliance'];

  const architectureSteps = [
    'CV/Application → Automatische PII-Anonymisierung und Datenvalidierung',
    'Qualifikations-Analyse → KI-gestützte Bewertung von Fähigkeiten und Erfahrung',
    'Bias Detection → Automatische Erkennung unfairer Bewertungskriterien',
    'Interview-Fragen-Generierung → Personalisierte, job-spezifische Fragen',
    'HR-System-Integration → Strukturierte Datenübergabe mit vollständiger Nachverfolgung',
    'Audit-Logging → Vollständige Dokumentation aller Recruiting-Entscheidungen',
  ];

  const securityFeatures = [
    'Automatische PII-Redaction in allen Bewerbungsdaten',
    'Bias-Detection-Algorithmen zur fairen Bewertung',
    'Verschlüsselte Datenübertragung (TLS 1.3)',
    'Role-Based Access Control für HR-Teams',
    'Vollständige Audit-Trails für alle Recruiting-Aktivitäten',
    'Shadow-Mode für risikofreies Testing neuer Screening-Policies',
    'GDPR-konforme Datenverarbeitung',
  ];

  const integrations = [
    {
      title: 'ATS Integration',
      href: '/integrations/ats',
      description: 'Nahtlose Anbindung an Applicant Tracking Systems',
    },
    {
      title: 'Workflow Automation',
      href: '/workflows',
      description: 'Automatisierte Recruiting-Prozesse und Follow-ups',
    },
    {
      title: 'AI Firewall',
      href: '/firewall',
      description: 'Sicherheit für sensible Bewerberdaten',
    },
    {
      title: 'Audit & Compliance',
      href: '/agents',
      description: 'Vollständige Nachverfolgung und Berichterstattung',
    },
  ];

  const faq = [
    {
      question: 'Wie wird Bias erkannt und verhindert?',
      answer:
        'Durch ML-Modelle im Nachfilter und strenge Policy-Controls, die faire Bewertungskriterien durchsetzen.',
    },
    {
      question: 'Kann ich bestehende ATS-Systeme einbinden?',
      answer: 'Ja, via API-Integrationen mit RBAC und vollständigen Audit-Trails für Compliance.',
    },
    {
      question: 'Welche Qualifikationen werden bewertet?',
      answer:
        'Technische Skills, Erfahrung, Bildungshintergrund und Soft Skills – alle fair und transparent.',
    },
    {
      question: 'Sind die Bewerberdaten sicher?',
      answer:
        'Ja, alle Daten werden verschlüsselt verarbeitet, PII automatisch redigiert und nur autorisiertes Personal hat Zugriff.',
    },
    {
      question: 'Wie werden Interview-Fragen generiert?',
      answer:
        'KI-gestützt basierend auf Job-Description und Kandidaten-Profil mit Fokus auf Relevanz und Fairness.',
    },
  ];

  return (
    <UseCaseLayout
      title="HR Recruiting Screening"
      subtitle="Fair & effizient"
      description="Automatisiere CV-Screening, generiere Interview-Fragen und erkenne Bias – mit Firewall-gesicherten HR-Daten, fairen Algorithmen und vollständigen Audit-Trails."
      slug="hr-recruiting"
      kpis={kpis}
      architectureSteps={architectureSteps}
      securityFeatures={securityFeatures}
      integrations={integrations}
      faq={faq}
    >
      <div className="space-y-6">
        <h2>Warum HR Recruiting mit AI?</h2>
        <p>
          Traditionelles Recruiting ist zeitaufwändig und anfällig für unbewusste
          Voreingenommenheit. Unser AI-gestützter Ansatz liefert faire, effiziente und transparente
          Bewertungen mit integrierter Sicherheit und vollständiger Auditierbarkeit.
        </p>

        <h3>Key Benefits</h3>
        <ul>
          <li>
            <strong>Faire Bewertung:</strong> 40% weniger Bias-Incidents durch strukturierte
            Algorithmen
          </li>
          <li>
            <strong>Effizienz:</strong> 70% schnellere CV-Screening-Prozesse
          </li>
          <li>
            <strong>Qualität:</strong> Personalisierte Interview-Fragen für bessere
            Einstellungsentscheidungen
          </li>
          <li>
            <strong>Compliance:</strong> 100% Audit-konforme Dokumentation aller Entscheidungen
          </li>
        </ul>

        <h3>Technische Details</h3>
        <p>
          Die Lösung integriert sich in bestehende HR-Systeme und unterstützt alle gängigen
          Recruiting-Standards. Der Shadow-Mode ermöglicht risikofreies Testing neuer
          Screening-Policies vor der produktiven Nutzung.
        </p>

        <h3>Anwendungsfälle</h3>
        <ul>
          <li>Automatische CV-Screening und -Bewertung</li>
          <li>Personalisierte Interview-Fragen-Generierung</li>
          <li>Bias-Detection und faire Bewertungsalgorithmen</li>
          <li>Integration mit ATS-Systemen (Workday, Greenhouse, etc.)</li>
          <li>GDPR-konforme Datenverarbeitung</li>
        </ul>
      </div>
    </UseCaseLayout>
  );
}
