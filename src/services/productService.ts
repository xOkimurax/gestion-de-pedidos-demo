import { supabase } from "@/integrations/supabase/client";
import { ErrorHandler } from "@/utils/errorHandler";
import { toast } from "@/components/ui/use-toast";

// Definición de tipos
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  images: string[];
  active: boolean;
  featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category_id: string;
  active: boolean;
  featured: boolean;
}

export interface UploadProgress {
  current: number;
  total: number;
  status: 'uploading' | 'success' | 'error';
}

type ProgressCallback = (progress: UploadProgress) => void;

/**
 * Servicio para gestionar operaciones CRUD de productos
 */
export class ProductService {
  /**
   * Genera un nombre de archivo único para una imagen
   * @param prefix Prefijo para el nombre del archivo (ej: prod_ID)
   * @param file Archivo de imagen
   * @returns Nombre único para el archivo
   */
  private static generateUniqueFileName(prefix: string, file: File): string {
    const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const fileExt = file.name.split('.').pop() || 'jpg';
    return `${prefix}_${timestamp}_${random}.${fileExt}`;
  }

  /**
   * Obtiene la URL completa para una imagen
   * @param imageName Nombre de la imagen
   */
  static getImageUrl(imageName: string): string {
    if (!imageName) return '/placeholder.svg';
    
    // Si ya es una URL completa, devuelve la misma
    if (imageName.startsWith('http')) {
      return imageName;
    }
    
    // Si ya incluye /img/, asumimos que es una ruta relativa
    if (imageName.startsWith('/img/')) {
      return imageName;
    }

    // Para imágenes que están almacenadas en Supabase Storage
    if (imageName.includes('supabase')) {
      return imageName;
    }
    
    // Formar la URL relativa para imágenes locales
    return `/img/${imageName}`;
  }

  /**
   * Procesa las rutas de imágenes de un producto
   * @param product Producto a procesar
   */
  static processProductImages(product: any): Product {
    return {
      ...product,
      // Convertir las rutas de imágenes a URLs completas
      images: (product.images || []).map((img: string) => this.getImageUrl(img))
    };
  }

