'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface Props {
  children: ReactNode;
}

// Blendet den globalen Header auf Dashboard-Routen aus: /:locale/dashboard...
export function DashboardHeaderGate({ children }: Props) {
  const pathname = usePathname();
  const hideOnDashboard = /^\/[a-z]{2}\/dashboard(?:\/|$)/.test(pathname ?? '');
  if (hideOnDashboard) return null;
  return <>{children}</>;
}
