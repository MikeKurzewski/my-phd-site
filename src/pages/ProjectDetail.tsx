import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Edit2, ExternalLink } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  start_date: string;
  end_date?: string;
  user_id: string;
  url?: string;
  funding_source?: string;
  media_urls?: string[];
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && user?.id) {
      fetchProject();
    }
  }, [id, user?.id]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      setProject({
        ...data,
        tags: data.tags || [],
        media_urls: data.media_urls || [],
      });
    } catch (err) {
      console.error('Error fetching project:', err);
      setError('Failed to load project. Please try again.');
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

  if (error || !project) {
    return (
      <div className="bg-[rgb(var(--color-bg-secondary))] shadow-sm rounded-lg p-6 border border-[rgb(var(--color-border-primary))]">
        <p className="text-[rgb(var(--color-text-secondary))]">
          {error || "Project not found"}
        </p>
        <Link to="/projects" className="mt-4 inline-flex items-center text-[rgb(var(--color-primary-400))] hover:text-[rgb(var(--color-primary-300))]">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/projects" className="inline-flex items-center text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Projects
        </Link>
      </div>

      <div className="bg-[rgb(var(--color-bg-secondary))] shadow-sm rounded-lg border border-[rgb(var(--color-border-primary))] overflow-hidden">
        {/* Media Gallery */}
        {project.media_urls && project.media_urls.length > 0 && (
          <div className="border-b border-[rgb(var(--color-border-primary))]">
            <div className="relative h-64 bg-[rgb(var(--color-bg-tertiary))]">
              <img
                src={project.media_urls[0]}
                alt={project.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Image+Error';
                }}
              />
            </div>
            {project.media_urls.length > 1 && (
              <div className="flex overflow-x-auto p-4 space-x-4">
                {project.media_urls.map((url, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border border-[rgb(var(--color-border-primary))]"
                  >
                    <img
                      src={url}
                      alt={`Project media ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=Error';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Project Details */}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">{project.title}</h1>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-[rgb(var(--color-primary-900))] text-[rgb(var(--color-primary-400))] text-sm rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="mt-6 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-[rgb(var(--color-text-tertiary))]">Description</h3>
              <p className="mt-1 text-[rgb(var(--color-text-secondary))]">{project.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-[rgb(var(--color-text-tertiary))]">Timeline</h3>
                <p className="mt-1 text-[rgb(var(--color-text-secondary))]">
                  {project.start_date} - {project.end_date || 'Present'}
                </p>
              </div>
              
              {project.funding_source && (
                <div>
                  <h3 className="text-sm font-medium text-[rgb(var(--color-text-tertiary))]">Funding Source</h3>
                  <p className="mt-1 text-[rgb(var(--color-text-secondary))]">{project.funding_source}</p>
                </div>
              )}
            </div>
            
            {project.url && (
              <div>
                <h3 className="text-sm font-medium text-[rgb(var(--color-text-tertiary))]">Project Link</h3>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center text-[rgb(var(--color-primary-400))] hover:text-[rgb(var(--color-primary-300))]"
                >
                  Visit Project
                  <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
