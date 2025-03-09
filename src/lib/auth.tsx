import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { fetchAuthorData } from "../lib/serpapi"; // SerpAPI function

interface SignUpData {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
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
      sessionStorage.setItem('newUser', 'true');
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = { user, signIn, signUp, signOut, loading };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { createProfile };

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
