import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { ExternalLink, Sun, Moon } from 'lucide-react';

interface Profile {
  name: string | null;
}

export default function Dashboard() {
  const { user } = useAuth();
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
        .select('name')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileCompletion = () => {
    return 20; // Default to 20% complete after signup
  };

  const completion = calculateProfileCompletion();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Welcome{profile?.name ? `, ${profile.name}` : ''}!
        </h2>
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Profile Completion</span>
            <span className="text-sm font-medium text-gray-900">{completion}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 rounded-full h-2"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <ul className="space-y-3">
            <li>
              <a
                href="/profile"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Complete your profile
              </a>
            </li>
            <li>
              <a
                href="/projects"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Add a new project
              </a>
            </li>
            <li>
              <a
                href="/publications"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Add a publication
              </a>
            </li>
          </ul>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Website Preview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-2 rounded-md ${
                    theme === 'light'
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'text-gray-400 hover:text-gray-500'
                  }`}
                >
                  <Sun className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-2 rounded-md ${
                    theme === 'dark'
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'text-gray-400 hover:text-gray-500'
                  }`}
                >
                  <Moon className="h-5 w-5" />
                </button>
              </div>
              <a
                href={`https://preview.phd-website.com/${user?.id}?theme=${theme}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Launch Website
              </a>
            </div>
            <div className={`aspect-video rounded-md border ${
              theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'
            } flex items-center justify-center`}>
              <span className={`text-sm ${
                theme === 'light' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                Preview your website with the selected theme
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}