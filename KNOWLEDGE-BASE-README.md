# SIGMACODE AI - Knowledge Base System

## 📚 Übersicht

Die Knowledge Base ist ein vollständig integriertes System zur Verwaltung von Dokumenten und Datasets für RAG (Retrieval-Augmented Generation) und semantische Suche.

## 🎯 Features

### ✅ Core Funktionalität

- **Dataset-Verwaltung**: Erstellen, Bearbeiten, Löschen von Datasets
- **Dokument-Upload**: Drag & Drop Upload mit Multi-File-Support
- **Dokument-Verarbeitung**: Automatisches Chunking und Embedding-Vorbereitung
- **Suche & Filter**: Leistungsstarke Suche über Datasets und Dokumente
- **Statistiken**: Echtzeit-Metriken zu Dokumenten, Größe und Nutzung

### 🛠️ Technische Features

- **React Query**: Optimales State-Management mit Caching
- **Drizzle ORM**: Type-safe Datenbankzugriffe
- **TypeScript**: Vollständige Typisierung
- **Responsive UI**: Mobile-First Design
- **Real-time Updates**: Automatische Aktualisierung nach Änderungen

## 📁 Dateistruktur

```
app/
├── api/
│   ├── datasets/
│   │   ├── route.ts                    # GET (list), POST (create)
│   │   └── [id]/
│   │       ├── route.ts                # GET, PATCH, DELETE
│   │       └── documents/
│   │           └── route.ts            # GET (list), POST (create)
│   └── documents/
│       └── [id]/
│           └── route.ts                # GET, PATCH, DELETE
│
├── components/knowledge/
│   ├── DatasetCard.tsx                 # Dataset-Karte mit Stats
│   ├── CreateDatasetDialog.tsx         # Modal zum Erstellen
│   ├── UploadDocumentDialog.tsx        # Upload-Dialog
│   └── DocumentsList.tsx               # Dokumentenliste
│
├── hooks/api/
│   └── useKnowledge.ts                 # React Query Hooks
│
├── types/
│   └── knowledge.ts                    # TypeScript Definitionen
│
└── [locale]/dashboard/knowledge/
    ├── page.tsx                        # Hauptseite (Liste)
    └── [id]/
        └── page.tsx                    # Detail-Seite

database/
└── schema/
    └── datasets.ts                     # Datenbankschema
```

## 🗄️ Datenbankschema

### Tabellen

#### `datasets`

Haupttabelle für Dataset-Collections:

- **id**: UUID (Primary Key)
- **name**: Dataset-Name
- **description**: Optionale Beschreibung
- **icon**, **color**: UI-Customization
- **userId**: Besitzer (Foreign Key zu users)
- **isPublic**: Öffentliche Sichtbarkeit
- **documentCount**, **totalSize**: Cached Statistics
- **embeddingModel**: Model für Embeddings (z.B. "text-embedding-ada-002")
- **chunkSize**, **chunkOverlap**: Chunking-Konfiguration
- **tags**: JSON Array von Tags
- **settings**: JSON Objekt mit zusätzlichen Einstellungen

#### `documents`

Dokumente innerhalb von Datasets:

- **id**: UUID (Primary Key)
- **datasetId**: Foreign Key zu datasets (CASCADE DELETE)
- **name**: Dokumentenname
- **originalName**: Original-Dateiname
- **mimeType**: MIME-Type (z.B. "text/plain")
- **size**: Dateigröße in Bytes
- **content**: Vollständiger Text-Inhalt
- **summary**: Optionale Zusammenfassung
- **fileUrl**: URL zu gespeicherter Datei (S3/Storage)
- **fileHash**: SHA-256 Hash zur Duplikaterkennung
- **status**: pending | processing | completed | failed
- **processingError**: Fehlermeldung bei failed
- **chunkCount**: Anzahl der erstellten Chunks
- **embeddingStatus**: Status der Embedding-Generierung
- **metadata**: JSON Objekt (source, author, language, keywords, etc.)

#### `document_chunks`

Chunked Text für Embeddings:

- **id**: UUID (Primary Key)
- **documentId**: Foreign Key zu documents (CASCADE DELETE)
- **chunkIndex**: Position des Chunks im Dokument
- **content**: Chunk-Text
- **embedding**: JSON Array mit Vector-Embedding
- **embeddingModel**: Verwendetes Model
- **metadata**: startPos, endPos, tokens

#### `dataset_statistics`

Usage-Tracking und Performance-Metriken:

