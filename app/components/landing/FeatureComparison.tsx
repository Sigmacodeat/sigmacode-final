import { featureComparison } from '@/content/landing';

export function FeatureComparison() {
  const { headers, rows, title, id } = featureComparison;
  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-14">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={i}
                className="odd:bg-white even:bg-zinc-50 dark:odd:bg-zinc-900 dark:even:bg-zinc-800/60"
              >
                {r.map((c, j) => (
                  <td key={j} className="px-4 py-3 text-zinc-800 dark:text-zinc-100">
                    {c}
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
