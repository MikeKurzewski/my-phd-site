import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import TagInput from '../components/TagInput';

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  media_urls: string[];
  start_date: string;
  end_date?: string;
  user_id: string;
}

interface ProjectFormData {
  title: string;
  description: string;
  tags: string;
  start_date: string;
  end_date?: string;
}

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    tags: '',
    start_date: new Date().toISOString().split('T')[0],
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
      setProjects(data || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const projectData = {
        ...formData,
        tags: formData.tags.split(',').filter(Boolean).map(t => t.trim()),
        user_id: user.id,
      };

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
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Projects</h2>
        <button
          onClick={() => {
            setEditingProject(null);
            setFormData({
              title: '',
              description: '',
              tags: '',
              start_date: new Date().toISOString().split('T')[0],
            });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-6 text-center">
          <p className="text-gray-500">No projects added yet. Click "Add Project" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white shadow-sm rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(project)}
                    className="p-1 text-gray-400 hover:text-gray-500"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(project.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="text-sm text-gray-500">
                {project.start_date} - {project.end_date || 'Present'}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingProject ? 'Edit Project' : 'Add New Project'}
            </h3>
            <div className="max-h-[calc(100vh-16rem)] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tags</label>
                  <TagInput
                    value={formData.tags.split(',').filter(Boolean).map(t => t.trim())}
                    onChange={(tags) => setFormData({ ...formData, tags: tags.join(', ') })}
                    placeholder="Add tags..."
                    existingTags={allTags}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="date"
                      value={formData.end_date || ''}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    {editingProject ? 'Save Changes' : 'Create Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}