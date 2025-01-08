import React, { useState, useEffect } from 'react';
import { Camera, Linkedin, Github, Twitter, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import TagInput from '../components/TagInput';

interface Profile {
  id: string;
  email: string;
  name: string | null;
  title: string | null;
  institution: string | null;
  department: string | null;
  bio: string | null;
  research_interests: string[];
  social_links: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
}

interface Qualification {
  id: string;
  degree: string;
  institution: string;
  year: number;
  field: string;
}

const defaultProfile: Profile = {
  id: '',
  email: '',
  name: '',
  title: '',
  institution: '',
  department: '',
  bio: '',
  research_interests: [],
  social_links: {}
};

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQualificationModal, setShowQualificationModal] = useState(false);
  const [newQualification, setNewQualification] = useState({
    degree: '',
    institution: '',
    year: new Date().getFullYear(),
    field: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
      fetchQualifications();
    }
  }, [user?.id]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select()
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data || defaultProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQualifications = async () => {
    try {
      const { data, error } = await supabase
        .from('qualifications')
        .select()
        .eq('user_id', user?.id)
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
      const { error } = await supabase
        .from('profiles')
        .upsert({
          ...profile,
          id: user.id,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  const handleAddQualification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('qualifications')
        .insert([{ ...newQualification, user_id: user.id }]);

      if (error) throw error;
      setShowQualificationModal(false);
      setNewQualification({
        degree: '',
        institution: '',
        year: new Date().getFullYear(),
        field: ''
      });
      fetchQualifications();
    } catch (error) {
      console.error('Error adding qualification:', error);
      alert('Error adding qualification. Please try again.');
    }
  };

  const handleDeleteQualification = async (id: string) => {
    if (!confirm('Are you sure you want to delete this qualification?')) return;

    try {
      const { error } = await supabase
        .from('qualifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchQualifications();
    } catch (error) {
      console.error('Error deleting qualification:', error);
      alert('Error deleting qualification. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-lg relative">
          <button className="absolute bottom-4 right-4 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50">
            <Camera className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <div className="px-6 pb-6">
          <div className="relative -mt-16 mb-6">
            <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white relative">
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50">
                <Camera className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={profile.name || ''}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={profile.title || ''}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Institution</label>
                <input
                  type="text"
                  value={profile.institution || ''}
                  onChange={(e) => setProfile({ ...profile, institution: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <input
                  type="text"
                  value={profile.department || ''}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Research Interests</label>
              <TagInput
                value={profile.research_interests}
                onChange={(tags) => setProfile({ ...profile, research_interests: tags })}
                placeholder="Add research interests..."
                existingTags={[]}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Social Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Linkedin className="h-5 w-5 text-gray-400" />
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
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Github className="h-5 w-5 text-gray-400" />
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
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Twitter className="h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    value={profile.social_links?.twitter || ''}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        social_links: { ...profile.social_links, twitter: e.target.value },
                      })
                    }
                    placeholder="Twitter URL"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Qualifications</h3>
                <button
                  type="button"
                  onClick={() => setShowQualificationModal(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Qualification
                </button>
              </div>
              
              <div className="space-y-3">
                {qualifications.map((qual) => (
                  <div key={qual.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <div>
                      <h4 className="font-medium">{qual.degree} in {qual.field}</h4>
                      <p className="text-sm text-gray-600">{qual.institution}, {qual.year}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteQualification(qual.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Qualification Modal */}
      {showQualificationModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Qualification</h3>
            <form onSubmit={handleAddQualification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Degree</label>
                <input
                  type="text"
                  value={newQualification.degree}
                  onChange={(e) => setNewQualification({ ...newQualification, degree: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Field of Study</label>
                <input
                  type="text"
                  value={newQualification.field}
                  onChange={(e) => setNewQualification({ ...newQualification, field: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Institution</label>
                <input
                  type="text"
                  value={newQualification.institution}
                  onChange={(e) => setNewQualification({ ...newQualification, institution: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Year</label>
                <input
                  type="number"
                  value={newQualification.year}
                  onChange={(e) => setNewQualification({ ...newQualification, year: parseInt(e.target.value) })}
                  min="1900"
                  max={new Date().getFullYear()}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowQualificationModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Add Qualification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}