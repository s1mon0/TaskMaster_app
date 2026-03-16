import { supabase } from './supabaseClient';

/**
 * Nahraje soubor do Supabase Storage
 * @param {File} file - Soubor k nahrání
 * @param {string} bucketName - Název bucketu (např. 'attachments')
 * @param {string} folderPath - Cesta v bucketu (např. 'task-files/123')
 * @returns {Promise<{url: string, error: any}>}
 */
export async function uploadFile(file, bucketName, folderPath = '') {
  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExtension}`;
    const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    if (error) throw error;

    // Vrátí veřejnou URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (error) {
    console.error('Upload error:', error);
    return { url: null, error };
  }
}

/**
 * Vymaže soubor ze Supabase Storage
 * @param {string} bucketName - Název bucketu
 * @param {string} filePath - Cesta k souboru
 */
export async function deleteFile(bucketName, filePath) {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, error };
  }
}

/**
 * Vrátí seznam všech souborů v bucketu
 * @param {string} bucketName - Název bucketu
 * @param {string} folderPath - Cesta v bucketu
 */
export async function listFiles(bucketName, folderPath = '') {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath);

    if (error) throw error;
    return { files: data, error: null };
  } catch (error) {
    console.error('List error:', error);
    return { files: [], error };
  }
}
