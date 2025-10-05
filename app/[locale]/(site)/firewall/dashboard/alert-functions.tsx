export type ToastApi = {
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
};

export function createAlertFunctions(
  setAlerts: (data: any) => void,
  toast: ToastApi,
  tenantId: string = 'default-tenant',
) {
  const loadAlerts = async () => {
    try {
      const response = await fetch(`/api/alerts?tenantId=${tenantId}`);
      if (response.ok) {
        const data = (await response.json().catch(() => ({}))) as { alerts?: any[] };
        setAlerts(data.alerts);
      }
    } catch (err) {
      console.error('Failed to load alerts:', err);
    }
  };

  const loadAlertStats = async () => {
    try {
      const response = await fetch(`/api/alerts/statistics?tenantId=${tenantId}`);
      if (response.ok) {
        const data = (await response.json().catch(() => ({}))) as any;
        setAlerts(data);
      }
    } catch (err) {
      console.error('Failed to load alert stats:', err);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/acknowledge`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'current-user' }),
      });
      if (response.ok) {
        toast.success('Alert acknowledged successfully');
        await loadAlerts();
      }
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
      toast.error('Failed to acknowledge alert');
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'current-user' }),
      });
      if (response.ok) {
        toast.success('Alert resolved successfully');
        await loadAlerts();
      }
    } catch (err) {
      console.error('Failed to resolve alert:', err);
      toast.error('Failed to resolve alert');
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/dismiss`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'current-user' }),
      });
      if (response.ok) {
        toast.success('Alert dismissed');
        await loadAlerts();
      }
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
      toast.error('Failed to dismiss alert');
    }
  };

  return { loadAlerts, loadAlertStats, acknowledgeAlert, resolveAlert, dismissAlert };
}
