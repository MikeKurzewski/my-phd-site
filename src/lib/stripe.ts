import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with the public key
const stripePromise = loadStripe('pk_live_51Qex0xGIpe9EVtMnLFXrqtpkRKvl4gnT5qItbeCrUtwJDyEUz6JIb59mrECKAmomAYezmQxlhHAhmbozx23BKaQR00urY2lO8m');

export const createCheckoutSession = async (userId: string) => {
  try {
    const response = await fetch('https://foyumeaalmplfvleuxgr.supabase.co/functions/v1/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: 'price_1QfG2GGIpe9EVtMn1qmrvMMw',
        userId,
      }),
    });

    const { session } = await response.json();
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const getStripe = () => stripePromise;