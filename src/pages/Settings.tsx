import React, { useState, useEffect } from 'react';
import { Globe, Lock, Palette, Sun, Moon } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  username: string;
  theme: 'light' | 'dark';
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
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
      setTheme(data.theme || 'light');
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
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
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>

      <div className="bg-white shadow-sm rounded-lg divide-y">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Globe className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Website URL</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Your Website Address</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  https://
                </span>
                <input
                  type="text"
                  value={profile?.username || ''}
                  readOnly
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none bg-gray-50 border border-gray-300 text-gray-500 sm:text-sm"
                />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  .myphd.site
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Palette className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Website Theme</h3>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleThemeChange('light')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                theme === 'light'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Sun className="h-5 w-5" />
              Light
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                theme === 'dark'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Moon className="h-5 w-5" />
              Dark
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Lock className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Account Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="flex space-x-4">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Reset Password
              </button>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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