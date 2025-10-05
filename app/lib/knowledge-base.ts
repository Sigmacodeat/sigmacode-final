/**
 * SIGMACODE AI - Knowledge Base
 *
 * Zentrale Wissensdatenbank mit allen Tipps, Anleitungen und Informationen
 * für das Chatbot-Widget und Info-Panels
 */

export interface KnowledgeEntry {
  id: string;
  category: 'dashboard' | 'agents' | 'workflows' | 'firewall' | 'tools' | 'blog' | 'general';
  title: string;
  content: string;
  tags: string[];
  relatedPages?: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface KnowledgeSection {
  id: string;
  title: string;
  description: string;
  entries: KnowledgeEntry[];
}

export const knowledgeBase: KnowledgeSection[] = [
  {
    id: 'dashboard',
    title: 'Dashboard & Übersicht',
    description: 'Informationen zur Dashboard-Nutzung und Metriken',
    entries: [
      {
        id: 'dashboard-overview',
        category: 'dashboard',
        title: 'Dashboard Übersicht',
        content:
          'Das Dashboard zeigt dir alle wichtigen Metriken auf einen Blick: Anzahl der Agents, Workflows, Ausführungen und Firewall-Blockierungen. Die Widgets sind interaktiv und geben dir schnellen Zugriff auf alle Bereiche der Anwendung.',
        tags: ['dashboard', 'metriken', 'übersicht'],
        relatedPages: ['/dashboard'],
        priority: 'high',
      },
      {
        id: 'dashboard-navigation',
        category: 'dashboard',
        title: 'Navigation im Dashboard',
        content:
          'Verwende die Schnellaktionen, um neue Agents oder Workflows zu erstellen. Die Breadcrumb-Navigation hilft dir, deinen aktuellen Standort zu verstehen. Alle Hauptbereiche sind über die Sidebar erreichbar.',
        tags: ['navigation', 'schnellaktionen', 'sidebar'],
        relatedPages: ['/dashboard', '/dashboard/agents/new', '/dashboard/workflows/new'],
        priority: 'medium',
      },
      {
        id: 'dashboard-handbook',
        category: 'dashboard',
        title: 'Handbuch-Widget',
        content:
          'Das Handbuch-Widget auf dem Dashboard gibt dir direkten Zugriff auf alle Anleitungen und Hilfestellungen. Hier findest du Schritt-für-Schritt-Anleitungen für alle wichtigen Funktionen.',
        tags: ['handbuch', 'hilfe', 'anleitungen'],
        relatedPages: ['/handbook'],
        priority: 'high',
      },
    ],
  },
  {
    id: 'agents',
    title: 'Agents & KI-Modelle',
    description: 'Erstellung und Verwaltung von KI-Agents',
    entries: [
      {
        id: 'agent-creation',
        category: 'agents',
        title: 'Agent erstellen',
        content:
          'Bei der Agent-Erstellung wählst du zunächst den Anbietertyp (z.B. OpenAI, Anthropic). Dann vergibst du einen Namen und eine Beschreibung. Wichtig: Aktiviere die Firewall-Option, um deine Agents zu schützen.',
        tags: ['agent', 'erstellen', 'firewall', 'anbieter'],
        relatedPages: ['/dashboard/agents/new'],
        priority: 'high',
      },
      {
        id: 'agent-firewall',
        category: 'agents',
        title: 'Firewall für Agents',
        content:
          'Jeder Agent sollte mit Firewall-Schutz konfiguriert werden. Wähle "Firewall aktivieren" und bestimme den Schutzmodus (Shadow für Tests, Enforce für Produktion).',
        tags: ['firewall', 'schutz', 'agent', 'sicherheit'],
        relatedPages: ['/dashboard/firewall'],
        priority: 'high',
      },
      {
        id: 'agent-tools',
        category: 'agents',
        title: 'Tools für Agents',
        content:
          'Agents können verschiedene Tools nutzen wie Datenbankzugriff, API-Calls oder externe Dienste. Wähle die benötigten Tools sorgfältig aus und teste sie vor der Veröffentlichung.',
        tags: ['tools', 'api', 'datenbank', 'externe-dienste'],
        relatedPages: ['/dashboard/tools'],
        priority: 'medium',
      },
    ],
  },
  {
    id: 'workflows',
    title: 'Workflows & Automation',
    description: 'Erstellung und Verwaltung von automatisierten Workflows',
    entries: [
      {
        id: 'workflow-types',
        category: 'workflows',
        title: 'Workflow-Typen',
        content:
          'Es gibt verschiedene Workflow-Typen: Chatbot für interaktive Gespräche, Completion für Textgenerierung und komplexe Workflows für mehrstufige Prozesse. Wähle den passenden Typ für deinen Anwendungsfall.',
        tags: ['workflow', 'typen', 'chatbot', 'completion'],
        relatedPages: ['/dashboard/workflows/new'],
        priority: 'high',
      },
      {
        id: 'workflow-steps',
        category: 'workflows',
        title: 'Workflow-Schritte',
        content:
          'Baue Workflows schrittweise auf: Beginne mit der Dateneingabe, füge Verarbeitungsschritte hinzu und definiere die Ausgabe. Teste jeden Schritt einzeln, bevor du den gesamten Workflow aktivierst.',
        tags: ['workflow', 'schritte', 'testen', 'aufbau'],
        relatedPages: ['/dashboard/workflows'],
        priority: 'medium',
      },
    ],
  },
  {
    id: 'firewall',
    title: 'Firewall & Sicherheit',
    description: 'Sicherheitsrichtlinien und Zugriffskontrolle',
    entries: [
      {
        id: 'firewall-policies',
        category: 'firewall',
        title: 'Firewall-Policies',
        content:
          'Policies definieren die Sicherheitsregeln für deine Anwendung. Erstelle spezifische Policies für verschiedene Anwendungsfälle und teste sie zunächst im Shadow-Modus, bevor du sie aktivierst.',
        tags: ['firewall', 'policies', 'sicherheit', 'shadow'],
        relatedPages: ['/dashboard/firewall/policies'],
        priority: 'high',
      },
      {
        id: 'firewall-bindings',
        category: 'firewall',
        title: 'Route-Bindings',
        content:
          'Bindings verbinden Policies mit API-Routen. Wähle eine Policy, definiere den Route-Prefix (z.B. /api/dify) und aktiviere das Binding. Teste zunächst im Shadow-Modus.',
        tags: ['bindings', 'routes', 'api', 'prefix'],
        relatedPages: ['/dashboard/firewall/bindings'],
        priority: 'high',
      },
      {
        id: 'firewall-shadow-enforce',
        category: 'firewall',
        title: 'Shadow vs. Enforce',
        content:
          'Shadow-Modus: Prüft Anfragen, blockiert nicht - ideal zum Testen. Enforce-Modus: Blockiert entsprechend der Policy - für Produktion nach erfolgreichen Tests.',
        tags: ['shadow', 'enforce', 'testen', 'produktion'],
        relatedPages: ['/dashboard/firewall'],
        priority: 'high',
      },
    ],
  },
  {
    id: 'tools',
    title: 'Tools & Integrationen',
    description: 'Verfügbare Tools und externe Dienste',
    entries: [
      {
        id: 'tools-categories',
        category: 'tools',
        title: 'Tool-Kategorien',
        content:
          'Tools sind nach Kategorien sortiert: Datenbank, API, Suche, etc. Wähle eine Kategorie, um passende Tools zu finden. Einige Tools erfordern API-Keys oder spezielle Berechtigungen.',
        tags: ['tools', 'kategorien', 'api-keys', 'berechtigungen'],
        relatedPages: ['/dashboard/tools'],
        priority: 'medium',
      },
      {
        id: 'tools-auth',
        category: 'tools',
        title: 'Tool-Authentifizierung',
        content:
          'Viele Tools benötigen API-Keys oder OAuth-Konfiguration. Überprüfe die Dokumentation des jeweiligen Tools und teste die Verbindung vor der Verwendung in Produktionsumgebungen.',
        tags: ['authentifizierung', 'api-keys', 'oauth', 'testen'],
        relatedPages: ['/dashboard/tools'],
        priority: 'medium',
      },
    ],
  },
  {
    id: 'blog',
    title: 'Blog & Content',
    description: 'Content-Management und Blog-Funktionen',
    entries: [
      {
        id: 'blog-posting',
        category: 'blog',
        title: 'Blog-Posts erstellen',
        content:
          'Erstelle ansprechende Blog-Posts mit Titel, Inhalt und Featured Image. Nutze die Kategorie- und Tag-Funktionen für bessere Organisation. Aktiviere Kommentare für Community-Interaktion.',
        tags: ['blog', 'posts', 'bilder', 'kategorien', 'tags'],
        relatedPages: ['/admin/blog'],
        priority: 'medium',
      },
      {
        id: 'blog-seo',
        category: 'blog',
        title: 'SEO für Blog-Posts',
        content:
          'Optimiere deine Blog-Posts für Suchmaschinen: Verwende aussagekräftige Titel, beschreibende Alt-Texte für Bilder und relevante Tags. Featured Images verbessern das Erscheinungsbild in Social Media.',
        tags: ['seo', 'titel', 'bilder', 'tags', 'social-media'],
        relatedPages: ['/admin/blog'],
        priority: 'low',
      },
    ],
  },
  {
    id: 'general',
    title: 'Allgemeine Hilfe',
    description: 'Grundlegende Informationen und Troubleshooting',
    entries: [
      {
        id: 'getting-started',
        category: 'general',
        title: 'Erste Schritte',
        content:
          'Beginne mit der Dashboard-Übersicht, um alle Bereiche kennenzulernen. Erstelle deinen ersten Agent mit Firewall-Schutz und teste ihn gründlich, bevor du ihn produktiv einsetzt.',
        tags: ['erste-schritte', 'agent', 'testen', 'produktion'],
        relatedPages: ['/dashboard', '/handbook'],
        priority: 'high',
      },
      {
        id: 'troubleshooting',
        category: 'general',
        title: 'Problemlösung',
        content:
          'Bei Problemen prüfe zunächst die Firewall-Logs und die Dashboard-Metriken. Das Handbuch enthält detaillierte Anleitungen für alle Funktionen. Kontaktiere den Support nur, wenn du die Lösung nicht selbst finden konntest.',
        tags: ['probleme', 'logs', 'handbuch', 'support'],
        relatedPages: ['/dashboard', '/handbook'],
        priority: 'medium',
      },
      {
        id: 'best-practices',
        category: 'general',
        title: 'Bewährte Praktiken',
        content:
          'Teste alles im Shadow-Modus, bevor du es aktivierst. Verwende aussagekräftige Namen für Agents und Policies. Halte deine Konfigurationen dokumentiert und überprüfe regelmäßig die Sicherheitsmetriken.',
        tags: ['best-practices', 'testen', 'dokumentation', 'sicherheit'],
        relatedPages: ['/dashboard', '/handbook'],
        priority: 'high',
      },
    ],
  },
];

// Hilfsfunktionen für die Knowledge-Base
export function searchKnowledge(query: string, category?: string): KnowledgeEntry[] {
  const normalizedQuery = query.toLowerCase();
  let results = knowledgeBase.flatMap((section) => section.entries);

  if (category) {
    results = results.filter((entry) => entry.category === category);
  }

  return results.filter(
    (entry) =>
      entry.title.toLowerCase().includes(normalizedQuery) ||
      entry.content.toLowerCase().includes(normalizedQuery) ||
      entry.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)),
  );
}

export function getKnowledgeById(id: string): KnowledgeEntry | undefined {
  return knowledgeBase.flatMap((section) => section.entries).find((entry) => entry.id === id);
}

export function getKnowledgeByCategory(category: string): KnowledgeEntry[] {
  return knowledgeBase
    .filter((section) => section.id === category)
    .flatMap((section) => section.entries);
}

export function getHighPriorityKnowledge(): KnowledgeEntry[] {
  return knowledgeBase
    .flatMap((section) => section.entries)
    .filter((entry) => entry.priority === 'high');
}

export function getRelatedKnowledge(entryId: string): KnowledgeEntry[] {
  const entry = getKnowledgeById(entryId);
  if (!entry?.relatedPages) return [];

  return knowledgeBase
    .flatMap((section) => section.entries)
    .filter(
      (e) => e.id !== entryId && e.relatedPages?.some((page) => entry.relatedPages?.includes(page)),
    );
}
