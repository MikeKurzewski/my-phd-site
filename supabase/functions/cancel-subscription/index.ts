import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@17.5.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY') as string, {
  apiVersion: '2023-10-16',
})

const SITE_URL = Deno.env.get('SITE_URL') || 'http://localhost:5173'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': 'https://myphd.site', // Adjust to your frontend origin
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Invalid HTTP method. Use POST.' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { subId } = await req.json();
    if (!subscriptionId) {
      throw new Error('Missing subscriptionID in request body');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the user from Supabase auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') as string,
      Deno.env.get('SUPABASE_ANON_KEY') as string,
      {
        global: { headers: { Authorization: authHeader } },
      }
    )
    
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const subscription = await stripe.subscriptions.cancel(
        `${subscriptionId}`
      );

    return new Response(
      JSON.stringify({ subscription }),
      { status: 200, headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://myphd.site',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        'Access-Control-Allow-Credentials': 'true', 
      } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://myphd.site',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        'Access-Control-Allow-Credentials': 'true',
        } }
    )
  }
})