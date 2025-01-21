import { FileText, Mail, Linkedin, Github, Twitter, ExternalLink } from 'lucide-react';

interface AcademicLayoutProps {
  profile: any;
  publications: any[];
  projects: any[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  Tab: React.FC<TabProps>;
  getFileUrl: (path: string, bucket: string) => string;
}

export default function AcademicLayout({
  profile,
  publications,
  projects,
  activeTab,
  onTabChange,
  Tab,
  getFileUrl,
}: AcademicLayoutProps) {
  // Rest of your component code
  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]" >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Sidebar */}
          <div className="w-full md:w-72 space-y-6">
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

            {/* Info */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-medium text-[rgb(var(--color-text-primary))]">{profile.title}</h2>
                <p className="text-[rgb(var(--color-text-secondary))]">{profile.institution}</p>
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">{profile.department}</p>
              </div>

              {/* Contact Links */}
              <div className="flex flex-row space-y-2">
                {profile.social_links?.email && (
                  <a
                    href={`mailto:${profile.social_links.email}`}
                    className="flex items-center text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {profile.social_links.email}
                  </a>
                )}
                {profile.social_links?.linkedin && (
                  <a
                    href={profile.social_links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                  >
                    <Linkedin className="h-4 w-4 mr-2" />
                  </a>
                )}
                {profile.social_links?.github && (
                  <a
                    href={profile.social_links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                  >
                    <Github className="h-4 w-4 mr-2" />
                  </a>
                )}
                {profile.social_links?.twitter && (
                  <a
                    href={profile.social_links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                  >
                    <Twitter className="h-4 w-4 mr-2" />
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
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Bio */}
            <div className="prose prose-lg max-w-none">
              <p className="text-[rgb(var(--color-text-secondary))]">{profile.bio}</p>
            </div>

            {/* Education & Interests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-4">Education</h2>
                <div className="space-y-4">
                  {profile.qualifications?.map((qual) => (
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
                  {profile.research_interests?.map((interest) => (
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
    </div>
  );
}

