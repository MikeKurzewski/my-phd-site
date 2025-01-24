import { loadStripe } from '@stripe/stripe-js';
//import {Stripe} from 'https://esm.sh/stripe@12.0.0'


// Initialize Stripe with the public key
const stripePromise = loadStripe('pk_test_51Qex0xGIpe9EVtMn37Z9Ou47dMiBRT2iuDKAOQDj5F6RYeqCYD9wo7hBMFPaLA65MUmeQP5OS2nMJrTsLsCjpZIb00oLJZvLtq');

export const createCheckoutSession = async (userId: string) => {
  try {
    const response = await fetch('https://foyumeaalmplfvleuxgr.supabase.co/functions/v1/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: 'price_1QkiEMGIpe9EVtMn1py26ZaI',
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