import { useState, useEffect } from 'react';
import { useAuth } from './auth';
import { supabase } from './supabase';

interface Subscription {
  id: string;
  status: string;
  plan: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchSubscription();
    }
  }, [user?.id]);

  const fetchSubscription = async () => {
    try {
      const { data, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (subError) throw subError;
      setSubscription(data);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      const response = await fetch('https://foyumeaalmplfvleuxgr.supabase.co/functions/v1/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          priceId: 'price_1Qjf3ZGIpe9EVtMntPBCloj6',
        }),
      });

      const { session } = await response.json();
      window.location.href = session.url;
    } catch (err) {
      console.error('Error starting upgrade:', err);
      setError('Failed to start upgrade process');
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;

    try {
      const response = await fetch('https://foyumeaalmplfvleuxgr.supabase.co/functions/v1/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to cancel subscription');
      
      await fetchSubscription();
    } catch (err) {
      console.error('Error canceling subscription:', err);
      setError('Failed to cancel subscription');
    }
  };

  return {
    subscription,
    loading,
    error,
    handleUpgrade,
    handleCancel,
    refresh: fetchSubscription,
  };
}