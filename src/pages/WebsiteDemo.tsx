import React from 'react';
import { ExternalLink, Mail, Linkedin, Github, Twitter, BookOpen, Briefcase } from 'lucide-react';

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

export default function WebsiteDemo() {
  const [activeTab, setActiveTab] = React.useState('about');

  const demoProfile = {
    name: "Dr. Jane Smith",
    title: "Assistant Professor of Computer Science",
    institution: "Example University",
    department: "Department of Computer Science",
    bio: "I am a researcher in artificial intelligence and machine learning, focusing on developing interpretable AI systems that can explain their decision-making processes. My work combines theoretical foundations with practical applications in healthcare and robotics.",
    research_interests: ["Artificial Intelligence", "Machine Learning", "Interpretable AI", "Healthcare AI", "Robotics"],
    social_links: {
      email: "example@university.edu",
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      twitter: "https://twitter.com"
    }
  };

  const demoPublications = [
    {
      id: "1",
      title: "Understanding Deep Neural Networks through Interpretable Visualizations",
      type: "publication",
      abstract: "This paper presents a novel approach to visualizing and interpreting the decision-making processes of deep neural networks, making them more transparent and trustworthy for critical applications.",
      authors: "Jane Smith, John Doe, Sarah Johnson",
      venue: "International Conference on Machine Learning (ICML)",
      publication_date: "2024-01-15",
      publication_url: "#"
    },
    {
      id: "2",
      title: "Towards Explainable AI in Healthcare: A Case Study in Medical Diagnosis",
      type: "preprint",
      abstract: "We propose a new framework for making AI-driven medical diagnosis systems more interpretable and trustworthy, enabling healthcare professionals to understand and validate AI recommendations.",
      authors: "Jane Smith, Michael Brown",
      venue: "arXiv",
      publication_date: "2024-02-01",
      publication_url: "#"
    }
  ];

  const demoProjects = [
    {
      id: "1",
      title: "Interpretable AI for Medical Imaging",
      description: "Developing interpretable deep learning models for medical image analysis, with a focus on explaining model decisions to healthcare professionals.",
      tags: ["Deep Learning", "Healthcare", "Computer Vision"],
      start_date: "2023-01",
      end_date: "Present"
    },
    {
      id: "2",
      title: "Robotic Learning from Demonstration",
      description: "Research on enabling robots to learn complex tasks from human demonstrations while providing explanations for their learned behaviors.",
      tags: ["Robotics", "Machine Learning", "Human-Robot Interaction"],
      start_date: "2023-06",
      end_date: "Present"
    }
  ];

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
      {/* Header with Banner */}
      <div className="relative h-64 bg-gradient-to-r from-[rgb(var(--color-primary-600))] to-[rgb(var(--color-primary-400))]">
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
                  <div className="w-full h-full bg-[rgb(var(--color-bg-tertiary))] flex items-center justify-center">
                    <span className="text-4xl text-[rgb(var(--color-text-tertiary))]">
                      {demoProfile.name.charAt(0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))]">{demoProfile.name}</h1>
                <p className="mt-2 text-xl text-[rgb(var(--color-text-secondary))]">{demoProfile.title}</p>
                <p className="mt-1 text-[rgb(var(--color-text-secondary))]">
                  {demoProfile.institution} • {demoProfile.department}
                </p>

                {/* Social Links */}
                <div className="mt-4 flex justify-center md:justify-start space-x-4">
                  <a href="#" className="text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-secondary))]">
                    <Mail className="h-6 w-6" />
                  </a>
                  <a href="#" className="text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-secondary))]">
                    <Linkedin className="h-6 w-6" />
                  </a>
                  <a href="#" className="text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-secondary))]">
                    <Github className="h-6 w-6" />
                  </a>
                  <a href="#" className="text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-secondary))]">
                    <Twitter className="h-6 w-6" />
                  </a>
                </div>

                {/* Research Interests */}
                <div className="mt-6">
                  <div className="flex flex-wrap gap-2">
                    {demoProfile.research_interests.map((interest) => (
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

            {/* Navigation Tabs */}
            <div className="mt-8 border-t border-[rgb(var(--color-border-primary))] pt-6">
              <div className="flex space-x-4">
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
                <p className="text-[rgb(var(--color-text-secondary))]">{demoProfile.bio}</p>
              </div>
            </div>
          )}

          {/* Publications Section */}
          {activeTab === 'publications' && (
            <div className="space-y-6">
              {demoPublications.map((pub) => (
                <div
                  key={pub.id}
                  className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-6 border border-[rgb(var(--color-border-primary))]"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))]">{pub.title}</h3>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${
                        pub.type === 'preprint'
                          ? 'bg-[rgb(var(--color-warning))] bg-opacity-20 text-[rgb(var(--color-warning))]'
                          : 'bg-[rgb(var(--color-success))] bg-opacity-20 text-[rgb(var(--color-success))]'
                      }`}>
                        {pub.type === 'preprint' ? 'Preprint' : 'Published'}
                      </span>
                    </div>
                  </div>
                  <p className="mt-4 text-[rgb(var(--color-text-secondary))]">{pub.abstract}</p>
                  <div className="mt-4 text-sm text-[rgb(var(--color-text-tertiary))]">
                    {pub.authors} • {pub.venue} • {pub.publication_date}
                  </div>
                  <a
                    href={pub.publication_url}
                    className="mt-4 inline-flex items-center text-[rgb(var(--color-primary-400))] hover:text-[rgb(var(--color-primary-300))]"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Publication
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Projects Section */}
          {activeTab === 'projects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {demoProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-6 border border-[rgb(var(--color-border-primary))]"
                >
                  <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))]">{project.title}</h3>
                  <p className="mt-2 text-[rgb(var(--color-text-secondary))]">{project.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded-full text-xs font-medium bg-[rgb(var(--color-primary-900))] text-[rgb(var(--color-primary-400))]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 text-sm text-[rgb(var(--color-text-tertiary))]">
                    {project.start_date} - {project.end_date}
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