import { ExternalLink, Mail, Linkedin, Github, X, BookOpen, Briefcase, FileText } from 'lucide-react';
import { TabProps } from '../types/common';
import MediaLightbox from '../components/MediaLightbox';
import React, { useState, useEffect } from 'react';
import CustomPageLayout from './CustomPageLayout';

interface DefaultLayoutProps {
  profile: any;
  publications: any[];
  qualifications: any[];
  projects: any[];
  customPages: {
    id: string;
    title: string;
    custom_sections: {
      id: string;
      section_title: string;
      content: string;
      section_type: string;
    }[];
  }[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  Tab: React.FC<TabProps>;
  getFileUrl: (path: string, bucket: string) => string;
}

export default function DefaultLayout({
  profile,
  publications,
  projects,
  customPages,
  activeTab,
  onTabChange,
  Tab,
  getFileUrl
}: DefaultLayoutProps) {
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const toggleExpand = (projectId: string) => {
    setExpandedProject(prevId => (prevId === projectId ? null : projectId)); // Collapse if the same, otherwise expand
  };

  const truncateText = (text: string, wordLimit: number) => {
    const words = text.split(' ');
    return words.length > wordLimit ? words.slice(0, wordLimit).join(' ') + '...' : text;
  };
  
  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
      {/* Header with Banner */}
      <div className="relative h-64 bg-gradient-to-r from-[rgb(var(--color-primary-600))] to-[rgb(var(--color-primary-400))]">
        {profile.banner_image_url && (
          <img
            src={getFileUrl(profile.banner_image_url, 'profile-images')}
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
                  {profile.email && (
                    <a
                      href={`mailto:${profile.email}`}
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
                  {profile.social_links?.x && (
                    <a
                      href={profile.social_links.x }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-secondary))]"
                    >
                      <X className="h-6 w-6" />
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
              <div className="flex flex-wrap gap-4">
                {[
                  { label: 'About', icon: <BookOpen className="h-5 w-5" />, key: 'about' },
                  ...(publications.length > 0
                    ? [{ label: 'Publications', icon: <Briefcase className="h-5 w-5" />, key: 'publications' }]
                    : []
                  ),
                  ...(projects.length > 0
                    ? [{ label: 'Projects', icon: <Briefcase className="h-5 w-5" />, key: 'projects' }]
                    : []
                  ),
                  // Inject custom pages as additional tabs
                  ...customPages.map((page: any) => ({
                    label: page.title,
                    icon: <FileText className="h-5 w-5" />,
                    key: `custom-${page.id}`
                  }))
                ].map((tab) => (
                  <Tab
                    key={tab.key}
                    label={tab.label}
                    icon={tab.icon}
                    isActive={activeTab === tab.key}
                    onClick={() => onTabChange(tab.key)}
                  />
                ))}
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

              {/* CV Section */}
              {profile.cv_url && (
                <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-6 border border-[rgb(var(--color-border-primary))]">
                  <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-4">Curriculum Vitae</h2>
                  <a
                    href={getFileUrl(profile.cv_url, 'profile-files')}
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
                    {pub.authors} • {pub.venue} • {pub.year}
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
              {projects.map((project: any) => {
                const isExpanded = expandedProject === project.id;
                const wordLimit = 20;
                return (
                <div
                  key={project.id}
                  className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-6 border border-[rgb(var(--color-border-primary))] cursor-pointer"
                >
                  <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))]">{project.title}</h3>
                  {/* Collapsible Description */}
                  {/* Truncated or Full Description */}
                  <p className="mt-2 text-[rgb(var(--color-text-secondary))] transition-all duration-300">
                    {isExpanded ? project.description : truncateText(project.description, wordLimit)}
                  </p>

                  {isExpanded && project.media_files && project.media_files.length > 0 && (
                        <div className="relative mt-4">
                          {/* Scrollable Container with Auto-Height */}
                          <div className="flex items-center relative">
                            
                            {/* Left Scroll Button */}
                            <button
                              className="absolute left-0 z-10 p-2 bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-primary))] shadow-md rounded-full 
                                        hover:bg-[rgb(var(--color-bg-tertiary))] transition-opacity"
                              onClick={() => {
                                document.getElementById(`media-container-${project.id}`)?.scrollBy({ left: -200, behavior: 'smooth' });
                              }}
                            >
                              ◀
                            </button>

                            {/* Horizontal Scrollable Section */}
                            <div
                              id={`media-container-${project.id}`}
                              className="flex space-x-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-6 py-2 
                                        flex-nowrap w-full relative"
                              style={{ 
                                scrollBehavior: 'smooth',
                                scrollbarWidth: 'none', /* Hide scrollbar for Firefox */
                                msOverflowStyle: 'none' /* Hide scrollbar for IE/Edge */
                              }}
                            >
                              {project.media_files.map((file, index) => (
                                <button
                                  key={index}
                                  className="relative rounded-lg overflow-hidden snap-center flex-shrink-0 hover:opacity-80 transition-opacity"
                                  style={{ width: "auto", height: "auto" }} // Auto size for height
                                  onClick={() => {
                                    window.dispatchEvent(new CustomEvent('openLightbox', {
                                      detail: { media: project.media_files, startIndex: index }
                                    }));
                                  }}
                                >
                                  {file.endsWith('.pdf') ? (
                                    <div className="w-32 h-32 bg-[rgb(var(--color-bg-tertiary))] flex flex-col items-center justify-center p-2">
                                      <FileText className="h-8 w-8 text-[rgb(var(--color-text-tertiary))]" />
                                      <span className="text-xs text-[rgb(var(--color-text-tertiary))] text-center mt-2">
                                        PDF Document
                                      </span>
                                    </div>
                                  ) : (
                                    <img
                                      src={file}
                                      alt={`Project media ${index + 1}`}
                                      className="h-auto w-auto max-h-40 rounded-md object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Image+Error';
                                      }}
                                    />
                                  )}
                                </button>
                              ))}
                            </div>

                            {/* Right Scroll Button */}
                            <button
                              className="absolute right-0 z-10 p-2 bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-primary))] shadow-md rounded-full 
                                        hover:bg-[rgb(var(--color-bg-tertiary))] transition-opacity"
                              onClick={() => {
                                document.getElementById(`media-container-${project.id}`)?.scrollBy({ left: 200, behavior: 'smooth' });
                              }}
                            >
                              ▶
                            </button>
                          </div>
                        </div>
                      )}

                  {/* Read More / Read Less Button */}
                  {project.description.split(' ').length > wordLimit && (
                    <button
                      onClick={() => toggleExpand(project.id)}
                      className="mt-2 text-sm text-[rgb(var(--color-primary-400))] hover:text-[rgb(var(--color-primary-300))] cursor-pointer"
                    >
                      {isExpanded ? "Read less" : "Read more"}
                    </button>
                  )}
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
                  <div>
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center text-[rgb(var(--color-primary-400))] hover:text-[rgb(var(--color-primary-300))]"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Project
                      </a>
                    )}
                  </div>
                  <div className="mt-4 text-sm text-[rgb(var(--color-text-tertiary))]">
                    {project.start_date} - {project.end_date || 'Present'}
                  </div>

                  
                </div>
              )})}
            </div>
          )}

          {activeTab.startsWith('custom-') && (() => {
            const pageId = activeTab.replace('custom-', '');
            const page = customPages.find((p) => p.id === pageId);
            if (page) {
              return (
                <CustomPageLayout
                  title={page.title}
                  sections={page.custom_sections}
                />
              );
            } else {
              return <p>No custom page found.</p>;
            }
          })()}
          </div>
      </div>
      <MediaLightbox />
    </div>
  );
}
