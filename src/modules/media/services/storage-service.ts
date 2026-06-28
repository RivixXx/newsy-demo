import { getSupabaseAdmin } from '@/lib/supabase';

export interface StorageService {
  uploadFile(bucket: string, path: string, file: File): Promise<{ url: string; path: string }>;
  uploadBuffer(bucket: string, path: string, buffer: Buffer, contentType: string): Promise<{ url: string; path: string }>;
  deleteFile(bucket: string, path: string): Promise<void>;
  getPublicUrl(bucket: string, path: string): string;
}

const BUCKETS = {
  challenges: 'challenges',
  avatars: 'avatars',
  partners: 'partners',
} as const;

export type BucketName = keyof typeof BUCKETS;

export function createStorageService(): StorageService {
  const supabase = getSupabaseAdmin();

  return {
    async uploadFile(bucket, path, file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (error) throw new Error(`Upload failed: ${error.message}`);

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return { url: urlData.publicUrl, path: data.path };
    },

    async uploadBuffer(bucket, path, buffer, contentType) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, buffer, {
          contentType,
          upsert: true,
        });

      if (error) throw new Error(`Upload failed: ${error.message}`);

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return { url: urlData.publicUrl, path: data.path };
    },

    async deleteFile(bucket, path) {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw new Error(`Delete failed: ${error.message}`);
    },

    getPublicUrl(bucket, path) {
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return data.publicUrl;
    },
  };
}

export function getStorageUrl(bucket: string, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!supabaseUrl) return '';
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
