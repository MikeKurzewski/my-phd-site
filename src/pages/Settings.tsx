import React, { useState, useEffect } from 'react';
import { Globe, Lock, Palette, Sun, Moon, ExternalLink, CreditCard } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  username: string;
  theme: 'light' | 'dark';
}

interface Subscription {
  id: string;
  status: string;
  plan: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingUsername, setEditingUsername] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
      fetchSubscription();
    }
  }, [user?.id]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setEditingUsername(data.username || '');
      setTheme(data.theme || 'light');
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile settings');
    } finally {
      setLoading(false);
    }
  };

  const checkUsernameAvailability = async (username: string) => {
    try {
      setCheckingUsername(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .neq('id', user?.id) // Exclude current user's username
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows returned means username is available
        return true;
      }
      
      if (data) {
        // Username exists
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = async () => {
    try {
      setError(null);
      setSuccess(null);

      // Validate username format
      const usernameRegex = /^[a-z0-9-]+$/;
      if (!usernameRegex.test(editingUsername)) {
        setError('Username can only contain lowercase letters, numbers, and hyphens');
        return;
      }

      // Check username availability
      const isAvailable = await checkUsernameAvailability(editingUsername);
      if (!isAvailable) {
        setError('This username is already taken');
        return;
      }

      // Update username
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username: editingUsername })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setSuccess('Username updated successfully');
      setProfile(prev => prev ? { ...prev, username: editingUsername } : null);
    } catch (error) {
      console.error('Error updating username:', error);
      setError('Failed to update username');
    }
  };

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ theme: newTheme })
        .eq('id', user?.id);

      if (error) throw error;
      setTheme(newTheme);
    } catch (error) {
      console.error('Error updating theme:', error);
      setError('Failed to update theme preference');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out');
    }
  };

  const handleUpgrade = async () => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          priceId: 'price_H5ggYwtDq4fbrJ',
        }),
      });

      const { session } = await response.json();
      window.location.href = session.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setError('Failed to start upgrade process');
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;

    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to cancel subscription');
      
      await fetchSubscription();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      setError('Failed to cancel subscription');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--color-primary-400))]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-[rgb(var(--color-text-primary))]">Settings</h2>

      {error && (
        <div className="bg-[rgb(var(--color-error))] bg-opacity-10 border border-[rgb(var(--color-error))] text-[rgb(var(--color-error))] px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-[rgb(var(--color-success))] bg-opacity-10 border border-[rgb(var(--color-success))] text-[rgb(var(--color-success))] px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      <div className="bg-[rgb(var(--color-bg-secondary))] shadow-sm rounded-lg divide-y divide-[rgb(var(--color-border-primary))] border border-[rgb(var(--color-border-primary))]">
        {/* Website URL Section */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-[rgb(var(--color-primary-900))] rounded-lg">
              <Globe className="h-6 w-6 text-[rgb(var(--color-primary-400))]" />
            </div>
            <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))]">Website URL</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">Your Website Address</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-tertiary))] text-sm">
                  https://myphd.site/
                </span>
                <input
                  type="text"
                  value={editingUsername}
                  onChange={(e) => {
                    setEditingUsername(e.target.value.toLowerCase());
                    setError(null);
                    setSuccess(null);
                  }}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-primary))] text-sm focus:ring-[rgb(var(--color-primary-400))] focus:border-[rgb(var(--color-primary-400))]"
                  placeholder="your-username"
                />
              </div>
              <div className="mt-2 flex justify-between items-center">
                <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
                  Only lowercase letters, numbers, and hyphens are allowed
                </p>
                <button
                  onClick={handleUsernameChange}
                  disabled={checkingUsername || editingUsername === profile?.username}
                  className="btn-primary text-sm"
                >
                  {checkingUsername ? 'Checking...' : 'Update Username'}
                </button>
              </div>
            </div>
            <a
              href={`https://myphd.site/${profile?.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-[rgb(var(--color-primary-400))] hover:text-[rgb(var(--color-primary-300))]"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit your website
            </a>
          </div>
        </div>

        {/* Rest of the settings component remains the same */}
        {/* ... */}
      </div>
    </div>
  );
}