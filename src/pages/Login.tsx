import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { GraduationCap, Mail, Eye, EyeOff } from 'lucide-react';
import { checkInvalidEmail } from '../lib/validationUtils';

interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Login() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialMode = searchParams.get('mode');
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [error, setError] = useState<string | null>(null); // State to hold error messages
  const [message, setMessage] = useState(''); // State to hold user messages
  const [loading, setLoading] = useState(false); // Loading state
  const [showPassword, setShowPassword] = useState(false);
  const [showForgetPasswordModal, setShowForgetPasswordModal] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { signIn, signUp, sendPasswordResetEmail } = useAuth();
  const navigate = useNavigate();
  const [resetPasswordEmail, setResetPasswordEmail] = useState('');
  const [formData, setFormData] = useState<SignUpFormData>({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignUp && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true); // Start loading

    try {
      if (isSignUp) {
        setMessage('Setting up your profile...');
        await signUp(formData);
        setMessage('Profile created successfully! Redirecting...');

        // Set session storage after successful signup
        sessionStorage.setItem('newUser', 'true');
        sessionStorage.setItem('setupComplete', 'false');

        setTimeout(() => navigate('/dashboard'), 5000); // Redirect after a delay
      } else {
        await signIn(formData.email, formData.password);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleForgotPassword = async () => {
    if (!resetPasswordEmail || checkInvalidEmail(resetPasswordEmail)) {
      setError('Invalid email address. Please enter a valid email address.');
      return;
    }

    setError(null);
    setIsResettingPassword(true);

    try {
      await sendPasswordResetEmail(resetPasswordEmail);
      setResetEmailSent(true);
      
      setTimeout(() => {
        setShowForgetPasswordModal(false);
        setResetEmailSent(false);
      }, 3000);
    } catch (error) {
      setResetEmailSent(true);
      setTimeout(() => {
        setShowForgetPasswordModal(false);
        setResetEmailSent(false);
      }, 3000);
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <GraduationCap className="h-12 w-12 text-[rgb(var(--color-primary-400))]" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[rgb(var(--color-text-primary))]">
          {isSignUp ? 'Create your account' : 'Sign in to your account'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[rgb(var(--color-bg-secondary))] py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-[rgb(var(--color-border-primary))]">
          <div className="space-y-6">
            {error && (
              <div className="bg-[rgb(var(--color-error))] bg-opacity-10 border border-[rgb(var(--color-error))] text-white px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

              {isSignUp && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
              )}

              <div>
                <button
                  type="submit"
                  className="btn-primary w-full"
                >
                  {isSignUp ? 'Sign up' : 'Sign in'}
                </button>
              </div>
            </form>

            <div className="mt-6 flex flex-col space-y-2">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full text-center text-sm text-[rgb(var(--color-primary-400))] hover:text-[rgb(var(--color-primary-300))]"
              >
                {isSignUp
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"}
              </button>

              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => setShowForgetPasswordModal(true)}
                  className="w-full text-center text-sm text-[rgb(var(--color-primary-400))] hover:text-[rgb(var(--color-primary-300))]"
                >
                  Forgot your password?
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {loading && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-content p-4">
              <p className="text-center mb-4">{message}</p>
              <div className="spinner mx-auto"></div>
            </div>
          </div>
        </div>
      )}
      {/* Forget Password Modal */}
      {showForgetPasswordModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowForgetPasswordModal(false)}
            ></div>

            <div className="inline-block transform overflow-hidden rounded-lg bg-[rgb(var(--color-bg-secondary))] text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              {!resetEmailSent ? (
                <>
                  <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[rgb(var(--color-primary-900))] sm:mx-0 sm:h-10 sm:w-10">
                        <Mail className="h-6 w-6 text-[rgb(var(--color-primary-400))]" />
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg font-medium leading-6 text-[rgb(var(--color-text-primary))]">
                          Reset Password
                        </h3>
                        <div className="mt-2">
                          <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                            Enter your email address to receive a password reset link:
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="reset-email" className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                        Email address
                      </label>
                      <div className="mt-1">
                        <input
                          type="email"
                          id="reset-email"
                          autoComplete="email"
                          required
                          value={resetPasswordEmail}
                          onChange={(e) => setResetPasswordEmail(e.target.value)}
                          className="form-input w-full"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-[rgb(var(--color-bg-primary))] px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="button"
                      className="btn-primary w-full sm:ml-3 sm:w-auto"
                      onClick={handleForgotPassword}
                      disabled={isResettingPassword}
                    >
                      {isResettingPassword ? 'Sending...' : 'Send Reset Link'}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary mt-3 w-full sm:mt-0 sm:w-auto"
                      onClick={() => setShowForgetPasswordModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-6 text-center">
                  <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))]">
                    Email Sent
                  </h3>
                  <p className="mt-2 text-sm text-[rgb(var(--color-text-secondary))]">
                    If an account exists with this email, you'll receive a password reset link shortly.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
