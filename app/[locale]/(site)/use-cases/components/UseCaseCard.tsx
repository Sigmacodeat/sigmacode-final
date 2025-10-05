'use client';

import ThemedCard from '@/components/ui/ThemedCard';
import type { UseCase } from '../useCasesV2';
import {
  Shield,
  CheckCircle,
  Zap,
  Pill,
  Bot,
  Headphones,
  Workflow as WorkflowIcon,
  Search,
  Activity,
  Building2,
} from 'lucide-react';

function CategoryIcon({ category }: { category: UseCase['category'] }) {
  const className = 'text-brand-electric';
  switch (category) {
    case 'security':
      return <Shield size={16} className={className} />;
    case 'compliance':
      return <CheckCircle size={16} className={className} />;
    case 'workflow':
      return <WorkflowIcon size={16} className={className} />;
    case 'infrastructure':
      return <Zap size={16} className={className} />;
    case 'pharma':
      return <Pill size={16} className={className} />;
    case 'multi-agent':
      return <Bot size={16} className={className} />;
    case 'support':
      return <Headphones size={16} className={className} />;
    case 'research':
      return <Search size={16} className={className} />;
    case 'healthcare':
      return <Activity size={16} className={className} />;
    case 'finance':
      return <Building2 size={16} className={className} />;
    case 'gov':
      return <Building2 size={16} className={className} />;
    case 'sales':
    case 'hr':
    case 'legal':
    case 'marketing':
    case 'it':
    case 'ops':
    default:
      return <Shield size={16} className={className} />;
  }
}

export default function UseCaseCard({ item }: { item: UseCase }) {
  // Tone/Pattern nach Kategorie/Slug → auf USP-Töne mappen
  const tone: 'firewall' | 'agents' | 'robotics' | 'appstore' | 'success' | 'danger' | 'brand' =
    // Neural Firewall
    item.category === 'security' || item.slug === 'pii-redaction-firewall'
      ? 'firewall'
      : // AI Agents (Workflows & MAS)
        item.category === 'workflow' || item.category === 'multi-agent'
        ? 'agents'
        : // Healthcare/Compliance behalten grün (Success)
          item.category === 'healthcare' || item.category === 'compliance'
          ? 'success'
          : // Kritische Infrastruktur bleibt Danger (rot)
            item.category === 'infrastructure'
            ? 'danger'
            : // Default Brand Look
              'brand';

  return (
    <ThemedCard
      tone={tone}
      title={item.title}
      description={item.excerpt}
      badges={item.badges}
      kpis={item.kpis}
      href={item.href}
      icon={<CategoryIcon category={item.category} />}
    />
  );
}
