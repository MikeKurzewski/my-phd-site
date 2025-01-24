import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTheme } from '../lib/theme';
import DefaultLayout from '../layouts/DefaultLayout';
import AcademicLayout from '../layouts/AcademicLayout';
import { TabProps } from '../types/common';
import { useAuth } from '../lib/auth';
import { Edit2, Save, X } from 'lucide-react';

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
  const [isOwner, setIsOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    fetchProfileData();
  }, [params.username]);

  useEffect(() => {
    if (profile?.theme) {
      setTheme(profile.theme);
    }
  }, [profile?.theme]);

  useEffect(() => {
    if (profile && user) {
      setIsOwner(user.id === profile.id);
    }
  }, [user, profile]);

  useTheme(theme);

  const fetchProfileData = async () => {
    try {
      // Get username from either subdomain or route parameter
      // Subdomain if visited directly, route parameter if accessed via path (from 'launch website')
      let searchUsername = params.username;
      if (searchUsername) {
        setIsOwner(true);
      }
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

      setIsOwner(user?.id === profileData?.id);
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

  const handleFieldUpdate = (field: string, value: string) => {
    setPendingChanges(prev => ({
      ...prev,
      [field]: value,
    }));
  };


  const EditControls = () => {
    const handleEdit = () => {
      console.log('Entering edit mode');
      setIsEditing(true);
    };


    const handleSave = async () => {
      try {
        // Save to Supabase
        const { error } = await supabase
          .from('profiles')
          .update(pendingChanges)
          .eq('id', profile.id);

        if (error) throw error;

        // Update local state
        setProfile(prev => ({
          ...prev,
          ...pendingChanges
        }));
        setPendingChanges({});
        setIsEditing(false);
      } catch (error) {
        console.error('Error saving changes:', error);
      }
    };
    const handleExit = () => {
      console.log('Exiting edit mode');
      setIsEditing(false);
      // Probably should add a discard changes confirmation here.
    };

    if (isEditing) {
      return (
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <button
            onClick={handleSave}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
          <button
            onClick={handleExit}
            className="btn-secondary flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Exit
          </button>
        </div>
      );
    };

    return (
      <button
        onClick={handleEdit}
        className="fixed top-4 right-4 z-50 btn-primary flex items-center gap-2"
      >
        <Edit2 className="h-4 w-4" />
        Edit Profile
      </button>
    );
  };

  // Rendering logic
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

  return (
    <div className="relative">
      {isOwner && <EditControls />}
      {profile?.layout === 'academic' ? (
        <AcademicLayout
          profile={profile}
          qualifications={qualifications}
          projects={projects}
          publications={publications}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          Tab={Tab}
          getFileUrl={getFileUrl}
          isEditing={isEditing}
          onUpdateField={handleFieldUpdate}
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
      )}
    </div>
  );
}
