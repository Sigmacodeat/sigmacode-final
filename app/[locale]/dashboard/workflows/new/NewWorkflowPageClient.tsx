'use client';

import { SetStateAction, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Workflow, Shield, ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import WorkflowPipeline from '@/components/workflows/WorkflowPipeline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { InfoPanel } from '@/components/ui/handbook/HandbookComponents';

type WorkflowType = 'chatbot' | 'completion' | 'workflow' | 'agent';

export default function NewWorkflowPageClient() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'de';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [workflowType, setWorkflowType] = useState<WorkflowType>('workflow');
  const [firewallEnabled, setFirewallEnabled] = useState(true);
  const [firewallMode, setFirewallMode] = useState<'enforce' | 'shadow'>('shadow');

  const handleSave = async (isDraft = true) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          type: workflowType,
          firewall: {
            enabled: firewallEnabled,
            mode: firewallMode,
          },
          status: isDraft ? 'draft' : 'published',
        }),
      });

      if (!response.ok) {
        throw new Error('Workflow konnte nicht erstellt werden');
      }

      const data = await response.json();
      router.push(`/${locale}/dashboard/workflows/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link
              href={`/${locale}/dashboard/workflows`}
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Workflows
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Workflow className="h-8 w-8 text-primary" />
            Neuer Workflow
          </h1>
        </div>
      </div>

      <div className="mb-6">
        <InfoPanel title="Workflow-Typen erklärt" type="info">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <strong>Chatbot:</strong> Interaktive Unterhaltungen mit Gedächtnis und Kontext
            </div>
            <div>
              <strong>Completion:</strong> Einfache Text-Vervollständigung ohne Kontext
            </div>
            <div>
              <strong>Workflow:</strong> Komplexe, mehrstufige Prozesse mit verschiedenen Nodes
            </div>
            <div>
              <strong>Agent:</strong> Autonome Agents mit eigenen Tools und Entscheidungen
            </div>
          </div>
        </InfoPanel>
      </div>

      <WorkflowPipeline />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border bg-card p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Workflow-Details</h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="z.B. Kundenservice Chatbot"
                    className="mt-1.5"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea
                    value={description}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                      setDescription(e.target.value)
                    }
                    placeholder="Was macht dieser Workflow?"
                    className="mt-1.5 min-h-[100px]"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Workflow-Typ</Label>
                  <Select
                    value={workflowType}
                    onValueChange={(value) => setWorkflowType(value as WorkflowType)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Typ auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chatbot">Chatbot</SelectItem>
                      <SelectItem value="completion">Text-Completion</SelectItem>
                      <SelectItem value="workflow">Workflow</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    {workflowType === 'chatbot' && 'Konversationeller Chatbot mit Gedächtnis'}
                    {workflowType === 'completion' && 'Einfache Text-Vervollständigung'}
                    {workflowType === 'workflow' && 'Mehrstufiger Workflow mit Nodes'}
                    {workflowType === 'agent' && 'Autonomer Agent mit Tools'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Neural Firewall</h3>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="firewall-enabled" className="cursor-pointer">
                Firewall aktivieren
              </Label>
              <Switch
                id="firewall-enabled"
                checked={firewallEnabled}
                onCheckedChange={setFirewallEnabled}
              />
            </div>

            {firewallEnabled && (
              <div>
                <Label htmlFor="firewall-mode">Modus</Label>
                <Select
                  value={firewallMode}
                  onValueChange={(value) => setFirewallMode(value as 'enforce' | 'shadow')}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shadow">Shadow Mode (empfohlen)</SelectItem>
                    <SelectItem value="enforce">Enforce Mode</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  {firewallMode === 'shadow'
                    ? 'Requests werden analysiert, aber nicht blockiert. Ideal zum Testen.'
                    : 'Verdächtige Requests werden aktiv blockiert. Produktionsmodus.'}
                </p>
              </div>
            )}

            <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-sm text-blue-900">
              <p className="font-medium mb-1">🛡️ Firewall-Powered</p>
              <p className="text-xs">
                Alle Requests werden automatisch auf Threats, Prompt Injections und PII-Leaks
                geprüft.
              </p>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 space-y-3">
            <Button
              onClick={() => handleSave(false)}
              disabled={!name || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Wird erstellt...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Speichern & Konfigurieren
                </>
              )}
            </Button>

            <Button
              onClick={() => handleSave(true)}
              disabled={!name || loading}
              variant="outline"
              className="w-full"
            >
              Als Entwurf speichern
            </Button>

            <Link href={`/${locale}/dashboard/workflows`}>
              <Button variant="ghost" className="w-full">
                Abbrechen
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
