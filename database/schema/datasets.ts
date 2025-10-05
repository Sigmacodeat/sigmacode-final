/**
 * SIGMACODE AI - Knowledge Base / Datasets Schema
 *
 * Datasets: Collections of documents for RAG and semantic search
 * Documents: Individual documents within datasets with embeddings
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  varchar,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Datasets - Collections of documents for knowledge management
 */
export const datasets = pgTable(
  'datasets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    icon: varchar('icon', { length: 50 }).default('Database'),
    color: varchar('color', { length: 50 }).default('blue'),

    // Ownership & Permissions
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    isPublic: boolean('is_public').default(false).notNull(),

    // Statistics
    documentCount: integer('document_count').default(0).notNull(),
    totalSize: integer('total_size').default(0).notNull(), // in bytes

    // Embedding Configuration
    embeddingModel: varchar('embedding_model', { length: 100 }).default('text-embedding-ada-002'),
    chunkSize: integer('chunk_size').default(512).notNull(),
    chunkOverlap: integer('chunk_overlap').default(50).notNull(),

    // Metadata
    tags: jsonb('tags').$type<string[]>().default([]),
    settings: jsonb('settings')
      .$type<{
        enableSemanticSearch?: boolean;
        enableHybridSearch?: boolean;
        maxDocuments?: number;
        allowedFileTypes?: string[];
      }>()
      .default({}),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('datasets_user_id_idx').on(table.userId),
    nameIdx: index('datasets_name_idx').on(table.name),
    createdAtIdx: index('datasets_created_at_idx').on(table.createdAt),
  }),
);

/**
 * Documents - Individual documents within datasets
 */
export const documents = pgTable(
  'documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    datasetId: uuid('dataset_id')
      .notNull()
      .references(() => datasets.id, { onDelete: 'cascade' }),

    // Document Information
    name: varchar('name', { length: 500 }).notNull(),
    originalName: varchar('original_name', { length: 500 }),
    mimeType: varchar('mime_type', { length: 100 }),
    size: integer('size').notNull(), // in bytes

    // Content
    content: text('content').notNull(),
    summary: text('summary'),

    // File Storage
    fileUrl: text('file_url'), // S3/Storage URL
    fileHash: varchar('file_hash', { length: 64 }), // SHA-256 hash

    // Processing Status
    status: varchar('status', { length: 50 }).default('pending').notNull(), // pending, processing, completed, failed
    processingError: text('processing_error'),

    // Chunking & Embeddings
    chunkCount: integer('chunk_count').default(0).notNull(),
    embeddingStatus: varchar('embedding_status', { length: 50 }).default('pending').notNull(),

    // Metadata
    metadata: jsonb('metadata')
      .$type<{
        source?: string;
        author?: string;
        language?: string;
        keywords?: string[];
        customFields?: Record<string, any>;
      }>()
      .default({}),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    processedAt: timestamp('processed_at', { withTimezone: true }),
  },
  (table) => ({
    datasetIdIdx: index('documents_dataset_id_idx').on(table.datasetId),
    statusIdx: index('documents_status_idx').on(table.status),
    nameIdx: index('documents_name_idx').on(table.name),
    createdAtIdx: index('documents_created_at_idx').on(table.createdAt),
    fileHashIdx: index('documents_file_hash_idx').on(table.fileHash),
  }),
);

/**
 * Document Chunks - Chunked text for embeddings and retrieval
 */
export const documentChunks = pgTable(
  'document_chunks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    documentId: uuid('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),

    // Chunk Information
    chunkIndex: integer('chunk_index').notNull(),
    content: text('content').notNull(),

    // Vector Embedding (store as JSON for now, can migrate to pgvector later)
    embedding: jsonb('embedding').$type<number[]>(),
    embeddingModel: varchar('embedding_model', { length: 100 }),

    // Metadata
    metadata: jsonb('metadata')
      .$type<{
        startPos?: number;
        endPos?: number;
        tokens?: number;
      }>()
      .default({}),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    documentIdIdx: index('document_chunks_document_id_idx').on(table.documentId),
    chunkIndexIdx: index('document_chunks_chunk_index_idx').on(table.chunkIndex),
  }),
);

/**
 * Dataset Statistics - Track usage and performance
 */
export const datasetStatistics = pgTable(
  'dataset_statistics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    datasetId: uuid('dataset_id')
      .notNull()
      .references(() => datasets.id, { onDelete: 'cascade' }),

    // Usage Metrics
    queryCount: integer('query_count').default(0).notNull(),
    lastQueryAt: timestamp('last_query_at', { withTimezone: true }),

    // Performance Metrics
    avgQueryTime: integer('avg_query_time').default(0), // in milliseconds
    avgRelevanceScore: integer('avg_relevance_score').default(0), // 0-100

    // Date
    date: timestamp('date', { withTimezone: true }).defaultNow().notNull(),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    datasetIdIdx: index('dataset_statistics_dataset_id_idx').on(table.datasetId),
    dateIdx: index('dataset_statistics_date_idx').on(table.date),
  }),
);

// Export types
export type Dataset = typeof datasets.$inferSelect;
export type NewDataset = typeof datasets.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type DocumentChunk = typeof documentChunks.$inferSelect;
export type NewDocumentChunk = typeof documentChunks.$inferInsert;
export type DatasetStatistics = typeof datasetStatistics.$inferSelect;
export type NewDatasetStatistics = typeof datasetStatistics.$inferInsert;
