'use client';

import React, { useEffect, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

// Eine leichte, eigenständige, interaktive Demo des Drag&Drop-Workflow-Feelings
// - Simulierter Cursor, der einen Block aus einer Sidebar in die Canvas zieht
// - Verbindungslinie, die entsteht
// - Leichter Zoom/Parallax-Effekt
// - Loopende Sequenz für dauerhafte Demo

const dot = {
  width: 10,
  height: 10,
  borderRadius: 9999,
};

export default function WorkflowHeroDemo() {
  const cursor = useAnimationControls();
  const nodeA = useAnimationControls();
  const nodeB = useAnimationControls();
  const edge = useAnimationControls();
  const canvas = useAnimationControls();

  // Phase 1: sicherstellen, dass alle Motion-Elemente gemountet und subscribed sind
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // In einen Frame verzögern, damit subscriptions garantiert stehen
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Phase 2: Animationsschleife erst starten, wenn ready == true
  useEffect(() => {
    if (!ready) return;

    let isCanceled = false;

    async function run() {
      while (!isCanceled) {
        // Reset states
        await Promise.all([
          nodeA.start({ x: 0, y: 0, opacity: 1, scale: 1, transition: { duration: 0 } }),
          nodeB.start({ x: 240, y: 120, opacity: 1, scale: 1, transition: { duration: 0 } }),
          edge.start({ pathLength: 0, opacity: 0, transition: { duration: 0 } }),
          cursor.start({ x: 12, y: 40, transition: { duration: 0 } }),
          canvas.start({ scale: 1, transition: { duration: 0 } }),
        ]);

        // Cursor fährt zur Palette (links)
        await cursor.start({ x: 24, y: 80, transition: { duration: 0.5, ease: 'easeInOut' } });

        // Cursor "greift" Node aus Palette und zieht auf die Canvas
        await Promise.all([
          cursor.start({ x: 160, y: 110, transition: { duration: 0.9, ease: 'easeInOut' } }),
          canvas.start({ scale: 1.02, transition: { duration: 0.9, ease: 'easeInOut' } }),
          nodeA.start({ x: 120, y: 60, transition: { duration: 0.9, ease: 'easeInOut' } }),
        ]);

        // Leichter Zoom-/Parallax-Effekt
        await canvas.start({ scale: 1.05, transition: { duration: 0.5, ease: 'easeOut' } });

        // Cursor bewegt sich Richtung Node B und verbindet (Edge zeichnet)
        await Promise.all([
          cursor.start({ x: 300, y: 160, transition: { duration: 0.9, ease: 'easeInOut' } }),
          edge.start({
            opacity: 1,
            pathLength: 1,
            transition: { duration: 0.9, ease: 'easeInOut' },
          }),
        ]);

        // Subtile Bestätigung: Node B pulsiert
        await nodeB.start({ scale: 1.06, transition: { duration: 0.15 } });
        await nodeB.start({ scale: 1, transition: { duration: 0.25 } });

        // Cursor fährt weg, Canvas entspannt
        await Promise.all([
          cursor.start({ x: 340, y: 40, transition: { duration: 0.7, ease: 'easeInOut' } }),
          canvas.start({ scale: 1.0, transition: { duration: 0.7, ease: 'easeInOut' } }),
        ]);

        // kleine Pause
        await new Promise((r) => setTimeout(r, 900));
      }
    }

    run();
    return () => {
      isCanceled = true;
    };
  }, [ready, cursor, nodeA, nodeB, edge, canvas]);

  return (
    <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-[radial-gradient(circle_at_20%_-10%,rgba(0,246,255,0.15),transparent_50%),radial-gradient(circle_at_120%_120%,rgba(10,31,68,0.4),transparent_40%)] p-4 shadow-sm">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="text-sm font-medium text-zinc-600">Drag & Drop Demo</div>
        <div className="flex gap-1">
          <span className="block h-2 w-2 rounded-full bg-red-400" />
          <span className="block h-2 w-2 rounded-full bg-yellow-400" />
          <span className="block h-2 w-2 rounded-full bg-green-400" />
        </div>
      </div>

      <motion.div className="relative flex h-[360px] w-full gap-3" animate={canvas}>
        {/* Palette */}
        <div className="relative z-10 h-full w-40 rounded-xl border border-border bg-white/70 p-3 backdrop-blur">
          <div className="mb-2 text-xs font-semibold text-zinc-500">Blocks</div>
          <div className="space-y-2">
            <div className="rounded-lg border border-border bg-white p-3 text-xs font-medium shadow">
              Prompt
            </div>
            <div className="rounded-lg border border-border bg-white p-3 text-xs font-medium shadow">
              Tool
            </div>
            <div className="rounded-lg border border-border bg-white p-3 text-xs font-medium shadow">
              Policy
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="relative h-full flex-1 overflow-hidden rounded-xl border border-border bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02),transparent_60%)]">
          {/* Verbindung als SVG */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 800 360"
            fill="none"
          >
            <motion.path
              d="M 260 140 C 320 120, 360 140, 500 180"
              stroke="var(--brand, #00F6FF)"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={edge}
            />
          </svg>

          {/* Node A */}
          <motion.div
            className="absolute left-10 top-10 rounded-xl border border-border bg-white/90 p-4 shadow backdrop-blur"
            style={{ width: 160 }}
            animate={nodeA}
          >
            <div className="text-sm font-semibold">Prompt</div>
            <div className="mt-2 h-2 w-24 rounded bg-zinc-200" />
            <div className="mt-1 h-2 w-36 rounded bg-zinc-200" />
          </motion.div>

          {/* Node B */}
          <motion.div
            className="absolute left-[420px] top-[160px] rounded-xl border border-border bg-white/90 p-4 shadow backdrop-blur"
            style={{ width: 180 }}
            animate={nodeB}
          >
            <div className="text-sm font-semibold">Tool</div>
            <div className="mt-2 h-2 w-28 rounded bg-zinc-200" />
            <div className="mt-1 h-2 w-40 rounded bg-zinc-200" />
          </motion.div>

          {/* Cursor */}
          <motion.div className="pointer-events-none absolute z-20" animate={cursor}>
            <div className="relative" style={{ transform: 'translate(-6px, -6px)' }}>
              <div style={dot} className="bg-zinc-900 shadow-[0_0_0_3px_rgba(255,255,255,0.7)]" />
              <div className="absolute -left-2 -top-2 h-5 w-5 animate-ping rounded-full bg-[var(--brand,#00F6FF)]/40" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer Mini-Legende */}
      <div className="mt-3 grid gap-2 text-xs text-zinc-600 md:grid-cols-3">
        <div>
          <span className="font-medium">Interaktion:</span> Drag & Connect mit sanften Transitions
        </div>
        <div>
          <span className="font-medium">Zoom:</span> Subtiles Parallax für Tiefe
        </div>
        <div>
          <span className="font-medium">Branding:</span> Akzentfarbe & Glow über var(--brand)
        </div>
      </div>
    </div>
  );
}
