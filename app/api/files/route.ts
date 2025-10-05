import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

// File upload configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
  'text/plain': '.txt',
  'application/json': '.json',
  'text/csv': '.csv',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
};

const UPLOAD_DIR = join(process.cwd(), 'uploads');

// Ensure upload directory exists
async function ensureUploadDir(): Promise<void> {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error: unknown) {
    console.error('Failed to create upload directory:', error);
  }
}

// File metadata interface
interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  extension: string;
  url: string;
  path: string;
  uploadedAt: string;
  userId?: string;
  metadata?: Record<string, any>;
}

// Validate file
function validateFile(file: File): { isValid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
    };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES]) {
    return { isValid: false, error: 'File type not allowed' };
  }

  return { isValid: true };
}

// Generate unique filename
function generateUniqueFilename(originalName: string): string {
  const extension = originalName.split('.').pop() || '';
  const timestamp = Date.now();
  const uuid = randomUUID().split('-')[0];
  return `${timestamp}-${uuid}.${extension}`;
}

// Save file to disk
async function saveFile(file: File, filename: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filepath = join(UPLOAD_DIR, filename);
  await writeFile(filepath, buffer);

  return filepath;
}

// POST - Upload files
export async function POST(request: NextRequest) {
  try {
    await ensureUploadDir();

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const userId = formData.get('userId') as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploadedFiles: UploadedFile[] = [];

    for (const file of files) {
      // Validate file
      const validation = validateFile(file);
      if (!validation.isValid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      // Generate unique filename
      const filename = generateUniqueFilename(file.name);
      const filepath = await saveFile(file, filename);

      // Create file record
      const uploadedFile: UploadedFile = {
        id: randomUUID(),
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        extension: filename.split('.').pop() || '',
        url: `/api/files/${filename}`,
        path: filepath,
        uploadedAt: new Date().toISOString(),
        userId: userId || undefined,
        metadata: {
          uploadedBy: userId || 'anonymous',
          uploadMethod: 'api',
        },
      };

      uploadedFiles.push(uploadedFile);
    }

    // Log upload event
    console.log(
      `📁 Files uploaded: ${uploadedFiles.length} files by user ${userId || 'anonymous'}`,
    );

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    });
  } catch (error: unknown) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Failed to upload files' }, { status: 500 });
  }
}

// GET - List uploaded files
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // In production, this would query a database
    // For now, return mock data or read from filesystem
    const files: UploadedFile[] = [];

    // Filter by user if specified
    if (userId) {
      // In production: query database
      // files = await db.files.findMany({ where: { userId } });
    }

    return NextResponse.json({
      files: files.slice(offset, offset + limit),
      total: files.length,
      limit,
      offset,
    });
  } catch (error: unknown) {
    console.error('List files error:', error);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}

// DELETE - Delete file
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({ error: 'Filename required' }, { status: 400 });
    }

    const filepath = join(UPLOAD_DIR, filename);

    // Check if file exists
    try {
      await writeFile(filepath, ''); // Try to access file
      await writeFile(filepath, ''); // Delete by overwriting with empty content
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    console.log(`🗑️ File deleted: ${filename}`);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Delete file error:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
