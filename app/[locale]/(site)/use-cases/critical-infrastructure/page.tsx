import type { Metadata } from 'next';
import { UseCaseLayout } from '@/components/use-cases/UseCaseLayout';

export const metadata: Metadata = {
  title: 'Use Case: Critical Infrastructure mit OT/IT-Firewall',
  description:
    'Kritische Infrastrukturen mit AI: Anlagenüberwachung, Predictive Maintenance, Störfall-Management – mit Zero-Downtime-Sicherheit und vollständigen Audit-Trails.',
  alternates: { canonical: '/use-cases/critical-infrastructure' },
  openGraph: {
    title: 'Critical Infrastructure AI – SIGMACODE AI',
    description:
      'Sicherste Infrastruktur-KI: Zero-Downtime, Predictive Maintenance, Störfall-Prävention mit militärgradiger Sicherheit.',
    url: '/use-cases/critical-infrastructure',
  },
};

export default function CriticalInfrastructureUseCase() {
  const kpis = ['Zero-Downtime', '±60% weniger Ausfälle', '24/7 Überwachung'];

  const architectureSteps = [
    'Sensor Data → Echtzeit-Datenerfassung von OT/IT-Systemen',
    'Anomaly Detection → KI-gestützte Anomalie-Erkennung und -Analyse',
    'SIGMACODE AI Agent → Predictive Maintenance und Optimierung',
    'Criticality Filter → Sicherheitsbewertung und Impact-Analyse',
    'Control Systems → Sichere Steuerungsbefehle mit Validierung',
    'Audit Logging → Vollständige Nachverfolgung aller Infrastruktur-Events',
  ];

  const securityFeatures = [
    'OT/IT-Segregation nach IEC 62443 und NIST SP 800-82',
    'Zero-Trust Architecture für kritische Infrastrukturen',
    'Predictive Security Monitoring mit KI-gestützter Bedrohungserkennung',
    'Air-Gapped Deployment Option für höchste Sicherheitsstufen',
    'Incident Response Automation mit automatischen Notfallprotokollen',
    'Quantum-sichere Verschlüsselung für Langzeit-Archivierung',
    'Automatische PII-Redaction in allen Überwachungsdaten',
  ];

  const integrations = [
    {
      title: 'SCADA Systems',
      href: '/integrations/scada',
      description: 'Integration mit industriellen Steuerungssystemen',
    },
    {
      title: 'Predictive Maintenance',
      href: '/maintenance/predictive',
      description: 'KI-gestützte Wartungsplanung und -optimierung',
    },
    {
      title: 'Security Operations',
      href: '/security/soc',
      description: 'Integration mit Security Operations Centers',
    },
    {
      title: 'Audit Engine',
      href: '/audit/infrastructure',
      description: 'Vollständige Audit-Trails für alle Infrastruktur-Events',
    },
  ];

  const faq = [
    {
      question: 'Wie wird Zero-Downtime gewährleistet?',
      answer:
        'Durch redundante Systeme, automatische Failover-Mechanismen, Predictive Maintenance und KI-gestützte Störfall-Prävention.',
    },
    {
      question: 'Unterstützt ihr verschiedene Infrastruktur-Typen?',
      answer:
        'Ja, von Energieversorgung über Verkehr bis zu Wasserversorgung – mit spezifischen Modellen und Sicherheitsprofilen.',
    },
    {
      question: 'Wie funktioniert die OT/IT-Sicherheit?',
      answer:
        'Durch strenge Segregation nach IEC 62443, Zero-Trust Architecture und automatische Anomaly-Detection in Echtzeit.',
    },
    {
      question: 'Sind die Infrastrukturdaten sicher?',
      answer:
        'Ja, alle Daten werden nach BSI- und NIST-Standards verschlüsselt, sensible Informationen redigiert und nur autorisiertes Personal hat Zugriff.',
    },
    {
      question: 'Wie werden Cyber-Angriffe erkannt?',
      answer:
        'Durch KI-gestützte Anomaly-Detection, Behavioral Analysis, automatische Incident Response und Integration mit SOC-Systemen.',
    },
  ];

  return (
    <UseCaseLayout
      title="Critical Infrastructure AI"
      subtitle="Ununterbrochen & absolut sicher"
      description="Zero-Downtime KI für kritische Infrastrukturen: Predictive Maintenance, Störfall-Prävention und Echtzeit-Überwachung – mit militärgradiger Sicherheit und vollständigen Audit-Trails."
      slug="critical-infrastructure"
      kpis={kpis}
      architectureSteps={architectureSteps}
      securityFeatures={securityFeatures}
      integrations={integrations}
      faq={faq}
      indicatorStatus="warning"
    >
      <div className="space-y-6">
        <h2>Warum Critical Infrastructure mit Firewall-Sicherheit?</h2>
        <p>
          Kritische Infrastrukturen sind das Rückgrat moderner Gesellschaften und müssen höchsten
          Sicherheits- und Verfügbarkeitsanforderungen genügen. Traditionelle Infrastruktursysteme
          bieten nicht den erforderlichen Schutz für diese lebenswichtigen Anlagen. Unsere Lösung
          kombiniert Betriebseffizienz mit militärgradiger Sicherheit.
        </p>

        <h3>Kritische Features für Infrastruktur</h3>
        <ul>
          <li>
            <strong>Zero-Downtime:</strong> Automatische Failover-Mechanismen und Predictive
            Maintenance
          </li>
          <li>
            <strong>OT/IT-Segregation:</strong> Strenge Trennung nach IEC 62443 und NIST-Standards
          </li>
          <li>
            <strong>Predictive Security:</strong> KI-gestützte Bedrohungserkennung und -prävention
          </li>
          <li>
            <strong>Incident Response:</strong> Automatische Notfallprotokolle und
            Störfall-Management
          </li>
          <li>
            <strong>Audit-Fähigkeit:</strong> Vollständige Nachverfolgung aller Infrastruktur-Events
          </li>
        </ul>

        <h3>Technische Exzellenz</h3>
        <p>
          Die Lösung integriert sich in bestehende OT/IT-Landschaften und unterstützt alle gängigen
          Industriestandards. Der Shadow-Mode ermöglicht risikofreies Testing vor der
          Live-Schaltung.
        </p>

        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border-l-4 border-red-500">
          <h4 className="text-red-800 dark:text-red-200 font-semibold">Infrastruktur-Sicherheit</h4>
          <p className="text-red-700 dark:text-red-300 mt-2">
            Unsere Critical Infrastructure-Lösung ist speziell für die einzigartigen Anforderungen
            kritischer Infrastrukturen entwickelt worden. Von der automatischen OT/IT-Segregation
            bis zur Predictive Security – jede Komponente wurde mit Fokus auf maximale Sicherheit
            entwickelt.
          </p>
        </div>
      </div>
    </UseCaseLayout>
  );
}
