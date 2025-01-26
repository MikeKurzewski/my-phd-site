import React, { useState } from 'react';
import { BookOpen, Briefcase, FileText, Mail, Linkedin, Github, Twitter, Menu, X, ExternalLink } from 'lucide-react';
import { TabProps } from '../types/common';
import { EditableField } from '../components/EditableField';

interface AcademicLayoutProps {
  profile: any;
  publications: any[];
  projects: any[];
  qualifications: any[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  Tab: React.FC<TabProps>;
  getFileUrl: (path: string, bucket: string) => string;
  isEditing: boolean;
  onUpdateField: (section: 'profile' | 'publications' | 'projects', id: string, field: string, value: string | File) => void;
  getCurrentValue: (field: string) => string;
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
  isEditing,
  onUpdateField,
}: AcademicLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md lg:hidden bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-primary))]"
      >
        {isSidebarOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar Navigation */}
      <nav className={`
        fixed top-0 left-0 h-full bg-[rgb(var(--color-bg-secondary))] border-r border-[rgb(var(--color-border-primary))]
        transform transition-transform duration-300 ease-in-out z-40
        w-64
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 pt-16 space-y-6">
          {/* Navigation Tabs */}
          <div className="space-y-2">
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
          </div>

          {/* CV Button */}
          {profile.cv_url && (
            <div className="pt-4 border-t border-[rgb(var(--color-border-primary))]">
              <a
                href={getFileUrl(profile.cv_url, 'profile-files')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-primary-400))] transition-colors"
              >
                <FileText className="h-5 w-5 mr-2" />
                <span>Download CV</span>
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="lg:ml-64 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Profile Card */}
          <div className={`${activeTab === 'about' ? 'lg:grid lg:grid-cols-[18rem_1fr]' : ''} gap-8`}>
            {/* Profile Info Section */}
            {activeTab === 'about' && (
              <aside className="mb-8 lg:mb-0">
                {/* Profile Photo */}
                <EditableField
                  type="image"
                  value={profile.profile_image_url}
                  isEditing={isEditing}
                  onChange={(value) => onUpdateField('profile', profile.id, 'profile_image_url', value)}
                  label="Profile Image"
                >
                  <div className="aspect-square relative rounded-lg overflow-hidden mb-6 max-w-xs mx-auto">
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
                </EditableField>

                {/* Profile Info */}
                <div className="space-y-4 text-center lg:text-left">
                  <div className="space-y-1">
                    <h2 className="text-lg font-medium text-[rgb(var(--color-text-primary))]">{profile.title}</h2>
                    <p className="text-[rgb(var(--color-text-secondary))]">{profile.institution}</p>
                    <p className="text-sm text-[rgb(var(--color-text-secondary))]">{profile.department}</p>
                  </div>

                  {/* Social Links */}
                  <div className="flex justify-center lg:justify-start space-x-3">
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
                </div>
              </aside>
            )}

            {/* Content Sections */}
            <div className="space-y-8">
              {activeTab === 'about' && (
                <div className="space-y-8">
                  <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-6 border border-[rgb(var(--color-border-primary))]">
                    <h2 className="text-xl font-semibold">About Me</h2>
                    <EditableField
                      type="textarea"
                      isEditing={isEditing}
                      value={profile.bio}
                      onChange={(value) => onUpdateField('profile', profile.id, 'bio', value)}
                      label="Bio"
                    >
                      <p className="whitespace-pre-wrap text-[rgb(var(--color-text-secondary))]">
                        {profile.bio}
                      </p>
                    </EditableField>
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
              )}

              {activeTab === 'publications' && (
                <div className="space-y-6">
                  {publications.map((pub) => (
                    <div
                      key={pub.id}
                      className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-6 border border-[rgb(var(--color-border-primary))]"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))]">{pub.title}</h3>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${pub.type === 'preprint'
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

              {activeTab === 'projects' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((project) => (
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
      </main>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
