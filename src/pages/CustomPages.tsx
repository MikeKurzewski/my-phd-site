import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Plus, Edit2, Trash2, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CustomPage {
  id: string;
  title: string;
  position: number;
  created_at: string;
  updated_at: string;
  sectionCount: number;
}

interface Subscription {
    id: string;
    status: string;
    plan: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
  }

export default function CustomPages() {
  const { user } = useAuth();
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPageForm, setShowNewPageForm] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editedPageTitle, setEditedPageTitle] = useState<string>('');
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchCustomPages();
      fetchSubscription();
    }
  }, [user?.id]);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const fetchCustomPages = async () => {
    setLoading(true);
    try {
      const { data: pages, error: pagesError } = await supabase
        .from('custom_pages')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true });

      if (pagesError) throw pagesError;

      const pagesWithCounts = await Promise.all(
        (pages || []).map(async (page) => {
          const { count, error: countError } = await supabase
            .from('custom_sections')
            .select('*', { count: 'exact', head: true })
            .eq('page_id', page.id);

          if (countError) {
            console.error('Error counting sections for page', page.id, countError);
          }

          return {
            ...page,
            sectionCount: count || 0,
          };
        })
      );

      setPages(pagesWithCounts);
    } catch (error) {
      console.error('Error fetching custom pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewPage = async () => {
    if (!newPageTitle.trim()) return;
    try {
      const { data, error } = await supabase
        .from('custom_pages')
        .insert([{ title: newPageTitle, user_id: user.id, position: pages.length + 1 }])
        .single();
      if (error) throw error;
      setNewPageTitle('');
      setShowNewPageForm(false);
      await fetchCustomPages();
      window.location.reload();
    } catch (error) {
      console.error('Error creating custom page:', error);
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this custom page and all its sections?")) return;
    try {
      // Step 1: Delete all sections for the page
      const { error: sectionError } = await supabase
        .from('custom_sections')
        .delete()
        .eq('page_id', id);
      if (sectionError) throw sectionError;
  
      // Step 2: Delete the page itself
      const { error: pageError } = await supabase
        .from('custom_pages')
        .delete()
        .eq('id', id);
      if (pageError) throw pageError;
  
      await fetchCustomPages();
      window.location.reload();
    } catch (error) {
      console.error("Error deleting page and its sections:", error);
    }
  };
  

  const handleUpdatePageTitle = async () => {
    if (!editedPageTitle.trim() || !editingPageId) return;
    try {
      const { error } = await supabase
        .from('custom_pages')
        .update({ title: editedPageTitle })
        .eq('id', editingPageId);
      if (error) throw error;
      setEditingPageId(null);
      setEditedPageTitle('');
      await fetchCustomPages();
    } catch (error) {
      console.error('Error updating page title:', error);
    }
  };

  const handleBulkDeletePages = async () => {
    if (!confirm("Are you sure you want to delete the selected pages and their sections?")) return;
  
    try {
      // Step 1: Delete all sections linked to the selected pages
      const { error: sectionError } = await supabase
        .from('custom_sections')
        .delete()
        .in('page_id', selectedPages);
  
      if (sectionError) throw sectionError;
  
      // Step 2: Delete the selected pages
      const { error: pageError } = await supabase
        .from('custom_pages')
        .delete()
        .in('id', selectedPages);
  
      if (pageError) throw pageError;
  
      setSelectedPages([]);
      setIsBulkEditMode(false);
      await fetchCustomPages();
      window.location.reload();
    } catch (error) {
      console.error("Error deleting pages and their sections:", error);
    }
  };
  
  // Simple slugify function: replace spaces with hyphens and convert to lowercase
  const slugify = (str: string) => {
    return str.trim().replace(/\s+/g, '-').toLowerCase();
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
      <h2 className="text-2xl font-semibold text-[rgb(var(--color-text-primary))]">Custom Pages</h2>
      {subscription?.plan === 'free' ? (
            <button
              className="btn-secondary flex items-center gap-2"
              onClick={()=>alert("You need to be on the premium plan to access this feature. Please upgrade in Settings")}
            >
              <Lock className="w-4 h-4" /> Add Custom Page
            </button>
        ) : (
          <button
            onClick={() => setShowNewPageForm(true)}
            className="btn-primary mt-4 inline-flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Custom Page
          </button>
        )}
        </div>
        <div className="flex justify-between items-center">
        {pages.length > 1 && (
        isBulkEditMode ? (
        <div className="flex items-center gap-4">
        <button
            onClick={() => {
            setIsBulkEditMode(false);
            setSelectedPages([]);
            }}
            className="btn-secondary"
        >
            Cancel
        </button>
        {selectedPages.length > 0 && (
            <button
            onClick={handleBulkDeletePages}
            className="btn-primary bg-[rgb(var(--color-error))]"
            >
            Delete Selected
            </button>
        )}
        </div>
    ) : (
        <button
        onClick={() => setIsBulkEditMode(true)}
        className="btn-primary"
        >
        Bulk Delete
        </button>
    )
    )}

      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8"></div>
        </div>
      ) : pages.length === 0 ? (
        <div className="bg-[rgb(var(--color-bg-tertiary))] shadow-sm rounded-lg p-6 text-center">
          <p className="text-[rgb(var(--color-text-secondary))]">
            You haven't created any custom pages yet.
          </p>
        </div>
      ) : (
        pages.map((page) => (
          <div
            key={page.id}
            className="flex justify-between items-center p-4 my-2 rounded-md border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))] shadow-sm"
          >
            <div className="flex items-center gap-3">
              {isBulkEditMode && (
                <input
                  type="checkbox"
                  checked={selectedPages.includes(page.id)}
                  onChange={() => {
                    if (selectedPages.includes(page.id)) {
                      setSelectedPages(selectedPages.filter((id) => id !== page.id));
                    } else {
                      setSelectedPages([...selectedPages, page.id]);
                    }
                  }}
                  className="w-5 h-5"
                />
              )}
              <div>
                {editingPageId === page.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editedPageTitle}
                      onChange={(e) => setEditedPageTitle(e.target.value)}
                      className="form-input"
                    />
                    <button onClick={handleUpdatePageTitle} className="btn-primary px-2">Save</button>
                  </div>
                ) : (
                  <>
                <div className="flex gap-2 items-center">
                  
                    <h3 className="font-bold text-[rgb(var(--color-text-primary))]">{page.title}</h3>
                    <button
                        onClick={() => {
                        setEditingPageId(page.id);
                        setEditedPageTitle(page.title);
                        }}
                        className="p-1 text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-secondary))]"
                    >
                        <Edit2 className="h-4 w-4" />
                    </button>
                    </div>
                    <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                      {page.sectionCount} sections
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2">
            <Link
            to={`/custom-pages/${slugify(page.title)}`}
            className="btn-primary"
            >
            Edit page
            </Link>
              <button
                onClick={() => handleDeletePage(page.id)}
                className="p-1 text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-error))]"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))
      )}

      {showNewPageForm && (
        <div className="bg-[rgb(var(--color-bg-tertiary))] p-4 rounded-md border border-[rgb(var(--color-border-primary))]">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                Page Title
              </label>
              <input
                type="text"
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                className="form-input"
                placeholder="Enter page title"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowNewPageForm(false);
                  setNewPageTitle('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateNewPage}
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