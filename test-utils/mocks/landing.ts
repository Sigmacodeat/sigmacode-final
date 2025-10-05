export const pricing = {
  id: 'pricing',
  title: 'Pricing',
  billing: {
    monthlyLabel: 'Monatlich',
    yearlyLabel: 'Jährlich',
    yearlyDiscount: 0.2,
  },
  plans: [
    { id: 'free', name: 'Free', monthly: 0, yearly: 0, bullets: [], cta: { label: 'Select' } },
    {
      id: 'starter',
      name: 'Starter',
      monthly: 10,
      yearly: 100,
      bullets: [],
      cta: { label: 'Select' },
    },
    {
      id: 'pro',
      name: 'Pro',
      monthly: 30,
      yearly: 300,
      bullets: [],
      cta: { label: 'Select' },
      mostPopular: true,
    },
    {
      id: 'business',
      name: 'Business',
      monthly: 60,
      yearly: 600,
      bullets: [],
      cta: { label: 'Select' },
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      monthly: null,
      yearly: null,
      bullets: [],
      cta: { label: 'Contact', href: '/contact' },
    },
  ],
  featureMatrix: {
    headers: ['Feature', 'Free', 'Starter', 'Pro', 'Business', 'Enterprise'],
    rows: [],
  },
  addOns: {
    title: 'Add-Ons',
    items: [
      { label: 'Extra Seats', price: '+€10' },
      { label: 'Priority Support', price: '+€50' },
    ],
  },
};
