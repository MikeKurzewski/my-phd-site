import React, { useState, useEffect } from 'react';
import { Globe, Lock, Palette, ExternalLink, CreditCard, Layout } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { useTheme } from '../lib/theme';
import { useNavigate } from 'react-router-dom';
import ThemeSelector from '../components/ThemeSelector';
import LayoutSelector from '../components/LayoutSelector';

interface Profile {
  id: string;
  username: string;
  theme:  'dark-teal' | 'dark-bronze' | 'minimal';
  layout: 'default' | 'academic';
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
  const navigate = useNavigate();
  const [isDeletingAcc, setIsDeleting] = useState(false);
  const { deleteAccount } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [theme, setTheme] = useState<'dark-teal' | 'minimal' | 'dark-bronze'>('dark-teal');
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

  useEffect(() => {
    if (profile) {
      setEditingUsername(profile.username || '');
      setTheme(profile.theme || 'dark-teal');
    }
  }, [profile]);

  useTheme(theme);

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account?")) return;

    setIsDeleting(true);
    try {
      const success = await deleteAccount();
      if (success) {
        // Clear local storage to prevent any residual user data from persisting
        // This is important for privacy and security reasons when an account is deleted
        localStorage.clear();

        // Clear session storage as well since it might contain sensitive session data
        sessionStorage.clear();

        // Redirect to home page after clearing storage
        // Using window.location.href ensures a full page reload which helps clear any
        // in-memory state that might still exist in the React application
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete account. Please try again later.');
    } finally {
      setIsDeleting(false);
    }
  }

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      setError('Failed to load profile settings');
    } finally {
      setLoading(false);
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

  const handleThemeChange = async (newTheme: 'dark-teal' | 'dark-bronze' | 'minimal') => {
    try {
      setError(null);
      setSuccess(null);

      const { error } = await supabase
        .from('profiles')
        .update({ theme: newTheme })
        .eq('id', user?.id);

      if (error) throw error;

      setTheme(newTheme);
      setProfile(prev => prev ? { ...prev, theme: newTheme } : null);
      setSuccess('Theme updated successfully');
    } catch (error) {
      console.error('Error updating theme:', error);
      setError('Failed to update theme preference');
    }
  };

  const handleLayoutChange = async (newLayout: 'default' | 'academic') => {
    try {
      setError(null);
      setSuccess(null);

      const { error } = await supabase
        .from('profiles')
        .update({ layout: newLayout })
        .eq('id', user?.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, layout: newLayout } : null);
      setSuccess('Layout updated successfully');
    } catch (error) {
      console.error('Error updating layout:', error);
      setError('Failed to update layout preference');
    }
  };

  const handleUsernameChange = async () => {
    if (!editingUsername.trim() || editingUsername === profile?.username) return;

    try {
      setCheckingUsername(true);
      setError(null);
      setSuccess(null);

      // Check if username exists
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', editingUsername)
        .neq('id', user?.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingUser) {
        setError('Username already exists');
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
    } finally {
      setCheckingUsername(false);
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
    setLoading(true);
    try {
      const response = await fetch('https://foyumeaalmplfvleuxgr.supabase.co/functions/v1/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          priceId: 'price_1R2lN7GIpe9EVtMncwbxlefE',
        }),
      });

      const responseData = await response.json();
      console.log('Backend response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create checkout session');
      }

      const { session } = responseData;
      if (!session || !session.url) {
        throw new Error('Stripe session URL not returned by the server');
      }

      window.location.href = session.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setError('Failed to start upgrade process');
    } finally {
      setLoading(false);

    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;

    console.log(subscription);
    console.log(subscription?.id);

    await fetchSubscription();

    console.log(subscription);
    console.log(subscription?.id);

    try {
      const response = await fetch(`https://foyumeaalmplfvleuxgr.supabase.co/functions/v1/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          subscriptionId: subscription?.id
        })
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
        <div className="bg-[rgb(var(--color-success))] bg-opacity-10 border border-[rgb(var(--color-success))] text-[rgb(var(--color-primary))] px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      <div className="bg-[rgb(var(--color-bg-secondary))] shadow-sm rounded-lg divide-y divide-[rgb(var(--color-border-primary))] border border-[rgb(var(--color-border-primary))]">
        {/* Subscription Section */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-[rgb(var(--color-primary-900))] rounded-lg">
              <CreditCard className="h-6 w-6 text-[rgb(var(--color-primary-400))]" />
            </div>
            <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))]">Subscription</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[rgb(var(--color-text-primary))] font-medium">
                  Current Plan: {subscription?.plan === 'free' ? 'Free' : 'Pro'}
                </p>
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  {subscription?.plan === 'free'
                    ? 'Limited features available'
                    : `Next billing date: ${new Date(subscription?.current_period_end || '').toLocaleDateString()}`
                  }
                </p>
              </div>
              {subscription?.plan === 'free' ? (
                <div>
                <button
                  onClick={handleUpgrade}
                  className="btn-primary"
                >
                 Upgrade to Premium
                </button>

              </div>
              ) : (
                //<button
                //onClick={handleCancelSubscription}
                //className="btn-secondary"
                //disabled={subscription?.cancel_at_period_end}>
                /* {subscription?.cancel_at_period_end ? 'Cancellation Scheduled' : 'Cancel Subscription'} */
                //</button>
                <a
                  href={'https://billing.stripe.com/p/login/5kAbIZ7dnbHR87K3cc' + '?prefilled_email=' + user?.email}
                  className='manageSub'
                >
                  Manage Subscription
                </a>
              )}
            </div>
            {subscription?.plan === 'free' && (
              <div className="bg-[rgb(var(--color-bg-primary))] p-4 rounded-md space-y-2">
                <h4 className="font-medium text-[rgb(var(--color-text-primary))]">Pro Plan Benefits</h4>
                <ul className="space-y-2 text-sm text-[rgb(var(--color-text-secondary))]">
                  <li>• Unlimited projects</li>
                  <li>• More themes</li>
                  <li>• More Layouts</li>
                  <li>• Advanced analytics</li>
                  <li>• Priority support</li>
                </ul>
              </div>
            )}
          </div>
        </div>

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
                  onChange={(e) => setEditingUsername(e.target.value)}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-primary))] focus:ring-[rgb(var(--color-primary-400))] focus:border-[rgb(var(--color-primary-400))]"
                  placeholder="username"
                />
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleUsernameChange}
                  disabled={checkingUsername || !editingUsername.trim() || editingUsername === profile?.username}
                  className="btn-primary"
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

        {/* Theme Section */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-[rgb(var(--color-primary-900))] rounded-lg">
              <Palette className="h-6 w-6 text-[rgb(var(--color-primary-400))]" />
            </div>
            <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))]">Website Theme</h3>
          </div>
          <ThemeSelector
            currentTheme={theme}
            onChange={handleThemeChange}
          />
        </div>

        {/* Layout Selection Section */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-[rgb(var(--color-primary-900))] rounded-lg">
              <Layout className="h-6 w-6 text-[rgb(var(--color-primary-400))]" />
            </div>
            <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))]">Website Layout</h3>
          </div>
          <LayoutSelector
            currentLayout={profile?.layout || 'default'}
            onChange={handleLayoutChange}
          />
        </div>

        {/* Account Settings Section */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-[rgb(var(--color-primary-900))] rounded-lg">
              <Lock className="h-6 w-6 text-[rgb(var(--color-primary-400))]" />
            </div>
            <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))]">Account Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="mt-1 block w-full rounded-md border-[rgb(var(--color-border-primary))] p-2 bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-tertiary))] shadow-sm focus:border-[rgb(var(--color-primary-400))] focus:ring-[rgb(var(--color-primary-400))] sm:text-sm"
              />
            </div>
            <div className="flex space-x-4">
              <button
                className="btn-secondary"
                onClick={() => {/* TODO: Implement password reset */ }}
              >
                Reset Password
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeletingAcc}
                className="btn-secondary"
              >
                {isDeletingAcc ? 'Deleting...' : 'Delete Account'}
              </button>
              <button
                onClick={handleSignOut}
                className="btn-error"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
