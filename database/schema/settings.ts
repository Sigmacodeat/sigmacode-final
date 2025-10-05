import {
  pgTable,
  text,
  boolean,
  index,
  timestamp as pgTimestamp,
  bigint,
} from 'drizzle-orm/pg-core';

export const settings = pgTable(
  'settings',
  {
    // Identity-Primary-Key (GENERATED ALWAYS AS IDENTITY)
    id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
    key: text('key').notNull().unique(),
    value: text('value'),
    type: text('type').notNull().default('string'),
    groupName: text('group_name').notNull().default('general'),
    isPublic: boolean('is_public').notNull().default(false),
    // Drizzle: timestamp mit Zeitzone via withTimezone, mode 'date' für JS Date-Objekte
    createdAt: pgTimestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: pgTimestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (t: any) => [index('settings_key_idx').on(t.key), index('settings_group_idx').on(t.groupName)],
);

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;

// Hilfsfunktionen für die Arbeit mit Einstellungen
export type SettingValue = string | number | boolean | Record<string, unknown> | null;

// Overloads für bessere Ergonomie in Aufrufern
export function parseSettingValue(setting: Setting): SettingValue;
export function parseSettingValue(value: string | null | undefined, type?: string): SettingValue;
export function parseSettingValue(
  arg1: Setting | (string | null | undefined),
  type?: string,
): SettingValue {
  const parse = (val: string | null | undefined, t?: string): SettingValue => {
    if (val === null || val === undefined) return null;
    const tt = (t || 'string').toLowerCase();
    switch (tt) {
      case 'number': {
        const n = Number(val);
        return Number.isNaN(n) ? null : n;
      }

      case 'boolean': {
        const v = val.trim().toLowerCase();
        return v === 'true' || v === '1' || v === 'yes' || v === 'on';
      }
      case 'json': {
        try {
          const parsed = JSON.parse(val);
          if (parsed !== null && typeof parsed === 'object')
            return parsed as Record<string, unknown>;
          return null;
        } catch {
          return null;
        }
      }
      default:
        return val;
    }
  };

  if (typeof arg1 === 'object' && arg1 !== null && 'key' in arg1) {
    // Aufruf mit Setting-Objekt
    return parse(arg1.value, arg1.type);
  }
  // Aufruf mit (value, type)
  return parse(arg1 as string | null | undefined, type);
}

export function stringifySettingValue(value: unknown, type: string = 'string'): string {
  if (value === null || value === undefined) return '';
  switch (type) {
    case 'json':
      return JSON.stringify(value);
    case 'boolean':
      return String(Boolean(value));
    case 'number':
      return String(Number(value));
    default:
      return String(value);
  }
}
