import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface CustomSection {
  id: string;
  page_id: string;
  section_type: string;
  section_title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

const slugify = (str: string): string => {
  return str.trim().replace(/\s+/g, '-').toLowerCase();
};

export default function CustomSectionPage() {
  const { pageTitle } = useParams();
  const { user } = useAuth();
  const [pageId, setPageId] = useState<string | null>(null);
  const [sections, setSections] = useState<CustomSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [showNewSectionForm, setShowNewSectionForm] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionContent, setNewSectionContent] = useState('');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editSectionTitle, setEditSectionTitle] = useState('');
  const [editSectionContent, setEditSectionContent] = useState('');
  const [pageDisplayTitle, setPageDisplayTitle] = useState<string>('');

  useEffect(() => {
    if (user?.id && pageTitle) {
      fetchCustomPage();
    }
  }, [user?.id, pageTitle]);

  const fetchCustomPage = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('custom_pages')
        .select('id, title')
        .eq('user_id', user.id);

      if (error) throw error;

      const foundPage = data?.find((page) => slugify(page.title) === pageTitle);
      if (foundPage) {
        setPageId(foundPage.id);
        setPageDisplayTitle(foundPage.title);
        fetchSections(foundPage.id);
      } else {
        console.error('No matching custom page found.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching custom page:', error);
      setLoading(false);
    }
  };

  const fetchSections = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('custom_sections')
        .select('*')
        .eq('page_id', id)
        .order('created_at');
      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = async () => {
    if (!newSectionTitle.trim() || !pageId) return;
    try {
      const { error } = await supabase
        .from('custom_sections')
        .insert([
          {
            page_id: pageId,
            section_type: 'basic',
            section_title: newSectionTitle,
            content: newSectionContent,
            user_id: user?.id,
          },
        ])
        .single();
      if (error) throw error;
      fetchSections(pageId);
      setNewSectionTitle('');
      setNewSectionContent('');
      setShowNewSectionForm(false);
    } catch (error) {
      console.error('Error adding section:', error);
    }
  };

  const handleEditSection = async () => {
    if (!editingSectionId || !pageId) return;
    try {
      const { error } = await supabase
        .from('custom_sections')
        .update({ section_title: editSectionTitle, content: editSectionContent })
        .eq('id', editingSectionId);
      if (error) throw error;
      fetchSections(pageId);
      setEditingSectionId(null);
      setEditSectionTitle('');
      setEditSectionContent('');
    } catch (error) {
      console.error('Error editing section:', error);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section?') || !pageId) return;
    try {
      const { error } = await supabase.from('custom_sections').delete().eq('id', id);
      if (error) throw error;
      fetchSections(pageId);
    } catch (error) {
      console.error('Error deleting section:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
      <h2 className="text-2xl font-semibold text-[rgb(var(--color-text-primary))]">{pageDisplayTitle} Sections</h2>
      <button
          onClick={() => setShowNewSectionForm(true)}
          className="btn-primary mt-6 inline-flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Section
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center min-h-[100px]">
          <div className="animate-spin rounded-full h-6 w-6" />
        </div>
      ) : sections.length === 0 ? (
        <div className="bg-[rgb(var(--color-bg-tertiary))] shadow-sm rounded-lg p-6 text-center">
          <p className="text-[rgb(var(--color-text-secondary))]">
            You haven't created any sections for this page yet.
          </p>
        </div>
      ) : (
      sections.map((section) => (
        <div key={section.id} className="bg-[rgb(var(--color-bg-secondary))] p-4 rounded border border-[rgb(var(--color-border-primary))]">
          {editingSectionId === section.id ? (
            <>
              <input
                type="text"
                value={editSectionTitle}
                onChange={(e) => setEditSectionTitle(e.target.value)}
                className="form-input mb-2"
                placeholder="Section title"
              />
              <ReactQuill
                value={editSectionContent}
                onChange={setEditSectionContent}
                theme="snow"
              />
              <div className="flex justify-end space-x-2 mt-4">
                <button onClick={() => {
                  setEditingSectionId(null);
                  setEditSectionTitle('');
                  setEditSectionContent('');
                }} className="btn-secondary">Cancel</button>
                <button onClick={handleEditSection} className="btn-primary">Save</button>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <h3 className="text-lg font-medium">{section.section_title}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingSectionId(section.id);
                      setEditSectionTitle(section.section_title);
                      setEditSectionContent(section.content);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteSection(section.id)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: section.content }} />
            </>
          )}
        </div>
      )))}
      {showNewSectionForm && (
        <div className="bg-[rgb(var(--color-bg-tertiary))] p-4 rounded-md border border-[rgb(var(--color-border-primary))] mt-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">Section Title</label>
              <input
                type="text"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                className="form-input"
                placeholder="Enter section title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">Content</label>
              <ReactQuill
                value={newSectionContent}
                onChange={setNewSectionContent}
                theme="snow"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowNewSectionForm(false);
                  setNewSectionTitle('');
                  setNewSectionContent('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddSection}
                className="btn-primary"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}