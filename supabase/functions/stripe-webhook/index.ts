import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
})

// Use the provided webhook secret
const webhookSecret = 'whsec_3wxGpdBu3Zcf8pZhCKc8JVeO48LqGxeM'

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const event = stripe.webhooks.constructEvent(
      await req.text(),
      signature,
      webhookSecret
    )

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') as string,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    )

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object
        await supabase
          .from('subscriptions')
          .upsert({
            id: subscription.id,
            user_id: subscription.metadata.user_id,
            status: subscription.status,
            plan: subscription.items.data[0].price.lookup_key,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('id', deletedSubscription.id)
        break
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (err) {
    console.error('Error processing webhook:', err)
    return new Response('Webhook Error', { status: 400 })
  }
})