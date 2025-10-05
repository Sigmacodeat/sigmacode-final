import { useState } from 'react';

const [alerts, setAlerts] = useState<any[]>([]);
const [alertRules, setAlertRules] = useState<any[]>([]);
const [alertStats, setAlertStats] = useState<any>({
  totalAlerts: 0,
  alertsBySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
  alertsByCategory: {
    security_threat: 0,
    system_error: 0,
    performance_issue: 0,
    compliance_violation: 0,
    ml_anomaly: 0,
    manual_trigger: 0,
  },
  resolutionRate: 0,
  avgResolutionTime: 0,
  recentAlerts: [],
});
const [alertFilter, setAlertFilter] = useState({
  status: 'all',
  severity: 'all',
  category: 'all',
});
const [showCreateRule, setShowCreateRule] = useState(false);
const [showAlertStats, setShowAlertStats] = useState(false);
