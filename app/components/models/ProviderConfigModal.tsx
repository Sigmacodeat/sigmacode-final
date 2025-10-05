'use client';

import { useState } from 'react';
import { X, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ProviderConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: string | null;
}

const PROVIDER_INFO = {
  openai: { name: 'OpenAI', color: 'bg-green-500' },
  anthropic: { name: 'Anthropic', color: 'bg-orange-500' },
  google: { name: 'Google', color: 'bg-blue-500' },
  azure_openai: { name: 'Azure OpenAI', color: 'bg-cyan-500' },
  huggingface: { name: 'Hugging Face', color: 'bg-yellow-500' },
};

export default function ProviderConfigModal({
  isOpen,
  onClose,
  provider,
}: ProviderConfigModalProps) {
  const [formData, setFormData] = useState({
    apiUrl: '',
    apiKey: '',
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  if (!isOpen || !provider) return null;

  const providerInfo = PROVIDER_INFO[provider as keyof typeof PROVIDER_INFO];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(
        '/api/dify/console/api/workspaces/current/model-providers/configure',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider,
            apiKey: formData.apiKey,
            apiUrl: formData.apiUrl,
          }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        setTestResult({ success: true, message: data.message || 'Erfolgreich konfiguriert' });
      } else {
        setTestResult({ success: false, message: data.error || 'Fehler bei der Konfiguration' });
      }
    } catch (error) {
      setTestResult({ success: false, message: 'Netzwerkfehler' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClose = () => {
    setFormData({ apiUrl: '', apiKey: '' });
    setTestResult(null);
    setShowApiKey(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-xl border max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${providerInfo?.color}`} />
            <h2 className="text-lg font-semibold">{providerInfo?.name} konfigurieren</h2>
          </div>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {testResult ? (
            <div
              className={`flex items-center space-x-3 p-4 rounded-lg ${
                testResult.success
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <p className="text-sm">{testResult.message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">API-URL (optional)</label>
                <input
                  type="url"
                  value={formData.apiUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, apiUrl: e.target.value }))}
                  placeholder="https://api.openai.com/v1"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">API-Key</label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={formData.apiKey}
                    onChange={(e) => setFormData((prev) => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="sk-..."
                    className="w-full pr-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isTesting || !formData.apiKey}
                className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isTesting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{isTesting ? 'Teste Verbindung...' : 'Speichern & Testen'}</span>
              </button>
            </form>
          )}

          {!testResult && (
            <p className="text-xs text-muted-foreground mt-4">
              Die API-Keys werden sicher gespeichert und nur serverseitig verwendet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
