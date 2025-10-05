/**
 * SIGMACODE AI - Settings Page
 */

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Settings, User, Key, Shield, Bell, CreditCard } from 'lucide-react';
import Link from 'next/link';
import DashboardBreadcrumbs from '@/components/navigation/DashboardBreadcrumbs';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'api-keys', label: 'API-Keys', icon: Key },
    { id: 'security', label: 'Sicherheit', icon: Shield },
    { id: 'notifications', label: 'Benachrichtigungen', icon: Bell },
    { id: 'billing', label: 'Abrechnung', icon: CreditCard },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Einstellungen</h1>
        <p className="text-gray-600">Verwalten Sie Ihr Konto und Ihre Präferenzen</p>
        <DashboardBreadcrumbs />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg border p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-card rounded-lg border p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Profil</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      defaultValue={session?.user?.name || ''}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">E-Mail</label>
                    <input
                      type="email"
                      defaultValue={session?.user?.email || ''}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Speichern
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'api-keys' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">API-Keys</h2>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    + Neuer Key
                  </button>
                </div>
                <div className="text-center py-12 text-gray-500">
                  <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Noch keine API-Keys erstellt</p>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Sicherheit</h2>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Passwort ändern</h3>
                    <button className="text-blue-600 hover:text-blue-700 text-sm">
                      Passwort ändern →
                    </button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Zwei-Faktor-Authentifizierung
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">Nicht aktiviert</p>
                    <button className="text-blue-600 hover:text-blue-700 text-sm">
                      Aktivieren →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Benachrichtigungen</h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">E-Mail-Benachrichtigungen</p>
                      <p className="text-sm text-gray-600">Updates und Neuigkeiten</p>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </label>
                  <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Firewall-Alerts</p>
                      <p className="text-sm text-gray-600">Warnungen bei Threats</p>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Abrechnung</h2>
                  <Link
                    href="/api/billing/portal"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Billing-Portal
                  </Link>
                </div>
                <div className="p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Plan</h3>
                  <p className="text-gray-600 mb-4">1000 Agent-Executions pro Monat</p>
                  <Link
                    href="/api/billing/checkout?plan=pro"
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Upgrade zu Pro
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
