import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTheme } from '../lib/theme';
import DefaultLayout from '../layouts/DefaultLayout';
import AcademicLayout from '../layouts/AcademicLayout';
import { TabProps } from '../types/common';

const Tab: React.FC<TabProps> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${isActive
      ? 'bg-[rgb(var(--color-primary-900))] text-[rgb(var(--color-primary-400))]'
      : 'text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))]'
      }`}
  >
    {icon}
    <span className="ml-2">{label}</span>
  </button>
);

export default function Website() {
  const params = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [qualifications, setQualifications] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [publications, setPublications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('about');
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light-teal' | 'dark-teal' | 'light-blue' | 'dark-blue'>('dark-teal');

  useEffect(() => {
    fetchProfileData();
  }, [params.username]);

  useEffect(() => {
    if (profile?.theme) {
      setTheme(profile.theme);
    }
  }, [profile?.theme]);

  useTheme(theme);

  const fetchProfileData = async () => {
    try {
      // Get username from either subdomain or route parameter
      let searchUsername = params.username;
      if (!searchUsername && window.location.hostname.includes('.myphd.site')) {
        searchUsername = window.location.hostname.split('.')[0];
      }

      // If we still don't have a username, show error
      if (!searchUsername) {
        setLoading(false);
        return;
      }

      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', searchUsername)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setLoading(false);
        return;
      }

      if (!profileData) {
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Get qualifications
      const { data: qualificationsData } = await supabase
        .from('qualifications')
        .select('*')
        .eq('user_id', profileData.id)
        .order('year', { ascending: false });

      setQualifications(qualificationsData || []);

      // Get projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', profileData.id)
        .order('start_date', { ascending: false });

      setProjects(projectsData || []);

      // Get publications
      const { data: publicationsData } = await supabase
        .from('publications')
        .select('*')
        .eq('user_id', profileData.id)
        .order('year', { ascending: false });

      setPublications(publicationsData || []);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = (path: string, bucket: string) => {
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--color-primary-400))]"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">Profile Not Found</h1>
          <p className="mt-2 text-[rgb(var(--color-text-secondary))]">The requested profile could not be found.</p>
        </div>
      </div>
    );
  }

  return profile?.layout === 'academic' ? (
    <AcademicLayout
      profile={profile}
      projects={projects}
      publications={publications}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      Tab={Tab}
      getFileUrl={getFileUrl}
    />
  ) : (
    <DefaultLayout
      profile={profile}
      qualifications={qualifications}
      projects={projects}
      publications={publications}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      Tab={Tab}
      getFileUrl={getFileUrl}
    />
  );
}
