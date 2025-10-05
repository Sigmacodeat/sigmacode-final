import { faq } from '@/content/landing';
import {
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
  AwaitedReactNode,
  Key,
} from 'react';

export function FAQ() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="text-2xl font-bold">{faq.title}</h2>
      <div className="mt-6 divide-y divide-border rounded-xl border border-border">
        {faq.items.map(
          (
            f: {
              q:
                | string
                | number
                | bigint
                | boolean
                | ReactElement<any, string | JSXElementConstructor<any>>
                | Iterable<ReactNode>
                | ReactPortal
                | Promise<AwaitedReactNode>
                | null
                | undefined;
              a:
                | string
                | number
                | bigint
                | boolean
                | ReactElement<any, string | JSXElementConstructor<any>>
                | Iterable<ReactNode>
                | ReactPortal
                | Promise<AwaitedReactNode>
                | null
                | undefined;
            },
            i: Key | null | undefined,
          ) => (
            <details key={i} className="group p-5">
              <summary className="cursor-pointer list-none font-medium text-zinc-900">
                {f.q}
                <span className="ml-2 text-zinc-400 group-open:hidden">+</span>
                <span className="ml-2 text-zinc-400 hidden group-open:inline">−</span>
              </summary>
              <p className="mt-2 text-zinc-600">{f.a}</p>
            </details>
          ),
        )}
      </div>
    </section>
  );
}
