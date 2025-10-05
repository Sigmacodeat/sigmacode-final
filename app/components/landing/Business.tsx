import { business } from '@/content/landing';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export function Business() {
  const locale = useLocale();
  const prefix = `/${locale}`;
  const withLocale = (href: string) => {
    if (/^(https?:)?\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:'))
      return href;
    if (href.startsWith(`/${locale}/`) || href === `/${locale}`) return href;
    if (href === '/') return prefix + '/';
    if (href.startsWith('/#')) return `${prefix}${href}`;
    return `${prefix}${href}`;
  };
  return (
    <section id={business.id} className="mx-auto max-w-6xl px-6 py-14">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{business.title}</h2>
          <p className="mt-2 text-zinc-600">{business.sub}</p>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <a
            href="#pricing"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-800"
          >
            Business Optionen
          </a>
          <Link
            href={withLocale('/security')}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-900 transition-colors hover:bg-white"
          >
            Security & Compliance
          </Link>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {business.features.map((f) => (
          <div key={f.title} className="rounded-xl border border-zinc-200 p-6 shadow-sm">
            <div className="text-lg font-semibold">{f.title}</div>
            <p className="mt-2 text-zinc-600">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
