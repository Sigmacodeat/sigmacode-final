'use client';

import {
  Shield,
  Workflow,
  Repeat,
  ArrowRight,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function WorkflowPipeline() {
  const steps = [
    {
      icon: Shield,
      title: 'Pre-Filter',
      description: 'Neural Firewall prüft Eingaben',
      status: 'active' as const,
      color: 'text-green-600',
    },
    {
      icon: Workflow,
      title: 'Dify Workflow',
      description: 'KI-Workflow wird ausgeführt',
      status: 'pending' as const,
      color: 'text-blue-600',
    },
    {
      icon: Shield,
      title: 'Post-Filter',
      description: 'Ausgaben werden validiert',
      status: 'pending' as const,
      color: 'text-purple-600',
    },
  ];

  return (
    <motion.div
      className="bg-card border rounded-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Pipeline: Firewall-Powered Agents</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 items-center gap-4">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <motion.div
              className={`p-3 rounded-full border-2 ${step.status === 'active' ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <step.icon className={`h-6 w-6 ${step.color}`} />
            </motion.div>
            <h4 className="font-medium mt-2 text-sm">{step.title}</h4>
            <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
          </div>
        ))}

        {/* Connection arrows for desktop */}
        <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 w-full max-w-4xl pointer-events-none">
          <ArrowRight className="h-5 w-5 text-muted-foreground absolute left-1/4 transform -translate-x-1/2" />
          <ArrowRight className="h-5 w-5 text-muted-foreground absolute left-3/4 transform -translate-x-1/2" />
        </div>
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium mb-1">Sicherheit gewährleistet</p>
            <p className="text-muted-foreground text-sm">
              Anfragen werden vor und nach der Dify-Ausführung von der Neural Firewall geprüft.
              Shadow/Enforce-Modus, Policies und Redaction sind global konfigurierbar. So bleiben
              Workflows sicher und compliant.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
