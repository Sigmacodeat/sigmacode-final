'use client';

import React from 'react';

export type ParsedToolCall = {
  name?: string;
  args?: Record<string, any> | string;
  result?: any;
  status?: string;
  raw: string;
};

function tryParseJson(str: string): any | null {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

/**
 * parseToolCalls
 * Heuristik: extrahiert Code-Fences mit json/tool und versucht JSON zu parsen
 */
export function parseToolCalls(content: string): ParsedToolCall[] {
  const matches = [...content.matchAll(/```(json|tool)\n([\s\S]*?)```/g)];
  const items: ParsedToolCall[] = [];
  for (const m of matches) {
    const rawBlock = m[2].trim();
    const obj = tryParseJson(rawBlock);
    if (obj && (obj.tool || obj.name || obj.function)) {
      items.push({
        name: obj.tool || obj.name || obj.function,
        args: obj.args || obj.parameters || obj.input || {},
        result: obj.result || obj.output,
        status: obj.status,
        raw: rawBlock,
      });
    } else {
      items.push({ raw: rawBlock });
    }
  }
  return items;
}

export default function ToolCallRenderer({
  content,
  onApprove,
  onReject,
}: {
  content: string;
  onApprove?: (tool: { name?: string; args?: any }) => void;
  onReject?: (tool: { name?: string; args?: any }) => void;
}) {
  const calls = parseToolCalls(content);
  if (!calls.length) return null;

  return (
    <div className="mt-3 space-y-2">
      {calls.map((c, idx) => (
        <div
          key={idx}
          className="rounded border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 p-3"
        >
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
            Tool Call {c.name ? `– ${c.name}` : ''}
          </div>
          {c.status && <div className="text-[11px] text-slate-500 mb-1">Status: {c.status}</div>}
          {c.args && (
            <pre className="text-[11px] overflow-x-auto whitespace-pre-wrap text-slate-700 dark:text-slate-300">
              <code>{typeof c.args === 'string' ? c.args : JSON.stringify(c.args, null, 2)}</code>
            </pre>
          )}
          {typeof c.result !== 'undefined' && (
            <div className="mt-2">
              <div className="text-[11px] text-slate-500">Result:</div>
              <pre className="text-[11px] overflow-x-auto whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                <code>
                  {typeof c.result === 'string' ? c.result : JSON.stringify(c.result, null, 2)}
                </code>
              </pre>
            </div>
          )}
          {!c.name && !c.args && typeof c.result === 'undefined' && (
            <pre className="text-[11px] overflow-x-auto whitespace-pre-wrap text-slate-700 dark:text-slate-300">
              <code>{c.raw}</code>
            </pre>
          )}
          {(onApprove || onReject) && (
            <div className="mt-2 flex gap-2">
              {onApprove && (
                <button
                  className="rounded border border-green-300 px-2 py-1 text-xs text-green-700 hover:bg-green-50"
                  onClick={() => onApprove?.({ name: c.name, args: c.args })}
                >
                  Approve
                </button>
              )}
              {onReject && (
                <button
                  className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                  onClick={() => onReject?.({ name: c.name, args: c.args })}
                >
                  Reject
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
