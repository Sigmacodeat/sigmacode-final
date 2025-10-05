/**
 * SIGMACODE AI - Knowledge Base React Query Hooks
 *
 * Hooks for datasets and documents management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Dataset,
  Document,
  CreateDatasetInput,
  UpdateDatasetInput,
  CreateDocumentInput,
  UpdateDocumentInput,
  SearchDatasetsParams,
  SearchDocumentsParams,
  DatasetsResponse,
  DocumentsResponse,
} from '@/types/knowledge';

// ============================================================================
// DATASETS HOOKS
// ============================================================================

/**
 * Fetch all datasets with optional filters
 */
export function useDatasets(params?: SearchDatasetsParams) {
  return useQuery({
    queryKey: ['datasets', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.query) searchParams.set('query', params.query);
      if (params?.tags?.length) searchParams.set('tags', params.tags.join(','));
      if (params?.isPublic !== undefined) searchParams.set('isPublic', String(params.isPublic));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.offset) searchParams.set('offset', String(params.offset));
      if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
      if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

      const response = await fetch(`/api/datasets?${searchParams}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch datasets');
      }
      return response.json() as Promise<DatasetsResponse>;
    },
  });
}

/**
 * Fetch a single dataset by ID
 */
export function useDataset(id: string | null) {
  return useQuery({
    queryKey: ['dataset', id],
    queryFn: async () => {
      if (!id) throw new Error('Dataset ID is required');
      const response = await fetch(`/api/datasets/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch dataset');
      }
      return response.json() as Promise<Dataset>;
    },
    enabled: !!id,
  });
}

/**
 * Create a new dataset
 */
export function useCreateDataset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDatasetInput) => {
      const response = await fetch('/api/datasets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create dataset');
      }

      return response.json() as Promise<Dataset>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
  });
}

/**
 * Update an existing dataset
 */
export function useUpdateDataset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateDatasetInput) => {
      const response = await fetch(`/api/datasets/${input.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update dataset');
      }

      return response.json() as Promise<Dataset>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      queryClient.invalidateQueries({ queryKey: ['dataset', data.id] });
    },
  });
}

/**
 * Delete a dataset
 */
export function useDeleteDataset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/datasets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete dataset');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
  });
}

// ============================================================================
// DOCUMENTS HOOKS
// ============================================================================

/**
 * Fetch documents in a dataset
 */
export function useDocuments(datasetId: string | null, params?: SearchDocumentsParams) {
  return useQuery({
    queryKey: ['documents', datasetId, params],
    queryFn: async () => {
      if (!datasetId) throw new Error('Dataset ID is required');

      const searchParams = new URLSearchParams();
      if (params?.query) searchParams.set('query', params.query);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.offset) searchParams.set('offset', String(params.offset));
      if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
      if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

      const response = await fetch(`/api/datasets/${datasetId}/documents?${searchParams}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch documents');
      }
      return response.json() as Promise<DocumentsResponse>;
    },
    enabled: !!datasetId,
  });
}

/**
 * Fetch a single document by ID
 */
export function useDocument(id: string | null) {
  return useQuery({
    queryKey: ['document', id],
    queryFn: async () => {
      if (!id) throw new Error('Document ID is required');
      const response = await fetch(`/api/documents/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch document');
      }
      return response.json() as Promise<Document>;
    },
    enabled: !!id,
  });
}

/**
 * Create a new document
 */
export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDocumentInput) => {
      const response = await fetch(`/api/datasets/${input.datasetId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create document');
      }

      return response.json() as Promise<Document>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents', data.datasetId] });
      queryClient.invalidateQueries({ queryKey: ['dataset', data.datasetId] });
    },
  });
}

/**
 * Update an existing document
 */
export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateDocumentInput) => {
      const response = await fetch(`/api/documents/${input.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update document');
      }

      return response.json() as Promise<Document>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['document', data.id] });
      queryClient.invalidateQueries({ queryKey: ['documents', data.datasetId] });
    },
  });
}

/**
 * Delete a document
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, datasetId }: { id: string; datasetId: string }) => {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete document');
      }

      return { id, datasetId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents', data.datasetId] });
      queryClient.invalidateQueries({ queryKey: ['dataset', data.datasetId] });
    },
  });
}

/**
 * Upload a file as a document
 */
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      datasetId,
      file,
      metadata,
    }: {
      datasetId: string;
      file: File;
      metadata?: any;
    }) => {
      // Read file content
      const content = await file.text();

      // Create document
      const input: CreateDocumentInput = {
        datasetId,
        name: file.name,
        originalName: file.name,
        content,
        mimeType: file.type,
        size: file.size,
        metadata,
      };

      const response = await fetch(`/api/datasets/${datasetId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload document');
      }

      return response.json() as Promise<Document>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents', data.datasetId] });
      queryClient.invalidateQueries({ queryKey: ['dataset', data.datasetId] });
    },
  });
}
