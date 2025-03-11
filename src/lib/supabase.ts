import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper function to check storage permissions
export async function checkStoragePermissions(userId: string) {
  try {
    const { data, error } = await supabase
      .rpc('check_storage_policy', {
        bucket_id: 'project-media',
        user_id: userId
      });

    if (error) {
      console.error('Storage policy check error:', error);
      return false;
    }
    return data;
  } catch (error) {
    console.error('Error checking storage permissions:', error);
    return false;
  }
}

// Helper function for secure file uploads
export async function uploadProjectMedia(userId: string, file: File) {
  try {
    // Create a safe filename by removing special characters
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/${Date.now()}-${safeFileName}`;
    
    // Upload to the project-media bucket
    const { data, error } = await supabase
      .storage
      .from('project-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw error;
    }

    const { data: urlData } = await supabase
      .storage
      .from('project-media')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL');
    }

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading project media:', error);
    throw error;
  }
}
