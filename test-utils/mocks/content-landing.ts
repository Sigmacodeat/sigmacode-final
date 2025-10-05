export const pricing = {
  id: 'pricing',
  title: 'Pricing',
  plans: [
    { name: 'Free', priceMonthly: 0, priceYearly: 0, features: [] },
    { name: 'Starter', priceMonthly: 19, priceYearly: 190, features: [] },
    { name: 'Pro', priceMonthly: 49, priceYearly: 490, features: [] },
    { name: 'Team', priceMonthly: 99, priceYearly: 990, features: [] },
    { name: 'Enterprise', priceMonthly: 0, priceYearly: 0, features: [] },
  ],
  addOns: {
    title: 'Add-Ons',
    items: [
      { label: 'Extra Seats', price: '+€10' },
      { label: 'Priority Support', price: '+€50' },
    ],
  },
};

export default { pricing };
