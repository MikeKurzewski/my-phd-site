
// Import via bare specifier thanks to the import_map.json file.
import Stripe from 'https://esm.sh/stripe@17.5.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY') as string, {
  // This is needed to use the Fetch API rather than relying on the Node http
  // package.
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})
// This is needed in order to use the Web Crypto API in Deno.
const cryptoProvider = Stripe.createSubtleCryptoProvider()



console.log('Hello from Stripe Webhook!')

Deno.serve(async (request) => {
  const signature = request.headers.get('Stripe-Signature')

  // First step is to verify the event. The .text() method must be used as the
  // verification relies on the raw request body rather than the parsed JSON.
  const body = await request.text()
  let receivedEvent
  try {
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')!,
      undefined,
      cryptoProvider
    )
  } catch (err) {
    return new Response(err.message, { status: 400 })
  }
  console.log(`🔔 Event received: ${receivedEvent.id}`)
  console.log(receivedEvent)

  try {

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Use the service role key for full DB access
    );

    if (receivedEvent.type === 'checkout.session.completed') {
      const session = receivedEvent.data.object as Stripe.Checkout.Session;

      // Get user ID from metadata
      const userId = session.metadata?.user_id;
      if (!userId) {
        throw new Error('user_id missing in metadata');
      }

      // Retrieve the subscription details
      const subscriptionId = session.subscription as string;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      // Extract relevant fields for your Subscription interface
      const subscriptionDetails = {
        status: subscription.status,
        plan: subscription.items.data[0].price.id,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      };

      console.log('Updating subscription for user:', userId);

      // Update the subscriptions table in Supabase
      const { error } = await supabaseClient
        .from('subscriptions')
        .update({
          id: subscription.id,
          status: subscription.status,
          plan: subscription.items.data[0].price.id,
          current_period_end: subscriptionDetails.current_period_end,
          cancel_at_period_end: subscriptionDetails.cancel_at_period_end,
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating subscriptions table:', error.message);
        return new Response('Failed to update subscription', { status: 500 });
      }

      console.log('Subscription updated successfully!');
    }

    if (receivedEvent.type === 'invoice.payment_succeeded') {
      const invoice = receivedEvent.data.object as Stripe.Invoice;
    
      // Extract subscription details
      const subscriptionId = invoice.subscription as string;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
      // Update subscription status in your database
      const { error } = await supabaseClient
        .from('subscriptions')
        .update({
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('id', subscription.id);
    
      if (error) {
        console.error('Failed to update subscription after payment:', error.message);
        return new Response('Database update failed', { status: 500 });
      }
    
      console.log('Subscription updated successfully after payment.');
    }

    if (receivedEvent.type === 'invoice.payment_failed') {
      const invoice = receivedEvent.data.object as Stripe.Invoice;
    
      // Extract subscription ID from the failed invoice
      const subscriptionId = invoice.subscription as string;
    
      console.log(`Payment failed for subscription: ${subscriptionId}`);
    
      try {
        // Update the subscription status to 'canceled' in your database
        const { error } = await supabaseClient
          .from('subscriptions')
          .update({ plan: 'free' }) // Set the status to 'canceled'
          .eq('id', subscriptionId); // Match the subscription ID in your database
    
        if (error) {
          console.error('Failed to cancel subscription:', error.message);
          return new Response('Failed to cancel subscription', { status: 500 });
        }
    
        console.log('Subscription canceled successfully.');
        return new Response('Subscription canceled successfully', { status: 200 });
      } catch (err) {
        console.error('Error handling subscription cancellation:', err.message);
        return new Response('Internal server error', { status: 500 });
      }
    }

    if (receivedEvent.type === 'customer.subscription.deleted') {
      const subscription = receivedEvent.data.object as Stripe.Subscription;

      // Find the user in the subscriptions table by subscription ID
      console.log('Handling subscription cancellation:', subscription.id);

      const { error } = await supabaseClient
        .from('subscriptions')
        .update({ status: 'canceled', updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', subscription.id);

      if (error) {
        console.error('Error updating subscription status:', error.message);
        return new Response('Failed to update subscription status', { status: 500 });
      }

      console.log('Subscription canceled successfully!');
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('Error handling Stripe event:', err.message);
    return new Response('Error handling event', { status: 500 });
  }
})