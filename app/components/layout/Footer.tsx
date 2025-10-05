'use client';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Bot, Github, Twitter, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  const locale = useLocale();
  const prefix = `/${locale}`;
  const withLocale = (href: string) => {
    if (/^(https?:)?\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:'))
      return href;
    if (href.startsWith(`/${locale}/`) || href === `/${locale}`) return href;
    // Root auf lokalisierte Root mappen
    if (href === '/') return prefix;
    // Hash-Links auf lokalisierte Landing mappen
    if (href.startsWith('/#')) return `${prefix}${href}`;
    return `${prefix}${href}`;
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="relative border-t backdrop-blur-sm"
      style={{
        borderColor: 'var(--border)',
        background: 'var(--gradient-subtle)',
      }}
    >
      {/* Gradient Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-electric to-transparent opacity-60" />

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-2 md:grid-cols-4">
        {/* Brand Column */}
        <div className="sm:col-span-2 md:col-span-1">
          <Link href={withLocale('/')} className="inline-flex items-center gap-2 group mb-4">
            <Bot className="w-7 h-7 text-brand-electric group-hover:text-brand-cyber transition-colors" />
            <div>
              <div className="font-bold text-lg bg-gradient-brand bg-clip-text text-transparent">
                SIGMACODE AI
              </div>
              <div className="text-xs text-muted-foreground">Quantum Neural Intelligence</div>
            </div>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Enterprise-Grade AI-Firewall für sichere, konforme und performante AI-Systeme.
          </p>
          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/sigmacode"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-muted/50 hover:bg-brand-electric/10 flex items-center justify-center text-muted-foreground hover:text-brand-electric transition-all duration-300 hover:shadow-glow-electric"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://twitter.com/sigmacode"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-muted/50 hover:bg-brand-electric/10 flex items-center justify-center text-muted-foreground hover:text-brand-electric transition-all duration-300 hover:shadow-glow-electric"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com/company/sigmacode"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-muted/50 hover:bg-brand-electric/10 flex items-center justify-center text-muted-foreground hover:text-brand-electric transition-all duration-300 hover:shadow-glow-electric"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Products Column */}
        <div>
          <div className="text-sm font-semibold mb-3 text-foreground">Produkt</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link
                href={withLocale('/firewall')}
                className="hover:text-brand-electric transition-colors"
              >
                Neural Firewall
              </Link>
            </li>
            <li>
              <Link
                href={withLocale('/agents')}
                className="hover:text-brand-electric transition-colors"
              >
                AI Agents
              </Link>
            </li>
            <li>
              <Link
                href={withLocale('/analytics')}
                className="hover:text-brand-electric transition-colors"
              >
                Analytics
              </Link>
            </li>
            <li>
              <Link
                href={withLocale('/pricing')}
                className="hover:text-brand-electric transition-colors"
              >
                Pricing
              </Link>
            </li>
          </ul>
        </div>

        {/* Resources Column */}
        <div>
          <div className="text-sm font-semibold mb-3 text-foreground">Ressourcen</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link
                href={withLocale('/docs')}
                className="hover:text-brand-electric transition-colors"
              >
                Dokumentation
              </Link>
            </li>
            <li>
              <Link
                href={withLocale('/use-cases')}
                className="hover:text-brand-electric transition-colors"
              >
                Use Cases
              </Link>
            </li>
            <li>
              <Link
                href={withLocale('/security')}
                className="hover:text-brand-electric transition-colors"
              >
                Security
              </Link>
            </li>
            <li>
              <Link
                href={withLocale('/changelog')}
                className="hover:text-brand-electric transition-colors"
              >
                Changelog
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal Column */}
        <div>
          <div className="text-sm font-semibold mb-3 text-foreground">Rechtliches</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link
                href={withLocale('/legal/impressum')}
                className="hover:text-brand-electric transition-colors"
              >
                Impressum
              </Link>
            </li>
            <li>
              <Link
                href={withLocale('/legal/datenschutz')}
                className="hover:text-brand-electric transition-colors"
              >
                Datenschutz
              </Link>
            </li>
            <li>
              <Link
                href={withLocale('/legal/agb')}
                className="hover:text-brand-electric transition-colors"
              >
                AGB
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>© {currentYear} SIGMACODE AI</span>
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-muted-foreground/40" />
            <span className="hidden sm:inline">Built with Neural Intelligence</span>
          </div>
          <Link
            href={withLocale('/contact')}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-brand text-white transition-all duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow-glow-electric"
          >
            <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Kontakt</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
