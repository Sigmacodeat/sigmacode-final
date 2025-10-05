// Zentrale Re-Exports der Drizzle-Operatoren/-Hilfsfunktionen aus derselben Instanz
// WICHTIG: Diese Datei liegt im Root-Paket und resolved daher zur gleichen drizzle-orm-Installation
// wie unsere DB-Initialisierung in database/db.ts. Dadurch bleiben Typen identisch.

export { and, or, eq, ilike, inArray, asc, desc, gt, gte } from 'drizzle-orm';
// Wichtig: sql aus dem gleichen Modul re-exportieren wie die Operatoren,
// damit der SQL-Typ identisch bleibt und keine Type-Mismatches entstehen.
export { sql } from 'drizzle-orm';
