import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const media = pgTable('media', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  fileName: text('file_name').notNull(),
  filePath: text('file_path').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size').notNull(),
  width: integer('width'),
  height: integer('height'),
  altText: text('alt_text'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
