import React, { useState, useEffect } from 'react';
import { Camera, Linkedin, Github, User, Plus, Trash2, Upload, FileText, X } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import TagInput from '../components/TagInput';
import { getFileUrl, uploadFileToStorage } from '../lib/fileUtils';

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  title: string | null;
  institution: string | null;
  department: string | null;
  bio: string | null;
  profile_image_url: string | null;
  banner_image_url: string | null;
  cv_url: string | null;
  research_interests: string[];
  affiliations: string | null;
  scholar_id: string | null;
  social_links: {
    linkedin?: string;
    github?: string;
    x?: string;
  };
}

interface Qualification {
  id: string;
  degree: string;
  institution: string;
  year: number;
  field: string;
}

interface LinkedinWebhookResponse {
  bio: string;
  interests: string;
}

interface QualificationFormData {
  degree: string;
  institution: string;
  year: number;
  field: string;
}

const defaultProfile: Profile = {
  id: '',
  name: null,
  email: null,
  title: null,
  institution: null,
  department: null,
  bio: null,
  profile_image_url: null,
  banner_image_url: null,
  cv_url: null,
  affiliations: null,
  scholar_id: null,
  research_interests: [],
  social_links: {}
};

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState<'profile' | 'banner' | 'cv' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newQualification, setNewQualification] = useState<QualificationFormData>({
    degree: '',
    institution: '',
    year: Number(new Date().getFullYear()),
    field: ''
  });
  const [showQualificationForm, setShowQualificationForm] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
      fetchQualifications();
    }
  }, [user?.id]);

  const getFileName = (path: string) => {
    return path.split('/').pop() || 'File';
  };

  const uploadFile = async (file: File, type: 'profile' | 'banner' | 'cv') => {
    try {
      setUploadingImage(type);
      setError(null);

      if (!user?.id) return;

      const { path, error } = await uploadFileToStorage(file, type, user.id);
      if (error) throw error;

      if (path) {
        const updateData = type === 'cv'
          ? { cv_url: path }
          : type === 'profile'
            ? { profile_image_url: path }
            : { banner_image_url: path };

        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id);

        if (updateError) throw updateError;

        setProfile(prev => ({
          ...prev,
          ...updateData
        }));
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      setError(`Failed to upload ${type}. Please try again.`);
    } finally {
      setUploadingImage(null);
    }
  };

  const handleFileClick = (type: 'profile' | 'banner' | 'cv') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'cv' ? '.pdf,.doc,.docx' : 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        uploadFile(file, type);
      }
    };
    input.click();
  };

  const handleDeleteCV = async () => {
    try {
      if (!user?.id || !profile.cv_url) return;

      const { error: deleteStorageError } = await supabase.storage
        .from('profile-files')
        .remove([profile.cv_url]);

      if (deleteStorageError) throw deleteStorageError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ cv_url: null })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, cv_url: null }));
    } catch (err) {
      console.error('Error deleting CV:', err);
      setError('Failed to delete CV. Please try again.');
    }
  };

  const fetchProfile = async () => {
    try {
      setError(null);
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          ...defaultProfile,
          ...data,
          research_interests: data.research_interests || [],
          social_links: data.social_links || {},
          email: user.email?.toLowerCase() || null
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const fetchQualifications = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('qualifications')
        .select('*')
        .eq('user_id', user.id)
        .order('year', { ascending: false });

      if (error) throw error;
      setQualifications(data || []);
    } catch (error) {
      console.error('Error fetching qualifications:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setError(null);
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          title: profile.title,
          institution: profile.institution,
          department: profile.department,
          bio: profile.bio,
          research_interests: profile.research_interests,
          affiliations: profile.affiliations,
          scholar_id: profile.scholar_id,
          social_links: profile.social_links,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleAddQualification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setError(null);
      const qualification = { ...newQualification, user_id: user.id };

      const { error } = await supabase
        .from('qualifications')
        .insert([qualification]);

      if (error) throw error;

      setShowQualificationForm(false);
      fetchQualifications();
    } catch (error) {
      console.error('Error adding qualification:', error);
      setError('Failed to add qualification. Please try again.');
    }
  };

  const autoCompleteProfile = async () => {
    if (!user?.id) return;

    try {
      // setSearching(true);

      // Get user's full name from profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('social_links')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const linkedinUrl = profileData?.social_links?.linkedin;

      const response = await fetch('https://hook.eu2.make.com/ggjxotdvke95ig31ui8lu43kia58pn54', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkedin: linkedinUrl,
        }),
      });

      const data: LinkedinWebhookResponse = await response.json();

      if (data) {
        const interestsArray = data.interests
          .split(',')
          .map((interest) => interest.trim());
        try {
          setError(null);
          const { error } = await supabase
            .from('profiles')
            .update({
              bio: data.bio,
              research_interests: interestsArray,
            })
            .eq('id', user.id);

          if (error) throw error;
          alert('Profile updated successfully! Please refresh your page');
        } catch (error) {
          console.error('Error updating profile:', error);
          setError('Failed to update profile. Please try again.');
        }
      }
      // setShowFullForm(true);
    } catch (error) {
      console.error('Error finding publication:', error);
    } finally {
      // setSearching(false);
    }
  };

  const handleDeleteQualification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('qualifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchQualifications();
    } catch (error) {
      console.error('Error deleting qualification:', error);
      setError('Failed to delete qualification. Please try again.');
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
      {error && (
        <div className="bg-[rgb(var(--color-error))] bg-opacity-10 border border-[rgb(var(--color-error))] text-white px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-[rgb(var(--color-bg-secondary))] shadow-sm rounded-lg border border-[rgb(var(--color-border-primary))]">
        <div className="relative h-32">
          <div className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--color-primary-600))] to-[rgb(var(--color-primary-400))] rounded-t-lg">
            {profile.banner_image_url && (
              <img
                src={getFileUrl(profile.banner_image_url, 'profile-images')}
                alt="Banner"
                className="w-full h-full object-cover rounded-t-lg"
              />
            )}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={() => handleFileClick('banner')}
              disabled={!!uploadingImage}
              className="p-3 bg-[rgb(var(--color-bg-secondary))] rounded-full shadow-lg hover:bg-[rgb(var(--color-bg-tertiary))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
              title="Change banner image"
            >
              <Camera className="h-6 w-6 text-[rgb(var(--color-text-primary))]" />
            </button>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="relative -mt-16 mb-6">
            <div className="w-32 h-32 rounded-full bg-[rgb(var(--color-bg-tertiary))] border-4 border-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
              {profile.profile_image_url ? (
                <img
                  src={getFileUrl(profile.profile_image_url, 'profile-images')}
                  alt={profile.name || 'Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[rgb(var(--color-bg-tertiary))]">
                  <User className="h-16 w-16 text-[rgb(var(--color-text-tertiary))]" />
                </div>
              )}
              <button
                onClick={() => handleFileClick('profile')}
                disabled={!!uploadingImage}
                className="absolute bottom-0 right-0 p-2 bg-[rgb(var(--color-bg-secondary))] rounded-full shadow-sm hover:bg-[rgb(var(--color-bg-tertiary))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Change profile image"
              >
                <Camera className="h-5 w-5 text-[rgb(var(--color-text-primary))]" />
              </button>
            </div>
            {uploadingImage && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--color-primary-400))]"></div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pb-6">
            <h2 className="text-2xl font-semibold text-[rgb(var(--color-text-primary))]">Profile</h2>
            {profile.social_links?.linkedin && (
              <button
                onClick={autoCompleteProfile}
                className="btn-primary"
              >
                {/* <Search className="h-5 w-5 mr-2" /> */}
                Use my LinkedIn Profile
              </button>
            )}
          </div>

          <div className="pb-6"><hr /></div>


          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">Name</label>
                <input
                  type="text"
                  value={profile.name || ''}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="form-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">Title</label>
                <input
                  type="text"
                  value={profile.title || ''}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  className="form-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">Institution</label>
                <input
                  type="text"
                  value={profile.institution || ''}
                  onChange={(e) => setProfile({ ...profile, institution: e.target.value })}
                  className="form-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">Department</label>
                <input
                  type="text"
                  value={profile.department || ''}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  className="form-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">Affiliations</label>
                <input
                  type="text"
                  value={profile.affiliations || ''}
                  onChange={(e) => setProfile({ ...profile, affiliations: e.target.value })}
                  className="form-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">Google Scholar ID</label>
                <input
                  type="text"
                  value={profile.scholar_id || ''}
                  onChange={(e) => setProfile({ ...profile, scholar_id: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">Bio</label>
              <textarea
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={4}
                className="form-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">CV</label>
              <div className="mt-1">
                {profile.cv_url ? (
                  <div className="flex items-center space-x-4">
                    <a
                      href={getFileUrl(profile.cv_url, 'profile-files')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {getFileName(profile.cv_url)}
                    </a>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleFileClick('cv')}
                        className="btn-secondary"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteCV}
                        className="btn-error"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleFileClick('cv')}
                    className="btn-secondary"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload CV
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">Research Interests</label>
              <TagInput
                value={profile.research_interests}
                onChange={(tags) => setProfile({ ...profile, research_interests: tags })}
                placeholder="Add research interests..."
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))]">Social Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Linkedin className="h-5 w-5 text-[rgb(var(--color-text-tertiary))]" />
                  <input
                    type="url"
                    value={profile.social_links?.linkedin || ''}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        social_links: { ...profile.social_links, linkedin: e.target.value },
                      })
                    }
                    placeholder="LinkedIn URL"
                    className="form-input"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Github className="h-5 w-5 text-[rgb(var(--color-text-tertiary))]" />
                  <input
                    type="url"
                    value={profile.social_links?.github || ''}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        social_links: { ...profile.social_links, github: e.target.value },
                      })
                    }
                    placeholder="GitHub URL"
                    className="form-input"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <X className="h-5 w-5 text-[rgb(var(--color-text-tertiary))]" />
                  <input
                    type="url"
                    value={profile.social_links?.x|| ''}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        social_links: { ...profile.social_links, x: e.target.value },
                      })
                    }
                    placeholder="Twitter URL"
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))]">Qualifications</h3>
                <button
                  type="button"
                  onClick={() => setShowQualificationForm(true)}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Qualification
                </button>
              </div>

              {showQualificationForm && (
                <div className="bg-[rgb(var(--color-bg-primary))] p-4 rounded-md border border-[rgb(var(--color-border-primary))]">
                  <form onSubmit={handleAddQualification} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">Degree</label>
                        <input
                          type="text"
                          value={newQualification.degree}
                          onChange={(e) => setNewQualification({ ...newQualification, degree: e.target.value })}
                          className="form-input"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">Field</label>
                        <input
                          type="text"
                          value={newQualification.field}
                          onChange={(e) => setNewQualification({ ...newQualification, field: e.target.value })}
                          className="form-input"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">Institution</label>
                        <input
                          type="text"
                          value={newQualification.institution}
                          onChange={(e) => setNewQualification({ ...newQualification, institution: e.target.value })}
                          className="form-input"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">Year</label>
                        <input
                          type="number"
                          value={newQualification.year}
                          onChange={(e) => setNewQualification({ ...newQualification, year: parseInt(e.target.value) })}
                          className="form-input"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowQualificationForm(false)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                      >
                        Add
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="space-y-3">
                {qualifications.map((qual) => (
                  <div
                    key={qual.id}
                    className="flex justify-between items-center p-4 bg-[rgb(var(--color-bg-tertiary))] rounded-md"
                  >
                    <div>
                      <h4 className="font-medium text-[rgb(var(--color-text-primary))]">{qual.degree} in {qual.field}</h4>
                      <p className="text-sm text-[rgb(var(--color-text-secondary))]">{qual.institution}, {qual.year}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteQualification(qual.id)}
                      className="p-1 text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-error))]"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="btn-primary"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
