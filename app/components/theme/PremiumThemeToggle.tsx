'use client';

import { useEffect, useState } from 'react';
import { Palette, Monitor, Sun, Moon, Zap, Building2, Crown } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system' | 'cyberpunk' | 'corporate' | 'luxury';

interface ThemeOption {
  id: Theme;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const themes: ThemeOption[] = [
  {
    id: 'light',
    name: 'Classic Light',
    icon: <Sun className="h-4 w-4" />,
    description: 'Clean and professional',
  },
  {
    id: 'dark',
    name: 'Classic Dark',
    icon: <Moon className="h-4 w-4" />,
    description: 'Elegant dark mode',
  },
  {
    id: 'system',
    name: 'System',
    icon: <Monitor className="h-4 w-4" />,
    description: 'Follows OS preference',
  },
  {
    id: 'cyberpunk',
    name: 'Neon Cyberpunk',
    icon: <Zap className="h-4 w-4" />,
    description: 'Futuristic neon aesthetics',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    icon: <Building2 className="h-4 w-4" />,
    description: 'Professional enterprise',
  },
  {
    id: 'luxury',
    name: 'Luxury Gold',
    icon: <Crown className="h-4 w-4" />,
    description: 'Premium gold accents',
  },
];

export function PremiumThemeToggle() {
  const [currentTheme, setCurrentTheme] = useState<Theme>('system');
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    // Load saved theme
    const saved = localStorage.getItem('theme') as Theme;
    if (saved && themes.some((t) => t.id === saved)) {
      setCurrentTheme(saved);
      applyTheme(saved);
    }
  }, []);

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;

    // Remove all theme classes
    root.removeAttribute('data-theme');
    root.classList.remove('dark');

    // Apply system theme detection
    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) {
        root.classList.add('dark');
      }
    } else if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'cyberpunk' || theme === 'corporate' || theme === 'luxury') {
      root.setAttribute('data-theme', theme);
      // Apply appropriate base theme
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) {
        root.classList.add('dark');
      }
    }

    localStorage.setItem('theme', theme);
  };

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
    setShowSelector(false);
  };

  const getCurrentThemeInfo = () => {
    return themes.find((t) => t.id === currentTheme) || themes[2]; // fallback to system
  };

  const currentThemeInfo = getCurrentThemeInfo();

  return (
    <div className="relative">
      {/* Theme Toggle Button */}
      <button
        onClick={() => setShowSelector(!showSelector)}
        aria-label="Theme auswählen"
        className="inline-flex items-center gap-3 rounded-xl border border-zinc-300 bg-white/70 px-4 py-2 text-sm text-zinc-700 shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-white/90 hover:shadow-md dark:border-zinc-600 dark:bg-zinc-800/70 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        <Palette className="h-4 w-4" />
        <span className="hidden sm:inline">{currentThemeInfo.name}</span>
        <div className="h-2 w-2 rounded-full bg-current opacity-60" />
      </button>

      {/* Theme Selector Dropdown */}
      {showSelector && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setShowSelector(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-zinc-200 bg-white/95 p-2 shadow-xl backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-800/95">
            <div className="mb-2 border-b border-zinc-200 pb-2 dark:border-zinc-700">
              <h3 className="px-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Theme auswählen
              </h3>
            </div>

            <div className="space-y-1">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-all duration-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 ${
                    currentTheme === theme.id
                      ? 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
                      : 'text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {theme.icon}
                    <div>
                      <div className="font-medium">{theme.name}</div>
                      <div className="text-xs opacity-75">{theme.description}</div>
                    </div>
                    {currentTheme === theme.id && (
                      <div className="ml-auto h-2 w-2 rounded-full bg-violet-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Preview Hint */}
            <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              <p className="font-medium mb-1">💡 Tipp:</p>
              <p>
                Die Themen bieten verschiedene Stile für unterschiedliche Anwendungsfälle - von
                professionell bis futuristisch.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Theme Preview Component
export function ThemePreview({ theme }: { theme: ThemeOption }) {
  return (
    <div
      className={`rounded-lg border p-4 transition-all duration-300 hover:scale-105 ${getThemeClasses(theme.id)}`}
    >
      <div className="flex items-center gap-2 mb-3">
        {theme.icon}
        <span className="font-semibold">{theme.name}</span>
      </div>
      <div className="space-y-2">
        <div className="h-2 w-full rounded-full bg-current opacity-20" />
        <div className="h-2 w-3/4 rounded-full bg-current opacity-40" />
        <div className="h-2 w-1/2 rounded-full bg-current opacity-60" />
      </div>
    </div>
  );
}

function getThemeClasses(theme: Theme): string {
  const classes = {
    light: 'bg-white border-zinc-200 text-zinc-900',
    dark: 'bg-zinc-900 border-zinc-700 text-zinc-100',
    system:
      'bg-gradient-to-br from-zinc-100 to-zinc-200 border-zinc-300 text-zinc-800 dark:from-zinc-800 dark:to-zinc-900 dark:border-zinc-600 dark:text-zinc-200',
    cyberpunk: 'bg-black border-cyan-500 text-cyan-400',
    corporate:
      'bg-slate-50 border-slate-300 text-slate-800 dark:bg-slate-900 dark:border-slate-600 dark:text-slate-200',
    luxury:
      'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300 text-yellow-900 dark:from-yellow-900 dark:to-black dark:border-yellow-600 dark:text-yellow-400',
  };
  return classes[theme] || classes.system;
}
