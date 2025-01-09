import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
})

const SITE_URL = Deno.env.get('SITE_URL') || 'http://localhost:5173'

serve(async (req) => {
  try {
    const { priceId } = await req.json()
    
    // Get the user from Supabase auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') as string,
      Deno.env.get('SUPABASE_ANON_KEY') as string,
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
      }
    )
    
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      metadata: {
        user_id: user.id,
      },
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${SITE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}`,
    })

    return new Response(
      JSON.stringify({ session }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})