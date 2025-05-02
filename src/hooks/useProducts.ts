
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase, uploadProductImage, deleteProductImage } from '@/integrations/supabase/client';

export type Product = {
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
};

export type ProductFormData = {
  name: string;
  description: string;
  price: number;
  category: string;
  images: FileList | null;
  active: boolean;
  featured: boolean;
};

type AddProductParams = {
  formData: Omit<ProductFormData, 'images'> & { images: string[] };
  newImages: File[];
};

type UpdateProductParams = {
  id: string;
  formData: Omit<ProductFormData, 'images'> & { images: string[] };
  newImages: File[];
  imagesToDelete: string[];
};

type CallbackOptions = {
  onSuccess?: () => void;
  onError?: (error: any) => void;
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los productos',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const addProduct = async (params: AddProductParams, options?: CallbackOptions) => {
    setIsAddingProduct(true);
    try {
      const { formData, newImages } = params;
      
      // First, create the product in the database
      const { data: product, error } = await supabase
        .from('products')
        .insert([{
          name: formData.name,
          description: formData.description,
          price: formData.price,
          category_id: formData.category,
          active: formData.active,
          featured: formData.featured,
          images: []
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Then upload images if there are any
      const uploadedImageNames: string[] = [];
      
      if (newImages.length > 0 && product) {
        for (const file of newImages) {
          const fileName = await uploadProductImage(file, product.id);
          uploadedImageNames.push(fileName);
        }
        
        // Update the product with the image paths
        const { error: updateError } = await supabase
          .from('products')
          .update({ images: uploadedImageNames })
          .eq('id', product.id);
          
        if (updateError) throw updateError;
      }
      
      // Refresh the products list
      fetchProducts();
      
      toast({
        title: 'Éxito',
        description: 'Producto creado correctamente',
      });
      
      if (options?.onSuccess) options.onSuccess();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el producto',
        variant: 'destructive',
      });
      if (options?.onError) options.onError(error);
    } finally {
      setIsAddingProduct(false);
    }
  };

  const updateProduct = async (params: UpdateProductParams, options?: CallbackOptions) => {
    setIsUpdatingProduct(true);
    try {
      const { id, formData, newImages, imagesToDelete } = params;
      
      // First, delete any images that need to be removed
      for (const imagePath of imagesToDelete) {
        await deleteProductImage(imagePath);
      }
      
      // Upload new images
      const existingImages = formData.images || [];
      const uploadedImageNames: string[] = [];
      
      if (newImages.length > 0) {
        for (const file of newImages) {
          const fileName = await uploadProductImage(file, id);
          uploadedImageNames.push(fileName);
        }
      }
      
      // Combine existing and new image paths
      const allImages = [...existingImages, ...uploadedImageNames];
      
      // Update the product in the database
      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          category_id: formData.category,
          active: formData.active,
          featured: formData.featured,
          images: allImages,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      // Refresh the products list
      fetchProducts();
      
      toast({
        title: 'Éxito',
        description: 'Producto actualizado correctamente',
      });
      
      if (options?.onSuccess) options.onSuccess();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el producto',
        variant: 'destructive',
      });
      if (options?.onError) options.onError(error);
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  const deleteProduct = async (id: string, options?: CallbackOptions) => {
    setIsDeleting(true);
    try {
      // First get the product to get its images
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('images')
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Delete all associated images from storage
      if (product && product.images && product.images.length > 0) {
        for (const imagePath of product.images) {
          await deleteProductImage(imagePath);
        }
      }
      
      // Delete the product from the database
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update the local state
      setProducts(products.filter(p => p.id !== id));
      
      toast({
        title: 'Éxito',
        description: 'Producto eliminado correctamente',
      });
      
      if (options?.onSuccess) options.onSuccess();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el producto',
        variant: 'destructive',
      });
      if (options?.onError) options.onError(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleProductStatus = async (id: string, options?: CallbackOptions) => {
    setIsTogglingStatus(true);
    try {
      // Find the product to toggle
      const product = products.find(p => p.id === id);
      if (!product) throw new Error('Product not found');
      
      // Update the product status
      const { error } = await supabase
        .from('products')
        .update({ active: !product.active })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update the local state
      setProducts(products.map(p => 
        p.id === id ? { ...p, active: !p.active } : p
      ));
      
      toast({
        title: 'Éxito',
        description: `Producto ${product.active ? 'desactivado' : 'activado'} correctamente`,
      });
      
      if (options?.onSuccess) options.onSuccess();
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cambiar el estado del producto',
        variant: 'destructive',
      });
      if (options?.onError) options.onError(error);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  return {
    products,
    isLoadingProducts,
    isAddingProduct,
    isUpdatingProduct,
    isDeleting,
    isTogglingStatus,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    refreshProducts: fetchProducts
  };
};
