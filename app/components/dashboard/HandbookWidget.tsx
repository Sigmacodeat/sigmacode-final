'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  BookOpen,
  ExternalLink,
  HelpCircle,
  Search,
  Bot,
  Navigation,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Tooltip } from '@/components/ui/handbook/HandbookComponents';
import { knowledgeBase, searchKnowledge, KnowledgeEntry } from '@/app/lib/knowledge-base';

interface HandbookWidgetProps {
  className?: string;
}

export function HandbookWidget({ className = '' }: HandbookWidgetProps) {
  const t = useTranslations('dashboard.handbook');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<KnowledgeEntry[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = searchKnowledge(query);
      setSearchResults(results.slice(0, 5)); // Top 5 Ergebnisse
    } else {
      setSearchResults([]);
    }
  };

  const navigateToPage = (path: string) => {
    window.location.href = path;
  };

  return (
    <div
      className={`relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 p-6 overflow-hidden shadow-lg ${className}`}
    >
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utb3BhY2l0eT0iMC4xIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] text-blue-600 dark:text-blue-400" />
      </div>

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg flex-shrink-0">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100">
                {t('needHelp')}
              </h3>
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-4 leading-relaxed">
              {t('learnHow')}
            </p>

            {/* Premium Schnellsuche */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                <input
                  type="text"
                  placeholder={t('searchHelp')}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-blue-200 dark:border-blue-800 rounded-xl text-sm bg-white/50 dark:bg-blue-950/30 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-blue-400 dark:placeholder:text-blue-600"
                />
              </div>

              {/* Premium Suchergebnisse */}
              {searchResults.length > 0 && (
                <div className="mt-3 bg-white dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl shadow-2xl max-h-64 overflow-y-auto backdrop-blur-xl">
                  {searchResults.map((result, index) => (
                    <div
                      key={result.id}
                      className="p-4 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer border-b border-blue-100 dark:border-blue-900 last:border-b-0 transition-colors"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                        {result.title}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                        {result.content}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-medium ${
                            result.category === 'dashboard'
                              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'
                              : result.category === 'agents'
                                ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                                : result.category === 'firewall'
                                  ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                          }`}
                        >
                          {result.category}
                        </span>
                        {result.relatedPages && result.relatedPages.length > 0 && (
                          <button
                            onClick={() => navigateToPage(result.relatedPages![0])}
                            className="group flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                          >
                            <Navigation className="h-3 w-3" />
                            Zur Seite
                            <span className="group-hover:translate-x-0.5 transition-transform inline-block">
                              {t('goToPage')}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Tooltip content="Vollständiges Benutzerhandbuch öffnen">
                <a
                  href="/handbook"
                  className="group inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <BookOpen className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  {t('openHandbook')}
                </a>
              </Tooltip>

              <Tooltip content="Schnelle Tipps und Tricks">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="group inline-flex items-center gap-2 px-4 py-2.5 border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-sm font-semibold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Bot className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  {t('aiAssistant')}
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        <Tooltip content="Handbuch in neuem Tab öffnen">
          <a
            href="/handbook"
            target="_blank"
            rel="noopener noreferrer"
            className="group p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900 transition-all hover:scale-110 flex-shrink-0"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
        </Tooltip>
      </div>
    </div>
  );
}

// Quick tip component for inline help
interface QuickTipProps {
  title: string;
  content: string;
  icon?: React.ReactNode;
}

export function QuickTip({ title, content, icon }: QuickTipProps) {
  return (
    <Tooltip content={content}>
      <div className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-sm text-gray-700 cursor-help">
        {icon || <HelpCircle className="h-3 w-3 mr-1" />}
        {title}
      </div>
    </Tooltip>
  );
}
