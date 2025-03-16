import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, Search, Upload } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { fetchAuthorData } from '../lib/serpapi';

interface Publication {
  id: string;
  title: string;
  abstract: string;
  authors: string;
  year: string;
  venue: string;
  publication_url: string;
  media_files: string;
  type: 'preprint' | 'publication';
  user_id: string;
}

interface PublicationFormData {
  title: string;
  abstract: string;
  authors: string;
  year: string;
  venue: string;
  publication_url: string;
  type: 'preprint' | 'publication';
}

interface WebhookResponse {
  success: boolean;
  data?: {
    title: string;
    abstract: string;
    authors: string;
    year: string;
    venue: string;
    publication_url: string;
  };
  error?: string;
}

interface PublicationsWebhookResponse {
  publications: Publication[];
}

export default function Publications() {
  const { user } = useAuth();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPublication, setEditingPublication] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchTitle, setSearchTitle] = useState('');
  const [showFullForm, setShowFullForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [formData, setFormData] = useState<PublicationFormData>({
    title: '',
    abstract: '',
    authors: '',
    year: '',
    venue: '',
    publication_url: '',
    type: 'publication'
  });

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
        .order('year', { ascending: false });

      if (error) throw error;
      setPublications(data || []);
    } catch (error) {
      console.error('Error fetching publications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFindPublications = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      console.log('Starting handleFindPublications using serpapi');

      // Fetch scholar_id from user's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('scholar_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }
      if (!profileData.scholar_id) {
        console.error('No scholar ID found in profile.');
        alert('No scholar ID found in your profile. Please update your profile with your Scholar ID.');
        return;
      }
      console.log('Scholar ID found:', profileData.scholar_id);

      const scholarMatch = profileData.scholar_id.match(/user=([^&]+)/)[1];
      console.log(scholarMatch);

      // Use serpapi to fetch author data (publications only)
      const { articles } = await fetchAuthorData(scholarMatch);
      console.log('Articles fetched from serpapi:', articles);

      // Process articles as publications
      for (const article of articles) {
        // Check if publication already exists
        const { data: existingPublications, error: fetchError } = await supabase
          .from('publications')
          .select('id')
          .eq('title', article.title)
          .eq('authors', article.authors)
          .eq('venue', article.publication)
          .eq('user_id', user.id);

        if (fetchError) {
          console.error('Error checking existing publications:', fetchError);
          throw fetchError;
        }

        if (!existingPublications || existingPublications.length === 0) {
          console.log('Inserting new publication:', article);

          const { error: insertError } = await supabase
            .from('publications')
            .insert({
              title: article.title,
              abstract: '',
              authors: article.authors,
              venue: article.publication,
              publication_url: article.link,
              user_id: user.id,
              year: article.year
            });

          if (insertError) {
            console.error('Error inserting publication:', insertError);
            throw insertError;
          }
        } else {
          console.log('Publication already exists:', article.title);
        }
      }

      alert('Publications successfully added.');
      window.location.reload();
    } catch (error) {
      console.error('Error in handleFindPublications:', error);
    } finally {
      setLoading(false);
    }
  };

  const findPublication = async () => {
    if (!user?.id || !searchTitle.trim()) return;

    try {
      setSearching(true);

      // Get user's full name from profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const response = await fetch('https://hook.eu2.make.com/jyiqn4fr9b75k2lnjjjibipfzx55h5o3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          user_name: profileData.name,
          publication_title: searchTitle
        }),
      });

      const data: WebhookResponse = await response.json();

      if (data.success && data.data) {
        setFormData({
          ...formData,
          title: data.data.title,
          abstract: data.data.abstract,
          authors: data.data.authors,
          year: data.data.year,
          venue: data.data.venue,
          publication_url: data.data.publication_url
        });
      }
      setShowFullForm(true);
    } catch (error) {
      console.error('Error finding publication:', error);
    } finally {
      setSearching(false);
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
        authors: formData.authors.trim(),
        user_id: user.id,
        media_files: '',
      };

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
        publicationData.media_files = mediaUrls.join(', ');
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
        year: '',
        venue: '',
        publication_url: '',
        type: 'publication'
      });
      setSelectedFiles(null);
      setShowFullForm(false);
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
      authors: publication.authors,
      year: publication.year,
      venue: publication.venue,
      publication_url: publication.publication_url,
      type: publication.type
    });
    setShowFullForm(true);
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--color-primary-400))]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-[rgb(var(--color-text-primary))]">Publications</h2>
        
        <button
            onClick={() => {
              setEditingPublication(null);
              setFormData({
                title: '',
                abstract: '',
                authors: '',
                year: '',
                venue: '',
                publication_url: '',
                type: 'publication'
              });
              setShowFullForm(false);
              setIsModalOpen(true);
            }}
            className="btn-primary"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Publication
          </button>
      </div>
      <div className="bg-[rgb(var(--color-bg-tertiary))] shadow-sm rounded-lg p-6 text-center border border-[rgb(var(--color-border-primary))]">
          <p className="text-[rgb(var(--color-text-secondary))]">
            Your publications will auto update once a month. Add publications manually by clicking the button above.
          </p>
      </div>
      <div><hr /></div>

      { loading ? (
    <div className="text-center p-6">
        <p className="text-[rgb(var(--color-text-secondary))]">
            Finding Publications. This may take a few minutes.
        </p>
    </div>
) : publications.length === 0 ? (
          <div className='flex flex-col gap-6'>
            <button
            onClick={handleFindPublications}
            className="btn-primary w-full"
            >
                <Search className="h-5 w-5 mr-2" />
                Add My Google Scholar Publications
            </button>
        
        <div className="bg-[rgb(var(--color-bg-secondary))] shadow-sm rounded-lg p-6 text-center border border-[rgb(var(--color-border-primary))]">
          <p className="text-[rgb(var(--color-text-secondary))]">
            No publications added yet. Click "Add Publication" to get started.
          </p>
        </div>
        </div>
      ) : (
        <div className="space-y-4">
          {publications.map((publication) => (
            <div key={publication.id} className="bg-[rgb(var(--color-bg-secondary))] shadow-sm rounded-lg p-6 border border-[rgb(var(--color-border-primary))]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))]">{publication.title}</h3>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                    publication.type === 'preprint' 
                      ? 'bg-[rgb(var(--color-warning))] bg-opacity-20 text-[rgb(var(--color-text-primary))]' 
                      : 'bg-[rgb(var(--color-success))] bg-opacity-20 text-[rgb(var(--color-text-primary))]'
                  }`}>
                    {publication.type === 'preprint' ? 'Preprint' : 'Published'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(publication)}
                    className="p-1 text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-secondary))]"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(publication.id)}
                    className="p-1 text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-error))]"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <p className="text-[rgb(var(--color-text-secondary))] mb-4">{publication.abstract}</p>
              <div className="text-sm text-[rgb(var(--color-text-tertiary))] mb-4">
                {publication.authors} • {publication.venue} • {publication.year}
              </div>
              <div className="flex space-x-4">
                {publication.publication_url && (
                  <a
                    href={publication.publication_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[rgb(var(--color-primary-400))] hover:text-[rgb(var(--color-primary-300))]"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Publication
                  </a>
                )}
                {publication.media_files.split(', ').filter(Boolean).map((file, index) => (
                  <a
                    key={index}
                    href={`${supabase.storage.from('publication-files').getPublicUrl(file).data.publicUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[rgb(var(--color-primary-400))] hover:text-[rgb(var(--color-primary-300))]"
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
        <div 
          className="modal-overlay" 
          onClick={() => {
            setIsModalOpen(false);
            setEditingPublication(null);
            setShowFullForm(false);
          }}
        >
          <div 
            className="modal" 
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="modal-content p-6">
              <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))] mb-4">
                {editingPublication ? 'Edit Publication' : 'Add New Publication'}
              </h3>
              <div className="max-h-[calc(100vh-16rem)] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!showFullForm ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">Publication Title</label>
                        <input
                          type="text"
                          value={searchTitle}
                          onChange={(e) => setSearchTitle(e.target.value)}
                          className="form-input"
                          required
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={findPublication}
                          disabled={searching || !searchTitle.trim()}
                          className="btn-primary flex-1"
                        >
                          {searching ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Finding Publication...
                            </>
                          ) : (
                            <>
                              <Search className="h-4 w-4 mr-2" />
                              Find Publication
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowFullForm(true)}
                          className="btn-secondary flex-1"
                        >
                          Skip to Manual Entry
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
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
                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">Type</label>
                        <div className="mt-1 flex gap-3">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'publication' })}
                            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                              formData.type === 'publication'
                                ? 'bg-[rgb(var(--color-success))] bg-opacity-20 text-[rgb(var(--color-text-primary))] border-2 border-[rgb(var(--color-success))] border-opacity-20'
                                : 'bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-primary))]'
                            }`}
                          >
                            Publication
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'preprint' })}
                            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                              formData.type === 'preprint'
                                ? 'bg-[rgb(var(--color-warning))] bg-opacity-20 text-[rgb(var(--color-warning))] border-2 border-[rgb(var(--color-warning))] border-opacity-20'
                                : 'bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-primary))]'
                            }`}
                          >
                            Preprint
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">Abstract</label>
                        <textarea
                          value={formData.abstract}
                          onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                          rows={4}
                          className="form-input"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">Authors</label>
                        <input
                          type="text"
                          value={formData.authors}
                          onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                          placeholder="Enter authors separated by commas"
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">Venue</label>
                        <input
                          type="text"
                          value={formData.venue}
                          onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                          placeholder="Journal or Conference name"
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">Publication Date</label>
                        <input
                          type="date"
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                          className="form-input"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">Publication URL</label>
                        <input
                          type="url"
                          value={formData.publication_url}
                          onChange={(e) => setFormData({ ...formData, publication_url: e.target.value })}
                          placeholder="https://"
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                          Supplementary Materials
                        </label>
                        <div className="mt-1">
                          <input
                            type="file"
                            onChange={handleFileChange}
                            multiple
                            className="block w-full text-sm text-[rgb(var(--color-text-tertiary))] file:mr-4 file:py-2 file:px-4 
                              file:rounded-md file:border-0 file:text-sm file:font-semibold 
                              file:bg-[rgb(var(--color-primary-900))] file:text-[rgb(var(--color-primary-400))] 
                              hover:file:bg-[rgb(var(--color-primary-800))]"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingPublication(null);
                        setShowFullForm(false);
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    {showFullForm && (
                      <button
                        type="submit"
                        className="btn-primary"
                      >
                        {editingPublication ? 'Save Changes' : 'Create Publication'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
