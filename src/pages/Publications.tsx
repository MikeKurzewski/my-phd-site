import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, Upload } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface Publication {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  publication_date: string;
  venue: string;
  publication_url: string;
  media_files: string[];
  user_id: string;
}

interface PublicationFormData {
  title: string;
  abstract: string;
  authors: string;
  publication_date: string;
  venue: string;
  publication_url: string;
}

export default function Publications() {
  const { user } = useAuth();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPublication, setEditingPublication] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<PublicationFormData>({
    title: '',
    abstract: '',
    authors: '',
    publication_date: new Date().toISOString().split('T')[0],
    venue: '',
    publication_url: '',
  });
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchPublications();
    }
  }, [user?.id]);

  const fetchPublications = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .eq('user_id', user.id)
        .order('publication_date', { ascending: false });

      if (error) throw error;
      setPublications(data || []);
    } catch (error) {
      console.error('Error fetching publications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const publicationData = {
        ...formData,
        authors: formData.authors.split(',').filter(Boolean).map(a => a.trim()),
        user_id: user.id,
        media_files: [],
      };

      // Handle file uploads if any
      if (selectedFiles) {
        const mediaUrls = [];
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { error: uploadError, data } = await supabase.storage
            .from('publication-files')
            .upload(fileName, file);

          if (uploadError) throw uploadError;
          if (data) mediaUrls.push(data.path);
        }
        publicationData.media_files = mediaUrls;
      }

      if (editingPublication) {
        const { error } = await supabase
          .from('publications')
          .update(publicationData)
          .eq('id', editingPublication);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('publications')
          .insert([publicationData]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      setEditingPublication(null);
      setFormData({
        title: '',
        abstract: '',
        authors: '',
        publication_date: new Date().toISOString().split('T')[0],
        venue: '',
        publication_url: '',
      });
      setSelectedFiles(null);
      fetchPublications();
    } catch (error) {
      console.error('Error saving publication:', error);
    }
  };

  const handleEdit = (publication: Publication) => {
    setEditingPublication(publication.id);
    setFormData({
      title: publication.title,
      abstract: publication.abstract,
      authors: publication.authors.join(', '),
      publication_date: publication.publication_date,
      venue: publication.venue,
      publication_url: publication.publication_url,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this publication?')) return;

    try {
      const { error } = await supabase
        .from('publications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchPublications();
    } catch (error) {
      console.error('Error deleting publication:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Publications</h2>
        <button
          onClick={() => {
            setEditingPublication(null);
            setFormData({
              title: '',
              abstract: '',
              authors: '',
              publication_date: new Date().toISOString().split('T')[0],
              venue: '',
              publication_url: '',
            });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Publication
        </button>
      </div>

      {publications.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-6 text-center">
          <p className="text-gray-500">
            No publications added yet. Click "Add Publication" to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {publications.map((publication) => (
            <div key={publication.id} className="bg-white shadow-sm rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">{publication.title}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(publication)}
                    className="p-1 text-gray-400 hover:text-gray-500"
                    title="Edit publication"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(publication.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                    title="Delete publication"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{publication.abstract}</p>
              <div className="text-sm text-gray-500 mb-4">
                {publication.authors.join(', ')} • {publication.venue} • {publication.publication_date}
              </div>
              <div className="flex space-x-4">
                {publication.publication_url && (
                  <a
                    href={publication.publication_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-700"
                    title="View publication"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Publication
                  </a>
                )}
                {publication.media_files?.map((file, index) => (
                  <a
                    key={index}
                    href={`${supabase.storage.from('publication-files').getPublicUrl(file).data.publicUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-700"
                    title="Download supplementary material"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Supplementary Material {index + 1}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingPublication ? 'Edit Publication' : 'Add New Publication'}
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
                  <label className="block text-sm font-medium text-gray-700">Abstract</label>
                  <textarea
                    value={formData.abstract}
                    onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Authors</label>
                  <input
                    type="text"
                    value={formData.authors}
                    onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                    placeholder="Enter authors separated by commas"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Venue</label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="Journal or Conference name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Publication Date</label>
                  <input
                    type="date"
                    value={formData.publication_date}
                    onChange={(e) => setFormData({ ...formData, publication_date: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Publication URL</label>
                  <input
                    type="url"
                    value={formData.publication_url}
                    onChange={(e) => setFormData({ ...formData, publication_url: e.target.value })}
                    placeholder="https://"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Supplementary Materials
                  </label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      multiple
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingPublication(null);
                    }}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    {editingPublication ? 'Save Changes' : 'Create Publication'}
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