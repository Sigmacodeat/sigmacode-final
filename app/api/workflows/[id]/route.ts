import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { workflows } = getStore();
  const item = workflows.find((w) => w.id === params.id);
  if (!item) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const store = getStore();
  const idx = store.workflows.findIndex((w) => w.id === params.id);
  if (idx === -1) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  const patch = await req.json();
  const updated: WorkflowItem = {
    ...store.workflows[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  store.workflows[idx] = updated;
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const store = getStore();
  const before = store.workflows.length;
  store.workflows = store.workflows.filter((w) => w.id !== params.id);
  const deleted = store.workflows.length !== before;
  if (!deleted) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
