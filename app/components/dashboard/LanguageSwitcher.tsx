'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe, Check } from 'lucide-react';

const languages = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

export function LanguageSwitcher() {
  const t = useTranslations('common');
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLocale: string) => {
    // Sicherstellen, dass pathname nicht null ist
    const basePath = pathname ?? '';
    const newPath = basePath
      ? basePath.replace(`/${currentLocale}`, `/${newLocale}`)
      : `/${newLocale}`;
    router.push(newPath);
  };

  return (
    <div className="relative group">
      <button
        type="button"
        className="inline-flex items-center gap-2 h-9 px-3 rounded-md border bg-background hover:bg-accent hover:text-accent-foreground text-sm"
        aria-haspopup="listbox"
        aria-label={t('language') ?? 'Language'}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">
          {languages.find((lang) => lang.code === currentLocale)?.flag}
        </span>
        <span className="text-sm">
          {languages.find((lang) => lang.code === currentLocale)?.name || currentLocale}
        </span>
      </button>

      {/* Simple dropdown without complex components */}
      <div className="absolute top-full left-0 mt-1 bg-popover border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-50 min-w-[200px]">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => switchLanguage(language.code)}
            className={`w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 ${
              currentLocale === language.code ? 'bg-accent' : ''
            }`}
            role="option"
            aria-selected={currentLocale === language.code}
          >
            <span>{language.flag}</span>
            <span className="flex-1">{language.name}</span>
            {currentLocale === language.code && <Check className="h-3 w-3" />}
          </button>
        ))}
      </div>
    </div>
  );
}
