'use client';
import React from 'react';
import { useLocale } from 'next-intl';
import { pricing as pricingContent } from '@/content/landing';

export interface AddOnsTableProps {
  title?: string;
  headers?: string[];
  items?: { label: string; price: string }[];
  note?: string;
  className?: string;
}

export function AddOnsTable({
  title,
  headers,
  items = pricingContent.addOns?.items ?? [],
  note = pricingContent.addOns?.note,
  className,
}: AddOnsTableProps) {
  const locale = useLocale();
  const localTitle =
    title ?? pricingContent.addOns?.title ?? (locale === 'de' ? 'Add-ons' : 'Add-ons');
  const localHeaders =
    headers ??
    pricingContent.addOns?.headers ??
    (locale === 'de' ? ['Add-on', 'Preis'] : ['Add-on', 'Price']);
  if (!items?.length) return null;
  return (
    <section
      className={'rounded-xl border p-4 ' + (className ?? '')}
      style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
    >
      {localTitle ? (
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{localTitle}</h2>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] table-fixed border-collapse overflow-hidden rounded-xl text-sm">
          <thead>
            <tr>
              {localHeaders.map((h) => (
                <th
                  key={h}
                  className="border-b bg-[color:var(--muted)]/30 px-3 py-2 text-left font-semibold"
                  style={{ borderColor: 'var(--border)', color: 'var(--fg)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.label}>
                <td className="border-b px-3 py-2" style={{ borderColor: 'var(--border)' }}>
                  {it.label}
                </td>
                <td
                  className="border-b px-3 py-2 text-right"
                  style={{ borderColor: 'var(--border)', fontVariantNumeric: 'tabular-nums' }}
                >
                  {it.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note ? <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{note}</p> : null}
    </section>
  );
}
