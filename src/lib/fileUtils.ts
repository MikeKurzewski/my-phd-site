import { supabase } from './supabase';

interface UploadResult {
  path?: string;
  error?: Error;
}

export const uploadFileToStorage = async (
  file: File,
  type: 'profile' | 'banner' | 'cv',
  userId: string
): Promise<UploadResult> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${type}-${Date.now()}.${fileExt}`;
    const bucket = type === 'cv' ? 'profile-files' : 'profile-images';

    const { error: uploadError, data } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;
    return { path: data?.path };
  } catch (error) {
    return { error: error as Error };
  }
};

export const getFileUrl = (path: string, bucket: string) => {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
};
