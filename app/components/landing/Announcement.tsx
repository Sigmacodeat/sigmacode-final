export function Announcement() {
  return (
    <div className="w-full border-b border-zinc-200/50 bg-gradient-to-r from-zinc-50/30 to-transparent dark:border-zinc-800/50 dark:from-zinc-900/20 dark:to-transparent">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-1.5 text-xs text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
          <span>Firewall‑Powered MAS jetzt verfügbar</span>
        </div>
      </div>
    </div>
  );
}