- **id**: UUID (Primary Key)
- **datasetId**: Foreign Key zu datasets
- **queryCount**: Anzahl der Abfragen
- **lastQueryAt**: Zeitpunkt der letzten Abfrage
- **avgQueryTime**: Durchschnittliche Antwortzeit (ms)
- **avgRelevanceScore**: Durchschnittliche Relevanz (0-100)
- **date**: Tag der Statistik

## 🔌 API-Endpunkte

### Datasets

#### `GET /api/datasets`

Liste aller Datasets mit optionalen Filtern

```typescript
Query Parameters:
- query?: string          // Suchbegriff
- tags?: string[]         // Filter nach Tags (komma-separiert)
- isPublic?: boolean      // Filter nach Sichtbarkeit
- limit?: number          // Max. Anzahl (default: 20)
- offset?: number         // Pagination offset (default: 0)
- sortBy?: string         // createdAt | updatedAt | name | documentCount
- sortOrder?: string      // asc | desc (default: desc)

Response:
{
  datasets: Dataset[],
  total: number,
  limit: number,
  offset: number
}
```

#### `POST /api/datasets`

Neues Dataset erstellen

```typescript
Body:
{
  name: string,                    // Required
  description?: string,
  icon?: string,
  color?: string,
  isPublic?: boolean,
  embeddingModel?: string,
  chunkSize?: number,
  chunkOverlap?: number,
  tags?: string[],
  settings?: {
    enableSemanticSearch?: boolean,
    enableHybridSearch?: boolean,
    maxDocuments?: number,
    allowedFileTypes?: string[]
  }
}

Response: Dataset
```

#### `GET /api/datasets/:id`

Dataset-Details mit aktuellen Statistiken

```typescript
Response: Dataset;
```

#### `PATCH /api/datasets/:id`

Dataset aktualisieren

```typescript
Body: Partial<UpdateDatasetInput>;
Response: Dataset;
```

#### `DELETE /api/datasets/:id`

Dataset und alle Dokumente löschen (CASCADE)

```typescript
Response: {
  success: true;
}
```

### Documents

#### `GET /api/datasets/:id/documents`

Liste aller Dokumente in einem Dataset

```typescript
Query Parameters:
- query?: string          // Suchbegriff
- status?: string         // pending | processing | completed | failed
- limit?: number          // Max. Anzahl (default: 50)
- offset?: number         // Pagination offset
- sortBy?: string         // createdAt | updatedAt | name | size
- sortOrder?: string      // asc | desc

Response:
{
  documents: Document[],
  total: number,
  limit: number,
  offset: number
}
```

#### `POST /api/datasets/:id/documents`

Neues Dokument erstellen

```typescript
Body:
{
  name: string,              // Required
  content: string,           // Required
  size: number,              // Required (bytes)
  originalName?: string,
  mimeType?: string,
  fileUrl?: string,
  summary?: string,
  metadata?: {
    source?: string,
    author?: string,
    language?: string,
    keywords?: string[],
    customFields?: Record<string, any>
  }
}

Response: Document
```

#### `GET /api/documents/:id`

Dokument-Details

```typescript
Response: Document;
```

#### `PATCH /api/documents/:id`

Dokument aktualisieren

```typescript
Body: Partial<UpdateDocumentInput>;
Response: Document;
```

#### `DELETE /api/documents/:id`

Dokument löschen

```typescript
Response: {
  success: true;
}
```

## 🎨 React Query Hooks

### Datasets

```typescript
// Liste aller Datasets
const { data, isPending, error } = useDatasets({
  query: 'search term',
  limit: 20,
  offset: 0,
});

// Einzelnes Dataset
const { data: dataset } = useDataset(id);

// Dataset erstellen
const createDataset = useCreateDataset();
await createDataset.mutateAsync({
  name: 'My Dataset',
  description: 'Description',
  color: 'blue',
});

// Dataset aktualisieren
const updateDataset = useUpdateDataset();
await updateDataset.mutateAsync({
  id: 'dataset-id',
  name: 'Updated Name',
});

// Dataset löschen
const deleteDataset = useDeleteDataset();
await deleteDataset.mutateAsync('dataset-id');
```

### Documents

```typescript
// Liste aller Dokumente
const { data, isPending } = useDocuments(datasetId, {
  query: 'search',
  status: 'completed',
});

// Einzelnes Dokument
const { data: document } = useDocument(id);

// Dokument erstellen
const createDocument = useCreateDocument();
await createDocument.mutateAsync({
  datasetId: 'dataset-id',
  name: 'document.txt',
  content: 'Document content',
  size: 1024,
});

// Datei hochladen
const uploadDocument = useUploadDocument();
await uploadDocument.mutateAsync({
  datasetId: 'dataset-id',
  file: fileObject,
  metadata: { source: 'manual upload' },
});

// Dokument löschen
const deleteDocument = useDeleteDocument();
await deleteDocument.mutateAsync({
  id: 'document-id',
  datasetId: 'dataset-id',
});
```

