import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface SignUpData {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<boolean>;
  updateUserEmail: (newEmail: string) => Promise<{ success: boolean; user: User | null; message: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  signIn: async () => { },
  signUp: async () => { },
  signOut: async () => { },
  deleteAccount: async () => false,
  updateUserEmail: async () => ({ success: false, user: null, message: '' }),
  loading: true,
});

const createProfile = async (
  userId: string,
  author: { name: string; affiliations: string; interests: { title: string }[] },
  articles: {
    title: string;
    link: string;
    citation_id: string;
    authors: string;
    publication: string;
    year: string;
  }[]
) => {
  const parseAffiliations = (affiliations: string) => {
    const [department, institution] = affiliations.split(',').map((part) => part.trim());
    return {
      department: department || '',
      institution: institution || '',
    };
  };

  try {
    const { department, institution } = parseAffiliations(author.affiliations);
    const { error } = await supabase
      .from('profiles')
      .update([
        {
          name: author.name || '',
          affiliations: author.affiliations || '',
          research_interests: author.interests ? author.interests.map((interest) => interest.title) : [],
          department,
          institution,
        },
      ])
      .eq('id', userId);
    if (error && error.code !== '23505') {
      // Ignore duplicate key errors
      throw error;
    }
    // Insert articles data
    if (articles.length > 0) {
      const formattedArticles = articles.map((article) => ({
        user_id: userId,
        title: article.title || '',
        publication_url: article.link || '',
        citation_id: article.citation_id || '',
        authors: article.authors || '',
        venue: article.publication || '',
        year: article.year || '',
      }));

      const { error: publicationsError } = await supabase.from('publications').insert(formattedArticles);
      if (publicationsError) {
        throw publicationsError;
      }
    }
  } catch (error) {
    console.error('Error creating profile and publications:', error);
    throw error;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (data: SignUpData) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;
    if (authData.user) {
      localStorage.setItem('newUser', 'true');
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    // TODO: Add cleanup logic here, error handling?
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const deleteAccount = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('User is not logged in');

      const { error: funcError } = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });
      if (funcError) throw funcError;

      const { error: authError } = await supabase.auth.signOut();
      if (authError) throw authError;

      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error in deleteAccount:', error);
      throw error;
    }
  };

  const updateUserEmail = async (newEmail: string) => {
    try {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('User is not logged in');

      // Update Email.
      // Note: This will send a verification email to the new email address that must be confirmed.
      const { data, error } = await supabase.auth.updateUser(
        { email: newEmail },
        { emailRedirectTo: `${window.location.origin}/settings/email-updated` }
      );

      if (error) throw error;

      return {
        success: true, // Email update was successful.
        user: data.user, // User object with the new email.
        message: 'Verification email sent. Please check your inbox.'
      };

    } catch (error: unknown) {
      console.error('Error updating email:', error);

      let errorMessage = 'Failed to update email';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = error.message as string;
      }

      return {
        success: false,
        user: null,
        message: errorMessage
      };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo: `${window.location.origin}/reset-password` }
      );

      if (error) throw error;

      return {
        success: true,
        message: 'Password reset instructions sent to your email.'
      };
    } catch (error: unknown) {
      console.error('Error resetting password:', error);

      let errorMessage = 'Failed to send password reset email';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = error.message as string;
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const value = {
    user,
    signIn,
    signUp,
    signOut,
    deleteAccount,
    updateUserEmail,
    resetPassword,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export { createProfile };

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
