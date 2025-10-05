// Exportiere alle Schema-Definitionen
export * from './schema';

// Exportiere die Datenbank-Instanz und Hilfsfunktionen
export * from './db';

// Re-exportiere Drizzle-Operatoren aus EINER Quelle, um Typ-Duplikate zu vermeiden
export { eq, and, or, inArray, sql } from 'drizzle-orm';

// Exportiere Typen für besseren Zugriff in der Anwendung
export type {
  Session,
  NewSession,
  User,
  NewUser,
  Media,
  NewMedia,
  Setting,
  NewSetting,
} from './schema';
