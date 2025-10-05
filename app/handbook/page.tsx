'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Users,
  Settings,
  Shield,
  Zap,
  Database,
  ChevronRight,
  ExternalLink,
  Play,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  InfoPanel,
  StepByStepGuide,
  Tooltip,
  FeatureHighlight,
  AGENT_CREATION_STEPS,
  TOOL_ASSIGNMENT_STEPS,
  FIREWALL_SETUP_STEPS,
} from '@/components/ui/handbook/HandbookComponents';

interface HandbookSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  estimatedTime: string;
}

export default function HandbookPage() {
  const [activeSection, setActiveSection] = useState<string>('overview');

  const sections: HandbookSection[] = [
    {
      id: 'overview',
      title: 'Übersicht',
      description: 'Was ist SIGMACODE AI und wie funktioniert es?',
      icon: <BookOpen className="h-6 w-6" />,
      estimatedTime: '5 min',
      content: (
        <div className="space-y-6">
          <InfoPanel title="Willkommen bei SIGMACODE AI" type="info">
            SIGMACODE AI ist eine fortschrittliche Plattform für die Erstellung und Verwaltung von
            AI-Agents. Du kannst hier eigene Agents erstellen, ihnen Tools zuweisen und sie über
            eine Firewall absichern.
          </InfoPanel>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureHighlight
              title="Agent-Erstellung"
              description="Erstelle eigene AI-Agents mit individuellen Fähigkeiten und Persönlichkeiten"
              icon={<Users className="h-5 w-5 text-blue-600" />}
              variant="primary"
            />
            <FeatureHighlight
              title="Tool-Integration"
              description="Weise deinen Agents verschiedene Tools zu - von Datenbanken bis zu APIs"
              icon={<Settings className="h-5 w-5 text-green-600" />}
              variant="success"
            />
            <FeatureHighlight
              title="Sicherheit"
              description="Schütze deine Agents mit einer intelligenten Firewall"
              icon={<Shield className="h-5 w-5 text-red-600" />}
              variant="warning"
            />
          </div>
        </div>
      ),
    },
    {
      id: 'agents',
      title: 'Agents erstellen',
      description: 'Wie du eigene AI-Agents erstellst und konfigurierst',
      icon: <Users className="h-6 w-6" />,
      estimatedTime: '10 min',
      content: (
        <div className="space-y-6">
          <StepByStepGuide
            title="Agent-Erstellung Schritt für Schritt"
            steps={AGENT_CREATION_STEPS}
          />

          <InfoPanel title="Wichtige Agent-Einstellungen" type="warning">
            <div className="space-y-2">
              <p>
                <strong>Firewall-Modus:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  <code>off</code>: Keine Sicherheitsprüfung (nur für Entwicklung)
                </li>
                <li>
                  <code>shadow</code>: Prüfung ohne Blockierung (für Tests)
                </li>
                <li>
                  <code>enforce</code>: Strenge Prüfung mit Blockierung (Produktion)
                </li>
              </ul>
            </div>
          </InfoPanel>
        </div>
      ),
    },
    {
      id: 'tools',
      title: 'Tools zuweisen',
      description: 'Wie du deinen Agents Tools und Fähigkeiten gibst',
      icon: <Settings className="h-6 w-6" />,
      estimatedTime: '8 min',
      content: (
        <div className="space-y-6">
          <StepByStepGuide
            title="Tools zuweisen Schritt für Schritt"
            steps={TOOL_ASSIGNMENT_STEPS}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoPanel title="Verfügbare Tool-Kategorien" type="info">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-blue-600" />
                  <span>
                    <strong>LLM:</strong> Sprachmodelle (ChatGPT, Claude)
                  </span>
                </div>
                <div className="flex items-center">
                  <Database className="h-4 w-4 mr-2 text-green-600" />
                  <span>
                    <strong>Database:</strong> Datenbank-Tools (SQL, Vector Search)
                  </span>
                </div>
                <div className="flex items-center">
                  <Settings className="h-4 w-4 mr-2 text-purple-600" />
                  <span>
                    <strong>API:</strong> Externe API-Aufrufe
                  </span>
                </div>
              </div>
            </InfoPanel>

            <InfoPanel title="Tool-Konfiguration" type="success">
              Die meisten Tools benötigen API-Keys oder andere Authentifizierungsdaten. Diese werden
              sicher gespeichert und nur für den Agent verwendet.
            </InfoPanel>
          </div>
        </div>
      ),
    },
    {
      id: 'firewall',
      title: 'Firewall & Sicherheit',
      description: 'Wie du deine Agents vor Bedrohungen schützt',
      icon: <Shield className="h-6 w-6" />,
      estimatedTime: '12 min',
      content: (
        <div className="space-y-6">
          <StepByStepGuide
            title="Firewall einrichten Schritt für Schritt"
            steps={FIREWALL_SETUP_STEPS}
          />

          <InfoPanel title="Firewall-Modi erklärt" type="warning">
            <div className="space-y-3">
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-1">Enforce-Modus</h4>
                <p className="text-sm text-red-700">
                  Blockiert gefährliche Anfragen sofort. Verwende diesen Modus nur in Produktion
                  nach gründlichen Tests.
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-1">Shadow-Modus</h4>
                <p className="text-sm text-yellow-700">
                  Prüft Anfragen aber blockiert nicht. Ideal zum Testen von Richtlinien.
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-1">Off-Modus</h4>
                <p className="text-sm text-gray-700">
                  Keine Sicherheitsprüfung. Nur für Entwicklung verwenden.
                </p>
              </div>
            </div>
          </InfoPanel>
        </div>
      ),
    },
    {
      id: 'troubleshooting',
      title: 'Fehlerbehebung',
      description: 'Häufige Probleme und Lösungen',
      icon: <AlertTriangle className="h-6 w-6" />,
      estimatedTime: '5 min',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Agent antwortet nicht</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>1. Prüfe AI-Provider-Konfiguration</p>
                <p>2. Teste den Agent einzeln</p>
                <p>3. Prüfe Firewall-Einstellungen</p>
                <p>4. Kontrolliere Logs für Fehler</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Tools funktionieren nicht</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>1. Prüfe API-Keys und Berechtigungen</p>
                <p>2. Teste Tool separat</p>
                <p>3. Prüfe Firewall-Konfiguration</p>
                <p>4. Kontaktiere Support bei API-Problemen</p>
              </div>
            </div>
          </div>

          <InfoPanel title="Support kontaktieren" type="info">
            <div className="space-y-2">
              <p>1. Prüfe die Logs zuerst (Dashboard → Logs)</p>
              <p>2. Dokumentiere das Problem genau</p>
              <p>3. Kontaktiere das Entwicklerteam über:</p>
              <ul className="list-disc list-inside ml-4">
                <li>GitHub Issues für Bugs</li>
                <li>Discord für Community-Hilfe</li>
                <li>Email für dringende Probleme</li>
              </ul>
            </div>
          </InfoPanel>
        </div>
      ),
    },
  ];

  const activeSectionData = sections.find((s) => s.id === activeSection);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SIGMACODE AI Handbuch</h1>
                <p className="text-sm text-gray-600">
                  Lerne, wie du Agents erstellst und verwaltest
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Tooltip content="Vollständiges Handbuch als PDF herunterladen">
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  PDF Download
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Kapitel</h2>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-50 border-blue-200 text-blue-900'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className={`p-2 rounded-lg mr-3 ${
                              activeSection === section.id ? 'bg-blue-100' : 'bg-gray-100'
                            }`}
                          >
                            {section.icon}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{section.title}</div>
                            <div className="text-xs text-gray-500">{section.estimatedTime}</div>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-8">
                {activeSectionData && (
                  <>
                    <div className="flex items-center mb-6">
                      <div className="p-3 bg-blue-100 rounded-lg mr-4">
                        {activeSectionData.icon}
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                          {activeSectionData.title}
                        </h1>
                        <p className="text-gray-600 mt-1">{activeSectionData.description}</p>
                      </div>
                    </div>

                    {activeSectionData.content}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
