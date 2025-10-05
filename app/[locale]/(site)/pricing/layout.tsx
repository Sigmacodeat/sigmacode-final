import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing | SIGMACODE Neural Firewall',
  description:
    'Enterprise-Preise für SIGMACODE Neural Firewall. Sub-100ms AI-Security für Teams und Unternehmen.',
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
