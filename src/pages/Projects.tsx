import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase, uploadProjectMedia } from '../lib/supabase';
import { useSubscriptionLimits } from '../lib/useSubscriptionLimits';
import PlanLimitModal from '../components/PlanLimitModal';
import TagInput from '../components/TagInput';

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  start_date: string;
  end_date?: string;
  user_id: string;
  url: string;
  funding_source: string;
  media_files?: string[];
}

interface ProjectFormData {
  title: string;
  description: string;
  tags: string;
  start_date: string;
  end_date?: string;
  url: string;
  funding_source: string;
  media_files: File[];
}

export default function Projects() {
  const { user } = useAuth();
  const { isPro, limits, checkCanAddProject } = useSubscriptionLimits();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    tags: '',
    start_date: new Date().toISOString().split('T')[0],
    url: '',
    funding_source: '',
    media_files: []
  });

  useEffect(() => {
    if (user?.id) {
      fetchProjects();
      fetchAllTags();
    }
  }, [user?.id]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Ensure media_files is always an array
      const projectsWithMedia = (data || []).map(project => {
        // Ensure all array fields are properly initialized
        return {
          ...project,
          tags: project.tags || [],
          media_files: project.media_files || [],
        };
      });
      setProjects(projectsWithMedia);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTags = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('tags')
        .eq('user_id', user?.id);

      if (error) throw error;

      const uniqueTags = Array.from(
        new Set(data?.flatMap(project => project.tags) || [])
      );
      setAllTags(uniqueTags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleAddProject = () => {
    if (!checkCanAddProject(projects.length)) {
      setShowUpgradeModal(true);
      return;
    }

    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      tags: '',
      start_date: new Date().toISOString().split('T')[0],
      url: '',
      funding_source: '',
      media_files: [],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    // Check if user can add a new project
    if (!editingProject && !checkCanAddProject(projects.length)) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      // Upload media files first using the helper function
      const mediaUrls: string[] = [];
      
      // Only attempt uploads if there are files
      if (formData.media_files && formData.media_files.length > 0) {
        for (const file of formData.media_files) {
          try {
            const url = await uploadProjectMedia(user.id, file);
            mediaUrls.push(url);
          } catch (error) {
            console.error('Error uploading file:', file.name, error);
            // Continue with other files instead of failing completely
            alert(`Failed to upload ${file.name}. The project will be saved without this file.`);
          }
        }
      }

      const projectData: any = {
        title: formData.title,
        description: formData.description,
        tags: formData.tags.split(',').filter(Boolean).map(t => t.trim()),
        start_date: formData.start_date,
        end_date: formData.end_date,
        url: formData.url,
        user_id: user.id
      };
      
      // Add funding source
      projectData.funding_source = formData.funding_source;
      
      // Add media_files only if we have any
      if (mediaUrls.length > 0) {
        projectData.media_files = mediaUrls;
      }

      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([projectData]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      setEditingProject(null);
      setFormData({
        title: '',
        description: '',
        tags: '',
        start_date: new Date().toISOString().split('T')[0],
        url: '',
        funding_source: '',
        media_files: []
      });
      fetchProjects();
      fetchAllTags();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project.id);
    setFormData({
      title: project.title,
      description: project.description,
      tags: project.tags.join(', '),
      start_date: project.start_date,
      end_date: project.end_date,
      url: project.url || '',
      funding_source: project.funding_source || '',
      media_files: [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchProjects();
      fetchAllTags();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--color-primary-400))]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-[rgb(var(--color-text-primary))]">Projects</h2>
          <p className="text-sm text-[rgb(var(--color-text-secondary))]">
            {projects.length} / {limits.maxProjects === Infinity ? '∞' : limits.maxProjects} projects
            {!isPro && projects.length >= limits.maxProjects && (
              <span className="ml-2 text-[rgb(var(--color-error))]">Limit reached</span>
            )}
          </p>
        </div>
        <button
          onClick={handleAddProject}
          className={`btn-primary ${!checkCanAddProject(projects.length) ? 'opacity-75' : ''}`}
          disabled={!checkCanAddProject(projects.length)}
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-[rgb(var(--color-bg-secondary))] shadow-sm rounded-lg p-6 text-center border border-[rgb(var(--color-border-primary))]">
          <p className="text-[rgb(var(--color-text-secondary))]">
            No projects added yet. Click "Add Project" to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-[rgb(var(--color-bg-secondary))] shadow-sm rounded-lg p-6 border border-[rgb(var(--color-border-primary))]">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))]">{project.title}</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(project)}
                    className="p-1 text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-secondary))]"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(project.id)}
                    className="p-1 text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-error))]"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <p className="text-[rgb(var(--color-text-secondary))] mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-[rgb(var(--color-primary-900))] text-[rgb(var(--color-primary-400))] text-sm rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
                  
              {project.media_files && project.media_files.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4 mb-4">
                  {project.media_files.map((file, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <img
                        src={file}
                        alt={`Project media ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Handle image loading errors
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Image+Error';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center">
                <div className="text-sm text-[rgb(var(--color-text-tertiary))]">
                  {project.start_date} - {project.end_date || 'Present'}
                </div>
                {isPro && (
                  <Link 
                    to={`/projects/${project.id}`}
                    className="text-sm text-[rgb(var(--color-primary-400))] hover:text-[rgb(var(--color-primary-300))] flex items-center"
                  >
                    View Details
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content p-6">
              <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))] mb-4">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h3>
              <div className="max-h-[calc(100vh-16rem)] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">Link</label>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">Tags</label>
                    <TagInput
                      value={formData.tags.split(',').filter(Boolean).map(t => t.trim())}
                      onChange={(tags) => setFormData({ ...formData, tags: tags.join(', ') })}
                      placeholder="Add tags..."
                      existingTags={allTags}
                    />
                  </div>
                  
                  {/* Funding Source */}
                  <div>
                    <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                      Funding Source
                    </label>
                    <input
                      type="text"
                      value={formData.funding_source || ''}
                      onChange={(e) => setFormData({ ...formData, funding_source: e.target.value })}
                      className="form-input"
                      placeholder="Enter funding source if applicable"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                      Media Files
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                      {(formData.media_files || []).map((file, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newFiles = [...(formData.media_files || [])];
                              newFiles.splice(index, 1);
                              setFormData({ ...formData, media_files: newFiles });
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-500 rounded-full hover:bg-red-600"
                          >
                            <X className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      ))}
                      <label
                        htmlFor="media-upload"
                        className="aspect-square flex items-center justify-center border-2 border-dashed border-[rgb(var(--color-border-primary))] rounded-lg cursor-pointer hover:bg-[rgb(var(--color-bg-tertiary))]"
                      >
                        <Plus className="h-6 w-6 text-[rgb(var(--color-text-tertiary))]" />
                        <input
                          id="media-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files) {
                              const files = Array.from(e.target.files);
                              setFormData(prev => ({
                                ...prev,
                                media_files: [...(prev.media_files || []), ...files]
                              }));
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">Start Date</label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">End Date</label>
                      <input
                        type="date"
                        value={formData.end_date || ''}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingProject(null);
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      {editingProject ? 'Save Changes' : 'Create Project'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <PlanLimitModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={editingProject ? "Adding funding sources" : "Adding more projects"}
      />
    </div>
  );
}
