/**
 * SIGMACODE AI - Chat Page
 * Vollständige Chat-Oberfläche mit Dify-Integration
 */

import { Suspense } from 'react';
import { ChatWidget } from '@/components/chat/ChatWidget';
import DashboardBreadcrumbs from '@/components/navigation/DashboardBreadcrumbs';
import { MessageSquare } from 'lucide-react';

export const metadata = {
  title: 'Chat | SIGMACODE AI',
  description: 'Chat with your AI agents',
};

export default function ChatPage() {
  return (
    <div className="container mx-auto py-8 px-4 h-[calc(100vh-8rem)]">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Chat</h1>
          </div>
          <p className="text-muted-foreground">Chatten Sie mit Ihren AI-Agents in Echtzeit</p>
          <DashboardBreadcrumbs />
        </div>

        {/* Chat Widget */}
        <div className="flex-1">
          <Suspense fallback={<div className="animate-pulse bg-card h-full rounded-xl" />}>
            <ChatWidget />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