## 🔐 Sicherheit

### Authentifizierung

- Alle API-Routen erfordern eine aktive NextAuth-Session
- Benutzer können nur ihre eigenen Datasets verwalten
- Öffentliche Datasets sind lesbar für alle authentifizierten Benutzer

### Autorisierung

```typescript
// Dataset-Zugriff wird geprüft
const [dataset] = await db
  .select()
  .from(datasets)
  .where(and(eq(datasets.id, id), eq(datasets.userId, session.user.id)));
```

### Input-Validierung

- Alle Eingaben werden serverseitig validiert
- Erforderliche Felder werden geprüft
- SQL-Injection-Schutz durch Drizzle ORM

## 🎯 Best Practices

### 1. Dataset-Organisation

```typescript
// Strukturierte Benennung
const dataset = {
  name: 'Produktdokumentation 2024',
  description: 'Alle Produktdokumente für Q1-Q4',
  tags: ['docs', 'products', '2024'],
  color: 'blue',
};
```

### 2. Dokument-Upload

```typescript
// Metadata hinzufügen
await uploadDocument.mutateAsync({
  datasetId,
  file,
  metadata: {
    source: 'manual',
    author: 'Max Mustermann',
    language: 'de',
    keywords: ['produkt', 'anleitung'],
  },
});
```

### 3. Chunking-Konfiguration

```typescript
// Für technische Dokumente
{
  chunkSize: 512,
  chunkOverlap: 50,
  embeddingModel: 'text-embedding-ada-002'
}

// Für längere Texte
{
  chunkSize: 1024,
  chunkOverlap: 100
}
```

## 📊 Performance-Optimierung

### Caching

- React Query cached automatisch alle Abfragen
- Datasets werden 5 Minuten gecached
- Dokumente werden nach Änderungen invalidiert

### Pagination

```typescript
// Große Listen paginieren
const { data } = useDocuments(datasetId, {
  limit: 50,
  offset: page * 50,
});
```

### Indizes

Alle Tabellen haben optimierte Indizes:

- `datasets_user_id_idx`
- `datasets_name_idx`
- `documents_dataset_id_idx`
- `documents_status_idx`
- `document_chunks_document_id_idx`

## 🚀 Deployment

### Umgebungsvariablen

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
```

### Migration ausführen

```bash
# Schema generieren
pnpm drizzle-kit generate

# Migration anwenden
pnpm drizzle-kit push
```

## 🔮 Roadmap

### Phase 1: Basis ✅

- [x] Dataset-Verwaltung
- [x] Dokument-Upload
- [x] Suche & Filter
- [x] Statistiken

### Phase 2: RAG-Integration 🚧

- [ ] Vector-Embeddings generieren
- [ ] Semantische Suche implementieren
- [ ] Hybrid-Search (Keyword + Semantic)
- [ ] RAG-Prompts für Agents

### Phase 3: Advanced Features 📋

- [ ] Web-Scraping Integration
- [ ] Automatische Zusammenfassungen
- [ ] Multi-Language Support
- [ ] Batch-Processing
- [ ] API-Webhooks

### Phase 4: AI-Features 🤖

- [ ] Automatische Kategorisierung
- [ ] Keyword-Extraktion
- [ ] Duplicate Detection
- [ ] Quality Scoring

## 🐛 Bekannte Einschränkungen

1. **Embeddings**: Aktuell nur Vorbereitung, noch keine automatische Generierung
2. **Dateigrößen**: Empfohlen max. 10MB pro Datei
3. **Dateiformate**: Aktuell nur Text-Dateien vollständig unterstützt
4. **Concurrent Uploads**: Sequenziell, nicht parallel

## 📝 Changelog

### v1.0.0 (2025-01-04)

- ✅ Vollständiges Datenbankschema
- ✅ CRUD API-Routen
- ✅ React Query Hooks
- ✅ UI-Komponenten
- ✅ Upload-Funktionalität
- ✅ Suche & Filter
- ✅ Statistiken

## 🤝 Contribution

Für Verbesserungen und Bugfixes:

1. Branch erstellen: `git checkout -b feature/knowledge-base-improvement`
2. Änderungen committen
3. Tests ausführen
4. Pull Request erstellen

## 📞 Support

Bei Fragen oder Problemen:

- Issue erstellen auf GitHub
- Dokumentation prüfen
- Logs prüfen: `pnpm logs`

---

**SIGMACODE AI** - Intelligent Defense. Autonomous Protection.
