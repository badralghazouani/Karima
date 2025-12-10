import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }

    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2024-06-20',
      typescript: true,
    });
  }

  return stripeInstance;
}

export const stripe = new Proxy({} as Stripe, {
  get: (target, prop) => {
    const stripeInstance = getStripe();
    const value = stripeInstance[prop as keyof Stripe];
    return typeof value === 'function' ? value.bind(stripeInstance) : value;
  },
});

export const formatAmountForStripe = (amount: number): number => {
  // Stripe expects amounts in cents
  return Math.round(amount * 100);
};

export const formatAmountFromStripe = (amount: number): number => {
  // Convert cents to dollars
  return amount / 100;
};
