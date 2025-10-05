/**
 * SIGMACODE AI - Modern Landing Page
 * State-of-the-Art Design für AI-Agent-Plattform mit integrierter Firewall
 */

import Link from 'next/link';
import {
  Shield,
  Brain,
  Workflow,
  Zap,
  Lock,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import ThemedCard from '@/components/ui/ThemedCard';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />

        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '1s' }}
        />

        <div className="container relative z-10 mx-auto px-4 py-20 sm:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                Introducing AI Firewall Technology
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-up">
              Build{' '}
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Secure AI Agents
              </span>
              <br />
              with Built-in Firewall
            </h1>

            {/* Description */}
            <p
              className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-up"
              style={{ animationDelay: '0.1s' }}
            >
              Die erste AI-Agent-Plattform mit integrierter Firewall. Erstellen, deployen und
              schützen Sie Ihre Workflows mit Enterprise-Security.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up"
              style={{ animationDelay: '0.2s' }}
            >
              <Link
                href="/register"
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                <span>Jetzt starten</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              >
                <span>Login</span>
              </Link>
            </div>

            {/* Stats */}
            <div
              className="grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto animate-fade-up"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">99.9%</div>
                <div className="text-sm text-muted-foreground mt-1">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{'<'}100ms</div>
                <div className="text-sm text-muted-foreground mt-1">Firewall Latenz</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">100+</div>
                <div className="text-sm text-muted-foreground mt-1">Integrationen</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Warum <span className="text-primary">SIGMACODE AI</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Die einzige Plattform, die Leistung und Sicherheit vereint
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1: AI Firewall */}
            <ThemedCard
              tone="firewall"
              title="AI Firewall"
              description={
                'Einzigartige Sicherheitstechnologie schützt Ihre Agents vor Prompt Injection, Data Leaks und böswilligen Anfragen - in Echtzeit.'
              }
              icon={<Shield className="h-8 w-8 text-primary" />}
              showSecurity={false}
              innerClassName="p-8 h-full"
            >
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                  <span className="text-sm">Pre & Post-Check</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                  <span className="text-sm">Enforce/Shadow-Modus</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                  <span className="text-sm">Real-time Monitoring</span>
                </li>
              </ul>
            </ThemedCard>

            {/* Feature 2: Visual Workflows */}
            <ThemedCard
              tone="agents"
              title="Visual Workflows"
              description={
                'Drag-and-Drop Interface powered by Dify. Erstellen Sie komplexe AI-Workflows ohne Code - mit 50+ Built-in Tools.'
              }
              icon={<Workflow className="h-8 w-8 text-secondary" />}
              showSecurity={false}
              innerClassName="p-8 h-full"
            >
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                  <span className="text-sm">No-Code Builder</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                  <span className="text-sm">50+ Integrationen</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                  <span className="text-sm">Version Control</span>
                </li>
              </ul>
            </ThemedCard>

            {/* Feature 3: Agent Management */}
            <ThemedCard
              tone="agents"
              title="Agent Management"
              description={
                'Zentrales Dashboard für alle Ihre AI-Agents. Monitoring, Testing und Deployment in einer Plattform.'
              }
              icon={<Brain className="h-8 w-8 text-accent" />}
              showSecurity={false}
              innerClassName="p-8 h-full"
            >
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                  <span className="text-sm">Live-Testing</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                  <span className="text-sm">Performance-Metriken</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                  <span className="text-sm">API-Access</span>
                </li>
              </ul>
            </ThemedCard>

            {/* Feature 4: Enterprise Security */}
            <ThemedCard
              tone="firewall"
              title="Enterprise Security"
              description={
                'SOC2-konforme Infrastruktur mit End-to-End Encryption, Audit-Logs und RBAC für maximale Sicherheit.'
              }
              icon={<Lock className="h-8 w-8 text-destructive" />}
              showSecurity={false}
              innerClassName="p-8 h-full"
            >
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                  <span className="text-sm">End-to-End Encryption</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                  <span className="text-sm">Immutable Audit-Logs</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                  <span className="text-sm">Role-Based Access</span>
                </li>
              </ul>
            </ThemedCard>

            {/* Feature 5: Performance */}
            <ThemedCard
              tone="brand"
              title="High Performance"
              description={
                'Optimierte Infrastruktur mit Caching, Load-Balancing und globalem CDN für minimale Latenz.'
              }
              icon={<Zap className="h-8 w-8 text-warning" />}
              showSecurity={false}
              innerClassName="p-8 h-full"
            >
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                  <span className="text-sm">{'<'}100ms Firewall</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                  <span className="text-sm">Auto-Scaling</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                  <span className="text-sm">Global CDN</span>
                </li>
              </ul>
            </ThemedCard>

            {/* Feature 6: Analytics */}
            <ThemedCard
              tone="brand"
              title="Analytics & Insights"
              description={
                'Detaillierte Metriken über Agent-Performance, Firewall-Aktivität und User-Engagement.'
              }
              icon={<TrendingUp className="h-8 w-8 text-primary" />}
              showSecurity={false}
              innerClassName="p-8 h-full"
            >
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                  <span className="text-sm">Real-time Dashboard</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                  <span className="text-sm">Custom Reports</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                  <span className="text-sm">Alerting</span>
                </li>
              </ul>
            </ThemedCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-secondary rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-all" />
              <div className="relative bg-gradient-to-r from-primary via-accent to-secondary p-12 rounded-3xl text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  Bereit, sichere AI-Agents zu erstellen?
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  Starten Sie jetzt kostenlos. Keine Kreditkarte erforderlich.
                </p>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-white text-primary font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                >
                  <span>Kostenlos starten</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
