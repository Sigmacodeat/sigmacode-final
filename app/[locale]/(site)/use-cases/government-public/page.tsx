import type { Metadata } from 'next';
import { UseCaseLayout } from '@/components/use-cases/UseCaseLayout';

export const metadata: Metadata = {
  title: 'Use Case: Government AI mit GDPR-Firewall',
  description:
    'Öffentliche Verwaltung mit AI: Bürgerdienste, Dokumentenverarbeitung, Transparenz – mit DSGVO-konformer Sicherheit und vollständigen Audit-Trails.',
  alternates: { canonical: '/use-cases/government-public' },
  openGraph: {
    title: 'Government AI mit Firewall – SIGMACODE AI',
    description:
      'Sicherste Verwaltungs-KI: DSGVO-konform, transparente Entscheidungen, Bürgerdaten-Schutz mit vollständigen Audit-Trails.',
    url: '/use-cases/government-public',
  },
};

export default function GovernmentPublicUseCase() {
  const kpis = ['100% DSGVO-konform', '±40% schnellere Bearbeitung', 'Vollständige Transparenz'];

  const architectureSteps = [
    'Citizen Request → Automatische Klassifizierung und PII-Erkennung',
    'Document Processing → KI-gestützte Dokumentenanalyse und -verarbeitung',
    'SIGMACODE AI Agent → Kontextualisierte Entscheidungsunterstützung',
    'GDPR Compliance Filter → Automatische Datenschutz- und Transparenz-Checks',
    'Decision Engine → Validierte, nachvollziehbare Verwaltungsentscheidungen',
    'Audit Logging → Vollständige Nachverfolgung aller Prozessschritte',
  ];

  const securityFeatures = [
    'Automatische DSGVO-Compliance gemäß Art. 5 und Art. 25',
    'Bürgerdaten-Schutz mit automatischer PII-Redaction',
    'Transparenz-Anforderungen nach Art. 13 und Art. 14',
    'Recht auf Erklärung (Art. 22) für algorithmische Entscheidungen',
    'Datensicherheit nach ISO 27001 und BSI-Standards',
    'Zero-Trust Architecture für öffentliche Verwaltung',
    'Quantum-sichere Verschlüsselung für Langzeit-Archivierung',
  ];

  const integrations = [
    {
      title: 'eGovernment Portal',
      href: '/integrations/egov',
      description: 'Integration mit OZG-konformen Bürgerportalen',
    },
    {
      title: 'Document Management',
      href: '/docs/government',
      description: 'DMS-Integration für behördliche Dokumentenablage',
    },
    {
      title: 'Transparency Engine',
      href: '/transparency/gdpr',
      description: 'Automatische Transparenz-Reports für Bürger',
    },
    {
      title: 'Audit System',
      href: '/audit/government',
      description: 'Vollständige Audit-Trails für alle Verwaltungsakte',
    },
  ];

  const faq = [
    {
      question: 'Wie wird DSGVO-Compliance gewährleistet?',
      answer:
        'Durch automatische PII-Redaction, Transparenz-Reports, Recht-auf-Erklärung und regelmäßige Datenschutz-Folgenabschätzungen.',
    },
    {
      question: 'Unterstützt ihr verschiedene Verwaltungsbereiche?',
      answer:
        'Ja, von Meldebehörden über Bauämter bis zu Sozialverwaltung – mit spezifischen Modellen und Prozessvorlagen.',
    },
    {
      question: 'Wie funktioniert die Transparenz für Bürger?',
      answer:
        'Durch automatische Generierung von Transparenzberichten, nachvollziehbare Entscheidungswege und einfache Erklärungen.',
    },
    {
      question: 'Sind die Verwaltungsdaten sicher?',
      answer:
        'Ja, alle Daten werden nach BSI-Standards verschlüsselt, sensible Informationen redigiert und nur autorisierte Beamte haben Zugriff.',
    },
    {
      question: 'Wie werden algorithmische Entscheidungen erklärt?',
      answer:
        'Durch automatische Generierung von Erklärungen (XAI), Transparenz-Logs und einfache Darstellung komplexer Entscheidungen.',
    },
  ];

  return (
    <UseCaseLayout
      title="Government AI"
      subtitle="Transparent & bürgernah"
      description="DSGVO-konforme Verwaltungs-KI für Bürgerdienste: Automatisierte Antragsbearbeitung, transparente Entscheidungen und vollständige Audit-Trails – mit höchster Sicherheit."
      slug="government-public"
      kpis={kpis}
      architectureSteps={architectureSteps}
      securityFeatures={securityFeatures}
      integrations={integrations}
      faq={faq}
    >
      <div className="space-y-6">
        <h2>Warum Government AI mit Firewall-Sicherheit?</h2>
        <p>
          Öffentliche Verwaltung verarbeitet die sensibelsten Bürgerdaten und muss höchsten
          Transparenz- und Datenschutzanforderungen genügen. Traditionelle Verwaltungssysteme bieten
          nicht den erforderlichen Schutz für diese vertrauenskritischen Anwendungen. Unsere Lösung
          kombiniert Verwaltungseffizienz mit Bürgerrechte-Schutz.
        </p>

        <h3>Kritische Features für Verwaltung</h3>
        <ul>
          <li>
            <strong>DSGVO-Compliance:</strong> Automatische Einhaltung aller
            EU-Datenschutzgrundverordnungen
          </li>
          <li>
            <strong>Bürgerdaten-Schutz:</strong> Automatische PII-Redaction und Datenschutz-Checks
          </li>
          <li>
            <strong>Transparenz:</strong> Nachvollziehbare Entscheidungen mit Erklärbarkeit (XAI)
          </li>
          <li>
            <strong>Effizienz:</strong> Automatisierte Prozessbearbeitung mit KI-Unterstützung
          </li>
          <li>
            <strong>Audit-Fähigkeit:</strong> Vollständige Nachverfolgung aller Verwaltungsakte
          </li>
        </ul>

        <h3>Technische Exzellenz</h3>
        <p>
          Die Lösung integriert sich in bestehende eGovernment-Systeme und unterstützt alle gängigen
          Verwaltungsstandards. Der Shadow-Mode ermöglicht risikofreies Testing vor der produktiven
          Nutzung.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border-l-4 border-blue-500">
          <h4 className="text-blue-800 dark:text-blue-200 font-semibold">Bürgerrechte-Schutz</h4>
          <p className="text-blue-700 dark:text-blue-300 mt-2">
            Unsere Government-Lösung ist speziell für die einzigartigen Anforderungen moderner
            Verwaltung entwickelt worden. Von der automatischen DSGVO-Compliance bis zur Transparenz
            für Bürger – jede Komponente wurde mit Fokus auf Rechtssicherheit entwickelt.
          </p>
        </div>
      </div>
    </UseCaseLayout>
  );
}
