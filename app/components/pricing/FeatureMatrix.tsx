'use client';
import React from 'react';
import { pricing as pricingContent } from '@/content/landing';

export interface FeatureMatrixProps {
  headers?: string[];
  rows?: { label: string; values: (boolean | string)[] }[];
  className?: string;
  title?: string;
}

const defaultTips: Record<string, string> = {
  'Firewall Enforce': 'Blockiert Richtlinienverstöße, nicht nur beobachten',
  'Workflow Scheduler': 'Zeit-/Eventgesteuerte Ausführung von Pipelines',
  'Multi‑Agent (MAS)': 'Planner/Researcher/Executor mit geprüften Übergaben',
  'RBAC & API‑Keys': 'Rollenbasiert pro Team/Umgebung, API‑Key‑Scopes',
  'SSO/SAML': 'Single Sign‑On über bestehende Identitäten',
};

export function FeatureMatrix({
  headers = pricingContent.featureMatrix.headers,
  rows = pricingContent.featureMatrix.rows,
  className,
  title,
}: FeatureMatrixProps) {
  return (
    <section
      className={'rounded-xl border p-4 ' + (className ?? '')}
      style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
    >
      {title ? (
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{title}</h2>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] table-fixed border-collapse overflow-hidden rounded-xl text-sm">
          <thead>
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  className="border-b px-3 py-2 text-left font-semibold"
                  style={{ borderColor: 'var(--border)', color: 'var(--fg)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="align-top">
                <td
                  className="border-b px-3 py-2 font-medium"
                  style={{ borderColor: 'var(--border)' }}
                  title={defaultTips[row.label] || undefined}
                >
                  {row.label}
                </td>
                {row.values.map((v, idx) => (
                  <td
                    key={idx}
                    className="border-b px-3 py-2"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    {typeof v === 'boolean' ? (
                      v ? (
                        <span aria-label="enthalten" title="enthalten">
                          ✔︎
                        </span>
                      ) : (
                        <span aria-label="nicht enthalten" title="nicht enthalten">
                          —
                        </span>
                      )
                    ) : (
                      <span>{v}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
