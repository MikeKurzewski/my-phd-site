import React, { useState } from 'react';
import CustomPageLayout from './CustomPageLayout';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  
  // Add ordinal suffix to day
  const ordinal = (day: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = day % 100;
    return day + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return `${ordinal(day)} ${month} ${year}`;
};
import MediaLightbox from '../components/MediaLightbox';
import { BookOpen, Briefcase, FileText, Mail, Linkedin, Github, Menu, X, ExternalLink } from 'lucide-react';
import { TabProps } from '../types/common';
import { EditableField } from '../components/EditableField';

interface CustomSection {
  id: string;
  section_title: string;
  content: string;
}

interface CustomPage {
  id: string;
  title: string;
  position: number;
  custom_sections: CustomSection[];
}

interface AcademicLayoutProps {
  profile: any;
  publications: any[];
  projects: any[];
  qualifications: any[];
  customPages: any[];
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
  customPages,
  activeTab,
  onTabChange,
  Tab,
  getFileUrl,
  isEditing,
  onUpdateField,
}: AcademicLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
            {customPages.map((page) => (
              <Tab
                key={page.id}
                label={page.title}
                icon={<FileText className="h-5 w-5" />}
                isActive={activeTab === `custom-${page.id}`}
                onClick={() => onTabChange(`custom-${page.id}`)}
              />
            ))}
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
                    {profile.email && (
                      <a
                        href={`mailto:${profile.email}`}
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
                    {profile.social_links?.x && (
                      <a
                        href={profile.social_links.x}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-secondary))]"
                      >
                        <X className="h-5 w-5" />
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
                  {projects.map((project) => {
                  const isExpanded = expandedProject === project.id;
                  const wordLimit = 20;
                    return (
                    <div
                      key={project.id}
                      className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-6 border border-[rgb(var(--color-border-primary))]"
                    >
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))]">{project.title}</h3>
                        <div className="text-sm text-[rgb(var(--color-text-tertiary))] ml-4 whitespace-nowrap">
                          {formatDate(project.start_date)} - {project.end_date ? formatDate(project.end_date) : 'Present'}
                        </div>
                      </div>
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
                      
                    </div>
                  )})}
                </div>
              )}
            </div>
          </div>
        </div>

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

      </main>

      {/* Media Lightbox */}
      <MediaLightbox />

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
