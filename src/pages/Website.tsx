import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ExternalLink, Mail, Linkedin, Github, Twitter, BookOpen, Briefcase, GraduationCap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../lib/theme';

interface TabProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
      isActive
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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

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
        .order('publication_date', { ascending: false });

      setPublications(publicationsData || []);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
      {/* Header with Banner */}
      <div className="relative h-64 bg-gradient-to-r from-[rgb(var(--color-primary-600))] to-[rgb(var(--color-primary-400))]">
        {profile.banner_image_url && (
          <img
            src={supabase.storage.from('profile-images').getPublicUrl(profile.banner_image_url).data.publicUrl}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>

      {/* Profile Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-32 pb-12">
          <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow-xl p-8 border border-[rgb(var(--color-border-primary))]">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-[rgb(var(--color-bg-secondary))] shadow-xl">
                  {profile.profile_image_url ? (
                    <img
                      src={supabase.storage.from('profile-images').getPublicUrl(profile.profile_image_url).data.publicUrl}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[rgb(var(--color-bg-tertiary))] flex items-center justify-center">
                      <span className="text-4xl text-[rgb(var(--color-text-tertiary))]">
                        {profile.name?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))]">{profile.name}</h1>
                <p className="mt-2 text-xl text-[rgb(var(--color-text-secondary))]">{profile.title}</p>
                <p className="mt-1 text-[rgb(var(--color-text-secondary))]">
                  {profile.institution} • {profile.department}
                </p>

                {/* Social Links */}
                <div className="mt-4 flex justify-center md:justify-start space-x-4">
                  {profile.social_links?.email && (
                    <a
                      href={`mailto:${profile.social_links.email}`}
                      className="text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-secondary))]"
                    >
                      <Mail className="h-6 w-6" />
                    </a>
                  )}
                  {profile.social_links?.linkedin && (
                    <a
                      href={profile.social_links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-secondary))]"
                    >
                      <Linkedin className="h-6 w-6" />
                    </a>
                  )}
                  {profile.social_links?.github && (
                    <a
                      href={profile.social_links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-secondary))]"
                    >
                      <Github className="h-6 w-6" />
                    </a>
                  )}
                  {profile.social_links?.twitter && (
                    <a
                      href={profile.social_links.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-secondary))]"
                    >
                      <Twitter className="h-6 w-6" />
                    </a>
                  )}
                </div>

                {/* Research Interests */}
                {profile.research_interests?.length > 0 && (
                  <div className="mt-6">
                    <div className="flex flex-wrap gap-2">
                      {profile.research_interests.map((interest: string) => (
                        <span
                          key={interest}
                          className="px-3 py-1 rounded-full text-sm font-medium bg-[rgb(var(--color-primary-900))] text-[rgb(var(--color-primary-400))]"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mt-8 border-t border-[rgb(var(--color-border-primary))] pt-6">
              <div className="flex flex-wrap space-x-4 space-y-4">
                <Tab
                  label="About"
                  icon={<BookOpen className="h-5 w-5" />}
                  isActive={activeTab === 'about'}
                  onClick={() => setActiveTab('about')}
                />
                <Tab
                  label="Publications"
                  icon={<BookOpen className="h-5 w-5" />}
                  isActive={activeTab === 'publications'}
                  onClick={() => setActiveTab('publications')}
                />
                <Tab
                  label="Projects"
                  icon={<Briefcase className="h-5 w-5" />}
                  isActive={activeTab === 'projects'}
                  onClick={() => setActiveTab('projects')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="pb-16">
          {/* About Section */}
          {activeTab === 'about' && (
            <div className="space-y-8">
              <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-6 border border-[rgb(var(--color-border-primary))]">
                <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-4">About</h2>
                <p className="text-[rgb(var(--color-text-secondary))]">{profile.bio}</p>
              </div>

              {/* Qualifications Section */}
              {qualifications.length > 0 && (
                <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-6 border border-[rgb(var(--color-border-primary))]">
                  <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-4">Education</h2>
                  <div className="space-y-4">
                    {qualifications.map((qual: any) => (
                      <div key={qual.id} className="flex items-start space-x-4">
                        <div className="mt-1">
                          <GraduationCap className="h-6 w-6 text-[rgb(var(--color-primary-400))]" />
                        </div>
                        <div>
                          <h3 className="font-medium text-[rgb(var(--color-text-primary))]">
                            {qual.degree} in {qual.field}
                          </h3>
                          <p className="text-[rgb(var(--color-text-secondary))]">{qual.institution}</p>
                          <p className="text-sm text-[rgb(var(--color-text-tertiary))]">{qual.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CV Section */}
              {profile.cv_url && (
                <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-6 border border-[rgb(var(--color-border-primary))]">
                  <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-4">Curriculum Vitae</h2>
                  <a
                    href={supabase.storage.from('profile-files').getPublicUrl(profile.cv_url).data.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[rgb(var(--color-primary-400))] hover:text-[rgb(var(--color-primary-300))]"
                  >
                    <ExternalLink className="h-5 w-5 mr-2" />
                    View CV
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Publications Section */}
          {activeTab === 'publications' && (
            <div className="space-y-6">
              {publications.map((pub: any) => (
                <div
                  key={pub.id}
                  className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-6 border border-[rgb(var(--color-border-primary))]"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))]">{pub.title}</h3>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${
                        pub.type === 'preprint'
                          ? 'bg-[rgb(var(--color-warning))] bg-opacity-20 text-[rgb(var(--color-text-primary))]'
                          : 'bg-[rgb(var(--color-success))] bg-opacity-20 text-[rgb(var(--color-text-primary))]'
                      }`}>
                        {pub.type === 'preprint' ? 'Preprint' : 'Published'}
                      </span>
                    </div>
                  </div>
                  <p className="mt-4 text-[rgb(var(--color-text-secondary))]">{pub.abstract}</p>
                  <div className="mt-4 text-sm text-[rgb(var(--color-text-tertiary))]">
                    {pub.authors} • {pub.venue} • {pub.publication_date}
                  </div>
                  {pub.publication_url && (
                    <a
                      href={pub.publication_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center text-[rgb(var(--color-primary-400))] hover:text-[rgb(var(--color-primary-300))]"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Publication
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Projects Section */}
          {activeTab === 'projects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project: any) => (
                <div
                  key={project.id}
                  className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-6 border border-[rgb(var(--color-border-primary))]"
                >
                  <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))]">{project.title}</h3>
                  <p className="mt-2 text-[rgb(var(--color-text-secondary))]">{project.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded-full text-xs font-medium bg-[rgb(var(--color-primary-900))] text-[rgb(var(--color-primary-400))]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 text-sm text-[rgb(var(--color-text-tertiary))]">
                    {project.start_date} - {project.end_date || 'Present'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}