import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

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

function getStore() {
  const store: { workflows: WorkflowItem[] } = globalThis as any;
  if (!store.workflows) store.workflows = [];
  return store;
}

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const store = getStore();
  const original = store.workflows.find((w) => w.id === params.id);
  if (!original) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  const now = new Date().toISOString();
  const clone: WorkflowItem = {
    ...original,
    id: randomUUID(),
    name: `${original.name} (Kopie)`,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };
  store.workflows.unshift(clone);
  return NextResponse.json(clone, { status: 201 });
}
