import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ExternalLink, Mail, Linkedin, Github, Twitter } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Website() {
  const { username } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState([]);
  const [publications, setPublications] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  const fetchProfileData = async () => {
    try {
      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Get projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', profileData.id)
        .order('start_date', { ascending: false });

      setProjects(projectsData || []);

      // Get publications
      const { data: publicationsData } = await supabase
        .from('publications')
        .select('*')
        .eq('user_id', profileData.id)
        .order('publication_date', { ascending: false });

      setPublications(publicationsData || []);

      // Get qualifications
      const { data: qualificationsData } = await supabase
        .from('qualifications')
        .select('*')
        .eq('user_id', profileData.id)
        .order('year', { ascending: false });

      setQualifications(qualificationsData || []);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            {profile.profile_image_url && (
              <img
                src={profile.profile_image_url}
                alt={profile.name}
                className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
              />
            )}
            <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
            <p className="mt-2 text-xl text-gray-600">{profile.title}</p>
            <p className="mt-1 text-gray-500">{profile.institution}</p>
            <p className="mt-1 text-gray-500">{profile.department}</p>
            
            <div className="mt-4 flex justify-center space-x-4">
              {profile.social_links?.email && (
                <a href={`mailto:${profile.social_links.email}`} className="text-gray-400 hover:text-gray-500">
                  <Mail className="h-6 w-6" />
                </a>
              )}
              {profile.social_links?.linkedin && (
                <a href={profile.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
                  <Linkedin className="h-6 w-6" />
                </a>
              )}
              {profile.social_links?.github && (
                <a href={profile.social_links.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
                  <Github className="h-6 w-6" />
                </a>
              )}
              {profile.social_links?.twitter && (
                <a href={profile.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
                  <Twitter className="h-6 w-6" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-16">
          {/* Bio Section */}
          {profile.bio && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <div className="prose max-w-none">
                <p className="text-gray-600">{profile.bio}</p>
              </div>
            </section>
          )}

          {/* Research Interests */}
          {profile.research_interests?.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Research Interests</h2>
              <div className="flex flex-wrap gap-2">
                {profile.research_interests.map((interest: string) => (
                  <span
                    key={interest}
                    className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {qualifications.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Education</h2>
              <div className="space-y-4">
                {qualifications.map((qual: any) => (
                  <div key={qual.id} className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900">{qual.degree} in {qual.field}</h3>
                    <p className="text-gray-600">{qual.institution}</p>
                    <p className="text-gray-500">{qual.year}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project: any) => (
                  <div key={project.id} className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
                    <p className="mt-2 text-gray-600">{project.description}</p>
                    {project.tags?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 text-sm text-gray-500">
                      {project.start_date} - {project.end_date || 'Present'}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Publications */}
          {publications.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Publications</h2>
              <div className="space-y-6">
                {publications.map((pub: any) => (
                  <div key={pub.id} className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900">{pub.title}</h3>
                    <p className="mt-2 text-gray-600">{pub.abstract}</p>
                    <p className="mt-4 text-sm text-gray-500">
                      {pub.authors.join(', ')} • {pub.venue} • {pub.publication_date}
                    </p>
                    <div className="mt-4 flex space-x-4">
                      {pub.publication_url && (
                        <a
                          href={pub.publication_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-indigo-600 hover:text-indigo-700"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Publication
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}