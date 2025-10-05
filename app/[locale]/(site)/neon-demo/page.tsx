import { GlassCard, NeonButton } from '@/components/ui';

export default function NeonDemo() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
            Neon Visual Effects Demo
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-300">
            Moderne, flüssige Animationen mit 4K-Qualität
          </p>
        </div>

        <GlassCard className="p-8" glow variant="neon">
          <h2 className="text-2xl font-semibold mb-4">Glassmorphismus mit Neon-Glow</h2>
          <p className="text-zinc-700 dark:text-zinc-300 mb-6">
            Diese Karte nutzt Glassmorphismus mit subtilen Neon-Akzenten und flüssigen
            Hover-Effekten.
          </p>
          <div className="flex gap-4">
            <NeonButton variant="neon" glow>
              Neon Button
            </NeonButton>
            <NeonButton variant="primary">Primary</NeonButton>
            <NeonButton variant="ghost">Ghost</NeonButton>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard variant="subtle">
            <h3 className="text-xl font-semibold mb-3">Subtile Effekte</h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Dezente Hintergrund-Animationen und sanfte Übergänge
            </p>
          </GlassCard>

          <GlassCard variant="default" hover={false}>
            <h3 className="text-xl font-semibold mb-3">Statische Eleganz</h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Minimalistische Schönheit ohne Hover-Effekte
            </p>
          </GlassCard>
        </div>

        <GlassCard className="p-6" variant="neon">
          <h3 className="text-xl font-semibold mb-4">Flüssige Animationen</h3>
          <div className="flex flex-wrap gap-3">
            <NeonButton variant="secondary" size="sm" pulse>
              Small
            </NeonButton>
            <NeonButton variant="primary" size="md">
              Medium
            </NeonButton>
            <NeonButton variant="neon" size="lg" glow>
              Large Glow
            </NeonButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
