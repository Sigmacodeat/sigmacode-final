'use client';

/**
 * SIGMACODE AI - Firewall Policy Editor
 */

import { Shield, Database, Globe, Eye } from 'lucide-react';

interface FirewallPolicies {
  blockPromptInjection: boolean;
  blockDataLeaks: boolean;
  blockMaliciousUrls: boolean;
  enablePIIMasking: boolean;
}

interface Props {
  policies: FirewallPolicies;
  onUpdate: (policies: FirewallPolicies) => void;
  disabled?: boolean;
}

export function FirewallPolicyEditor({ policies, onUpdate, disabled }: Props) {
  const policyOptions = [
    {
      key: 'blockPromptInjection' as keyof FirewallPolicies,
      icon: Shield,
      title: 'Prompt Injection Schutz',
      description: 'Blockiert Versuche, System-Prompts zu manipulieren',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      key: 'blockDataLeaks' as keyof FirewallPolicies,
      icon: Database,
      title: 'Data Leak Prevention',
      description: 'Verhindert unautorisierten Datenzugriff',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      key: 'blockMaliciousUrls' as keyof FirewallPolicies,
      icon: Globe,
      title: 'Malicious URL Blocking',
      description: 'Blockiert bekannte Malware- und Phishing-URLs',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      key: 'enablePIIMasking' as keyof FirewallPolicies,
      icon: Eye,
      title: 'PII Masking',
      description: 'Maskiert persönliche Daten automatisch',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
  ];

  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Schutz-Regeln</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {policyOptions.map((option) => (
          <label
            key={option.key}
            className={`flex items-start space-x-4 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
              policies[option.key]
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              type="checkbox"
              checked={policies[option.key]}
              onChange={(e) =>
                onUpdate({
                  ...policies,
                  [option.key]: e.target.checked,
                })
              }
              disabled={disabled}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <div className={`p-1.5 rounded ${option.bgColor}`}>
                  <option.icon className={`h-4 w-4 ${option.color}`} />
                </div>
                <h4 className="font-medium">{option.title}</h4>
              </div>
              <p className="text-sm text-muted-foreground">{option.description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
