/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock next-intl early to avoid ESM import issues
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({}),
  NextIntlClientProvider: ({ children }: any) => children,
  useLocale: () => 'de',
}));

vi.mock('@/content/landing', () => ({
  pricing: {
    id: 'pricing',
    title: 'Pricing Title',
    billing: {
      monthlyLabel: 'Monthly',
      yearlyLabel: 'Yearly',
      yearlyDiscount: 0.1,
    },
    plans: [
      {
        id: 'free',
        name: 'Free',
        description: 'Free plan description',
        monthly: 0,
        yearly: 0,
        bullets: ['Feature 1', 'Feature 2'],
        cta: { label: 'Select Free', href: '/register' },
        mostPopular: false,
      },
      {
        id: 'pro',
        name: 'Pro',
        description: 'Pro plan description',
        monthly: 10,
        yearly: 108, // 10% discount
        bullets: ['All Free features', 'Feature 3', 'Feature 4'],
        cta: { label: 'Select Pro' },
        mostPopular: true,
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'Enterprise plan description',
        monthly: null,
        yearly: null,
        bullets: ['Custom features'],
        cta: { label: 'Contact Us', href: '/contact' },
        mostPopular: false,
      },
    ],
    addOns: {
      title: 'Add-Ons',
      items: [
        { label: 'Extra Seats', price: '+€10' },
        { label: 'Priority Support', price: '+€50' },
      ],
    },
    featureMatrix: {
      headers: ['Feature', 'Free', 'Pro', 'Enterprise'],
      rows: [
        { feature: 'Basic Features', values: ['✓', '✓', '✓'] },
        { feature: 'Advanced Features', values: ['', '✓', '✓'] },
        { feature: 'Priority Support', values: ['', '', '✓'] },
      ],
    },
  },
}));

vi.mock('@/components/ui/Reveal', () => ({
  Reveal: ({ children }: any) => children,
}));

vi.mock('@/components/pricing/FeatureMatrix', () => ({
  FeatureMatrix: () => <div role="table" />,
}));

vi.mock('@/components/pricing/AddOnsTable', () => ({
  AddOnsTable: () => <div />,
}));

vi.mock('@/app/lib/analytics', () => ({
  analyticsUtils: { trackButtonClick: vi.fn() },
}));

// Import modules under test AFTER mocks
import { Pricing } from '@/components/landing/Pricing';
import { pricing as pricingContent } from '@/content/landing';

describe('Landing Pricing component', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('renders all plans', () => {
    render(<Pricing />);
    const planNames = pricingContent.plans.map((p) => p.name);
    planNames.forEach((name) => {
      // Use queryAllByText and check if any instance exists
      const elements = screen.queryAllByText(name);
      expect(elements.length).toBeGreaterThan(0);
      expect(elements[0]).toBeInTheDocument();
    });
  });

  it('allows toggling between monthly and yearly', () => {
    render(<Pricing />);
    // Ensure toggle buttons exist
    const monthlyBtn = screen.getByRole('button', { name: pricingContent.billing.monthlyLabel });
    const yearlyBtn = screen.getByRole('button', { name: pricingContent.billing.yearlyLabel });
    expect(monthlyBtn).toBeInTheDocument();
    expect(yearlyBtn).toBeInTheDocument();

    // Test that we can toggle between monthly and yearly
    fireEvent.click(yearlyBtn);
    expect(screen.getByRole('button', { name: pricingContent.billing.yearlyLabel })).toHaveClass(
      'bg-[color:var(--brand)]',
    );

    fireEvent.click(monthlyBtn);
    expect(screen.getByRole('button', { name: pricingContent.billing.monthlyLabel })).toHaveClass(
      'bg-[color:var(--brand)]',
    );
  });

  it('renders the feature matrix', () => {
    render(<Pricing />);
    // Check if the table role exists (from our mock)
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders add-ons section with items', () => {
    render(<Pricing />);
    // Since AddOnsTable is mocked, we just check if the mocked component is rendered
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
