import React from 'react';
import { BookOpen, Briefcase, FileText, Mail, Linkedin, Github, Twitter } from 'lucide-react';
import { TabProps } from '../types/common';

interface AcademicLayoutProps {
  profile: any;
  publications: any[];
  projects: any[];
  qualifications: any[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  Tab: React.FC<TabProps>;
  getFileUrl: (path: string, bucket: string) => string;
}

export default function AcademicLayout({
  profile,
  publications,
  projects,
  qualifications,
  activeTab,
  onTabChange,
  Tab,
  getFileUrl,
}: AcademicLayoutProps) {
  return (
    // Main grid layout
    <div className="grid grid-cols-[16rem_1fr] min-h-screen bg-[rgb(var(--color-bg-primary))]">
      {/* Sidebar Navigation */}
      <nav className="bg-[rgb(var(--color-bg-secondary))] border-r border-[rgb(var(--color-border-primary))] p-6 space-y-2">
        <Tab
          label="About"
          icon={<BookOpen className="h-5 w-5" />}
          isActive={activeTab === 'about'}
          onClick={() => onTabChange('about')}
        />
        {publications.length > 0 && (
          <Tab
            label="Publications"
            icon={<BookOpen className="h-5 w-5" />}
            isActive={activeTab === 'publications'}
            onClick={() => onTabChange('publications')}
          />
        )}
        {projects.length > 0 && (
          <Tab
            label="Projects"
            icon={<Briefcase className="h-5 w-5" />}
            isActive={activeTab === 'projects'}
            onClick={() => onTabChange('projects')}
          />
        )}
      </nav>

      {/* Main Content Area */}
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-[18rem_1fr] gap-8">
            {/* Profile Sidebar */}
            <aside className="space-y-6">
              {/* Profile Photo */}
              <div className="aspect-square relative rounded-lg overflow-hidden">
                {profile.profile_image_url ? (
                  <img
                    src={getFileUrl(profile.profile_image_url, 'profile-images')}
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

              {/* Profile Info */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-medium text-[rgb(var(--color-text-primary))]">{profile.title}</h2>
                  <p className="text-[rgb(var(--color-text-secondary))]">{profile.institution}</p>
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">{profile.department}</p>
                </div>

                {/* Social Links */}
                <div className="flex space-x-3">
                  {profile.social_links?.email && (
                    <a
                      href={`mailto:${profile.social_links.email}`}
                      className="text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-secondary))]"
                    >
                      <Mail className="h-5 w-5" />
                    </a>
                  )}
                  {profile.social_links?.linkedin && (
                    <a
                      href={profile.social_links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-secondary))]"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {profile.social_links?.github && (
                    <a
                      href={profile.social_links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-secondary))]"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  )}
                  {profile.social_links?.twitter && (
                    <a
                      href={profile.social_links.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-secondary))]"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                </div>

                {/* CV Button */}
                {profile.cv_url && (
                  <a
                    href={getFileUrl(profile.cv_url, 'profile-files')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full px-4 py-2 bg-[rgb(var(--color-primary-400))] text-white rounded-md hover:bg-[rgb(var(--color-primary-500))] transition-colors"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Download CV
                  </a>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <div className="space-y-8">
              {/* Bio */}
              <div className="prose prose-lg max-w-none">
                <p className="text-[rgb(var(--color-text-secondary))]">{profile.bio}</p>
              </div>

              {/* Education & Interests */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-4">Education</h2>
                  <div className="space-y-4">
                    {qualifications?.map((qual) => (
                      <div key={qual.id} className="space-y-1">
                        <h3 className="font-medium text-[rgb(var(--color-text-primary))]">
                          {qual.degree} in {qual.field}
                        </h3>
                        <p className="text-[rgb(var(--color-text-secondary))]">{qual.institution}</p>
                        <p className="text-sm text-[rgb(var(--color-text-tertiary))]">{qual.year}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-4">Research Interests</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.research_interests?.map((interest: string) => (
                      <span
                        key={interest}
                        className="px-3 py-1 rounded-full text-sm font-medium bg-[rgb(var(--color-primary-900))] text-[rgb(var(--color-primary-400))]"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
