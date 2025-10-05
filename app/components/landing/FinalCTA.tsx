import { finalCta } from '@/content/landing';
import Link from 'next/link';
import { NeonButton } from '@/components/ui';

export function FinalCTA() {
  return (
    <section id={finalCta.id} className="mx-auto max-w-6xl px-6 pb-24">
      <div className="rounded-2xl border border-border bg-zinc-50 p-8 text-center dark:bg-zinc-900/40">
        <h3 className="text-xl font-semibold">{finalCta.title}</h3>
        <p className="mt-2 text-zinc-600">{finalCta.sub}</p>
        <div className="mt-5 flex justify-center gap-3">
          <Link
            href={finalCta.primary.href}
            className="inline-flex"
            aria-label={finalCta.primary.label}
          >
            <NeonButton variant="accent" size="md">
              {finalCta.primary.label}
            </NeonButton>
          </Link>
          <Link
            href={finalCta.secondary.href}
            className="inline-flex"
            aria-label={finalCta.secondary.label}
          >
            <NeonButton variant="secondary" size="md">
              {finalCta.secondary.label}
            </NeonButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
