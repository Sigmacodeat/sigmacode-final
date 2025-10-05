import { chatbot } from '@/content/landing';
import { useLocale } from 'next-intl';
import Link from 'next/link';

export function Chatbot() {
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
    <section id={chatbot.id} className="mx-auto max-w-6xl px-6 py-14">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{chatbot.title}</h2>
          <p className="mt-2 text-zinc-600">{chatbot.sub}</p>
        </div>
        <Link
          href={withLocale('/chat')}
          className="hidden rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-800 md:inline-block"
        >
          Jetzt chatten
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {chatbot.points.map((p) => (
          <div key={p.title} className="rounded-xl border border-zinc-200 p-6 shadow-sm">
            <div className="text-lg font-semibold">{p.title}</div>
            <p className="mt-2 text-zinc-600">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
