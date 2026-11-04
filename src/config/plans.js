// Single source of plan prices and limits for the web app (pricing page, sign-up copy, later checkout).
// Prices are in rupees, excluding GST. Keep in sync with the API's plan limits.

export const GST_RATE = 0.18;
export const TRIAL_DAYS = 30;

// The "Upgrade" button stays hidden until online checkout ships.
export const CHECKOUT_ENABLED = false;

export const PLANS = [
  {
    code: 'starter',
    name: 'Starter',
    tagline: 'For small businesses and freelancers',
    prices: { monthly: 599, yearly: 5999 },
    seats: 3,
    accountantSeats: 1,
    features: [
      'Up to 3 users',
      'One free seat for your CA or accountant',
      'All features: invoices, quotes, payments, expenses',
      'GST invoices and GST reports',
      'Bank reconciliation and financial reports',
    ],
  },
  {
    code: 'growth',
    name: 'Growth',
    tagline: 'For growing teams',
    prices: { monthly: 1499 },
    seats: 10,
    accountantSeats: 1,
    highlighted: true,
    features: [
      'Up to 10 users',
      'One free seat for your CA or accountant',
      'Everything in Starter',
      'Approval workflows',
      'API access',
    ],
  },
];

export const priceWithGst = (amount) => Math.round(amount * (1 + GST_RATE));

export const formatInr = (amount) => `₹${amount.toLocaleString('en-IN')}`;

export const gstPercentLabel = `${Math.round(GST_RATE * 100)}%`;
