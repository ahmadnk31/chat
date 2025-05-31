import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
});

export const STRIPE_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      '1 chatbot',
      '100 messages/month',
      'Basic customization',
      'Email support'
    ],
    limits: {
      chatbots: 1,
      messagesPerMonth: 100,
    }
  },
  pro: {
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      'Unlimited chatbots',
      'Unlimited messages',
      'Advanced customization',
      'Priority support',
      'Analytics dashboard',
      'API access'
    ],
    limits: {
      chatbots: -1, // unlimited
      messagesPerMonth: -1, // unlimited
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: [
      'Everything in Pro',
      'White-label solution',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
      'Custom contracts'
    ],
    limits: {
      chatbots: -1, // unlimited
      messagesPerMonth: -1, // unlimited
    }
  }
};

export function getPlanByPriceId(priceId: string) {
  return Object.entries(STRIPE_PLANS).find(([, plan]) => plan.priceId === priceId)?.[0] || 'free';
}

export function getStripePlan(planName: keyof typeof STRIPE_PLANS) {
  return STRIPE_PLANS[planName];
}
