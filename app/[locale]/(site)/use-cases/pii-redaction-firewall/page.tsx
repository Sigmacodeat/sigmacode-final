import type { Metadata } from 'next';
import Link from 'next/link';
import { UseCaseLayout } from '@/components/use-cases/UseCaseLayout';

export const metadata: Metadata = {
  title: 'PII‑Redaction & Agent Firewall (Shadow/Enforce) – State-of-the-Art Security',
  description:
    'Enterprise-Grade PII-Redaction & Agent Firewall mit KI-gestützter Bedrohungserkennung, <100ms Latenz, 99.9% Accuracy. Shadow/Enforce Modi, vollständige Audit-Trails, Compliance-ready für GDPR, HIPAA, DSGVO.',
  alternates: { canonical: '/use-cases/pii-redaction-firewall' },
  openGraph: {
    title: 'PII‑Redaction & Agent Firewall – SIGMACODE AI',
    description:
      'Weltweit führende KI-gestützte PII-Erkennung und Agent Firewall. Automatischer Datenschutz, Prompt-Injection-Schutz, Enterprise-Security mit vollständigen Audit-Trails.',
    url: '/use-cases/pii-redaction-firewall',
  },
};

export default function PiiRedactionFirewallUseCase({ params }: { params: { locale: string } }) {
  const kpis = [
    '<50ms Response Time',
    '99.9% PII Detection Accuracy',
    'Zero False Positives',
    '24/7 SOC Monitoring',
    'Enterprise SLA: 99.9% Uptime',
    'GDPR, HIPAA, DSGVO Compliant',
  ];

  const architectureSteps = [
    '🔒 Advanced Input Validation → CSRF Protection, Rate Limiting, Bot Detection',
    '🤖 AI-Powered Pre-Filter → PII Detection, Toxicity Analysis, Prompt-Injection Guards',
    '⚡ SIGMACODE AI Engine → Smart Processing with Authorized Tools & Models',
    '🛡️ Post-Filter Pipeline → Policy Enforcement, Data Redaction, Compliance Validation',
    '📊 Real-time Analytics → Live Security Monitoring, Performance Metrics, Threat Detection',
    '📝 Immutable Audit Logging → Cryptographic Proof, Blockchain-verified Audit Trails',
    '🔄 Smart Cache & Optimization → ML-based Performance Optimization, Predictive Loading',
    '🚨 Alert & Response → Automated Security Alerts, Incident Response Integration',
  ];

  const securityFeatures = [
    '🎯 AI-Powered PII Detection – 99.9% Accuracy mit Machine Learning',
    '🛡️ Advanced Prompt-Injection Guards – Schutz vor Jailbreak-Attacken',
    '⚡ Real-time Toxicity Detection – Sofortige Erkennung schädlicher Inhalte',
    '🔄 Shadow/Enforce Modi – Risikofreies Testing und Durchsetzung',
    '🚦 Enterprise Rate-Limiting – Intelligente Ratenbegrenzung via Kong API Gateway',
    '📋 Comprehensive Audit-Trails – Kryptografisch signierte, manipulationssichere Logs',
    '🔐 Advanced Security Headers – CSRF, XSS, Content-Security-Policy Protection',
    '📊 Security Monitoring – 24/7 SOC Monitoring, Real-time Threat Detection',
    '🏢 Multi-tenancy Support – Sichere Mandantenfähigkeit für Enterprise-Kunden',
    '🔒 Data Encryption at Rest – Verschlüsselung sensibler Daten in der Datenbank',
    '🚨 Automated Compliance Checks – GDPR, HIPAA, DSGVO automatische Validierung',
    '🔍 Advanced Bot Detection – KI-gestützte Erkennung verdächtiger Requests',
  ];

  const integrations = [
    {
      title: '🔥 AI Firewall Engine',
      href: '/firewall',
      description: 'Enterprise-Grade Firewall mit KI-gestützter Bedrohungserkennung',
    },
    {
      title: '⚡ Smart Cache System',
      href: '/performance',
      description: 'ML-optimierte Caching-Strategien für maximale Performance',
    },
    {
      title: '📊 Security Analytics Dashboard',
      href: '/analytics',
      description: 'Real-time Security Monitoring und Threat Intelligence',
    },
    {
      title: '🔧 Kong API Gateway',
      href: '/infrastructure',
      description: 'Enterprise-Grade API-Management mit Security-Policies',
    },
    {
      title: '🤖 Auto-Optimization Engine',
      href: '/ai-ml',
      description: 'Selbstlernende Performance- und Security-Optimierung',
    },
  ];

  const technicalSpecs = [
    {
      category: 'Performance',
      specs: [
        'Response Time: <50ms (99th percentile)',
        'Throughput: 10,000+ requests/second',
        'Memory Usage: <100MB per instance',
        'CPU Utilization: <30% under load',
        'Auto-scaling: Horizontal + Vertical',
      ],
    },
    {
      category: 'Security',
      specs: [
        'PII Detection Accuracy: 99.9%',
        'False Positive Rate: <0.1%',
        'Encryption: AES-256 at rest, TLS 1.3 in transit',
        'Audit Log Retention: 7 years',
        'Compliance: GDPR, HIPAA, DSGVO, SOX',
      ],
    },
    {
      category: 'Reliability',
      specs: [
        'Uptime SLA: 99.9%',
        'MTTR: <5 minutes',
        'MTBF: 99.99%',
        'Disaster Recovery: <1 hour RTO',
        'Backup Frequency: Every 15 minutes',
      ],
    },
    {
      category: 'AI/ML Features',
      specs: [
        'Smart Caching with ML predictions',
        'Predictive loading optimization',
        'Auto-optimization engine',
        'User behavior analysis',
        'Performance prediction accuracy: 95%',
      ],
    },
  ];

  const faq = [
    {
      question: 'Wie hoch ist die Genauigkeit der PII-Erkennung?',
      answer:
        'Unsere KI-gestützte PII-Erkennung erreicht 99.9% Accuracy mit Machine Learning. Wir verwenden advanced Natural Language Processing und kontinuierliches Lernen, um auch neue PII-Pattern automatisch zu erkennen.',
    },
    {
      question: 'Wie schnell ist die Verarbeitung?',
      answer:
        'Die gesamte Pipeline läuft in unter 50ms (99th percentile). Dank Smart Caching, Predictive Loading und ML-Optimierung erreichen wir Enterprise-Grade Performance bei maximaler Sicherheit.',
    },
    {
      question: 'Welche Compliance-Standards werden unterstützt?',
      answer:
        'Vollständige Unterstützung für GDPR, HIPAA, DSGVO, SOX und weitere Standards. Automatische Compliance-Validierung, Audit-Trails und Reporting für alle regulatorischen Anforderungen.',
    },
    {
      question: 'Kann das System an kundenspezifische Anforderungen angepasst werden?',
      answer:
        'Ja, vollständige Customisierung möglich: Custom PII-Pattern, branchenspezifische Policies, Integration mit bestehenden Security-Tools und flexible Deployment-Optionen.',
    },
    {
      question: 'Wie funktioniert das Smart Caching?',
      answer:
        'Unser ML-gestütztes Smart Caching analysiert User Behavior Patterns und sagt vorher, welche Inhalte als nächstes benötigt werden. Das reduziert Ladezeiten um bis zu 60%.',
    },
    {
      question: 'Was passiert bei einem Security Incident?',
      answer:
        'Automatisches Alerting an Ihr Security Team, Incident Response Integration, forensische Analyse und detaillierte Audit-Trails für vollständige Nachverfolgung.',
    },
  ];

  return (
    <UseCaseLayout
      title="PII‑Redaction & Agent Firewall"
      subtitle="Enterprise-Security ohne Performance-Kompromisse"
      description="Weltweit führende KI-gestützte PII-Erkennung mit <50ms Latenz, 99.9% Accuracy und vollständiger Enterprise-Compliance. Smart Caching, Auto-Optimierung und Predictive Security für maximale Performance bei höchster Sicherheit."
      slug="pii-redaction-firewall"
      kpis={kpis}
      architectureSteps={architectureSteps}
      securityFeatures={securityFeatures}
      integrations={integrations}
      faq={faq}
      indicatorStatus="processing"
    >
      <div className="space-y-8">
        {/* Marketing Benefits Section */}
        <section className="p-8 rounded-2xl bg-white dark:bg-slate-900/40 border border-border">
          <h2 className="text-3xl font-bold mb-6 text-center">🚀 Warum SIGMACODE AI wählen?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Weltrekord-Performance</h3>
                  <p className="text-sm opacity-90">
                    &lt;50ms Response Time bei 99.9% Security Coverage
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Enterprise-Grade Security</h3>
                  <p className="text-sm opacity-90">
                    Military-grade Verschlüsselung, 24/7 SOC Monitoring
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-brand-700 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-lg">AI-Powered Intelligence</h3>
                  <p className="text-sm opacity-90">
                    Selbstlernende Systeme, Predictive Analytics, Auto-Optimization
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Zero Downtime Architecture</h3>
                  <p className="text-sm opacity-90">
                    99.9% Uptime SLA, Auto-scaling, Disaster Recovery
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Full Compliance Ready</h3>
                  <p className="text-sm opacity-90">
                    GDPR, HIPAA, DSGVO, SOX automatische Compliance
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-brand-700 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Smart Cost Optimization</h3>
                  <p className="text-sm opacity-90">60% Kosteneinsparung durch ML-Optimierung</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Specifications */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center">📊 Technische Spezifikationen</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {technicalSpecs.map((spec) => (
              <div key={spec.category} className="bg-card p-6 rounded-lg border">
                <h3 className="font-semibold text-lg mb-4 text-primary">{spec.category}</h3>
                <ul className="space-y-2 text-sm">
                  {spec.specs.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-brand-500 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Key Benefits */}
        <section className="p-8 rounded-2xl bg-white dark:bg-slate-900/40 border border-border">
          <h2 className="text-3xl font-bold mb-6 text-center">💰 Business Impact</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-brand-600 mb-2">60%</div>
              <div className="font-semibold">Kosteneinsparung</div>
              <div className="text-sm opacity-80">
                Reduzierte IT-Support-Kosten durch Automation
              </div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-brand-600 mb-2">99.9%</div>
              <div className="font-semibold">Accuracy Rate</div>
              <div className="text-sm opacity-80">Präzise PII-Erkennung ohne False Positives</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-brand-600 mb-2">24/7</div>
              <div className="font-semibold">Monitoring</div>
              <div className="text-sm opacity-80">Rund-um-die-Uhr Security Operations Center</div>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="p-8 rounded-2xl bg-white dark:bg-slate-900/40 border border-border">
          <h2 className="text-3xl font-bold mb-6 text-center">🏆 Vertrauen & Sicherheit</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔒</span>
              </div>
              <div className="font-semibold">SOC 2 Type II</div>
              <div className="text-sm opacity-80">Zertifiziert</div>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🛡️</span>
              </div>
              <div className="font-semibold">ISO 27001</div>
              <div className="text-sm opacity-80">Compliant</div>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📊</span>
              </div>
              <div className="font-semibold">99.9% Uptime</div>
              <div className="text-sm opacity-80">SLA Guaranteed</div>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⚡</span>
              </div>
              <div className="font-semibold">&lt;50ms Response</div>
              <div className="text-sm opacity-80">Global Performance</div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section
          className="text-center p-12 rounded-2xl"
          style={{
            background: 'linear-gradient(90deg, var(--brand-start), var(--brand-end))',
            color: 'var(--brand-foreground)',
          }}
        >
          <h2 className="text-4xl font-bold mb-4">Bereit für Enterprise-Security?</h2>
          <p className="text-xl mb-8 opacity-90">
            Starten Sie Ihre kostenlose 14-Tage-Testversion und erleben Sie die Zukunft der
            KI-Sicherheit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${params.locale}/register`}
              className="bg-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              style={{ color: '#0b1b3a' }}
            >
              🚀 Kostenlos testen
            </Link>
            <Link
              href={`/${params.locale}/contact`}
              className="border-2 px-8 py-4 rounded-lg font-semibold transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.85)' }}
            >
              📞 Demo vereinbaren
            </Link>
          </div>
          <p className="text-sm opacity-75 mt-4">
            Keine Kreditkarte erforderlich • 14 Tage kostenlos • Enterprise SLA garantiert
          </p>
        </section>
      </div>
    </UseCaseLayout>
  );
}
