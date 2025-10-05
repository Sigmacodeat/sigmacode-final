import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

// Simple in-memory store for development
export type WorkflowItem = {
  id: string;
  name: string;
  description?: string;
  type: 'chatbot' | 'completion' | 'workflow' | 'agent';
  status: 'draft' | 'published' | 'archived';
  firewall?: {
    enabled: boolean;
    mode: 'enforce' | 'shadow';
  };
  createdAt: string;
  updatedAt: string;
};

const store: { workflows: WorkflowItem[] } = globalThis as any;
if (!store.workflows) {
  store.workflows = [
    {
      id: randomUUID(),
      name: 'Onboarding Assistant',
      description: 'Geführtes Kunden-Onboarding mit Datenvalidierung',
      type: 'workflow',
      status: 'draft',
      firewall: { enabled: true, mode: 'shadow' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export async function GET() {
  return NextResponse.json({ workflows: store.workflows });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.name || !body?.type) {
      return NextResponse.json({ message: 'name und type sind erforderlich' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const item: WorkflowItem = {
      id: randomUUID(),
      name: String(body.name),
      description: body.description ? String(body.description) : undefined,
      type: body.type,
      status: body.status === 'published' ? 'published' : 'draft',
      firewall:
        body.firewall && typeof body.firewall === 'object'
          ? {
              enabled: Boolean(body.firewall.enabled),
              mode: body.firewall.mode === 'enforce' ? 'enforce' : 'shadow',
            }
          : undefined,
      createdAt: now,
      updatedAt: now,
    };

    store.workflows.unshift(item);
    return NextResponse.json(item, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Unbekannter Fehler' }, { status: 500 });
  }
}
