'use client';

import React from 'react';
import {
  Info,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Target,
  Shield,
  Zap,
} from 'lucide-react';

interface InfoPanelProps {
  title: string;
  children: React.ReactNode;
  type?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
}

export function InfoPanel({ title, children, type = 'info', className = '' }: InfoPanelProps) {
  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertCircle,
    error: AlertCircle,
  };

  const colors = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  const Icon = icons[type];

  return (
    <div className={`border-l-4 p-4 rounded-r-lg ${colors[type]} ${className}`}>
      <div className="flex items-start">
        <Icon className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-sm mb-1">{title}</h3>
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}

interface StepProps {
  number: number;
  title: string;
  description: string;
  completed?: boolean;
}

interface StepByStepGuideProps {
  title: string;
  steps: StepProps[];
  className?: string;
}

export function StepByStepGuide({ title, steps, className = '' }: StepByStepGuideProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <BookOpen className="h-6 w-6 text-blue-600 mr-3" />
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>

      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.number} className="flex items-start">
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mr-4 ${
                step.completed
                  ? 'bg-green-100 text-green-800 border-2 border-green-300'
                  : 'bg-blue-100 text-blue-800 border-2 border-blue-300'
              }`}
            >
              {step.completed ? <CheckCircle className="h-4 w-4" /> : step.number}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>

      {isVisible && (
        <div
          className={`absolute z-50 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg max-w-xs ${positionClasses[position]}`}
        >
          {content}
          <div
            className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              position === 'top'
                ? 'top-full left-1/2 -translate-x-1/2 -mt-1'
                : position === 'bottom'
                  ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1'
                  : position === 'left'
                    ? 'left-full top-1/2 -translate-y-1/2 -ml-1'
                    : 'right-full top-1/2 -translate-y-1/2 -mr-1'
            }`}
          />
        </div>
      )}
    </div>
  );
}

interface FeatureHighlightProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

export function FeatureHighlight({
  title,
  description,
  icon,
  variant = 'default',
}: FeatureHighlightProps) {
  const variants = {
    default: 'bg-gray-50 border-gray-200',
    primary: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
  };

  return (
    <div className={`rounded-lg border p-4 ${variants[variant]}`}>
      <div className="flex items-start">
        {icon && <div className="mr-3 mt-1">{icon}</div>}
        <div>
          <h3 className="font-semibold text-sm mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}

// Predefined step guides for common tasks
export const AGENT_CREATION_STEPS: StepProps[] = [
  {
    number: 1,
    title: 'Agent erstellen',
    description: 'Gehe zu Dashboard → Agents und klicke "Neuen Agent erstellen"',
  },
  {
    number: 2,
    title: 'Grunddaten eingeben',
    description: 'Gib einen Namen und eine Beschreibung für deinen Agent ein',
  },
  {
    number: 3,
    title: 'Firewall konfigurieren',
    description: 'Wähle eine Firewall-Richtlinie (off/shadow/enforce) für Sicherheit',
  },
  {
    number: 4,
    title: 'Tools zuweisen',
    description: 'Gehe zum "Tools" Tab und wähle verfügbare Tools aus',
  },
  {
    number: 5,
    title: 'Testen',
    description: 'Teste deinen Agent mit einer Beispielanfrage',
  },
];

export const TOOL_ASSIGNMENT_STEPS: StepProps[] = [
  {
    number: 1,
    title: 'Agent öffnen',
    description: 'Gehe zu deinem Agent und öffne die Konfigurationsseite',
  },
  {
    number: 2,
    title: 'Tools-Tab öffnen',
    description: 'Klicke auf den "Tools" Tab in der Agent-Konfiguration',
  },
  {
    number: 3,
    title: 'Tools auswählen',
    description: 'Wähle die gewünschten Tools aus der verfügbaren Liste',
  },
  {
    number: 4,
    title: 'Parameter konfigurieren',
    description: 'Gib API-Keys und andere Parameter für die Tools ein',
  },
  {
    number: 5,
    title: 'Speichern',
    description: 'Speichere die Konfiguration und teste die Tools',
  },
];

export const FIREWALL_SETUP_STEPS: StepProps[] = [
  {
    number: 1,
    title: 'Policies verstehen',
    description: 'Verstehe die verschiedenen Firewall-Modi (off/shadow/enforce)',
  },
  {
    number: 2,
    title: 'Richtlinie erstellen',
    description: 'Erstelle eine neue Firewall-Policy unter Firewall → Policies',
  },
  {
    number: 3,
    title: 'Regeln definieren',
    description: 'Definiere Regeln für verschiedene Bedrohungsarten',
  },
  {
    number: 4,
    title: 'Agent zuweisen',
    description: 'Weise die Policy einem oder mehreren Agents zu',
  },
  {
    number: 5,
    title: 'Testen',
    description: 'Teste die Firewall mit dem Shadow-Modus zuerst',
  },
];
