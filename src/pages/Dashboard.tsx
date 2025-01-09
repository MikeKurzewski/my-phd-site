import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { ExternalLink, Sun, Moon } from 'lucide-react';

interface Profile {
  name: string | null;
  title: string | null;
  institution: string | null;
  department: string | null;
  bio: string | null;
  profile_image_url: string | null;
  banner_image_url: string | null;
  cv_url: string | null;
  research_interests: string[];
  social_links: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
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
        .select('*')
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
    if (!profile) return 20; // Default to 20% complete after signup

    const fields = [
      { name: 'name', weight: 10 },
      { name: 'title', weight: 10 },
      { name: 'institution', weight: 10 },
      { name: 'department', weight: 10 },
      { name: 'bio', weight: 15 },
      { name: 'profile_image_url', weight: 10 },
      { name: 'banner_image_url', weight: 5 },
      { name: 'cv_url', weight: 10 },
      { name: 'research_interests', weight: 10, isArray: true },
      { name: 'social_links', weight: 10, isObject: true }
    ];

    let completionScore = 0;

    fields.forEach(field => {
      const value = profile[field.name as keyof Profile];
      
      if (field.isArray) {
        if (Array.isArray(value) && value.length > 0) {
          completionScore += field.weight;
        }
      } else if (field.isObject) {
        if (typeof value === 'object' && value !== null) {
          const socialLinks = value as Profile['social_links'];
          if (Object.values(socialLinks).some(link => link && link.trim() !== '')) {
            completionScore += field.weight;
          }
        }
      } else {
        if (value && String(value).trim() !== '') {
          completionScore += field.weight;
        }
      }
    });

    return Math.min(100, Math.max(20, completionScore));
  };

  const completion = calculateProfileCompletion();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--color-primary-400))]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[rgb(var(--color-bg-secondary))] shadow-sm rounded-lg p-6 border border-[rgb(var(--color-border-primary))]">
        <h2 className="text-2xl font-semibold text-[rgb(var(--color-text-primary))] mb-4">
          Welcome{profile?.name ? `, ${profile.name}` : ''}!
        </h2>
        <div className="bg-[rgb(var(--color-bg-primary))] p-4 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Profile Completion</span>
            <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">{completion}%</span>
          </div>
          <div className="w-full bg-[rgb(var(--color-bg-tertiary))] rounded-full h-2">
            <div
              className="bg-[rgb(var(--color-primary-400))] rounded-full h-2 transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-[rgb(var(--color-text-tertiary))]">
            {completion < 100 ? 'Complete your profile to make it more attractive to visitors.' : 'Great job! Your profile is complete.'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[rgb(var(--color-bg-secondary))] shadow-sm rounded-lg p-6 border border-[rgb(var(--color-border-primary))]">
          <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))] mb-4">Quick Actions</h3>
          <ul className="space-y-3">
            <li>
              <a
                href="/profile"
                className="text-[rgb(var(--color-primary-400))] hover:text-[rgb(var(--color-primary-300))] font-medium"
              >
                Complete your profile
              </a>
            </li>
            <li>
              <a
                href="/projects"
                className="text-[rgb(var(--color-primary-400))] hover:text-[rgb(var(--color-primary-300))] font-medium"
              >
                Add a new project
              </a>
            </li>
            <li>
              <a
                href="/publications"
                className="text-[rgb(var(--color-primary-400))] hover:text-[rgb(var(--color-primary-300))] font-medium"
              >
                Add a publication
              </a>
            </li>
          </ul>
        </div>

        <div className="bg-[rgb(var(--color-bg-secondary))] shadow-sm rounded-lg p-6 border border-[rgb(var(--color-border-primary))]">
          <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))] mb-4">Website Preview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-2 rounded-md ${
                    theme === 'light'
                      ? 'bg-[rgb(var(--color-primary-900))] text-[rgb(var(--color-primary-400))]'
                      : 'text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-secondary))]'
                  }`}
                >
                  <Sun className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-2 rounded-md ${
                    theme === 'dark'
                      ? 'bg-[rgb(var(--color-primary-900))] text-[rgb(var(--color-primary-400))]'
                      : 'text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-secondary))]'
                  }`}
                >
                  <Moon className="h-5 w-5" />
                </button>
              </div>
              <a
                href={`/${user?.id}?theme=${theme}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-[rgb(var(--color-primary-500))] hover:bg-[rgb(var(--color-primary-600))] text-white rounded-md font-medium transition-colors"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Launch Website
              </a>
            </div>
            <div className={`aspect-video rounded-md border border-[rgb(var(--color-border-primary))] ${
              theme === 'light' ? 'bg-gray-50' : 'bg-[rgb(var(--color-bg-primary))]'
            } flex items-center justify-center`}>
              <span className={theme === 'light' ? 'text-gray-500' : 'text-[rgb(var(--color-text-tertiary))]'}>
                Preview your website with the selected theme
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}