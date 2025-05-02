import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import environment from '@/config/environment';
import { logError } from '@/utils/errorLogger';

// Obtener las variables de entorno desde la configuración centralizada
const SUPABASE_URL = environment.SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = environment.SUPABASE_ANON_KEY;

// Crear el cliente Supabase
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

/**
 * Sube una imagen al almacenamiento de Supabase
 * @param file Archivo a subir
 * @param productId ID del producto asociado
 * @returns Nombre del archivo subido o null si hay error
 */
export const uploadImage = async (file: File, productId: string): Promise<string | null> => {
  try {
    // Crear un nombre único para el archivo
    const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace("T", "").split(".")[0];
    const extension = file.name.split(".").pop() || "jpg";
    const fileName = `${productId}_${timestamp}.${extension}`;
    
    // Subir el archivo al bucket 'imgs'
    const { data, error } = await supabase.storage
      .from('imgs')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) {
      throw error;
    }
    
    return fileName;
  } catch (error) {
    logError(error, 'uploadImage');
    return null;
  }
};

// Alias para mantener compatibilidad con código existente
export const uploadProductImage = uploadImage;

/**
 * Obtiene la URL pública de una imagen
 * @param imageName Nombre de la imagen
 * @returns URL pública de la imagen
 */
export const getImageUrl = (imageName: string): string => {
  if (!imageName) return '/placeholder.svg';
  
  // Si ya es una URL completa, devuélvela
  if (imageName.startsWith('http')) {
    return imageName;
  }

  // Si la imagen está en Supabase Storage, construir la URL pública
  const { data } = supabase.storage
    .from('imgs')
    .getPublicUrl(imageName);

  return data.publicUrl;
};

/**
 * Elimina una imagen del almacenamiento
 * @param imageName Nombre de la imagen a eliminar
 * @returns true si se eliminó correctamente, false en caso contrario
 */
export const deleteImage = async (imageName: string): Promise<boolean> => {
  try {
    if (!imageName) return false;
    
    // Si la imagen es una URL completa, extraer solo el nombre del archivo
    const fileName = imageName.includes('/') 
      ? imageName.substring(imageName.lastIndexOf('/') + 1)
      : imageName;
    
    const { error } = await supabase.storage
      .from('imgs')
      .remove([fileName]);
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    logError(error, 'deleteImage');
    return false;
  }
};

// Alias para mantener compatibilidad con código existente
export const deleteProductImage = deleteImage;