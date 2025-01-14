import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { GraduationCap, Github, Mail } from 'lucide-react';

interface SignUpFormData {
  email: string;
  password: string;
  name: string;
  title: string;
  institution: string;
  department: string;
}

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp, signInWithGithub, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignUpFormData>({
    email: '',
    password: '',
    name: '',
    title: '',
    institution: '',
    department: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignUp) {
        await signUp(formData);
      } else {
        await signIn(formData.email, formData.password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleSocialSignIn = async (provider: 'github' | 'google') => {
    try {
      if (provider === 'github') {
        await signInWithGithub();
      } else if (provider === 'google') {
        await signInWithGoogle();
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              {isSignUp && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                      Full Name
                    </label>
                    <div className="mt-1">
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                      Title
                    </label>
                    <div className="mt-1">
                      <input
                        id="title"
                        name="title"
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="institution" className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                      Institution
                    </label>
                    <div className="mt-1">
                      <input
                        id="institution"
                        name="institution"
                        type="text"
                        required
                        value={formData.institution}
                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                      Department
                    </label>
                    <div className="mt-1">
                      <input
                        id="department"
                        name="department"
                        type="text"
                        required
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>
                </>
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

            <div className="mt-6">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full text-center text-sm text-[rgb(var(--color-primary-400))] hover:text-[rgb(var(--color-primary-300))]"
              >
                {isSignUp
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}