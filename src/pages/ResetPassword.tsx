import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSessionPresent, setResetSessionPresent] = useState(false);
  const { updateUserPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check the URL for hash params (which is where the token will be)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const type = hashParams.get('type');

    // Log to see what's available
    console.log('URL check: ', accessToken, refreshToken, type);

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      console.log('Current session: ', data.session);

      if (data.session) {
        setResetSessionPresent(true);
      }
    };

    checkSession();

    // Listen for auth changes.
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change: ', event, session);

      if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery event detected');
        setResetSessionPresent(true);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await updateUserPassword(password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* To show if reset session is present */}
      {!resetSessionPresent && (
        <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4">
          <div className="bg-[rgb(var(--color-error))] bg-opacity-10 border border-[rgb(var(--color-error))] text-white px-4 py-3 rounded-md">
            No valid password reset session found. This link may have expired or already been used.
          </div>
        </div>
      )}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Lock className="h-12 w-12 text-[rgb(var(--color-primary-400))]" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[rgb(var(--color-text-primary))]">
          Reset Your Password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[rgb(var(--color-bg-secondary))] py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-[rgb(var(--color-border-primary))]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-[rgb(var(--color-error))] bg-opacity-10 border border-[rgb(var(--color-error))] text-white px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-secondary))]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                Confirm New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-secondary))]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={loading}
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
