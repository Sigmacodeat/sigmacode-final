/**
 * SIGMACODE AI - Knowledge Base Types
 *
 * Frontend types for datasets and documents
 */

export type DatasetStatus = 'active' | 'processing' | 'error' | 'archived';

export type DocumentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type EmbeddingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Dataset {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;

  // Ownership
  userId: string;
  isPublic: boolean;

  // Statistics
  documentCount: number;
  totalSize: number;

  // Embedding Configuration
  embeddingModel: string;
  chunkSize: number;
  chunkOverlap: number;

  // Metadata
  tags: string[];
  settings: DatasetSettings;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Relations (optional, for expanded queries)
  documents?: Document[];
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface DatasetSettings {
  enableSemanticSearch?: boolean;
  enableHybridSearch?: boolean;
  maxDocuments?: number;
  allowedFileTypes?: string[];
}

export interface Document {
  id: string;
  datasetId: string;

  // Document Information
  name: string;
  originalName: string | null;
  mimeType: string | null;
  size: number;

  // Content
  content: string;
  summary: string | null;

  // File Storage
  fileUrl: string | null;
  fileHash: string | null;

  // Processing Status
  status: DocumentStatus;
  processingError: string | null;

  // Chunking & Embeddings
  chunkCount: number;
  embeddingStatus: EmbeddingStatus;

  // Metadata
  metadata: DocumentMetadata;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  processedAt: string | null;

  // Relations (optional)
  dataset?: Dataset;
  chunks?: DocumentChunk[];
}

export interface DocumentMetadata {
  source?: string;
  author?: string;
  language?: string;
  keywords?: string[];
  customFields?: Record<string, any>;
}

export interface DocumentChunk {
  id: string;
  documentId: string;

  // Chunk Information
  chunkIndex: number;
  content: string;

  // Vector Embedding
  embedding: number[] | null;
  embeddingModel: string | null;

  // Metadata
  metadata: ChunkMetadata;

  // Timestamps
  createdAt: string;
}

export interface ChunkMetadata {
  startPos?: number;
  endPos?: number;
  tokens?: number;
}

export interface DatasetStatistics {
  id: string;
  datasetId: string;

  // Usage Metrics
  queryCount: number;
  lastQueryAt: string | null;

  // Performance Metrics
  avgQueryTime: number | null;
  avgRelevanceScore: number | null;

  // Date
  date: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Create/Update DTOs
export interface CreateDatasetInput {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isPublic?: boolean;
  embeddingModel?: string;
  chunkSize?: number;
  chunkOverlap?: number;
  tags?: string[];
  settings?: DatasetSettings;
}

export interface UpdateDatasetInput extends Partial<CreateDatasetInput> {
  id: string;
}

export interface CreateDocumentInput {
  datasetId: string;
  name: string;
  content: string;
  mimeType?: string;
  size: number;
  originalName?: string;
  fileUrl?: string;
  summary?: string;
  metadata?: DocumentMetadata;
}

export interface UpdateDocumentInput extends Partial<Omit<CreateDocumentInput, 'datasetId'>> {
  id: string;
}

// Upload
export interface UploadDocumentInput {
  datasetId: string;
  file: File;
  metadata?: DocumentMetadata;
}

// Search & Query
export interface SearchDatasetsParams {
  query?: string;
  userId?: string;
  tags?: string[];
  isPublic?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'documentCount';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchDocumentsParams {
  datasetId?: string;
  query?: string;
  status?: DocumentStatus;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'size';
  sortOrder?: 'asc' | 'desc';
}

// Response types
export interface DatasetsResponse {
  datasets: Dataset[];
  total: number;
  limit: number;
  offset: number;
}

export interface DocumentsResponse {
  documents: Document[];
  total: number;
  limit: number;
  offset: number;
}

// Semantic Search
export interface SemanticSearchParams {
  datasetId: string;
  query: string;
  topK?: number;
  minScore?: number;
}

export interface SemanticSearchResult {
  chunk: DocumentChunk;
  document: Document;
  score: number;
  highlights?: string[];
}

export interface SemanticSearchResponse {
  results: SemanticSearchResult[];
  queryTime: number;
}
