import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Settings, Server, Bell, Heart, Key } from 'lucide-react';

export default function FirewallTabsList() {
  return (
    <TabsList className="grid w-full grid-cols-6">
      <TabsTrigger value="overview" className="flex items-center space-x-2">
        <BarChart3 className="h-4 w-4" />
        <span>Overview</span>
      </TabsTrigger>
      <TabsTrigger value="configuration" className="flex items-center space-x-2">
        <Settings className="h-4 w-4" />
        <span>Configuration</span>
      </TabsTrigger>
      <TabsTrigger value="logs" className="flex items-center space-x-2">
        <Server className="h-4 w-4" />
        <span>Logs</span>
      </TabsTrigger>
      <TabsTrigger value="alerts" className="flex items-center space-x-2">
        <Bell className="h-4 w-4" />
        <span>Alerts</span>
      </TabsTrigger>
      <TabsTrigger value="system-health" className="flex items-center space-x-2">
        <Heart className="h-4 w-4" />
        <span>System Health</span>
      </TabsTrigger>
      <TabsTrigger value="api-keys" className="flex items-center space-x-2">
        <Key className="h-4 w-4" />
        <span>API Keys</span>
      </TabsTrigger>
    </TabsList>
  );
}
