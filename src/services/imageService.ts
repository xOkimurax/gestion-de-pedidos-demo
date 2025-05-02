import { supabase } from "@/integrations/supabase/client";
import { ErrorHandler } from "@/utils/errorHandler";

/**
 * Servicio para gestionar operaciones relacionadas con imágenes
 */
export class ImageService {
  // Carpeta donde se almacenarán las imágenes en public
  private static readonly PUBLIC_IMG_FOLDER = '/img/';
  
  /**
   * Genera un nombre único para una imagen
   * @param productId ID del producto asociado
   * @param file Archivo de imagen 
   */
  static generateImageName(productId: string, file: File): string {
    const timestamp = new Date().toISOString().replace(/[-:.]/g, "").substring(0, 14);
    const fileExt = file.name.split('.').pop() || 'jpg';
    return `${productId}_${timestamp}.${fileExt}`;
  }
  
  /**
   * Obtiene la URL completa de una imagen
   * @param imageName Nombre de la imagen almacenada
   */
  static getImageUrl(imageName: string): string {
    if (!imageName) return '/placeholder.svg';
    
    // Verificar si la imagen ya tiene URL completa
    if (imageName.startsWith('http') || imageName.startsWith('data:')) {
      return imageName;
    }
    
    // Verificar si la imagen ya tiene la ruta del folder
    if (imageName.startsWith(this.PUBLIC_IMG_FOLDER)) {
      return imageName;
    }
    
    // Formar la URL completa
    return `${this.PUBLIC_IMG_FOLDER}${imageName}`;
  }
  
  /**
   * Guarda la imagen en la carpeta pública y devuelve el nombre generado
   * @param file Archivo de imagen a guardar
   * @param productId ID del producto asociado
   */
  static async saveImage(file: File, productId: string): Promise<string> {
    try {
      // Generar nombre de archivo único
      const imageName = this.generateImageName(productId, file);
      
      // En un entorno real, aquí subirías la imagen a un servidor
      // Para este ejemplo, vamos a simular que guardamos en public/img/
      
      // Crear un FormData para enviar el archivo
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', imageName);
      
      // En un contexto real, harías algo como:
      // await fetch('/api/upload', { method: 'POST', body: formData });
      
      // Para Supabase Storage:
      const { data, error } = await supabase.storage
        .from('imgs')
        .upload(imageName, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) throw error;
      
      // Devolver el nombre de la imagen guardada
      return imageName;
    } catch (error) {
      ErrorHandler.handleUploadError(error, 'imagen');
      throw error;
    }
  }
  
  /**
   * Elimina una imagen
   * @param imageName Nombre de la imagen a eliminar
   */
  static async deleteImage(imageName: string): Promise<boolean> {
    if (!imageName) return false;
    
    try {
      // Obtener solo el nombre de archivo sin la ruta completa
      const fileName = imageName.includes('/') 
        ? imageName.substring(imageName.lastIndexOf('/') + 1) 
        : imageName;
      
      // En Supabase Storage:
      const { error } = await supabase.storage
        .from('imgs')
        .remove([fileName]);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      return false;
    }
  }
  
  /**
   * Procesa múltiples archivos de imagen y devuelve sus nombres
   * @param files Lista de archivos a procesar
   * @param productId ID del producto asociado
   */
  static async processImageFiles(files: File[], productId: string): Promise<string[]> {
    const imageNames: string[] = [];
    
    if (!files.length) return imageNames;
    
    try {
      // Procesar cada archivo secuencialmente
      for (const file of files) {
        const imageName = await this.saveImage(file, productId);
        imageNames.push(imageName);
      }
      
      return imageNames;
    } catch (error) {
      ErrorHandler.handleUploadError(error, 'imágenes');
      throw error;
    }
  }
}