  /**
   * Obtiene todos los productos
   */
  static async getProducts(): Promise<Product[]> {
    try {
      console.log("Obteniendo productos desde Supabase...");
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error al obtener productos:", error);
        throw error;
      }
      
      console.log(`Se encontraron ${data?.length || 0} productos`);
      
      // Procesar las URLs de las imágenes
      const processedProducts = (data || []).map(product => this.processProductImages(product));
      
      return processedProducts;
    } catch (error) {
      console.error('Error completo al cargar productos:', error);
      ErrorHandler.handleCrudError(error, 'cargar', 'productos');
      return [];
    }
  }
  
  /**
   * Obtiene un producto por su ID
   * @param id ID del producto a buscar
   */
  static async getProductById(id: string): Promise<Product | null> {
    try {
      console.log(`Obteniendo producto con ID: ${id}`);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error("Error al obtener producto por ID:", error);
        throw error;
      }
      
      if (!data) {
        console.log(`No se encontró producto con ID: ${id}`);
        return null;
      }
      
      console.log("Producto encontrado:", data);
      console.log("Imágenes del producto:", data.images);
      
      // Procesar las URLs de las imágenes
      return this.processProductImages(data);
    } catch (error) {
      console.error('Error completo al obtener producto:', error);
      ErrorHandler.handleCrudError(error, 'obtener', 'producto');
      return null;
    }
  }
  
  /**
   * Crea un nuevo producto
   * @param productData Datos del producto
   * @param imageFiles Archivos de imagen para el producto
   * @param onProgress Callback para reportar progreso
   */
  static async createProduct(
    productData: ProductFormData, 
    imageFiles: File[],
    onProgress?: ProgressCallback
  ): Promise<Product | null> {
    try {
      const uploadedImageNames: string[] = [];
      const uploadErrors: string[] = [];
      const total = imageFiles.length;
      let current = 0;

      // Si hay imágenes para subir
      if (imageFiles.length > 0) {
        onProgress?.({ current, total, status: 'uploading' });

        // Subir imágenes una por una para garantizar nombres únicos
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          try {
            // Generar nombre único para la imagen
            const imageName = this.generateUniqueFileName('prod', file);
            
            console.log(`Intentando subir imagen con nombre: ${imageName}`);

            const { data, error } = await supabase.storage
              .from('imgs')
              .upload(imageName, file, {
                cacheControl: '3600',
                upsert: false
              });

            if (error) {
              console.error(`Error al subir imagen ${file.name}:`, error);
              uploadErrors.push(`Error al subir ${file.name}: ${error.message}`);
            } else {
              console.log(`Imagen subida exitosamente: ${imageName}`);
              uploadedImageNames.push(imageName);
            }
          } catch (error) {
            console.error(`Error inesperado al subir imagen ${file.name}:`, error);
            uploadErrors.push(`Error inesperado al subir ${file.name}`);
          } finally {
            current++;
            onProgress?.({ current, total, status: 'uploading' });
          }
        }
      }

      // Verificamos si se subió al menos una imagen cuando había imágenes para subir
      if (imageFiles.length > 0 && uploadedImageNames.length === 0) {
        throw new Error("No se pudo subir ninguna imagen");
      }

      console.log("Lista final de imágenes para guardar:", uploadedImageNames);

      // Crear el producto en la base de datos
      const { data: product, error } = await supabase
        .from('products')
        .insert([{
          name: productData.name,
          description: productData.description,
          price: productData.price,
          category_id: productData.category_id,
          active: productData.active,
          featured: productData.featured,
          images: uploadedImageNames
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      if (!product) {
        throw new Error('No se pudo crear el producto');
      }

      onProgress?.({ current: total, total, status: 'success' });

      // Mostrar mensaje apropiado según el resultado
      if (uploadErrors.length > 0) {
        toast({
          title: 'Advertencia',
          description: `El producto se creó pero ${uploadErrors.length} de ${total} imágenes no se pudieron subir. Por favor, intenta añadirlas nuevamente.`,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Producto creado',
          description: 'El producto se ha creado correctamente con todas sus imágenes'
        });
      }
      
      return this.processProductImages(product);
    } catch (error) {
      console.error('Error completo al crear producto:', error);
      ErrorHandler.handleCrudError(error, 'crear', 'producto');
      onProgress?.({ current: 0, total: imageFiles.length, status: 'error' });
      return null;
    }
  }
  
  /**
   * Actualiza un producto existente
   * @param id ID del producto a actualizar
   * @param productData Datos actualizados del producto
   * @param newImageFiles Nuevos archivos de imagen a agregar
   * @param existingImages Imágenes existentes que se mantienen
   * @param imagesToDelete Imágenes a eliminar
   * @param onProgress Callback para reportar progreso
   */
  static async updateProduct(
    id: string,
    productData: ProductFormData,
    newImageFiles: File[] = [],
    existingImages: string[] = [],
    imagesToDelete: string[] = [],
    onProgress?: ProgressCallback
  ): Promise<Product | null> {
    try {
      const deleteErrors: string[] = [];
      const uploadErrors: string[] = [];
      let current = 0;
      const total = imagesToDelete.length + newImageFiles.length;

      onProgress?.({ current, total, status: 'uploading' });

      // 1. Eliminar imágenes
      if (imagesToDelete.length > 0) {
        const deletePromises = imagesToDelete.map(async (imagePath) => {
          try {
            const fileName = imagePath.includes('/') 
              ? imagePath.substring(imagePath.lastIndexOf('/') + 1) 
              : imagePath;
            
            console.log(`Intentando eliminar imagen: ${fileName}`);
            
            const { error } = await supabase.storage
              .from('imgs')
              .remove([fileName]);
              
            if (error) {
              console.error(`Error al eliminar imagen ${fileName}:`, error);
              deleteErrors.push(`Error al eliminar imagen: ${error.message}`);
              return false;
            }
            
            console.log(`Imagen eliminada exitosamente: ${fileName}`);
            return true;
          } catch (error) {
            console.error(`Error inesperado al eliminar imagen ${imagePath}:`, error);
            deleteErrors.push(`Error inesperado al eliminar imagen: ${error}`);
            return false;
          } finally {
            current++;
            onProgress?.({ current, total, status: 'uploading' });
          }
        });
        
        await Promise.all(deletePromises);
      }
      
      // 2. Normalizar nombres de imágenes existentes
      let allImageNames = [...existingImages.map(img => {
        return img.includes('/') ? img.substring(img.lastIndexOf('/') + 1) : img;
      })];
      
      console.log("Imágenes existentes normalizadas:", allImageNames);
      
      // 3. Subir nuevas imágenes - MEJORADO para garantizar nombres únicos
      if (newImageFiles.length > 0) {
        // Subir imágenes una por una para garantizar único timestamp
        for (let i = 0; i < newImageFiles.length; i++) {
          const file = newImageFiles[i];
          try {
            // Generar nombre único para la imagen
            const imageName = this.generateUniqueFileName(`prod_${id}`, file);
            
            console.log(`Intentando subir imagen con nombre: ${imageName}`);

            const { data, error } = await supabase.storage
              .from('imgs')
              .upload(imageName, file, {
                cacheControl: '3600',
                upsert: false
              });

            if (error) {
              console.error(`Error al subir imagen ${file.name}:`, error);
              uploadErrors.push(`Error al subir ${file.name}: ${error.message}`);
            } else {
              console.log(`Imagen subida exitosamente: ${imageName}`);
              allImageNames.push(imageName);
            }
          } catch (error) {
            console.error(`Error inesperado al subir imagen ${file.name}:`, error);
            uploadErrors.push(`Error inesperado al subir ${file.name}`);
          } finally {
            current++;
            onProgress?.({ current, total, status: 'uploading' });
          }
        }
      }
      
      // Verifica si todas las cargas fallaron cuando había imágenes nuevas
      if (newImageFiles.length > 0 && uploadErrors.length === newImageFiles.length) {
        console.error("Todas las imágenes nuevas fallaron al subirse");
      }
      
      console.log("Lista final de imágenes para guardar:", allImageNames);
      
      // 4. Actualizar el producto en la base de datos
      const { data: updatedProduct, error } = await supabase
        .from('products')
        .update({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          category_id: productData.category_id,
          active: productData.active,
          featured: productData.featured,
          images: allImageNames,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;

      onProgress?.({ current: total, total, status: 'success' });

      // Mostrar mensaje apropiado según el resultado
      if (deleteErrors.length > 0 || uploadErrors.length > 0) {
        console.error('Errores durante la actualización:', { deleteErrors, uploadErrors });
        const totalErrores = deleteErrors.length + uploadErrors.length;
        toast({
          title: 'Actualización parcial',
          description: `El producto se actualizó pero hubo problemas con ${totalErrores} imágenes. Por favor, verifica las imágenes.`,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Producto actualizado',
          description: 'El producto se ha actualizado correctamente'
        });
      }
      
      return this.processProductImages(updatedProduct);
    } catch (error) {
      console.error('Error completo al actualizar producto:', error);
      ErrorHandler.handleCrudError(error, 'actualizar', 'producto');
      onProgress?.({ current: 0, total: newImageFiles.length + imagesToDelete.length, status: 'error' });
      return null;
    }
  }
  
  /**
   * Elimina un producto
   * @param id ID del producto a eliminar
   */
  static async deleteProduct(id: string): Promise<boolean> {
    try {
      // 1. Primero obtener el producto para conseguir las imágenes
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('images')
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // 2. Eliminar las imágenes asociadas
      if (product && product.images && product.images.length > 0) {
        const fileNames = product.images.map(img => 
          img.includes('/') ? img.substring(img.lastIndexOf('/') + 1) : img
        );
        
        console.log("Eliminando imágenes:", fileNames);
        
        // Usar Promise.allSettled para eliminar todas las imágenes de manera confiable
        const deletePromises = fileNames.map(async (fileName) => {
          try {
            const { error: deleteError } = await supabase.storage
              .from('imgs')
              .remove([fileName]);
              
            if (deleteError) {
              console.error(`Error al eliminar imagen ${fileName}:`, deleteError);
              return false;
            }
            return true;
          } catch (error) {
            console.error(`Error inesperado al eliminar imagen ${fileName}:`, error);
            return false;
          }
        });
        
        await Promise.allSettled(deletePromises);
      }
      
      // 3. Eliminar el producto de la base de datos
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: 'Producto eliminado',
        description: 'El producto se ha eliminado correctamente'
      });
      
      return true;
    } catch (error) {
      console.error('Error completo al eliminar producto:', error);
      ErrorHandler.handleCrudError(error, 'eliminar', 'producto');
      return false;
    }
  }
  
  /**
   * Cambia el estado activo/inactivo de un producto
   * @param id ID del producto
   */
  static async toggleProductStatus(id: string): Promise<boolean> {
    try {
      // 1. Obtener el estado actual del producto
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('active')
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      
      if (!product) {
        throw new Error('Producto no encontrado');
      }
      
      // 2. Invertir el estado y actualizar
      const { error } = await supabase
        .from('products')
        .update({ 
          active: !product.active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: 'Estado actualizado',
        description: `El producto ahora está ${!product.active ? 'activo' : 'inactivo'}`
      });
      
      return true;
    } catch (error) {
      console.error('Error completo al cambiar estado de producto:', error);
      ErrorHandler.handleCrudError(error, 'cambiar estado de', 'producto');
      return false;
    }
  }
}