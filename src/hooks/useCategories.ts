
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export type Category = {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
};

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las categorías',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const addCategory = async (name: string) => {
    setIsAddingCategory(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name }])
        .select();

      if (error) throw error;
      
      setCategories([...categories, data[0]]);
      
      toast({
        title: 'Éxito',
        description: 'Categoría creada correctamente',
      });
      
      return data[0];
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la categoría',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsAddingCategory(false);
    }
  };

  const updateCategory = async (id: string, name: string) => {
    setIsUpdatingCategory(true);
    try {
      const { error } = await supabase
        .from('categories')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      setCategories(categories.map(cat => 
        cat.id === id ? { ...cat, name } : cat
      ));
      
      toast({
        title: 'Éxito',
        description: 'Categoría actualizada correctamente',
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la categoría',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsUpdatingCategory(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setIsDeletingCategory(true);
    try {
      // Check if there are products using this category
      const { data: products, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', id);
        
      if (checkError) throw checkError;
      
      if (products && products.length > 0) {
        toast({
          title: 'No se puede eliminar',
          description: 'Esta categoría tiene productos asociados',
          variant: 'destructive',
        });
        return false;
      }
      
      // Delete the category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setCategories(categories.filter(cat => cat.id !== id));
      
      toast({
        title: 'Éxito',
        description: 'Categoría eliminada correctamente',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la categoría',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsDeletingCategory(false);
    }
  };

  return {
    categories,
    isLoadingCategories,
    isAddingCategory,
    isUpdatingCategory,
    isDeletingCategory,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshCategories: fetchCategories
  };
};
